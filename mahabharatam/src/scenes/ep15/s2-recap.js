/* Ep 15 · line "recap" · RECAP · episode 14's last image as a memory: the asuras crowding toward Dhanvantari's pot. */
(function () {
  'use strict';
  const KIT = window.KIT, EP13 = window.EP13;
  const CH = KIT.characters;
  function picture(g, T) {
    EP13.whiteSea(g, T, { hz: 1350, after: (q) => {
      CH.dhanvantari.draw(q, { x: 300, y: 1800, scale: 0.85, facing: 'front', pose: { name: 'offer', k: 0.5 }, light: EP13.seaGlow(300, 1700, 1.1), t: T, key: 'r15-dh' });
      for (let i = 2; i >= 0; i--) CH.asura.draw(q, { x: 800 + i * 150, y: 2020 + i * 20, scale: 1.05 - i * 0.08, facing: 'left', index: [2, 0, 5][i], pose: i === 0 ? { name: 'point', k: 1 } : 'stand', expression: { mood: 'wrath' }, light: { dir: Math.PI + 0.2, intensity: 1.1, front: 0.45 }, t: T + i, key: 'r15-a' + i });
    } });
  }
  KIT.series.recapScene({ id: 'recap', focus: [600, 1350], zoom: 0.6, picture, fadeIn: 0.3 });
})();
