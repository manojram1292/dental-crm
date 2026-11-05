/* Ep 28 · line "next" · the short Next over the cliffhanger image (the vajra in flight), then the loop. */
(function () {
  'use strict';
  const KIT = window.KIT, EP28 = window.EP28;
  KIT.series.overlayNextScene({ id: 'next', y: 1660, picture: (ctx, T, env, t) => EP28.hurl(ctx, T, 1.6 + t * 0.3, 1.4) });
})();
