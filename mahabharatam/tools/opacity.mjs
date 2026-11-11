#!/usr/bin/env node
/*
 * Two checks on the picture of an episode built with KIT.stage.shot (episode 41 on; the visual review's B1 and M1):
 *   OPACITY      at each sampled time the figures' plane (z 0.9–1.2) is drawn alone over two different grounds to find its opaque
 *                pixels, then the frame is drawn with everything behind it: no such pixel may change (max channel difference ≤ 2).
 *   MOVING HOLD  the figures' plane alone, 1 s apart: the mean change over the figure pixels must not be zero anywhere
 *                (a frozen figure reads as a stalled video); reports the stillest second.
 *   node tools/opacity.mjs --ep 99 [--step 0.5]
 */
import { args, openReel } from './lib.mjs';
const a = args(), ep = +(a.ep || 99), step = +(a.step || 0.5);
const reel = await openReel({ scale: 0.25, ep, grain: 0, post: false, captions: false });
const D = reel.info.DURATION;
const r = await reel.pages[0].evaluate(([D, step]) => {
  const R = window.REEL, ST = window.KIT.stage, c = window.__reelCanvas, g = c.getContext('2d');
  const grab = (T, only) => { ST.debugOnly = only; R.renderContent(g, T); ST.debugOnly = null; return g.getImageData(0, 0, c.width, c.height).data; };
  const out = { worst: 0, at: 0, n: 0, still: 1e9, stillAt: 0 };
  for (let T = 0.3; T < D - 1.2; T += step) {
    if (R.lines[R.lineIndexAt(T)].start > T - 0.9 || R.lines[R.lineIndexAt(T + 1)].id !== R.lines[R.lineIndexAt(T)].id) continue;   // not inside a transition, and both frames in one shot
    const soot = R.PAL.soot; R.PAL.soot = '#ff00ff'; const none = grab(T, [0.9, 1.2]); R.PAL.soot = soot;   // the same plane over magenta: a pixel that does not change is opaque paint
    const fig = grab(T, [0.9, 1.2]), full = grab(T, [0, 1.2]), front = fig, fig2 = grab(T + 1, [0.9, 1.2]);
    let mx = 0, n = 0, mv = 0;
    for (let i = 0; i < fig.length; i += 4) {
      if (Math.abs(fig[i] - none[i]) + Math.abs(fig[i + 1] - none[i + 1]) + Math.abs(fig[i + 2] - none[i + 2]) > 0) continue;   // not opaque paint of the figures' plane
      n++; mx = Math.max(mx, Math.abs(full[i] - front[i]), Math.abs(full[i + 1] - front[i + 1]), Math.abs(full[i + 2] - front[i + 2]));
      mv += Math.abs(fig[i] - fig2[i]) + Math.abs(fig[i + 1] - fig2[i + 1]) + Math.abs(fig[i + 2] - fig2[i + 2]);
    }
    if (n < 200) continue;
    out.n++; if (mx > out.worst) { out.worst = mx; out.at = T; }
    if (mv / n / 3 < out.still) { out.still = mv / n / 3; out.stillAt = T; }
  }
  return out;
}, [D, step]);
console.log(`opacity ep ${ep}: ${r.n} frames sampled · worst change of a figure pixel when the background is added: ${r.worst} / 255${r.worst > 2 ? ` at ${r.at.toFixed(1)} s  FAIL` : '  ok'}`);
console.log(`moving hold: the stillest second of any figure plane changes ${r.still.toFixed(2)} grey levels per figure pixel (at ${r.stillAt.toFixed(1)} s)${r.still < 0.4 ? '  FAIL (frozen)' : '  ok'}`);
await reel.close();
process.exitCode = r.worst > 2 || r.still < 0.4 ? 1 : 0;
