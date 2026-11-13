// like tools/facehits.mjs, but at the gate's own sample times (i / 10 s): node tools/_hits10.mjs --ep 97
import { args, openReel } from './lib.mjs';
const a = args(), ep = +(a.ep || 97);
const reel = await openReel({ scale: 0.125, ep, grain: 0 });
await reel.pages[0].evaluate(() => { window.REEL.probe = { figures: [], moves: {}, transitions: {}, type: {}, palettes: {}, byLine: {} }; });
const n = Math.floor(reel.info.DURATION * 10);
for (let i = 0; i < n; i++) {
  const r = await reel.pages[0].evaluate((T) => { const p = window.REEL.probe; p.type = {}; window.__reel.at(T); return { type: { ...p.type }, line: p.line, faces: (window.REEL.faces || []).map((f) => [f.id, Math.round(f.x), Math.round(f.y), Math.round(f.r)]) }; }, i / 10);
  const k = Object.keys(r.type).filter((k) => /^faceHit|^captionFace|^moved|^lowText/.test(k));
  if (k.length) console.log((i / 10).toFixed(1), r.line, k.join(','), JSON.stringify(r.faces));
}
await reel.close();
