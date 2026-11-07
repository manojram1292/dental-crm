/* Ep 38 · line "next" · the arc's serpent cartouche over the cliffhanger image (the priests call Takshaka), then the loop. */
(function () {
  'use strict';
  const KIT = window.KIT, EP38 = window.EP38;
  KIT.series.overlayNextScene({ id: 'next', y: 360, style: 'serpent', picture: (ctx, T, env, t) => EP38.call(ctx, T, 4.5 + t, 0) });
})();
