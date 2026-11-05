/*
 * Episode 21 · shared pieces (not a scene). Loads after ep20/_common (EP20.island, EP20.noon).
 * LOCATIONS, each with its own light:
 *   EP21.grove(ctx, T, o)   the island's PALM GROVE AT EVENING: amber light low through the trunks from the
 *                           right, long blue shadows on pale sand, a gold haze; EP21.amber(x, y) lights a figure
 *   EP21.bay(ctx, T, o)     the NISHADAS' BAY AT MOONRISE: teal-and-silver water in a curved bay under cliffs, a
 *                           village of huts on stilts with small orange fires, boats; o.village (0..1), o.rush (0..1:
 *                           the water torn up by wings), EP21.moon(x, y) lights a figure
 *   EP21.night(ctx, T, o)   deep night-blue sky over the open sea for the blessing (stars, a horizon glow)
 *   EP21.lateGold(ctx, a)   the late-gold wash over Ramaniyaka for the cold open (the island of ep 20, a new hour)
 * PROPS:
 *   EP21.coal(ctx, x, y, r, T, a)   a burning coal-glow (the sign of the brahmin in the throat)
 *   EP21.sign(ctx, kind, x, y, s, T, a)   the four guardians as painted signs: 'wind' | 'moon' | 'fire' | 'sun'
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT;
  const { TAU, clamp, lerp, hash } = R;
  const EP21 = (window.EP21 = {});
  EP21.mouth = window.EP17.mouth; EP21.plaque = window.EP17.plaque;
  EP21.amber = (x, y, k = 1.1) => ({ dir: Math.atan2(900 - (y - 600), 1300 - x), intensity: k, front: 0.55 });
  EP21.moon = (x, y, k = 1.0) => ({ dir: Math.atan2(420 - (y - 600), 780 - x), intensity: k, front: 0.5 });

  function palm(ctx, x, y, h, lean, T, i, col) {
    ctx.strokeStyle = col; ctx.lineWidth = 16 * h / 900; ctx.lineCap = 'round';
    const tx = x + lean * h, ty = y - h;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + lean * h * 0.2, y - h * 0.5, tx, ty); ctx.stroke();
    ctx.fillStyle = col;
    for (let k = 0; k < 7; k++) {
      const a = -Math.PI / 2 + (k - 3) * 0.55 + 0.05 * Math.sin(T * 1.3 + i + k), L = h * 0.38;
      ctx.beginPath(); ctx.moveTo(tx, ty);
      ctx.quadraticCurveTo(tx + Math.cos(a) * L * 0.6, ty + Math.sin(a) * L * 0.6 - 40, tx + Math.cos(a) * L, ty + Math.sin(a) * L + L * 0.25);
      ctx.quadraticCurveTo(tx + Math.cos(a) * L * 0.5, ty + Math.sin(a) * L * 0.5, tx, ty + 10); ctx.fill();
    }
  }
  EP21.grove = (ctx, T, o = {}) => {
    ctx.save();
    const cam = o.cam || {};
    KIT.camera(ctx, { x: 540, y: 1100, zoom: cam.zoom || 1, dx: cam.dx || 0, dy: cam.dy || 0 });
    KIT.vgrad(ctx, -400, 1300, [[0, '#3a2a5a'], [0.45, '#c86a3a'], [0.8, '#ffc070'], [1, '#ffe2a0']], -400, R.W + 400);
    KIT.glow(ctx, 1150, 1050, 900, '#ffb050', 0.75, 'lighter', 0.35);
    ctx.fillStyle = '#fff0c0'; ctx.beginPath(); ctx.arc(1150, 1060, 70, 0, TAU); ctx.fill();
    // far palms in haze
    for (let i = 0; i < 9; i++) palm(ctx, -200 + i * 170 + hash(i, 2) * 60, 1280, 520 + hash(i, 3) * 260, (hash(i, 4) - 0.5) * 0.4, T, i, 'rgba(90,50,40,0.55)');
    KIT.vgrad(ctx, 1260, R.H + 400, [[0, '#e8c088'], [0.3, '#c89a68'], [1, '#6a4a3a']], -400, R.W + 400);
    // long blue shadows of trunks across the sand, from the low sun at the right
    ctx.fillStyle = 'rgba(40,40,90,0.28)';
    for (let i = 0; i < 6; i++) { const x = -100 + i * 230; ctx.beginPath(); ctx.moveTo(x + 30, 1300 + i * 40); ctx.lineTo(x - 700, 1500 + i * 60); ctx.lineTo(x - 700, 1540 + i * 60); ctx.lineTo(x + 50, 1312 + i * 40); ctx.fill(); }
    if (o.after) o.after(ctx);
    // near palms framing the shot
    if (o.near !== false) { palm(ctx, -40, 2300, 1500, 0.12, T, 21, '#2a1408'); palm(ctx, 1130, 2300, 1400, -0.15, T, 22, '#2a1408'); }
    for (let i = 0; i < 18; i++) { const x = (hash(i, 7) * R.W + T * 12 * (1 + hash(i, 8))) % R.W, y = 400 + hash(i, 9) * 1100; ctx.globalAlpha = 0.35 * (0.5 + 0.5 * Math.sin(T * 2 + i)); ctx.fillStyle = '#ffe0a0'; ctx.beginPath(); ctx.arc(x, y, 3, 0, TAU); ctx.fill(); }
    ctx.globalAlpha = 1;
    ctx.restore();
  };

  EP21.bay = (ctx, T, o = {}) => {
    ctx.save();
    const cam = o.cam || {}, vil = o.village ?? 1, rush = clamp(o.rush || 0);
    KIT.camera(ctx, { x: 540, y: 1000, zoom: cam.zoom || 1, dx: cam.dx || 0, dy: cam.dy || 0 });
    KIT.vgrad(ctx, -500, 1020, [[0, '#06101e'], [0.55, '#14324a'], [1, '#4a8a9a']], -400, R.W + 400);
    for (let i = 0; i < 60; i++) { ctx.globalAlpha = 0.6 * hash(i, 1); ctx.fillStyle = '#e8f4ff'; ctx.fillRect(hash(i, 2) * 1600 - 260, hash(i, 3) * 900 - 400, 3, 3); }
    ctx.globalAlpha = 1;
    KIT.glow(ctx, 780, 420, 380, '#d8f0ff', 0.6);
    ctx.fillStyle = '#eef8ff'; ctx.beginPath(); ctx.arc(780, 420, 64, 0, TAU); ctx.fill();
    // cliffs curving round the bay
    ctx.fillStyle = '#0a1a24';
    ctx.beginPath(); ctx.moveTo(-400, 1000); ctx.lineTo(-400, 700); ctx.quadraticCurveTo(-100, 640, 120, 820); ctx.quadraticCurveTo(220, 940, 300, 1010); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(R.W + 400, 1000); ctx.lineTo(R.W + 400, 760); ctx.quadraticCurveTo(1150, 720, 980, 880); ctx.quadraticCurveTo(900, 960, 840, 1010); ctx.closePath(); ctx.fill();
    // water: teal with a silver moon path, torn by the wind of wings when rush > 0
    KIT.vgrad(ctx, 1000, R.H + 500, [[0, '#2a7a8a'], [0.25, '#14485a'], [1, '#061a26']], -400, R.W + 400);
    for (let i = 0; i < 26; i++) { const y = 1030 + i * i * 2.2, w = 30 + i * 9; ctx.globalAlpha = 0.5 * (0.5 + 0.5 * Math.sin(T * 2 + i * 1.7)); ctx.fillStyle = '#dff4ff'; ctx.fillRect(780 - w / 2 + Math.sin(T + i) * 10, y, w, 3); }
    ctx.globalAlpha = 1;
    if (rush > 0) { ctx.strokeStyle = 'rgba(230,250,255,0.6)'; ctx.lineWidth = 6; for (let i = 0; i < 14; i++) { const a = (i / 14) * TAU, r0 = 120 + 500 * rush * ((T * 0.7 + hash(i, 5)) % 1); ctx.beginPath(); ctx.ellipse(540, 1350, r0 * 1.6, r0 * 0.35, 0, a, a + 0.5); ctx.stroke(); } }
    // the village on the far shore: huts on stilts, small fires, boats
    if (vil > 0.01) {
      ctx.save(); ctx.globalAlpha = vil;
      ctx.fillStyle = '#3a2a1a'; ctx.fillRect(220, 1004, 640, 14);
      for (let i = 0; i < 8; i++) {
        const x = 260 + i * 78, y = 1000 - (i % 2) * 6, s = 0.8 + 0.3 * hash(i, 6);
        ctx.fillStyle = '#1a120c'; for (const dx of [-20, 18]) ctx.fillRect(x + dx * s, y - 4, 5, 26);
        ctx.fillStyle = '#4a3220'; ctx.fillRect(x - 28 * s, y - 40 * s, 56 * s, 36 * s);
        ctx.fillStyle = '#6a4a2a'; ctx.beginPath(); ctx.moveTo(x - 38 * s, y - 38 * s); ctx.lineTo(x, y - 74 * s); ctx.lineTo(x + 38 * s, y - 38 * s); ctx.fill();
        ctx.fillStyle = '#ffb050'; ctx.fillRect(x - 6, y - 26 * s, 12, 12);
      }
      for (let i = 0; i < 4; i++) { const x = 300 + i * 150, fl = KIT.flicker(T, i); KIT.glow(ctx, x, 1022, 60, '#ff9030', 0.5 * fl); ctx.fillStyle = '#ffd070'; ctx.beginPath(); ctx.ellipse(x, 1018, 6, 10 * fl, 0, 0, TAU); ctx.fill(); }
      for (let i = 0; i < 5; i++) { const x = 200 + i * 170 + Math.sin(T * 0.6 + i) * 8, y = 1080 + (i % 3) * 40; ctx.fillStyle = '#0c1a1e'; ctx.beginPath(); ctx.moveTo(x - 60, y); ctx.quadraticCurveTo(x, y + 26, x + 60, y); ctx.closePath(); ctx.fill(); ctx.fillRect(x - 2, y - 50, 4, 50); }
      ctx.restore();
    }
    if (o.after) o.after(ctx);
    ctx.restore();
  };

  EP21.night = (ctx, T, o = {}) => {
    KIT.vgrad(ctx, 0, R.H, [[0, '#020614'], [0.5, '#0c1a44'], [0.85, '#1e3a6a'], [1, '#2a5a7a']]);
    for (let i = 0; i < 120; i++) { ctx.globalAlpha = 0.3 + 0.6 * hash(i, 1) * (0.7 + 0.3 * Math.sin(T * 2 + i)); ctx.fillStyle = '#ffffff'; ctx.fillRect(hash(i, 2) * R.W, hash(i, 3) * 1500, 2.5, 2.5); }
    ctx.globalAlpha = 1;
    KIT.glow(ctx, 540, 1760, 900, '#4a8ac8', 0.35, 'lighter', 0.4);
    KIT.vgrad(ctx, 1740, R.H, [[0, '#123a5a'], [1, '#020a14']]);
    for (let i = 0; i < 18; i++) { ctx.globalAlpha = 0.4; ctx.fillStyle = '#9ad0ff'; ctx.fillRect((hash(i, 4) * R.W + T * 20) % R.W, 1760 + hash(i, 5) * 150, 40, 2); }
    ctx.globalAlpha = 1;
    if (o.after) o.after(ctx);
  };

  EP21.lateGold = (ctx, a) => {
    ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = a; ctx.fillStyle = '#ff9a3a'; ctx.fillRect(0, 0, R.W, R.H);
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 0.18 * a; ctx.fillStyle = '#7a2a10'; ctx.fillRect(0, 0, R.W, R.H); ctx.restore();
  };

  EP21.coal = (ctx, x, y, r, T, a) => {
    if (a <= 0.01) return;
    const fl = 0.85 + 0.15 * Math.sin(T * 13);
    KIT.glow(ctx, x, y, r * 4, '#ff5010', 0.7 * a * fl, 'lighter', 0.4);
    ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = '#ff7a2a'; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    ctx.fillStyle = '#ffe080'; ctx.beginPath(); ctx.arc(x - r * 0.2, y - r * 0.2, r * 0.5 * fl, 0, TAU); ctx.fill(); ctx.restore();
  };

  EP21.sign = (ctx, kind, x, y, s, T, a) => {
    if (a <= 0.01) return;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(s, s);
    if (kind === 'wind') {
      KIT.glow(ctx, 0, 0, 260, '#bfe8ff', 0.5);
      ctx.strokeStyle = '#e8f8ff'; ctx.lineWidth = 12; ctx.lineCap = 'round';
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-160, -60 + i * 60); ctx.bezierCurveTo(-60, -110 + i * 60 + Math.sin(T * 3 + i) * 20, 60, -10 + i * 60, 130, -60 + i * 60); ctx.arc(110, -84 + i * 60, 24, Math.PI / 2, Math.PI * 1.7, true); ctx.stroke(); }
    } else if (kind === 'moon') {
      KIT.glow(ctx, 0, 0, 260, '#e0ecff', 0.6);
      ctx.fillStyle = '#f2f6ff'; ctx.beginPath(); ctx.arc(0, 0, 110, 0, TAU); ctx.fill();
      ctx.fillStyle = '#0c1a44'; ctx.beginPath(); ctx.arc(46, -26, 100, 0, TAU); ctx.fill();
    } else if (kind === 'fire') {
      KIT.glow(ctx, 0, 0, 300, '#ff7a1a', 0.7);
      for (const [c, w, h] of [['#c8300c', 90, 240], ['#ff8a20', 62, 190], ['#ffe070', 34, 130]]) { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(-w, 60); ctx.quadraticCurveTo(-w * 0.7, -h * 0.4, Math.sin(T * 5) * 12, -h); ctx.quadraticCurveTo(w * 0.7, -h * 0.4, w, 60); ctx.closePath(); ctx.fill(); }
    } else {
      KIT.glow(ctx, 0, 0, 520, '#ffd070', 0.75);
      ctx.fillStyle = '#ffe9a0';
      for (let i = 0; i < 16; i++) { const an = (i / 16) * TAU + T * 0.2; ctx.beginPath(); ctx.moveTo(Math.cos(an) * 150, Math.sin(an) * 150); ctx.lineTo(Math.cos(an + 0.1) * 240, Math.sin(an + 0.1) * 240); ctx.lineTo(Math.cos(an + 0.2) * 150, Math.sin(an + 0.2) * 150); ctx.fill(); }
      ctx.fillStyle = '#fff6d0'; ctx.beginPath(); ctx.arc(0, 0, 150, 0, TAU); ctx.fill();
    }
    ctx.restore();
  };
  void lerp;
})();
