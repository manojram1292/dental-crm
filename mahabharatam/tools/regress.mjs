#!/usr/bin/env node
/*
 * Kit regression check: content hashes (no post) of N frames per episode, saved to / compared with a JSON file.
 *   node tools/regress.mjs --eps 1,8,20,33,40 --save base.json      record
 *   node tools/regress.mjs --eps 1,8,20,33,40 --check base.json     compare (exit 1 on any difference or page error)
 * Used when the shared kit changes: old episodes must draw exactly as before unless a change is meant.
 */
import fs from 'node:fs';
import { args, openReel } from './lib.mjs';
const a = args();
const eps = String(a.eps || '1').split(',').map(Number), n = +(a.count || 10);
const out = {};
let bad = 0;
for (const ep of eps) {
  const reel = await openReel({ scale: 0.25, ep, grain: 0 });
  const D = reel.info.DURATION, page = reel.pages[0];
  out[ep] = [];
  for (let i = 0; i < n; i++) { const T = Math.round(((i + 0.5) / n) * D * 30) / 30; out[ep].push([T, await page.evaluate((T) => window.__reel.hashAt(T), T)]); }
  const errs = await reel.drainErrors();
  if (errs.length) { bad++; console.log(`ep ${ep}: ${errs.length} page error(s): ${errs[0].split('\n')[0]}`); }
  await reel.close();
}
if (a.save) { fs.writeFileSync(a.save, JSON.stringify(out)); console.log(`saved ${a.save}`); }
if (a.check) {
  const base = JSON.parse(fs.readFileSync(a.check, 'utf8'));
  for (const ep of eps) for (const [i, [T, h]] of out[ep].entries()) if (!base[ep] || base[ep][i][1] !== h) { bad++; console.log(`ep ${ep} differs at ${T} s`); }
  console.log(bad ? `regress: ${bad} difference(s)` : `regress: ${eps.length} episodes × ${n} frames identical`);
}
process.exitCode = bad ? 1 : 0;
