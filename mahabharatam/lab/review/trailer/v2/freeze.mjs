// Trailer v2 · the gate's freeze measure on chosen shots only (fast iteration).  node lab/review/trailer/v2/freeze.mjs [id,id,…]
// Mean |frame − previous| at 135×240, 30 frames a second, no grain; a run under 0.765 grey levels (0.3 % of full scale) for over 0.3 s is a freeze.
import { openReel } from '../../../../tools/lib.mjs';
const ids = process.argv[2] ? process.argv[2].split(',') : null;
const reel = await openReel({ scale: 0.125, lang: 'en', ep: 97, grain: 0 });
const lines = reel.info.lines.filter((l) => !ids || ids.includes(l.id));
for (const l of lines) {
  const n = Math.floor((l.end - l.start) * 30) - 1, f0 = Math.ceil(l.start * 30);
  const d = await reel.pages[0].evaluate(([f0, n]) => { const c = window.__reelCanvas, g = c.getContext('2d'); let prev = null; const out = [];
    for (let i = 0; i < n; i++) { window.__reel.at((f0 + i) / 30); const d = g.getImageData(0, 0, c.width, c.height).data, a = new Float32Array(c.width * c.height); for (let j = 0, k = 0; j < d.length; j += 4, k++) a[k] = 0.299 * d[j] + 0.587 * d[j + 1] + 0.114 * d[j + 2];
      if (prev) { let s = 0; for (let k = 0; k < a.length; k++) s += Math.abs(a[k] - prev[k]); out.push(s / a.length); } prev = a; } return out; }, [f0, n]);
  const fr = []; let r0 = -1;
  for (let i = 0; i <= d.length; i++) { const low = i < d.length && d[i] < 0.765; if (low && r0 < 0) r0 = i; if (!low && r0 >= 0) { if ((i - r0) / 30 > 0.3) fr.push(`${((f0 + r0) / 30).toFixed(2)}+${((i - r0) / 30).toFixed(2)}`); r0 = -1; } }
  const s = [...d].sort((a, b) => a - b);
  console.log(l.id.padEnd(8), 'min', s[0].toFixed(2), 'p10', s[Math.floor(s.length * 0.1)].toFixed(2), 'median', s[s.length >> 1].toFixed(2), fr.length ? 'FREEZES ' + fr.join(' ') : 'ok');
}
const errs = await reel.drainErrors(); if (errs.length) console.log(errs.slice(0, 5));
await reel.close();
