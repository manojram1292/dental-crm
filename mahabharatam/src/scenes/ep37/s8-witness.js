/* Ep 37 · line "witness" · "A man had climbed it for firewood. He burned, and came back with it." · Close in the regrown branches: the woodman sits up whole, his bundle on his back, blinking in the green-gold light (the hook's eye, explained). */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP36 = window.EP36, EP37 = window.EP37, EP8 = window.EP8;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'witness',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, p = E.inOutSine(clamp(t / env.dur)), up = E.outCubic(clamp((t - env.beats[1] + 0.3) / 0.7));
      EP37.road(ctx, T, { green: 0.6, greenAt: [560, 900], cam: { zoom: 1.0 }, after: (g) => {
        g.fillStyle = '#2a6a1a';
        for (let i = 0; i < 12; i++) { const x = 100 + (i * 173) % 900, y = 200 + (i * 211) % 900; g.beginPath(); g.ellipse(x, y, 300, 160, (i % 3 - 1) * 0.4, 0, Math.PI * 2); g.fill(); }
        g.strokeStyle = '#3a2410'; g.lineWidth = 60; g.beginPath(); g.moveTo(-100, 1450); g.quadraticCurveTo(500, 1300, 1200, 1380); g.stroke();
        CH.woodman.draw(g, { x: 560, y: lerp(1500, 1420, up), scale: lerp(0.95, 1.05, p), facing: 'left', pose: { name: 'crouch', k: lerp(0.9, 0.3, up) }, alpha: clamp((t - env.beats[0]) / 0.4) * 0.6 + 0.4 * (1 - clamp((t - env.beats[0]) / 0.3)) + 0.4 * up, light: { dir: -Math.PI / 2 - 0.3, intensity: 1.15, front: 0.75, fill: 0.5 }, t: T, key: 'w37-wm' });
      } });
    },
    post: () => ({ bloom: 0.44, vignette: 0.46, paper: 0.3 }),
  });
})();
