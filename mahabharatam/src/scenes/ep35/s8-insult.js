/* Ep 35 · line "insult" · THE TURN · Jaratkaru speaks · "The sun would not dare to set while I slept. I am leaving." · After the 0.9 s silence: low angle, the sage standing huge against the window's red shaft; she kneels small at the edge (a high-low, not a side-by-side, two-shot). */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP34 = window.EP34, EP35 = window.EP35;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'insult',
    fadeIn: 0.1,
    draw(ctx, t, env) {
      const T = env.T, p = E.inOutSine(clamp(t / env.dur));
      EP34.chamber(ctx, T, { sun: 1, cam: { zoom: lerp(1.25, 1.35, p), dx: -80, dy: -420 }, after: (g) => {
        CH.nagini.draw(g, { x: 880, y: 1560, scale: 0.45, facing: 'left', pose: { name: 'sit' }, light: EP35.red(880, 1500, 1.1), t: T, key: 'i35-ng' });
        CH.jaratkaru.draw(g, { x: 380, y: 1950, scale: 1.2, facing: 'right', pose: { name: 'send', k: E.inOutSine(clamp((t - env.beats[1]) / 0.5)) }, expression: { speak: EPA.mouth(env, t) }, light: EP35.red(380, 1500, 1.25), t: T, key: 'i35-jk' });
      } });
    },
    post: () => ({ bloom: 0.44, vignette: 0.52, paper: 0.3 }),
  });
})();
