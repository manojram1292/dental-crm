/* Ep 38 · line "told" · "His sister told her son why he had been born." · The mother kneels to the boy, hands on his shoulders, in a pool of lamplight away from the red; faint medallions of the sage and the bride (episode 32's) behind them. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP8 = window.EP8, EP34 = window.EP34, EP37 = window.EP37, EP38 = window.EP38;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'told',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, p = E.inOutSine(clamp(t / env.dur));
      EPA.hall(ctx, T, { mood: 'gold', cam: { zoom: lerp(1.5, 1.6, p), dy: -560 }, after: (g) => {
        CH.nagini.draw(g, { x: 660, y: 1720, scale: 0.85, facing: 'left', pose: { name: 'sit' }, light: EP34.lamp(660, 1450, 900, 1400, 1.2), t: T, key: 't38-ng' });
        CH.astika.draw(g, { x: 400, y: 1720, scale: 0.62, facing: 'right', pose: { name: 'stand' }, light: EP34.lamp(400, 1450, 900, 1400, 1.2), t: T, key: 't38-as' });
      } });
      const a = 0.5 * Math.sin(clamp(t / env.dur) * Math.PI);
      window.EP32.medal(ctx, 260, 560, 110, a, 'sage', T, 't38-m1');
      window.EP32.medal(ctx, 820, 560, 110, a, 'bride', T, 't38-m2');
    },
    post: () => ({ bloom: 0.44, vignette: 0.5, paper: 0.3 }),
  });
})();
