/* Ep 17 · line "refuse" · THE TURN · "Some of her sons refused." · After a rest: a row of her serpent sons turn their hoods away from her, one by one (beats[0]). */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP17 = window.EP17;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'refuse',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const b0 = env.beats[0] ?? 1.2;
      EP17.grove(ctx, T, { cam: { zoom: 1.15, dy: -60 }, after: (g) => {
        for (let i = 0; i < 5; i++) {
          const turn = E.inOutCubic(clamp((t - b0 + 0.8 - i * 0.22) / 0.4)), x = 160 + i * 190;
          CH.naga.draw(g, { x, y: 1880, scale: 0.62, facing: turn > 0.5 ? 'right' : 'left', index: i + 1, pose: { name: 'rise', k: 0.9 }, expression: { look: 0.2 * turn }, light: EP17.moonLight(x, 1880, 1.05), t: T + i, key: 'f17-n' + i });
        }
      } });
      void dur;
    },
    post: () => ({ bloom: 0.42, vignette: 0.55, paper: 0.32 }),
  });
})();
