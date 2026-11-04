/* Ep 20 · line "command" · the serpents: "Bird, carry us to another island, with clear water!" · NEW LIGHT: Ramaniyaka at noon. The serpents rear round Garuda on the beach, ordering him; he stands among them, wings half-folded. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP20 = window.EP20;
  const { clamp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'command',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      EP20.island(ctx, T, { cam: { zoom: 1.6, dy: -420 + 30 * p }, after: (g) => {
        CH.garuda.draw(g, { x: 560, y: 1330, scale: 0.4, facing: 'left', pose: 'stand', light: EP20.noon(560, 1330), t: T, key: 'c20-ga' });
        for (let i = 0; i < 6; i++) { const x = [300, 380, 440, 690, 760, 830][i], y = 1330 + (i % 2) * 20; CH.naga.draw(g, { x, y, scale: 0.2, facing: x < 560 ? 'right' : 'left', index: i, pose: { name: 'rise', k: 0.8 + 0.2 * Math.sin(T * 2 + i) }, expression: { speak: EP20.mouth(env, t) }, light: EP20.noon(x, y), t: T + i, key: 'c20-n' + i }); }
      } });
    },
    post: () => ({ bloom: 0.36, vignette: 0.36, paper: 0.32 }),
  });
})();
