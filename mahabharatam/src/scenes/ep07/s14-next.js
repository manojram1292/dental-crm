/*
 * Ep 7 · line "next" · the series "Next" card (KIT.series.nextScene) with a glimpse of
 * episode 8: the priests' great fire, serpents drawn down through the air into it.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP6 = window.EP6;
  const { hash, lerp } = R;
  const CH = KIT.characters;

  function glimpse(g, T) {
    KIT.vgrad(g, 0, R.H, [[0, '#0a0410'], [0.5, '#3a1006'], [1, '#0a0302']]);
    KIT.glow(g, 540, 1300, 900, '#ff6a1a', 0.5);
    const base = KIT.fire.altar(g, 540, 1340, 420, T, { light: 1 });
    KIT.fire.draw(g, 540, base + 2, 700, T, { intensity: 1.2, width: 520, seed: 31 });
    for (let i = 0; i < 12; i++) {
      const ph = (T * 0.5 + hash(i, 3)) % 1;
      EP6.snake(g, 160 + hash(i, 4) * 760, lerp(150, 1250, ph), 120 + hash(i, 5) * 120, Math.PI / 2 + (hash(i, 6) - 0.5), T, i, { w: 18, fill: '#1a0402', rim: 'rgba(255,170,80,0.75)' });
    }
    for (const [x, i] of [[230, 2], [850, 5]]) CH.sage.draw(g, { x, y: 1500, scale: 0.42, facing: 'back', index: i, pose: 'sit', light: { dir: x < 540 ? 0 : Math.PI, intensity: 1, front: 0 }, t: T, key: 'n7-s' + i });
  }

  KIT.series.nextScene({ id: 'next', picture: glimpse, focus: [540, 1050], zoom: 0.62 });
})();
