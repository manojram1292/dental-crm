/* Ep 35 · line "gone" · "And he was gone." · The empty doorway; his shadow slides out of it; she stands alone in the last red light (a held, but moving, wide: the light fades). */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP34 = window.EP34, EP35 = window.EP35;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'gone',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      EP34.chamber(ctx, T, { sun: 0.9 - 0.6 * p, lampX: 980, cam: { zoom: 1.2 - 0.05 * p, dy: -400 }, after: (g) => {
        g.fillStyle = '#05030a'; g.beginPath(); g.moveTo(80, 1700); g.lineTo(80, 1050); g.quadraticCurveTo(230, 900, 380, 1050); g.lineTo(380, 1700); g.fill();
        g.save(); g.globalAlpha = 0.5 * (1 - p); g.fillStyle = '#000'; g.beginPath(); g.ellipse(lerp(300, 80, p), 1700, 160, 26, 0, 0, Math.PI * 2); g.fill(); g.restore();
        CH.nagini.draw(g, { x: 760, y: 1720, scale: 0.62, facing: 'left', pose: { name: 'cradle', k: 1 }, light: EP34.lamp(760, 1500, 980, 1560, 1.15), t: T, key: 'g35-ng' });
        EP35.flame(g, 708, 1350, 0.8, T, 0.9);
      } });
    },
    post: () => ({ bloom: 0.44, vignette: 0.52, paper: 0.3 }),
  });
})();
