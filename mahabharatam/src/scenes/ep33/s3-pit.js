/* Ep 33 · line "pit" · "One day he came upon a pit." · NEW LIGHT, top-light: from inside the pit looking up: the ascetic small at the lip against the moon, the cold shaft past him; a slow tilt up. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP33 = window.EP33;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'pit',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, p = E.inOutSine(clamp(t / env.dur)), lean = E.inOutSine(clamp((t - env.beats[1] + 0.6) / 0.6));
      EP33.pit(ctx, T, { view: 'up', cam: { zoom: lerp(0.95, 1.1, p), dy: lerp(200, 0, p) }, after: (g) => {
        g.save(); g.translate(560, 560); g.rotate(Math.PI * 0.0);
        CH.jaratkaru.draw(g, { x: 0, y: 0, scale: 0.55, facing: 'left', pose: { name: 'grieve', k: 0.3 * lean }, light: { dir: Math.PI / 2, intensity: 1, front: 0.7, fill: 0.5 }, t: T, key: 'p33-jk' });
        g.restore();
        EP33.tuft(g, 460, 560, 1.0, T, { roots: 1 });
      } });
    },
    post: () => ({ bloom: 0.4, vignette: 0.55, paper: 0.3 }),
  });
})();
