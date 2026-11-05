/* Ep 0 · line "deeper" · "If you walk with us, longer episodes will follow, and go deeper." · Dawn over the sea: Garuda flies away from us toward the rising light, then turns and comes on, larger (the long road ahead). */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP17 = window.EP17;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'deeper',
    fadeIn: 0.35,
    draw(ctx, t, env) {
      const T = env.T, p = E.inOutSine(clamp(t / env.dur));
      EP17.ocean(ctx, T, { hz: 1050, cam: { zoom: 1.0 + 0.05 * p }, after: (g) => {
        KIT.glow(g, 540, 1040, 700, '#ffe0a0', 0.6, 'lighter', 0.4);
        g.fillStyle = '#fff2c8'; g.beginPath(); g.arc(540, 1030, 90 + 30 * p, Math.PI, 0); g.fill();
        CH.garuda.draw(g, { x: lerp(780, 520, p), y: lerp(1500, 1900, p), scale: lerp(0.32, 0.62, p), facing: 'left', pose: { name: 'fly', phase: T * 3.6 }, light: { dir: -Math.PI / 2 - 0.4, intensity: 1.15, front: 0.6 }, t: T, key: 'd0-ga' });
      } });
    },
    post: () => ({ bloom: 0.42, vignette: 0.42, paper: 0.3 }),
  });
})();
