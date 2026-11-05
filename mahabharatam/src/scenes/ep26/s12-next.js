/* Ep 26 · line "next" · the short Next over the cliffhanger image (fire and the wheel), then the loop. */
(function () {
  'use strict';
  const KIT = window.KIT, EP26 = window.EP26;
  KIT.series.overlayNextScene({ id: 'next', y: 1660, picture: (ctx, T, env, t) => EP26.ring(ctx, T, 5 + t, 0, 0) });
})();
