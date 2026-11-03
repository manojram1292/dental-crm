/*
 * Ep 8 · line "next" · the series "Next" card with a glimpse of episode 9, "Two Wives,
 * Two Wishes": the two sisters, Kadru and Vinata, at Kashyapa's hermitage, a thousand
 * eggs gleaming on one side and two great eggs on the other.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT;
  const { hash, TAU } = R;
  const CH = KIT.characters;

  function egg(g, x, y, r, col, glow) {
    KIT.glow(g, x, y, r * 3, col, glow);
    const gr = g.createRadialGradient(x - r * 0.3, y - r * 0.4, r * 0.1, x, y, r * 1.2);
    gr.addColorStop(0, '#fffaf0'); gr.addColorStop(0.6, col); gr.addColorStop(1, '#3a2a1a');
    g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, r * 0.8, r, 0, 0, TAU); g.fill();
  }
  function glimpse(g, T) {
    KIT.vgrad(g, 0, R.H, [[0, '#1a1a3a'], [0.55, '#6a4a6a'], [0.8, '#d8a070'], [1, '#2a1a10']]);
    KIT.glow(g, 540, 1100, 800, '#ffd8a0', 0.4);
    for (let i = 0; i < 90; i++) egg(g, 80 + hash(i, 1) * 380, 1330 + hash(i, 2) * 200, 12 + hash(i, 3) * 6, '#a8c070', 0.08);
    egg(g, 720, 1380, 70, '#ffe0b0', 0.4); egg(g, 860, 1400, 70, '#ffe0b0', 0.4);
    CH.kadru.draw(g, { x: 280, y: 1320, scale: 0.6, facing: 'right', pose: 'stand', light: { dir: 0, intensity: 1, front: 0.3 }, t: T, key: 'n8-kd' });
    CH.vinata.draw(g, { x: 800, y: 1320, scale: 0.58, facing: 'left', pose: { name: 'cradle', k: 0.6 }, light: { dir: Math.PI, intensity: 1, front: 0.3 }, t: T, key: 'n8-vn' });
  }

  KIT.series.nextScene({ id: 'next', picture: glimpse, focus: [540, 1050], zoom: 0.6 });
})();
