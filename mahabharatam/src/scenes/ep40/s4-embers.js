/* Ep 40 · line "embers" · "And the great fire sank into embers." · NEW LIGHT, the enclosure after the fire: the flames drop to embers, grey smoke thins, a cool blue dusk comes down over the posts; the serpent's rings fade above. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP8 = window.EP8, EP34 = window.EP34, EP37 = window.EP37, EP38 = window.EP38, EP39 = window.EP39, EP40 = window.EP40;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'embers',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, k = E.inOutSine(clamp(t / env.dur * 1.2));
      EP40.embers(ctx, T, { k, cam: { zoom: lerp(1.0, 1.08, k), dy: -140 } });
    },
    post: () => ({ bloom: 0.42, vignette: 0.48, paper: 0.3 }),
  });
})();
