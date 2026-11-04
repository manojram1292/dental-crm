/*
 * Episode 15 · shared pieces (not a scene). Loads after ep11–ep14's _common; episode 16 reuses it.
 *
 * LOCATIONS AND LIGHT
 *   EP15.dusk(ctx, T, o)   THE SHORE AT VIOLET DUSK: the enchantress's light. A violet-to-rose
 *                          sky, the calm white sea, a strand of pale sand, drifting motes; the
 *                          key light low from the horizon at the left (EP15.duskLight).
 *   EP15.heavens(ctx, T, o)   the deep sky where the Sun and the Moon ride (indigo to black, stars):
 *                          o.sun [x, y, r], o.moon [x, y, r], o.bite (0..1 the eclipse's shadow)
 *   EP15.potGlow(ctx, x, y, s, a)   the white pot of amrita as a hand-held prop with its glow
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP11 = window.EP11, EP13 = window.EP13;
  const { TAU, clamp, lerp, hash } = R;
  const EP15 = (window.EP15 = {});
  EP15.mouth = EP13.mouth; EP15.plaque = EP13.plaque;
  EP15.duskLight = (x, y, k = 1.05) => ({ dir: Math.atan2(1150 - (y - 600), -200 - x), intensity: k, front: 0.45 });

  EP15.dusk = (ctx, T, o = {}) => {
    ctx.save();
    const cam = o.cam || {};
    KIT.camera(ctx, { x: 540, y: 1000, zoom: cam.zoom || 1, dx: cam.dx || 0, dy: cam.dy || 0 });
    const hz = o.hz ?? 1150;
    KIT.vgrad(ctx, -600, hz, [[0, '#120a2a'], [0.45, '#3a1e5a'], [0.8, '#a04a7a'], [1, '#ffb0a0']], -400, R.W + 400);
    KIT.glow(ctx, -100, hz, 900, '#ffb890', 0.55);
    for (let i = 0; i < 40; i++) { const x = hash(i, 1) * 1500 - 200, y = -500 + hash(i, 2) * (hz + 100); ctx.globalAlpha = 0.25 + 0.4 * Math.abs(Math.sin(T * 0.7 + i)); ctx.fillStyle = '#f0e0ff'; ctx.beginPath(); ctx.arc(x, y, 1.2 + hash(i, 3) * 1.8, 0, TAU); ctx.fill(); }
    ctx.globalAlpha = 1;
    KIT.vgrad(ctx, hz, hz + 420, [[0, '#ffe8f0'], [0.5, '#d8c0e0'], [1, '#9a80b0']], -400, R.W + 400);
    ctx.strokeStyle = 'rgba(255,240,250,0.7)'; ctx.lineWidth = 3;
    for (let i = 0; i < 10; i++) { const y = hz + 16 + i * 38; for (let j = 0; j < 4; j++) { const x = ((j * 330 + i * 140 + T * (8 + i)) % 1700) - 300; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 60, y - 6, x + 130, y); ctx.stroke(); } }
    KIT.vgrad(ctx, hz + 400, R.H + 600, [[0, '#c8a8b8'], [0.15, '#6a4a6a'], [1, '#1a0e1e']], -400, R.W + 400);
    // drifting motes of the illusion
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 24; i++) { const life = (T * 0.12 + hash(i, 7)) % 1; KIT.glow(ctx, hash(i, 8) * R.W, 1900 - life * 1600, 30, '#e8c8ff', 0.4 * Math.sin(Math.PI * life)); }
    ctx.restore();
    if (o.after) o.after(ctx);
    ctx.restore();
  };

  EP15.heavens = (ctx, T, o = {}) => {
    KIT.vgrad(ctx, 0, R.H, [[0, '#04030c'], [0.6, '#120c2a'], [1, '#2a1a3a']]);
    for (let i = 0; i < 120; i++) { const x = hash(i, 11) * R.W, y = hash(i, 12) * R.H; ctx.globalAlpha = 0.3 + 0.5 * Math.abs(Math.sin(T * 0.6 + i)); ctx.fillStyle = '#f4f0ff'; ctx.beginPath(); ctx.arc(x, y, 1 + hash(i, 13) * 2, 0, TAU); ctx.fill(); }
    ctx.globalAlpha = 1;
    if (o.sun) {
      const [x, y, r] = o.sun;
      KIT.glow(ctx, x, y, r * 4, '#ffd060', 0.7);
      const g = ctx.createRadialGradient(x, y, r * 0.1, x, y, r);
      g.addColorStop(0, '#fffbe8'); g.addColorStop(0.7, '#ffd060'); g.addColorStop(1, '#ff9a30');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
      const b = clamp(o.bite || 0);
      if (b > 0.01) { ctx.fillStyle = '#05030a'; ctx.beginPath(); ctx.arc(x - r * 2 + r * 1.3 * b, y + r * 0.2, r * 1.05, 0, TAU); ctx.fill(); ctx.strokeStyle = '#ffb8c8'; ctx.lineWidth = 3; ctx.stroke(); }
    }
    if (o.moon) {
      const [x, y, r] = o.moon;
      KIT.glow(ctx, x, y, r * 3, '#dfe8ff', 0.5);
      ctx.fillStyle = '#f4f6ff'; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(180,190,220,0.5)'; for (const [dx, dy, rr] of [[-0.3, -0.2, 0.2], [0.25, 0.1, 0.15], [-0.05, 0.35, 0.12]]) { ctx.beginPath(); ctx.arc(x + dx * r, y + dy * r, rr * r, 0, TAU); ctx.fill(); }
    }
    if (o.after) o.after(ctx);
  };

  EP15.potGlow = (ctx, x, y, s = 1, a = 1) => {
    if (a <= 0.01) return;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(s, s);
    KIT.glow(ctx, 0, 0, 260, '#ffffff', 0.7);
    ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#e8c060'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.ellipse(0, 0, 70, 60, 0, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-30, -56); ctx.lineTo(30, -56); ctx.lineTo(22, -84); ctx.lineTo(-22, -84); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
  };
  void lerp; void EP11;
})();
