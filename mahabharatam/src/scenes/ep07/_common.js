/*
 * Episode 7 · shared pieces for its scenes (not a scene itself). Loads after ep05/_common
 * and ep06/_common (EP5.ghost, EP5.label, EP5.mouth, EP5.hex; EP6.court, EP6.snake,
 * EP6.fallenCrown are reused: the recap remembers episode 6's court).
 *
 * LOCATIONS, each with its own light (characters keep their signature light; only its
 * direction and strength come from the place):
 *   EP7.noon(ctx, T, o)      the FOREST AT NOON: a bleached white-gold sky, the sun high
 *                            overhead, heat shimmer, pale dry grass, dark trees with
 *                            white-hot rims. Light: from above (EP7.noonLight).
 *   EP7.pen(ctx, T, o)       Shamika's hermitage AMONG THE COWS in the afternoon: honey-gold
 *                            light from the right, a wattle fence, a hut, cows and a calf
 *                            at rest, a pipal tree. o.evening (0..1) turns it to violet dusk.
 *   EP7.river(ctx, T, o)     a river AT DUSK under a red sky: Shringin's place. A low red sun
 *                            on the water (left), reeds, the far bank.
 *   EP7.tower(ctx, T, o)     the PALACE ON ONE PILLAR: a pavilion on a single tall pillar
 *                            rising from a moat. o.sky: 0 = moonlit blue-silver night,
 *                            1 = the crimson sunset of the seventh day; o.guards, o.mantra
 *                            (0..1: gold syllables orbit the pavilion), o.burn (0..1: green-gold
 *                            venom-fire, mural flames, fills the pavilion), o.cam.
 *   EP7.pavilion(ctx, T, o)  the pavilion's interior: lamplit, a carved arch, the king's seat.
 *                            o.burn (0..1) floods it with the venom-fire; o.night (0..1).
 * PROPS:
 *   EP7.deer(ctx, x, y, s, T, o)          a running deer with an arrow in its flank (mural)
 *   EP7.cow(ctx, x, y, s, o)              a resting cow / calf silhouette, rimmed
 *   EP7.deadSnake(ctx, pts, s, a)         a limp dead snake along a polyline (dull grey-olive)
 *   EP7.dayMarks(ctx, x, y, w, lit, T, o) seven sun-discs in a row: the seven days
 *   EP7.fruit(ctx, x, y, r, T, o)         a fruit (a ripe bael / wood-apple), glossy
 *   EP7.insect(ctx, x, y, s, T, o)        the tiny copper insect with black eyes
 *   EP7.hermit(ctx, x, y, s, T, phase, o) a naga in an ascetic's guise, carrying a tray of
 *                                         fruit; o.shadow draws his true (serpent) shadow
 *   EP7.venomFire(ctx, x, y, w, h, T, a)  stylised green-gold flames (the venom's fire)
 *   EP7.noonLight / penLight / riverLight / moonLight / sunsetLight(x, y)
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP5 = window.EP5;
  const { TAU, clamp, lerp, hash, E } = R;
  const CH = KIT.characters;
  const EP7 = (window.EP7 = {});
  const hex = EP5.hex;
  EP7.mouth = EP5.mouth; EP7.ghost = EP5.ghost;
  /** A gold label (EP5.label) over a soft dark band, so it reads on bright skies too. */
  EP7.label = (ctx, text, x, y, a, o = {}) => {
    if (a <= 0.003) return;
    const sz = o.size || 58, h = o.band ?? sz * 2.6;
    ctx.save(); ctx.globalAlpha = a * 0.7;
    const g = ctx.createLinearGradient(0, y - h * 0.62, 0, y + h * 0.62);
    g.addColorStop(0, 'rgba(10,7,6,0)'); g.addColorStop(0.35, 'rgba(10,7,6,0.6)'); g.addColorStop(0.7, 'rgba(10,7,6,0.6)'); g.addColorStop(1, 'rgba(10,7,6,0)');
    ctx.fillStyle = g; ctx.fillRect(0, y - h * 0.62, R.W, h * 1.24); ctx.restore();
    EP5.label(ctx, text, x, y, a, o);
  };

  const lightTo = (x, y, lx, ly, k = 1, front = 0.25) => ({ dir: Math.atan2(ly - y, lx - x), intensity: k, front });
  EP7.noonLight = (x, y) => ({ dir: -Math.PI / 2 - 0.15, intensity: 1.15, front: 0.35 });
  EP7.PEN_SUN = { x: 1020, y: 640 };
  EP7.penLight = (x, y, ev = 0) => lightTo(x, y - 600, EP7.PEN_SUN.x, EP7.PEN_SUN.y, lerp(1.05, 0.7, ev), lerp(0.32, 0.12, ev));
  EP7.RIVER_SUN = { x: 170, y: 1000 };
  EP7.riverLight = (x, y) => lightTo(x, y - 600, EP7.RIVER_SUN.x, EP7.RIVER_SUN.y, 1.1, 0.25);
  EP7.moonLight = () => ({ dir: -Math.PI / 2 + 0.5, intensity: 0.75, front: 0.1 });
  EP7.sunsetLight = (x, y) => lightTo(x, y - 600, 120, 1150, 1.05, 0.25);

  // ─── the forest at noon ─────────────────────────────────────────────────────
  let NTREES = null;
  EP7.noon = (ctx, T, o = {}) => {
    if (!NTREES) { NTREES = []; for (let i = 0; i < 11; i++) NTREES.push({ tree: KIT.forest.makeTree(710 + i, { kind: i % 4 === 2 ? 'palm' : 'tall' }), x: -80 + i * 120 + hash(i, 3) * 60, h: 900 + hash(i, 5) * 700, far: i % 2 }); }
    ctx.save();
    const cam = o.cam || {};
    KIT.camera(ctx, { x: 540, y: 1100, zoom: cam.zoom || 1, dx: cam.dx || 0, dy: cam.dy || 0 });
    const hz = 1180;
    KIT.vgrad(ctx, -300, hz, [[0, '#d8c8a0'], [0.35, '#f4ead0'], [0.8, '#fff6e0'], [1, '#f8e2b0']], -300, R.W + 300);
    KIT.glow(ctx, 600, -40, 900, '#fffbe8', 0.9);
    KIT.glow(ctx, 600, -40, 300, '#ffffff', 0.9);
    // far bleached trees (a pale screen)
    for (const t of NTREES) if (t.far) KIT.forest.drawTree(ctx, t.tree, t.x + 40, hz + 20, t.h * 0.7, '#b8a888', '#fff8e0', [0, -3]);
    // heat haze band
    for (let i = 0; i < 5; i++) KIT.glow(ctx, (i * 260 + T * 30) % 1400 - 160, hz - 30, 360, '#fff4d8', 0.35, 'screen', 0.18);
    KIT.vgrad(ctx, hz, R.H + 300, [[0, '#c8a868'], [0.25, '#8a6a3a'], [1, '#2a1c0c']], -300, R.W + 300);
    // dry grass tufts
    ctx.strokeStyle = '#e8cc88'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    for (let i = 0; i < 60; i++) {
      const x = hash(i, 51) * 1300 - 110, y = hz + 30 + hash(i, 52) * 600, h = 20 + hash(i, 53) * 40, sw = Math.sin(T * 1.3 + i) * 4;
      for (const d of [-1, 0, 1]) { ctx.beginPath(); ctx.moveTo(x + d * 6, y); ctx.quadraticCurveTo(x + d * 10, y - h * 0.6, x + d * 14 + sw, y - h); ctx.stroke(); }
    }
    // near dark trees with white-hot rims (sun from above)
    for (const t of NTREES) if (!t.far) KIT.forest.drawTree(ctx, t.tree, t.x, hz + 160, t.h, '#1c160c', '#fff2c0', [0, -4]);
    if (o.after) o.after(ctx);
    ctx.restore();
    // glare
    KIT.glow(ctx, 560, 120, 700, '#fff8e0', 0.35 * (o.glare ?? 1), 'screen');
  };

  /** A running deer, a mural silhouette, an arrow in its flank. Faces left. phase drives the gallop. */
  EP7.deer = (ctx, x, y, s, T, o = {}) => {
    const ph = o.phase ?? T * 9;
    ctx.save(); ctx.translate(x, y); ctx.scale(o.flip ? -s : s, s);
    const fill = o.fill || '#2a1a0c', rim = o.rim || '#fff0c0';
    const body = (g) => {
      g.beginPath();
      // body and neck
      g.ellipse(0, -150, 120, 48, -0.05 * Math.sin(ph), 0, TAU);
      g.moveTo(-90, -170); g.quadraticCurveTo(-130, -250, -150, -290); g.lineTo(-120, -300); g.quadraticCurveTo(-90, -240, -60, -190); g.closePath();
      // head
      g.moveTo(-150, -300); g.ellipse(-160, -296, 34, 20, 0.5, 0, TAU);
      // ears and antlers
      g.moveTo(-140, -316); g.lineTo(-116, -342); g.lineTo(-128, -312);
      g.fill();
      g.lineWidth = 6; g.lineCap = 'round'; g.beginPath();
      g.moveTo(-150, -316); g.quadraticCurveTo(-130, -380, -100, -410); g.moveTo(-136, -360); g.lineTo(-160, -392); g.moveTo(-118, -392); g.lineTo(-120, -430);
      g.stroke();
      // legs (gallop)
      g.lineWidth = 14;
      const legs = [[-80, 0], [-60, 1.3], [80, 2.6], [100, 3.9]];
      for (const [lx, off] of legs) {
        const a = Math.sin(ph + off) * 0.7, fore = lx < 0 ? -1 : 1;
        const k = [lx + Math.sin(a) * 50 * fore, -120 + Math.cos(a) * 60];
        const f = [k[0] + Math.sin(a * 1.4 - 0.3 * fore) * 60, k[1] + 56];
        g.beginPath(); g.moveTo(lx, -140); g.lineTo(k[0], k[1]); g.lineTo(f[0], f[1]); g.stroke();
      }
      // tail
      g.beginPath(); g.moveTo(116, -170); g.lineTo(140, -196); g.lineTo(130, -160); g.closePath(); g.fill();
    };
    ctx.fillStyle = rim; ctx.strokeStyle = rim; ctx.save(); ctx.translate(0, -3); body(ctx); ctx.restore();
    ctx.fillStyle = fill; ctx.strokeStyle = fill; body(ctx);
    // spots
    ctx.fillStyle = 'rgba(255,230,180,0.45)';
    for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(-50 + i * 24, -160 + (i % 2) * 14, 5, 0, TAU); ctx.fill(); }
    // the arrow
    ctx.strokeStyle = '#e8d0a0'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(40, -170); ctx.lineTo(150, -250); ctx.stroke();
    ctx.fillStyle = '#c04030'; ctx.beginPath(); ctx.moveTo(150, -250); ctx.lineTo(176, -250); ctx.lineTo(160, -276); ctx.closePath(); ctx.fill();
    ctx.restore();
  };

  // ─── Shamika's hermitage among the cows ────────────────────────────────────
  EP7.cow = (ctx, x, y, s, o = {}) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(o.flip ? -s : s, s);
    const draw = (g) => {
      g.beginPath();
      g.ellipse(0, -90, 150, 70, 0, 0, TAU);                                 // body, lying
      g.moveTo(130, -150); g.ellipse(120, -170, 46, 52, 0.4, 0, TAU);         // hump
      g.moveTo(-120, -110); g.quadraticCurveTo(-170, -180, -200, -170); g.lineTo(-230, -120); g.quadraticCurveTo(-190, -100, -130, -60); g.closePath();   // neck + head
      g.moveTo(-190, -176); g.quadraticCurveTo(-200, -230, -170, -250); g.quadraticCurveTo(-186, -220, -176, -180); g.closePath();  // horn
      g.moveTo(-150, -40); g.lineTo(-40, -10); g.lineTo(-40, 0); g.lineTo(-170, -20); g.closePath();    // folded foreleg
      g.fill();
    };
    ctx.fillStyle = o.rim || '#ffd890'; ctx.save(); ctx.translate(o.rimDx ?? 4, -4); draw(ctx); ctx.restore();
    ctx.fillStyle = o.fill || '#1e140c'; draw(ctx);
    ctx.restore();
  };

  let PTREE = null;
  EP7.pen = (ctx, T, o = {}) => {
    if (!PTREE) PTREE = { big: KIT.forest.makeTree(777, { kind: 'tall' }), more: [0, 1, 2, 3].map((i) => KIT.forest.makeTree(780 + i, { kind: i === 2 ? 'palm' : 'tall' })) };
    ctx.save();
    const cam = o.cam || {};
    KIT.camera(ctx, { x: 540, y: 1100, zoom: cam.zoom || 1, dx: cam.dx || 0, dy: cam.dy || 0 });
    const ev = clamp(o.evening || 0), hz = 1150, S = EP7.PEN_SUN;
    KIT.vgrad(ctx, -300, hz, [[0, hex('#5a7a8a', '#1a1438', ev)], [0.55, hex('#d8c08a', '#5a3a5a', ev)], [1, hex('#ffd890', '#c8604a', ev)]], -300, R.W + 300);
    KIT.glow(ctx, S.x, S.y + ev * 380, 700, hex('#ffe0a0', '#ff8a50', ev), 0.7 - 0.2 * ev);
    ctx.fillStyle = hex('#fff0c0', '#ffb070', ev); ctx.beginPath(); ctx.arc(S.x, S.y + ev * 380, 46, 0, TAU); ctx.fill();
    // far hills
    ctx.fillStyle = hex('#9a9a7a', '#3a2840', ev);
    ctx.beginPath(); ctx.moveTo(-300, hz); for (let x = -300; x <= R.W + 300; x += 40) ctx.lineTo(x, hz - 70 - 50 * Math.sin(x * 0.006 + 1)); ctx.lineTo(R.W + 300, hz + 20); ctx.closePath(); ctx.fill();
    for (let i = 0; i < 4; i++) KIT.forest.drawTree(ctx, PTREE.more[i], [60, 230, 880, 1020][i], hz + 40, [700, 520, 600, 820][i], hex('#2a2a18', '#120c14', ev), hex('#ffd890', '#ff9a6a', ev), [3, -2]);
    KIT.vgrad(ctx, hz, R.H + 300, [[0, hex('#8a8a4a', '#3a2a2a', ev)], [0.3, hex('#5a5a2a', '#1a1218', ev)], [1, '#140e08']], -300, R.W + 300);
    // the great pipal over the sage (left)
    KIT.forest.drawTree(ctx, PTREE.big, 150, 1560, 1500, hex('#1a1a0c', '#0c080e', ev), hex('#ffd890', '#ff9a6a', ev), [4, -2]);
    // the hut (far right)
    const hx = 900, hy = 1270;
    ctx.fillStyle = hex('#6a4a2a', '#2a1a1a', ev); ctx.fillRect(hx - 110, hy - 170, 220, 170);
    ctx.fillStyle = hex('#4a3016', '#1a1012', ev); ctx.beginPath(); ctx.moveTo(hx - 150, hy - 150); ctx.quadraticCurveTo(hx, hy - 330, hx + 150, hy - 150); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#120804'; ctx.fillRect(hx - 30, hy - 110, 60, 110);
    // wattle fence of the cow pen
    ctx.strokeStyle = hex('#3a2a14', '#140c10', ev); ctx.lineWidth = 8;
    for (let x = -40; x < 1120; x += 46) { ctx.beginPath(); ctx.moveTo(x, 1300); ctx.lineTo(x + 4, 1180 + hash(x, 2) * 20); ctx.stroke(); }
    ctx.lineWidth = 5; for (const y of [1210, 1250]) { ctx.beginPath(); ctx.moveTo(-40, y); ctx.quadraticCurveTo(540, y + 12, 1120, y - 4); ctx.stroke(); }
    // cows at rest inside the pen
    const rim = hex('#ffd890', '#ff9a6a', ev);
    EP7.cow(ctx, 700, 1330, 0.55, { rim, fill: hex('#2a1c10', '#120c10', ev) });
    EP7.cow(ctx, 960, 1360, 0.42, { rim, flip: true, fill: hex('#2a1c10', '#120c10', ev) });
    EP7.cow(ctx, 520, 1300, 0.3, { rim, fill: hex('#2a1c10', '#120c10', ev) });
    // dust motes in the light
    KIT.fireflies(ctx, T, { box: [0, 600, 1080, 900], count: 26, seed: 707, size: 2, alpha: 0.5 * (1 - ev), color: '#ffe8a0', core: '#fff8e0' });
    if (o.after) o.after(ctx);
    ctx.restore();
  };

  // ─── the river at dusk ──────────────────────────────────────────────────────
  EP7.river = (ctx, T, o = {}) => {
    ctx.save();
    const cam = o.cam || {};
    KIT.camera(ctx, { x: 540, y: 1100, zoom: cam.zoom || 1, dx: cam.dx || 0, dy: cam.dy || 0 });
    const hz = 1080, S = EP7.RIVER_SUN, red = clamp(o.red ?? 0.5);
    KIT.vgrad(ctx, -300, hz, [[0, '#1a0a1a'], [0.45, hex('#6a1a1a', '#8a0a0a', red)], [0.85, hex('#e05a2a', '#ff3a1a', red)], [1, '#ffb050']], -300, R.W + 300);
    KIT.glow(ctx, S.x, S.y, 800, '#ff6a2a', 0.6);
    ctx.fillStyle = '#ffd890'; ctx.beginPath(); ctx.arc(S.x, S.y, 70, Math.PI, TAU); ctx.fill();
    // banded mural clouds
    ctx.strokeStyle = 'rgba(255,170,110,0.35)'; ctx.lineWidth = 4;
    for (let i = 0; i < 6; i++) { const y = 380 + i * 90, x = ((i * 190 + T * 10) % 1500) - 200; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 200, y - 20, x + 420, y); ctx.stroke(); }
    // far bank
    ctx.fillStyle = '#2a0a0c'; ctx.beginPath(); ctx.moveTo(-300, hz); for (let x = -300; x <= 1400; x += 50) ctx.lineTo(x, hz - 30 - 26 * Math.sin(x * 0.01) - (x > 600 ? 60 * hash(x, 4) : 0)); ctx.lineTo(1400, hz + 10); ctx.closePath(); ctx.fill();
    // the water, the sun's path on it
    KIT.vgrad(ctx, hz, 1450, [[0, '#c84a2a'], [0.4, '#6a1a1a'], [1, '#200810']], -300, R.W + 300);
    ctx.strokeStyle = 'rgba(255,210,140,0.6)'; ctx.lineWidth = 4;
    for (let i = 0; i < 16; i++) { const y = hz + 14 + i * 22, w = 160 - i * 6 + Math.sin(T * 2 + i) * 20, x = S.x + Math.sin(T * 1.3 + i * 1.7) * 20; ctx.beginPath(); ctx.moveTo(x - w / 2, y); ctx.lineTo(x + w / 2, y); ctx.stroke(); }
    // near bank, reeds
    KIT.vgrad(ctx, 1440, R.H + 300, [[0, '#2a120c'], [1, '#080304']], -300, R.W + 300);
    ctx.strokeStyle = '#140606'; ctx.lineWidth = 5;
    for (let i = 0; i < 40; i++) { const x = hash(i, 61) * 1200 - 60, h = 80 + hash(i, 62) * 220, sw = Math.sin(T * 1.6 + i) * 10; ctx.beginPath(); ctx.moveTo(x, 1470); ctx.quadraticCurveTo(x + sw * 0.5, 1470 - h * 0.6, x + sw, 1470 - h); ctx.stroke(); }
    if (o.after) o.after(ctx);
    ctx.restore();
  };

  // ─── the palace on one pillar ──────────────────────────────────────────────
  EP7.TOWER = { x: 560, top: 640, w: 330 };
  EP7.tower = (ctx, T, o = {}) => {
    ctx.save();
    const cam = o.cam || {};
    KIT.camera(ctx, { x: 540, y: 1100, zoom: cam.zoom || 1, dx: cam.dx || 0, dy: cam.dy || 0 });
    const sk = clamp(o.sky || 0), burn = clamp(o.burn || 0), TW = EP7.TOWER;
    KIT.vgrad(ctx, -400, 1300, [[0, hex('#060a1e', '#1a0610', sk)], [0.5, hex('#18244a', '#7a1a12', sk)], [0.9, hex('#3a4a6a', '#ff6a2a', sk)], [1, hex('#5a6a80', '#ffc070', sk)]], -300, R.W + 300);
    // moon (night) or setting sun (day 7)
    if (sk < 0.99) {
      KIT.glow(ctx, 860, 300, 420, '#c8d8ff', 0.5 * (1 - sk));
      ctx.save(); ctx.globalAlpha = 1 - sk; ctx.fillStyle = '#eef2ff'; ctx.beginPath(); ctx.arc(860, 300, 58, 0, TAU); ctx.fill(); ctx.restore();
      for (let i = 0; i < 60; i++) { const tw = 0.5 + 0.5 * Math.sin(T * 2 + i); ctx.fillStyle = `rgba(230,236,255,${0.6 * tw * (1 - sk)})`; ctx.fillRect(hash(i, 81) * 1080, hash(i, 82) * 900 - 200, 3, 3); }
    }
    if (sk > 0.01) {
      KIT.glow(ctx, 120, 1150, 900, '#ff7a2a', 0.6 * sk);
      ctx.save(); ctx.globalAlpha = sk; ctx.fillStyle = '#ffd070'; ctx.beginPath(); ctx.arc(120, 1180, 90, Math.PI, TAU); ctx.fill(); ctx.restore();
    }
    // the city far below the horizon line
    ctx.fillStyle = hex('#0c1226', '#2a0a0a', sk);
    for (let i = 0; i < 14; i++) { const x = i * 90 - 40, h = 40 + hash(i, 91) * 90; ctx.fillRect(x, 1260 - h, 70, h + 60); if (hash(i, 92) > 0.5) { ctx.beginPath(); ctx.moveTo(x, 1260 - h); ctx.lineTo(x + 35, 1220 - h); ctx.lineTo(x + 70, 1260 - h); ctx.fill(); } }
    // the moat
    KIT.vgrad(ctx, 1290, 1420, [[0, hex('#2a3a5a', '#8a3a1a', sk)], [1, hex('#0a1020', '#2a0c08', sk)]], -300, R.W + 300);
    ctx.strokeStyle = hex('#8aa0d0', '#ffb070', sk); ctx.globalAlpha = 0.5; ctx.lineWidth = 3;
    for (let i = 0; i < 6; i++) { const y = 1310 + i * 18, w = 200 - i * 20; ctx.beginPath(); ctx.moveTo(TW.x - w / 2 + Math.sin(T + i) * 10, y); ctx.lineTo(TW.x + w / 2 + Math.sin(T + i) * 10, y); ctx.stroke(); }
    ctx.globalAlpha = 1;
    KIT.vgrad(ctx, 1410, R.H + 300, [[0, hex('#1a2030', '#2a120a', sk)], [1, '#06060a']], -300, R.W + 300);
    // the single pillar, banded
    const top = TW.top, pw = 70;
    ctx.fillStyle = hex('#1a2238', '#2a100a', sk); ctx.fillRect(TW.x - pw / 2, top, pw, 1330 - top);
    ctx.fillStyle = hex('#8aa0d0', '#ffb070', sk); ctx.globalAlpha = 0.35; ctx.fillRect(TW.x + pw / 2 - 14, top, 14, 1330 - top); ctx.globalAlpha = 1;
    ctx.fillStyle = '#c8a050'; for (let y = top + 80; y < 1300; y += 130) ctx.fillRect(TW.x - pw / 2 - 6, y, pw + 12, 10);
    // the pavilion on top: a platform, pillars, a domed roof with a finial
    const pw2 = TW.w;
    ctx.fillStyle = hex('#1e2840', '#30120a', sk);
    ctx.beginPath(); ctx.moveTo(TW.x - 60, top + 40); ctx.lineTo(TW.x - pw2 / 2, top); ctx.lineTo(TW.x + pw2 / 2, top); ctx.lineTo(TW.x + 60, top + 40); ctx.closePath(); ctx.fill();
    ctx.fillRect(TW.x - pw2 / 2 - 10, top - 18, pw2 + 20, 20);
    const lampA = 0.6 + 0.2 * KIT.flicker(T, 5);
    KIT.glow(ctx, TW.x, top - 110, 260, '#ffc060', lampA * (1 - burn));
    ctx.fillStyle = hex('#ffcf80', '#ffb060', sk); ctx.globalAlpha = 0.7 * (1 - burn); ctx.fillRect(TW.x - pw2 / 2 + 20, top - 210, pw2 - 40, 192); ctx.globalAlpha = 1;
    ctx.fillStyle = hex('#1e2840', '#30120a', sk);
    for (const dx of [-pw2 / 2, -pw2 / 6, pw2 / 6, pw2 / 2]) ctx.fillRect(TW.x + dx - 12, top - 220, 24, 204);
    ctx.beginPath(); ctx.moveTo(TW.x - pw2 / 2 - 30, top - 210); ctx.quadraticCurveTo(TW.x - pw2 / 2, top - 330, TW.x, top - 380); ctx.quadraticCurveTo(TW.x + pw2 / 2, top - 330, TW.x + pw2 / 2 + 30, top - 210); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#e0b050'; ctx.beginPath(); ctx.moveTo(TW.x - 8, top - 376); ctx.lineTo(TW.x, top - 440); ctx.lineTo(TW.x + 8, top - 376); ctx.fill();
    ctx.strokeStyle = '#c8a050'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(TW.x - pw2 / 2 - 30, top - 210); ctx.quadraticCurveTo(TW.x - pw2 / 2, top - 330, TW.x, top - 380); ctx.quadraticCurveTo(TW.x + pw2 / 2, top - 330, TW.x + pw2 / 2 + 30, top - 210); ctx.stroke();
    if (o.inside) o.inside(ctx, TW);
    // the guards and keepers at the foot
    if (o.guards !== false) {
      const L = sk > 0.5 ? EP7.sunsetLight : EP7.moonLight;
      for (const [x, i, f] of [[240, 0, 'right'], [880, 1, 'left'], [130, 2, 'right']]) {
        const sc = 0.32 - (i === 2 ? 0.04 : 0);
        CH.prince.draw(ctx, { x, y: 1500 + (i === 2 ? -30 : 0), scale: sc, facing: f, index: i, pose: 'stand', light: L(x, 1500), t: T, key: 'tw-g' + i });
      }
    }
    if (o.after) o.after(ctx);
    // the mantras: gold syllables circling the pavilion
    const m = clamp(o.mantra || 0);
    if (m > 0.01) {
      const SY = ['OM', 'RAKSHA', 'SVAHA', 'NAMAH'];
      ctx.save(); ctx.font = R.font(34, 'display', 600); ctx.letterSpacing = '4px'; ctx.textAlign = 'center';
      for (let i = 0; i < 8; i++) {
        const a = T * 0.6 + (i / 8) * TAU, x = TW.x + Math.cos(a) * 300, y = top - 170 + Math.sin(a) * 110;
        const front = Math.sin(a) > 0;
        ctx.globalAlpha = m * (front ? 0.95 : 0.4);
        ctx.fillStyle = '#ffe08a'; ctx.shadowColor = '#ffb040'; ctx.shadowBlur = R.px(12);
        ctx.fillText(SY[i % SY.length], x, y);
      }
      ctx.restore();
    }
    if (burn > 0.01) EP7.venomFire(ctx, TW.x, top, pw2 + 60, 480 * burn, T, burn);
    ctx.restore();
  };

  /** Stylised venom-fire: mural flame tongues in green, gold and white (no gore). */
  EP7.venomFire = (ctx, x, y, w, h, T, a = 1) => {
    if (a <= 0.01) return;
    KIT.glow(ctx, x, y - h * 0.4, Math.max(w, h) * 1.1, '#40ff9a', 0.45 * a);
    const layers = [['#0e7a4a', 1], ['#2ad884', 0.8], ['#c8f070', 0.58], ['#fff6c0', 0.3]];
    ctx.save(); ctx.globalAlpha = a;
    for (const [col, sc] of layers) {
      ctx.fillStyle = col; ctx.beginPath();
      const n = 7;
      for (let i = 0; i < n; i++) {
        const u = (i + 0.5) / n, cx = x + (u - 0.5) * w * sc, th = h * sc * (0.7 + 0.3 * Math.sin(T * 5 + i * 2.1)), bw = (w * sc) / n * 0.9;
        const tip = cx + Math.sin(T * 4 + i) * bw * 0.8;
        ctx.moveTo(cx - bw, y);
        ctx.bezierCurveTo(cx - bw, y - th * 0.4, tip - bw * 0.4, y - th * 0.7, tip, y - th);
        ctx.bezierCurveTo(tip + bw * 0.4, y - th * 0.7, cx + bw, y - th * 0.4, cx + bw, y);
        ctx.closePath();
      }
      ctx.fill();
    }
    ctx.restore();
  };

  /** The pavilion's interior: night lamplight, a carved arch, a cushioned seat. */
  EP7.pavilion = (ctx, T, o = {}) => {
    ctx.save();
    const cam = o.cam || {};
    KIT.camera(ctx, { x: 540, y: 1100, zoom: cam.zoom || 1, dx: cam.dx || 0, dy: cam.dy || 0 });
    const sk = clamp(o.sky ?? 1), burn = clamp(o.burn || 0);
    KIT.vgrad(ctx, -300, R.H + 300, [[0, '#120806'], [0.5, hex('#3a1a0c', '#0a3a22', burn)], [1, '#080402']], -300, R.W + 300);
    // the arch open to the sunset (or the night)
    ctx.save(); ctx.beginPath(); KIT.series.archPath(ctx, 200, 260, 680, 980, 200); ctx.clip();
    KIT.vgrad(ctx, 260, 1240, [[0, hex('#18244a', '#3a0a10', sk)], [0.6, hex('#3a4a6a', '#e0502a', sk)], [1, hex('#5a6a80', '#ffc070', sk)]], 200, 880);
    if (sk > 0.01) { ctx.globalAlpha = sk; KIT.glow(ctx, 300, 1180, 500, '#ff7a2a', 0.6); ctx.fillStyle = '#ffd070'; ctx.beginPath(); ctx.arc(300, 1200, 80, Math.PI, TAU); ctx.fill(); ctx.globalAlpha = 1; }
    ctx.fillStyle = '#1a0806'; for (let i = 0; i < 10; i++) { const x = 180 + i * 80, h = 30 + hash(i, 93) * 70; ctx.fillRect(x, 1240 - h, 60, h); }
    ctx.restore();
    ctx.strokeStyle = '#c8a050'; ctx.lineWidth = 8; ctx.beginPath(); KIT.series.archPath(ctx, 200, 260, 680, 980, 200); ctx.stroke();
    ctx.lineWidth = 3; ctx.beginPath(); KIT.series.archPath(ctx, 180, 236, 720, 1010, 210); ctx.stroke();
    // hanging lamp
    const fl = KIT.flicker(T, 9);
    ctx.strokeStyle = '#a8741f'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(880, 0); ctx.lineTo(880, 380); ctx.stroke();
    KIT.glow(ctx, 880, 400, 520, '#ffb050', 0.55 * fl * (1 - burn));
    ctx.fillStyle = '#c88a30'; ctx.beginPath(); ctx.ellipse(880, 400, 34, 12, 0, 0, Math.PI); ctx.fill();
    ctx.fillStyle = '#fff0b0'; ctx.beginPath(); ctx.ellipse(880, 390 - 8 * fl, 6, 16 * fl, 0, 0, TAU); ctx.fill();
    // floor
    KIT.vgrad(ctx, 1240, R.H + 300, [[0, '#4a2410'], [0.2, '#24100a'], [1, '#080302']], -300, R.W + 300);
    ctx.fillStyle = 'rgba(232,176,80,0.45)'; ctx.fillRect(-300, 1240, R.W + 600, 5);
    if (o.after) o.after(ctx);
    if (burn > 0.01) EP7.venomFire(ctx, 540, 2050, 1300, 1700 * burn, T, burn);
    ctx.restore();
  };

  // ─── props ──────────────────────────────────────────────────────────────────
  /** A limp dead snake along a polyline (screen px), drawn dull grey-olive with a faint rim. */
  EP7.deadSnake = (ctx, pts, s = 1, a = 1, o = {}) => {
    if (a <= 0.01 || pts.length < 2) return;
    // resample smoothly
    const sm = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      for (let j = 0; j < 6; j++) {
        const t = j / 6, t2 = t * t, t3 = t2 * t;
        sm.push([0, 1].map((c) => 0.5 * (2 * p1[c] + (-p0[c] + p2[c]) * t + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * t3)));
      }
    }
    sm.push(pts[pts.length - 1]);
    const ws = sm.map((_, i) => { const u = i / (sm.length - 1); return s * (u < 0.08 ? lerp(24, 30, u / 0.08) : lerp(30, 5, (u - 0.08) / 0.92)); });
    ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = o.rim || 'rgba(236,240,200,0.95)';
    ctx.save(); ctx.translate(0, -2.5 * s); ctx.beginPath(); KIT.limbOutline(ctx, sm, ws.map((w) => w + 3 * s)); ctx.fill(); ctx.restore();
    ctx.fillStyle = o.fill || '#6a6e48'; ctx.beginPath(); KIT.limbOutline(ctx, sm, ws); ctx.fill();
    // head (limp, at the start)
    const h = sm[0], n = sm[2];
    ctx.beginPath(); ctx.ellipse(h[0], h[1], 20 * s, 12 * s, Math.atan2(h[1] - n[1], h[0] - n[0]), 0, TAU); ctx.fill();
    // banding
    ctx.strokeStyle = 'rgba(200,200,150,0.35)'; ctx.lineWidth = 2 * s;
    for (let i = 4; i < sm.length - 4; i += 4) { const p = sm[i], q = sm[i + 1], ang = Math.atan2(q[1] - p[1], q[0] - p[0]) + Math.PI / 2, w = ws[i] / 2; ctx.beginPath(); ctx.moveTo(p[0] - Math.cos(ang) * w, p[1] - Math.sin(ang) * w); ctx.lineTo(p[0] + Math.cos(ang) * w, p[1] + Math.sin(ang) * w); ctx.stroke(); }
    ctx.restore();
  };

  /** Seven sun-discs in a row: lit = how many have burned (fractional: the next one kindling). */
  EP7.dayMarks = (ctx, x, y, w, lit, T, o = {}) => {
    const a = o.alpha ?? 1;
    if (a <= 0.01) return;
    for (let i = 0; i < 7; i++) {
      const cx = x - w / 2 + (i + 0.5) * (w / 7), k = clamp(lit - i), last = i === 6;
      const r = (o.r || 26) * (last ? 1.3 : 1);
      ctx.save(); ctx.globalAlpha = a;
      if (k > 0) KIT.glow(ctx, cx, y, r * (last ? 6 : 3.5), last ? '#ff5a2a' : '#ffb040', (last ? 0.7 : 0.35) * k * (o.dimPast && !last ? 0.4 : 1));
      ctx.strokeStyle = '#e7b54a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, y, r, 0, TAU); ctx.stroke();
      ctx.fillStyle = last ? '#ff7a3a' : '#ffd070'; ctx.globalAlpha = a * k * (o.dimPast && !last ? 0.45 : 1);
      ctx.beginPath(); ctx.arc(cx, y, r - 5, 0, TAU); ctx.fill();
      // rays
      for (let j = 0; j < 8; j++) { const an = (j / 8) * TAU + T * 0.3; ctx.beginPath(); ctx.moveTo(cx + Math.cos(an) * (r + 4), y + Math.sin(an) * (r + 4)); ctx.lineTo(cx + Math.cos(an) * (r + 12), y + Math.sin(an) * (r + 12)); ctx.strokeStyle = last ? '#ff9a5a' : '#e7b54a'; ctx.stroke(); }
      ctx.restore();
    }
  };

  /** A ripe fruit (bael / wood-apple): round, glossy, a stalk and a leaf. */
  EP7.fruit = (ctx, x, y, r, T, o = {}) => {
    ctx.save(); ctx.globalAlpha = o.alpha ?? 1;
    const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
    g.addColorStop(0, o.light || '#ffe08a'); g.addColorStop(0.5, o.mid || '#c8902a'); g.addColorStop(1, o.dark || '#5a3410');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#3a2008'; ctx.lineWidth = Math.max(2, r * 0.08); ctx.beginPath(); ctx.moveTo(x, y - r); ctx.lineTo(x + r * 0.1, y - r * 1.3); ctx.stroke();
    ctx.fillStyle = '#4a6a20'; ctx.beginPath(); ctx.ellipse(x + r * 0.35, y - r * 1.2, r * 0.4, r * 0.16, -0.5, 0, TAU); ctx.fill();
    ctx.restore();
  };

  /** The tiny copper insect: segmented body, black eyes, legs, a green glint (Takshaka). */
  EP7.insect = (ctx, x, y, s, T, o = {}) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(o.ang || 0); ctx.scale(s, s);
    const wig = Math.sin(T * 14) * 0.15;
    if (o.glint) KIT.glow(ctx, 0, 0, 90, '#40ff9a', 0.5 * o.glint);
    ctx.strokeStyle = '#6a3410'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) for (const sd of [-1, 1]) {
      const a = sd * (1.2 + wig * (i % 2 ? 1 : -1)) + (i - 1) * 0.3 * sd;
      ctx.beginPath(); ctx.moveTo(-10 + i * 10, 0); ctx.lineTo(-10 + i * 10 + Math.cos(a) * 18, Math.sin(a) * 18); ctx.stroke();
    }
    for (let i = 0; i < 5; i++) {
      const g = ctx.createRadialGradient(-20 + i * 9 - 2, -3, 1, -20 + i * 9, 0, 9);
      g.addColorStop(0, '#ffc890'); g.addColorStop(0.6, '#c8642a'); g.addColorStop(1, '#6a2a0a');
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(-20 + i * 9, 0, 8 - Math.abs(i - 2), 7 - Math.abs(i - 2) * 0.8, 0, 0, TAU); ctx.fill();
    }
    ctx.fillStyle = '#c8642a'; ctx.beginPath(); ctx.arc(-28, 0, 7, 0, TAU); ctx.fill();
    ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(-31, -3, 2.6, 0, TAU); ctx.arc(-31, 3, 2.6, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#8a4a1a'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-33, -2); ctx.quadraticCurveTo(-44, -12, -48, -8); ctx.moveTo(-33, 2); ctx.quadraticCurveTo(-44, 12, -48, 8); ctx.stroke();
    ctx.restore();
  };

  /**
   * A naga in an ascetic's guise: a silhouette walking in profile (faces left), a tray of
   * fruit carried at the shoulder; a cold green rim gives him away. o.shadow (0..1):
   * his shadow on the ground is a serpent.
   */
  EP7.hermit = (ctx, x, y, s, T, phase, o = {}) => {
    const a = o.alpha ?? 1;
    if (o.shadow) {
      ctx.save(); ctx.globalAlpha = a * o.shadow * 0.85;
      EP6sn(ctx, x + 40 * s, y + 10, 420 * s, 0.04, T, phase, { w: 26 * s, fill: '#020604', rim: 'rgba(80,255,160,0.55)' });
      ctx.restore();
    }
    const body = (g, col) => CH.takshaka.shape(g, col, { x, y, scale: s, facing: o.facing || 'left', pose: { name: 'guise-walk', phase, stride: 0.7 }, t: T });
    const b = R.buffer(o.key || 'ep7-hermit', R.W, R.H);
    b.clear(); b.ctx.setTransform(ctx.getTransform());
    body(b.ctx, o.rim || '#7affc0');
    b.ctx.save(); b.ctx.translate(o.rimDx ?? 4, 3); body(b.ctx, o.fill || '#14100c'); b.ctx.restore();
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = a; ctx.drawImage(b.canvas, 0, 0); ctx.restore();
    // the tray of fruit held up at the shoulder
    const tx = x + (o.facing === 'right' ? 90 : -90) * s, ty = y - 880 * s;
    ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = '#8a6a3a'; ctx.beginPath(); ctx.ellipse(tx, ty, 120 * s, 22 * s, 0, 0, TAU); ctx.fill();
    for (let i = 0; i < 4; i++) EP7.fruit(ctx, tx - 66 * s + i * 44 * s, ty - 26 * s - (i % 2) * 14 * s, 26 * s, T);
    ctx.restore();
  };
  const EP6sn = (...args) => window.EP6.snake(...args);

  void E;
})();
