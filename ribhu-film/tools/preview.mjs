#!/usr/bin/env node
/*
 * Quick looks at the reel without a full render.
 *
 *   node tools/preview.mjs sheet  --from 2 --to 4 [--count 16] [--cols 4] [--scale 0.5] [--out file.png]
 *   (times are absolute seconds; the film is 30 s at 30 fps)
 *   node tools/preview.mjs strip  --from 1.9 --to 2.1 [--cols 6]          every frame in range, as a sheet
 *   node tools/preview.mjs frames --times 2,2.25,3.1 [--scale 1] [--mb 8] [--outdir dir]
 *   node tools/preview.mjs bench  --from 6 --to 8 [--count 24] [--scale 1]
 *   node tools/preview.mjs clip   --from 6 --to 8 [--scale 0.5] [--out clip.mp4]   low-res video for humans
 *   node tools/preview.mjs purity --from 6 --to 8 [--count 12]   checks draw() is a pure function of time
 *
 * Options: --page lab/x.html renders a lab page instead of the film (same runtime),
 * --hud 0 hides the HUD, --grain 0 disables grain, --post 0 disables
 * grain + vignette (use it for exact colour checks on contract frames).
 * Page errors (exceptions inside scenes) are printed at the end — check them.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { ROOT, args, openReel, dataUrlToBuffer, findFfmpeg } from './lib.mjs';

const a = args();
const cmd = a._[0] || 'sheet';
const scale = +(a.scale || (cmd === 'frames' || cmd === 'bench' ? 1 : 0.5));
const hud = a.hud !== '0';
const grain = a.grain != null ? +a.grain : undefined;
const post = a.post !== '0';
const stamp = `${Date.now().toString(36)}-${process.pid}`;
const outDir = path.join(ROOT, '.preview');
fs.mkdirSync(outDir, { recursive: true });

const range = (from, to, count) => {
  if (count <= 1) return [from];
  return Array.from({ length: count }, (_, i) => +(from + ((to - from) * i) / (count - 1)).toFixed(4));
};

const reel = await openReel({ scale, hud, grain, post, page: a.page || 'index.html' });
const page = reel.pages[0];
const { FPS, DURATION } = reel.info;
const END = DURATION - 1 / FPS;
try {
  if (cmd === 'sheet' || cmd === 'strip') {
    const from = +(a.from ?? 0), to = +(a.to ?? DURATION);
    let times;
    if (cmd === 'strip') {
      const f0 = Math.round(from * FPS), f1 = Math.round(to * FPS);
      times = []; for (let f = f0; f <= f1; f++) times.push(f / FPS);
    } else times = range(from, Math.min(to, END), +(a.count || 16));
    const cols = +(a.cols || (cmd === 'strip' ? 6 : 4));
    const cellW = +(a.cellw || (cmd === 'strip' ? 320 : 480));
    const url = await page.evaluate(([t, c, w]) => window.__reel.sheet(t, { cols: c, cellW: w }), [times, cols, cellW]);
    const out = a.out || path.join(outDir, `${cmd}-${from}-${to}-${stamp}.png`);
    fs.writeFileSync(out, dataUrlToBuffer(url));
    console.log(`wrote ${out}  (${times.length} frames)`);
  } else if (cmd === 'frames') {
    const times = String(a.times || '0').split(',').map(Number);
    const mb = +(a.mb || 1), outdir = a.outdir || outDir;
    fs.mkdirSync(outdir, { recursive: true });
    for (const T of times) {
      const f = Math.round(T * FPS);
      const url = mb > 1
        ? await page.evaluate(([f, mb]) => window.__reel.frame(f, { mb }), [f, mb])
        : await page.evaluate((T) => window.__reel.at(T), T);
      const out = path.join(outdir, `frame-${T.toFixed(3)}-${stamp}.png`);
      fs.writeFileSync(out, dataUrlToBuffer(url));
      console.log(`wrote ${out}`);
    }
  } else if (cmd === 'bench') {
    const from = +(a.from ?? 0), to = +(a.to ?? DURATION);
    const times = range(from, Math.min(to, END), +(a.count || 24));
    await page.evaluate((t) => window.__reel.bench(t.slice(0, 2)), times); // warm up
    const res = await page.evaluate((t) => window.__reel.bench(t), times);
    const ms = res.map((r) => r.ms);
    const avg = ms.reduce((s, x) => s + x, 0) / ms.length;
    for (const r of res) console.log(`${r.T.toFixed(3)}s  ${r.ms} ms`);
    console.log(`avg ${avg.toFixed(1)} ms, max ${Math.max(...ms).toFixed(1)} ms at scale ${scale}`);
  } else if (cmd === 'purity') {
    // Render each time forward, then again in reverse/shuffled order: hashes must match.
    const from = +(a.from ?? 0), to = +(a.to ?? DURATION);
    const times = range(from, Math.min(to, END), +(a.count || 12)).map((t) => Math.round(t * FPS) / FPS);
    const first = [];
    for (const T of times) first.push(await page.evaluate((T) => window.__reel.hashAt(T), T));
    const order = times.map((_, i) => i).reverse();
    for (let k = 0; k < order.length; k += 2) if (k + 1 < order.length) [order[k], order[k + 1]] = [order[k + 1], order[k]];
    let bad = 0;
    for (const i of order) {
      const h = await page.evaluate((T) => window.__reel.hashAt(T), times[i]);
      if (h !== first[i]) { bad++; console.log(`IMPURE at ${times[i].toFixed(4)}s: ${first[i]} vs ${h}`); }
    }
    console.log(bad ? `${bad}/${times.length} times differ — draw() depends on call order/state` : `pure: ${times.length} times re-rendered identically`);
    if (bad) process.exitCode = 1;
  } else if (cmd === 'clip') {
    const from = +(a.from ?? 0), to = +(a.to ?? DURATION);
    const out = a.out || path.join(outDir, `clip-${from}-${to}-${stamp}.mp4`);
    const ff = spawn(findFfmpeg(), ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let f = Math.round(from * FPS); f < Math.round(to * FPS); f++) {
      const url = await page.evaluate((f) => window.__reel.frame(f), f);
      if (!ff.stdin.write(dataUrlToBuffer(url))) await new Promise((r) => ff.stdin.once('drain', r));
    }
    ff.stdin.end();
    await new Promise((r) => ff.on('close', r));
    console.log(`wrote ${out}`);
  } else {
    console.error(`unknown command ${cmd}`);
    process.exitCode = 2;
  }
  const errs = await reel.drainErrors();
  if (errs.length) {
    console.log(`\n${errs.length} page error(s):`);
    for (const e of errs.slice(0, 30)) console.log('  ' + e.split('\n').slice(0, 4).join('\n    '));
    process.exitCode = 1;
  }
} finally {
  await reel.close();
}
