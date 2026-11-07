/* Ep 37 · line "test" · Takshaka speaks · "Heal what I bite, if you can." · Takshaka large and green, his hood over the healer (a high-low two-shot), the great banyan behind them. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP36 = window.EP36, EP37 = window.EP37, EP8 = window.EP8;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'test',
    fadeIn: 0.15,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      EP37.road(ctx, T, { cam: { zoom: 1.2 + 0.05 * p, dy: -200 }, after: (g) => {
        EP37.banyan(g, 820, 1450, 0.75, T, {});
        CH.healer.draw(g, { x: 240, y: 1720, scale: 0.5, facing: 'right', pose: { name: 'stand' }, light: EP37.noonLit(240, 1720), t: T, key: 't37-he' });
        CH.takshaka.draw(g, { x: 560, y: 2000, scale: 0.95, facing: 'left', pose: { name: 'speak', k: 1 }, expression: { speak: EPA.mouth(env, t) }, light: EP37.noonLit(560, 1780, 1.2), t: T, key: 't37-tk' });
      } });
    },
    post: () => ({ bloom: 0.42, vignette: 0.46, paper: 0.3 }),
  });
})();
