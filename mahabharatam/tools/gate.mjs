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
 * FROM EPISODE 41 (the step-up; research/audience-2027.md). On the SCRIPT alone (an unvoiced script is timed from each
 * line's "estVoice", tools/estimate.py):
 *   captions: every captioned line is on screen ≥ 1.8 s · names: every new proper name has a 1–6 word identifier in the
 *   script's "names" map (shown as a plaque or spoken), and no line leans on an earlier episode ("as we saw", "last
 *   time", …) · loop: "loop" { hookQuestion, answeredBy (a line id), openQuestion, prevQuestion, prevAnsweredBy (a line
 *   that starts ≤ 15 s) }; prevQuestion must equal the previous episode's openQuestion · the titles match the catalog
 *   (episodeTitle, nextTitle) · sound: three layers ("amb" set from the first line, ≥ 2 places; "music" moods, ≥ 3; a
 *   "foley" cue on every spoken line), ≥ 2 J- or L-cuts (jcut / lcut / ambLead / ambLag ≥ 150 ms) with no overlapping
 *   speech, ≥ 1 real rest (a line noted TURN or "rest": true with pre ≥ 800 ms; 2 is the target) · the source line
 *   (strings.sourceLine, strings.madeLine with "synthetic") · "hookStyle" differs from the previous episode's ·
 *   COLOUR SCRIPT: every line names a palette ("pal", src/kit/stage.js) and no hue (within 30°) runs for more than 2
 *   lines; ≥ 2 palettes the previous episode did not use · CAMERA: "cam" on every line with ≥ 4 distinct moves, exactly
 *   one "signature": true shot, ≥ 2 distinct transitions born from the medium ("tr": ink | brush | lamp | smoke), and
 *   ≥ 1 "closeup": true.
 * With --frames (once the scenes exist) the same is MEASURED on the picture through the kit's probe: distinct camera
 *   moves ≥ 4 and medium transitions ≥ 2 actually used · the dominant hue of every shot's midpoint frame (run ≤ 2) ·
 *   every figure ≥ 10 % of the frame's height against the ground in its own box (CIE ΔE ≥ 20; on a ground of its own
 *   hue, |ΔL*| ≥ 25) · a close-up really drawn (a figure box ≥ 1.4 frame heights) in a "closeup" line · the source line
 *   on screen ≥ 1.0 s · no plaque, turn-word, source line or caption crossing a face box (more than 2 sampled frames
 *   fails) · SHOT VARIETY: pHash of the 0.5 s / 3 s / last frames against the previous three episodes (fail
 *   under 22; target min ≥ 28, mean ≥ 32) and of consecutive shots (fail ≤ 12).
 * With --audio: the mix's report (audio/epNN/mix.<lang>.json): three stems, the music ≥ 6 dB lower under the voice,
 *   true peak ≤ −1.5 dBTP, and silencedetect finds ≥ 1 silence (2 is the target).
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
const ANCHORS = new Set(['Sauti', 'Shaunaka', 'Next', 'I', 'Mahabharata', 'Mahabharatam']);   // the frame's own people and the work itself are not new names   // the frame's own people are not new names
const PRONOUNS = /^(he|she|it|they|them|him|her|his|its|their|hers|theirs)$/i;

