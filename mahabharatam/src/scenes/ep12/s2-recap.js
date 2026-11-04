/*
 * Ep 12 · line "recap" · RECAP · "Narayana told the gods and asuras: churn the ocean together."
 * Episode 11's key image as a memory: Narayana in his aureole on Meru, Brahma beside him.
 */
(function () {
  'use strict';
  const KIT = window.KIT, EP11 = window.EP11;
  const CH = KIT.characters;
  function picture(g, T) {
    EP11.meru(g, T, { cam: { zoom: 1.6, dy: 600 } });
    CH.brahma.draw(g, { x: 230, y: 1700, scale: 0.42, facing: 'front', pose: 'sit', light: { dir: 0, intensity: 1, front: 0.55 }, t: T, key: 'r12-br' });
    CH.vishnu.draw(g, { x: 620, y: 1760, scale: 0.85, facing: 'front', pose: { name: 'speak', k: 1 }, light: { dir: -Math.PI / 2, intensity: 1.05, front: 0.5 }, t: T, key: 'r12-vi' });
  }
  KIT.series.recapScene({ id: 'recap', focus: [540, 1150], zoom: 0.62, picture, fadeIn: 0.3 });
})();
