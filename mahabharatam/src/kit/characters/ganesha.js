/*
 * CHARACTER · GANESHA (Vighneshvara, Ekadanta: "the one-tusked"), the scribe.
 *
 * As tradition tells it (the vulgate's Adi Parva 1, not the Critical Edition), Vyasa
 * dictated the epic and Ganesha wrote it down. Drawn reverently, as a temple mural /
 * tholu bommalata shadow puppet in profile: an elephant's head with a great fan ear and a
 * trunk curling in toward the chest; a tall tiered karanda-mukuta crown; a full round
 * belly bound with a serpent belt; FOUR ARMS (the front pair writes: the stylus in the
 * near hand, the palm leaf in the far hand; the raised back pair holds the ankusha goad
 * and a lotus bud); a dhoti with a gold border; seated cross-legged to write.
 *
 * THE TUSK: whole until he breaks it. pose { tusk: 'broken' } (or the 'break-tusk' pose
 * past k = 0.5) draws the right tusk as a stub, and from then on he writes with the broken
 * tusk instead of the stylus. Tusks are painted ivory over the silhouette so they read.
 *
 * SIGNATURE LIGHT: warm saffron-vermilion. A vermilion rim #c8401a → #ffb070 (rim × 1.05,
 * glow 0.9) on a deep warm-black fill #120806, an ember inner glow #5a1a0a, gold
 * ornaments, and a soft vermilion aura behind the head (the sindhura he is worshipped with).
 *
 * Faces LEFT natively. Feet (or seat) on (x, y). scale 1 ≈ 1000 px to the crown standing.
 *
 * Poses: stand · sit · write (k; phase = the stylus stroke) · pause (k: the stylus lifts,
 * head bows, trunk curls: grasping a verse) · speak (k: the near hand rises, one finger up:
 * "one condition") · break-tusk (k: hand to the tusk 0→0.45, snap at 0.5, down to write 1) · bless
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, CH = KIT.characters;
  const { TAU, clamp, lerp, E } = R;
  const { cut, limb, limbOutline, ik, hand, along } = CH;

  const D = { hip: 430, thigh: 226, shin: 206, foot: 70, sitHip: 165 };
  const PIV = -430, SH_N = [-6, -730], SH_F = [26, -736], UP = 150, FO = 138;
  const HEAD = [6, -790];                // head pivot (local), on the neck
  const IVORY = '#f2e6c8', LEAF = '#d9b878';

  function rig(P) {
    const po = P.po, T = P.T, k = po.k;
    const sitting = po.base === 'sit' || ['write', 'pause', 'break-tusk'].includes(po.name);
    const r = CH.profileRig(sitting ? { ...po, base: 'sit' } : po, D);
    r.T = T; r.wind = po.wind ?? 0.4;
    r.lean = sitting ? 0.06 : r.st * 0.04;
    r.speak = P.ex.speak || 0;
    // the tusk
    const brk = po.name === 'break-tusk';
    r.broken = po.tusk === 'broken' || (brk && k >= 0.5);
    r.snap = brk ? Math.exp(-Math.abs(k - 0.5) / 0.04) : 0;
    // writing: the leaf on the far hand over the knee, the stylus hand stroking along it
    const leafAt = [-232, -470];
    r.leaf = sitting ? leafAt : null;
    r.leafA = -0.08;
    r.farHand = sitting ? [-190, -486] : [-60, -560];
    const strokeX = -290 + 70 * (0.5 + 0.5 * Math.sin(po.phase || 0));
    const writeAt = [strokeX, -508 - 6 * Math.abs(Math.cos(po.phase || 0))];
    const rest = sitting ? [-150, -540] : [-50, -470];
    r.look = (P.ex.look || 0);
    r.curl = 0;
    r.nearKind = 'fist'; r.nearA = -0.6;
    r.hand = rest; r.pen = sitting ? 'stylus' : null;
    if (po.name === 'write') { r.hand = along(rest, writeAt, k); r.look += 0.16 * k; r.nearA = -0.9; }
    if (po.name === 'pause') {
      const lift = [-200, -660];
      r.hand = along(writeAt, lift, k); r.look += lerp(0.16, 0.26, k); r.curl = k; r.nearA = -1.3;
    }
    if (po.name === 'speak') { r.nearKind = 'point'; r.hand = along(rest, [-200, -830], k); r.nearA = -Math.PI / 2 - 0.35; r.pen = null; r.look -= 0.05 * k; }
    if (po.name === 'bless') { r.nearKind = 'abhaya'; r.hand = along(rest, [-170, -800], k); r.nearA = -Math.PI / 2 - 0.1; r.pen = null; }
    if (brk) {
      // to the tusk (the tusk root is at HEAD + (-74, 18) rotated), snap, back down to the leaf with it
      const tuskRoot = [HEAD[0] - 92, HEAD[1] + 30];
      if (k < 0.5) { r.hand = along(rest, tuskRoot, E.inOutCubic(clamp(k / 0.45))); r.nearA = -2.4; r.pen = null; }
      else { r.hand = along(tuskRoot, writeAt, E.inOutCubic(clamp((k - 0.55) / 0.45))); r.nearA = lerp(-2.4, -0.9, clamp((k - 0.55) / 0.45)); r.pen = 'tusk'; }
      r.look += 0.08 - 0.12 * r.snap;
    }
    if (r.broken && r.pen === 'stylus') r.pen = 'tusk';
    const c = Math.cos(-r.lean), s = Math.sin(-r.lean);
    const rot = (p) => [p[0] * c - (p[1] - PIV) * s, p[0] * s + (p[1] - PIV) * c + PIV];
    r.shN = rot(SH_N); r.shF = rot(SH_F);
    r.sitting = sitting;
    return r;
  }

  // ─── the head (local to HEAD, rotated by look) ───────────────────────────────
  const TRUNK = (r) => {
    const sw = Math.sin(r.T * 0.9) * 6 + r.speak * 8;
    const c = r.curl;
    return [[-88, -40], [-136, 24 + sw * 0.2], [-176, 100 + sw * 0.5], [-198, 172 + sw], [lerp(-232, -222, c), lerp(204, 186, c) + sw], [lerp(-266, -248, c), lerp(190, 160, c) + sw], [lerp(-276, -252, c), lerp(158, 128, c) + sw]];
  };
  const TUSK = [[-76, 30], [-106, 62], [-140, 78], [-170, 70], [-188, 50]];
  const TUSK_W = [24, 20, 15, 9, 2];

  function headPath(g, r) {
    g.save();
    g.translate(HEAD[0], HEAD[1]);
    g.rotate(r.look);
    // the great ear: a fan behind the eye, its lower edge scalloped, swaying a little
    const ew = Math.sin(r.T * 1.3) * 0.05;
    g.save(); g.translate(40, -70); g.rotate(ew);
    g.moveTo(0, -60);
    g.bezierCurveTo(70, -120, 150, -70, 140, 20);
    g.bezierCurveTo(146, 60, 120, 96, 100, 104);
    g.quadraticCurveTo(90, 124, 70, 110);
    g.quadraticCurveTo(56, 132, 36, 112);
    g.quadraticCurveTo(14, 126, 4, 100);
    g.closePath(); cut(g);
    g.restore();
    // cranium (a high double dome) and brow
    g.moveTo(80, -70);
    g.bezierCurveTo(90, -150, 40, -196, -20, -190);
    g.bezierCurveTo(-60, -186, -96, -160, -104, -110);
    g.bezierCurveTo(-110, -80, -100, -56, -92, -40);
    g.lineTo(-40, 40);
    g.bezierCurveTo(-10, 70, 40, 60, 70, 20);
    g.closePath(); cut(g);
    // cheek and jaw down to the neck
    g.moveTo(-60, 20); g.ellipse(-26, 20, 64, 52, 0.2, 0, TAU); cut(g);
    // the trunk
    const tp = TRUNK(r);
    limb(g, tp, [86, 70, 56, 42, 30, 22, 18]);
    // the crown (karanda-mukuta): a band, four tiers narrowing, a lotus-bud finial
    g.save(); g.translate(-10, -178); g.rotate(-0.08);
    g.moveTo(-74, 10); g.lineTo(74, 10); g.lineTo(70, -18); g.lineTo(-70, -18); g.closePath(); cut(g);
    const tiers = [[60, -18, -64], [48, -64, -104], [36, -104, -138], [24, -138, -166]];
    for (const [w, y0, y1] of tiers) { g.moveTo(-w, y0); g.lineTo(w, y0); g.lineTo(w * 0.8, y1); g.lineTo(-w * 0.8, y1); g.closePath(); cut(g); }
    g.moveTo(0, -166); g.bezierCurveTo(16, -180, 12, -204, 0, -222); g.bezierCurveTo(-12, -204, -16, -180, 0, -166); cut(g);
    // side wings (makara-like flares)
    for (const s of [-1, 1]) { g.moveTo(s * 70, -6); g.quadraticCurveTo(s * 106, -26, s * 104, -62); g.quadraticCurveTo(s * 88, -34, s * 62, -30); g.closePath(); cut(g); }
    g.restore();
    g.restore();
  }

  function tuskPts(r) {
    return r.broken ? [TUSK[0], [-94, 50], [-102, 56]] : TUSK;
  }

  function torsoPath(g) {
    CH.torso(g, { waistY: -430, neckY: -780, chestY: -650, front: -66, back: 66, waistF: -80, waistB: 64, neckF: -10, neckB: 40, pec: 10, lat: 8 });
    // the full round belly
    g.moveTo(-200, -520); g.ellipse(-56, -528, 148, 132, 0.08, 0, TAU); cut(g);
  }

  function stylus(g, r) {
    // a lekhani: a thin iron stylus, held point-down on the leaf
    const a = r.nearA + 0.9;
    const p = r.hand;
    limbOutline(g, [[p[0] + Math.cos(a) * 40, p[1] + Math.sin(a) * 40], p, [p[0] - Math.cos(a) * 64, p[1] - Math.sin(a) * 64]], [6, 7, 2]); cut(g);
  }

  function armsPath(g, r, which) {
    if (which === 'backarms') {
      // the raised back pair: ankusha (near) and a lotus bud (far), behind the head
      const sh = [r.shF[0] + 20, r.shF[1] + 10];
      const hn = [118, -952], hf = [168, -900];
      limb(g, [sh, [116, -800], hn], [48, 34, 26]);
      hand(g, hn, -Math.PI / 2 - 0.4, 30, 'fist');
      limb(g, [sh, [164, -770], hf], [44, 32, 24]);
      hand(g, hf, -Math.PI / 2 + 0.2, 28, 'fist');
      // ankusha: a short shaft with a hook and a spike
      g.save(); g.translate(hn[0], hn[1]); g.rotate(-0.35);
      limbOutline(g, [[0, 70], [0, -120]], [8, 7]); cut(g);
      g.moveTo(-4, -118); g.quadraticCurveTo(-46, -128, -40, -84); g.lineTo(-30, -88); g.quadraticCurveTo(-34, -112, -2, -104); g.closePath(); cut(g);
      g.moveTo(-5, -118); g.lineTo(0, -162); g.lineTo(5, -118); g.closePath(); cut(g);
      g.restore();
      // a lotus bud on its stalk
      g.save(); g.translate(hf[0], hf[1]); g.rotate(0.15);
      limbOutline(g, [[0, 30], [4, -60], [0, -110]], [5, 5, 4]); cut(g);
      g.moveTo(0, -112); g.bezierCurveTo(20, -130, 18, -160, 0, -178); g.bezierCurveTo(-18, -160, -20, -130, 0, -112); cut(g);
      g.restore();
    } else if (which === 'far') {
      const el = ik(r.shF, r.farHand, UP, FO, 1);
      limb(g, [r.shF, el, r.farHand], [56, 40, 30]);
      hand(g, r.farHand, -0.2, 34, 'cup');
    } else {
      const el = ik(r.shN, r.hand, UP, FO, -1);
      limb(g, [r.shN, el, r.hand], [60, 42, 32]);
      hand(g, r.hand, r.nearA, 36, r.nearKind);
      if (r.pen === 'stylus') stylus(g, r);
    }
  }

  function clothPath(g, r) {
    CH.lowerCloth(g, r, { waistY: -430, waistF: -150, waistB: 64, len: 'ankle', flare: 1.1, pleats: false });
  }

  function upper(g, r, part) {
    g.save(); g.translate(0, r.drop);
    if (part === 'back') { g.beginPath(); armsPath(g, r, 'backarms'); armsPath(g, r, 'far'); g.fill(); }
    else if (part === 'body') {
      g.save(); g.translate(0, PIV); g.rotate(-r.lean); g.translate(0, -PIV);
      g.beginPath(); torsoPath(g); g.fill();
      g.beginPath(); headPath(g, r); g.fill();
      g.restore();
    } else { g.beginPath(); armsPath(g, r, 'near'); g.fill(); }
    g.restore();
  }

  function shape(g, color, P, r) {
    g.translate(0, r.bob);
    g.fillStyle = color;
    upper(g, r, 'back');
    g.beginPath(); CH.legs(g, r, [96, 62, 32]); g.fill();
    g.beginPath(); clothPath(g, r); g.fill();
    upper(g, r, 'body');
    upper(g, r, 'front');
  }

  function ornaments(g, P, r, a, color) {
    if (a <= 0.01) return;
    g.translate(0, r.bob);
    const A0 = g.globalAlpha;
    g.globalAlpha = A0 * a;
    g.strokeStyle = color; g.fillStyle = color; g.lineCap = 'round'; g.lineJoin = 'round';
    g.save(); g.translate(0, r.drop);
    g.save(); g.translate(0, PIV); g.rotate(-r.lean); g.translate(0, -PIV);
    // the serpent belt round the belly (Vasuki), its hood at the front
    g.lineWidth = 7; g.beginPath(); g.ellipse(-56, -500, 150, 40, 0.08, 0.15, Math.PI - 0.2); g.stroke();
    g.beginPath(); g.ellipse(-200, -488, 14, 20, -0.3, 0, TAU); g.fill();
    // necklaces
    g.lineWidth = 4; g.beginPath(); g.moveTo(-52, -742); g.quadraticCurveTo(-20, -690, 40, -740); g.stroke();
    g.lineWidth = 3; g.beginPath(); g.moveTo(-60, -730); g.quadraticCurveTo(-30, -650, 44, -726); g.stroke();
    // head: crown rules, ear border, eye, tilak
    g.save(); g.translate(HEAD[0], HEAD[1]); g.rotate(r.look);
    g.save(); g.translate(-10, -178); g.rotate(-0.08);
    g.lineWidth = 3.5;
    for (const y of [10, -18, -64, -104, -138]) { const w = y > -20 ? 72 : y > -70 ? 58 : y > -110 ? 46 : 34; g.beginPath(); g.moveTo(-w, y); g.lineTo(w, y); g.stroke(); }
    for (let i = -2; i <= 2; i++) { g.beginPath(); g.arc(i * 26, -4, 4.5, 0, TAU); g.fill(); }
    g.restore();
    const ew = Math.sin(r.T * 1.3) * 0.05;
    g.save(); g.translate(40, -70); g.rotate(ew);
    g.lineWidth = 3; g.beginPath();
    g.moveTo(10, -50); g.bezierCurveTo(70, -104, 138, -60, 128, 18); g.bezierCurveTo(132, 52, 112, 84, 96, 92); g.stroke();
    g.restore();
    // eye: a small gold almond with a dark pupil
    g.beginPath(); g.ellipse(-62, -88, 11, 6, -0.25, 0, TAU); g.fill();
    // tilak: a vermilion-gold mark on the brow
    g.save(); g.fillStyle = '#ff6a2a'; g.beginPath(); g.ellipse(-86, -128, 6, 12, -0.4, 0, TAU); g.fill(); g.restore();
    // trunk: a gold contour so it reads against the body, and its folds
    const tp = TRUNK(r);
    g.save(); g.globalAlpha = A0 * a * 0.7; g.lineWidth = 3; g.beginPath(); limbOutline(g, tp.slice(1), [70, 56, 42, 30, 22, 18]); g.stroke(); g.restore();
    g.lineWidth = 2.5;
    for (const u of [0.2, 0.32, 0.44]) { const i = Math.floor(u * (tp.length - 1)), p = tp[i]; g.beginPath(); g.moveTo(p[0] - 26, p[1] + 4); g.quadraticCurveTo(p[0], p[1] + 12, p[0] + 26, p[1] + 2); g.stroke(); }
    // the tusk, ivory
    g.save(); g.globalAlpha = A0 * Math.min(1, a * 1.4 + 0.3); g.fillStyle = IVORY;
    g.beginPath(); limbOutline(g, tuskPts(r), r.broken ? [24, 20, 16] : TUSK_W); g.fill();
    if (r.broken) { g.fillStyle = '#c9b48a'; g.beginPath(); g.moveTo(-96, 44); g.lineTo(-108, 50); g.lineTo(-100, 56); g.lineTo(-110, 62); g.lineTo(-94, 62); g.closePath(); g.fill(); }
    g.restore();
    g.restore();
    g.restore();
    // armlets and bracelets on the front arms (so the arms read over the belly)
    for (const [sh, hd] of [[r.shN, r.hand]]) {
      const el = ik(sh, hd, UP, FO, sh === r.shN ? -1 : 1);
      g.lineWidth = 6;
      const band = (p, q, u, w) => { const x = lerp(p[0], q[0], u), y = lerp(p[1], q[1], u), dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy) || 1; g.beginPath(); g.moveTo(x - dy / l * w, y + dx / l * w); g.lineTo(x + dy / l * w, y - dx / l * w); g.stroke(); };
      band(sh, el, 0.5, 30); band(el, hd, 0.82, 20);
    }
    // the palm leaf on the far hand (written as he goes)
    if (r.leaf) {
      g.save(); g.globalAlpha = A0 * Math.min(1, 0.6 + a);
      g.translate(r.leaf[0], r.leaf[1]); g.rotate(r.leafA);
      g.fillStyle = LEAF; g.beginPath(); R.roundRectPath(g, -120, -16, 240, 32, 14); g.fill();
      g.strokeStyle = 'rgba(70,40,16,0.85)'; g.lineWidth = 2;
      for (const y of [-6, 6]) { g.beginPath(); g.moveTo(-100, y); for (let x = -100; x < 96; x += 9) g.lineTo(x + 4, y + ((x / 9) % 2 ? -3 : 3)); g.stroke(); }
      g.restore();
    }
    // the pen: stylus (iron, gold-lit) or the broken tusk (ivory) in the near hand
    if (r.pen === 'tusk') {
      g.save(); g.globalAlpha = A0 * Math.min(1, 0.7 + a);
      const p = r.hand, aa = r.nearA + 0.9;
      g.fillStyle = IVORY; g.beginPath();
      limbOutline(g, [[p[0] + Math.cos(aa) * 30, p[1] + Math.sin(aa) * 30], p, [p[0] - Math.cos(aa) * 70, p[1] - Math.sin(aa) * 70 + 6], [p[0] - Math.cos(aa) * 92, p[1] - Math.sin(aa) * 92 + 14]], [18, 16, 9, 2]); g.fill();
      g.restore();
    } else if (r.pen === 'stylus') {
      g.lineWidth = 2; const p = r.hand, aa = r.nearA + 0.9;
      g.beginPath(); g.moveTo(p[0] + Math.cos(aa) * 38, p[1] + Math.sin(aa) * 38); g.lineTo(p[0] - Math.cos(aa) * 60, p[1] - Math.sin(aa) * 60); g.stroke();
    }
    // the snap: a white-gold flash where the stylus breaks / the tusk comes away
    if (r.snap > 0.05) {
      g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = A0 * r.snap;
      g.fillStyle = '#fff2c8'; g.beginPath(); g.arc(r.hand[0], r.hand[1], 26 * r.snap + 6, 0, TAU); g.fill();
      g.restore();
    }
    g.restore();
  }

  /** The aura: a warm vermilion glow behind the head and a faint ring (the sindhura of worship). */
  function before(ctx, P, r, k) {
    const sx = P.flip ? -P.s : P.s;
    const hx = P.x + 10 * sx, hy = P.y + (r.bob + r.drop - 880) * P.s;
    KIT.glow(ctx, hx, hy, 560 * P.s, '#ff7a3a', 0.3 * k);
    KIT.glow(ctx, hx, hy, 240 * P.s, '#ffc080', 0.22 * k);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.24 * k;
    ctx.strokeStyle = '#ffa060'; ctx.lineWidth = Math.max(1, 5 * P.s);
    ctx.beginPath(); ctx.arc(hx, hy, 230 * P.s, 0, TAU); ctx.stroke();
    ctx.restore();
  }

  const bible = {
    name: 'Ganesha (Ekadanta), the scribe',
    role: 'As tradition tells it (later tradition, not the Critical Edition): the scribe who wrote the epic as Vyasa dictated it, on the condition that Vyasa never stop; when his pen broke he broke off his own tusk and wrote on.',
    palette: { fill: '#120806', inner: '#5a1a0a', rimDim: '#c8401a', rimBright: '#ffb070', aura: '#ff7a3a', tusk: IVORY, leaf: LEAF, ornamentDim: '#a8741f', ornament: '#ffd27a' },
    proportions: 'Standing ≈ 1000 units to the crown tip (crown 230); seated ≈ 760. Hip 430, thigh 226, shin 206. Head (cranium + ear) ≈ 300 across; trunk ≈ 310 long; belly 296 × 264. Stout arms (60 → 32).',
    props: ['palm leaf (far hand, over the knee)', 'iron stylus (lekhani), later the broken tusk', 'ankusha goad and lotus bud (the raised back arms)', 'karanda-mukuta crown', 'serpent belt (Vasuki)', 'tilak'],
    light: 'Warm saffron-vermilion: rim #c8401a → #ffb070 (rim × 1.05, glow 0.9), ember inner #5a1a0a on warm black #120806, a vermilion aura #ff7a3a and ring behind the head. Tusks and leaf are painted over the silhouette (ivory, palm-gold).',
    poses: [
      { name: 'stand' }, { name: 'sit' },
      { name: 'write', note: 'k; phase drives the stroke' }, { name: 'pause', note: 'k: stylus lifts, head bows, trunk curls' },
      { name: 'speak', note: 'k: one finger raised' }, { name: 'break-tusk', note: 'k: to the tusk, snap at 0.5, write with it' },
      { name: 'bless', note: 'abhaya (k)' },
    ],
    voice: 'ganesha',
  };

  CH.define({
    id: 'ganesha', bible, rig, shape, ornaments, before, defaultPose: 'sit',
    rule: {
      fill: '#120806', lit: '#3a1408', litGain: 0.8,
      rim: ['#c8401a', '#ffb070'], inner: '#5a1a0a', innerA: [0.9, 0.45], glow: 0.9, rimW: 1.05,
      ornament: ['#a8741f', '#ffd27a'], ornamentA: [0.5, 0.85],
    },
    bounds: () => [-420, -1240, 330, 20],
  });
  CH.ROSTER.push('ganesha');
})();
