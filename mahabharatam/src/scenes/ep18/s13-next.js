/* Ep 18 · line "next" · the short, silent Next card: a glimpse of episode 19: Garuda rising, wings spread, blazing. */
(function () {
  'use strict';
  const KIT = window.KIT, EP10 = window.EP10;
  const CH = KIT.characters;
  function glimpse(g, T) {
    EP10.sky(g, T, { red: 1, after: (q) => CH.garuda.draw(q, { x: 560, y: 1700, scale: 0.6, facing: 'left', pose: { name: 'spread', k: 1, blaze: 0.8 }, light: { dir: -Math.PI / 2, intensity: 1.1, front: 0.5 }, t: T, key: 'nx18-ga' }) });
  }
  KIT.series.loopNextScene({ id: 'next', picture: glimpse, focus: [560, 1100], zoom: 0.5 });
})();
