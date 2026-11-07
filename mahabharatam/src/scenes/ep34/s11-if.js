/* Ep 34 · line "if" · Jaratkaru speaks · "If you ever displease me, I will leave." · Low angle up at the sage in the gold hall, his finger raised; the lamps behind him go still. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP34 = window.EP34, EP33 = window.EP33;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'if',
    fadeIn: 0.15,
    draw(ctx, t, env) {
      const T = env.T, p = E.inOutSine(clamp(t / env.dur));
      EPA.hall(ctx, T, { mood: 'gold', cam: { zoom: lerp(1.6, 1.75, p), dy: -80, dx: -60 }, after: (g) => {
        CH.jaratkaru.draw(g, { x: 520, y: 2050, scale: 1.25, facing: 'right', pose: { name: 'send', k: E.inOutSine(clamp((t - 0.2) / 0.6)) }, expression: { speak: EPA.mouth(env, t) }, light: EP34.lamp(520, 1700, 800, 1500, 1.15), t: T, key: 'i34-jk' });
      } });
    },
    post: () => ({ bloom: 0.42, vignette: 0.52, paper: 0.3 }),
  });
})();
