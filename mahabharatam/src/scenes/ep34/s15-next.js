/* Ep 34 · line "next" · the arc's serpent cartouche over the cliffhanger image (the sunset reaching the sleeper), then the loop. */
(function () {
  'use strict';
  const KIT = window.KIT, EP34 = window.EP34;
  KIT.series.overlayNextScene({ id: 'next', y: 360, style: 'serpent', picture: (ctx, T, env, t) => EP34.sunset(ctx, T, 4 + t, 0) });
})();
