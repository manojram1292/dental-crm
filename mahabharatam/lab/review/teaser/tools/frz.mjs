// node lab/review/teaser/tools/frz.mjs a-b,c-d ...  : the gate's trailer freeze measure (1/8 size, no grain, 30 fps) on chosen windows
import { openReel } from '../../../../tools/lib.mjs';
const wins = process.argv.slice(2).map((s) => s.split('-').map(Number));
const reel = await openReel({ scale: 0.125, ep: 96, grain: 0 }); const p = reel.pages[0];
for (const [a, b] of wins) {
  const d = await p.evaluate(([a, b]) => { const c = window.__reelCanvas, g = c.getContext('2d'); let prev = null; const out = [];
    for (let i = Math.round(a * 30); i < Math.round(b * 30); i++) { window.__reel.at(i / 30); const d = g.getImageData(0, 0, c.width, c.height).data, x = new Float32Array(c.width * c.height);
      for (let j = 0, k = 0; j < d.length; j += 4, k++) x[k] = 0.299 * d[j] + 0.587 * d[j + 1] + 0.114 * d[j + 2];
      if (prev) { let s = 0; for (let k = 0; k < x.length; k++) s += Math.abs(x[k] - prev[k]); out.push(s / x.length); } prev = x; } return out; }, [a, b]);
  let run = 0, worst = 0; for (const v of d) { if (v < 0.765) { run++; worst = Math.max(worst, run); } else run = 0; }
  console.log(`${a}-${b}: median diff ${[...d].sort((x, y) => x - y)[d.length >> 1].toFixed(2)}, longest run under 0.765: ${(worst / 30).toFixed(2)} s`);
}
await reel.close();
