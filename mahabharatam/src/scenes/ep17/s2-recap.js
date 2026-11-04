/* Ep 17 · line "recap" · RECAP · episode 16's closing image as a memory: the white horse on the shore at sunrise. */
(function () {
  'use strict';
  const KIT = window.KIT, EP11 = window.EP11;
  function picture(g, T) { EP11.shore(g, T, { horse: { x: 560, y: 1250, scale: 0.6, pose: { name: 'walk', phase: T * 3 } } }); }
  KIT.series.recapScene({ id: 'recap', focus: [560, 1000], zoom: 0.62, picture, fadeIn: 0.3 });
})();
