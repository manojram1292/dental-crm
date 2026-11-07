/* Ep 33 · line "next" · the arc's serpent cartouche over the cliffhanger image (the serpents watching), then the loop. */
(function () {
  'use strict';
  const KIT = window.KIT, EP33 = window.EP33;
  KIT.series.overlayNextScene({ id: 'next', y: 1000, style: 'serpent', picture: (ctx, T, env, t) => EP33.waiting(ctx, T, 4.5 + t, 0) });
})();
