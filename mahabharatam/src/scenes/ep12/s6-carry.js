/*
 * Ep 12 · line "carry" · "Gods and asuras carried it to the shore of the sea."
 *
 * Evening on the shore (EP12.procession): the two hosts, alternating deva and asura, carry
 * the mountain high on their raised arms from left to right toward the sea, the camera
 * tracking; warm horizon light, the night-blue sea.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP12 = window.EP12;
  const { clamp, E } = R;

  R.scene({
    id: 'carry',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      EP12.procession(ctx, T, { p: E.inOutSine(clamp(0.1 + 0.9 * t / dur)), cam: { zoom: 1.0 } });
    },
    post: () => ({ bloom: 0.38, vignette: 0.42, paper: 0.32 }),
  });
})();
