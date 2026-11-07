/*
 * Episode 32 · shared pieces (not a scene). Loads after ep31/_common (EPA).
 * NEW LIGHTS:
 *   EP32.fireHall(ctx, T, o)   VASUKI'S HALL BY ITS JEWEL-FIRE: the violet hall with a great ruby fire on a coiled base in the
 *                              centre, lighting the serpents from below in ember-red. o.fire (0..1), o.cam, o.after(g)
 *   EP32.vision(ctx, x, y, w, h, a, draw(g), T)   a VISION PANEL in the fire's smoke: a sepia-gold painted panel with a
 *                              torn smoke edge, for the serpents' plans
 *   EP32.memory(ctx, T, o)     THE MEMORY IN SILVER-BLUE: Brahma's court as a cold moonlit vault, gods as small luminous
 *                              figures (a memory light), o.cam, o.after(g)
 *   EP32.forest(ctx, T, o)     A FOREST AT NIGHT IN TEAL MOONLIGHT, serpents' eyes in the roots: the watchers. o.cam, o.after(g)
 *   EP32.medal(ctx, x, y, r, a, who, T, key)   a small gold medallion with one figure ('sage' · 'bride' · 'boy')
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA;
  const { TAU, clamp, hash } = R;
  const CH = KIT.characters;
  const EP32 = (window.EP32 = {});
  EP32.FIRE = { x: 540, y: 1250 };
  EP32.fireLit = (x, y, k = 1.1) => ({ dir: Math.atan2(EP32.FIRE.y - (y - 500), EP32.FIRE.x - x), intensity: k, front: 0.65, fill: 0.35 });

  EP32.fireHall = (ctx, T, o = {}) => {
    const f = clamp(o.fire ?? 1);
    EPA.hall(ctx, T, { mood: 'violet', cam: o.cam, after: (g) => {
      const F = EP32.FIRE, fl = KIT.flicker(T, 3);
      KIT.glow(g, F.x, F.y - 120, 900, '#ff5030', 0.45 * f * fl);
      g.fillStyle = '#1a0c20'; g.beginPath(); g.ellipse(F.x, F.y + 20, 170, 46, 0, 0, TAU); g.fill();
      g.strokeStyle = '#8a7aff'; g.lineWidth = 6; g.globalAlpha = 0.6; for (let i = 0; i < 3; i++) { g.beginPath(); g.ellipse(F.x, F.y + 10 - i * 18, 160 - i * 26, 40 - i * 6, 0, 0, TAU); g.stroke(); } g.globalAlpha = 1;
      for (let i = 0; i < 7; i++) {
        const ph = T * 2.2 + i * 1.3, h = (160 + 90 * Math.sin(ph)) * f, w = 40 + 14 * Math.sin(ph * 1.7);
        g.fillStyle = i % 2 ? '#ff4a3a' : '#ffb070'; g.globalAlpha = 0.85;
        const x = F.x + (i - 3) * 22; g.beginPath(); g.moveTo(x - w, F.y - 20); g.quadraticCurveTo(x - w * 0.4, F.y - 20 - h * 0.6, x + 8 * Math.sin(ph), F.y - 20 - h); g.quadraticCurveTo(x + w * 0.4, F.y - 20 - h * 0.6, x + w, F.y - 20); g.fill();
      }
      g.globalAlpha = 1; g.fillStyle = '#fff0e0'; g.beginPath(); g.ellipse(F.x, F.y - 46, 26, 40, 0, 0, TAU); g.fill();
      // smoke rising into the vault (where the visions appear)
      for (let i = 0; i < 8; i++) { const u = ((T * 0.12 + i / 8) % 1), y = F.y - 200 - u * 1100; g.globalAlpha = 0.18 * (1 - u); g.fillStyle = '#a090c0'; g.beginPath(); g.ellipse(F.x + Math.sin(T * 0.5 + i) * 120 * u, y, 140 + 240 * u, 60 + 90 * u, 0, 0, TAU); g.fill(); }
      g.globalAlpha = 1;
      if (o.after) o.after(g);
    } });
  };

  EP32.vision = (ctx, x, y, w, h, a, draw, T) => {
    if (a <= 0.003) return;
    const b = R.buffer('ep32-vision', Math.ceil(w), Math.ceil(h));
    b.clear('#000');
    const g = b.ctx;
    const grd = g.createLinearGradient(0, 0, 0, h); grd.addColorStop(0, '#3a2410'); grd.addColorStop(1, '#7a5428');
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
    g.save(); draw(g); g.restore();
    R.resetCtx(g);
    // the torn smoke edge
    g.globalCompositeOperation = 'destination-in';
    g.beginPath();
    for (let i = 0; i <= 40; i++) { const u = i / 40, an = u * TAU, rr = 0.5 + 0.035 * Math.sin(an * 7 + T) + 0.02 * Math.sin(an * 13 - T * 1.3); g.lineTo(w / 2 + Math.cos(an) * w * rr * 0.98, h / 2 + Math.sin(an) * h * rr * 0.98); }
    g.closePath(); g.fillStyle = '#fff'; g.fill();
    g.globalCompositeOperation = 'source-over';
    ctx.save(); ctx.globalAlpha = a;
    KIT.glow(ctx, x, y, Math.max(w, h) * 0.75, '#ffb060', 0.35);
    ctx.drawImage(b.canvas, x - w / 2, y - h / 2, w, h);
    ctx.restore();
  };

  EP32.memory = (ctx, T, o = {}) => {
    ctx.save();
    const cam = o.cam || {};
    KIT.camera(ctx, { x: 540, y: 1000, zoom: cam.zoom || 1, dx: cam.dx || 0, dy: cam.dy || 0 });
    KIT.vgrad(ctx, -800, R.H + 700, [[0, '#04081a'], [0.45, '#1a2a50'], [0.75, '#3a5a8a'], [1, '#0a1020']], -500, R.W + 500);
    KIT.glow(ctx, 540, 700, 1000, '#c8dcff', 0.35);
    ctx.fillStyle = 'rgba(200,220,255,0.12)';
    for (let i = 0; i < 6; i++) { const x = 40 + i * 200; ctx.fillRect(x - 30, 300, 60, 1500); ctx.beginPath(); ctx.arc(x, 300, 30, Math.PI, 0); ctx.fill(); }
    KIT.vgrad(ctx, 1600, R.H + 700, [[0, '#2a3a5a'], [1, '#06080e']], -500, R.W + 500);
    for (let k = 0; k < 40; k++) { ctx.globalAlpha = 0.4 + 0.4 * Math.sin(T * 1.3 + k); ctx.fillStyle = '#e8f0ff'; ctx.beginPath(); ctx.arc(hash(k, 1) * 1400 - 160, hash(k, 2) * 600 - 300, 2 + 2 * hash(k, 3), 0, TAU); ctx.fill(); }
    ctx.globalAlpha = 1;
    if (o.after) o.after(ctx);
    ctx.restore();
  };

  EP32.forest = (ctx, T, o = {}) => {
    ctx.save();
    const cam = o.cam || {};
    KIT.camera(ctx, { x: 540, y: 1000, zoom: cam.zoom || 1, dx: cam.dx || 0, dy: cam.dy || 0 });
    KIT.vgrad(ctx, -800, R.H + 700, [[0, '#020a10'], [0.4, '#06202a'], [0.75, '#0a3038'], [1, '#020808']], -500, R.W + 500);
    ctx.fillStyle = '#e0fff8'; ctx.beginPath(); ctx.arc(820, 260, 90, 0, TAU); ctx.fill(); KIT.glow(ctx, 820, 260, 600, '#8af0e0', 0.4);
    for (let L = 0; L < 3; L++) {
      ctx.fillStyle = ['#164a50', '#0c3036', '#041416'][L];
      for (let i = 0; i < 5; i++) { const x = -260 + i * 380 + L * 130 + 40 * hash(i, L), w = 50 + L * 26; if (L < 2 && x > 380 && x < 700) continue; ctx.fillRect(x - w / 2, -800, w, 2600); ctx.beginPath(); ctx.ellipse(x, 60 + L * 120 + 80 * hash(i, L + 4), 200 - L * 30, 150, 0, 0, TAU); ctx.fill(); }
    }
    // the path in moonlight
    KIT.glow(ctx, 560, 1400, 700, '#8af0e0', 0.22); ctx.fillStyle = 'rgba(160,230,220,0.3)'; ctx.beginPath(); ctx.moveTo(420, 1300); ctx.quadraticCurveTo(620, 1500, 300, R.H + 600); ctx.lineTo(900, R.H + 600); ctx.quadraticCurveTo(760, 1500, 480, 1300); ctx.fill();
    ctx.fillStyle = '#020a0a'; KIT.vgrad(ctx, 1700, R.H + 700, [[0, 'rgba(2,10,10,0)'], [1, '#020a0a']], -500, R.W + 500);
    if (o.eyes !== false) for (let k = 0; k < 18; k++) { const x = hash(k, 7) * 1100 - 10, y = 600 + hash(k, 8) * 1300, bl = Math.sin(T * 1.1 + k * 2.1) > -0.6 ? 1 : 0; if (!bl) continue; ctx.fillStyle = k % 3 ? '#c8ff90' : '#fff0a0'; for (const d of [-9, 9]) { ctx.beginPath(); ctx.ellipse(x + d, y, 5, 3, 0, 0, TAU); ctx.fill(); } KIT.glow(ctx, x, y, 26, '#c8ff90', 0.5); }
    if (o.after) o.after(ctx);
    ctx.restore();
  };

  EP32.medal = (ctx, x, y, r, a, who, T, key) => {
    if (a <= 0.003) return;
    window.EP11.roundel(ctx, x, y, r, a, (g, TT) => {
      KIT.vgrad(g, 0, R.H, [[0, '#2a1a3a'], [1, '#6a4a7a']]);
      KIT.glow(g, 540, 900, 700, who === 'boy' ? '#ffd890' : '#c8b0ff', 0.6);
      const L = { dir: -Math.PI / 2 - 0.4, intensity: 1.2, front: 0.8, fill: 0.5 };
      if (who === 'sage') CH.jaratkaru.draw(g, { x: 560, y: 1500, scale: 0.8, facing: 'left', pose: { name: 'stand' }, light: L, t: TT, key: key + '-j' });
      else if (who === 'bride') CH.nagini.draw(g, { x: 520, y: 1500, scale: 0.8, facing: 'right', pose: { name: 'stand' }, light: L, t: TT, key: key + '-n' });
      else CH.astika.draw(g, { x: 540, y: 1500, scale: 0.68, facing: 'left', pose: { name: 'stand' }, light: L, t: TT, key: key + '-a' });
    }, T, { focus: [540, 1000], zoom: 0.62, key, glow: who === 'boy' ? '#ffd890' : '#a890ff' });
  };
})();
