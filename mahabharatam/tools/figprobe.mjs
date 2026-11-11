#!/usr/bin/env node
// Which figure fails the figure-against-ground check, and when? node tools/figprobe.mjs --ep 48 --line war [--id kuruPrince]
// prints, 10 times a second through the line, each probed figure's mean colour, the ground's, and their distance.
import { args, openReel } from './lib.mjs';
const a = args(), ep = +(a.ep || 41);
const reel = await openReel({ scale: 0.25, ep, grain: 0 });
const L = reel.info.lines.find((l) => l.id === a.line);
await reel.pages[0].evaluate(() => { window.REEL.probe = { figures: [], moves: {}, transitions: {}, type: {}, palettes: {}, byLine: {} }; });
const lab = (c) => { const f = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; const [r, g, b] = c.map(f); const X = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.9505, Y = 0.2126 * r + 0.7152 * g + 0.0722 * b, Z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.089; const q = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116); return [116 * q(Y) - 16, 500 * (q(X) - q(Y)), 200 * (q(Y) - q(Z))]; };
for (let T = L.start; T < L.end; T += 0.1) {
  const r = await reel.pages[0].evaluate((T) => { window.__reel.at(T); return window.REEL.probe.figures.map((f) => [f.id, f.key, f.fig.map(Math.round), f.bg.map(Math.round), f.h]); }, T);
  for (const [id, key, fig, bg, h] of r) { if (a.id && id !== a.id) continue; if (h < 0.1) continue; const A = lab(fig), B = lab(bg), dE = Math.hypot(A[0] - B[0], A[1] - B[1], A[2] - B[2]); if (dE < 26 || a.all) console.log((T - L.start).toFixed(1), id, key, 'fig', fig.join(','), 'bg', bg.join(','), 'dE', dE.toFixed(0), 'dL', Math.abs(A[0] - B[0]).toFixed(0), 'h', h); }
}
await reel.close();
