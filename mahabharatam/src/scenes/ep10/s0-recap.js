/*
 * Ep 10 · line "recap" · RECAP · "Kadru's thousand eggs hatched. Vinata's two did not."
 * The series recap card: episode 9's key image as a memory: Kadru's jars cracking, small
 * serpents rising; Vinata by her two silent jars.
 */
(function () {
  'use strict';
  const KIT = window.KIT, EP8 = window.EP8, EP9 = window.EP9;
  const { hash, lerp } = window.REEL;
  const CH = KIT.characters;
  function picture(g, T) {
    EP9.hermitage(g, T, {
      glow: 0.9,
      after: (q) => {
        for (let i = 0; i < 4; i++) EP9.jar(q, 120 + i * 130, 1520, 0.62, T, { kind: 'serpent', crack: 1, glow: 0.4 });
        for (let i = 0; i < 12; i++) EP8.serpent(q, 120 + (i % 4) * 130, lerp(1300, 1150, hash(i, 2)), 80, -Math.PI / 2 + (hash(i, 94) - 0.5) * 1.4, T, i, { kind: i, w: 9, hood: i % 3 === 0 });
        CH.kadru.draw(q, { x: 320, y: 1640, scale: 0.86, facing: 'right', pose: 'stand', light: EP9.light(320, 1640), t: T, key: 'r10-kd' });
        EP9.jar(q, 760, 1640, 0.85, T, { kind: 'rose', glow: 0.5 });
        EP9.jar(q, 930, 1660, 0.85, T, { kind: 'gold', glow: 0.5 });
        CH.vinata.draw(q, { x: 1000, y: 1700, scale: 0.86, facing: 'left', pose: { name: 'grieve', k: 0.6 }, light: EP9.light(1000, 1700), t: T, key: 'r10-vn' });
      },
    });
  }
  KIT.series.recapScene({ id: 'recap', focus: [560, 1250], zoom: 0.72, picture });
})();
