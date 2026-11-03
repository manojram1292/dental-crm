/*
 * CHARACTER · SHRINGIN, son of the sage Shamika · `shringin`
 *
 * Episode 7 (CE 1.36–38): a young ascetic of fierce energy ("fiery, quick to
 * anger"). Taunted by a friend that his father wears a dead snake, he touches water
 * and curses the king: within seven nights Takshaka, urged by his words, will burn
 * him with his venom. His father rebukes him.
 *
 * Young and taut, beardless: his matted hair bound in TWO HORN-LIKE KNOTS at the
 * crown (his name means "the horned one"), a lock falling at the nape; the sacred
 * thread, a rudraksha at the throat, a knee-length BARK loincloth tied with a grass
 * cord, bare feet; a clay KAMANDALU water pot always in the FAR hand (he curses
 * with water from it; the near hand acts). Quick, forward-leaning stance.
 *
 * SIGNATURE LIGHT: molten vermilion, an ascetic's tapas burning: fill #100604,
 * inner #5a1408, rim #e0481c → #ffd27a (rim ×1.05, glow 0.95), ornaments #c87a2a →
 * #ffe0a0 (0.4–0.8). Mood 'wrath': the rim runs hotter, an ember in the eye and a
 * heat-haze glow behind his head. Hotter and yellower than Uttanka's coral, never
 * Parashurama's blood-red.
 *
 * Faces LEFT natively. Feet on (x, y). scale 1 ≈ 1000 px (to the horn-knots).
 * Anchors: mod.anchor(opts, 'hand' | 'pot' | 'head' | 'eye').
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, CH = KIT.characters;
  const { TAU, clamp, lerp } = R;
  const { cut, limb, ik, hand, along } = CH;

  const D = { hip: 480, thigh: 242, shin: 228, foot: 70, sitHip: 145 };
  const PIV = -480, UP = 164, FO = 150;

  function rig(P) {
    const raw = P.po, k = raw.k;
    const run = raw.name === 'run';
    const po = run ? { ...raw, name: 'walk', stride: 1.4 } : raw;
    const r = CH.profileRig(po, D);
    r.T = P.T; r.wind = raw.wind ?? (run ? 1 : 0.6);
    r.lean = 0.04 + r.st * 0.05 + (run ? 0.14 : 0);
    r.look = P.ex.look || 0; r.speak = P.ex.speak || 0; r.wrath = P.ex.mood === 'wrath';
    // far hand: the kamandalu at his side; near hand: acts
    let fh = r.sitting ? [-60, -470] : [50, -520], pot = 0;
    let nh = r.sitting ? [-130, -490] : [-20, -540], nk = r.sitting ? 'cup' : 'fist', na = Math.PI / 2;
    if (raw.name === 'walk' || run) { nh = [-20 + 50 * Math.sin(raw.phase || 0), -560]; fh = [40 + 40 * Math.sin((raw.phase || 0) + Math.PI), -540]; }
    if (raw.name === 'speak') { nh = along(nh, [-260, -740], k); nk = 'open'; na = Math.PI + 0.4; }
    if (raw.name === 'point') { nh = along(nh, [-330, -820], k); nk = 'point'; na = Math.PI + 0.2; }
    if (raw.name === 'scoop') {
      // water poured from the pot into the cupped near hand
      r.lean += 0.12 * k; r.look += 0.25 * k;
      fh = along(fh, [-200, -760], k); pot = 0.9 * k;
      nh = along(nh, [-235, -615], k); nk = 'cup'; na = 0;
    }
    if (raw.name === 'curse') {
      // the cupped hand flung up and forward, scattering the water: the curse
      const fling = clamp(k);
      r.lean += 0.16 * fling;
      nh = along([-235, -615], [-300, -980], fling); nk = fling > 0.6 ? 'abhaya' : 'cup'; na = lerp(0, -Math.PI / 2 - 0.4, fling);
      fh = along([-200, -760], [60, -560], fling); pot = 0.9 * (1 - fling);
      r.look -= 0.15 * fling;
    }
    r.hand = nh; r.nearKind = nk; r.nearA = na; r.farHand = fh; r.potA = pot;
    const c = Math.cos(-r.lean), s = Math.sin(-r.lean);
    r.rot = (p) => [p[0] * c - (p[1] - PIV) * s, p[0] * s + (p[1] - PIV) * c + PIV];
    r.shN = r.rot([4, -764]); r.shF = r.rot([28, -768]);
    return r;
  }

  function headPath(g, r) {
    g.save();
    g.translate(6, -800);
    g.rotate(r.look);
    // a young, beardless face, a strong brow
    g.moveTo(30, 8);
    g.bezierCurveTo(40, -24, 50, -62, 46, -96);
    g.bezierCurveTo(42, -130, 18, -144, -10, -144);
    g.bezierCurveTo(-38, -142, -52, -124, -52, -104);
    g.lineTo(-48, -94);
    g.bezierCurveTo(-54, -84, -62, -74, -66, -64);
    g.lineTo(-55, -60); g.lineTo(-60, -54); g.lineTo(-54, -50); g.lineTo(-55, -42);
    g.bezierCurveTo(-56, -28, -50, -14, -34, -6);
    g.bezierCurveTo(-18, 0, -4, 6, 4, 14);
    g.closePath(); cut(g);
    // matted hair: a cap of locks, a lock falling at the nape
    g.moveTo(-50, -112); g.bezierCurveTo(-46, -160, 40, -168, 54, -110); g.bezierCurveTo(70, -60, 66, -10, 58, 30); g.bezierCurveTo(46, -10, 40, -60, 30, -90); g.closePath(); cut(g);
    // two horn-like knots at the crown, swept back
    const fl = Math.sin(r.T * 2.8) * 3 * r.wind;
    for (const [bx, lean, h] of [[-18, -0.35, 74], [22, 0.25, 84]]) {
      const tip = [bx + Math.sin(lean) * h + fl, -150 - Math.cos(lean) * h];
      g.moveTo(bx - 16, -144); g.quadraticCurveTo(bx - 14, -170, tip[0], tip[1]); g.quadraticCurveTo(bx + 18, -168, bx + 16, -144); g.closePath(); cut(g);
      const kn = [lerp(bx, tip[0], 0.55), lerp(-150, tip[1], 0.55)];
      g.moveTo(kn[0] + 15, kn[1]); g.ellipse(kn[0], kn[1], 15, 13, lean, 0, TAU); cut(g);
      g.moveTo(tip[0] + 9, tip[1]); g.arc(tip[0], tip[1], 9, 0, TAU); cut(g);
    }
    // the ear
    g.moveTo(20, -70); g.ellipse(12, -70, 10, 18, 0.1, 0, TAU); cut(g);
    if (r.speak > 0.02) {
      g.save(); g.globalCompositeOperation = 'destination-out';
      const o = 5 * r.speak;
      g.moveTo(-32, -34); g.lineTo(-57, -36 - o); g.lineTo(-57, -30 + o * 0.6); g.closePath(); cut(g);
      g.restore();
    }
    g.restore();
  }

  function torsoPath(g) {
    CH.torso(g, { waistY: -472, neckY: -794, chestY: -686, front: -48, back: 54, waistF: -32, waistB: 46, neckF: -4, neckB: 28, pec: 8, lat: 6 });
  }

  function loinPath(g, r) {
    if (r.sitting) { CH.lowerCloth(g, r, { waistY: -150, waistF: -36, waistB: 50 }); return; }
    CH.lowerCloth(g, r, { waistY: -480, waistF: -36, waistB: 48, len: 'knee', flare: 1.05, pleats: false, T: r.T, wind: r.wind });
    // the bark cloth's ragged hem
    const hemY = Math.max(r.legs[0].knee[1], r.legs[1].knee[1]) + 30, xs = r.legs.map((l) => l.knee[0]);
    const x0 = Math.min(...xs) - 34, x1 = Math.max(...xs) + 40;
    for (let i = 0; i < 5; i++) { const x = lerp(x0, x1, (i + 0.5) / 5); g.moveTo(x - 12, hemY - 6); g.lineTo(x, hemY + 16 + (i % 2) * 6); g.lineTo(x + 12, hemY - 6); g.closePath(); cut(g); }
  }

  function potPath(g, r) {
    // the kamandalu: a round clay pot with a spout, hanging from the far hand by its handle
    g.save(); g.translate(r.farHand[0], r.farHand[1] + 20); g.rotate(-r.potA);
    g.moveTo(54, 70); g.ellipse(0, 70, 54, 50, 0, 0, TAU); cut(g);
    g.moveTo(-14, 20); g.lineTo(14, 20); g.lineTo(18, 34); g.lineTo(-18, 34); g.closePath(); cut(g);
    g.moveTo(-40, 50); g.lineTo(-86, 26); g.lineTo(-88, 34); g.lineTo(-46, 64); g.closePath(); cut(g);
    g.restore();
  }

  function armsPath(g, r, near) {
    const sh = near ? r.shN : r.shF, tgt = near ? r.hand : r.farHand;
    const el = ik(sh, tgt, UP, FO, near ? -1 : 1);
    limb(g, [sh, el, tgt], near ? [52, 36, 28] : [50, 34, 26]);
    if (near) hand(g, tgt, r.nearA, 36, r.nearKind);
    else hand(g, tgt, Math.PI / 2, 32, 'fist');
  }

  function upperT(g, r) { g.translate(0, PIV); g.rotate(-r.lean); g.translate(0, -PIV); }

  function shape(g, color, P, r) {
    g.translate(0, r.bob);
    g.fillStyle = color;
    g.save(); g.translate(0, r.drop);
    g.beginPath(); armsPath(g, r, false); g.fill();
    g.beginPath(); potPath(g, r); g.fill();
    g.restore();
    g.beginPath(); CH.legs(g, r, [66, 42, 22]); g.fill();
    g.beginPath(); loinPath(g, r); g.fill();
    g.save(); g.translate(0, r.drop);
    g.save(); upperT(g, r);
    g.beginPath(); torsoPath(g); g.fill();
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
    g.beginPath(); g.moveTo(26, -780); g.quadraticCurveTo(-36, -636, -36, -478); g.lineWidth = 2.5; g.stroke();   // sacred thread
    g.beginPath(); g.moveTo(-36, -490); g.quadraticCurveTo(8, -478, 50, -494); g.lineWidth = 3; g.stroke();         // grass cord
    g.save(); g.translate(6, -800); g.rotate(r.look);
    g.beginPath(); g.arc(-8, 6, 6, 0, TAU); g.fill();                                                              // rudraksha at the throat
    g.beginPath(); g.ellipse(-36, -90, 7, 3, 0.1, 0, TAU); g.fill();                                               // the eye
    for (const bx of [-18, 22]) { g.beginPath(); g.moveTo(bx - 14, -156); g.lineTo(bx + 14, -158); g.lineWidth = 3; g.stroke(); }   // knot bindings
    g.restore();
    g.restore();
    // a band round the pot's shoulder
    g.save(); g.translate(r.farHand[0], r.farHand[1] + 20); g.rotate(-r.potA);
    g.beginPath(); g.ellipse(0, 52, 46, 8, 0, 0, Math.PI); g.lineWidth = 3; g.stroke();
    g.restore();
    g.restore();
  }

  function scr(P, r, p) { const sx = P.flip ? -P.s : P.s; return [P.x + p[0] * sx, P.y + (p[1] + r.bob + r.drop) * P.s]; }

  function after(ctx, P, r, k) {
    if (!r.wrath) return;
    const e = scr(P, r, r.rot([6 - 36, -800 - 90]));
    KIT.glow(ctx, e[0], e[1], 46 * P.s, '#ff7a2a', 0.85 * k);
    const h = scr(P, r, r.rot([0, -900]));
    KIT.glow(ctx, h[0], h[1], 420 * P.s, '#ff5a1a', 0.22 * k);
  }

  const bible = {
    name: 'Shringin, son of Shamika',
    role: 'A young ascetic of fierce tapas. He curses Parikshit: within seven days Takshaka will burn him with his venom (CE 1.37).',
    palette: { fill: '#100604', inner: '#5a1408', rimDim: '#e0481c', rimBright: '#ffd27a', ornamentDim: '#c87a2a', ornament: '#ffe0a0' },
    proportions: '≈ 1000 units to the horn-knots: hip 480, thigh 242, shin 228; taut, a youth\'s chest; forward-leaning (0.04 rad). Seated hip 145.',
    props: ['matted hair bound in two horn-like knots (his name: "the horned one")', 'a lock at the nape', 'sacred thread, rudraksha at the throat', 'knee-length bark loincloth, ragged hem, grass cord', 'clay kamandalu, always in the FAR hand'],
    light: 'Molten vermilion (tapas): fill #100604, inner #5a1408, rim #e0481c → #ffd27a; ornaments #c87a2a → #ffe0a0 (0.4–0.8). Wrath: an ember in the eye and a heat-glow behind the head.',
    poses: [
      { name: 'stand' }, { name: 'walk' }, { name: 'run' }, { name: 'sit' }, { name: 'speak', note: 'k' }, { name: 'point', note: 'k' },
      { name: 'scoop', note: 'k: pours water from the pot into the cupped near hand' },
      { name: 'curse', note: 'k: the cupped hand flung up and forward, scattering the water (start it after scoop)' },
    ],
    voice: 'shringin',
  };

  const mod = CH.define({
    id: 'shringin', bible, rig, shape, ornaments, after, defaultPose: 'stand',
    rule: {
      fill: '#100604', lit: '#361208', litGain: 0.8, rimW: 1.05,
      rim: ['#e0481c', '#ffd27a'], inner: '#5a1408', innerA: [0.9, 0.45], glow: 0.95,
      ornament: ['#c87a2a', '#ffe0a0'], ornamentA: [0.4, 0.8],
    },
    bounds: () => [-520, -1220, 440, 30],
  });
  mod.anchor = (opts, name) => {
    const P = CH.resolve(opts, mod._def), r = rig(P);
    if (name === 'pot') return scr(P, r, [r.farHand[0], r.farHand[1] + 90]);
    if (name === 'head') return scr(P, r, r.rot([0, -880]));
    if (name === 'eye') return scr(P, r, r.rot([-30, -890]));
    return scr(P, r, r.hand);
  };
  CH.ROSTER.push('shringin');
})();
