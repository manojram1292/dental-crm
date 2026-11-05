/* Ep 25 · line "next" · the short Next over the cliffhanger image (Garuda climbing toward heaven), then the loop. */
(function () {
  'use strict';
  const KIT = window.KIT, EP25 = window.EP25;
  KIT.series.overlayNextScene({ id: 'next', y: 1100, picture: (ctx, T, env, t) => EP25.climb(ctx, T, 3.2 + t) });
})();
