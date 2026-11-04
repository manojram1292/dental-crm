/*
 * Ep 14 · line "hold" · THE REVEAL · "He did not swallow it. He held it in his throat."
 * A slow push in to his throat (the camera closes from chest to throat); after the rest, on
 * "held" (beats[1]) a deep blue glow gathers there and stays (beats[2] "throat": a deep bell);
 * the line holds 0.85 s on it. The blue becomes the key light. Tagged.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP13 = window.EP13, EP14 = window.EP14;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'hold',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b1 = env.beats[1] ?? 1.8;
      const th = E.inOutSine(clamp((t - b1 + 0.2) / 1.2));
      const z = lerp(1.35, 2.7, E.inOutSine(p));
      ctx.save();
      KIT.camera(ctx, { x: 540, y: 1960 - 836 * 1.18, zoom: z, dy: lerp(60, 260, E.inOutSine(p)) });
      EP13.whiteSea(ctx, T, {
        hz: 1700, dark: 0.55,
        after: (g) => {
          KIT.glow(g, 540, 1960 - 836 * 1.18, 520, '#3a7aff', 0.6 * th);
          CH.shiva.draw(g, { x: 540, y: 1960, scale: 1.18, facing: 'front', pose: { name: 'drink', k: 1 - 0.4 * th, throat: th }, light: { dir: -Math.PI / 2, intensity: 1.05, front: 0.5 }, t: T, key: 'o14-sh' });
        },
      });
      ctx.restore();
      EP14.tag(ctx, T, 1, env.strings);
    },
    post: () => ({ bloom: 0.5, vignette: 0.58, paper: 0.3 }),
  });
})();
