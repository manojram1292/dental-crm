#!/usr/bin/env node
/*
 * PREVIEW STILLS for the viewer pass, BEFORE the render (tools/episode_loop.md, step 4): the scenes sampled straight from the canvas,
 * no motion blur, no encode. A few minutes instead of a render.
 *
 *   node tools/stills.mjs --ep 50 [--lang en] [--step 0.25] [--w 216] [--out lab/review/ep50]
 *
 * Writes into lab/review/epNN/:
 *   pre-pass-1.jpg …   the WHOLE film every 0.25 s, 12 across (each still labelled with its time and its line), 48 a sheet
 *   pre-cuts-1.jpg …   for EVERY cut: the last frame out and the first frame in, side by side
 *   pre-open.jpg       the first 2 s, every frame-pair (15 a second): what the thumb decides on
 * Look at every sheet; write the viewer pass (hook / turn / end) before going on.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { ROOT, args, openReel, dataUrlToBuffer, findFfmpeg, epTag } from './lib.mjs';

const a = args(), ep = +(a.ep || 1), lang = a.lang || 'en', tag = epTag(ep), step = +(a.step || 0.25), W = +(a.w || 216);
const out = path.resolve(ROOT, a.out || `lab/review/${tag}`); fs.mkdirSync(out, { recursive: true });
const reel = await openReel({ scale: W / 1080, lang, ep, grain: 0 });
const page = reel.pages[0], D = reel.info.DURATION;
const tl = JSON.parse(fs.readFileSync(path.join(ROOT, 'build', `timeline.${tag}.${lang}.json`), 'utf8')), L = tl.lines;
const lineAt = (t) => (L.find((l) => t >= l.start && t < l.end) || L[L.length - 1]).id;
const fr = (t) => Math.ceil(t * 30 - 1e-6) / 30;

async function sheet(items, name, cols) {
  // items: [{ t, label }] → one PNG composed in the page, converted to JPEG here
  const url = await page.evaluate(([items, cols]) => {
    const c = window.__reelCanvas, w = c.width, h = c.height, rows = Math.ceil(items.length / cols);
    const s = document.createElement('canvas'); s.width = cols * (w + 4); s.height = rows * (h + 18); const g = s.getContext('2d');
    g.fillStyle = '#181818'; g.fillRect(0, 0, s.width, s.height); g.font = '11px sans-serif'; g.textBaseline = 'top';
    items.forEach((it, k) => { window.__reel.at(it.t); const x = (k % cols) * (w + 4), y = Math.floor(k / cols) * (h + 18); g.drawImage(c, x, y + 16); g.fillStyle = '#e8e8e8'; g.fillText(it.label, x + 3, y + 3); });
    return s.toDataURL('image/png');
  }, [items, cols]);
  const png = path.join(out, name.replace(/\.jpg$/, '.png')); fs.writeFileSync(png, dataUrlToBuffer(url));
  spawnSync(findFfmpeg(), ['-y', '-loglevel', 'error', '-i', png, '-q:v', '3', path.join(out, name)]); fs.rmSync(png);
  console.log(`${path.relative(ROOT, path.join(out, name))}  ${items.length} stills`);
}

const all = []; for (let t = 0; t < D - 0.04; t += step) all.push({ t: fr(t), label: `${t.toFixed(2)} ${lineAt(t)}` });
for (let i = 0; i < all.length; i += 48) await sheet(all.slice(i, i + 48), `pre-pass-${i / 48 + 1}.jpg`, 12);
const cuts = [];
for (let i = 1; i < L.length; i++) { const c = Math.round(L[i].start * 30); cuts.push({ t: (c - 1) / 30, label: `OUT ${L[i - 1].id} f${c - 1}` }, { t: c / 30, label: `IN ${L[i].id} ${(c / 30).toFixed(2)}s` }); }
for (let i = 0; i < cuts.length; i += 24) await sheet(cuts.slice(i, i + 24), `pre-cuts-${i / 24 + 1}.jpg`, 12);
const open = []; for (let f = 0; f <= 60; f += 2) open.push({ t: f / 30, label: `${(f / 30).toFixed(2)}s` });
await sheet(open, 'pre-open.jpg', 16);
const errs = await reel.drainErrors(); await reel.close();
if (errs.length) { console.log(`${errs.length} page error(s): ${errs[0].split('\n')[0]}`); process.exitCode = 1; }
