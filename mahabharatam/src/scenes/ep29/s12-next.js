/* Ep 29 · line "next" · the short Next over the cliffhanger image (the dive, Indra following), then the loop. */
(function () {
  'use strict';
  const KIT = window.KIT, EP29 = window.EP29;
  KIT.series.overlayNextScene({ id: 'next', y: 1700, picture: (ctx, T, env, t) => EP29.down(ctx, T, 3.4 + t * 0.3, 0) });
})();
