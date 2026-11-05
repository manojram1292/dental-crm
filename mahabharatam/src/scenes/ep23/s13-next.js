/* Ep 23 · line "next" · the short Next over the cliffhanger image (the hanging sages), then the loop. */
(function () {
  'use strict';
  const KIT = window.KIT, EP23 = window.EP23;
  KIT.series.overlayNextScene({ id: 'next', y: 1420, picture: (ctx, T, env, t) => EP23.cliffShot(ctx, T, 4 + t, 0) });
})();
