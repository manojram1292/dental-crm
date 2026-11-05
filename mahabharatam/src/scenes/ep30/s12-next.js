/* Ep 30 · line "next" · the short Next over the cliffhanger image (the grove under the curse), then the loop. */
(function () {
  'use strict';
  const KIT = window.KIT, EP30 = window.EP30;
  KIT.series.overlayNextScene({ id: 'next', y: 1200, picture: (ctx, T, env, t) => EP30.curse(ctx, T, 4 + t, 0) });
})();
