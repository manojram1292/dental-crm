/* Ep 26 · line "frame" · FRAME (Sauti) · "And the gods fled, in every direction." · A fifteenth angle: from directly above the fire, the sages in a ring, Sauti's hands flung outward. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP26 = window.EP26;
  const { clamp, E, hash } = R;
  R.scene({
    id: 'frame',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      // a plan view: the clearing from above (painted), the fire at the centre, figures as seated shapes in a ring
      KIT.vgrad(ctx, 0, R.H, [[0, '#0a0806'], [1, '#140c08']]);
      const fl = KIT.flicker(T, 0);
      ctx.save(); ctx.translate(540, 1000); ctx.scale(1 + 0.05 * p, 1 + 0.05 * p); ctx.rotate(0.1 * p);
      KIT.glow(ctx, 0, 0, 700, '#ff9030', 0.5 * fl, 'lighter', 0.5);
      ctx.fillStyle = '#5a3020'; ctx.fillRect(-120, -120, 240, 240); ctx.fillStyle = '#7a4a28'; ctx.fillRect(-80, -80, 160, 160);
      for (let i = 0; i < 9; i++) { const a = (i / 9) * R.TAU + T * 2; ctx.fillStyle = i % 2 ? '#ffd060' : '#ff7020'; ctx.beginPath(); ctx.ellipse(Math.cos(a) * 30 * fl, Math.sin(a) * 30 * fl, 40, 18, a, 0, R.TAU); ctx.fill(); }
      for (let i = 0; i < 8; i++) { const a = (i / 8) * R.TAU, r = 380; ctx.save(); ctx.translate(Math.cos(a) * r, Math.sin(a) * r); ctx.rotate(a + Math.PI / 2); ctx.fillStyle = '#1a100a'; ctx.beginPath(); ctx.ellipse(0, 0, 90, 60, 0, 0, R.TAU); ctx.fill(); ctx.fillStyle = '#2a1a10'; ctx.beginPath(); ctx.arc(0, 10, 34, 0, R.TAU); ctx.fill(); ctx.strokeStyle = `rgba(255,190,110,${0.6 * fl})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, -10, 40, Math.PI, 0); ctx.stroke(); ctx.restore(); }
      // Sauti (the one at the bottom), arms flung out
      const fling = E.outCubic(clamp((t - 0.6) / 0.5));
      ctx.save(); ctx.translate(0, 380); ctx.strokeStyle = '#1a100a'; ctx.lineWidth = 26; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-60, -10); ctx.lineTo(-60 - 160 * fling, -60 - 40 * fling); ctx.moveTo(60, -10); ctx.lineTo(60 + 160 * fling, -60 - 40 * fling); ctx.stroke(); ctx.restore();
      ctx.restore();
      for (let i = 0; i < 20; i++) { const life = (T * 0.5 + hash(i, 1)) % 1; ctx.globalAlpha = 1 - life; ctx.fillStyle = '#ffc060'; ctx.beginPath(); ctx.arc(540 + (hash(i, 2) - 0.5) * 300 * life * 3, 1000 + (hash(i, 3) - 0.5) * 300 * life * 3, 4, 0, R.TAU); ctx.fill(); }
      ctx.globalAlpha = 1;
      void EP26;
    },
    post: () => ({ bloom: 0.44, vignette: 0.55, paper: 0.34 }),
  });
})();
