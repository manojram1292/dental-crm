/* Ep 36 · line "next" · the arc's serpent cartouche over the cliffhanger image (the king asking), then the loop. */
(function () {
  'use strict';
  const KIT = window.KIT, EP36 = window.EP36;
  KIT.series.overlayNextScene({ id: 'next', y: 320, style: 'serpent', picture: (ctx, T, env, t) => EP36.ask(ctx, T, 5 + t, 0) });
})();
