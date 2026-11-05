/* Ep 21 · line "next" · the short Next (≤ 1.2 s): the cliffhanger image keeps playing (the coal in his throat) under the NEXT › band, then dissolves into frame 1. */
(function () {
  'use strict';
  const KIT = window.KIT, EP21 = window.EP21;
  KIT.series.overlayNextScene({ id: 'next', y: 1200, picture: (ctx, T, env, t) => EP21.dive(ctx, T, 5 + t, 3) });
})();
