/* Ep 40 · line "next" · the arc's serpent cartouche, its last time, over the cliffhanger image (the next arc in the smoke), then the loop. */
(function () {
  'use strict';
  const KIT = window.KIT, EP40 = window.EP40;
  KIT.series.overlayNextScene({ id: 'next', y: 300, style: 'serpent', picture: (ctx, T, env, t) => EP40.next(ctx, T, 4.5 + t) });
})();
