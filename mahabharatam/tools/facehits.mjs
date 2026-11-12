#!/usr/bin/env node
// Where does text cross a face? node tools/facehits.mjs --ep 45 : per line, the frames (of 10 a second) in which a plaque,
// the turn-word, the source line or the caption band crossed a face box, and the face boxes of the first such frame.
import { args, openReel } from './lib.mjs';
const a = args(), ep = +(a.ep || 41);
const reel = await openReel({ scale: 0.25, ep, grain: 0 });
await reel.pages[0].evaluate(() => { window.REEL.probe = { figures: [], moves: {}, transitions: {}, type: {}, palettes: {}, byLine: {} }; });
for (const l of reel.info.lines) {
  const hits = {}; let first = null;
  for (let T = l.start + 0.05; T < l.end; T += 0.1) {
    const r = await reel.pages[0].evaluate((T) => { const p = window.REEL.probe; p.type = {}; window.__reel.at(T); return { type: { ...p.type }, faces: (window.REEL.faces || []).map((f) => [f.id, Math.round(f.x), Math.round(f.y), Math.round(f.r)]) }; }, T);
    for (const k of Object.keys(r.type)) if (/^faceHit|^captionFace|^moved|^lowText/.test(k)) { hits[k] = (hits[k] || 0) + 1; first = first || [T.toFixed(1), r.faces]; }
  }
  if (Object.keys(hits).length) console.log(l.id, JSON.stringify(hits), 'first at', JSON.stringify(first));
}
await reel.close();
