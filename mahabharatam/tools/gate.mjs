#!/usr/bin/env node
/*
 * The pre-render GATE: fails (exit 1) when an episode breaks the format before a single final frame is rendered.
 *
 *   node tools/gate.mjs --ep 31 [--lang en] [--frames] [--fps 10]
 *
 * From the timeline (build/timeline.epNN.<lang>.json, rebuilt here) and the script:
 *   hook ≤ 8 words · hook speech ends ≤ 3.0 s · the first story line starts ≤ 5.0 s · duration ≤ 59 s (54–58 is the
 *   target: outside it is a warning) · the TURN line (note contains "TURN") starts at 40–60 % · one rest ≥ 0.8 s (a
 *   `pre` ≥ 800 ms) right before the turn · the Next line ≤ 1.2 s.
 * With --frames, also renders the whole episode at 1/8 size (135×240, no motion blur) and fails when any static hold
 * (frames whose 1 s grey-level change stays under 2.0, the scorecard's own rule) lasts longer than 4.0 s, or (ep ≥ 31) when the
 * picture moves less than 6 grey levels between 0 and 0.5 s (the scorecard's Move@0.5; added after ep 34 missed it).
 *
 * From episode 31 (independent review 21–30) also: speech ≤ 2.6 words/s over the voiced lines · at most 2 NEW proper
 * names (first mentions in the episode; names are the capitalised words of tools/voice.py's NAMES table, plus any
 * capitalised word that is not the first of a sentence) in any 10 s window · the hook has no undefined pronoun (he, she,
 * it, they, them, him, her, his, its, their before any name) · the script sets one fixed "captionBand".
 * With --audio (after tools/mix.py): the mix has a silence ≥ 0.6 s at ≤ −45 dB (silencedetect), LRA ≥ 4 LU, and the Next
 * window is ≥ 8 dB under the body (ebur128 integrated).
 *
 * tools/render.mjs runs this gate (with --frames and --audio, after the score and the mix) before rendering; --no-gate skips it (only for re-renders of
 * episodes made before the gate existed, whose format predates these targets).
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { ROOT, args, openReel, findFfmpeg } from './lib.mjs';
import { buildTimeline, epTag } from './timeline.mjs';

const NAMES = (() => {
  try { return new Set([...fs.readFileSync(path.join(ROOT, 'tools', 'voice.py'), 'utf8').matchAll(/"([A-Z][A-Za-z]+)(?:'s)?":/g)].map((m) => m[1])); } catch { return new Set(); }
})();
const ANCHORS = new Set(['Sauti', 'Shaunaka', 'Next', 'I']);   // the frame's own people are not new names
const PRONOUNS = /^(he|she|it|they|them|him|her|his|its|their|hers|theirs)$/i;

function ebur(file, ss, to) {
  const a = ['-hide_banner', '-nostats'];
  if (ss != null) a.push('-ss', String(ss));
  if (to != null) a.push('-to', String(to));
  const r = spawnSync(findFfmpeg(), [...a, '-i', file, '-filter_complex', 'ebur128', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
  const sm = r.slice(r.lastIndexOf('Summary'));
  return { I: +((sm.match(/I:\s+(-?[\d.]+)/) || [])[1] ?? NaN), LRA: +((sm.match(/LRA:\s+(-?[\d.]+)/) || [])[1] ?? NaN) };
}

export async function gate(ep, { lang = 'en', frames = false, audio = false, fps = 10, quiet = false } = {}) {
  const tag = epTag(ep);
  const tl = buildTimeline(lang, { ep, quiet: true });
  const sc = JSON.parse(fs.readFileSync(path.join(ROOT, 'script', `${tag}.${lang}.json`), 'utf8'));
  const SL = Object.fromEntries(sc.lines.map((l) => [l.id, l]));
  const L = tl.lines, dur = tl.duration;
  const fails = [], warns = [], info = [];
  const hook = L[0], hs = SL[hook.id];
  const hw = hs.text.split(/\s+/).filter(Boolean).length;
  info.push(`hook ${hw} w, speech ends ${hook.speechEnd.toFixed(2)} s`);
  if (hw > 8) fails.push(`hook has ${hw} words (max 8)`);
  if (hook.speechEnd > 3.0) fails.push(`hook speech ends at ${hook.speechEnd.toFixed(2)} s (max 3.0)`);
  const story = L.slice(1).find((l) => l.id !== 'recap') || L[1];
  info.push(`story starts ${story.start.toFixed(2)} s`);
  if (story.start > 5.0) fails.push(`story starts at ${story.start.toFixed(2)} s (max 5.0)`);
  info.push(`duration ${dur.toFixed(2)} s`);
  if (dur > 59) fails.push(`duration ${dur.toFixed(2)} s (max 59)`);
  else if (dur < 54 || dur > 58) warns.push(`duration ${dur.toFixed(2)} s is outside the 54–58 s target`);
  const ti = L.findIndex((l) => /TURN/.test(SL[l.id]?.note || ''));
  if (ti < 0) fails.push('no line is marked TURN in its note');
  else {
    const pct = (100 * L[ti].start) / dur;
    info.push(`turn "${L[ti].id}" at ${pct.toFixed(1)} %`);
    if (pct < 40 || pct > 60) fails.push(`turn at ${pct.toFixed(1)} % (40–60)`);
    const pre = SL[L[ti].id].pre ?? 0;
    const rest = L[ti].speechStart - (L[ti - 1]?.speechEnd ?? 0);
    if (pre < 800 && rest < 0.8) fails.push(`no ≥ 0.8 s rest before the turn (pre ${pre} ms, gap ${rest.toFixed(2)} s)`);
  }
  if (ep >= 31) {
    const voiced = L.filter((l) => l.voice);
    const words = voiced.reduce((n, l) => n + SL[l.id].text.split(/\s+/).filter(Boolean).length, 0);
    const speech = voiced.reduce((n, l) => n + (l.speechEnd - l.speechStart), 0);
    info.push(`${(words / speech).toFixed(2)} words/s`);
    if (words / speech > 2.6) fails.push(`speech rate ${(words / speech).toFixed(2)} words/s (max 2.6)`);
    // first mentions of proper names, timed by the caption words
    const seen = new Set(), firsts = [];
    for (const l of L) {
      if (!l.words || !l.voice) continue;
      let sentenceStart = true;
      for (const w of l.words) {
        const raw = w.w.replace(/^[^A-Za-z]+/, ''), core = raw.replace(/[^A-Za-z]+$/, '').replace(/'s$/, '');
        const isName = core && /^[A-Z]/.test(core) && !ANCHORS.has(core) && (NAMES.has(core) || !sentenceStart);
        if (isName && !seen.has(core)) { seen.add(core); firsts.push([w.t0, core]); }
        sentenceStart = /[.?!:"”]$/.test(w.w.replace(/["”]$/, '')) || /[.?!]["”]?$/.test(w.w);
      }
    }
    let worst = [];
    for (const [t] of firsts) { const win = firsts.filter(([u]) => u >= t && u < t + 10); if (win.length > worst.length) worst = win; }
    info.push(`${firsts.length} names, ≤ ${worst.length} new per 10 s`);
    if (worst.length > 2) fails.push(`${worst.length} new names within 10 s: ${worst.map((x) => x[1]).join(', ')} (max 2)`);
    const hw0 = hs.text.replace(/["“”]/g, '').split(/\s+/);
    // an antecedent is a name, or one of the common nouns a pronoun can safely point back to
    const NOUNS = /^(sage|king|boy|girl|bird|serpent|serpents|snake|wife|husband|mother|father|son|daughter|man|woman|god|gods|priest|priests|brother|sister|child|healer|bride)$/i;
    const firstName = hw0.findIndex((w) => (/^[A-Z]/.test(w) && NAMES.has(w.replace(/[^A-Za-z]/g, ''))) || NOUNS.test(w.replace(/[^A-Za-z]/g, '')));
    const pron = hw0.findIndex((w) => PRONOUNS.test(w.replace(/[^A-Za-z]/g, '')));
    if (pron >= 0 && (firstName < 0 || pron < firstName)) fails.push(`the hook's "${hw0[pron]}" has no name before it (undefined pronoun)`);
    if (!sc.captionBand) fails.push('no fixed "captionBand" in the script');
  }
  if (audio) {
    const mixf = path.join(ROOT, 'audio', tag, `mix.${lang}.wav`);
    if (!fs.existsSync(mixf)) fails.push(`no mix at audio/${tag}/mix.${lang}.wav`);
    else {
      const sd = spawnSync(findFfmpeg(), ['-hide_banner', '-nostats', '-i', mixf, '-af', 'silencedetect=noise=-45dB:d=0.6', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
      const sil = [...sd.matchAll(/silence_duration: ([\d.]+)/g)].map((m) => +m[1]);
      const all = ebur(mixf);
      info.push(`silences ≥ 0.6 s at −45 dB: ${sil.length}${sil.length ? ` (longest ${Math.max(...sil).toFixed(2)} s)` : ''} · LRA ${all.LRA} LU`);
      if (!sil.length) fails.push('no silence ≥ 0.6 s at ≤ −45 dB in the mix');
      if (!(all.LRA >= 4)) fails.push(`LRA ${all.LRA} LU (min 4)`);
      const nxl = L.find((l) => l.id === 'next');
      if (nxl) {
        const d = ebur(mixf, nxl.start).I - ebur(mixf, null, nxl.start).I;
        info.push(`Next ${d.toFixed(1)} dB vs body`);
        if (!(d <= -8)) fails.push(`Next only ${d.toFixed(1)} dB under the body (min 8)`);
      }
    }
  }
  const nx = L.find((l) => l.id === 'next');
  const tail = sc.timing?.tail ?? 0;   // the end card's hold is not part of the Next overlay's own length
  if (nx && nx.end - nx.start - tail > 1.2 + 1e-6) fails.push(`Next lasts ${(nx.end - nx.start - tail).toFixed(2)} s (max 1.2)`);
  if (frames) {
    const reel = await openReel({ scale: 0.125, lang, ep, grain: 0 });   // no grain: at 1/8 size it would read as motion
    try {
      const page = reel.pages[0];
      const n = Math.floor(dur * fps);
      const means = await page.evaluate(async ([n, fps]) => {
        const c = window.__reelCanvas, g = c.getContext('2d');
        const out = [];
        for (let i = 0; i < n; i++) {
          window.__reel.at(i / fps);
          const d = g.getImageData(0, 0, c.width, c.height).data;
          const a = new Float32Array(c.width * c.height);
          for (let j = 0, k = 0; j < d.length; j += 4, k++) a[k] = 0.299 * d[j] + 0.587 * d[j + 1] + 0.114 * d[j + 2];
          out.push(Array.from(a));
        }
        return out;
      }, [n, fps]);
      // motion in the first half-second (the scorecard's Move@0.5: mean |frame(0.5 s) − frame(0)| ≥ 6 grey levels): ep 34 missed it
      { const A = means[Math.min(means.length - 1, Math.round(fps / 2))], B = means[0]; let s0 = 0; for (let k = 0; k < A.length; k++) s0 += Math.abs(A[k] - B[k]); const mv = s0 / A.length;
        info.push(`motion by 0.5 s ${mv.toFixed(1)}`); if (ep >= 31 && mv < 6) fails.push(`motion by 0.5 s is ${mv.toFixed(1)} grey levels (min 6)`); }
      let run = 0, best = 0, at = 0;
      for (let i = fps; i < means.length; i++) {
        const A = means[i], B = means[i - fps];
        let s = 0; for (let k = 0; k < A.length; k++) s += Math.abs(A[k] - B[k]);
        const ch = s / A.length;
        run = ch < 2.0 ? run + 1 : 0;
        if (run > best) { best = run; at = (i - run) / fps; }
      }
      const hold = best ? (best + fps) / fps : 0;
      info.push(`longest static hold ${hold.toFixed(1)} s${best ? ` at ${at.toFixed(1)} s` : ''}`);
      if (hold > 4.0) fails.push(`static hold of ${hold.toFixed(1)} s at ${at.toFixed(1)} s (max 4.0)`);
      const errs = await reel.drainErrors();
      if (errs.length) fails.push(`${errs.length} page error(s): ${errs[0].split('\n')[0]}`);
    } finally { await reel.close(); }
  }
  if (!quiet) {
    console.log(`gate ${tag}: ${info.join(' · ')}`);
    for (const w of warns) console.log(`  warn: ${w}`);
    for (const f of fails) console.log(`  FAIL: ${f}`);
    console.log(fails.length ? `gate ${tag}: FAILED (${fails.length})` : `gate ${tag}: passed`);
  }
  return { ok: !fails.length, fails, warns, info };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const a = args();
  const r = await gate(+(a.ep || 1), { lang: a.lang || 'en', frames: !!a.frames, audio: !!a.audio, fps: +(a.fps || 10) });
  process.exitCode = r.ok ? 0 : 1;
}
