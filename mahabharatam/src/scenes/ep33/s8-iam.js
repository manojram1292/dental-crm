/* Ep 33 · line "iam" · THE TURN · "I am that son. I am Jaratkaru." · After the 0.9 s silence: the camera rises up the shaft to the ascetic's face at the lip, frontal-ish, lit gold-white from the glow below; the hanging faces turn up. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP33 = window.EP33;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'iam',
    fadeIn: 0.15,
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0], rise = E.inOutSine(clamp((t - 0.2) / 1.6)), lit = E.outCubic(clamp((t - b0 + 0.3) / 0.6));
      EP33.pit(ctx, T, { view: 'up', cam: { zoom: lerp(1.0, 1.7, rise), dy: lerp(0, 330, rise) }, after: (g) => {
        KIT.glow(g, 560, 560, 400, '#ffe8c0', 0.5 * lit);
        CH.jaratkaru.draw(g, { x: 600, y: 760, scale: 0.6, facing: 'left', pose: { name: 'bless', k: 0.3 * lit }, expression: { speak: EPA.mouth(env, t) }, light: { dir: Math.PI / 2, intensity: 1.2, front: 0.85, fill: 0.55 }, t: T, key: 'i33-jk' });
        EP33.tuft(g, 440, 760, 1.0, T, { roots: 1 });
        for (let i = 0; i < 3; i++) EP33.hanging(g, 380 + i * 110, 960, 0.4, T, i, { light: { dir: -Math.PI / 2, intensity: 1, front: 0.6, fill: 0.4 }, key: 'i33-p' });
      } });
    },
    post: () => ({ bloom: 0.46, vignette: 0.5, paper: 0.3 }),
  });
})();
