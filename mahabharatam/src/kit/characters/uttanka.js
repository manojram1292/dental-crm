/*
 * CHARACTER · UTTANKA (the student, disciple of the teacher Veda) · `uttanka`
 *
 * Episode 6 (Adi Parva 3, Paushya parva): sent for the earrings of King
 * Paushya's queen as his gift to his teacher's wife; robbed by Takshaka; he
 * follows the serpent king into the Naga world, wins them back, and, still
 * burning with anger, goes to King Janamejaya: "Takshaka killed your father."
 *
 * A young brahmacharin: lean and quick, beardless; a SHAVEN head with a single
 * knotted SHIKHA tuft at the crown; a black antelope skin (krishnajina) over the
 * far shoulder, its hoof-flaps swinging behind; the sacred thread; a triple
 * munja-grass girdle; a short white loincloth. A palasha STAFF with a sprig of
 * three leaves at its top, always in the FAR hand (the near hand acts).
 *
 * SIGNATURE LIGHT: dawn coral. Fill #0e0808, inner #4a1c14, rim #d0704e →
 * #ffd2b4: warmer and rosier than Sauti's gold, so he burns bright in the cold
 * green of the Naga world. Mood 'wrath' adds a red under-glow and an ember in
 * his eye (his anger "burned on").
 *
 * Faces LEFT natively. Feet on (x, y). scale 1 ≈ 1000 px (a little under Sauti).
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, CH = KIT.characters;
  const { TAU, clamp, lerp } = R;
  const { cut, limb, limbOutline, ik, hand, along } = CH;

  const D = { hip: 485, thigh: 244, shin: 230, foot: 70, sitHip: 145 };
  const PIV = -485, UP = 166, FO = 152;

  function rig(P) {
    const raw = P.po, k = raw.k;
    const run = raw.name === 'run';
    const po = run ? { ...raw, name: 'walk', stride: 1.4 } : raw;
    let r;
    if (raw.name === 'crouch') {
      // one knee down: setting something on the ground / washing at a stream
      const s = CH.profileRig({ name: 'stand', k: 1, phase: 0, stride: 0, base: 'stand' }, D);
      const kk = k;
      const hip = [0, lerp(-485, -300, kk)];
      const L0 = s.legs[0], L1 = s.legs[1];
      const mix = (a, b) => [lerp(a[0], b[0], kk), lerp(a[1], b[1], kk)];
      const legs = [
        { hip, knee: mix(L0.knee, [-200, -190]), ankle: mix(L0.ankle, [-170, -24]), toe: mix(L0.toe, [-244, -4]), heel: mix(L0.heel, [-150, 0]), th: 0 },
        { hip, knee: mix(L1.knee, [30, -24]), ankle: mix(L1.ankle, [230, -30]), toe: mix(L1.toe, [292, -6]), heel: mix(L1.heel, [214, -40]), th: 0 },
      ];
      r = { legs, bob: s.bob * (1 - kk), drop: 0, sitting: false, st: 0, ph: 0, lean: 0.42 * kk, crouch: kk, hipY: hip[1] };
    } else r = CH.profileRig(po, D);
    r.T = P.T; r.wind = raw.wind ?? (run ? 1 : 0.55);
    r.lean = (r.lean || 0) + r.st * 0.05 + (run ? 0.14 : 0);
    if (raw.name === 'bow') r.lean += 0.4 * k;
    r.look = P.ex.look || 0; r.speak = P.ex.speak || 0; r.wrath = P.ex.mood === 'wrath';
    // far hand: the staff
    let far = [120, -590];
    if (r.sitting) far = [-120, -470];
    if (raw.name === 'walk' || run) far = [110 + 40 * Math.sin((raw.phase || 0) + Math.PI) - (run ? 60 : 0), -590];
    r.staffA = r.sitting ? -Math.PI / 2 + 0.12 : -Math.PI / 2 - (run ? 0.5 : -0.06);
    // near hand: the actor
    let nh = [-14, -545], nk = 'open', na = Math.PI / 2 + 0.2;
    if (r.sitting) { nh = [-120, -500]; nk = 'cup'; na = 0; }
    if (raw.name === 'walk') nh = [-10 + 46 * Math.sin(raw.phase || 0), -560];
    if (run) { nh = [-140 + 70 * Math.sin(raw.phase || 0), -680]; nk = 'fist'; }
    if (raw.name === 'speak') { nh = along(nh, [-250, -730], k); nk = 'open'; na = Math.PI + 0.45; }
    if (raw.name === 'point') { nh = along(nh, [-320, -810], k); nk = 'point'; na = Math.PI + 0.22; }
    if (raw.name === 'hold') { nh = along(nh, [-190, -660], k); nk = 'cup'; na = 0; }
    if (raw.name === 'raise') { nh = along(nh, [-90, -1180], k); nk = 'cup'; na = -Math.PI / 2; }
    if (raw.name === 'bow') { nh = along(nh, [-130, -640], k); nk = 'abhaya'; na = -Math.PI / 2 - 0.3; }
    if (raw.name === 'crouch') { nh = along(nh, [-330, -90], k); nk = 'cup'; na = Math.PI / 2; far = along(far, [60, -420], k); r.staffA = -Math.PI / 2 - 0.35 * k; }
    r.hand = nh; r.nearKind = nk; r.nearA = na; r.farHand = far;
    const pv = r.crouch ? r.hipY : PIV;
    const c = Math.cos(-r.lean), s = Math.sin(-r.lean);
    const yo = r.crouch ? r.hipY - PIV : 0;   // the upper body rides down with the hip
    const rot = (p) => [p[0] * c - (p[1] + yo - pv) * s, p[0] * s + (p[1] + yo - pv) * c + pv];
    r.rot = rot; r.yo = yo; r.pv = pv;
    r.shN = rot([4, -770]); r.shF = rot([28, -774]);
    // hands given in body space follow the lean when the pose is the body's own (bow/crouch)
    if (raw.name === 'bow' || run) { r.hand = rot([r.hand[0], r.hand[1] - yo]); r.farHand = rot([r.farHand[0], r.farHand[1] - yo]); }
    return r;
  }

  function upperT(g, r) { g.translate(0, r.pv); g.rotate(-r.lean); g.translate(0, -r.pv + r.yo); }

  function headPath(g, r) {
    g.save();
    g.translate(6, -806);
    g.rotate(r.look);
    // a young, beardless face; the shaven skull a smooth dome
    g.moveTo(30, 8);
    g.bezierCurveTo(40, -24, 50, -62, 46, -96);
    g.bezierCurveTo(42, -132, 14, -146, -14, -144);
    g.bezierCurveTo(-40, -142, -50, -122, -50, -104);
    g.lineTo(-48, -92);
    g.bezierCurveTo(-54, -84, -62, -74, -66, -64);
    g.lineTo(-55, -60); g.lineTo(-60, -54); g.lineTo(-54, -50); g.lineTo(-55, -42);
    g.bezierCurveTo(-56, -28, -50, -14, -34, -6);
    g.bezierCurveTo(-18, 0, -4, 6, 4, 14);
    g.closePath(); cut(g);
    // the ear
    g.moveTo(22, -70); g.ellipse(14, -70, 10, 18, 0.1, 0, TAU); cut(g);
    // the shikha: a tuft at the crown, knotted, its end flicking back
    const fl = Math.sin(r.T * 3.3) * 6 * r.wind;
    g.moveTo(20, -140); g.quadraticCurveTo(26, -176, 12, -186); g.quadraticCurveTo(40, -190, 58 + fl, -164 + fl * 0.3); g.quadraticCurveTo(42, -168, 34, -140); g.closePath(); cut(g);
    g.moveTo(26, -170); g.arc(18, -172, 9, 0, TAU); cut(g);
    if (r.speak > 0.02) {
      g.save(); g.globalCompositeOperation = 'destination-out';
      const o = 4.5 * r.speak;
      g.moveTo(-32, -34); g.lineTo(-57, -36 - o); g.lineTo(-57, -30 + o * 0.6); g.closePath(); cut(g);
      g.restore();
    }
    g.restore();
  }

  function torsoPath(g) {
    // lean, a youth's chest
    CH.torso(g, { waistY: -480, neckY: -800, chestY: -690, front: -46, back: 54, waistF: -32, waistB: 46, neckF: -4, neckB: 28, pec: 6, lat: 6 });
  }

  function skinPath(g, r) {
    // the black antelope skin over the far shoulder, hanging down the back, hoof-flaps swinging
    const sw = Math.sin(r.T * 2.6) * 8 * r.wind + r.st * 14;
    g.moveTo(-20, -790);
    g.bezierCurveTo(30, -812, 70, -800, 80, -760);
    g.bezierCurveTo(96, -690, 104, -600, 112 + sw, -520);
    g.lineTo(60 + sw * 0.6, -506);
    g.bezierCurveTo(56, -600, 40, -700, -26, -760);
    g.closePath(); cut(g);
    for (const [x, y] of [[112, -520], [76, -508]]) { g.moveTo(x + sw, y); g.lineTo(x + sw + 10, y + 46); g.lineTo(x + sw - 8, y + 44); g.closePath(); cut(g); }
  }

  function loinPath(g, r) {
    if (r.sitting) { CH.lowerCloth(g, r, { waistY: -150, waistF: -36, waistB: 50 }); return; }
    if (r.crouch) {
      g.moveTo(-36, -490 + r.yo); g.lineTo(52, -496 + r.yo); g.lineTo(80, -330 + r.yo * 0.6); g.lineTo(-120 * r.crouch - 20, -300 + r.yo * 0.4); g.closePath(); cut(g);
      return;
    }
    CH.lowerCloth(g, r, { waistY: -485, waistF: -36, waistB: 50, len: 'short', flare: 1.05, pleats: false, T: r.T, wind: r.wind });
  }

  function staffPath(g, r) {
    const d = [Math.cos(r.staffA), Math.sin(r.staffA)];
    const top = [r.farHand[0] + d[0] * 340, r.farHand[1] + d[1] * 340];
    const bot = [r.farHand[0] - d[0] * 560, r.farHand[1] - d[1] * 560];
    limb(g, [bot, top], [12, 10]);
    // a sprig of three palasha leaves at the top
    for (const [a, l] of [[-0.9, 48], [0, 56], [0.9, 48]]) {
      const ang = r.staffA + a, tip = [top[0] + Math.cos(ang) * l, top[1] + Math.sin(ang) * l];
      const nx = -Math.sin(ang) * 14, ny = Math.cos(ang) * 14, m = [lerp(top[0], tip[0], 0.5), lerp(top[1], tip[1], 0.5)];
      g.moveTo(top[0], top[1]); g.quadraticCurveTo(m[0] + nx, m[1] + ny, tip[0], tip[1]); g.quadraticCurveTo(m[0] - nx, m[1] - ny, top[0], top[1]); g.closePath(); cut(g);
    }
  }

  function armsPath(g, r, near) {
    const sh = near ? r.shN : r.shF, tgt = near ? r.hand : r.farHand;
    const el = ik(sh, tgt, UP, FO, near ? -1 : 1);
    limb(g, [sh, el, tgt], near ? [52, 36, 28] : [50, 34, 26]);
    if (near) hand(g, tgt, r.nearA, 36, r.nearKind);
    else hand(g, tgt, Math.PI / 2, 34, 'fist');
  }

  function shape(g, color, P, r) {
    g.translate(0, r.bob);
    g.fillStyle = color;
    g.save(); g.translate(0, r.drop);
    g.beginPath(); staffPath(g, r); g.fill();
    g.beginPath(); armsPath(g, r, false); g.fill();
    g.restore();
    g.beginPath(); CH.legs(g, r, [66, 42, 22]); g.fill();
    g.beginPath(); loinPath(g, r); g.fill();
    g.save(); g.translate(0, r.drop);
    g.save(); upperT(g, r);
    g.beginPath(); torsoPath(g); g.fill();
    g.beginPath(); skinPath(g, r); g.fill();
    g.beginPath(); headPath(g, r); g.fill();
    g.restore();
    g.beginPath(); armsPath(g, r, true); g.fill();
    g.restore();
  }

  function ornaments(g, P, r, a, color) {
    if (a <= 0.01) return;
    g.translate(0, r.bob);
    g.globalAlpha *= a;
    g.strokeStyle = color; g.fillStyle = color; g.lineCap = 'round';
    g.save(); g.translate(0, r.drop);
    g.save(); upperT(g, r);
    // sacred thread across the chest; the triple munja girdle
    g.beginPath(); g.moveTo(26, -786); g.quadraticCurveTo(-36, -640, -36, -488); g.lineWidth = 2.5; g.stroke();
    for (const off of [0, 7, 14]) { g.beginPath(); g.moveTo(-34, -500 + off); g.quadraticCurveTo(8, -490 + off, 50, -506 + off); g.lineWidth = 2.2; g.stroke(); }
    // pale spots on the antelope skin
    for (const [x, y] of [[60, -720], [78, -640], [92, -580]]) { g.beginPath(); g.arc(x, y, 5, 0, TAU); g.fill(); }
    // the eye
    g.save(); g.translate(6, -806); g.rotate(r.look);
    g.beginPath(); g.ellipse(-36, -88, 7, 3, 0.1, 0, TAU); g.fill();
    g.restore();
    g.restore();
    // a band on the staff below the sprig
    const d = [Math.cos(r.staffA), Math.sin(r.staffA)], p = [r.farHand[0] + d[0] * 300, r.farHand[1] + d[1] * 300];
    g.beginPath(); g.moveTo(p[0] - d[1] * 10, p[1] + d[0] * 10); g.lineTo(p[0] + d[1] * 10, p[1] - d[0] * 10); g.lineWidth = 4; g.stroke();
    g.restore();
    if (!r.sitting && !r.crouch) {
      // the loincloth's white edge
      const hemY = Math.max(r.legs[0].knee[1], r.legs[1].knee[1]) - 64;
      const xs = r.legs.map((l) => l.knee[0]);
      g.beginPath(); g.moveTo(Math.min(...xs) - 26, hemY); g.quadraticCurveTo(lerp(xs[0], xs[1], 0.5), hemY + 12, Math.max(...xs) + 34, hemY - 4); g.lineWidth = 4; g.stroke();
    }
  }

  /** Local point of a hand → screen. */
  function toScreen(P, r, p) { const sx = P.flip ? -P.s : P.s; return [P.x + p[0] * sx, P.y + (p[1] + r.bob + r.drop) * P.s]; }

  function after(ctx, P, r, k) {
    if (!r.wrath) return;
    // anger: a red under-glow and an ember in the eye
    const sx = P.flip ? -P.s : P.s;
    const e = r.rot([6 - 36, -806 - 88]);
    KIT.glow(ctx, P.x + e[0] * sx, P.y + (e[1] + r.bob + r.drop) * P.s, 46 * P.s, '#ff5a2a', 0.8 * k);
    KIT.glow(ctx, P.x, P.y - 600 * P.s, 700 * P.s, '#ff3a1a', 0.16 * k);
  }

  const bible = {
    name: 'Uttanka (the student)',
    role: 'Disciple of the teacher Veda; fetches the earrings of King Paushya\'s queen for his teacher\'s wife, follows Takshaka into the Naga world, and urges Janamejaya to avenge his father (Adi Parva 3).',
    palette: { fill: '#0e0808', inner: '#4a1c14', rimDim: '#d0704e', rimBright: '#ffd2b4', ornamentDim: '#a8783a', ornament: '#f0d090', wrath: '#ff5a2a' },
    proportions: '≈ 1000 units standing (a little under Sauti), lean: hip 485, thigh 244, shin 230; a youth\'s narrow chest; seated hip 145.',
    props: ['shaven head with a knotted shikha tuft', 'black antelope skin (krishnajina) over the far shoulder, hoof-flaps', 'sacred thread', 'triple munja-grass girdle', 'short loincloth with a white edge', 'palasha staff with a three-leaf sprig, always in the FAR hand'],
    light: 'Dawn coral: fill #0e0808, inner #4a1c14, rim #d0704e → #ffd2b4 (rosier than Sauti\'s gold; it burns against the Naga world\'s green). Mood wrath: a red under-glow and an ember in the eye.',
    poses: [
      { name: 'stand' }, { name: 'walk' }, { name: 'run', note: 'phase: the chase' }, { name: 'sit' }, { name: 'bow', note: 'k: to his teacher\'s wife' },
      { name: 'speak', note: 'k: near hand opens' }, { name: 'point', note: 'k: accuses' }, { name: 'hold', note: 'k: cupped hand forward (the earrings)' },
      { name: 'raise', note: 'k: the earrings held high' }, { name: 'crouch', note: 'k: one knee down, near hand to the ground' },
    ],
    voice: 'uttanka',
  };

  const mod = CH.define({
    id: 'uttanka', bible, rig, shape, ornaments, after, defaultPose: 'stand',
    rule: {
      fill: '#0e0808', lit: '#2e1410', litGain: 0.8,
      rim: ['#d0704e', '#ffd2b4'], inner: '#4a1c14', innerA: [0.85, 0.4], glow: 0.8,
      ornament: ['#a8783a', '#f0d090'], ornamentA: [0.4, 0.75],
    },
    bounds: () => [-560, -1360, 460, 30],
  });
  /** Screen position of 'hand' (near hand) or 'head'. */
  mod.anchor = (opts, name) => {
    const P = CH.resolve(opts, mod._def), r = rig(P);
    if (name === 'head') return toScreen(P, r, r.rot([0, -880 - r.yo]));
    return toScreen(P, r, r.hand);
  };
  CH.ROSTER.push('uttanka');
  void clamp; void limbOutline;
})();
