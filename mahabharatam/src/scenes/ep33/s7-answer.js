/* Ep 33 · line "answer" · the ancestors speak as one · "We are the Yayavaras. Our last son will not marry." · Seen from below, upside down, against the moon disc at the pit's mouth; plaque. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP33 = window.EP33;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'answer',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, p = E.inOutSine(clamp(t / env.dur));
      EP33.pit(ctx, T, { view: 'up', cam: { zoom: lerp(1.05, 1.18, p), dy: 60 }, after: (g) => {
        EP33.tuft(g, 540, 430, 1.0, T, { roots: 1 });
        for (let i = 0; i < 3; i++) { const x = 540 + (i - 1) * 240, y = 560 + Math.abs(i - 1) * 40; EP33.hanging(g, x, y, 0.62, T, i, { light: { dir: -Math.PI / 2, intensity: 1.1, front: 0.7, fill: 0.5 }, key: 'an33-p' }); }
      } });
      EPA.plaque(ctx, env.strings.yayName, env.strings.yayEpithet, KIT.CX, 300, clamp((t - env.beats[0] - 0.1) / 0.3) * (1 - clamp((t - env.dur + 0.4) / 0.3)), { size: 50, key: 'an33-pl' });
    },
    post: () => ({ bloom: 0.46, vignette: 0.52, paper: 0.3 }),
  });
})();
