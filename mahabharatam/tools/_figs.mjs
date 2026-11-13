// every figure the gate would fail on contrast, not only the worst: node tools/_figs.mjs --ep 97
import { args, openReel } from './lib.mjs';
const a = args(), ep = +(a.ep || 97);
const hueGap = (x, y) => { const d = Math.abs(x - y) % 360; return d > 180 ? 360 - d : d; };
function lab([r, g, b]) { const f = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; const R_ = f(r), G_ = f(g), B_ = f(b), X = (0.4124 * R_ + 0.3576 * G_ + 0.1805 * B_) / 0.95047, Y = 0.2126 * R_ + 0.7152 * G_ + 0.0722 * B_, Z = (0.0193 * R_ + 0.1192 * G_ + 0.9505 * B_) / 1.08883; const q = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116); return [116 * q(Y) - 16, 500 * (q(X) - q(Y)), 200 * (q(Y) - q(Z))]; }
const reel = await openReel({ scale: 0.125, ep, grain: 0 });
await reel.pages[0].evaluate(() => { window.REEL.probe = { figures: [], moves: {}, transitions: {}, type: {}, palettes: {}, byLine: {} }; });
const n = Math.floor(reel.info.DURATION * 10), worst = {};
for (let i = 0; i < n; i++) {
  const r = await reel.pages[0].evaluate((T) => { window.__reel.at(T); const p = window.REEL.probe; return { line: p.line, figs: p.figures.filter((f) => f.h >= 0.1) }; }, i / 10);
  for (const f of r.figs) { const A = lab(f.fig), B = lab(f.bg), dE = Math.hypot(A[0] - B[0], A[1] - B[1], A[2] - B[2]), dL = Math.abs(A[0] - B[0]); const cA = Math.hypot(A[1], A[2]), cB = Math.hypot(B[1], B[2]), same = cA > 14 && cB > 14 && hueGap((Math.atan2(A[2], A[1]) * 180) / Math.PI, (Math.atan2(B[2], B[1]) * 180) / Math.PI) < 25;
    if (dE < 24 || (same && dL < 28)) { const k = r.line + ' ' + f.id; if (!worst[k] || dE < worst[k].dE) worst[k] = { dE: +dE.toFixed(0), dL: +dL.toFixed(0), same, t: i / 10 }; } }
}
for (const [k, v] of Object.entries(worst)) console.log(k, JSON.stringify(v));
await reel.close();
