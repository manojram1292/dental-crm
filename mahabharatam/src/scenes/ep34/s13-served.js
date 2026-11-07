/* Ep 34 · line "served" · "She served him with great care, and watched over his sleep." · NEW LIGHT, their chamber at evening (violet, one lamp): the sage asleep on a mat, his head on her lap; she keeps watch; a slow drift. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP34 = window.EP34, EP33 = window.EP33;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
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
