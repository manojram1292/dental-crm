/* Ep 16 · line "next" · the short, silent Next card: a glimpse of episode 17, "The Wager" (a new arc): the sisters face to face, the horse between them. */
(function () {
  'use strict';
  const KIT = window.KIT, EP11 = window.EP11;
  const CH = KIT.characters;
  function glimpse(g, T) {
    EP11.shore(g, T, { horse: { x: 560, y: 1160, scale: 0.36, pose: 'stand' }, after: (q) => {
      CH.kadru.draw(q, { x: 300, y: 1700, scale: 0.8, facing: 'right', pose: { name: 'point', k: 1 }, light: { dir: -0.5, intensity: 1, front: 0.4 }, t: T, key: 'nx16-kd' });
      CH.vinata.draw(q, { x: 800, y: 1700, scale: 0.78, facing: 'left', pose: 'stand', light: { dir: -2.6, intensity: 1, front: 0.4 }, t: T, key: 'nx16-vn' });
    } });
  }
  KIT.series.loopNextScene({ id: 'next', picture: glimpse, focus: [560, 1300], zoom: 0.62 });
})();
