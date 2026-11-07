/*
 * Episodes 31–40 · THE ASTIKA ARC · shared pieces (not a scene). Loads after ep17/_common, ep15/_common, ep11/_common,
 * ep08/_common, ep07/_common, ep06/_common, ep05/_common. Every episode of the arc loads this file; each episode adds its
 * own new places in its own _common.js.
 *
 * LIGHTS (characters keep their signature light; the place gives direction, strength, and from ep 31 a FILL so faces
 * read on bright grounds):
 *   EPA.lit(x, y, lx, ly, k, front, fill)   a light toward (lx, ly)
 * LOCATIONS:
 *   EPA.penance(ctx, T, o)   THE HOLY PLACES BEFORE DAWN (ep 31): indigo sky, stars, an ash-silver horizon; o.place 0..4
 *                            (Gandhamadana · Badari · Gokarna · Pushkara · the Himalaya), o.rose (0..1: Brahma's rose-gold
 *                            dawn flooding in), o.cam, o.after(g)
 *   EPA.under(ctx, T, o)     BENEATH THE EARTH (ep 31): a cavern lit from below by Shesha's own pearl glow; the underside of
 *                            the earth above. o.glow (0..1), o.shake (0..1), o.cam, o.after(g)
 *   EPA.earth(ctx, x, y, w, T, o)   the earth as a painted disc seen from the side: mountains, forests, seas, towns on top,
 *                            strata below. o.tilt (rad), o.lights (0..1: lamps in the towns)
 *   EPA.hall(ctx, T, o)      VASUKI'S HALL in the Naga world (eps 31–38): jewelled pillars with hooded capitals, a
 *                            throne-coil. o.mood: 'violet' (council, default) · 'gold' (a wedding: lamps) · 'dusk'
 *                            (the sunset rite: a slanting shaft of red-gold from the world above) · 'dawn' (a boy's
 *                            lessons), o.cam, o.after(g)
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP11 = window.EP11, EP17 = window.EP17;
  const { TAU, clamp, lerp, hash } = R;
  const hex = EP11.hex;
  const EPA = (window.EPA = {});
  EPA.mouth = EP17.mouth; EPA.plaque = EP17.plaque; EPA.hex = hex;
  EPA.lit = (x, y, lx, ly, k = 1.05, front = 0.5, fill = 0.35) => ({ dir: Math.atan2(ly - (y - 600), lx - x), intensity: k, front, fill });

  // ── the holy places before dawn ────────────────────────────────────────
  const PLACES = 5;
  function placeSilhouette(ctx, i, T, hz, col) {
    ctx.fillStyle = col;
    if (i === 0) { // Gandhamadana: a fragrant mountain, round-topped trees, petals
      ctx.beginPath(); ctx.moveTo(-300, hz); ctx.quadraticCurveTo(200, hz - 700, 540, hz - 760); ctx.quadraticCurveTo(900, hz - 700, 1380, hz); ctx.fill();
      for (let k = 0; k < 9; k++) { const x = 60 + k * 120, y = hz - 40 - 30 * hash(k, 3); ctx.beginPath(); ctx.arc(x, y - 90, 70 + 20 * hash(k, 5), 0, TAU); ctx.fill(); ctx.fillRect(x - 8, y - 60, 16, 70); }
    } else if (i === 1) { // Badari: a jujube tree by a fast river, the hills behind
      ctx.beginPath(); ctx.moveTo(-300, hz); for (let x = -300; x <= 1380; x += 120) ctx.lineTo(x, hz - 260 - 120 * Math.sin(x * 0.006 + 1)); ctx.lineTo(1380, hz); ctx.fill();
      ctx.beginPath(); ctx.moveTo(300, hz); ctx.quadraticCurveTo(320, hz - 300, 260, hz - 520); ctx.lineTo(300, hz - 520); ctx.quadraticCurveTo(360, hz - 300, 360, hz); ctx.fill();
      for (let k = 0; k < 14; k++) { ctx.beginPath(); ctx.arc(280 + Math.cos(k) * 190 * hash(k, 1), hz - 560 + Math.sin(k * 2) * 110, 80, 0, TAU); ctx.fill(); }
    } else if (i === 2) { // Gokarna: a sea cliff with a shrine, the shore
      ctx.beginPath(); ctx.moveTo(-300, hz); ctx.lineTo(-300, hz - 520); ctx.lineTo(380, hz - 560); ctx.lineTo(520, hz - 380); ctx.lineTo(640, hz); ctx.fill();
      ctx.beginPath(); ctx.moveTo(150, hz - 556); ctx.lineTo(150, hz - 700); ctx.lineTo(230, hz - 800); ctx.lineTo(310, hz - 700); ctx.lineTo(310, hz - 556); ctx.fill();
    } else if (i === 3) { // Pushkara: a lotus lake ringed by low hills
      ctx.beginPath(); ctx.moveTo(-300, hz); for (let x = -300; x <= 1380; x += 90) ctx.lineTo(x, hz - 140 - 60 * Math.sin(x * 0.01)); ctx.lineTo(1380, hz); ctx.fill();
    } else { // the Himalaya: snow peaks
      ctx.beginPath(); ctx.moveTo(-300, hz); const pk = [[-100, 700], [180, 980], [420, 760], [640, 1180], [900, 820], [1200, 1000], [1400, 600]];
      for (const [x, h] of pk) ctx.lineTo(x, hz - h); ctx.lineTo(1400, hz); ctx.fill();
      ctx.fillStyle = 'rgba(230,236,255,0.85)';
      for (const [x, h] of pk) { ctx.beginPath(); ctx.moveTo(x, hz - h); ctx.lineTo(x - 90, hz - h + 160); ctx.lineTo(x - 20, hz - h + 120); ctx.lineTo(x + 30, hz - h + 170); ctx.lineTo(x + 100, hz - h + 150); ctx.closePath(); ctx.fill(); }
    }
    void T;
  }
  EPA.penance = (ctx, T, o = {}) => {
    ctx.save();
    const cam = o.cam || {}, i = ((o.place ?? 4) % PLACES + PLACES) % PLACES, rose = clamp(o.rose || 0), hz = o.hz ?? 1300;
    KIT.camera(ctx, { x: 540, y: 1000, zoom: cam.zoom || 1, dx: cam.dx || 0, dy: cam.dy || 0 });
    KIT.vgrad(ctx, -800, hz, [[0, hex('#060a24', '#3a1a40', rose)], [0.55, hex('#141c48', '#a04a6a', rose)], [0.85, hex('#4a5478', '#ff9a8a', rose)], [1, hex('#b8c0d0', '#ffe0b0', rose)]], -500, R.W + 500);
    for (let k = 0; k < 70; k++) { const x = hash(k, 1) * 1800 - 360, y = -700 + hash(k, 2) * (hz + 300); ctx.globalAlpha = (1 - rose) * (0.4 + 0.5 * Math.sin(T * 1.5 + k * 3)) * (1 - y / hz); ctx.fillStyle = '#f0f4ff'; ctx.beginPath(); ctx.arc(x, y, 2.2 + 2 * hash(k, 3), 0, TAU); ctx.fill(); }
    ctx.globalAlpha = 1;
    if (rose > 0) KIT.glow(ctx, 540, hz - 200, 1300, '#ffb0a0', 0.7 * rose);
    placeSilhouette(ctx, i, T, hz, hex('#1a2034', '#4a2a3a', rose));
    // the ground: ash-pale in starlight, rose at Brahma's coming
    KIT.vgrad(ctx, hz, R.H + 700, [[0, hex('#5a6278', '#c88a7a', rose)], [0.25, hex('#2a3044', '#6a3a40', rose)], [1, '#0a0c14']], -500, R.W + 500);
    if (i === 3) { // the lotus lake
      ctx.fillStyle = hex('#2a3a5a', '#d08aa0', rose); ctx.beginPath(); ctx.ellipse(540, hz + 140, 760, 110, 0, 0, TAU); ctx.fill();
      for (let k = 0; k < 9; k++) { const x = 140 + k * 100, y = hz + 110 + 40 * hash(k, 9); ctx.fillStyle = hex('#c8c0d8', '#ffd0dc', rose); ctx.beginPath(); ctx.ellipse(x, y, 26, 12, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.moveTo(x - 10, y - 4); ctx.lineTo(x, y - 30); ctx.lineTo(x + 10, y - 4); ctx.fill(); }
    }
    if (i === 2) { ctx.fillStyle = hex('#3a4a6a', '#e0a0a0', rose); ctx.fillRect(560, hz + 10, 1000, 60); for (let k = 0; k < 6; k++) { ctx.globalAlpha = 0.5; ctx.fillStyle = '#e0e8ff'; ctx.fillRect(((k * 260 + T * 30) % 900) + 560, hz + 30 + k * 6, 120, 3); } ctx.globalAlpha = 1; }
    if (o.after) o.after(ctx);
    ctx.restore();
  };
  EPA.PLACES = PLACES;

  // ── the earth as a disc ────────────────────────────────────────────────
  EPA.earth = (ctx, x, y, w, T, o = {}) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(o.tilt || 0);
    const h = w * 0.16, li = clamp(o.lights ?? 0);
    // strata below (the earth's thickness), then the top surface
    const sg = ctx.createLinearGradient(0, 0, 0, h * 1.6); sg.addColorStop(0, '#6a4a2a'); sg.addColorStop(0.4, '#4a3020'); sg.addColorStop(1, '#2a1a12');
    ctx.fillStyle = sg; ctx.beginPath(); ctx.ellipse(0, 0, w / 2, h, 0, 0, Math.PI); ctx.lineTo(-w / 2, 0); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-w / 2, 0); ctx.quadraticCurveTo(-w * 0.3, h * 2.4, 0, h * 2.6); ctx.quadraticCurveTo(w * 0.3, h * 2.4, w / 2, 0); ctx.fill();
    ctx.strokeStyle = 'rgba(255,220,160,0.25)'; ctx.lineWidth = 3;
    for (let k = 1; k < 4; k++) { ctx.beginPath(); ctx.ellipse(0, 0, w / 2 * (1 - k * 0.12), h + k * h * 0.45, 0, 0.15, Math.PI - 0.15); ctx.stroke(); }
    // roots hanging from the underside
    ctx.strokeStyle = '#3a2614'; ctx.lineWidth = 6;
    for (let k = 0; k < 12; k++) { const rx = (hash(k, 4) - 0.5) * w * 0.7, ry = h * (0.8 + 1.4 * (1 - Math.abs(rx) / (w * 0.5))); ctx.beginPath(); ctx.moveTo(rx, ry * 0.7); ctx.quadraticCurveTo(rx + 20, ry + 40, rx - 10 + 6 * Math.sin(T + k), ry + 90); ctx.stroke(); }
    // the top: seas (blue), lands (green), mountains, towns
    ctx.fillStyle = '#2a6a8a'; ctx.beginPath(); ctx.ellipse(0, 0, w / 2, h, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#4a7a3a'; ctx.beginPath(); ctx.ellipse(-w * 0.06, -h * 0.05, w * 0.36, h * 0.66, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#d8e8f0'; ctx.globalAlpha = 0.5; for (let k = 0; k < 5; k++) { ctx.fillRect(w * (0.33 + k * 0.02), -h * 0.2 + k * h * 0.12, w * 0.05, 2); } ctx.globalAlpha = 1;
    for (let k = 0; k < 7; k++) { const mx = (hash(k, 7) - 0.55) * w * 0.6, my = (hash(k, 8) - 0.6) * h * 0.8, mh = w * (0.06 + 0.05 * hash(k, 9)); ctx.fillStyle = '#5a5a6a'; ctx.beginPath(); ctx.moveTo(mx - mh * 0.7, my); ctx.lineTo(mx, my - mh); ctx.lineTo(mx + mh * 0.7, my); ctx.fill(); ctx.fillStyle = '#f0f0f8'; ctx.beginPath(); ctx.moveTo(mx - mh * 0.2, my - mh * 0.72); ctx.lineTo(mx, my - mh); ctx.lineTo(mx + mh * 0.2, my - mh * 0.72); ctx.fill(); }
    for (let k = 0; k < 10; k++) { const tx = (hash(k, 11) - 0.5) * w * 0.55, ty = (hash(k, 12) - 0.5) * h * 0.9; ctx.fillStyle = '#2a5a2a'; ctx.beginPath(); ctx.arc(tx, ty - w * 0.012, w * 0.016, 0, TAU); ctx.fill(); }
    for (let k = 0; k < 5; k++) { const tx = (hash(k, 13) - 0.4) * w * 0.5, ty = (hash(k, 14) - 0.3) * h * 0.6; ctx.fillStyle = '#e8d0a0'; ctx.fillRect(tx - w * 0.015, ty - w * 0.02, w * 0.03, w * 0.02); ctx.beginPath(); ctx.moveTo(tx - w * 0.018, ty - w * 0.02); ctx.lineTo(tx, ty - w * 0.036); ctx.lineTo(tx + w * 0.018, ty - w * 0.02); ctx.fill(); if (li > 0) KIT.glow(ctx, tx, ty - w * 0.015, w * 0.04, '#ffd080', 0.8 * li); }
    ctx.strokeStyle = 'rgba(255,240,200,0.5)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, 0, w / 2, h, 0, 0, TAU); ctx.stroke();
    ctx.restore();
  };

  // ── beneath the earth ──────────────────────────────────────────────────
  EPA.under = (ctx, T, o = {}) => {
    ctx.save();
    const cam = o.cam || {}, gl = clamp(o.glow ?? 1), sh = clamp(o.shake || 0);
    KIT.camera(ctx, { x: 540, y: 1000, zoom: cam.zoom || 1, dx: (cam.dx || 0) + sh * 14 * Math.sin(T * 31), dy: (cam.dy || 0) + sh * 10 * Math.sin(T * 27) });
    KIT.vgrad(ctx, -800, R.H + 700, [[0, '#0a0610'], [0.5, '#120c1e'], [1, '#04030a']], -500, R.W + 500);
    // cavern walls: layered rock arches in deep indigo-violet
    for (let L = 0; L < 3; L++) {
      ctx.fillStyle = hex('#2a2040', '#0a0814', L / 2);
      for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(540 + s * 1100, -800); for (let y = -800; y <= R.H + 700; y += 100) ctx.lineTo(540 + s * (520 - L * 60 + 90 * Math.sin(y * 0.004 + L) + 50 * hash(y, L)), y); ctx.lineTo(540 + s * 1100, R.H + 700); ctx.fill(); }
    }
    // the pearl glow from below (Shesha's own light) and drifting motes
    KIT.glow(ctx, 540, 1500, 1200, '#f0e8d0', 0.55 * gl);
    KIT.glow(ctx, 540, 1300, 600, '#ffe8b0', 0.4 * gl);
    for (let k = 0; k < 30; k++) { const y = ((hash(k, 2) * 2400 - T * (20 + 30 * hash(k, 3))) % 2400 + 2400) % 2400 - 500, x = 140 + hash(k, 1) * 800; ctx.globalAlpha = 0.5 * gl * (0.5 + 0.5 * Math.sin(T * 2 + k)); ctx.fillStyle = '#fff4d8'; ctx.beginPath(); ctx.arc(x, y, 3 + 3 * hash(k, 4), 0, TAU); ctx.fill(); }
    ctx.globalAlpha = 1;
    if (o.after) o.after(ctx);
    ctx.restore();
  };

  // ── Vasuki's hall in the Naga world ────────────────────────────────────
  const MOODS = {
    violet: { sky: ['#06041a', '#140c3a', '#2a1a5a'], floor: ['#1a1240', '#06041a'], pillar: '#140e32', cap: '#8a7aff', glow: '#8a7aff', jewel: '#ff2a5a' },
    gold: { sky: ['#140804', '#3a1c0a', '#6a3a14'], floor: ['#4a2a10', '#140804'], pillar: '#2a160a', cap: '#ffc860', glow: '#ffb050', jewel: '#ffe080' },
    dusk: { sky: ['#0a0408', '#2a0e1a', '#4a1a24'], floor: ['#3a1a1a', '#0a0406'], pillar: '#200c14', cap: '#ff8a5a', glow: '#ff7040', jewel: '#ff4030' },
    dawn: { sky: ['#0a1018', '#1a3040', '#4a6a7a'], floor: ['#2a3a44', '#0a1014'], pillar: '#142028', cap: '#a8e0e8', glow: '#c8f0f0', jewel: '#ffd080' },
  };
  EPA.hall = (ctx, T, o = {}) => {
    ctx.save();
    const cam = o.cam || {}, M = MOODS[o.mood || 'violet'];
    KIT.camera(ctx, { x: 540, y: 1000, zoom: cam.zoom || 1, dx: cam.dx || 0, dy: cam.dy || 0 });
    KIT.vgrad(ctx, -800, 1500, [[0, M.sky[0]], [0.6, M.sky[1]], [1, M.sky[2]]], -500, R.W + 500);
    KIT.glow(ctx, 540, 900, 900, M.glow, 0.25);
    // far arcade of hooded arches
    ctx.fillStyle = M.pillar;
    for (let k = -2; k < 8; k++) { const x = k * 180 + 30; ctx.globalAlpha = 0.7; ctx.beginPath(); ctx.moveTo(x - 60, 1500); ctx.lineTo(x - 60, 820); ctx.quadraticCurveTo(x, 700, x + 60, 820); ctx.lineTo(x + 60, 1500); ctx.fill(); }
    ctx.globalAlpha = 1;
    // the floor: polished, reflecting
    KIT.vgrad(ctx, 1500, R.H + 700, [[0, M.floor[0]], [1, M.floor[1]]], -500, R.W + 500);
    ctx.strokeStyle = M.cap; ctx.globalAlpha = 0.2; ctx.lineWidth = 2;
    for (let k = 0; k < 9; k++) { ctx.beginPath(); ctx.moveTo(-500, 1520 + k * k * 14); ctx.lineTo(R.W + 500, 1520 + k * k * 14); ctx.stroke(); }
    for (let k = -6; k < 8; k++) { ctx.beginPath(); ctx.moveTo(540 + k * 40, 1500); ctx.lineTo(540 + k * 260, R.H + 700); ctx.stroke(); }
    ctx.globalAlpha = 1;
    // near pillars with hooded capitals and jewels
    for (const px of [-60, 1140]) {
      ctx.fillStyle = M.pillar; ctx.fillRect(px - 70, 300, 140, 1500);
      ctx.fillStyle = M.cap; ctx.globalAlpha = 0.85; ctx.beginPath(); ctx.moveTo(px - 70, 420); ctx.bezierCurveTo(px - 200, 360, px - 140, 160, px, 140); ctx.bezierCurveTo(px + 140, 160, px + 200, 360, px + 70, 420); ctx.fill(); ctx.globalAlpha = 1;
      ctx.fillStyle = M.jewel; ctx.beginPath(); ctx.arc(px, 290, 16, 0, TAU); ctx.fill(); KIT.glow(ctx, px, 290, 70, M.jewel, 0.6 + 0.2 * Math.sin(T * 2 + px));
    }
    // jewels twinkling in the vault
    for (let k = 0; k < 24; k++) { ctx.globalAlpha = 0.5 + 0.5 * Math.sin(T * 1.7 + k * 2.3); ctx.fillStyle = k % 3 ? M.cap : M.jewel; ctx.beginPath(); ctx.arc(hash(k, 1) * 1400 - 160, hash(k, 2) * 700 - 200, 3 + 3 * hash(k, 3), 0, TAU); ctx.fill(); }
    ctx.globalAlpha = 1;
    if (o.mood === 'dusk') { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.22; ctx.fillStyle = '#ff9a50'; ctx.beginPath(); ctx.moveTo(760, -800); ctx.lineTo(980, -800); ctx.lineTo(560, R.H + 400); ctx.lineTo(120, R.H + 400); ctx.closePath(); ctx.fill(); ctx.restore(); }
    if (o.mood === 'gold') for (let k = 0; k < 8; k++) { const x = 120 + k * 120, y = 1440; ctx.fillStyle = '#3a2008'; ctx.fillRect(x - 10, y, 20, 60); KIT.glow(ctx, x, y - 10, 70, '#ffc060', 0.7 * KIT.flicker(T, k)); ctx.fillStyle = '#ffe8a0'; ctx.beginPath(); ctx.ellipse(x, y - 8, 6, 14, 0, 0, TAU); ctx.fill(); }
    if (o.after) o.after(ctx);
    ctx.restore();
  };
  EPA.MOODS = MOODS;
  void lerp;
})();
/* EPA.shesha(g, x, y, s, T, o): Shesha (CH.ananta) rearing STRAIGHT UP, so his canopy of seven heads faces the sky and can
   carry the earth. o.k (0..1 rise), o.w (thickness: 130 healthy · 70 skin and bone), o.light, o.key, o.sway, o.lean. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA;
  const { TAU, lerp } = R;
  EPA.shesha = (g, x, y, s, T, o = {}) => {
    const k = o.k ?? 1, H = lerp(300, 1000, k), sw = (o.sway ?? 1) * Math.sin(T * 0.9) * 16, lean = o.lean || 0;
    const path = [];
    for (let i = 0; i <= 46; i++) {
      const u = i / 46;
      if (u < 0.5) { const v = u / 0.5; path.push([sw * (1 - v) + lean * (1 - v) * H + Math.sin(v * 3.2) * 50 * v, lerp(-H, -90, v)]); }
      else { const v = (u - 0.5) / 0.5, a = v * TAU * 1.15 + Math.PI / 2; path.push([Math.cos(a) * 300 * (1 - 0.3 * v), -70 - Math.sin(a) * 60]); }
    }
    KIT.characters.ananta.draw(g, { x, y, scale: s, facing: o.facing || 'left', pose: { name: 'rope', path, head: true, tail: true, w: o.w || 130, w0: o.w || 130 }, light: o.light, alpha: o.alpha, t: T, key: o.key || 'shesha' });
  };
})();
