// the gate's figure-contrast probe at chosen times: node figprobe.mjs T1,T2
import { openReel } from '../../../../tools/lib.mjs';
const lab = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; const R_ = f(r), G_ = f(g), B_ = f(b), X = (0.4124 * R_ + 0.3576 * G_ + 0.1805 * B_) / 0.95047, Y = 0.2126 * R_ + 0.7152 * G_ + 0.0722 * B_, Z = (0.0193 * R_ + 0.1192 * G_ + 0.9505 * B_) / 1.08883; const q = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116); return [116 * q(Y) - 16, 500 * (q(X) - q(Y)), 200 * (q(Y) - q(Z))]; };
const reel = await openReel({ scale: 0.125, ep: 96, grain: 0 }); const p = reel.pages[0];
for (const T of process.argv[2].split(',').map(Number)) {
  const figs = await p.evaluate((T) => { window.REEL.probe = { figures: [], moves: {}, transitions: {}, type: {}, palettes: {}, byLine: {} }; window.__reel.at(T); return window.REEL.probe.figures.filter((f) => f.h >= 0.1); }, T);
  for (const f of figs) { const A = lab(f.fig), B = lab(f.bg); const cA = Math.hypot(A[1], A[2]), cB = Math.hypot(B[1], B[2]); let hg = Math.abs(Math.atan2(A[2], A[1]) - Math.atan2(B[2], B[1])) * 180 / Math.PI; if (hg > 180) hg = 360 - hg; const same = cA > 14 && cB > 14 && hg < 25, dE = Math.hypot(A[0] - B[0], A[1] - B[1], A[2] - B[2]), dL = Math.abs(A[0] - B[0]); console.log(T, f.id, 'dE', dE.toFixed(1), 'dL', dL.toFixed(1), same ? 'SAME-HUE' : '', (dE < 20 || (same && dL < 25)) ? 'FAIL' : (dE < 23 || (same && dL < 28)) ? 'NEAR' : 'ok'); }
}
await reel.close();
