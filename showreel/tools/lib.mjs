// Shared plumbing for preview.mjs and render.mjs: static server, browser page, ffmpeg lookup.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.wav': 'audio/wav', '.png': 'image/png', '.json': 'application/json' };

export function serve(root = ROOT) {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      const rel = decodeURIComponent(req.url.split('?')[0]);
      const file = path.join(root, rel === '/' ? 'index.html' : rel);
      if (!file.startsWith(root)) { res.writeHead(403); res.end(); return; }
      fs.readFile(file, (err, data) => {
        if (err) { res.writeHead(404); res.end(); return; }
        res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
        res.end(data);
      });
    }).listen(0, '127.0.0.1', () => resolve({ srv, port: srv.address().port }));
  });
}

export function args(argv = process.argv.slice(2)) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const k = a.slice(2), v = argv[i + 1];
      if (v === undefined || v.startsWith('--')) out[k] = true; else { out[k] = v; i++; }
    } else out._.push(a);
  }
  return out;
}

/** Opens the reel in render mode. Returns { browser, pages, info, close, drainErrors }. */
export async function openReel({ scale = 1, pages: nPages = 1, hud = true, grain, post = true } = {}) {
  const { srv, port } = await serve();
  const browser = await chromium.launch({ args: ['--disable-gpu-vsync', '--disable-frame-rate-limit'] });
  const errors = [];
  const qs = new URLSearchParams({ render: '1', scale: String(scale) });
  if (!hud) qs.set('hud', '0');
  if (grain != null) qs.set('grain', String(grain));
  if (!post) qs.set('post', '0');
  const pages = [];
  for (let i = 0; i < nPages; i++) {
    const page = await browser.newPage({ viewport: { width: Math.ceil(1920 * scale), height: Math.ceil(1080 * scale) } });
    page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
    page.on('console', (m) => { if ((m.type() === 'error' || m.type() === 'warning') && !/Failed to load resource/.test(m.text())) errors.push(`console.${m.type()}: ${m.text()}`); });
    page.on('response', (r) => { if (r.status() >= 400) errors.push(`HTTP ${r.status()}: ${r.url()}`); });
    await page.goto(`http://127.0.0.1:${port}/index.html?${qs}`);
    await page.waitForFunction(() => window.__reel, null, { timeout: 30000 });
    await page.evaluate(() => window.__reel.ready);
    pages.push(page);
  }
  const info = await pages[0].evaluate(() => window.__reel.info());
  const drainErrors = async () => {
    for (const p of pages) errors.push(...(await p.evaluate(() => window.__reel.errors())));
    const out = [...new Set(errors.splice(0))];
    return out;
  };
  const close = async () => { await browser.close(); srv.close(); };
  return { browser, pages, info, close, drainErrors };
}

export function dataUrlToBuffer(url) {
  return Buffer.from(url.slice(url.indexOf(',') + 1), 'base64');
}

export function findFfmpeg() {
  const candidates = [process.env.FFMPEG, 'ffmpeg'];
  try { candidates.push(execFileSync('python3', ['-c', 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())']).toString().trim()); } catch {}
  for (const c of candidates) {
    if (!c) continue;
    try { execFileSync(c, ['-hide_banner', '-version'], { stdio: 'ignore' }); return c; } catch {}
  }
  throw new Error('ffmpeg with libx264 not found. Set FFMPEG=/path/to/ffmpeg or `pip install imageio-ffmpeg`.');
}
