/* Ep 19 · line "next" · the short, silent Next card: a glimpse of episode 20: Garuda flying high with the serpents on his back toward the sun. */
(function () {
  'use strict';
  const KIT = window.KIT, EP17 = window.EP17;
  const CH = KIT.characters;
  function glimpse(g, T) {
    EP17.ocean(g, T, { hz: 1500, after: (q) => {
      KIT.glow(q, 860, 420, 300, '#fff0c0', 0.9);
      CH.garuda.draw(q, { x: 520, y: 1300, scale: 0.55, facing: 'left', pose: { name: 'fly', phase: T * 4 }, light: { dir: -0.6, intensity: 1.1, front: 0.5 }, t: T, key: 'nx19-ga' });
      for (let i = 0; i < 3; i++) CH.naga.draw(q, { x: 560 + i * 60, y: 860 + i * 20, scale: 0.2, facing: 'left', index: i, pose: 'coil', light: { dir: -0.6, intensity: 1, front: 0.4 }, t: T, key: 'nx19-n' + i });
    } });
  }
  KIT.series.loopNextScene({ id: 'next', picture: glimpse, focus: [560, 1000], zoom: 0.55 });
})();
