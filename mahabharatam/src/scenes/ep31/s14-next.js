/* Ep 31 · line "next" · the short Next over the cliffhanger image (Vasuki's council gathering), then the loop. */
(function () {
  'use strict';
  const KIT = window.KIT, EPA = window.EPA;
  KIT.series.overlayNextScene({ id: 'next', y: 700, style: 'serpent', picture: (ctx, T, env, t) => EPA.council31(ctx, T, 5 + t, 0) });
})();
