/*
 * Ep 10 · line "next" · the series "Next" card with a glimpse of episode 11, "The Horse
 * from the Ocean": the white horse Uchchaihshravas rising from the shining ocean of milk.
 */
(function () {
  'use strict';
  const KIT = window.KIT, EP10 = window.EP10;
  function glimpse(g, T) { EP10.shore(g, T, { horse: 1 }); }
  KIT.series.nextScene({ id: 'next', picture: glimpse, focus: [560, 1000], zoom: 0.62 });
})();
