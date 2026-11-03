/*
 * Ep 6 · line "next" · the series "Next" card (KIT.series.nextScene) with a glimpse of
 * episode 7: the great fire of the snake sacrifice, serpents falling into it from the sky.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP6 = window.EP6;
  const { hash, lerp } = R;

  function glimpse(g, T) {
    KIT.vgrad(g, 0, R.H, [[0, '#120404'], [0.5, '#4a1206'], [1, '#0a0302']]);
    KIT.glow(g, 540, 1300, 900, '#ff6a1a', 0.5);
    const base = KIT.fire.altar(g, 540, 1340, 420, T, { light: 1 });
    KIT.fire.draw(g, 540, base + 2, 700, T, { intensity: 1.2, width: 520, seed: 23 });
    for (let i = 0; i < 10; i++) {
      const ph = (T * 0.5 + hash(i, 3)) % 1;
      EP6.snake(g, 200 + hash(i, 4) * 680, lerp(200, 1250, ph), 140 + hash(i, 5) * 100, Math.PI / 2 + (hash(i, 6) - 0.5), T, i, { w: 20, fill: '#1a0402', rim: 'rgba(255,170,80,0.7)' });
    }
  }

  KIT.series.nextScene({ id: 'next', picture: glimpse, focus: [540, 1000], zoom: 0.62 });
})();
