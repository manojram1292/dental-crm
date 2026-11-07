/*
 * Episode 37 · shared pieces (not a scene). Loads after ep31/_common (EPA), ep36/_common (EP36.court), ep07/_common (EP7.noon,
 * EP7.venomFire), ep08/_common (EP8.satra).
 * NEW LIGHTS:
 *   EP37.road(ctx, T, o)     THE ROAD AT BLAZING NOON: episode 7's forest re-graded white-gold, the dust road bright, short
 *                            black shadows under every figure (EP37.shadow); o.cam, o.after(g)
 *   EP37.grow(ctx, T, o)     THE REGROWTH LIGHT: the same road flooded green-gold from the reviving tree; o.k (0..1)
 *   EP37.blaze(ctx, T, o)    THE SACRIFICE ABLAZE NOW (episode 8's place, re-lit hotter, with a white core and the serpents
 *                            spiralling in): o.cam, o.after(g)
 * PROPS:
 *   EP37.banyan(ctx, x, y, s, T, o)   a great banyan with aerial roots; o.burn (0..1: venom-fire to ash), o.grow (0..1: the
 *                            regrowth from a sprout), o.man (draw the woodman in the branches: 0..1 alpha)
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP7 = window.EP7, EP8 = window.EP8;
  const { TAU, clamp, lerp, hash } = R;
  const CH = KIT.characters;
  const EP37 = (window.EP37 = {});
  EP37.noonLit = (x, y, k = 1.15) => ({ dir: -Math.PI / 2 - 0.15, intensity: k, front: 0.6, fill: 0.5 });
  EP37.shadow = (g, x, y, w) => { g.save(); g.fillStyle = 'rgba(20,10,4,0.55)'; g.beginPath(); g.ellipse(x, y, w, w * 0.18, 0, 0, TAU); g.fill(); g.restore(); };

  EP37.road = (ctx, T, o = {}) => {
    EP7.noon(ctx, T, { cam: o.cam, after: (g) => {
      g.save(); g.globalCompositeOperation = 'soft-light'; g.fillStyle = '#fff0c0'; g.globalAlpha = 0.6; g.fillRect(-600, -900, R.W + 1200, R.H + 1800); g.restore();
      g.fillStyle = 'rgba(255,236,190,0.55)'; g.beginPath(); g.moveTo(380, 1180); g.lineTo(700, 1180); g.lineTo(1300, R.H + 400); g.lineTo(-200, R.H + 400); g.closePath(); g.fill();
      if (o.green) { g.save(); g.globalCompositeOperation = 'lighter'; KIT.glow(g, o.greenAt?.[0] ?? 540, o.greenAt?.[1] ?? 1100, 1100, '#a0ff80', 0.35 * o.green); g.restore(); }
      if (o.after) o.after(g);
    } });
  };

  EP37.banyan = (ctx, x, y, s, T, o = {}) => {
    const burn = clamp(o.burn || 0), grow = o.grow ?? 1;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    if (burn >= 0.98 && grow <= 0.02) { ctx.fillStyle = '#8a8a8a'; ctx.beginPath(); ctx.ellipse(0, 0, 260, 60, 0, Math.PI, TAU); ctx.fill(); ctx.restore(); return; }
    const gs = grow < 1 ? grow : 1, ash = burn;
    const trunk = R.mix('#3a2410', '#6a6a6a', ash), leaf = R.mix('#1e4214', '#6a6a6a', ash), leaf2 = R.mix('#2e5e1c', '#8a8a8a', ash);
    if (gs < 0.15) { // the sprout
      const k = gs / 0.15; ctx.strokeStyle = '#6ab04a'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -120 * k); ctx.stroke();
      for (const d of [-1, 1]) { ctx.fillStyle = '#8ad060'; ctx.beginPath(); ctx.ellipse(d * 30 * k, -120 * k, 34 * k, 16 * k, d * 0.5, 0, TAU); ctx.fill(); }
      ctx.fillStyle = '#8a8a8a'; ctx.beginPath(); ctx.ellipse(0, 0, 260 * (1 - k * 0.6), 60 * (1 - k * 0.6), 0, Math.PI, TAU); ctx.fill();
      ctx.restore(); return;
    }
    const k = (gs - 0.15) / 0.85, H = lerp(250, 900, k), W = lerp(160, 700, k);
    ctx.fillStyle = trunk; ctx.beginPath(); ctx.moveTo(-70 * k - 20, 0); ctx.quadraticCurveTo(-40, -H * 0.5, -60 * k, -H * 0.8); ctx.lineTo(60 * k, -H * 0.8); ctx.quadraticCurveTo(40, -H * 0.5, 70 * k + 20, 0); ctx.fill();
    ctx.strokeStyle = trunk; ctx.lineWidth = 7;
    for (let i = 0; i < 9; i++) { const rx = (hash(i, 3) - 0.5) * W * 1.4; ctx.beginPath(); ctx.moveTo(rx, -H * 0.85); ctx.lineTo(rx + 6 * Math.sin(T + i), -H * (0.2 + 0.3 * hash(i, 4))); ctx.stroke(); }
    for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI, cx = Math.cos(a) * W * 0.8 + (hash(i, 9) - 0.5) * 60, cy = -H * 0.85 - Math.sin(a) * H * 0.3 + (hash(i, 8) - 0.5) * 40; ctx.fillStyle = i % 3 ? leaf : leaf2; ctx.beginPath(); ctx.arc(cx, cy, W * (0.18 + 0.06 * hash(i, 7)), 0, TAU); ctx.fill(); }
    ctx.fillStyle = leaf2; for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.arc((i - 3) * W * 0.2, -H * 1.02 - 30 * hash(i, 6), W * 0.2, 0, TAU); ctx.fill(); }
    if (o.man > 0) { ctx.globalAlpha = o.man; CH.woodman.draw(ctx, { x: W * 0.38, y: -H * 0.86, scale: 0.42, facing: 'left', pose: { name: 'crouch', k: 0.6 }, light: o.manLight || { dir: -Math.PI / 2, intensity: 1.1, front: 0.6, fill: 0.5 }, t: T, key: o.manKey || 'b37-man' }); ctx.globalAlpha = 1; }
    if (burn > 0 && burn < 0.98) { ctx.restore(); EP7.venomFire(ctx, x, y - H * 0.5 * s, W * 1.6 * s, H * 1.2 * s, T, burn * (1 - burn) * 4); return; }
    ctx.restore();
  };

  EP37.blaze = (ctx, T, o = {}) => {
    EP8.satra(ctx, T, { fire: 1.35, cam: o.cam, sky: (q) => EP8.fallers(q, T, EP8.FIRE.x, EP8.FIRE.y, 18, 1, { top: -400 }), after: (g) => {
      g.save(); g.globalCompositeOperation = 'lighter'; KIT.glow(g, EP8.FIRE.x, EP8.FIRE.y - 200, 700, '#fff0c0', 0.35); g.restore();
      if (o.after) o.after(g);
    } });
  };
})();
