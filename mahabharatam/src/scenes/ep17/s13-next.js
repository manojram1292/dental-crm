/* Ep 17 · line "next" · the short, silent Next card: a glimpse of episode 18: the horse's tail streaked with black. */
(function () {
  'use strict';
  const KIT = window.KIT, EP11 = window.EP11;
  function glimpse(g, T) { EP11.shore(g, T, { horse: { x: 520, y: 1400, scale: 0.75, pose: { name: 'stand', tail: 1, wind: 1 } } }); }
  KIT.series.loopNextScene({ id: 'next', picture: glimpse, focus: [620, 1050], zoom: 0.6 });
})();
