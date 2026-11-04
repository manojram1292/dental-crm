/*
 * Ep 11 · line "recap" · RECAP (after the cold open, short) · "Vinata's son Aruna became the red of dawn."
 * Episode 10's key image as a memory: Aruna at the reins of the Sun's chariot in a red sky.
 */
(function () {
  'use strict';
  const KIT = window.KIT, EP10 = window.EP10;
  const CH = KIT.characters;
  function picture(g, T) {
    EP10.sky(g, T, {
      red: 1,
      after: (q) => {
        EP10.chariot(q, 640, 900, 0.8, T, { a: 1 });
        CH.aruna.draw(q, { x: 420, y: 1250, scale: 0.7, facing: 'left', pose: { name: 'rein', k: 1 }, light: { dir: 0, intensity: 1.1, front: 0.4 }, t: T, key: 'r11-ar' });
      },
    });
  }
  KIT.series.recapScene({ id: 'recap', focus: [560, 1000], zoom: 0.7, picture, fadeIn: 0.3 });
})();
