// Trailer v3 · the gate's figure-against-ground numbers for chosen shots, every 0.1 s.  node lab/review/trailer/v3/figprobe.mjs id[,id] [all]
import { openReel } from '../../../../tools/lib.mjs';
const ids = process.argv[2].split(','), all = process.argv[3] === 'all';
const reel = await openReel({ scale: 0.125, lang: 'en', ep: 97, grain: 0 });
const lab = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; const R_ = f(r), G_ = f(g), B_ = f(b), X = (0.4124 * R_ + 0.3576 * G_ + 0.1805 * B_) / 0.95047, Y = 0.2126 * R_ + 0.7152 * G_ + 0.0722 * B_, Z = (0.0193 * R_ + 0.1192 * G_ + 0.9505 * B_) / 1.08883, q = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116); return [116 * q(Y) - 16, 500 * (q(X) - q(Y)), 200 * (q(Y) - q(Z))]; };
for (const l of reel.info.lines.filter((l) => ids.includes(l.id))) {
  const rows = await reel.pages[0].evaluate(([a, b]) => { const out = []; window.REEL.probe = { figures: [], moves: {}, transitions: {}, type: {}, palettes: {}, byLine: {} };
    for (let t = a; t < b; t += 0.1) { window.REEL.probe.figures = []; window.__reel.at(t); for (const f of window.REEL.probe.figures) if (f.h >= 0.1) out.push({ t: +(t - a).toFixed(2), ...f }); } return out; }, [l.start, l.end]);
  for (const f of rows) { const A = lab(f.fig), B = lab(f.bg); f.dE = +Math.hypot(A[0] - B[0], A[1] - B[1], A[2] - B[2]).toFixed(1); f.dL = +(A[0] - B[0]).toFixed(1); }
  const bad = rows.filter((f) => f.dE < 20 && Math.abs(f.dL) < 25);
  console.log(l.id, rows.length, 'samples;', bad.length, 'under the rule:', (all ? rows : bad).map((f) => `${f.t}s ${f.id} dE ${f.dE} dL ${f.dL} h ${f.h} fig ${f.fig.map(Math.round)} bg ${f.bg.map(Math.round)}`).join(' | '));
}
await reel.close();
