// the gate's shot-hue measure at each shot's midpoint (1/8 size)
import fs from 'node:fs';
import { openReel } from '../../../../tools/lib.mjs';
const tl = JSON.parse(fs.readFileSync('build/timeline.ep96.en.json', 'utf8'));
const reel = await openReel({ scale: 0.125, ep: 96, grain: 0 }); const p = reel.pages[0];
const hs = await p.evaluate((times) => times.map((T) => { window.__reel.at(T); const c = window.__reelCanvas, d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let sx = 0, sy = 0, sc = 0, n = 0;
  for (let i = 0; i < d.length; i += 4) { const r = d[i], g = d[i + 1], b = d[i + 2], mx = Math.max(r, g, b), mn = Math.min(r, g, b), ch = mx - mn; n++; if (ch < 8) continue; let h = mx === r ? ((g - b) / ch) % 6 : mx === g ? (b - r) / ch + 2 : (r - g) / ch + 4; h *= Math.PI / 3; sx += Math.cos(h) * ch; sy += Math.sin(h) * ch; sc += ch; }
  const ch = sc / n, f = Math.hypot(sx, sy) / (sc || 1); return ch < 16 || f < 0.25 ? '–' : Math.round(((Math.atan2(sy, sx) * 180) / Math.PI + 360) % 360); }), tl.lines.map((l) => (l.start + l.end) / 2));
console.log(tl.lines.map((l, i) => `${l.id}:${hs[i]}`).join(' '));
await reel.close();
