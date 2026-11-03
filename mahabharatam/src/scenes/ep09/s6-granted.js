/*
 * Ep 9 · line "granted" · Kashyapa: "So be it. Guard them well."
 *
 * Kashyapa, large, blesses both on "So" (beats[0]); then he rises and walks away into the
 * forest with his staff while the sisters bow (beats[1], "well").
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP9 = window.EP9;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'granted',
    fadeIn: 0.4,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b0 = env.beats[0] ?? 0.1, b1 = env.beats[1] ?? 2.2;
      const bl = E.inOutCubic(clamp((t - b0) / 0.6)) * (1 - clamp((t - (b1 - 0.4)) / 0.4));
      const go = clamp((t - (b1 - 0.2)) / (dur - b1 + 0.2));
      EP9.hermitage(ctx, T, {
        glow: 0.75, cam: { zoom: 1.12 + 0.03 * p, dy: -10 },
        after: (g) => {
          CH.kadru.draw(g, { x: 190, y: 1640, scale: 0.84, facing: 'right', pose: 'stand', light: EP9.light(190, 1640), t: T, key: 'g9-kd' });
          CH.vinata.draw(g, { x: 900, y: 1640, scale: 0.82, facing: 'left', pose: { name: 'bow', k: clamp((t - b1 + 0.6) / 0.6) }, light: EP9.light(900, 1640), t: T, key: 'g9-vn' });
          if (go <= 0.01) CH.kashyapa.draw(g, { x: 540, y: 1560, scale: 0.9, facing: 'left', pose: { name: 'bless', base: 'sit', k: bl }, expression: { speak: EP9.mouth(env, t) }, light: EP9.light(540, 1560), t: T, key: 'g9-ks' });
          else CH.kashyapa.draw(g, { x: lerp(540, 300, go), y: lerp(1560, 1420, go), scale: lerp(0.9, 0.55, go), facing: 'left', pose: { name: 'walk', phase: T * 4, stride: 0.6 }, light: EP9.light(540, 1560), t: T, alpha: 1 - clamp((go - 0.6) / 0.4), key: 'g9-ks' });
        },
      });
    },
    post: () => ({ bloom: 0.36, vignette: 0.42, paper: 0.34 }),
  });
})();
