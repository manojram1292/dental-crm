/* Ep 24 · line "next" · the short Next over the cliffhanger image (Indra under the omens), then the loop. */
(function () {
  'use strict';
  const KIT = window.KIT, EP24 = window.EP24;
  KIT.series.overlayNextScene({ id: 'next', y: 1200, picture: (ctx, T, env, t) => EP24.omens(ctx, T, 5 + t, 0) });
})();
