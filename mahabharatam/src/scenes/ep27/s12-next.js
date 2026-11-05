/* Ep 27 · line "next" · the short Next over the cliffhanger image (Garuda meets Vishnu), then the loop. */
(function () {
  'use strict';
  const KIT = window.KIT, EP27 = window.EP27;
  KIT.series.overlayNextScene({ id: 'next', y: 1100, picture: (ctx, T, env, t) => EP27.meet(ctx, T, 3 + t, 0) });
})();
