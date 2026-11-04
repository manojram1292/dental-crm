/* Ep 19 · line "recap" · RECAP · episode 18's image as a memory: Vinata bowed in slavery, Kadru over her. */
(function () {
  'use strict';
  const KIT = window.KIT, EP11 = window.EP11;
  const CH = KIT.characters;
  function picture(g, T) {
    EP11.shore(g, T, { after: (q) => {
      const L = { dir: -2.4, intensity: 1.05, front: 0.42 };
      CH.kadru.draw(q, { x: 330, y: 2000, scale: 1.12, facing: 'right', pose: 'stand', expression: { mood: 'wrath' }, light: L, t: T, key: 'r19-kd' });
      CH.vinata.draw(q, { x: 780, y: 2000, scale: 1.05, facing: 'left', pose: { name: 'bow', k: 1, slave: true }, light: L, t: T, key: 'r19-vn' });
    } });
  }
  KIT.series.recapScene({ id: 'recap', focus: [560, 1500], zoom: 0.62, picture, fadeIn: 0.3 });
})();
