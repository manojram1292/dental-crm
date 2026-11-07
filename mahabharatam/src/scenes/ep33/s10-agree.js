/* Ep 33 · line "agree" · Jaratkaru speaks · "For your sake, I will marry. On conditions." · NEW LIGHT, first grey-rose dawn over the pit's rim: he kneels at the edge, large, the morning behind him. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP33 = window.EP33;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'agree',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, p = E.inOutSine(clamp(t / env.dur));
      EP33.wild(ctx, T, { dawn: 1, trees: [[160, 1380, 0.9]], cam: { zoom: lerp(1.25, 1.35, p), dy: -160 }, after: (g) => {
        g.fillStyle = '#06050a'; g.beginPath(); g.ellipse(400, 1640, 340, 70, 0, 0, Math.PI * 2); g.fill();
        CH.jaratkaru.draw(g, { x: 680, y: 1660, scale: 0.95, facing: 'left', pose: { name: 'sit' }, expression: { speak: EPA.mouth(env, t) }, light: { dir: Math.atan2(1200 - 1000, 900 - 680), intensity: 1.1, front: 0.7, fill: 0.5 }, t: T, key: 'g33-jk' });
      } });
    },
    post: () => ({ bloom: 0.42, vignette: 0.44, paper: 0.32 }),
  });
})();
