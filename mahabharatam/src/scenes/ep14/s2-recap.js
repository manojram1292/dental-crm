/* Ep 14 · line "recap" · RECAP · episode 13's key image as a memory: Dhanvantari rising with the pot of amrita. */
(function () {
  'use strict';
  const KIT = window.KIT, EP13 = window.EP13;
  const CH = KIT.characters;
  function picture(g, T) {
    EP13.whiteSea(g, T, { hz: 1250, after: (q) => { CH.dhanvantari.draw(q, { x: 540, y: 1820, scale: 1.1, facing: 'front', pose: { name: 'offer', k: 1 }, light: EP13.seaGlow(540, 1700, 1.1), t: T, key: 'r14-dh' }); window.EP11.surf(q, 1780, T, 1, { color: '#ffffff', deep: '#ecebf8', deep2: '#b8b8d8' }); } });
  }
  KIT.series.recapScene({ id: 'recap', focus: [540, 1200], zoom: 0.62, picture, fadeIn: 0.3 });
})();
