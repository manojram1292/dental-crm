/* Ep 22 · line "next" · the short Next over the cliffhanger image (the brothers fighting in the vision), then the loop. */
(function () {
  'use strict';
  const KIT = window.KIT, EP22 = window.EP22;
  KIT.series.overlayNextScene({ id: 'next', y: 1420, picture: (ctx, T, env, t) => EP22.vision(ctx, T, 5 + t, 1) });
})();
