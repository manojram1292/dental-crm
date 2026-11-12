// node tools/_faces.mjs --ep 50 --lines ferry,sage : face boxes [id, x0, y0, x1, y1] at five times in each line (logical px)
import { args, openReel } from './lib.mjs';
const a = args(), ep = +(a.ep || 41), want = String(a.lines || '').split(',');
const reel = await openReel({ scale: 0.25, ep, grain: 0 });
for (const l of reel.info.lines) { if (!want.includes(l.id)) continue; const u = {};
  for (let i = 0; i <= 8; i++) { const T = l.start + 0.05 + (l.end - l.start - 0.1) * i / 8;
    const f = await reel.pages[0].evaluate((T) => { window.__reel.at(T); return (window.REEL.faces || []).map((f) => [f.id, Math.round(f.x - f.r), Math.round(f.y - f.r), Math.round(f.x + f.r), Math.round(f.y + f.r)]); }, T);
    for (const [id, x0, y0, x1, y1] of f) { const b = u[id] || (u[id] = [1e9, 1e9, -1e9, -1e9]); b[0] = Math.min(b[0], x0); b[1] = Math.min(b[1], y0); b[2] = Math.max(b[2], x1); b[3] = Math.max(b[3], y1); } }
  console.log(ep, l.id, 'union of face boxes:', JSON.stringify(u)); }
await reel.close();
