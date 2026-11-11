#!/usr/bin/env node
/*
 * The kit's TEST STILLS (episode 41 step-up): one named still per feature, from the kit lab reel (ep 99), at half size
 * (540×960: about what a phone shows). node tools/kitstills.mjs [--outdir lab/kit41]
 */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, args, openReel, dataUrlToBuffer } from './lib.mjs';
const a = args(), outdir = path.resolve(ROOT, a.outdir || 'lab/kit41');
fs.mkdirSync(outdir, { recursive: true });
for (const f of fs.readdirSync(outdir)) if (/^(frame-ep99|kit-)/.test(f)) fs.rmSync(path.join(outdir, f));
const reel = await openReel({ scale: 0.5, ep: 99 });
const L = Object.fromEntries(reel.info.lines.map((l) => [l.id, l]));
const at = (id, t) => L[id].start + t, frac = (id, p) => L[id].start + (L[id].end - L[id].start) * p;
const SHOTS = [
  ['kit-01-backlight-old-vs-new', at('hook', 0.5)], ['kit-02-colour-depth-slide-a', frac('colour', 0.25)], ['kit-02-colour-depth-slide-b', frac('colour', 0.85)],
  ['kit-03-parallax-orbit-a', frac('depth', 0.35)], ['kit-03-parallax-orbit-b', frac('depth', 0.9)],
  ['kit-04-acting-1-anticipation', at('acting', 1.25)], ['kit-04-acting-2-action', at('acting', 2.05)], ['kit-04-acting-3-follow-through-turnword', frac('acting', 0.8)],
  ['kit-05-closeup-a-tender', at('closeup', 1.2)], ['kit-05-closeup-b-fear', frac('closeup', 0.85)],
  ['kit-06-frame-within-rack-a', at('camera', 0.5)], ['kit-06-frame-within-rack-b', frac('camera', 0.85)],
  ['kit-07-plaque-kinetic-caption', at('type', 1.6)], ['kit-08-creature-source-line', frac('cliff', 0.6)],
  ['kit-09-transition-smoke', at('depth', 0.36)], ['kit-10-transition-ink', at('acting', 0.36)], ['kit-11-transition-brush', at('closeup', 0.3)], ['kit-12-transition-lamp', at('type', 0.38)],
];
try {
  for (const [name, T] of SHOTS) { fs.writeFileSync(path.join(outdir, `${name}.png`), dataUrlToBuffer(await reel.pages[0].evaluate((T) => window.__reel.at(T), T))); console.log(`${name}.png  t = ${T.toFixed(2)} s`); }
  const errs = await reel.drainErrors();
  if (errs.length) { console.log(errs.slice(0, 6).join('\n')); process.exitCode = 1; }
} finally { await reel.close(); }
