/*
 * Ep 8 · line "recap" · RECAP · "Takshaka killed King Parikshit with his venom."
 * The series recap card: episode 7's key image as a memory: in the pavilion on one
 * pillar, the serpent king rises over the falling king; the venom-fire.
 */
(function () {
  'use strict';
  const KIT = window.KIT, EP7 = window.EP7;
  const CH = KIT.characters;
  function picture(g, T) {
    EP7.pavilion(g, T, {
      sky: 1, burn: 0.45,
      after: (q) => {
        CH.takshaka.draw(q, { x: 430, y: 1720, scale: 0.95, facing: 'right', pose: { name: 'strike', k: 0.8 }, expression: { mood: 'wrath' }, light: { dir: -Math.PI / 2 + 0.5, intensity: 1.2, front: 0.15 }, t: T, key: 'r8-tk' });
        CH.parikshit.draw(q, { x: 820, y: 2050, scale: 1.3, facing: 'left', pose: { name: 'fall', k: 0.8 }, light: { dir: Math.PI + 0.3, intensity: 1.3, front: 0.2 }, t: T, key: 'r8-pk' });
      },
    });
  }
  KIT.series.recapScene({ id: 'recap', focus: [560, 1100], zoom: 0.72, picture });
})();
