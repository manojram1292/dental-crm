/* Ep 36 · line "rejoiced" · "Vasuki rejoiced, and honoured his sister." · Wide: Vasuki bows his great hood to her; serpents bring jewels that glint round her; the lamplight warms. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP34 = window.EP34, EP35 = window.EP35, EP36 = window.EP36;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'rejoiced',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, bow = E.inOutSine(clamp((t - env.beats[0] + 0.3) / 0.8)), p = clamp(t / env.dur);
      EPA.hall(ctx, T, { mood: 'gold', cam: { zoom: 1.2 + 0.05 * p, dy: -420 }, after: (g) => {
        CH.nagini.draw(g, { x: 700, y: 1660, scale: 0.68, facing: 'left', pose: { name: 'stand' }, light: EP34.lamp(700, 1400, 540, 1500, 1.2), t: T, key: 'r36-ng' });
        CH.vasuki.draw(g, { x: 260, y: 1720, scale: 0.6, facing: 'right', pose: { name: 'rise', k: lerp(1, 0.6, bow) }, light: EP34.lamp(260, 1400, 540, 1500, 1.1), t: T, key: 'r36-va' });
        for (let i = 0; i < 6; i++) { const x = 560 + i * 60, y = 1680 + (i % 2) * 20; g.fillStyle = i % 2 ? '#ff4a6a' : '#7a8aff'; g.globalAlpha = clamp((t - 0.6 - i * 0.2) / 0.3); g.beginPath(); g.arc(x, y, 9, 0, Math.PI * 2); g.fill(); KIT.glow(g, x, y, 30, g.fillStyle, 0.6 * g.globalAlpha); }
        g.globalAlpha = 1;
      } });
    },
    post: () => ({ bloom: 0.44, vignette: 0.48, paper: 0.3 }),
  });
})();
