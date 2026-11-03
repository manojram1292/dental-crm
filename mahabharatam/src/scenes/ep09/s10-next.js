/*
 * Ep 9 · line "next" · the series "Next" card with a glimpse of episode 10, "The Broken
 * Egg": a cracked rose-red egg, red light pouring from it, and the first dawn.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP9 = window.EP9;

  function glimpse(g, T) {
    KIT.vgrad(g, 0, R.H, [[0, '#1a0a1a'], [0.5, '#6a1a2a'], [0.75, '#ff7a4a'], [1, '#2a0a0a']]);
    KIT.glow(g, 540, 1100, 900, '#ff5a3a', 0.55);
    EP9.egg(g, 540, 1080, 230, 'rose', T, { glow: 0.8, crack: 1 });
    for (let i = 0; i < 9; i++) {
      const a = -Math.PI / 2 + (i - 4) * 0.22;
      g.save(); g.globalAlpha = 0.35; g.strokeStyle = '#ffb090'; g.lineWidth = 8;
      g.beginPath(); g.moveTo(540 + Math.cos(a) * 260, 1060 + Math.sin(a) * 260); g.lineTo(540 + Math.cos(a) * 760, 1060 + Math.sin(a) * 760); g.stroke(); g.restore();
    }
  }
  KIT.series.nextScene({ id: 'next', picture: glimpse, focus: [540, 1000], zoom: 0.62 });
})();
