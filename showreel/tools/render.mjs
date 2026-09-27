#!/usr/bin/env node
/*
 * Offline render: every frame through headless Chromium, with motion blur,
 * encoded to H.264 + AAC.
 *
 *   node tools/render.mjs [--out showreel.mp4] [--mb 8] [--shutter 0.5] [--scale 1]
 *                         [--workers 3] [--from 0 --to 15] [--audio audio/showreel.wav]
 *                         [--crf 18] [--tune film] [--keep-frames]
 *
 * --mb N      sub-frames averaged per output frame (1 = off)
 * --shutter   fraction of the frame interval the shutter stays open (0.5 = 180°)
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { ROOT, args, openReel, dataUrlToBuffer, findFfmpeg } from './lib.mjs';

const a = args();
const scale = +(a.scale || 1);
const mb = +(a.mb || 8);
const shutter = +(a.shutter || 0.5);
const workers = +(a.workers || Math.max(1, Math.min(4, os.cpus().length - 1)));
const out = path.resolve(ROOT, a.out || 'showreel.mp4');
const audio = a.audio === 'none' ? null : path.resolve(ROOT, a.audio || 'audio/showreel.wav');
const crf = String(a.crf || 18);
const tune = a.tune || 'film';
const framesDir = path.join(ROOT, '.frames');

const reel = await openReel({ scale, pages: workers });
const { FPS, FRAMES } = reel.info;
const f0 = Math.round(+(a.from ?? 0) * FPS), f1 = Math.min(FRAMES, Math.round(+(a.to ?? 15) * FPS));
fs.rmSync(framesDir, { recursive: true, force: true });
fs.mkdirSync(framesDir, { recursive: true });

console.log(`rendering frames ${f0}–${f1 - 1} at ${Math.round(1920 * scale)}×${Math.round(1080 * scale)}, mb=${mb}, shutter=${shutter}, workers=${workers}`);
const t0 = Date.now();
let done = 0;
await Promise.all(reel.pages.map(async (page, w) => {
  for (let f = f0 + w; f < f1; f += workers) {
    const url = await page.evaluate(([f, mb, shutter]) => window.__reel.frame(f, { mb, shutter }), [f, mb, shutter]);
    fs.writeFileSync(path.join(framesDir, `f${String(f).padStart(4, '0')}.png`), dataUrlToBuffer(url));
    done++;
    if (done % 30 === 0 || done === f1 - f0) {
      const el = (Date.now() - t0) / 1000;
      process.stdout.write(`\r  ${done}/${f1 - f0} frames  ${el.toFixed(0)}s elapsed  ~${((el / done) * (f1 - f0 - done)).toFixed(0)}s left   `);
    }
  }
}));
process.stdout.write('\n');
const errs = await reel.drainErrors();
await reel.close();
if (errs.length) {
  console.log(`${errs.length} page error(s):`);
  for (const e of errs.slice(0, 20)) console.log('  ' + e.split('\n')[0]);
}

const ffArgs = ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-start_number', String(f0), '-i', path.join(framesDir, 'f%04d.png')];
if (audio && fs.existsSync(audio)) ffArgs.push('-ss', String(f0 / FPS), '-t', String((f1 - f0) / FPS), '-i', audio);
ffArgs.push(
  '-vf', 'scale=in_range=pc:out_range=tv:out_color_matrix=bt709:flags=accurate_rnd+full_chroma_int,format=yuv420p',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', crf, '-tune', tune, '-profile:v', 'high', '-g', '60', '-bf', '2',
  '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
);
if (audio && fs.existsSync(audio)) ffArgs.push('-c:a', 'aac', '-b:a', '320k', '-ar', '48000');
ffArgs.push('-movflags', '+faststart', '-shortest', out);
console.log('encoding…');
await new Promise((resolve, reject) => {
  const ff = spawn(findFfmpeg(), ffArgs, { stdio: 'inherit' });
  ff.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}`))));
});
if (!a['keep-frames']) fs.rmSync(framesDir, { recursive: true, force: true });
console.log(`wrote ${out}  (${(fs.statSync(out).size / 1e6).toFixed(1)} MB) in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
