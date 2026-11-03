/*
 * Ep 7 · line "recap" · RECAP · "Uttanka urged King Janamejaya to avenge his father."
 * The series recap card: episode 6's key image as a memory: Uttanka points at the enthroned
 * king in the saffron court, a cold green hood rising in the lamp smoke over a fallen crown.
 */
(function () {
  'use strict';
  const KIT = window.KIT, EP6 = window.EP6;
  const CH = KIT.characters;
  function picture(g, T) {
    EP6.court(g, T, {
      cam: { zoom: 1.15, dx: 10, dy: -80 },
      after: (q) => {
        EP6.fallenCrown(q, 560, 1450, 0.7, 0.9);
        KIT.glow(q, 560, 1050, 420, '#20c880', 0.3);
        EP6.ghost(q, 0.5, (v) => CH.takshaka.draw(v, { x: 590, y: 1520, scale: 0.55, facing: 'left', pose: { name: 'strike', k: 0.3 }, expression: { mood: 'wrath' }, light: { dir: -Math.PI / 2, intensity: 1, front: 0 }, t: T, key: 'r7-tk' }), 'r7-g', 'screen');
        CH.janamejaya.draw(q, { x: 270, y: 1480, scale: 0.62, facing: 'right', pose: 'sit', expression: { look: 0.04, mood: 'wrath' }, light: EP6.light(270, 1100, 240, 980, 1, 0.3), t: T, key: 'r7-king' });
        CH.uttanka.draw(q, { x: 840, y: 1500, scale: 0.62, facing: 'left', pose: { name: 'point', k: 1 }, expression: { mood: 'wrath' }, light: EP6.light(840, 1100, 860, 980, 1, 0.25), t: T, key: 'r7-u' });
      },
    });
  }
  KIT.series.recapScene({ id: 'recap', focus: [560, 1130], zoom: 0.78, picture });
})();
