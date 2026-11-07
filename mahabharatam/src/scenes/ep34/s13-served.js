/* Ep 34 · line "served" · "She served him with great care, and watched over his sleep." · NEW LIGHT, their chamber at evening (violet, one lamp): the sage asleep on a mat, his head on her lap; she keeps watch; a slow drift. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP34 = window.EP34, EP33 = window.EP33;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  EP34.sleep = (g, T, o = {}) => {
    CH.nagini.draw(g, { x: 400, y: 1700, scale: 0.72, facing: 'right', pose: { name: 'sit' }, expression: { look: o.look ?? 0.25 }, light: EP34.lamp(400, 1500, 860, 1560, 1.15), t: T, key: 'sl34-ng' });
    g.save(); g.translate(1060, 1690); g.rotate(-Math.PI / 2);
    CH.jaratkaru.draw(g, { x: 0, y: 0, scale: 0.55, facing: 'left', pose: { name: 'stand' }, light: { dir: 0, intensity: 1.0, front: 0.6, fill: 0.4 }, t: 0, key: 'sl34-jk' });
    g.restore();
  };
  R.scene({
    id: 'served',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, p = E.inOutSine(clamp(t / env.dur));
      EP34.chamber(ctx, T, { cam: { zoom: lerp(1.3, 1.4, p), dx: lerp(-20, 60, p) + 40, dy: -680 }, after: (g) => EP34.sleep(g, T) });
    },
    post: () => ({ bloom: 0.42, vignette: 0.5, paper: 0.3 }),
  });
})();
