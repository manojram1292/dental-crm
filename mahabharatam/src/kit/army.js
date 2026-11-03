/*
 * KIT.army · the four arms of an ancient Indian army (chaturanga), as temple-mural
 * shadow puppets: flat painted silhouettes with a dark outline, a rim toward the
 * fire, and gold details. Shared by every episode.
 *
 *   KIT.army.draw(ctx, kind, o)      kind: 'chariot' | 'elephant' | 'horse' | 'soldier'
 *     o = { x, y,            ground point under the unit's middle (screen px)
 *           s,               scale (1 = the sizes in SIZE)
 *           dir,             1 = facing right (native), −1 = facing left
 *           t,               seconds: gait, banner and trunk sway (pure in t)
 *           phase,           gait offset (so a row does not march in lock-step)
 *           gait,            0 = standing still … 1 = marching
 *           fill, line,      body colour, outline colour (null = no outline)
 *           gold,            ornament colour (null = no ornaments)
 *           rim, light,      rim colour and the angle TOWARD the light (rim drawn on that side)
 *           rimW,            rim width in px (default 3)
 *           banner,          the chariot's / rider's pennant colour
 *           alpha }
 *   KIT.army.shape(ctx, kind, color, o)   the bare silhouette in one colour
 *   KIT.army.SIZE[kind] → { w, h }        native footprint (px at s = 1): length and height
 *   KIT.army.tile(level)                  the PATTI tile (1 chariot, 1 elephant, 3 horses,
 *                                         5 foot soldiers in two registers), a canvas of
 *                                         TILE.res × TILE.w × TILE.h ÷ 2^level, for patterns
 *   KIT.army.PATTI                        that layout: [kind, x, y, s] in TILE.w × TILE.h units
 *   KIT.army.TILE = { w, h, aspect }
 *   KIT.army.pattern(ctx, x, y, cellW, cellH, devPx)   a CanvasPattern of patti tiles whose
 *                                         cells are cellW × cellH with a corner at (x, y),
 *                                         the mip level chosen for devPx device px per cell
 *   KIT.army.PALETTE                      default mural colours
 *
 * Proportions (s = 1): soldier 190 tall (spear 255), horse + rider 250 tall × 240 long,
 * elephant + howdah 360 tall × 330 long, chariot (two horses, car, banner) 430 tall × 440 long.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT;
  const { TAU, PAL } = R;

  const PALETTE = { fill: '#5a2414', line: '#120806', gold: PAL.gold, ivory: '#f1e6c8', rim: '#f0a050', banner: '#b0522d' };
  const SIZE = { soldier: { w: 70, h: 255 }, horse: { w: 240, h: 250 }, elephant: { w: 330, h: 360 }, chariot: { w: 440, h: 430 } };

  // ─── painter: every primitive is filled with `fill` and (optionally) outlined ──
  function painter(g, fill, line, lw) {
    return {
      poly(fn) { g.beginPath(); fn(g); g.fillStyle = fill; g.fill(); if (line) { g.strokeStyle = line; g.lineWidth = lw; g.stroke(); } },
      limb(pts, w) {
        g.lineCap = 'round'; g.lineJoin = 'round';
        g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
        if (line) { g.strokeStyle = line; g.lineWidth = w + 2 * lw; g.stroke(); }
        g.strokeStyle = fill; g.lineWidth = w; g.stroke();
      },
      disc(x, y, r) { this.poly((c) => c.arc(x, y, r, 0, TAU)); },
      ring(x, y, r, w) {
        g.beginPath(); g.arc(x, y, r, 0, TAU);
        if (line) { g.strokeStyle = line; g.lineWidth = w + 2 * lw; g.stroke(); }
        g.strokeStyle = fill; g.lineWidth = w; g.stroke();
      },
      fill, line, lw, g,
    };
  }

  // ─── the horse (with or without a rider) ─────────────────────────────────
  function horseBody(P, t, o, rider) {
    const ph = (o.phase || 0) + t * 7.5 * (o.gait ?? 1), amp = o.gait ?? 1;
    // legs: far pair first (they sit behind the body)
    for (const [hx, hy, off] of [[-40, -104, Math.PI], [64, -100, 1.5 * Math.PI], [-54, -104, 0], [50, -100, 0.5 * Math.PI]]) {
      const sw = Math.sin(ph + off) * amp, lift = Math.max(0, Math.cos(ph + off)) * 9 * amp;
      P.limb([[hx, hy], [hx + sw * 12, -54 - lift * 0.4], [hx + sw * 24 + (hx > 0 ? 4 : -2), -4 - lift]], 13);
    }
    // tail
    const tw = Math.sin(t * 3 + (o.phase || 0)) * 8;
    P.poly((c) => { c.moveTo(-70, -126); c.quadraticCurveTo(-112, -118 + tw, -116 + tw * 0.5, -58); c.lineTo(-102, -62); c.quadraticCurveTo(-98, -100, -68, -108); c.closePath(); });
    // body
    P.poly((c) => c.ellipse(0, -112, 78, 34, 0, 0, TAU));
    // neck and head: an arched mural neck, the head bowed
    P.poly((c) => {
      c.moveTo(36, -140); c.quadraticCurveTo(66, -202, 100, -212); c.lineTo(106, -230); c.lineTo(114, -210);
      c.quadraticCurveTo(140, -192, 158, -160); c.lineTo(150, -148); c.quadraticCurveTo(130, -152, 112, -166);
      c.quadraticCurveTo(92, -138, 74, -96); c.closePath();
    });
    if (rider) {
      P.limb([[-2, -142], [16, -112], [10, -84]], 12);                     // leg along the flank
      P.poly((c) => { c.moveTo(-16, -140); c.lineTo(12, -140); c.lineTo(14, -198); c.lineTo(-8, -202); c.closePath(); });
      P.disc(4, -216, 15);
      P.poly((c) => { c.ellipse(-2, -233, 10, 7, -0.3, 0, TAU); });          // turban knot
      P.limb([[6, -190], [30, -172], [50, -180]], 9);                       // the arm couching the lance
    }
  }
  function horseGold(g, t, o, rider) {
    // saddle-cloth border, bridle, and the lance with its pennant
    g.beginPath(); g.ellipse(-4, -116, 40, 26, 0, 0.2, Math.PI - 0.2); g.stroke();
    g.beginPath(); g.moveTo(106, -196); g.lineTo(150, -160); g.moveTo(112, -166); g.lineTo(98, -196); g.stroke();
    if (rider) {
      g.save(); g.lineWidth *= 1.4;
      g.beginPath(); g.moveTo(-50, -148); g.lineTo(118, -262); g.stroke();
      g.restore();
      g.beginPath(); g.moveTo(118, -262); g.lineTo(108, -246); g.lineTo(132, -272); g.lineTo(122, -244); g.closePath(); g.fill();
    }
  }
  function horseBanner(g, t, o) {
    const w = Math.sin(t * 5 + (o.phase || 0)) * 6;
    g.beginPath(); g.moveTo(-40, -141); g.lineTo(-14, -126 + w); g.lineTo(-30, -122 + w * 0.6); g.lineTo(-10, -112 + w); g.lineTo(-46, -128); g.closePath(); g.fill();
  }

  // ─── the elephant with its howdah ────────────────────────────────────────
  function elephantBody(P, t, o) {
    const ph = (o.phase || 0) + t * 4 * (o.gait ?? 1), amp = o.gait ?? 1;
    for (const [hx, off] of [[-48, Math.PI], [88, 0], [-82, 0], [58, Math.PI]]) {
      const sw = Math.sin(ph + off) * amp;
      P.limb([[hx, -120], [hx + sw * 7, -60], [hx + sw * 10, -6]], 40);
    }
    P.limb([[-118, -186], [-128, -136], [-122, -104]], 5);                  // tail
    P.poly((c) => { c.moveTo(-122, -150); c.quadraticCurveTo(-130, -250, -20, -258); c.quadraticCurveTo(110, -262, 140, -200); c.lineTo(150, -120); c.quadraticCurveTo(10, -78, -110, -104); c.closePath(); });
    P.disc(112, -206, 56);                                                   // the head's dome
    const sway = Math.sin(t * 1.6 + (o.phase || 0)) * 10;
    P.limb([[152, -188], [170, -140], [166 + sway * 0.4, -86], [158 + sway, -40]], 30);   // trunk
    P.limb([[158 + sway, -40], [176 + sway, -22]], 16);
    P.poly((c) => c.ellipse(86, -196, 34, 48, 0.1, 0, TAU));                 // ear
    // caparison: a scalloped cloth over the back
    P.poly((c) => {
      c.moveTo(-84, -236); c.lineTo(66, -240); c.lineTo(74, -162);
      for (let i = 0; i < 6; i++) { const x0 = 74 - i * 26; c.quadraticCurveTo(x0 - 13, -146, x0 - 26, -162); }
      c.lineTo(-90, -160); c.closePath();
    });
    // howdah: a railed box under a domed canopy
    P.poly((c) => { c.moveTo(-58, -246); c.lineTo(46, -246); c.lineTo(42, -292); c.lineTo(-54, -292); c.closePath(); });
    P.limb([[-50, -292], [-50, -326]], 6); P.limb([[38, -292], [38, -326]], 6);
    P.poly((c) => { c.moveTo(-66, -324); c.quadraticCurveTo(-6, -374, 50, -324); c.closePath(); });
    P.limb([[-8, -350], [-8, -368]], 4);
    // the warrior in the howdah, the mahout on the neck
    P.poly((c) => { c.moveTo(-26, -290); c.lineTo(-4, -290); c.lineTo(-6, -316); c.lineTo(-24, -318); c.closePath(); });
    P.disc(-15, -322, 9);
    P.poly((c) => { c.moveTo(86, -254); c.lineTo(106, -254); c.lineTo(104, -290); c.lineTo(88, -292); c.closePath(); });
    P.disc(97, -300, 11);
    P.limb([[96, -256], [116, -236], [110, -220]], 8);
  }
  function elephantGold(g, t, o, ivory) {
    // caparison border, the howdah's rail, a forehead ornament; the tusk in ivory
    g.beginPath(); g.moveTo(-84, -228); g.lineTo(66, -232); g.stroke();
    g.beginPath(); g.moveTo(-90, -168); g.lineTo(70, -168); g.stroke();
    for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(-50 + i * 34, -200, 7, 0, TAU); g.stroke(); }
    g.beginPath(); g.moveTo(-54, -270); g.lineTo(42, -270); g.stroke();
    g.beginPath(); g.moveTo(-66, -324); g.quadraticCurveTo(-6, -374, 50, -324); g.stroke();
    g.beginPath(); g.arc(128, -232, 9, 0, TAU); g.fill();
    g.save(); g.strokeStyle = ivory; g.lineWidth *= 2.2; g.lineCap = 'round';
    g.beginPath(); g.moveTo(140, -170); g.quadraticCurveTo(176, -160, 194, -132); g.stroke();
    g.restore();
  }

  // ─── the chariot: two horses, the car on a great wheel, the warrior, the banner ──
  function chariotBody(P, t, o) {
    const g = P.g;
    for (const [dx, ph] of [[214, 0.9], [176, 0]]) {
      g.save(); g.translate(dx, 0); g.scale(0.9, 0.9);
      horseBody(P, t, { ...o, phase: (o.phase || 0) + ph }, false);
      g.restore();
    }
    P.limb([[70, -112], [190, -124]], 7);                                   // the pole to the yoke
    P.limb([[-68, -100], [-68, -420]], 6);                                   // the banner staff (dhvaja)
    P.poly((c) => { c.moveTo(-74, -98); c.lineTo(80, -98); c.lineTo(90, -150); c.lineTo(64, -162); c.lineTo(-72, -162); c.closePath(); });
    P.poly((c) => { c.moveTo(64, -160); c.quadraticCurveTo(92, -180, 86, -212); c.lineTo(76, -206); c.quadraticCurveTo(78, -184, 56, -170); c.closePath(); });
    // the charioteer, seated at the front
    P.poly((c) => { c.moveTo(36, -160); c.lineTo(60, -160); c.lineTo(62, -204); c.lineTo(42, -208); c.closePath(); });
    P.disc(54, -220, 13);
    P.limb([[56, -196], [86, -176], [120, -150]], 7);                       // the reins
    // the warrior standing, bow raised
    P.poly((c) => { c.moveTo(-42, -160); c.lineTo(-8, -160); c.lineTo(-4, -238); c.lineTo(-32, -244); c.closePath(); });
    P.disc(-18, -260, 16);
    P.poly((c) => { c.moveTo(-28, -272); c.lineTo(-18, -296); c.lineTo(-8, -272); c.closePath(); });   // crown point
    P.limb([[-10, -232], [14, -226], [30, -230]], 9);
    // the wheel: rim, spokes, hub (drawn last: it stands in front of the car)
    const rot = t * 3 * (o.gait ?? 1);
    P.ring(0, -62, 56, 11);
    for (let k = 0; k < 4; k++) { const a = rot + (k * Math.PI) / 4; P.limb([[Math.cos(a) * 54, -62 + Math.sin(a) * 54], [-Math.cos(a) * 54, -62 - Math.sin(a) * 54]], 4); }
    P.disc(0, -62, 11);
  }
  function chariotGold(g, t, o) {
    g.beginPath(); g.moveTo(-74, -108); g.lineTo(82, -108); g.stroke();
    g.beginPath(); g.moveTo(-72, -152); g.lineTo(66, -152); g.stroke();
    g.beginPath(); g.arc(0, -62, 49, 0, TAU); g.stroke();
    g.beginPath(); g.arc(0, -62, 6, 0, TAU); g.fill();
    // the bow and its string
    g.beginPath(); g.arc(14, -232, 62, -1.25, 1.25); g.stroke();
    g.save(); g.lineWidth *= 0.5; g.beginPath(); g.moveTo(14 + Math.cos(-1.25) * 62, -232 + Math.sin(-1.25) * 62); g.lineTo(14 + Math.cos(1.25) * 62, -232 + Math.sin(1.25) * 62); g.stroke(); g.restore();
    g.beginPath(); g.arc(-68, -426, 8, 0, TAU); g.fill();                   // the finial
    for (const dx of [214, 176]) { g.save(); g.translate(dx, 0); g.scale(0.9, 0.9); horseGold(g, t, o, false); g.restore(); }
  }
  function chariotBanner(g, t, o) {
    const w = Math.sin(t * 4 + (o.phase || 0)), w2 = Math.sin(t * 4 + 1.2 + (o.phase || 0));
    g.beginPath();
    g.moveTo(-66, -412);
    g.quadraticCurveTo(-20, -414 + w * 8, 40, -402 + w2 * 12);
    g.lineTo(10, -386 + w2 * 6); g.lineTo(36, -366 + w * 10);
    g.quadraticCurveTo(-20, -372 + w * 6, -66, -366);
    g.closePath(); g.fill();
  }

  // ─── the foot soldier with spear and round shield ────────────────────────
  function soldierBody(P, t, o) {
    const ph = (o.phase || 0) + t * 6 * (o.gait ?? 1), amp = o.gait ?? 1;
    for (const off of [Math.PI, 0]) {
      const sw = Math.sin(ph + off) * amp, lift = Math.max(0, Math.cos(ph + off)) * 6 * amp;
      P.limb([[-2, -94], [-2 + sw * 10, -50 - lift * 0.3], [-4 + sw * 20, -4 - lift]], 12);
    }
    P.poly((c) => { c.moveTo(-20, -100); c.lineTo(18, -100); c.lineTo(22, -62); c.lineTo(-22, -62); c.closePath(); });   // the dhoti
    P.poly((c) => { c.moveTo(-14, -98); c.lineTo(14, -98); c.lineTo(16, -152); c.lineTo(-12, -158); c.closePath(); });
    P.disc(3, -172, 14);
    P.poly((c) => c.ellipse(-3, -188, 10, 7, -0.4, 0, TAU));                 // the turban knot
    P.limb([[-4, -148], [-10, -120], [6, -112], [28, -118]], 9);           // the back arm, gripping the spear
    P.disc(20, -124, 30);                                                    // the shield, on the near arm
  }
  function soldierGold(g, t, o) {
    g.save(); g.lineWidth *= 1.3;
    g.beginPath(); g.moveTo(22, -10); g.lineTo(42, -246); g.stroke();       // the spear shaft (in front: gold)
    g.restore();
    g.beginPath(); g.moveTo(42, -246); g.lineTo(36, -228); g.lineTo(44, -262); g.lineTo(48, -228); g.closePath(); g.fill();
    g.beginPath(); g.arc(20, -124, 22, 0, TAU); g.stroke();
    g.beginPath(); g.arc(20, -124, 6, 0, TAU); g.fill();
  }

  const BODY = { horse: (P, t, o) => horseBody(P, t, o, true), elephant: elephantBody, chariot: chariotBody, soldier: soldierBody };

  function setup(ctx, o) {
    ctx.translate(o.x || 0, o.y || 0);
    const s = o.s || 1;
    ctx.scale(s * (o.dir === -1 ? -1 : 1), s);
    return s;
  }

  function shape(ctx, kind, color, o = {}) {
    ctx.save();
    const s = setup(ctx, o);
    BODY[kind](painter(ctx, color, null, 0), o.t || 0, o);
    if (kind === 'chariot') { ctx.fillStyle = color; chariotBanner(ctx, o.t || 0, o); }
    void s;
    ctx.restore();
  }

  function draw(ctx, kind, o = {}) {
    const t = o.t || 0, a = o.alpha ?? 1;
    if (a <= 0.003) return;
    ctx.save();
    ctx.globalAlpha *= a;
    const s = o.s || 1;
    const lw = (o.lw ?? 2.4) / s;
    // rim: the silhouette in the rim colour, shifted toward the light, under the body
    if (o.rim && o.light != null) {
      const rw = (o.rimW ?? 3);
      ctx.save();
      ctx.translate(Math.cos(o.light) * rw, Math.sin(o.light) * rw);
      shape(ctx, kind, o.rim, o);
      ctx.restore();
    }
    setup(ctx, o);
    const fill = o.fill || PALETTE.fill, line = o.line === undefined ? PALETTE.line : o.line;
    BODY[kind](painter(ctx, fill, line, lw), t, o);
    // banners in their own colour
    const bc = o.banner || PALETTE.banner;
    ctx.fillStyle = bc;
    if (kind === 'chariot') chariotBanner(ctx, t, o);
    if (kind === 'horse') horseBanner(ctx, t, o);
    // ornaments
    if (o.gold !== null) {
      ctx.strokeStyle = ctx.fillStyle = o.gold || PALETTE.gold;
      ctx.lineWidth = Math.max(1.6, 2.2 / Math.sqrt(s));
      ctx.lineCap = 'round';
      if (kind === 'horse') horseGold(ctx, t, o, true);
      if (kind === 'elephant') elephantGold(ctx, t, o, o.ivory || PALETTE.ivory);
      if (kind === 'chariot') chariotGold(ctx, t, o);
      if (kind === 'soldier') soldierGold(ctx, t, o);
    }
    ctx.restore();
  }

  // ─── the patti tile: one unit of each kind in two registers, like a frieze panel ──
  const TILE = { w: 640, h: 420, res: 2 };   // layout units; the canvas is res × larger
  TILE.aspect = TILE.w / TILE.h;
  /** Layout of the patti in a TILE.w × TILE.h panel: [kind, x, y, s, dir]. Also used large (episode 3). */
  const PATTI = [
    ['chariot', 168, 196, 0.40], ['elephant', 470, 196, 0.48],
    ['horse', 92, 392, 0.27], ['horse', 172, 392, 0.27], ['horse', 252, 392, 0.27],
    ['soldier', 352, 392, 0.62], ['soldier', 410, 392, 0.62], ['soldier', 468, 392, 0.62], ['soldier', 526, 392, 0.62], ['soldier', 584, 392, 0.62],
  ];
  let tiles = null;
  function tile(level = 0) {
    if (!tiles) {
      tiles = [];
      const c = document.createElement('canvas');
      c.width = TILE.w * TILE.res; c.height = TILE.h * TILE.res;
      const g = c.getContext('2d');
      g.scale(TILE.res, TILE.res);
      // dark plaster, a gold border, a register line
      g.fillStyle = '#1c0f0a'; g.fillRect(0, 0, TILE.w, TILE.h);
      g.strokeStyle = 'rgba(231,181,74,0.75)'; g.lineWidth = 8; g.strokeRect(6, 6, TILE.w - 12, TILE.h - 12);
      g.fillStyle = 'rgba(231,181,74,0.45)'; g.fillRect(14, 212, TILE.w - 28, 4);
      PATTI.forEach(([kind, x, y, s], i) => draw(g, kind, { x, y, s, t: 0.3 * i, gait: 0, fill: '#8a3c1e', line: '#140906', lw: 3, gold: '#f2c560', banner: '#e7b54a' }));
      tiles.push(c);
      // mip levels: halve while the tile is still useful
      while (tiles[tiles.length - 1].width > 6) {
        const p = tiles[tiles.length - 1], m = document.createElement('canvas');
        m.width = Math.max(1, Math.round(p.width / 2)); m.height = Math.max(1, Math.round(p.height / 2));
        const mg = m.getContext('2d'); mg.imageSmoothingQuality = 'high';
        mg.drawImage(p, 0, 0, m.width, m.height);
        tiles.push(m);
      }
    }
    return tiles[Math.max(0, Math.min(tiles.length - 1, level))];
  }
  function pattern(ctx, x, y, cellW, cellH, devPx) {
    tile(0);
    let lv = 0;
    while (lv + 1 < tiles.length && tiles[lv + 1].width >= devPx) lv++;
    const img = tiles[lv];
    const p = ctx.createPattern(img, 'repeat');
    p.setTransform(new DOMMatrix([cellW / img.width, 0, 0, cellH / img.height, x, y]));
    return p;
  }

  KIT.army = { draw, shape, SIZE, TILE, PATTI, tile, pattern, PALETTE };
})();
