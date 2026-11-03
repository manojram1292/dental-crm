/*
 * Ep 5 · line "next" · the series "Next" card (KIT.series.nextScene) with a glimpse of
 * episode 6: in the blue-green dark of the Naga world, Takshaka's hoods rear over the two
 * earrings, which burn gold.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT;
  const CH = KIT.characters;

  function glimpse(g, T) {
    KIT.vgrad(g, 0, R.H, [[0, '#020a0a'], [0.5, '#06302a'], [1, '#020806']]);
    for (let i = 0; i < 40; i++) { const x = R.hash(i, 1) * 1080, y = 500 + R.hash(i, 2) * 1100; KIT.glow(g, x, y + Math.sin(T + i) * 10, 30 + R.hash(i, 3) * 40, '#40ffb0', 0.15 + 0.15 * Math.sin(T * 2 + i)); }
    KIT.glow(g, 540, 1000, 700, '#20c880', 0.25);
    CH.takshaka.draw(g, { x: 470, y: 1640, scale: 0.85, facing: 'left', pose: { name: 'strike', k: 0.5 }, expression: { mood: 'wrath' }, light: { dir: -Math.PI / 2, intensity: 1, front: 0.1 }, t: T, key: 'n5-tk' });
    KIT.kundala.pair(g, 400, 1250, 70, T, { glow: 1.2 });
  }

  KIT.series.nextScene({ id: 'next', picture: glimpse, focus: [500, 1100], zoom: 0.52 });
})();
