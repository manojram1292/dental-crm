/* Ep 32 · line "next" · the short Next (the arc's serpent cartouche) over the cliffhanger image, then the loop. */
(function () {
  'use strict';
  const KIT = window.KIT, EP32 = window.EP32;
  KIT.series.overlayNextScene({ id: 'next', y: 560, style: 'serpent', picture: (ctx, T, env, t) => EP32.watch(ctx, T, 5.5 + t) });
})();
