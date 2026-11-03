#!/usr/bin/env node
/*
 * Build step: script/epNN.<lang>.json (+ voice/epNN/<lang>/<id>.wav if present)
 *             → build/timeline.epNN.<lang>.json
 *
 *   node tools/timeline.mjs [--ep 1] [--lang en]
 *
 * Per line:
 *   with a voice file   dur = lead + voiceDur + gap + (line.hold || 0)
 *                       lead = line.pre (ms) ?? timing.voiceLead, gap = line.post (ms) ?? timing.voiceGap
 *                       the voice starts at line.start + lead
 *   without             dur = line.est   (speech is estimated from timing.wordsPerSecond)
 * The last line also carries timing.tail (the end card's hold).
 *
 * Words get times inside the speech window, weighted by length plus a pause
 * after punctuation, so captions and `beats` (word indices → seconds) follow
 * any language and any voice. When tools/voice.py left a sidecar
 * voice/epNN/<lang>/<id>.json with chunk times (a line spoken in pieces, with
 * pauses between), words are placed inside their own chunk instead.
 * `ticks` ({ count, from, to, curve }: word indices) spreads `count` evenly
 * accelerating hits from word `from` to word `to` (t_k = a + (b−a)·(k/(n−1))^curve);
 * pictures and drums both read line.ticks.
 * Pictures, captions, the score (tools/score.py) and the mix (tools/mix.py)
 * all read this one file.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FPS = 30;

/** Duration (s) of a PCM/float WAV file, from its RIFF header. */
export function wavDuration(file) {
  const b = fs.readFileSync(file);
  if (b.toString('ascii', 0, 4) !== 'RIFF' || b.toString('ascii', 8, 12) !== 'WAVE') throw new Error(`${file}: not a RIFF/WAVE file`);
  let off = 12, byteRate = 0, dataLen = 0;
  while (off + 8 <= b.length) {
    const id = b.toString('ascii', off, off + 4), len = b.readUInt32LE(off + 4);
    if (id === 'fmt ') byteRate = b.readUInt32LE(off + 16);
    if (id === 'data') { dataLen = Math.min(len, b.length - off - 8); break; }
    off += 8 + len + (len & 1);
  }
  if (!byteRate || !dataLen) throw new Error(`${file}: missing fmt/data chunk`);
  return dataLen / byteRate;
}

const PAUSE = [[/…|\.\.\.$/, 7], [/[.!?।]["”’)]?$/, 6], [/[—–]$/, 4], [/[,;:]["”’)]?$/, 3]];
function wordWeight(w) {
  const core = w.replace(/[^\p{L}\p{N}]/gu, '');
  let k = Math.max(2, [...core].length) + 1.5;     // ~ syllable mass + a gap
  if (!core) k = 1;                                 // a lone dash or ellipsis
  for (const [re, add] of PAUSE) if (re.test(w)) { k += add; break; }
  return k;
}

export const epTag = (ep) => `ep${String(+ep || 1).padStart(2, '0')}`;

