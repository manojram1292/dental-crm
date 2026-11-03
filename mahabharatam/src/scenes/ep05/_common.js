/*
 * Episode 5 · shared pieces for its scenes (not a scene itself). Episode 6 loads it too
 * ('ep05/_common'): its recap remembers Sarama's curse with EP5.curseTableau.
 *
 * LOCATIONS, each with its own light (characters keep their signature light; only its
 * direction and strength come from the place):
 *   EP5.enclosure(ctx, T, o)   the sacrificial enclosure at KURUKSHETRA BY DAY: a high
 *                              teal-and-ochre mural sky with the sun to the right, drifting
 *                              scalloped clouds, the plain (the old lakes of Samantapanchaka
 *                              glinting on the horizon), the thatched pavilion, three
 *                              sacrificial posts (yupa) with red bands, pennants, the altar
 *                              and its fire. o = { cam: {zoom, dx, dy}, dark (0..1: the curse
 *                              darkens the day, the sun is eclipsed), fireH, fire (0..1.2),
 *                              wind (pennants), pavilion (true), yupas (true) }
 *   EP5.sunLight(x, y, dark)   a character light toward the sun (dims with dark)
 *   EP5.SUN, EP5.HZ, EP5.GROUND (the figures' ground line)
 *   EP5.offerings(ctx, x, y, s, glow)   a leaf platter: rice, ghee pot, flowers (untouched)
 *   EP5.heaven(ctx, T, o)      Sarama's place: a ridge above the clouds at a rose-pearl dawn
 *   EP5.palace(ctx, T, o)      HASTINAPURA at night: a colonnade of carved pillars with oil lamps
 *                              (amber pools on a dark polished floor). o = { cam, scroll (px) }
 *   EP5.duskRoad(ctx, T, o)    a forest road at dusk, far away; the hood rising behind the hills
 *   EP5.curseTableau(ctx, T, o) Sarama towering over the king in the darkened enclosure (the
 *                              key image: episode 6's recap)
 *   EP5.mouth(env, t)          speech envelope (= EP2.mouth when loaded)
 *   EP5.label(ctx, text, x, y, a, o)   a gold place / name label with a small ornament
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT;
  const { TAU, clamp, lerp, hash, E, PAL, noise } = R;
  const CH = KIT.characters;
  const EP5 = (window.EP5 = {});

  const HZ = 1010, GROUND = 1470;
  const SUN = { x: 830, y: 360 };
  EP5.HZ = HZ; EP5.GROUND = GROUND; EP5.SUN = SUN;

  /** Mix two hex colours → hex (R.mix returns an rgba() string, which glow sprites and smoke can't take). */
  const hex = (a, b, t) => '#' + R.mixRgb(a, b, clamp(t)).map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
  EP5.hex = hex;

  EP5.mouth = (env, t) => {
    let m = 0;
    for (const w of env.words) {
      if (t >= w.t0 && t <= w.t1) { const u = (t - w.t0) / Math.max(0.05, w.t1 - w.t0); m = Math.max(m, Math.sin(Math.PI * u) * (0.6 + 0.4 * Math.sin(t * 23))); }
    }
    return clamp(m);
  };

  EP5.sunLight = (x, y, dark = 0, front = 0.34) => ({ dir: Math.atan2(SUN.y - y, SUN.x - x), intensity: lerp(1, 0.55, dark), front: front * (1 - dark) });

  EP5.label = (ctx, text, x, y, a, o = {}) => {
    if (a <= 0.003 || !text) return;
    KIT.goldText(ctx, text, x, y, { size: o.size || 58, spacing: o.spacing ?? 8, weight: 600, alpha: a, reveal: clamp(a * 1.3), sheen: o.sheen ?? -1, glow: 0.3, key: o.key || 'ep5-label' });
    KIT.ornament(ctx, x, y + (o.size || 58) * 0.45, Math.min(420, (o.size || 58) * 6), a * 0.85, a);
  };

  /** Draw fn(g) into a full-frame layer (same transform) and lay it down at alpha a: visions, ghosts. */
  EP5.ghost = (ctx, a, fn, key = 'ep5-ghost', mode = 'source-over') => {
    if (a <= 0.003) return;
    const b = R.buffer(key, R.W, R.H);
    b.clear();
    b.ctx.setTransform(ctx.getTransform());
    fn(b.ctx);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = clamp(a); ctx.globalCompositeOperation = mode;
    ctx.drawImage(b.canvas, 0, 0); ctx.restore();
  };

  // ─── mural clouds ──────────────────────────────────────────────────────────
  function cloud(ctx, x, y, w, seed, fill, line, a = 1) {
    ctx.save(); ctx.globalAlpha = a;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) KIT.scallopPath(ctx, x + (i - 2) * w * 0.2, y - Math.sin((i / 4) * Math.PI) * w * 0.08, w * 0.16, w * 0.09, 7, seed + i, 0.28);
    ctx.fillStyle = fill; ctx.fill();
    ctx.strokeStyle = line; ctx.lineWidth = 2.5; ctx.stroke();
    // mural volutes inside
    ctx.globalAlpha = a * 0.5;
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(x + (i - 1) * w * 0.22, y + w * 0.01, w * 0.05, Math.PI * 0.9, Math.PI * 2.1); ctx.stroke(); }
    ctx.restore();
  }
  EP5.cloud = cloud;

  // ─── the enclosure at Kurukshetra ──────────────────────────────────────────
  function yupa(ctx, x, y, h, light, dark) {
    // an octagonal post, a ring (chashala) near the top, red cloth bands
    const w = 26;
    const lit = R.mix('#7a4a2a', '#d8a060', light * (1 - dark * 0.6));
    ctx.fillStyle = '#3a2214'; ctx.fillRect(x - w / 2, y - h, w, h);
    ctx.fillStyle = lit; ctx.fillRect(x + w * 0.1, y - h, w * 0.4, h);
    ctx.fillStyle = '#2a170e';
    ctx.beginPath(); ctx.ellipse(x, y - h * 0.86, w * 1.1, w * 0.4, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = lit; ctx.beginPath(); ctx.ellipse(x, y - h * 0.86 - 3, w * 1.0, w * 0.32, 0, Math.PI, TAU); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x - w * 0.4, y - h); ctx.lineTo(x, y - h - 30); ctx.lineTo(x + w * 0.4, y - h); ctx.fillStyle = '#3a2214'; ctx.fill();
    ctx.fillStyle = R.mix('#7a1a12', '#c8402a', 1 - dark * 0.5);
    for (const u of [0.3, 0.36, 0.62]) ctx.fillRect(x - w / 2 - 2, y - h * u, w + 4, 10);
  }

  function pennant(ctx, x, y, h, col, T, wind, seed) {
    ctx.fillStyle = '#2a170e'; ctx.fillRect(x - 3, y - h, 6, h);
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.moveTo(x + 2, y - h);
    for (let i = 1; i <= 8; i++) { const u = i / 8; ctx.lineTo(x + 2 + u * 120, y - h + 4 + Math.sin(T * 4 * wind + u * 5 + seed) * 8 * u * wind + u * 14); }
    for (let i = 8; i >= 0; i--) { const u = i / 8; ctx.lineTo(x + 2 + u * 120 * 0.96, y - h + 40 - u * 12 + Math.sin(T * 4 * wind + u * 5 + seed) * 8 * u * wind + u * 14); }
    ctx.closePath(); ctx.fill();
  }

  function pavilion(ctx, T, dark) {
    // the sadas: a long thatched shed on posts, behind the altar
    const y0 = HZ + 40, top = HZ - 150;
    const light = 1 - dark * 0.7;
    ctx.save();
    ctx.fillStyle = R.mix('#2a1a12', '#5a3a24', light);
    for (let i = 0; i < 9; i++) { const x = 130 + i * 103; ctx.fillRect(x - 8, top + 50, 16, y0 - top - 50); }
    // roof: a curved thatch with a ridge, eaves turned up at the ends (mural style)
    ctx.beginPath();
    ctx.moveTo(60, top + 70); ctx.quadraticCurveTo(80, top + 30, 140, top + 10);
    ctx.quadraticCurveTo(540, top - 50, 940, top + 10); ctx.quadraticCurveTo(1000, top + 30, 1020, top + 70);
    ctx.quadraticCurveTo(540, top + 30, 60, top + 70); ctx.closePath();
    ctx.fillStyle = R.mix('#3a2614', '#a87a40', light); ctx.fill();
    ctx.strokeStyle = R.mix('#1a100a', '#6a4a24', light); ctx.lineWidth = 2;
    for (let i = 0; i < 26; i++) { const x = 120 + i * 32; ctx.beginPath(); ctx.moveTo(x, top - 10 + Math.abs(x - 540) * 0.06); ctx.lineTo(x - 6, top + 44 + Math.abs(x - 540) * 0.02); ctx.stroke(); }
    ctx.fillStyle = R.mix('#2a1a0e', '#c89048', light); ctx.fillRect(130, top + 50, 820, 8);
    // garlands hanging from the eaves
    ctx.strokeStyle = R.mix('#5a3010', '#e8a040', light); ctx.lineWidth = 4;
    for (let i = 0; i < 8; i++) { const x = 130 + i * 103; ctx.beginPath(); ctx.moveTo(x, top + 58); ctx.quadraticCurveTo(x + 51, top + 100, x + 103, top + 58); ctx.stroke(); }
    ctx.restore();
  }

  EP5.offerings = (ctx, x, y, s = 1, glow = 0) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    if (glow > 0.01) KIT.glow(ctx, 0, -20, 170, '#ffe0a0', 0.4 * glow);
    // the leaf
    ctx.fillStyle = '#2e5a2a'; ctx.beginPath(); ctx.ellipse(0, 0, 120, 30, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#6a9a4a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-110, 0); ctx.lineTo(110, 0); ctx.stroke();
    // rice mound, ghee pot, flowers
    ctx.fillStyle = '#f4ead0'; ctx.beginPath(); ctx.ellipse(-40, -10, 44, 26, 0, Math.PI, TAU); ctx.fill();
    ctx.fillStyle = '#9a5a2a'; ctx.beginPath(); ctx.ellipse(40, -18, 30, 26, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#c87a3a'; ctx.fillRect(28, -48, 24, 10);
    ctx.fillStyle = '#ffd8a0'; ctx.beginPath(); ctx.ellipse(40, -44, 12, 4, 0, 0, TAU); ctx.fill();
    for (let i = 0; i < 5; i++) { ctx.fillStyle = i % 2 ? '#f0a020' : '#e84a2a'; ctx.beginPath(); ctx.arc(80 + i * 8, -6 - (i % 2) * 6, 7, 0, TAU); ctx.fill(); }
    ctx.restore();
  };

  /** The day sky and the plain. Returns nothing; draws in the current transform. */
  function daySky(ctx, T, dark) {
    const top = R.mix('#3d6f86', '#14102a', dark), mid = R.mix('#93b4aa', '#3a2648', dark), hor = R.mix('#ecd59c', '#6a3440', dark);
    KIT.vgrad(ctx, -200, HZ + 40, [[0, top], [0.6, mid], [1, hor]], -200, R.W + 200);
    // the sun (eclipsed by the curse)
    const sa = 1 - dark * 0.85;
    KIT.glow(ctx, SUN.x, SUN.y, 520, '#fff0c0', 0.5 * sa);
    ctx.fillStyle = R.mix('#fff4d4', '#ffb070', dark);
    ctx.beginPath(); ctx.arc(SUN.x, SUN.y, 62, 0, TAU); ctx.fill();
    if (dark > 0.01) {
      ctx.fillStyle = R.mix('#93b4aa', '#120c1c', clamp(dark * 1.4));
      ctx.beginPath(); ctx.arc(SUN.x + lerp(130, 6, E.inOutCubic(clamp(dark * 1.2))), SUN.y - lerp(40, 2, clamp(dark * 1.2)), 62, 0, TAU); ctx.fill();
      // the corona of an eclipsed sun
      KIT.glow(ctx, SUN.x, SUN.y, 150, '#ffd8c0', 0.4 * clamp(dark * 1.5 - 0.4));
    }
    // drifting mural clouds
    for (let i = 0; i < 6; i++) {
      const w = 300 + hash(i, 51) * 260, x = ((hash(i, 52) * 1600 + T * (8 + i * 3)) % 1700) - 300, y = 180 + hash(i, 53) * 520;
      cloud(ctx, x, y, w, i * 7, R.mix('#f4e8cc', '#3a2a44', dark), R.mix('#c8a060', '#1a1020', dark), 0.85);
    }
  }

  function plain(ctx, T, dark) {
    // far trees and the old lakes glinting on the horizon
    ctx.fillStyle = R.mix('#5a7470', '#1a1422', dark);
    ctx.beginPath();
    for (let i = 0; i < 30; i++) KIT.scallopPath(ctx, -60 + i * 42, HZ - 4 - hash(i, 7) * 16, 34, 16 + hash(i, 8) * 14, 7, i + 40, 0.25);
    ctx.fill();
    ctx.fillRect(-200, HZ - 6, R.W + 400, 14);
    for (let i = 0; i < 5; i++) {
      const x = 120 + i * 200 + hash(i, 61) * 60;
      ctx.fillStyle = R.mix('#d8e4d8', '#5a3a4a', dark);
      ctx.globalAlpha = 0.7; ctx.beginPath(); ctx.ellipse(x, HZ + 14, 60 + hash(i, 62) * 40, 5, 0, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
    }
    KIT.vgrad(ctx, HZ + 8, R.H + 300, [[0, R.mix('#d0a868', '#4a2a30', dark)], [0.25, R.mix('#b07e44', '#2e1a1e', dark)], [1, R.mix('#4a2a14', '#0c0608', dark)]], -200, R.W + 200);
    // ground strokes (mural hatching)
    ctx.strokeStyle = R.rgba(hex('#7a5228', '#1a0e10', dark), 0.4); ctx.lineWidth = 2;
    for (let i = 0; i < 40; i++) { const y = HZ + 40 + Math.pow(hash(i, 71), 1.6) * 900, x = hash(i, 72) * 1200 - 60, l = 30 + (y - HZ) * 0.12; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + l, y); ctx.stroke(); }
  }

  EP5.enclosure = (ctx, T, o = {}) => {
    const dark = clamp(o.dark || 0), wind = o.wind ?? 0.6;
    ctx.save();
    const cam = o.cam || {};
    KIT.camera(ctx, { x: 540, y: 1150, zoom: cam.zoom || 1, dx: cam.dx || 0, dy: cam.dy || 0 });
    daySky(ctx, T, dark);
    plain(ctx, T, dark);
    if (o.pavilion !== false) pavilion(ctx, T, dark);
    // pennants along the enclosure's fence
    for (let i = 0; i < 6; i++) { const x = i < 3 ? 40 + i * 70 : 840 + (i - 3) * 70; pennant(ctx, x, HZ + 60, 300 + hash(i, 81) * 80, R.mix(['#c83a20', '#e8a020', '#2a6a8a'][i % 3], '#2a1420', dark * 0.8), T, wind * (1 + dark), i); }
    // the low fence of the enclosure
    ctx.fillStyle = R.mix('#5a3a20', '#1a0e10', dark);
    ctx.fillRect(-200, HZ + 52, R.W + 400, 10);
    for (let x = -180; x < R.W + 200; x += 46) ctx.fillRect(x, HZ + 30, 8, 34);
    if (o.yupas !== false) { yupa(ctx, 250, HZ + 160, 520, 1, dark); yupa(ctx, 830, HZ + 160, 560, 1, dark); yupa(ctx, 960, HZ + 120, 420, 0.8, dark); }
    // the altar and its fire (by day the flame is pale; it gutters in the curse)
    const fx = o.fireX ?? 540, fy = o.fireY ?? 1150;
    KIT.fire.pool(ctx, fx, fy + 30, 420, 120, T, 0.35 + 0.5 * dark);
    const base = KIT.fire.altar(ctx, fx, fy, 220, T, { light: 0.6 });
    KIT.fire.draw(ctx, fx, base + 2, o.fireH ?? 170, T, { intensity: o.fire ?? 1, lean: o.fireLean ?? (dark * 0.6), seed: 5, glow: 0.6 + dark * 0.6 });
    KIT.smoke.draw(ctx, fx + 10, base - 150, T, { h: 700, w: 40, strands: 3, alpha: 0.22 + 0.15 * dark, color: hex('#d8ccc0', '#5a4a5a', dark), lean: 80 + dark * 200, speed: 0.8, seed: 9, curls: 0.7, spread: 0.7 });
    if (o.after) o.after(ctx);
    ctx.restore();
    // the curse: a violet shadow over the whole day
    if (dark > 0.01) {
      ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.45 * dark;
      ctx.fillStyle = '#5a4a8a'; ctx.fillRect(0, 0, R.W, R.H); ctx.restore();
    }
  };
  EP5.FIRE = { x: 540, y: 1150 };

  // ─── Sarama's place: above the clouds at dawn ───────────────────────────────
  EP5.heaven = (ctx, T, o = {}) => {
    ctx.save();
    const cam = o.cam || {};
    KIT.camera(ctx, { x: 540, y: 1100, zoom: cam.zoom || 1, dx: cam.dx || 0, dy: cam.dy || 0 });
    KIT.vgrad(ctx, -200, 1200, [[0, '#1c1838'], [0.45, '#5a3a68'], [0.75, '#c88aa0'], [1, '#ffd8b8']], -200, R.W + 200);
    // faint stars still in the high sky
    for (let i = 0; i < 60; i++) { const a = (0.2 + 0.6 * hash(i, 3)) * (0.7 + 0.3 * Math.sin(T * 2 + i)); ctx.fillStyle = `rgba(255,240,230,${(a * 0.6).toFixed(3)})`; ctx.beginPath(); ctx.arc(hash(i, 1) * 1080, hash(i, 2) * 520, 1 + hash(i, 4) * 1.5, 0, TAU); ctx.fill(); }
    KIT.glow(ctx, 540, 1100, 900, '#ffe0c8', 0.35);
    // banks of pearl cloud, layered
    for (let L = 0; L < 3; L++) {
      const y = 980 + L * 150, col = R.mix('#f8e0d4', '#7a5070', L / 3), line = R.mix('#ffffff', '#c890a0', 0.5);
      for (let i = 0; i < 5; i++) cloud(ctx, ((i * 300 + T * (6 + L * 4) + L * 120) % 1600) - 260, y + Math.sin(i + L) * 20, 520, i + L * 10, col, line, 0.95);
    }
    // the ridge she stands on
    ctx.fillStyle = '#241a34';
    ctx.beginPath(); ctx.moveTo(-200, 1520); ctx.quadraticCurveTo(300, 1440, 640, 1470); ctx.quadraticCurveTo(900, 1490, 1300, 1450); ctx.lineTo(1300, 2200); ctx.lineTo(-200, 2200); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,214,190,0.5)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-200, 1520); ctx.quadraticCurveTo(300, 1440, 640, 1470); ctx.quadraticCurveTo(900, 1490, 1300, 1450); ctx.stroke();
    if (o.after) o.after(ctx);
    ctx.restore();
  };

  // ─── Hastinapura at night: the colonnade ───────────────────────────────────
  EP5.palace = (ctx, T, o = {}) => {
    ctx.save();
    const cam = o.cam || {};
    KIT.camera(ctx, { x: 540, y: 1100, zoom: cam.zoom || 1, dx: cam.dx || 0, dy: cam.dy || 0 });
    KIT.vgrad(ctx, -200, R.H + 200, [[0, '#080716'], [0.5, '#141030'], [0.62, '#1e1424'], [1, '#0c0706']], -200, R.W + 200);
    // the back wall with carved niches and a moonlit window
    ctx.fillStyle = '#1a1220'; ctx.fillRect(-200, 300, R.W + 400, 900);
    const sc = o.scroll || 0;
    for (let i = -2; i < 8; i++) {
      const x = i * 260 - (sc * 0.5) % 260 + 130;
      ctx.fillStyle = '#0e0a16'; ctx.beginPath(); KIT.series.archPath(ctx, x - 70, 560, 140, 420, 70); ctx.fill();
      ctx.strokeStyle = 'rgba(200,140,80,0.25)'; ctx.lineWidth = 2; ctx.beginPath(); KIT.series.archPath(ctx, x - 70, 560, 140, 420, 70); ctx.stroke();
    }
    // polished floor
    KIT.vgrad(ctx, 1200, R.H + 200, [[0, '#2a1a14'], [0.3, '#1a100c'], [1, '#080504']], -200, R.W + 200);
    // pillars with lamps, scrolling past
    for (let i = -2; i < 7; i++) {
      const x = i * 300 - (sc % 300) + 150, fl = KIT.flicker(T, 20 + ((i % 5) + 5)) ;
      const ly = 820;
      KIT.glow(ctx, x - 30, ly, 360, '#ff9a3a', 0.32 * fl);
      KIT.glow(ctx, x - 30, 1260, 260, '#ff9a3a', 0.18 * fl, 'lighter', 0.3);
      ctx.fillStyle = '#1c120c'; ctx.fillRect(x - 40, 300, 80, 960);
      ctx.fillStyle = R.rgba('#e09048', 0.35 * fl); ctx.fillRect(x - 40, 300, 14, 960);
      // capital and base
      ctx.fillStyle = '#2a1a10'; ctx.fillRect(x - 60, 300, 120, 40); ctx.fillRect(x - 56, 1220, 112, 44);
      for (const y of [460, 640, 1040]) { ctx.fillStyle = 'rgba(224,144,72,0.3)'; ctx.fillRect(x - 40, y, 80, 6); }
      // the lamp on its bracket
      ctx.fillStyle = '#3a2210'; ctx.fillRect(x - 70, ly + 12, 34, 6);
      ctx.beginPath(); ctx.ellipse(x - 56, ly + 10, 18, 8, 0, 0, Math.PI); ctx.fill();
      ctx.fillStyle = '#ffe0a0'; ctx.beginPath(); ctx.ellipse(x - 56, ly - 4 * fl, 5, 14 * fl, 0, 0, TAU); ctx.fill();
    }
    if (o.after) o.after(ctx);
    ctx.restore();
  };

  // ─── far away: the forest road at dusk ─────────────────────────────────────
  let ROAD = null;
  function roadTrees() {
    if (ROAD) return ROAD;
    ROAD = [];
    for (let i = 0; i < 8; i++) ROAD.push({ tree: KIT.forest.makeTree(700 + i, { kind: i % 4 === 2 ? 'palm' : 'tall' }), x: i < 4 ? -40 + i * 110 : 720 + (i - 4) * 120, h: 700 + hash(i, 9) * 500 });
    return ROAD;
  }
  EP5.duskRoad = (ctx, T, o = {}) => {
    ctx.save();
    const cam = o.cam || {};
    KIT.camera(ctx, { x: 540, y: 1100, zoom: cam.zoom || 1, dx: cam.dx || 0, dy: cam.dy || 0 });
    const hz = 1060;
    KIT.vgrad(ctx, -200, hz + 20, [[0, '#120e26'], [0.5, '#3a2448'], [0.8, '#a8503a'], [1, '#f0a050']], -200, R.W + 200);
    if (o.behind) o.behind(ctx);
    // ridges of hills
    for (let L = 0; L < 3; L++) {
      ctx.fillStyle = R.mix('#3a2440', '#120a12', L / 2);
      ctx.beginPath(); ctx.moveTo(-200, hz + 40);
      for (let x = -200; x <= R.W + 200; x += 40) ctx.lineTo(x, hz - 60 + L * 50 - 70 * Math.sin(x * 0.006 + L * 2) - 40 * noise.n2(x * 0.01, L));
      ctx.lineTo(R.W + 200, R.H + 200); ctx.lineTo(-200, R.H + 200); ctx.closePath(); ctx.fill();
    }
    KIT.vgrad(ctx, hz + 60, R.H + 200, [[0, '#2a1612'], [1, '#080404']], -200, R.W + 200);
    // the road, winding toward us
    ctx.fillStyle = '#5a3a2a';
    ctx.beginPath(); ctx.moveTo(500, hz + 70); ctx.quadraticCurveTo(420, 1300, 600, 1500); ctx.quadraticCurveTo(760, 1700, 640, 2100); ctx.lineTo(980, 2100); ctx.quadraticCurveTo(1000, 1700, 760, 1480); ctx.quadraticCurveTo(560, 1300, 540, hz + 70); ctx.closePath(); ctx.fill();
    for (const t of roadTrees()) KIT.forest.drawTree(ctx, t.tree, t.x, hz + 260 + (t.x < 540 ? 40 : 20), t.h, '#0a0608', '#c86a3a', [t.x < 540 ? 3 : -3, 2]);
    if (o.after) o.after(ctx);
    ctx.restore();
  };

  // ─── the curse tableau (episode 6's recap picture) ─────────────────────────
  EP5.curseTableau = (ctx, T, o = {}) => {
    const dark = o.dark ?? 0.85;
    EP5.enclosure(ctx, T, {
      dark, fireH: 110, fire: 0.7, wind: 1.4, cam: o.cam,
      after: (g) => {
        CH.janamejaya.draw(g, { x: 300, y: GROUND, scale: 0.5, facing: 'right', pose: 'stand', expression: { look: -0.12 }, light: EP5.sunLight(300, 1100, dark), t: T, key: 'ct-king' });
        CH.sarama.draw(g, { x: 800, y: GROUND + 20, scale: 0.78, facing: 'left', pose: { name: 'curse', k: 1 }, expression: { mood: 'wrath', speak: 0.4 }, light: { dir: -Math.PI / 2 - 0.4, intensity: 1.1, front: 0.2 }, t: T, key: 'ct-sarama' });
      },
    });
  };

  void PAL; void noise;
})();
