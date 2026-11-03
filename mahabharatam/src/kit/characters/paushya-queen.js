/*
 * CHARACTER · KING PAUSHYA'S QUEEN · `queen`   (+ CH.female, the shared female figure,
 * and KIT.kundala, THE EARRINGS of episode 6, drawn the same wherever they go)
 *
 * Episode 6 (Adi Parva 3): Uttanka comes for her earrings, the gift his teacher's
 * wife asked for. She gives them gladly, and warns him: "Takshaka, the serpent
 * king, wants these."
 *
 * Tall and composed. A high crown-bun (kesha-bandha) ringed with jasmine and a
 * jewelled chudamani; a forehead pendant; the great round KUNDALA earrings (until
 * she gives them away: pose.earrings === false); a layered necklace, armlets,
 * stacked bangles, a jewelled girdle; an ankle-length pleated sari whose pallu
 * crosses the chest, goes over the near shoulder and streams behind her.
 *
 * SIGNATURE LIGHT: palace lamp-gold with rose. Fill #120a08, inner #5a2a14,
 * rim #d89a48 → #fff0c0; ornaments #d8a848 → #fff4b0 at 0.55–1.0 (as bright
 * as the king's: she is a queen). The earrings carry their own glint (KIT.kundala).
 *
 * Faces LEFT natively. Feet on (x, y). scale 1 ≈ 1000 px to the crown of the bun.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, CH = KIT.characters;
  const { TAU, clamp, lerp } = R;
  const { cut, limb, limbOutline, ik, hand, along, ribbon } = CH;

  // ─── KIT.kundala: the earrings ─────────────────────────────────────────────
  /**
   * One earring: a heavy gold ring with a ruby boss and three pearl drops, and a
   * travelling glint. (x, y) = the ring's centre, d = its diameter in px.
   * o = { a (alpha), glow (0..1.5), tilt (rad), cold (0..1: green light of the Naga world) }
   */
  function kundala(ctx, x, y, d, T, o = {}) {
    const a = o.a ?? 1;
    if (a <= 0.003) return;
    const r = d / 2, glow = o.glow ?? 0.6, cold = o.cold || 0;
    ctx.save();
    ctx.translate(x, y); ctx.rotate(o.tilt || 0);
    ctx.globalAlpha = a;
    KIT.glow(ctx, 0, 0, r * 4.2, cold ? R.mix('#ffc860', '#b8ffd8', cold * 0.5) : '#ffc860', 0.35 * glow * a);
    // the ring
    const g = ctx.createLinearGradient(-r, -r, r, r);
    g.addColorStop(0, '#fff2c0'); g.addColorStop(0.35, '#e7b54a'); g.addColorStop(0.7, '#a8741f'); g.addColorStop(1, '#f7dc9c');
    ctx.strokeStyle = g; ctx.lineWidth = r * 0.36;
    ctx.beginPath(); ctx.arc(0, 0, r * 0.78, 0, TAU); ctx.stroke();
    ctx.strokeStyle = 'rgba(80,40,10,0.6)'; ctx.lineWidth = Math.max(1, r * 0.05);
    ctx.beginPath(); ctx.arc(0, 0, r * 0.6, 0, TAU); ctx.stroke();
    // granulation beads round the ring
    ctx.fillStyle = '#fff0c0';
    for (let i = 0; i < 14; i++) { const t = (i / 14) * TAU; ctx.beginPath(); ctx.arc(Math.cos(t) * r * 0.97, Math.sin(t) * r * 0.97, r * 0.06, 0, TAU); ctx.fill(); }
    // the ruby boss
    ctx.fillStyle = '#c0182a';
    ctx.beginPath(); ctx.arc(0, r * 0.78, r * 0.22, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,200,200,0.9)';
    ctx.beginPath(); ctx.arc(-r * 0.06, r * 0.72, r * 0.07, 0, TAU); ctx.fill();
    // pearl drops
    for (const dx of [-0.32, 0, 0.32]) {
      const py = r * (1.25 + (dx ? 0 : 0.18)) + Math.sin(T * 3 + dx * 9) * r * 0.03;
      ctx.strokeStyle = '#e7b54a'; ctx.lineWidth = Math.max(1, r * 0.04);
      ctx.beginPath(); ctx.moveTo(dx * r, r); ctx.lineTo(dx * r, py); ctx.stroke();
      ctx.fillStyle = '#fbf4e4'; ctx.beginPath(); ctx.arc(dx * r, py + r * 0.1, r * 0.11, 0, TAU); ctx.fill();
    }
    // the glint: a four-point sparkle travelling round the ring
    const gt = T * 1.3 + (o.seed || 0);
    const sp = 0.5 + 0.5 * Math.sin(gt * 2.2);
    const gx = Math.cos(gt) * r * 0.78, gy = Math.sin(gt) * r * 0.78;
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = `rgba(255,250,230,${(0.5 + 0.5 * sp) * Math.min(1, glow)})`;
    const s = r * (0.35 + 0.35 * sp);
    ctx.beginPath(); ctx.moveTo(gx, gy - s); ctx.lineTo(gx + s * 0.14, gy); ctx.lineTo(gx, gy + s); ctx.lineTo(gx - s * 0.14, gy); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(gx - s, gy); ctx.lineTo(gx, gy + s * 0.14); ctx.lineTo(gx + s, gy); ctx.lineTo(gx, gy - s * 0.14); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  /** The pair, side by side (in a palm, on a cloth): centre (x, y), each of diameter d. */
  function kundalaPair(ctx, x, y, d, T, o = {}) {
    kundala(ctx, x - d * 0.62, y, d, T, { ...o, tilt: -0.15 + (o.tilt || 0), seed: 0 });
    kundala(ctx, x + d * 0.62, y + d * 0.08, d, T, { ...o, tilt: 0.12 + (o.tilt || 0), seed: 2.1 });
  }
  KIT.kundala = { draw: kundala, pair: kundalaPair };

  // ─── CH.female: the shared female figure (profile, faces left) ──────────────
  const D = { hip: 480, thigh: 240, shin: 226, foot: 66, sitHip: 140 };
  const PIV = -480, UP = 160, FO = 148;

  /** Base rig + hand targets for the common poses. o = { headCover } */
  function femaleRig(P, extra) {
    const raw = P.po, k = raw.k;
    const r = CH.profileRig(raw, D);
    r.T = P.T; r.wind = raw.wind ?? 0.5;
    r.lean = r.st * 0.04;
    r.look = P.ex.look || 0; r.speak = P.ex.speak || 0;
    // hands folded at the waist by default
    let nh = [-46, -520], nk = 'cup', na = 0.3, fh = [-20, -526], fk = 'cup', fa = 0.2;
    if (r.sitting) { nh = [-120, -440]; fh = [-90, -446]; }
    if (raw.name === 'walk') { nh = [-20 + 30 * Math.sin(raw.phase || 0), -540]; fh = [30 - 30 * Math.sin(raw.phase || 0), -540]; nk = 'open'; na = Math.PI / 2 + 0.3; }
    if (raw.name === 'speak') { nh = along(nh, [-230, -700], k); nk = 'open'; na = Math.PI + 0.5; }
    if (raw.name === 'give' || raw.name === 'ask') {
      nh = along(nh, [-250, -640], k); nk = 'cup'; na = 0;
      if (raw.name === 'give') { fh = along(fh, [-210, -630], k); fk = 'cup'; }
      else { nk = 'open'; na = Math.PI - 0.15; }
    }
    if (raw.name === 'warn') { nh = along(nh, [-170, -860], k); nk = 'point'; na = -Math.PI / 2 - 0.25; }
    if (raw.name === 'bless') { nh = along(nh, [-170, -830], k); nk = 'abhaya'; na = -Math.PI / 2 - 0.1; }
    r.hand = nh; r.nearKind = nk; r.nearA = na; r.farHand = fh; r.farKind = fk; r.farA = fa;
    const c = Math.cos(-r.lean), s = Math.sin(-r.lean);
    const rot = (p) => [p[0] * c - (p[1] - PIV) * s, p[0] * s + (p[1] - PIV) * c + PIV];
    r.rot = rot;
    r.shN = rot([2, -748]); r.shF = rot([24, -752]);
    Object.assign(r, extra || {});
    return r;
  }

  /** Face in profile, at the head origin (0, 0) = the base of the skull's jaw line. */
  function face(g) {
    g.moveTo(28, 6);
    g.bezierCurveTo(38, -24, 46, -58, 42, -92);
    g.bezierCurveTo(38, -122, 18, -136, -10, -134);
    g.bezierCurveTo(-34, -132, -44, -116, -44, -100);
    g.lineTo(-42, -88);
    g.bezierCurveTo(-48, -80, -56, -70, -58, -62);
    g.lineTo(-48, -58); g.lineTo(-52, -52); g.lineTo(-46, -48); g.lineTo(-48, -42);
    g.bezierCurveTo(-48, -28, -42, -14, -28, -8);
    g.bezierCurveTo(-14, -2, -2, 4, 4, 12);
    g.closePath(); cut(g);
  }

  function femaleTorso(g) {
    CH.torso(g, { waistY: -470, neckY: -780, chestY: -670, front: -48, back: 44, waistF: -28, waistB: 38, neckF: -4, neckB: 24, pec: 24, lat: 2 });
    // the hips
    g.moveTo(66, -460); g.ellipse(8, -462, 58, 72, 0, 0, TAU); cut(g);
  }

  function femaleArms(g, r, near) {
    const sh = near ? r.shN : r.shF, tgt = near ? r.hand : r.farHand;
    const el = ik(sh, tgt, UP, FO, near ? -1 : 1);
    limb(g, [sh, el, tgt], near ? [42, 30, 22] : [40, 28, 21]);
    hand(g, tgt, near ? r.nearA : r.farA, 30, near ? r.nearKind : r.farKind);
  }

  function femaleSkirt(g, r) {
    if (r.sitting) {
      CH.lowerCloth(g, r, { waistY: -140, waistF: -36, waistB: 50 });
      return;
    }
    CH.lowerCloth(g, r, { waistY: -470, waistF: -36, waistB: 52, len: 'ankle', flare: 1.3, pleats: true, T: r.T, wind: r.wind });
  }

  CH.female = { rig: femaleRig, face, torso: femaleTorso, arms: femaleArms, skirt: femaleSkirt, D, PIV };

  // ─── the queen ─────────────────────────────────────────────────────────────
  const rig = (P) => femaleRig(P, { wearing: P.po.earrings !== false && !(P.po.name === 'give' && P.po.k > 0.15) });

  function headPath(g, r) {
    g.save(); g.translate(6, -788); g.rotate(r.look);
    face(g);
    // hair: the back of the head, a high crown-bun with a jasmine ring, the chudamani
    g.moveTo(44, -60); g.bezierCurveTo(58, -90, 54, -130, 20, -142); g.lineTo(0, -138); g.bezierCurveTo(30, -120, 40, -90, 30, -50); g.closePath(); cut(g);
    g.moveTo(58, -160); g.ellipse(24, -162, 36, 30, -0.3, 0, TAU); cut(g);
    for (let i = 0; i < 9; i++) { const t = (i / 9) * TAU; g.moveTo(24 + Math.cos(t) * 40 + 8, -162 + Math.sin(t) * 34); g.arc(24 + Math.cos(t) * 40, -162 + Math.sin(t) * 34, 8, 0, TAU); cut(g); }
    g.moveTo(10, -196); g.lineTo(24, -232); g.lineTo(38, -196); g.closePath(); cut(g);
    // forehead pendant on its chain (maang-tikka)
    g.moveTo(-36, -112); g.ellipse(-40, -112, 6, 8, 0, 0, TAU); cut(g);
    if (r.speak > 0.02) {
      g.save(); g.globalCompositeOperation = 'destination-out';
      const o = 3.5 * r.speak;
      g.moveTo(-28, -32); g.lineTo(-50, -34 - o); g.lineTo(-50, -28 + o * 0.6); g.closePath(); cut(g);
      g.restore();
    }
    g.restore();
  }

  function palluPath(g, r) {
    // across the chest from the far hip to the near shoulder, then streaming behind
    g.moveTo(40, -470); g.lineTo(-30, -560); g.bezierCurveTo(-40, -640, -30, -720, 10, -770);
    g.lineTo(40, -760); g.bezierCurveTo(20, -700, 30, -600, 60, -520); g.closePath(); cut(g);
    const pts = ribbon([34, -756], 1.35 - 0.25 * r.wind, 360, r.T, 12 * r.wind, 0.7, 14, 60);
    limbOutline(g, pts, pts.map((_, i) => lerp(70, 34, i / (pts.length - 1)))); cut(g);
  }

  function shape(g, color, P, r) {
    g.translate(0, r.bob);
    g.fillStyle = color;
    g.save(); g.translate(0, r.drop);
    g.beginPath(); femaleArms(g, r, false); g.fill();
    g.restore();
    g.beginPath(); CH.legs(g, r, [62, 40, 20]); g.fill();
    g.beginPath(); femaleSkirt(g, r); g.fill();
    g.save(); g.translate(0, r.drop);
    g.save(); g.translate(0, PIV); g.rotate(-r.lean); g.translate(0, -PIV);
    g.beginPath(); femaleTorso(g); g.fill();
    g.beginPath(); palluPath(g, r); g.fill();
    g.beginPath(); headPath(g, r); g.fill();
    g.restore();
    g.beginPath(); femaleArms(g, r, true); g.fill();
    g.restore();
  }

  function ornaments(g, P, r, a, color) {
    if (a <= 0.01) return;
    g.translate(0, r.bob);
    g.globalAlpha *= a;
    g.strokeStyle = color; g.fillStyle = color; g.lineCap = 'round';
    if (!r.sitting) {
      const hemY = Math.max(r.legs[0].ankle[1], r.legs[1].ankle[1]) - 34;
      const xs = r.legs.map((l) => l.ankle[0]);
      for (const [off, w] of [[0, 7], [-14, 2.5], [-24, 2.5]]) { g.beginPath(); g.moveTo(Math.min(...xs) - 44, hemY + off); g.quadraticCurveTo(lerp(xs[0], xs[1], 0.5), hemY + 16 + off, Math.max(...xs) + 52, hemY - 4 + off); g.lineWidth = w; g.stroke(); }
    }
    g.save(); g.translate(0, r.drop);
    g.save(); g.translate(0, PIV); g.rotate(-r.lean); g.translate(0, -PIV);
    // girdle, necklaces, the pallu's border
    g.beginPath(); g.moveTo(-34, -478); g.quadraticCurveTo(10, -462, 54, -482); g.lineWidth = 7; g.stroke();
    CH.beads(g, [-4, -774], [-50, -726], [-34, -690], 8, 4);
    CH.beads(g, [-4, -772], [-62, -680], [-44, -626], 11, 3.6);
    g.beginPath(); g.moveTo(-28, -560); g.bezierCurveTo(-38, -640, -28, -720, 12, -768); g.lineWidth = 5; g.stroke();
    g.save(); g.translate(6, -788); g.rotate(r.look);
    // chudamani jewel, bun ring, the eye
    g.beginPath(); g.arc(24, -214, 6, 0, TAU); g.fill();
    g.beginPath(); g.ellipse(24, -162, 36, 30, -0.3, 0, TAU); g.lineWidth = 3; g.stroke();
    g.beginPath(); g.ellipse(-30, -84, 7, 2.8, 0.1, 0, TAU); g.fill();
    g.beginPath(); g.moveTo(-36, -130); g.quadraticCurveTo(-30, -120, -40, -112); g.lineWidth = 2; g.stroke();
    g.restore();
    g.restore();
    // bangles on both wrists
    for (const [hh, sh] of [[r.hand, r.shN], [r.farHand, r.shF]]) {
      const el = ik(sh, hh, UP, FO, hh === r.hand ? -1 : 1);
      for (const u of [0.72, 0.8, 0.88]) {
        const p = [lerp(el[0], hh[0], u), lerp(el[1], hh[1], u)], dx = hh[0] - el[0], dy = hh[1] - el[1], l = Math.hypot(dx, dy) || 1;
        g.beginPath(); g.moveTo(p[0] - dy / l * 15, p[1] + dx / l * 15); g.lineTo(p[0] + dy / l * 15, p[1] - dx / l * 15); g.lineWidth = 3.5; g.stroke();
      }
    }
    g.restore();
  }

  function earPt(P, r) {
    const sx = P.flip ? -P.s : P.s;
    const c = Math.cos(r.look), s = Math.sin(r.look), lx = 14, ly = -40;
    const p = r.rot([6 + lx * c - ly * s, -788 + lx * s + ly * c]);
    return [P.x + p[0] * sx, P.y + (p[1] + r.bob + r.drop) * P.s];
  }
  function after(ctx, P, r, k) {
    if (!r.wearing) return;
    const e = earPt(P, r);
    KIT.kundala.draw(ctx, e[0], e[1] + 4 * P.s, 40 * P.s, P.T, { glow: 0.5 + 0.4 * k, a: 1 });
  }

  const bible = {
    name: 'King Paushya\'s queen',
    role: 'Gives Uttanka her earrings for his teacher\'s wife, and warns him: "Takshaka, the serpent king, wants these" (Adi Parva 3).',
    palette: { fill: '#120a08', inner: '#5a2a14', rimDim: '#d89a48', rimBright: '#fff0c0', ornamentDim: '#d8a848', ornament: '#fff4b0', ruby: '#c0182a' },
    proportions: '≈ 1000 units to the top of the bun (≈ 970 body): hip 480, thigh 240, shin 226; narrow waist, full hips; seated hip 140.',
    props: ['the KUNDALA earrings (KIT.kundala: gold ring, ruby boss, three pearl drops, a travelling glint) until she gives them (pose.earrings: false)', 'high crown-bun ringed with jasmine, chudamani jewel', 'forehead pendant', 'layered necklaces', 'stacked bangles', 'jewelled girdle', 'ankle-length pleated sari, the pallu over the near shoulder streaming behind'],
    light: 'Palace lamp-gold with rose: fill #120a08, inner #5a2a14, rim #d89a48 → #fff0c0; ornaments #d8a848 → #fff4b0 at 0.55–1.0. The earrings carry their own glint.',
    poses: [
      { name: 'stand', note: 'hands folded at the waist' }, { name: 'walk' }, { name: 'sit' }, { name: 'speak', note: 'k' },
      { name: 'give', note: 'k: both hands forward, cupped (the earrings leave her ears)' }, { name: 'warn', note: 'k: a raised forefinger' }, { name: 'bless', note: 'k' },
    ],
    voice: 'queen',
  };

  const mod = CH.define({
    id: 'queen', bible, rig, shape, ornaments, after, defaultPose: 'stand',
    rule: {
      fill: '#120a08', lit: '#3a2014', litGain: 0.85,
      rim: ['#d89a48', '#fff0c0'], inner: '#5a2a14', innerA: [0.85, 0.42], glow: 0.85,
      ornament: ['#d8a848', '#fff4b0'], ornamentA: [0.55, 1.0],
    },
    bounds: () => [-460, -1100, 520, 30],
  });
  /** Screen position: 'hands' (between the two hands), 'ear', 'head'. */
  mod.anchor = (opts, name) => {
    const P = CH.resolve(opts, mod._def), r = rig(P), sx = P.flip ? -P.s : P.s;
    if (name === 'ear') return earPt(P, r);
    const p = name === 'head' ? r.rot([0, -860]) : [lerp(r.hand[0], r.farHand[0], 0.5), lerp(r.hand[1], r.farHand[1], 0.5) - 30];
    return [P.x + p[0] * sx, P.y + (p[1] + r.bob + r.drop) * P.s];
  };
  CH.ROSTER.push('queen');
  void clamp;
})();
