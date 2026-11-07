/* Ep 39 · line "else" · "The king offered gold, cattle, anything else. The boy would not take it." · Painted signs of gold heaps and cattle appear on the beats between them; the boy shakes his head (beats[3]); the signs fade. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP8 = window.EP8, EP37 = window.EP37, EP38 = window.EP38, EP39 = window.EP39;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'else',
    fadeIn: 0.15,
    draw(ctx, t, env) {
      const T = env.T, B = env.beats, fade = clamp((t - B[3] + 0.2) / 0.5);
      EP38.noonSatra(ctx, T, { cam: { zoom: 1.2, dy: -260 }, after: (g) => {
        CH.janamejaya.draw(g, { x: 840, y: 1620, scale: 0.7, facing: 'left', pose: { name: 'speak', k: 0.8 }, light: EP39.fireLit(840, 1400, 1.15), t: T, key: 'e39-jj' });
        CH.astika.draw(g, { x: 220, y: 1640, scale: 0.6, facing: 'right', pose: { name: 'stand' }, expression: { look: 0.15 * Math.sin(Math.max(0, t - B[3]) * 9) * (1 - fade) }, light: { dir: -Math.PI / 2, intensity: 1.2, front: 0.8, fill: 0.55 }, t: T, key: 'e39-as' });
        const a0 = clamp((t - B[0] + 0.2) / 0.3) * (1 - fade), a1 = clamp((t - B[1] + 0.2) / 0.3) * (1 - fade);
        g.save(); g.globalAlpha = a0; g.fillStyle = '#e8b840'; for (let i = 0; i < 15; i++) { g.beginPath(); g.ellipse(470 + (i % 5) * 34, 1300 - Math.floor(i / 5) * 22, 24, 10, 0, 0, Math.PI * 2); g.fill(); } KIT.glow(g, 540, 1260, 200, '#ffd860', 0.5 * a0); g.restore();
        g.save(); g.globalAlpha = a1; g.fillStyle = '#f0e8d8'; for (let i = 0; i < 3; i++) { const x = 440 + i * 100, y = 1480; g.beginPath(); g.ellipse(x, y, 50, 26, 0, 0, Math.PI * 2); g.fill(); g.fillRect(x - 40, y, 8, 40); g.fillRect(x + 32, y, 8, 40); g.beginPath(); g.ellipse(x - 52, y - 16, 16, 12, 0, 0, Math.PI * 2); g.fill(); } g.restore();
      } });
    },
    post: () => ({ bloom: 0.44, vignette: 0.46, paper: 0.3 }),
  });
})();