export function buildTimeline(lang = 'en', { quiet = false, ep = 1 } = {}) {
  const tag = epTag(ep);
  const scriptFile = path.join(ROOT, 'script', `${tag}.${lang}.json`);
  const script = JSON.parse(fs.readFileSync(scriptFile, 'utf8'));
  const tm = { wordsPerSecond: 2.6, voiceGap: 0.35, voiceLead: 0.12, tail: 1.0, ...(script.timing || {}) };
  const out = [];
  let t = 0, voiced = 0;
  const sig = crypto.createHash('sha1').update(JSON.stringify(script));
  script.lines.forEach((line, i) => {
    const words = line.text.trim().split(/\s+/);
    const wf = path.join(ROOT, 'voice', tag, lang, `${line.id}.wav`);
    let voice = null, voiceDur = 0, dur, speechStart, speechDur, chunks = null;
    if (fs.existsSync(wf)) {
      voiceDur = wavDuration(wf);
      voice = path.relative(ROOT, wf);
      voiced++;
      sig.update(`${line.id}:${voiceDur}`);
      const lead = line.pre != null ? line.pre / 1000 : tm.voiceLead;
      const gap = line.post != null ? line.post / 1000 : tm.voiceGap;
      speechStart = t + lead;
      speechDur = voiceDur;
      dur = lead + voiceDur + gap + (line.hold || 0);
      const side = wf.replace(/\.wav$/, '.json');
      if (fs.existsSync(side)) {
        const sc = JSON.parse(fs.readFileSync(side, 'utf8')).chunks || [];
        // usable only if the chunks' words add up to the caption's words
        if (sc.length > 1 && sc.reduce((n, c) => n + c.words, 0) === words.length) chunks = sc;
      }
    } else {
      dur = line.est;
      const chars = [...line.text].length;
      const natural = Math.max(words.length / tm.wordsPerSecond, chars / (tm.wordsPerSecond * 5.8));
      speechStart = t + (i === 0 ? 0.04 : 0.1);
      speechDur = Math.min(natural, dur - (speechStart - t) - 0.25 - (line.hold || 0));
    }
    // Word times: weighted by length + punctuation pauses; the final pause is not spoken.
    function place(ws, s0, sd) {
      const wts = ws.map(wordWeight);
      const lastPause = wts[wts.length - 1] - (Math.max(2, [...ws[ws.length - 1].replace(/[^\p{L}\p{N}]/gu, '')].length) + 1.5);
      const total = wts.reduce((a, b) => a + b, 0) - Math.max(0, lastPause);
      let acc = 0;
      return ws.map((w, k) => {
        const t0 = s0 + (acc / total) * sd;
        const core = Math.max(2, [...w.replace(/[^\p{L}\p{N}]/gu, '')].length) + 1.5;
        const t1 = s0 + (Math.min(total, acc + (w.replace(/[^\p{L}\p{N}]/gu, '') ? core : wts[k])) / total) * sd;
        acc += wts[k];
        return { w, t0: +t0.toFixed(4), t1: +t1.toFixed(4) };
      });
    }
    let wt;
    if (chunks) {
      wt = [];
      let k = 0;
      for (const c of chunks) {
        wt.push(...place(words.slice(k, k + c.words), speechStart + c.t0, c.t1 - c.t0));
        k += c.words;
      }
    } else wt = place(words, speechStart, speechDur);
    const beats = (line.beats || []).map((k) => wt[Math.min(k, wt.length - 1)].t0);
    let ticks = [];
    if (line.ticks) {
      const { count = 1, from = 0, to = words.length - 1, curve = 1 } = line.ticks;
      const a = wt[Math.min(from, wt.length - 1)].t0, b = wt[Math.min(to, wt.length - 1)].t0;
      ticks = Array.from({ length: count }, (_, k) => +(a + (b - a) * Math.pow(count > 1 ? k / (count - 1) : 1, curve)).toFixed(4));
    }
    out.push({
      id: line.id, start: +t.toFixed(4), end: +(t + dur).toFixed(4),
      speechStart: +speechStart.toFixed(4), speechEnd: +(speechStart + speechDur).toFixed(4),
      voice, voiceDur: +voiceDur.toFixed(4), words: wt, beats, ...(ticks.length ? { ticks } : {}), ...(chunks ? { chunks: chunks.length } : {}),
    });
    t += dur;
  });
  // The end card holds for `tail`, then the episode ends on a whole frame.
  const duration = Math.ceil((t + tm.tail) * FPS) / FPS;
  out[out.length - 1].end = +duration.toFixed(4);
  const timeline = {
    episode: +ep || 1, lang, fps: FPS, duration: +duration.toFixed(4), voiced, lines: out,
    signature: sig.digest('hex').slice(0, 16),
    note: 'Generated by tools/timeline.mjs from script/epNN.<lang>.json and voice/epNN/<lang>/*.wav. Do not edit.',
  };
  fs.mkdirSync(path.join(ROOT, 'build'), { recursive: true });
  const file = path.join(ROOT, 'build', `timeline.${tag}.${lang}.json`);
  const json = JSON.stringify(timeline, null, 1) + '\n';
  if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== json) fs.writeFileSync(file, json);
  if (!quiet) {
    console.log(`${path.relative(ROOT, file)}: ${duration.toFixed(2)} s, ${out.length} lines, ${voiced} voiced`);
    for (const l of out) console.log(`  ${l.id.padEnd(9)} ${l.start.toFixed(2).padStart(6)} → ${l.end.toFixed(2).padStart(6)}  speech ${l.speechStart.toFixed(2)}–${l.speechEnd.toFixed(2)}${l.voice ? '  ' + l.voice : '  (est)'}${l.beats.length ? '  beats ' + l.beats.map((b) => b.toFixed(2)).join(',') : ''}`);
  }
  return timeline;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
  buildTimeline(arg('--lang', 'en'), { ep: +arg('--ep', 1) });
}
