/*
 * Ep 5 · line "recap" · RECAP · "The story was first told at King Janamejaya's sacrifice."
 * The series recap card (KIT.series.recapScene): episode 4's last image as a memory —
 * the king enthroned by the great fire of his sacrifice at night, Vaishampayana seated
 * across the fire, reciting, the priests in a ring.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT;
  const { TAU, hash } = R;
  const CH = KIT.characters;

  function sacrificeAtNight(g, T) {
    KIT.vgrad(g, 0, R.H, [[0, '#07061a'], [0.5, '#1a1230'], [0.62, '#2a1418'], [1, '#0c0605']]);
    for (let i = 0; i < 70; i++) { g.fillStyle = `rgba(255,240,220,${(0.25 + 0.5 * hash(i, 2)).toFixed(2)})`; g.beginPath(); g.arc(hash(i, 3) * 1080, hash(i, 4) * 800, 1 + hash(i, 5) * 1.6, 0, TAU); g.fill(); }
    const fx = 540, fy = 1120, fl = KIT.flicker(T, 2);
    KIT.fire.pool(g, fx, fy + 40, 760, 260, T, 1.2);
    const base = KIT.fire.altar(g, fx, fy, 300, T, { light: 1 });
    KIT.fire.draw(g, fx, base + 2, 420, T, { intensity: 1.15, seed: 8 });
    KIT.smoke.draw(g, fx, base - 380, T, { h: 700, w: 60, strands: 4, alpha: 0.35, color: '#a89ab4', speed: 0.8, seed: 4 });
    const toFire = (x, y) => ({ dir: Math.atan2(fy - 200 - y, fx - x), intensity: fl, front: 0.3 });
    for (let i = 0; i < 4; i++) CH.sage.draw(g, { x: 170 + i * 250 + (i > 1 ? 80 : -80), y: 1010, scale: 0.3, index: i + 2, facing: 'front', pose: 'sit', light: { ...toFire(170 + i * 250, 900), front: 0.5 }, t: T, key: 'rc5-s' + i });
    CH.janamejaya.draw(g, { x: 220, y: 1440, scale: 0.55, facing: 'right', pose: 'sit', light: toFire(220, 1100), t: T, key: 'rc5-king' });
    if (CH.vaishampayana) CH.vaishampayana.draw(g, { x: 850, y: 1440, scale: 0.55, facing: 'left', pose: { name: 'speak', base: 'sit', k: 0.8 }, light: toFire(850, 1100), t: T, key: 'rc5-v' });
  }

  KIT.series.recapScene({ id: 'recap', focus: [540, 1080], zoom: 0.78, picture: sacrificeAtNight });
})();
