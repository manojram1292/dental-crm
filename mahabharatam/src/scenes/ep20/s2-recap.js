/* Ep 20 · line "recap" · RECAP · episode 19's image as a memory: Garuda bowing before Vinata on the shore. */
(function () {
  'use strict';
  const KIT = window.KIT, EP11 = window.EP11;
  const CH = KIT.characters;
  function picture(g, T) {
    EP11.shore(g, T, { after: (q) => {
      const L = { dir: -2.4, intensity: 1.05, front: 0.45 };
      CH.vinata.draw(q, { x: 330, y: 2000, scale: 1.0, facing: 'right', pose: { name: 'bow', k: 0.6, slave: true }, light: L, t: T, key: 'r20-vn' });
      CH.garuda.draw(q, { x: 800, y: 2000, scale: 0.7, facing: 'left', pose: { name: 'bow', k: 0.6 }, light: L, t: T, key: 'r20-ga' });
    } });
  }
  KIT.series.recapScene({ id: 'recap', focus: [560, 1450], zoom: 0.6, picture, fadeIn: 0.3 });
})();