function ebur(file, ss, to) {
  const a = ['-hide_banner', '-nostats'];
  if (ss != null) a.push('-ss', String(ss));
  if (to != null) a.push('-to', String(to));
  const r = spawnSync(findFfmpeg(), [...a, '-i', file, '-filter_complex', 'ebur128', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
  const sm = r.slice(r.lastIndexOf('Summary'));
  return { I: +((sm.match(/I:\s+(-?[\d.]+)/) || [])[1] ?? NaN), LRA: +((sm.match(/LRA:\s+(-?[\d.]+)/) || [])[1] ?? NaN) };
}


// ─── Episode 41 on ────────────────────────────────────────────────────────────────────────────────────────────────
const PAL_HUES = (() => { try { return Object.fromEntries([...fs.readFileSync(path.join(ROOT, 'src', 'kit', 'stage.js'), 'utf8').matchAll(/'([a-z0-9-]+)': P\((-?\d+),/g)].map((m) => [m[1], +m[2]])); } catch { return {}; } })();
const pyList = (name) => { try { return new Set((fs.readFileSync(path.join(ROOT, 'tools', 'score.py'), 'utf8').match(new RegExp(name + " = \\(([^)]*)\\)")) || [, ''])[1].match(/'[^']+'/g).map((x) => x.slice(1, -1))); } catch { return new Set(); } };
const AMB = pyList('AMB_KINDS'), FOLEY = pyList('FOLEY_KINDS'), MUSIC = pyList('MUSIC_KINDS');
const CAMS = new Set(['push', 'pull', 'tilt', 'slide', 'orbit', 'rack', 'crane', 'frame', 'still']), TRS = new Set(['ink', 'brush', 'lamp', 'smoke']);
const hueGap = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };
const readScript = (ep, lang) => { const f = path.join(ROOT, 'script', `${epTag(ep)}.${lang}.json`); return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null; };
function catalogTitles() {
  const out = {};
  try { const walk = (o) => { if (Array.isArray(o)) o.forEach(walk); else if (o && typeof o === 'object') { if (typeof o.n === 'number' && o.title) out[o.n] = o.title; Object.values(o).forEach(walk); } }; walk(JSON.parse(fs.readFileSync(path.join(ROOT, 'catalog', 'series.json'), 'utf8'))); } catch {}
  return out;
}
/** Longest run of consecutive entries whose hues are within 30° of the run's first (null = neutral: breaks a run). */
function hueRun(hues) {
  let best = 0, at = 0, i = 0;
  while (i < hues.length) { let j = i; if (hues[i] != null) while (j + 1 < hues.length && hues[j + 1] != null && hueGap(hues[j + 1], hues[i]) < 30) j++; if (j - i + 1 > best) { best = j - i + 1; at = i; } i = j + 1; }
  return { best, at };
}

function scriptChecks41({ ep, sc, SL, L, dur, lang, firsts }) {
  const fails = [], warns = [], info = [];
  const spoken = L.filter((l) => l.voice || l.spoken);
  // captions: minimum hold
  for (const l of spoken) {
    if (SL[l.id].caption === false) continue;
    const hold = (l.speechEnd > l.end + 0.01 ? l.speechEnd + 0.3 : l.end - 0.08) - (l.speechStart - 0.08);
    if (hold < 1.8) fails.push(`caption "${l.id}" is on screen ${hold.toFixed(2)} s (min 1.8)`);
  }
  // every new name is identified; nothing leans on an earlier episode
  const names = sc.names || {};
  for (const [, n] of firsts) { const id = names[n]; if (!id) fails.push(`name "${n}" has no identifier in the script's "names" map`); else if (id.split(/\s+/).length > 6) fails.push(`identifier for "${n}" is over 6 words`); }
  for (const l of sc.lines) if (/\b(as we saw|last time|last episode|remember (when|that)|earlier,? we|as you (know|remember)|we (saw|heard) (how|that))\b/i.test(l.text)) fails.push(`line "${l.id}" leans on an earlier episode: "${l.text}"`);
  info.push(`${firsts.length} names identified`);
  // close one question, open one, answer the last one early
  const lp = sc.loop || {};
  if (!lp.hookQuestion || !lp.openQuestion) fails.push('"loop" needs hookQuestion and openQuestion');
  if (!SL[lp.answeredBy]) fails.push('"loop.answeredBy" must name the line that answers the hook');
  const pa = L.find((l) => l.id === lp.prevAnsweredBy);
  if (!pa) fails.push('"loop.prevAnsweredBy" must name the line that answers the previous episode\'s open question');
  else { info.push(`previous question answered at ${pa.start.toFixed(1)} s`); if (pa.start > 15) fails.push(`the previous episode's question is answered at ${pa.start.toFixed(1)} s (max 15)`); }
  const prev = readScript(ep - 1, lang), next = readScript(ep + 1, lang);
  if (prev && prev.loop && prev.loop.openQuestion && prev.loop.openQuestion !== lp.prevQuestion) fails.push(`"loop.prevQuestion" does not match episode ${ep - 1}'s openQuestion ("${prev.loop.openQuestion}")`);
  // titles against the catalog
  const cat = catalogTitles(), S = sc.strings || {};
  if (ep !== 99 && cat[ep] && S.episodeTitle !== cat[ep]) fails.push(`episodeTitle "${S.episodeTitle}" ≠ catalog "${cat[ep]}"`);
  if (ep !== 99 && cat[ep + 1] && S.nextTitle !== cat[ep + 1]) fails.push(`nextTitle "${S.nextTitle}" ≠ catalog "${cat[ep + 1]}"`);
  if (!S.sourceLine || !/synthetic/i.test(S.madeLine || '')) fails.push('strings.sourceLine and strings.madeLine ("Voices: synthetic · Drawn in code") are required');
  // sound: three layers, J/L cuts, rests
  let amb = null; const ambs = new Set(), moods = new Set(); let mood = 'still', jl = 0;
  for (const l of sc.lines) {
    if (l.amb) { amb = l.amb; if (!AMB.has(amb)) fails.push(`line "${l.id}": unknown amb "${amb}"`); }
    if (!amb) fails.push(`line "${l.id}" has no ambience (set "amb" on the first line)`);
    ambs.add(amb);
    if (l.music) { mood = l.music; if (!MUSIC.has(mood)) fails.push(`line "${l.id}": unknown music "${mood}"`); }
    moods.add(mood);
    for (const f of l.foley || []) if (!FOLEY.has(f.split('@')[0])) fails.push(`line "${l.id}": unknown foley "${f}"`);
    if (l.voice !== false && l.id !== 'next' && !(l.foley || []).length) fails.push(`line "${l.id}" has no foley cue`);
    if (Math.max(l.jcut || 0, l.lcut || 0, l.ambLead || 0, l.ambLag || 0) >= 150) jl++;
  }
  info.push(`${ambs.size} ambiences · ${moods.size} music moods · ${jl} J/L cuts`);
  if (ambs.size < 2) fails.push(`only ${ambs.size} ambience bed(s) (min 2 places)`);
  if (moods.size < 3) fails.push(`only ${moods.size} music mood(s) (min 3)`);
  if (jl < 2) fails.push(`${jl} J- or L-cut(s) (min 2)`);
  for (let i = 1; i < spoken.length; i++) if (spoken[i].speechStart < spoken[i - 1].speechEnd + 0.08) fails.push(`speech of "${spoken[i].id}" overlaps "${spoken[i - 1].id}"`);
  const rests = sc.lines.filter((l) => (/TURN/.test(l.note || '') || l.rest) && (l.pre ?? 0) >= 800).length;
  info.push(`${rests} rests`);
  if (rests < 1) fails.push('no real rest (a line noted TURN or "rest": true with pre ≥ 800 ms)');
  else if (rests < 2) warns.push('one rest (two is the target where the story allows)');
  // hook style rotates
  if (!sc.hookStyle) fails.push('no "hookStyle"');
  else if (prev && prev.hookStyle === sc.hookStyle) fails.push(`hookStyle "${sc.hookStyle}" repeats episode ${ep - 1}'s`);
  // the colour script
  const pals = []; let pal = null;
  for (const l of sc.lines) { if (l.id === 'next') continue;   // the Next band plays over the cliffhanger image
    if (l.pal) pal = l.pal; if (!pal) { fails.push(`line "${l.id}" has no palette ("pal")`); continue; } if (!(pal in PAL_HUES)) fails.push(`line "${l.id}": unknown palette "${pal}"`); pals.push(pal); }
  const run = hueRun(pals.map((p) => (PAL_HUES[p] >= 0 ? PAL_HUES[p] : null)));
  info.push(`${new Set(pals).size} palettes, hue run ≤ ${run.best}`);
  if (run.best > 2) fails.push(`one hue runs for ${run.best} lines from "${sc.lines[run.at].id}" (max 2)`);
  if (prev) { const pp = new Set(prev.lines.map((l) => l.pal).filter(Boolean)); const fresh = [...new Set(pals)].filter((p) => !pp.has(p)); if (fresh.length < 2) fails.push(`only ${fresh.length} palette(s) that episode ${ep - 1} did not use (min 2)`); }
  else if (new Set(pals).size < 2) fails.push('fewer than 2 palettes');
  // camera grammar
  const cams = new Set(), trs = new Set();
  for (const l of sc.lines) { if (l.id === 'next') continue; if (!l.cam) fails.push(`line "${l.id}" has no camera move ("cam")`); else for (const c of String(l.cam).split('+')) { if (!CAMS.has(c)) fails.push(`line "${l.id}": unknown cam "${c}"`); if (c !== 'still') cams.add(c); } if (l.tr) { if (TRS.has(l.tr)) trs.add(l.tr); else if (l.tr !== 'dissolve' && l.tr !== 'cut') fails.push(`line "${l.id}": unknown transition "${l.tr}"`); } }
  info.push(`${cams.size} camera moves · ${trs.size} medium transitions`);
  if (cams.size < 4) fails.push(`${cams.size} distinct camera moves (min 4)`);
  if (trs.size < 2) fails.push(`${trs.size} distinct transitions born from the medium (min 2)`);
  if (sc.lines.filter((l) => l.signature).length !== 1) fails.push('exactly one line must be the signature shot ("signature": true)');
  if (!sc.lines.some((l) => l.closeup)) fails.push('no face close-up ("closeup": true)');
  void next; void dur;
  return { fails, warns, info };
}

function phash(a, w = 135, h = 240) {
  const m = [];
  for (let i = 0; i < 32; i++) { const row = []; for (let j = 0; j < 32; j++) { const y0 = Math.floor((i * h) / 32), y1 = Math.floor(((i + 1) * h) / 32), x0 = Math.floor((j * w) / 32), x1 = Math.floor(((j + 1) * w) / 32); let s = 0, n = 0; for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { s += a[y * w + x]; n++; } row.push(s / n); } m.push(row); }
  const d = [];
  for (let u = 0; u < 8; u++) for (let v = 0; v < 8; v++) { let s = 0; for (let i = 0; i < 32; i++) for (let j = 0; j < 32; j++) s += m[i][j] * Math.cos(((2 * i + 1) * u * Math.PI) / 64) * Math.cos(((2 * j + 1) * v * Math.PI) / 64); d.push(s); }
  const ac = d.slice(1), med = [...ac].sort((x, y) => x - y)[31];
  return ac.map((x) => x > med);
}
const ham = (a, b) => a.reduce((n, x, i) => n + (x !== b[i] ? 1 : 0), 0);
function lab([r, g, b]) {
  const f = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  const R_ = f(r), G_ = f(g), B_ = f(b), X = (0.4124 * R_ + 0.3576 * G_ + 0.1805 * B_) / 0.95047, Y = 0.2126 * R_ + 0.7152 * G_ + 0.0722 * B_, Z = (0.0193 * R_ + 0.1192 * G_ + 0.9505 * B_) / 1.08883;
  const q = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return [116 * q(Y) - 16, 500 * (q(X) - q(Y)), 200 * (q(Y) - q(Z))];
}

async function frameChecks41({ ep, lang, fps, means, L, SL, page }) {
  const fails = [], warns = [], info = [];
  const probe = await page.evaluate(() => { const p = window.REEL.probe; return { moves: p.moves, transitions: p.transitions, type: p.type, byLine: p.byLine }; });
  const moves = Object.keys(probe.moves), trs = Object.keys(probe.transitions).filter((t) => t !== 'dissolve');
  info.push(`camera: ${moves.join(', ') || 'none'} · transitions: ${trs.join(', ') || 'none'}`);
  if (moves.length < 4) fails.push(`${moves.length} distinct camera moves on screen (min 4)`);
  if (trs.length < 2) fails.push(`${trs.length} distinct medium transitions on screen (min 2)`);
  // dominant hue of each shot's midpoint frame
  const shots = L.filter((l) => l.id !== 'next');
  const hues = await page.evaluate((times) => times.map((T) => {
    window.__reel.at(T);
    const c = window.__reelCanvas, d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let sx = 0, sy = 0, sc = 0, n = 0;
    for (let i = 0; i < d.length; i += 4) { const r = d[i], g = d[i + 1], b = d[i + 2], mx = Math.max(r, g, b), mn = Math.min(r, g, b), ch = mx - mn; n++; if (ch < 8) continue; let h = mx === r ? ((g - b) / ch) % 6 : mx === g ? (b - r) / ch + 2 : (r - g) / ch + 4; h *= Math.PI / 3; sx += Math.cos(h) * ch; sy += Math.sin(h) * ch; sc += ch; }
    return { hue: ((Math.atan2(sy, sx) * 180) / Math.PI + 360) % 360, chroma: sc / n, focus: Math.hypot(sx, sy) / (sc || 1) };
  }), shots.map((l) => (l.start + l.end) / 2));
  const hs = hues.map((h) => (h.chroma < 16 || h.focus < 0.25 ? null : h.hue));
  const run = hueRun(hs);
  info.push(`shot hues ${hs.map((h) => (h == null ? '–' : Math.round(h))).join(' ')} · run ≤ ${run.best}`);
  if (run.best > 2) fails.push(`one hue runs for ${run.best} shots from "${shots[run.at].id}" (max 2)`);
  // figures against their grounds
  let worst = null, nfig = 0;
  for (const [id, bl] of Object.entries(probe.byLine)) for (const f of bl.figs) {
    nfig++;
    const A = lab(f.fig), B = lab(f.bg), dE = Math.hypot(A[0] - B[0], A[1] - B[1], A[2] - B[2]), dL = Math.abs(A[0] - B[0]);
    const cA = Math.hypot(A[1], A[2]), cB = Math.hypot(B[1], B[2]), same = cA > 14 && cB > 14 && hueGap((Math.atan2(A[2], A[1]) * 180) / Math.PI, (Math.atan2(B[2], B[1]) * 180) / Math.PI) < 25;
    const bad = dE < 20 ? `ΔE ${dE.toFixed(0)}` : same && dL < 25 ? `on its own hue, ΔL ${dL.toFixed(0)}` : null;
    if (bad && (!worst || dE < worst.dE)) worst = { dE, msg: `figure "${f.id}" in "${id}": ${bad}` };
  }
  info.push(`${nfig} figure samples${worst ? '' : ', all stand off their grounds'}`);
  if (worst) fails.push(`${worst.msg} (min ΔE 20; on its own hue |ΔL*| ≥ 25)`);
  // text never crosses a face (the kit moves a plaque, the turn-word and the source line clear; a hit means it found no room)
  const fh = Object.entries(probe.type).filter(([k]) => /^faceHit|^captionFace/.test(k));
  for (const [k, n] of fh) if (n > 2) fails.push(`text crosses a face in ${n} sampled frames (${k.replace('faceHit:', '').replace('captionFace', 'the caption band')})`);
  if (!fh.length) info.push('no text on a face');
  // the close-up and the source line
  const cu = Object.entries(probe.byLine).some(([id, bl]) => SL[id] && SL[id].closeup && bl.figs.some((f) => f.h >= 1.4));
  if (!cu) fails.push('no close-up on screen (a figure ≥ 1.4 frame heights in a line marked "closeup")');
  const src = Object.values(probe.byLine).reduce((n, bl) => n + bl.src, 0) / fps;
  info.push(`source line ${src.toFixed(1)} s`);
  if (src < 1.0) fails.push(`the source line is on screen ${src.toFixed(1)} s (min 1.0)`);
  // shot variety
  const mid = shots.map((l) => phash(means[Math.min(means.length - 1, Math.floor(((l.start + l.end) / 2) * fps))]));
  const adj = mid.slice(1).map((h, i) => ham(h, mid[i]));
  if (adj.length) { info.push(`adjacent shots pHash min ${Math.min(...adj)} mean ${(adj.reduce((a, b) => a + b, 0) / adj.length).toFixed(1)}`); if (Math.min(...adj) <= 12) fails.push(`two consecutive shots share a composition (pHash ${Math.min(...adj)}; "${shots[adj.indexOf(Math.min(...adj)) + 1].id}")`); }
  const keyOf = (ms) => [ms[Math.min(ms.length - 1, Math.round(0.5 * fps))], ms[Math.min(ms.length - 1, Math.round(3 * fps))], ms[ms.length - 1]].map((a) => phash(a));
  const mine = keyOf(means), ds = [];
  for (const e of [ep - 1, ep - 2, ep - 3]) {
    if (!readScript(e, lang) || e === 99 || e < 1) continue;
    let r2;
    try {
      r2 = await openReel({ scale: 0.125, lang, ep: e, grain: 0 });
      const D = r2.info.DURATION;
      const fr = await r2.pages[0].evaluate((ts) => ts.map((T) => { window.__reel.at(T); const c = window.__reelCanvas, d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data, a = []; for (let j = 0; j < d.length; j += 4) a.push(0.299 * d[j] + 0.587 * d[j + 1] + 0.114 * d[j + 2]); return a; }), [0.5, 3, D - 1 / 30]);
      fr.map((a) => phash(a)).forEach((h, k) => ds.push(ham(h, mine[k])));
    } catch { /* an older episode that cannot be opened is skipped */ } finally { if (r2) await r2.close(); }
  }
  if (ds.length) {
    const mn = Math.min(...ds), mean = ds.reduce((a, b) => a + b, 0) / ds.length;
    info.push(`key frames vs previous episodes: pHash min ${mn} mean ${mean.toFixed(1)} (${ds.length} pairs)`);
    if (mn < 22) fails.push(`a key frame is too close to a previous episode's (pHash ${mn}; min 22)`);
    else if (mn < 28 || mean < 32) warns.push(`key-frame variety under the target (min ${mn} / 28, mean ${mean.toFixed(1)} / 32)`);
  }
  return { fails, warns, info };
}

export async function gate(ep, { lang = 'en', frames = false, audio = false, fps = 10, quiet = false } = {}) {
  const tag = epTag(ep);
  const tl = buildTimeline(lang, { ep, quiet: true });
  const sc = JSON.parse(fs.readFileSync(path.join(ROOT, 'script', `${tag}.${lang}.json`), 'utf8'));
  const SL = Object.fromEntries(sc.lines.map((l) => [l.id, l]));
  const L = tl.lines, dur = tl.duration;
  const fails = [], warns = [], info = [];
  let firstsOut = [];
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
    const voiced = L.filter((l) => l.voice || l.spoken);
    const words = voiced.reduce((n, l) => n + SL[l.id].text.split(/\s+/).filter(Boolean).length, 0);
    const speech = voiced.reduce((n, l) => n + (l.speechEnd - l.speechStart), 0);
    info.push(`${(words / speech).toFixed(2)} words/s`);
    if (words / speech > 2.6) fails.push(`speech rate ${(words / speech).toFixed(2)} words/s (max 2.6)`);
    // first mentions of proper names, timed by the caption words
    const seen = new Set(), firsts = [];
    for (const l of L) {
      if (!l.words || !(l.voice || l.spoken)) continue;
      let sentenceStart = true;
      for (const w of l.words) {
        const raw = w.w.replace(/^[^A-Za-z]+/, ''), core = raw.replace(/[^A-Za-z]+$/, '').replace(/'s$/, '');
        const isName = core && /^[A-Z]/.test(core) && !ANCHORS.has(core) && (NAMES.has(core) || !sentenceStart);
        if (isName && !seen.has(core)) { seen.add(core); firsts.push([w.t0, core]); }
        sentenceStart = /[.?!:"”]$/.test(w.w.replace(/["”]$/, '')) || /[.?!]["”]?$/.test(w.w);
      }
    }
    firstsOut = firsts;
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
  let v41 = null;
  if (ep >= 41) {
    v41 = scriptChecks41({ ep, sc, SL, L, dur, lang, firsts: firstsOut });
    fails.push(...v41.fails); warns.push(...v41.warns); info.push(...v41.info);
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
      if (ep >= 41) {
        const rp = path.join(ROOT, 'audio', tag, `mix.${lang}.json`);
        const rep = fs.existsSync(rp) ? JSON.parse(fs.readFileSync(rp, 'utf8')) : null;
        if (!rep) fails.push(`no mix report at audio/${tag}/mix.${lang}.json`);
        else {
          info.push(`stems ${(rep.stems || []).join('+') || 'none'} · music ${rep.music_under_voice_db ?? '?'} dB under voice · TP ${rep.true_peak_dbtp}`);
          if (!rep.stems || rep.stems.length < 3) fails.push('the mix did not use three stems (amb, foley, mus): voice the episode and run tools/score.py first');
          else if (!(rep.music_under_voice_db <= -6)) fails.push(`the music is only ${rep.music_under_voice_db} dB lower under the voice (min 6)`);
          if (!(rep.true_peak_dbtp <= -1.5)) fails.push(`true peak ${rep.true_peak_dbtp} dBTP (max −1.5)`);
        }
        if (sil.length === 1) warns.push('one real silence (two is the target where the story allows)');
      }
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
    if (ep >= 41) await reel.pages[0].evaluate(() => { window.REEL.probe = { figures: [], moves: {}, transitions: {}, type: {}, palettes: {}, byLine: {} }; });
    try {
      const page = reel.pages[0];
      const n = Math.floor(dur * fps);
      const means = await page.evaluate(async ([n, fps]) => {
        const c = window.__reelCanvas, g = c.getContext('2d');
        const out = [];
        for (let i = 0; i < n; i++) {
          window.__reel.at(i / fps);
          const pr = window.REEL.probe;
          if (pr) { const bl = (pr.byLine[pr.line] = pr.byLine[pr.line] || { src: 0, figs: [] }); if (pr.type.source) { bl.src++; pr.type.source = 0; } for (const f of pr.figures) if (f.h >= 0.1) bl.figs.push(f); }
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
      if (ep >= 41) {
        const f41 = await frameChecks41({ ep, lang, fps, means, L, SL, page, reel });
        fails.push(...f41.fails); warns.push(...f41.warns); info.push(...f41.info);
      }
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
