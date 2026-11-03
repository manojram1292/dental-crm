/*
 * Episode 6 · shared pieces for its scenes (not a scene itself). Loads after ep05/_common
 * (EP5.ghost, EP5.label, EP5.mouth, EP5.hex, EP5.cloud are reused).
 *
 * LOCATIONS, each with its own light:
 *   EP6.hermitage(ctx, T, o)  the teacher's hermitage at MORNING: pale blue-peach sky, a low
 *                             sun to the left, mist, a thatched hut with a lit doorway, a tulsi
 *                             altar, trees. Light: low and warm from the left.
 *   EP6.palace(ctx, T, o)     King Paushya's palace in WARM GOLD: ochre-gold walls, a scalloped
 *                             arcade, hanging lamps, red-gold drapes, a pierced stone lattice
 *                             (jali) at the back. o.behindJali(g) draws what moves behind it.
 *   EP6.road(ctx, T, o)       the forest road at DUSK with a stream; o.cleft (0..1) opens a
 *                             cleft in the earth at EP6.CLEFT.x (its green glow from below)
 *   EP6.naga(ctx, T, o)       the NAGA WORLD underground: deep blue-green bioluminescence,
 *                             hooded domes, glowing jewels in the rock, luminous stalks and
 *                             hanging roots, drifting motes. o = { cam, smoke (0..1: fire and
 *                             smoke pour in from the upper left), shaft (0..1: seen from the
 *                             shaft above, descending) }
 *   EP6.court(ctx, T, o)      Janamejaya's court at Hastinapura: saffron lamplight, pillars, a
 *                             parasol over the throne, lamp stands. o.fire (0..1): the great vow
 *                             fire roaring up behind the throne, serpents writhing in it.
 *   EP6.snake(ctx, x, y, len, ang, T, seed, o)   a serpent silhouette (dark, with a rim)
 *   EP6.CLEFT, EP6.light(x, y, lx, ly, k, front)
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP5 = window.EP5;
  const { TAU, clamp, lerp, hash, E, noise } = R;
  const EP6 = (window.EP6 = {});
  const hex = EP5.hex;

  EP6.light = (x, y, lx, ly, k = 1, front = 0.25) => ({ dir: Math.atan2(ly - y, lx - x), intensity: k, front });
  EP6.mouth = EP5.mouth; EP6.ghost = EP5.ghost; EP6.label = EP5.label;

  // ─── the teacher's hermitage, morning ──────────────────────────────────────
  let HTREES = null;
  EP6.HSUN = { x: 170, y: 760 };
  EP6.hermitage = (ctx, T, o = {}) => {
    if (!HTREES) { HTREES = []; for (let i = 0; i < 7; i++) HTREES.push({ tree: KIT.forest.makeTree(310 + i, { kind: i === 4 ? 'palm' : 'tall' }), x: [40, 160, 860, 960, 1050, 760, 280][i], h: 900 + hash(i, 4) * 500 }); }
    ctx.save();
    const cam = o.cam || {};
    KIT.camera(ctx, { x: 540, y: 1100, zoom: cam.zoom || 1, dx: cam.dx || 0, dy: cam.dy || 0 });
    const hz = 1080, S = EP6.HSUN;
    KIT.vgrad(ctx, -200, hz + 30, [[0, '#6a8ab0'], [0.5, '#b8c4c8'], [0.85, '#f0d0a8'], [1, '#ffd8a0']], -200, R.W + 200);
    KIT.glow(ctx, S.x, S.y, 600, '#ffe0a8', 0.6);
    ctx.fillStyle = '#fff2d0'; ctx.beginPath(); ctx.arc(S.x, S.y, 50, 0, TAU); ctx.fill();
    // far misty hills
    for (let L = 0; L < 2; L++) {
      ctx.fillStyle = L ? '#8a96a8' : '#a8b0bc';
      ctx.beginPath(); ctx.moveTo(-200, hz);
      for (let x = -200; x <= R.W + 200; x += 40) ctx.lineTo(x, hz - 120 + L * 60 - 80 * Math.sin(x * 0.005 + L * 1.7));
      ctx.lineTo(R.W + 200, hz + 40); ctx.closePath(); ctx.fill();
    }
    KIT.vgrad(ctx, hz, R.H + 300, [[0, '#7a8a5a'], [0.2, '#4a5a32'], [1, '#141a0c']], -200, R.W + 200);
    for (const t of HTREES) KIT.forest.drawTree(ctx, t.tree, t.x, hz + 140, t.h, '#1a2016', '#f0c080', [t.x < 540 ? -3 : 3, -2]);
    // the hut (left): mud walls, a thatched roof, a lit doorway
    const hx = 230, hy = 1390;
    ctx.fillStyle = '#6a4a30'; ctx.fillRect(hx - 190, hy - 300, 380, 300);
    ctx.fillStyle = '#9a7048'; ctx.fillRect(hx - 190, hy - 300, 60, 300);
    ctx.fillStyle = '#5a3c1e';
    ctx.beginPath(); ctx.moveTo(hx - 260, hy - 270); ctx.quadraticCurveTo(hx, hy - 560, hx + 260, hy - 270); ctx.quadraticCurveTo(hx, hy - 330, hx - 260, hy - 270); ctx.fill();
    ctx.strokeStyle = '#c8a060'; ctx.lineWidth = 2;
    for (let i = 0; i < 14; i++) { const x = hx - 220 + i * 33; ctx.beginPath(); ctx.moveTo(x, hy - 290 - Math.sin((i / 13) * Math.PI) * 200); ctx.lineTo(x - 8, hy - 280); ctx.stroke(); }
    ctx.fillStyle = '#1a0c06'; ctx.beginPath(); KIT.series.archPath(ctx, hx - 50, hy - 230, 100, 230, 40); ctx.fill();
    KIT.glow(ctx, hx, hy - 110, 160, '#ffb050', 0.35 * KIT.flicker(T, 12));
    // tulsi altar (right of the hut)
    const tx = 560, ty = 1420;
    ctx.fillStyle = '#c8a070'; ctx.fillRect(tx - 50, ty - 110, 100, 110); ctx.fillStyle = '#8a6040'; ctx.fillRect(tx - 60, ty - 120, 120, 16);
    ctx.fillStyle = '#2a4a20'; ctx.beginPath(); for (let i = 0; i < 6; i++) KIT.scallopPath(ctx, tx + (i - 2.5) * 16, ty - 150 - (i % 2) * 20, 22, 30, 6, i, 0.3); ctx.fill();
    // morning mist
    for (let i = 0; i < 4; i++) KIT.glow(ctx, (i * 330 + T * 12) % 1500 - 200, hz + 80 + i * 60, 420, '#f4ecdc', 0.18, 'screen', 0.25);
    if (o.after) o.after(ctx);
    ctx.restore();
  };

  // ─── King Paushya's palace, warm gold ───────────────────────────────────────
  EP6.palace = (ctx, T, o = {}) => {
    ctx.save();
    const cam = o.cam || {};
    KIT.camera(ctx, { x: 540, y: 1100, zoom: cam.zoom || 1, dx: cam.dx || 0, dy: cam.dy || 0 });
    KIT.vgrad(ctx, -200, R.H + 200, [[0, '#2a1408'], [0.35, '#6a3a14'], [0.62, '#8a5418'], [0.66, '#3a1e0c'], [1, '#140804']], -200, R.W + 200);
    // the jali: a pierced stone screen glowing with the light beyond
    const jx = 300, jy = 520, jw = 480, jh = 640;
    ctx.save();
    ctx.beginPath(); KIT.series.archPath(ctx, jx, jy, jw, jh, 140); ctx.clip();
    KIT.vgrad(ctx, jy, jy + jh, [[0, '#ffdc90'], [1, '#e89a40']], jx, jx + jw);
    if (o.behindJali) o.behindJali(ctx);
    ctx.fillStyle = '#5a2e10';
    const cell = 48;
    for (let y = jy; y < jy + jh + cell; y += cell) for (let x = jx; x < jx + jw + cell; x += cell) {
      ctx.beginPath(); ctx.rect(x - cell / 2, y - cell / 2, cell, cell);
      ctx.moveTo(x + 15, y); ctx.arc(x, y, 15, 0, TAU, true);
      ctx.moveTo(x + cell / 2 + 6, y + cell / 2); ctx.arc(x + cell / 2, y + cell / 2, 6, 0, TAU, true);
      ctx.fill('evenodd');
    }
    ctx.restore();
    ctx.strokeStyle = '#e8b050'; ctx.lineWidth = 6; ctx.beginPath(); KIT.series.archPath(ctx, jx, jy, jw, jh, 140); ctx.stroke();
    // scalloped arcade and pillars
    for (const x of [140, 940]) {
      ctx.fillStyle = '#4a240c'; ctx.fillRect(x - 46, 380, 92, 900);
      ctx.fillStyle = 'rgba(255,200,110,0.35)'; ctx.fillRect(x - 46, 380, 18, 900);
      for (const y of [520, 760, 1040]) { ctx.fillStyle = '#c88a30'; ctx.fillRect(x - 52, y, 104, 10); }
    }
    ctx.fillStyle = '#4a240c'; ctx.fillRect(-200, 340, R.W + 400, 60);
    ctx.fillStyle = '#c88a30'; for (let x = -180; x < R.W + 200; x += 60) { ctx.beginPath(); ctx.arc(x, 400, 30, 0, Math.PI); ctx.fill(); }
    // drapes
    for (const [x, s] of [[30, 1], [1050, -1]]) {
      ctx.fillStyle = '#8a1a14'; ctx.beginPath(); ctx.moveTo(x - 120 * s, 380); ctx.quadraticCurveTo(x + 40 * s + Math.sin(T) * 6, 800, x - 60 * s, 1300); ctx.lineTo(x - 200 * s, 1300); ctx.lineTo(x - 200 * s, 380); ctx.fill();
      ctx.strokeStyle = '#e8b050'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x - 120 * s, 380); ctx.quadraticCurveTo(x + 40 * s + Math.sin(T) * 6, 800, x - 60 * s, 1300); ctx.stroke();
    }
    // hanging lamps
    for (const [x, y] of [[180, 700], [900, 680], [540, 450]]) {
      const fl = KIT.flicker(T, x);
      ctx.strokeStyle = '#a8741f'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, 400); ctx.lineTo(x, y - 20); ctx.stroke();
      KIT.glow(ctx, x, y, 420, '#ffb850', 0.4 * fl);
      ctx.fillStyle = '#c88a30'; ctx.beginPath(); ctx.ellipse(x, y, 30, 12, 0, 0, Math.PI); ctx.fill();
      ctx.fillStyle = '#fff0b0'; ctx.beginPath(); ctx.ellipse(x, y - 10 * fl, 6, 16 * fl, 0, 0, TAU); ctx.fill();
    }
    // the floor: polished, with a lotus border
    KIT.vgrad(ctx, 1260, R.H + 200, [[0, '#7a4414'], [0.15, '#4a240c'], [1, '#140804']], -200, R.W + 200);
    ctx.fillStyle = 'rgba(232,176,80,0.5)'; ctx.fillRect(-200, 1262, R.W + 400, 6);
    KIT.glow(ctx, 540, 1300, 700, '#ffb040', 0.25, 'lighter', 0.3);
    if (o.after) o.after(ctx);
    ctx.restore();
  };
  EP6.PLAMP = { x: 540, y: 450 };

  // ─── the forest road at dusk, the stream, the cleft ─────────────────────────
  let RTREES = null;
  EP6.CLEFT = { x: 330, y: 1560 };
  EP6.road = (ctx, T, o = {}) => {
    if (!RTREES) { RTREES = []; for (let i = 0; i < 9; i++) RTREES.push({ tree: KIT.forest.makeTree(520 + i, { kind: i % 3 === 1 ? 'palm' : 'tall' }), x: -60 + i * 150 + hash(i, 3) * 40, h: 800 + hash(i, 5) * 600 }); }
    ctx.save();
    const cam = o.cam || {};
    KIT.camera(ctx, { x: 540, y: 1100, zoom: cam.zoom || 1, dx: cam.dx || 0, dy: cam.dy || 0 });
    const hz = 1180, night = clamp(o.night || 0);
    KIT.vgrad(ctx, -200, hz, [[0, hex('#1c2244', '#060818', night)], [0.55, hex('#5a3a5a', '#141030', night)], [1, hex('#e08a50', '#3a2030', night)]], -200, R.W + 200);
    for (const t of RTREES) KIT.forest.drawTree(ctx, t.tree, t.x, hz + 60, t.h, '#0a0808', hex('#e08050', '#6a4060', night), [t.x < 540 ? 3 : -3, 2]);
    KIT.vgrad(ctx, hz, R.H + 300, [[0, hex('#4a3020', '#1a1018', night)], [0.4, hex('#2a1a12', '#0c080a', night)], [1, '#060404']], -200, R.W + 200);
    // the road
    ctx.fillStyle = hex('#6a4a34', '#2a1e22', night);
    ctx.beginPath(); ctx.moveTo(-200, 1500); ctx.quadraticCurveTo(540, 1440, 1300, 1490); ctx.lineTo(1300, 1640); ctx.quadraticCurveTo(540, 1600, -200, 1660); ctx.closePath(); ctx.fill();
    // the stream (right), with the sky in it
    ctx.save();
    ctx.beginPath(); ctx.moveTo(760, 1300); ctx.quadraticCurveTo(900, 1420, 860, 1560); ctx.quadraticCurveTo(820, 1700, 940, 1900); ctx.lineTo(1300, 1900); ctx.lineTo(1300, 1300); ctx.closePath(); ctx.clip();
    KIT.vgrad(ctx, 1300, 1900, [[0, hex('#c8784a', '#3a2848', night)], [1, '#1a1428']], 700, 1300);
    ctx.strokeStyle = 'rgba(255,220,180,0.35)'; ctx.lineWidth = 3;
    for (let i = 0; i < 12; i++) { const y = 1320 + i * 50, x = 880 + Math.sin(T * 1.5 + i) * 30; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 60 + hash(i, 1) * 80, y); ctx.stroke(); }
    ctx.restore();
    // the cleft in the earth
    const c = clamp(o.cleft || 0);
    if (c > 0.01) {
      const { x, y } = EP6.CLEFT, w = 180 * c, h = 46 * c;
      KIT.glow(ctx, x, y - 20, 360 * c, '#30ffa0', 0.45 * c);
      ctx.fillStyle = '#020604';
      ctx.beginPath(); ctx.moveTo(x - w, y);
      for (let i = 0; i <= 8; i++) { const u = i / 8; ctx.lineTo(x - w + 2 * w * u, y - h * Math.sin(Math.PI * u) * (0.7 + 0.3 * hash(i, 9))); }
      for (let i = 8; i >= 0; i--) { const u = i / 8; ctx.lineTo(x - w + 2 * w * u, y + h * 0.6 * Math.sin(Math.PI * u) * (0.7 + 0.3 * hash(i, 8))); }
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = `rgba(120,255,190,${0.6 * c})`; ctx.lineWidth = 3; ctx.stroke();
    }
    if (o.after) o.after(ctx);
    ctx.restore();
  };

  // ─── the Naga world ────────────────────────────────────────────────────────
  function hoodDome(ctx, x, y, w, h, a) {
    // a palace dome shaped like a cobra's hood, with a finial
    ctx.beginPath(); ctx.moveTo(x - w / 2, y); ctx.bezierCurveTo(x - w * 0.75, y - h * 0.6, x - w * 0.2, y - h, x, y - h); ctx.bezierCurveTo(x + w * 0.2, y - h, x + w * 0.75, y - h * 0.6, x + w / 2, y); ctx.closePath();
    ctx.fill();
    ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = '#40e8a8'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(x - w * 0.12, y - h * 0.55, w * 0.07, h * 0.08, 0, 0, TAU); ctx.ellipse(x + w * 0.12, y - h * 0.55, w * 0.07, h * 0.08, 0, 0, TAU); ctx.stroke();
    ctx.restore();
  }
  EP6.naga = (ctx, T, o = {}) => {
    ctx.save();
    const cam = o.cam || {};
    KIT.camera(ctx, { x: 540, y: 1100, zoom: cam.zoom || 1, dx: cam.dx || 0, dy: cam.dy || 0 });
    KIT.vgrad(ctx, -1400, R.H + 400, [[0, '#000302'], [0.3, '#021410'], [0.5, '#04241e'], [0.7, '#06342a'], [1, '#010604']], -300, R.W + 300);
    // the shaft from the world above: rough rock walls narrowing down to the cavern roof
    ctx.fillStyle = '#020a08';
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(540 + s * 900, -1400); for (let y = -1400; y <= 200; y += 80) ctx.lineTo(540 + s * (180 + 60 * hash(y, 7) + Math.max(0, y + 200) * 2), y); ctx.lineTo(540 + s * 900, 200); ctx.closePath(); ctx.fill(); }
    KIT.glow(ctx, 540, -300, 500, '#20c880', 0.2);
    // far cavern arches
    for (let L = 0; L < 3; L++) {
      ctx.fillStyle = hex('#0a3a30', '#020c0a', L / 2);
      for (let i = -1; i < 5; i++) {
        const x = i * 300 + L * 110 + 60, w = 260 - L * 30;
        ctx.beginPath(); ctx.moveTo(x - w, R.H + 200); ctx.lineTo(x - w, 700 + L * 160); ctx.quadraticCurveTo(x, 360 + L * 180, x + w, 700 + L * 160); ctx.lineTo(x + w, R.H + 200);
        ctx.lineTo(x + w + 40, R.H + 200); ctx.lineTo(x + w + 40, -400); ctx.lineTo(x - w - 40, -400); ctx.lineTo(x - w - 40, R.H + 200); ctx.closePath(); ctx.fill('evenodd');
      }
      if (L === 0) {
        // hooded domes of the serpent city in the far arches
        ctx.fillStyle = '#0c4a3a';
        for (let i = 0; i < 7; i++) hoodDome(ctx, 80 + i * 160, 1180 + (i % 2) * 30, 120 + (i % 3) * 30, 200 + (i % 2) * 60, 0.5);
        KIT.glow(ctx, 540, 1100, 800, '#20c880', 0.2);
      }
    }
    // jewels in the rock (pure in T: they twinkle)
    for (let i = 0; i < 26; i++) {
      const x = hash(i, 21) * 1080, y = 300 + hash(i, 22) * 1300, tw = 0.5 + 0.5 * Math.sin(T * (1.5 + hash(i, 23)) + i);
      const col = ['#60ffc0', '#80c8ff', '#ffd870', '#ff7aa0'][i % 4];
      KIT.glow(ctx, x, y, 34, col, 0.35 * tw);
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x, y - 6); ctx.lineTo(x + 4, y); ctx.lineTo(x, y + 6); ctx.lineTo(x - 4, y); ctx.closePath(); ctx.fill();
    }
    // hanging luminous roots
    ctx.lineCap = 'round';
    for (let i = 0; i < 12; i++) {
      const x = hash(i, 31) * 1100 - 10, l = 200 + hash(i, 32) * 380, sw = Math.sin(T * 0.8 + i) * 12;
      ctx.strokeStyle = '#0a2a22'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x, 200); ctx.quadraticCurveTo(x + sw, 200 + l * 0.6, x + sw * 1.5, 200 + l); ctx.stroke();
      KIT.glow(ctx, x + sw * 1.5, 200 + l, 40, '#70ffc8', 0.6);
      ctx.fillStyle = '#c8ffe8'; ctx.beginPath(); ctx.arc(x + sw * 1.5, 200 + l, 5, 0, TAU); ctx.fill();
    }
    // the cavern floor and glowing stalks
    KIT.vgrad(ctx, 1480, R.H + 400, [[0, '#06281e'], [0.2, '#031410'], [1, '#010402']], -300, R.W + 300);
    for (let i = 0; i < 14; i++) {
      const x = hash(i, 41) * 1160 - 40, h = 90 + hash(i, 42) * 200, b = 1500 + hash(i, 43) * 300, sw = Math.sin(T * 1.1 + i) * 8;
      ctx.strokeStyle = '#0c3a2c'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x, b); ctx.quadraticCurveTo(x + sw, b - h * 0.6, x + sw * 1.4, b - h); ctx.stroke();
      KIT.glow(ctx, x + sw * 1.4, b - h, 50, '#40ffb0', 0.5 + 0.2 * Math.sin(T * 2 + i));
      ctx.fillStyle = '#b0ffe0'; ctx.beginPath(); ctx.ellipse(x + sw * 1.4, b - h, 7, 11, 0, 0, TAU); ctx.fill();
    }
    KIT.fireflies(ctx, T, { box: [0, 300, 1080, 1400], count: 40, seed: 66, size: 2.2, alpha: 0.8, color: '#40ffb0', core: '#d8fff0' });
    if (o.after) o.after(ctx);
    // fire and smoke pour in from the upper left (the turning of the tale)
    const sm = clamp(o.smoke || 0);
    if (sm > 0.01) {
      KIT.glow(ctx, 60, 300, 900 * sm, '#ff7a20', 0.5 * sm);
      KIT.smoke.draw(ctx, 80, 300, T, { h: -900 * sm, w: 200, strands: 5, alpha: 0.5 * sm, color: '#4a3a3a', lean: 700 * sm, speed: 1.6, seed: 13, curls: 1, spread: 1.4 });
      KIT.embers(ctx, T, { x: 120, y: 360, spread: 300, rate: 30 * sm, life: 2, rise: -260, sway: 60, size: 3, alpha: sm, seed: 71, lean: 5 });
    }
    ctx.restore();
  };

  // ─── a serpent silhouette ──────────────────────────────────────────────────
  EP6.snake = (ctx, x, y, len, ang, T, seed, o = {}) => {
    const n = 18, pts = [], ws = [];
    for (let i = 0; i <= n; i++) {
      const u = i / n, wv = Math.sin(u * 9 - T * 6 + seed) * 22 * (0.3 + u);
      pts.push([x + Math.cos(ang) * len * u - Math.sin(ang) * wv, y + Math.sin(ang) * len * u + Math.cos(ang) * wv]);
      ws.push(lerp(o.w || 26, 4, u));
    }
    ctx.save();
    ctx.fillStyle = o.fill || '#120604';
    ctx.beginPath(); KIT.limbOutline(ctx, pts, ws); ctx.fill();
    ctx.beginPath(); ctx.ellipse(pts[0][0], pts[0][1], (o.w || 26) * 0.9, (o.w || 26) * 0.6, ang + Math.PI, 0, TAU); ctx.fill();
    if (o.rim) { ctx.strokeStyle = o.rim; ctx.lineWidth = 2.5; ctx.beginPath(); KIT.limbOutline(ctx, pts, ws); ctx.stroke(); }
    ctx.restore();
  };

  // ─── Janamejaya's court, saffron lamplight ─────────────────────────────────
  EP6.court = (ctx, T, o = {}) => {
    ctx.save();
    const cam = o.cam || {};
    KIT.camera(ctx, { x: 540, y: 1100, zoom: cam.zoom || 1, dx: cam.dx || 0, dy: cam.dy || 0 });
    const fire = clamp(o.fire || 0);
    KIT.vgrad(ctx, -200, R.H + 200, [[0, hex('#140806', '#2a0604', fire)], [0.45, hex('#3a160a', '#8a2a0a', fire)], [0.66, '#24100a'], [1, '#0a0403']], -200, R.W + 200);
    // the great fire of the vow behind the throne
    if (fire > 0.01) {
      KIT.glow(ctx, 360, 1100, 1100 * fire, '#ff6a1a', 0.55 * fire);
      KIT.fire.draw(ctx, 380, 1300, 1100 * fire, T, { intensity: 1.1, width: 900 * fire, seed: 17, glow: 1 });
      for (let i = 0; i < 9; i++) {
        const ph = ((T * 0.45 + hash(i, 5)) % 1);
        const sx = 120 + hash(i, 6) * 560, sy = lerp(-200, 1250, ph);
        EP6.snake(ctx, sx, sy, 160 + hash(i, 7) * 120, Math.PI / 2 + (hash(i, 8) - 0.5) * 1.2, T, i * 3, { w: 18 + hash(i, 9) * 12, fill: '#1a0402', rim: 'rgba(255,170,80,0.7)' });
      }
    }
    // pillars with lamp stands
    for (const x of [80, 1000]) {
      ctx.fillStyle = '#2a120a'; ctx.fillRect(x - 50, 300, 100, 1000);
      ctx.fillStyle = `rgba(255,150,60,${0.3 + 0.3 * fire})`; ctx.fillRect(x + (x < 540 ? 30 : -50), 300, 20, 1000);
      for (const y of [500, 820]) { ctx.fillStyle = '#b8782a'; ctx.fillRect(x - 56, y, 112, 10); }
    }
    for (const x of [240, 860]) {
      const fl = KIT.flicker(T, x);
      ctx.fillStyle = '#3a1e0c'; ctx.fillRect(x - 6, 1000, 12, 300); ctx.fillRect(x - 40, 1290, 80, 14);
      ctx.beginPath(); ctx.ellipse(x, 1000, 34, 12, 0, 0, Math.PI); ctx.fill();
      KIT.glow(ctx, x, 980, 380, '#ff9a3a', 0.45 * fl);
      KIT.fire.draw(ctx, x, 1000, 70, T, { intensity: 0.9, seed: x, embers: false, glow: 0.5 });
    }
    // the parasol (chhatra) over the throne
    const px = o.throneX ?? 300;
    ctx.fillStyle = '#e8b050'; ctx.fillRect(px - 4, 520, 8, 200);
    ctx.fillStyle = '#c0281c'; ctx.beginPath(); ctx.moveTo(px - 210, 600); ctx.quadraticCurveTo(px, 380, px + 210, 600); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#e8b050'; for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.arc(px - 200 + i * 50, 606, 9, 0, TAU); ctx.fill(); }
    // the floor
    KIT.vgrad(ctx, 1300, R.H + 200, [[0, '#5a2a12'], [0.15, '#2a120a'], [1, '#080302']], -200, R.W + 200);
    ctx.fillStyle = 'rgba(232,176,80,0.5)'; ctx.fillRect(-200, 1300, R.W + 400, 5);
    if (o.after) o.after(ctx);
    ctx.restore();
  };

  /** A king's crown fallen on its side (Parikshit's), gold. */
  EP6.fallenCrown = (ctx, x, y, s, a = 1) => {
    if (a <= 0.01) return;
    ctx.save(); ctx.translate(x, y); ctx.rotate(-1.2); ctx.scale(s, s); ctx.globalAlpha = a;
    const g = ctx.createLinearGradient(-60, -200, 60, 0); g.addColorStop(0, '#fff0b0'); g.addColorStop(0.5, '#e7b54a'); g.addColorStop(1, '#8a5a18');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(-60, 0); ctx.lineTo(60, 0); ctx.lineTo(50, -40); ctx.lineTo(-50, -40); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-46, -40); ctx.lineTo(-30, -110); ctx.lineTo(30, -110); ctx.lineTo(46, -40); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-26, -110); ctx.lineTo(0, -180); ctx.lineTo(26, -110); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#c0182a'; ctx.beginPath(); ctx.arc(0, -70, 10, 0, TAU); ctx.fill();
    ctx.restore();
  };

  void E; void noise;
})();
