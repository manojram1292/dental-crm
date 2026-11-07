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
 * (frames whose 1 s grey-level change stays under 2.0, the scorecard's own rule) lasts longer than 4.0 s.
 *
 * tools/render.mjs runs this gate (with --frames) before rendering; --no-gate skips it (only for re-renders of
 * episodes made before the gate existed, whose format predates these targets).
 */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, args, openReel } from './lib.mjs';
import { buildTimeline, epTag } from './timeline.mjs';

export async function gate(ep, { lang = 'en', frames = false, fps = 10, quiet = false } = {}) {
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
  const r = await gate(+(a.ep || 1), { lang: a.lang || 'en', frames: !!a.frames, fps: +(a.fps || 10) });
  process.exitCode = r.ok ? 0 : 1;
}
