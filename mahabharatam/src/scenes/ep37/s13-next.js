/* Ep 37 · line "next" · the arc's serpent cartouche over the cliffhanger image (Vasuki pulled toward the fire), then the loop. */
(function () {
  'use strict';
  const KIT = window.KIT, EP37 = window.EP37;
  KIT.series.overlayNextScene({ id: 'next', y: 300, style: 'serpent', picture: (ctx, T, env, t) => EP37.pull(ctx, T, 5 + t, 0) });
})();
