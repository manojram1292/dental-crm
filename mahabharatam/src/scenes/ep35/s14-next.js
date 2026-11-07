/* Ep 35 · line "next" · the arc's serpent cartouche over the cliffhanger image (the boy, the far red fire), then the loop. */
(function () {
  'use strict';
  const KIT = window.KIT, EP35 = window.EP35;
  KIT.series.overlayNextScene({ id: 'next', y: 420, style: 'serpent', picture: (ctx, T, env, t) => EP35.near(ctx, T, 4 + t, 0) });
})();
