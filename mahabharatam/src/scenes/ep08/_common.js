/*
 * Episode 8 · shared pieces for its scenes (not a scene itself). Loads after ep05/_common,
 * ep06/_common and ep07/_common (EP5.ghost/label/mouth/hex; EP6.court, EP6.snake; EP7.pavilion,
 * EP7.venomFire, EP7.label are reused: the recap remembers episode 7's pavilion).
 *
 * LOCATIONS, each with its own light:
 *   EP8.satra(ctx, T, o)    the SNAKE SACRIFICE: a vast enclosure under a sky choked with
 *                           smoke, lit crimson from below by the great fire in its stepped
 *                           altar; sacrificial posts with black streamers, a canopy, the
 *                           smoke column. o = { fire (0..1.4: its height), dawn (0..1: the
 *                           empty ground at a grey-rose dawn, no fire: cords and pegs),
 *                           cam, after(g), sky(g) (drawn in the smoke, behind everything) }
 *   EP8.svarga(ctx, T, o)   INDRA'S HEAVEN: white-gold banked clouds, a pale palace with
 *                           domes and banners, a high sun; light from above, cool and bright.
 * PROPS:
 *   EP8.serpent(ctx, x, y, len, ang, T, seed, o)  a painted serpent of a given colour and
 *                           pattern (o.kind 0..5: green, gold-banded, red, black-hooded,
 *                           blue, spotted), with an optional hood; o.coil (0..1) curls it.
 *   EP8.fallers(ctx, T, cx, cy, n, a, o)  serpents of every size and colour spiralling down
 *                           through the smoke into the fire at (cx, cy), each ending in sparks
 *   EP8.bindings(ctx, x, y, r, T, a)      gold mantra bands closing round a serpent
 *   EP8.fireLight(x, y, cx, cy, k)        a character light toward the fire
 *   EP8.FIRE = { x, y }
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP5 = window.EP5;
  const { TAU, clamp, lerp, hash, E } = R;
  const EP8 = (window.EP8 = {});
  const hex = EP5.hex;
  EP8.mouth = EP5.mouth; EP8.ghost = EP5.ghost; EP8.label = window.EP7.label;

  EP8.FIRE = { x: 540, y: 1300 };
  EP8.fireLight = (x, y, k = 1, front = 0.35) => ({ dir: Math.atan2(EP8.FIRE.y - 200 - (y - 600), EP8.FIRE.x - x), intensity: k, front });

  // ─── the snake sacrifice ───────────────────────────────────────────────────
  EP8.satra = (ctx, T, o = {}) => {
    ctx.save();
    const cam = o.cam || {};
    KIT.camera(ctx, { x: 540, y: 1100, zoom: cam.zoom || 1, dx: cam.dx || 0, dy: cam.dy || 0 });
    const dawn = clamp(o.dawn || 0), fire = o.fire ?? 1, F = EP8.FIRE;
    // sky: smoke-choked crimson / grey-rose dawn
    KIT.vgrad(ctx, -500, 1200, [[0, hex('#0a0406', '#3a3a52', dawn)], [0.45, hex('#2a0806', '#8a6a7a', dawn)], [0.8, hex('#7a1a08', '#d8a090', dawn)], [1, hex('#c8401a', '#f0c8a8', dawn)]], -300, R.W + 300);
    if (dawn < 0.99) {
      // rolling smoke banks lit from below
      for (let i = 0; i < 7; i++) {
        const y = 120 + i * 130, x = ((i * 230 + T * (12 + i * 3)) % 1700) - 300;
        ctx.save(); ctx.globalAlpha = 0.5 * (1 - dawn);
        ctx.fillStyle = i % 2 ? '#1a0806' : '#2a0c08'; ctx.beginPath();
        for (let j = 0; j < 4; j++) KIT.scallopPath(ctx, x + j * 160, y + Math.sin(j + i) * 20, 120, 60, 6, i * 7 + j, 0.3);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,120,60,0.35)'; ctx.lineWidth = 3; ctx.stroke();
        ctx.restore();
      }
    }
    if (o.sky) o.sky(ctx);
    // the far enclosure wall and the canopy posts
    const hz = 1180;
    ctx.fillStyle = hex('#1a0806', '#4a3a40', dawn);
    ctx.fillRect(-300, hz - 90, R.W + 600, 110);
    for (let x = -280; x < R.W + 300; x += 70) { ctx.beginPath(); ctx.moveTo(x, hz - 90); ctx.lineTo(x + 35, hz - 130); ctx.lineTo(x + 70, hz - 90); ctx.fill(); }
    for (const x of [90, 990, 300, 780]) {
      const near = x === 90 || x === 990;
      ctx.fillStyle = hex('#140604', '#3a2a2a', dawn); ctx.fillRect(x - (near ? 22 : 14), near ? 380 : 700, near ? 44 : 28, near ? 1100 : 560);
      ctx.fillStyle = hex('#c84a1a', '#c89070', dawn); ctx.globalAlpha = 0.5; ctx.fillRect(x + (x < 540 ? (near ? 10 : 6) : -(near ? 22 : 14)), near ? 380 : 700, near ? 12 : 8, near ? 1100 : 560); ctx.globalAlpha = 1;
      // black streamers on the posts
      const sw = Math.sin(T * 2 + x) * 20;
      ctx.fillStyle = '#060202'; ctx.beginPath(); ctx.moveTo(x, near ? 400 : 710); ctx.quadraticCurveTo(x + 60 + sw, near ? 520 : 780, x + 30 + sw * 1.5, near ? 700 : 880); ctx.lineTo(x + 10, near ? 690 : 870); ctx.quadraticCurveTo(x + 30, near ? 520 : 780, x, near ? 440 : 730); ctx.fill();
    }
    // ground
    KIT.vgrad(ctx, hz, R.H + 300, [[0, hex('#3a1408', '#7a6050', dawn)], [0.3, hex('#200a06', '#4a3a30', dawn)], [1, '#080302']], -300, R.W + 300);
    if (dawn > 0.01) {
      // measuring cords and pegs across the bare ground
      ctx.save(); ctx.globalAlpha = dawn;
      ctx.strokeStyle = '#f0e0c0'; ctx.lineWidth = 2.5;
      for (const [a, b] of [[[-100, 1400], [1180, 1360]], [[120, 1700], [960, 1250]], [[960, 1700], [120, 1250]], [[540, 1220], [540, 1900]]]) { ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
      ctx.fillStyle = '#5a3a20'; for (const [x, y] of [[120, 1700], [960, 1250], [960, 1700], [120, 1250], [540, 1220]]) ctx.fillRect(x - 6, y - 30, 12, 34);
      // the outline of the altar to be: a square of white chalk
      ctx.strokeStyle = 'rgba(255,250,235,0.7)'; ctx.lineWidth = 4; ctx.strokeRect(380, 1330, 320, 120);
      ctx.restore();
    }
    if (fire > 0.01 && dawn < 0.99) {
      const a = 1 - dawn;
      KIT.glow(ctx, F.x, F.y - 300, 1300 * fire, '#ff5a1a', 0.5 * a);
      KIT.fire.pool(ctx, F.x, F.y + 120, 700, 160, T, 0.8 * a);
      const base = KIT.fire.altar(ctx, F.x, F.y + 40, 460, T, { light: 1 });
      KIT.fire.draw(ctx, F.x, base + 2, 820 * fire, T, { intensity: 1.2, width: 560 * Math.min(1, fire), seed: 47, glow: 1 });
      KIT.embers(ctx, T, { x: F.x, y: base - 200, spread: 500, rate: 30, life: 2.6, rise: 520, sway: 60, size: 3, alpha: 0.8 * a, seed: 801 });
    }
    if (o.after) o.after(ctx);
    ctx.restore();
  };

  // ─── Indra's heaven ────────────────────────────────────────────────────────
  EP8.svarga = (ctx, T, o = {}) => {
    ctx.save();
    const cam = o.cam || {};
    KIT.camera(ctx, { x: 540, y: 1100, zoom: cam.zoom || 1, dx: cam.dx || 0, dy: cam.dy || 0 });
    KIT.vgrad(ctx, -400, R.H + 300, [[0, '#4a7ac8'], [0.35, '#a8c8f0'], [0.6, '#fff0d0'], [1, '#f8e0b0']], -300, R.W + 300);
    KIT.glow(ctx, 540, 120, 900, '#fffbe8', 0.8);
    // the palace: white domes and banners floating on the clouds
    const px = 540, py = 980;
    ctx.fillStyle = '#f4ecdc';
    for (const [dx, w, h] of [[-300, 150, 260], [300, 150, 260], [0, 260, 420], [-150, 120, 200], [150, 120, 200]]) {
      ctx.fillRect(px + dx - w / 2, py - h, w, h);
      ctx.beginPath(); ctx.moveTo(px + dx - w / 2 - 10, py - h); ctx.quadraticCurveTo(px + dx, py - h - w * 0.9, px + dx + w / 2 + 10, py - h); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#e0b040'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(px + dx - w / 2 - 10, py - h); ctx.quadraticCurveTo(px + dx, py - h - w * 0.9, px + dx + w / 2 + 10, py - h); ctx.stroke();
      ctx.fillStyle = '#e0b040'; ctx.beginPath(); ctx.moveTo(px + dx - 5, py - h - w * 0.45); ctx.lineTo(px + dx, py - h - w * 0.45 - 50); ctx.lineTo(px + dx + 5, py - h - w * 0.45); ctx.fill();
      const sw = Math.sin(T * 2 + dx) * 8;
      ctx.fillStyle = '#c03a3a'; ctx.beginPath(); ctx.moveTo(px + dx, py - h - w * 0.45 - 50); ctx.lineTo(px + dx + 50 + sw, py - h - w * 0.45 - 40); ctx.lineTo(px + dx, py - h - w * 0.45 - 30); ctx.fill();
      ctx.fillStyle = '#f4ecdc';
      ctx.fillStyle = 'rgba(160,140,120,0.35)'; for (let i = 0; i < Math.floor(w / 40); i++) ctx.fillRect(px + dx - w / 2 + 14 + i * 40, py - h + 40, 16, h - 60);
      ctx.fillStyle = '#f4ecdc';
    }
    // banked mural clouds, in three layers drifting
    for (let L = 0; L < 3; L++) {
      const y = [1060, 1300, 1600][L], col = ['#fff8ea', '#f8eedc', '#f0e2c8'][L], line = ['#e8c890', '#d8b078', '#c89a60'][L];
      for (let i = -1; i < 5; i++) {
        const x = ((i * 300 + L * 120 + T * (8 + L * 6)) % 1500) - 200;
        EP5.cloud(ctx, x, y + Math.sin(i + L) * 30, 420 + L * 60, i * 3 + L * 11, col, line, 1);
      }
      ctx.fillStyle = col; ctx.fillRect(-300, y + 30, R.W + 600, R.H + 600);
    }
    if (o.after) o.after(ctx);
    ctx.restore();
  };

  // ─── serpents ──────────────────────────────────────────────────────────────
  const KINDS = [
    { fill: '#2a7a3a', band: '#9ae070', rim: '#d8ffb0' },   // green
    { fill: '#3a2a10', band: '#f0c040', rim: '#ffe8a0' },   // gold-banded
    { fill: '#8a1a14', band: '#ff7a50', rim: '#ffc0a0' },   // red
    { fill: '#0a0a0e', band: '#5a5a70', rim: '#c8c8e0', hood: true },   // black-hooded cobra
    { fill: '#1a3a7a', band: '#70b0ff', rim: '#c8e4ff' },   // blue
    { fill: '#6a5a2a', band: '#2a2010', rim: '#f8e8b0', spots: true },  // spotted
  ];
  EP8.KINDS = KINDS;
  EP8.serpent = (ctx, x, y, len, ang, T, seed, o = {}) => {
    const K = KINDS[((o.kind ?? seed) % KINDS.length + KINDS.length) % KINDS.length];
    const n = 22, pts = [], ws = [], w0 = o.w || 24, coil = o.coil || 0;
    for (let i = 0; i <= n; i++) {
      const u = i / n, wv = Math.sin(u * 9 - T * (o.speed ?? 7) + seed) * w0 * 0.9 * (0.3 + u);
      const a = ang + coil * u * u * 5 * Math.sin(seed);
      pts.push([x + Math.cos(a) * len * u - Math.sin(a) * wv, y + Math.sin(a) * len * u + Math.cos(a) * wv]);
      ws.push(lerp(w0, 3, Math.pow(u, 1.3)));
    }
    ctx.save(); ctx.globalAlpha = o.alpha ?? 1;
    ctx.fillStyle = K.rim; ctx.save(); ctx.translate(-1.5, -2); ctx.beginPath(); KIT.limbOutline(ctx, pts, ws.map((v) => v + 4)); ctx.fill(); ctx.restore();
    ctx.fillStyle = K.fill; ctx.beginPath(); KIT.limbOutline(ctx, pts, ws); ctx.fill();
    // bands / spots
    ctx.fillStyle = K.band;
    for (let i = 2; i < n - 1; i += 2) {
      const p = pts[i], q = pts[i + 1], an = Math.atan2(q[1] - p[1], q[0] - p[0]);
      ctx.save(); ctx.translate(p[0], p[1]); ctx.rotate(an);
      if (K.spots) { ctx.beginPath(); ctx.arc(0, 0, ws[i] * 0.22, 0, TAU); ctx.fill(); }
      else ctx.fillRect(-2, -ws[i] / 2, 4, ws[i]);
      ctx.restore();
    }
    // head (with a hood for cobras)
    const h = pts[0], nx = pts[2], ha = Math.atan2(h[1] - nx[1], h[0] - nx[0]);
    ctx.save(); ctx.translate(h[0], h[1]); ctx.rotate(ha);
    if (K.hood || o.hood) {
      ctx.fillStyle = K.rim; ctx.beginPath(); ctx.ellipse(-w0 * 0.6, 0, w0 * 1.2, w0 * 1.5, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = K.fill; ctx.beginPath(); ctx.ellipse(-w0 * 0.6, 0, w0 * 1.1, w0 * 1.38, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = K.band; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(-w0 * 0.6, -w0 * 0.4, w0 * 0.3, w0 * 0.25, 0, 0, TAU); ctx.ellipse(-w0 * 0.6, w0 * 0.4, w0 * 0.3, w0 * 0.25, 0, 0, TAU); ctx.stroke();
    }
    ctx.fillStyle = K.fill; ctx.beginPath(); ctx.ellipse(w0 * 0.3, 0, w0 * 0.85, w0 * 0.55, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#fff4c0'; ctx.beginPath(); ctx.arc(w0 * 0.5, -w0 * 0.22, Math.max(1.5, w0 * 0.1), 0, TAU); ctx.fill();
    ctx.strokeStyle = '#ff4a3a'; ctx.lineWidth = Math.max(1, w0 * 0.08); ctx.beginPath(); ctx.moveTo(w0 * 1.1, 0); ctx.lineTo(w0 * 1.6, Math.sin(T * 20 + seed) * w0 * 0.2); ctx.stroke();
    ctx.restore();
    ctx.restore();
  };

  /**
   * Serpents spiralling down into the fire at (cx, cy). n serpents; a (0..1) how far the
   * fall has begun (more of them, faster). Each one's path is a slow spiral from the
   * smoke above; when it reaches the fire it bursts into sparks. Pure in T.
   */
  EP8.fallers = (ctx, T, cx, cy, n, a, o = {}) => {
    if (a <= 0.01) return;
    for (let i = 0; i < n; i++) {
      const per = 2.6 + hash(i, 11) * 2.2, off = hash(i, 12) * per;
      const ph = ((T + off) % per) / per;
      if (hash(i, 13) > a + 0.05) continue;
      const u = E.inQuad(ph);
      const spin = hash(i, 14) * TAU + u * (2 + hash(i, 15) * 2);
      const rad = lerp(380 + hash(i, 16) * 260, 20, u);
      const x = cx + Math.cos(spin) * rad * (o.wide ?? 1), y = lerp(o.top ?? -150, cy - 40, u) + Math.sin(spin) * rad * 0.15;
      const len = (80 + hash(i, 17) * 220) * lerp(1, 0.7, u);
      const ang = Math.PI / 2 + Math.sin(spin) * 0.8;
      if (ph < 0.93) EP8.serpent(ctx, x, y, len, ang, T, i * 5 + 1, { kind: i, w: 8 + hash(i, 18) * 18, alpha: clamp(ph * 8) });
      else { const b = (ph - 0.93) / 0.07; KIT.glow(ctx, x, y, 140, '#ffb040', 0.7 * (1 - b)); KIT.embers(ctx, T, { x, y, spread: 60, rate: 12, life: 0.8, rise: 240, sway: 30, size: 2.5, alpha: 1 - b, seed: 900 + i }); }
    }
  };

  /** Gold mantra bands closing round a point (a serpent bound by the chant). */
  EP8.bindings = (ctx, x, y, r, T, a) => {
    if (a <= 0.01) return;
    ctx.save(); ctx.globalAlpha = a;
    ctx.strokeStyle = '#ffe08a'; ctx.shadowColor = '#ffb040'; ctx.shadowBlur = R.px(16); ctx.lineWidth = 6;
    for (let i = 0; i < 3; i++) {
      const rr = r * lerp(1.8, 1, a) * (0.7 + 0.15 * i), rot = T * (0.8 + i * 0.3) * (i % 2 ? -1 : 1);
      ctx.beginPath(); ctx.ellipse(x, y + (i - 1) * r * 0.4, rr, rr * 0.3, rot * 0.1, 0, TAU); ctx.stroke();
    }
    ctx.restore();
  };

  void E;
})();
