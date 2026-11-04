/* Ep 16 · line "recap" · RECAP · episode 15's last image as a memory: the enchantress turning gold, the hosts raising weapons. */
(function () {
  'use strict';
  const KIT = window.KIT, EP15 = window.EP15;
  const CH = KIT.characters;
  function picture(g, T) {
    EP15.dusk(g, T, { after: (q) => {
      CH.enchantress.draw(q, { x: 560, y: 1820, scale: 0.9, facing: 'left', pose: { name: 'carry', reveal: 1 }, light: EP15.duskLight(560, 1820, 1.1), t: T, key: 'r16-en' });
      for (let i = 0; i < 3; i++) CH.asura.draw(q, { x: 1000 - i * 120, y: 1990, scale: 0.86, facing: 'left', index: i * 2, pose: { name: 'raise', k: 1 }, light: EP15.duskLight(1000, 1990), t: T + i, key: 'r16-a' + i });
    } });
  }
  KIT.series.recapScene({ id: 'recap', focus: [600, 1350], zoom: 0.6, picture, fadeIn: 0.3 });
})();
