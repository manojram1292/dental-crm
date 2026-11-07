/* Ep 34 · line "search" · "Jaratkaru searched the world, and found no bride." · A long road over the plain at evening (episode 33's wilderness, later and wider): the sage tiny, walking; doors of a village closing as he passes; a push in. Recap band at the top. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP34 = window.EP34, EP33 = window.EP33;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'search',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, p = E.inOutSine(clamp(t / env.dur));
      EP33.wild(ctx, T, { trees: [[1000, 1360, 0.6]], cam: { zoom: lerp(0.9, 1.25, p), dx: lerp(80, -20, p) }, after: (g) => {
        for (let i = 0; i < 4; i++) { const x = 150 + i * 160, y = 1370; g.fillStyle = '#2a1608'; g.fillRect(x - 60, y - 110, 120, 110); g.beginPath(); g.moveTo(x - 75, y - 110); g.lineTo(x, y - 180); g.lineTo(x + 75, y - 110); g.fill(); const shut = clamp((t - 0.6 - i * 0.5) / 0.3); g.fillStyle = R.mix('#ffb050', '#1a0c04', shut); g.fillRect(x - 18, y - 70, 36, 70); }
        CH.jaratkaru.draw(g, { x: lerp(820, 700, p), y: 1540, scale: 0.42, facing: 'left', pose: { name: 'walk', phase: T * 2.4 }, light: EP33.duskLight(760, 1540, 1.1), t: T, key: 's34-jk' });
      } });
      KIT.series.recapBand(ctx, T, clamp(t / 0.3) * (1 - clamp((t - 2.4) / 0.3)), env.strings, { y: 300 });
    },
    post: () => ({ bloom: 0.38, vignette: 0.46, paper: 0.32 }),
  });
})();
