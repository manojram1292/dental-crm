/* Ep 39 · line "next" · the arc's serpent cartouche over the cliffhanger image (the king's choice), then the loop. */
(function () {
  'use strict';
  const KIT = window.KIT, EP39 = window.EP39;
  KIT.series.overlayNextScene({ id: 'next', y: 300, style: 'serpent', picture: (ctx, T, env, t) => EP39.word(ctx, T, 3 + t) });
})();
