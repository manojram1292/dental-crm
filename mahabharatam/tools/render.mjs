#!/usr/bin/env node
/*
 * Offline render: timeline → score → mix → every frame through headless
 * Chromium with motion blur → H.264 + AAC.
 *
 *   node tools/render.mjs [--ep 1] [--lang en] [--out episodeNN.mp4] [--mb 8] [--shutter 0.5]
 *                         [--scale 1] [--workers 3] [--from 0 --to 30] [--crf 18]
 *                         [--no-score] [--keep-frames] [--no-gate]
 *
 * Audio: tools/score.py writes audio/epNN/music.wav for build/timeline.epNN.<lang>.json
 * (re-run only when the timeline changed), then tools/mix.py mixes whatever
 * stems exist (music + voice/epNN/<lang>/*.wav placed at their lines) into
 * audio/epNN/mix.<lang>.wav, which is muxed in.
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn, execFileSync } from 'node:child_process';
import { ROOT, args, openReel, dataUrlToBuffer, findFfmpeg } from './lib.mjs';
import { buildTimeline, epTag } from './timeline.mjs';
import { gate } from './gate.mjs';

const a = args();
const lang = a.lang || 'en';
const ep = +(a.ep || 1), tag = epTag(ep), num = tag.slice(2);
const scale = +(a.scale || 1);
const mb = +(a.mb || 8);
const shutter = +(a.shutter || 0.5);
const workers = +(a.workers || Math.max(1, Math.min(4, os.cpus().length - 1)));
const out = path.resolve(ROOT, a.out || (lang === 'en' ? `episode${num}.mp4` : `episode${num}.${lang}.mp4`));
const crf = String(a.crf || 18);
const framesDir = path.join(ROOT, `.frames-${tag}-${lang}`);
const py = process.env.PYTHON || 'python3';

// 1. Timeline, 2. score (cached by timeline signature + score source), 3. mix.
const tl = buildTimeline(lang, { ep });
const videoOnly = !!a['video-only'];   // a patch segment for a splice (tools/episode_loop.md, step 7): frames only; no score, no mix, no gate, no audio in the file
if (videoOnly) console.log('video only: no score, mix, gate or audio (a segment to splice into an existing master)');
else {
if (!a['no-score']) execFileSync(py, [path.join(ROOT, 'tools/score.py'), '--ep', String(ep), '--lang', lang], { stdio: 'inherit' });
execFileSync(py, [path.join(ROOT, 'tools/mix.py'), '--ep', String(ep), '--lang', lang], { stdio: 'inherit' });
// 4. The pre-render gate (after the score and the mix, before any final frame) (tools/gate.mjs): hook ≤ 8 w / ≤ 3.0 s, story ≤ 5 s, turn 40–60 %, ≤ 59 s, Next ≤ 1.2 s, no static
// hold > 4 s (a 1/8-size pass). --no-gate only for re-renders of episodes made before the gate.
if (!a['no-gate']) {
  const g = await gate(ep, { lang, frames: true, audio: true });
  if (!g.ok) { console.error(`render refused by the gate: ${g.fails.join('; ')}`); process.exit(1); }
}
}
const audio = path.join(ROOT, 'audio', tag, `mix.${lang}.wav`);

const reel = await openReel({ scale, pages: workers, lang, ep });
const { FPS, FRAMES, DURATION } = reel.info;
if (Math.abs(DURATION - tl.duration) > 1e-6) throw new Error(`page duration ${DURATION} ≠ timeline ${tl.duration}`);
const f0 = Math.round(+(a.from ?? 0) * FPS), f1 = Math.min(FRAMES, Math.round(+(a.to ?? DURATION) * FPS));
fs.rmSync(framesDir, { recursive: true, force: true });
fs.mkdirSync(framesDir, { recursive: true });

console.log(`rendering ${tag} ${lang} frames ${f0}–${f1 - 1} at ${Math.round(1080 * scale)}×${Math.round(1920 * scale)}, mb=${mb}, shutter=${shutter}, workers=${workers}`);
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
const hasAudio = !videoOnly && fs.existsSync(audio);
if (hasAudio) ffArgs.push('-ss', String(f0 / FPS), '-t', String((f1 - f0) / FPS), '-i', audio);
ffArgs.push(
  '-vf', 'scale=in_range=pc:out_range=tv:out_color_matrix=bt709:flags=accurate_rnd+full_chroma_int,format=yuv420p',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', crf, '-tune', 'film', '-profile:v', 'high', '-g', String(FPS), '-bf', '2',
  '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
);
if (hasAudio) ffArgs.push('-c:a', 'aac', '-b:a', '256k', '-ar', '48000');
ffArgs.push('-movflags', '+faststart', '-shortest', out);
console.log('encoding…');
await new Promise((resolve, reject) => {
  const ff = spawn(findFfmpeg(), ffArgs, { stdio: 'inherit' });
  ff.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}`))));
});
if (!a['keep-frames']) fs.rmSync(framesDir, { recursive: true, force: true });
console.log(`wrote ${out}  (${(fs.statSync(out).size / 1e6).toFixed(1)} MB) in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
