/*
 * Ep 10 · line "rise" · "Then Aruna rose into the sky, to drive the chariot of the Sun."
 *
 * NEW LIGHT: the open sky at dawn (EP10.sky). Aruna rises (rise) on "rose" (beats[1]); the
 * Sun's chariot comes up over the eastern ridge: the gold disc-wheel and seven horses of
 * light, Surya radiant within the disc; on "Sun" (beats[2]) Aruna takes the reins (rein).
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP10 = window.EP10;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'rise',
    fadeIn: 0.6,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b1 = env.beats[1] ?? 0.9, b2 = env.beats[2] ?? 4.5;
      const up = E.inOutSine(clamp((t - (b1 - 0.4)) / 2.4));
      const sun = E.outCubic(clamp((t - 1.2) / (b2 - 1.0)));
      const rein = E.inOutCubic(clamp((t - (b2 - 0.5)) / 0.7));
      EP10.sky(ctx, T, {
        red: 0.25 + 0.4 * sun, cam: { zoom: 1.0 },
        after: (g) => {
          const cx = lerp(900, 760, sun), cy = lerp(1700, 1020, sun);
          EP10.chariot(g, cx, cy, 0.75, T, { a: clamp(sun * 1.4) });
          if (sun > 0.05) CH.surya.draw(g, { x: cx, y: cy + 180, scale: 0.3, facing: 'front', pose: 'stand', light: { dir: -Math.PI / 2, intensity: 1.2, front: 0.6 }, t: T, alpha: clamp(sun * 1.4), key: 'r10-su' });
          const ax = lerp(420, lerp(420, cx - 300, rein), 1), ay = lerp(1900, 1120, up);
          CH.aruna.draw(g, { x: ax, y: ay, scale: 0.8, facing: 'left', pose: rein > 0.01 ? { name: 'rein', k: rein } : { name: 'rise', k: up }, light: { dir: Math.atan2(cy - ay, cx - ax), intensity: 1.2, front: 0.4 }, t: T, key: 'r10-ar' });
        },
      });
      void p;
    },
    post: () => ({ bloom: 0.55, vignette: 0.4, paper: 0.3 }),
  });
})();
