/* Ep 19 · line "dim" · "He heard them, and drew in his fire." · The blaze draws back into him (blaze 1 → 0), the sky cools from red to dawn; his wings fold halfway (beats[1]). */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP10 = window.EP10;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'dim',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const b1 = env.beats[1] ?? 1.6;
      const d = E.inOutSine(clamp((t - b1 + 1.0) / 1.6));
      EP10.sky(ctx, T, { red: lerp(1, 0.5, d), cam: { zoom: 1.15, dy: -100 }, after: (g) => {
        KIT.glow(g, 540, 1300, 1500, '#ff7a20', 0.7 * (1 - d));
        CH.garuda.draw(g, { x: 560, y: 1800, scale: 0.8, facing: 'left', pose: { name: 'spread', k: lerp(1, 0.45, d), blaze: 1 - d }, light: { dir: -Math.PI / 2 - 0.4, intensity: 1.1, front: 0.6 }, t: T, key: 'd19-ga' });
      } });
      void dur;
    },
    post: () => ({ bloom: 0.44, vignette: 0.42, paper: 0.3 }),
  });
})();
