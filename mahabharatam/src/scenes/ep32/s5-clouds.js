/* Ep 32 · line "clouds" · one serpent speaks · a VISION PANEL opens in the jewel-fire's smoke: Dark clouds with serpent tails pour rain on the sacrificial fire; the speaking serpent close at the bottom edge, lit by the fire. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP32 = window.EP32;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  const N = 3;
  R.scene({
    id: 'clouds',
    fadeIn: 0.15,
    draw(ctx, t, env) {
      const T = env.T, a = E.outCubic(clamp(t / 0.35)), p = clamp(t / env.dur);
      EP32.fireHall(ctx, T, { cam: { zoom: 1.25, dx: [0, -140, 120, -60][N], dy: 120 }, after: (g) => {
        const sx = [0, 260, 820, 300][N];
        CH.naga.draw(g, { x: sx, y: 2000, scale: 0.5, facing: sx < 540 ? 'right' : 'left', index: [0, 0, 3, 2][N], pose: { name: 'rise', k: 0.8 }, expression: { mood: N === 2 ? 'wrath' : 'calm' }, light: EP32.fireLit(sx, 1800), t: T, key: 'v32-n' + N });
      } });
      EP32.vision(ctx, 540, 700, 820, 760, a, (g) => {
        const L = { dir: -Math.PI / 2, intensity: 1, front: 0.4, fill: 0.2 };
        if (N === 1) {
          g.fillStyle = '#2a1808'; g.fillRect(0, 560, 820, 200);
          g.fillStyle = '#1a0c04'; g.fillRect(560, 300, 160, 280); g.beginPath(); g.arc(640, 300, 80, Math.PI, 0); g.fill();
          for (let i = 0; i < 3; i++) CH.brahmin.draw(g, { x: 140 + i * 140, y: 600, scale: 0.3, facing: 'right', pose: { name: 'bow', k: 0.5 + 0.3 * Math.sin(T * 1.5 + i) }, light: L, t: T + i, key: 'v32-b' + i });
        } else if (N === 2) {
          g.fillStyle = '#2a1808'; g.fillRect(0, 600, 820, 160);
          CH.priest.draw(g, { x: 560, y: 640, scale: 0.42, facing: 'left', index: 0, pose: { name: 'sit' }, light: L, t: T, key: 'v32-p' });
          const k = E.inOutSine(clamp((t - env.beats[0] + 0.2) / 0.4));
          CH.naga.draw(g, { x: lerp(120, 300, k), y: 680, scale: 0.26, facing: 'right', index: 0, pose: { name: 'rise', k: 0.4 + 0.6 * k }, expression: { mood: 'wrath' }, light: L, t: T, key: 'v32-s' });
        } else {
          g.fillStyle = '#2a1808'; g.fillRect(0, 620, 820, 140);
          const fl = 1 - 0.5 * clamp((t - env.beats[1]) / 0.8);
          KIT.glow(g, 410, 560, 240, '#ff7030', 0.8 * fl); g.fillStyle = '#ffb060'; g.beginPath(); g.moveTo(340, 620); g.quadraticCurveTo(410, 620 - 220 * fl, 480, 620); g.fill();
          for (let i = 0; i < 4; i++) { const cx = 160 + i * 170 + 20 * Math.sin(T + i); g.fillStyle = '#1a1420'; g.beginPath(); g.ellipse(cx, 200, 130, 70, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#1a1420'; g.lineWidth = 14; g.beginPath(); g.moveTo(cx + 100, 220); g.quadraticCurveTo(cx + 160, 300, cx + 120 + 20 * Math.sin(T * 2 + i), 360); g.stroke(); }
          g.strokeStyle = 'rgba(200,220,255,0.6)'; g.lineWidth = 3; for (let k = 0; k < 30; k++) { const x = (k * 37 + T * 400) % 820, y = (k * 53 + T * 900) % 400 + 240; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 8, y + 30); g.stroke(); }
        }
      }, T);
      void p;
    },
    post: () => ({ bloom: 0.4, vignette: 0.5, paper: 0.3 }),
  });
})();
