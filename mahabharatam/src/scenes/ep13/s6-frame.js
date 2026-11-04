/*
 * Ep 13 · line "frame" · FRAME (Sauti, standing) · "One by one, the wonders rose."
 * A third angle on the Naimisha fire: wide and a little from above, Sauti STANDING at the
 * left to tell it, his hand rising with the words; the sages around the fire look up as
 * sparks lift from it on "rose" (beats[1]).
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP13 = window.EP13;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'frame',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b1 = env.beats[1] ?? 1.6;
      const fl = KIT.flicker(T, 0), F = KIT.ashram.FIRE;
      const k = E.inOutCubic(clamp(t / 1.2)), sp = E.outCubic(clamp((t - b1 + 0.2) / 0.6));
      KIT.ashram.draw(ctx, T, {
        cycle: 0.8, speed: 0, hide: [5, 6], turn: () => -0.35 * sp,
        smoke: { alpha: 0.35, lean: 4 }, fireH: 250 + 80 * sp,
        cam: { zoom: 1.08 + 0.05 * p, dx: 30, dy: 20 },
        after: (g) => {
          CH.sauti.draw(g, { x: 200, y: 1720, scale: 1.0, facing: 'right', pose: { name: 'speak', base: 'stand', k }, expression: { look: -0.15, speak: EP13.mouth(env, t) }, light: { dir: Math.atan2(F.y - 1200, F.x - 200), intensity: fl * 1.15, front: 0.45 }, t: T, key: 'f13-sauti' });
          KIT.embers(g, T, { x: F.x, y: F.y - 60, spread: 160, rate: 10 + 30 * sp, life: 2.4, rise: 600, sway: 60, size: 3, alpha: 0.9, seed: 1301 });
        },
      });
    },
    post: () => ({ bloom: 0.42, vignette: 0.5, paper: 0.32 }),
  });
})();
