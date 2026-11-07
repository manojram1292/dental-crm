/*
 * CHARACTER · THE ELDER SAGE (Shaunaka, kulapati of the Naimisha forest).
 *
 * The head of the twelve-year sacrifice and the one who asks Sauti for the
 * story. Old and slightly stooped; a very long flowing beard to the waist and
 * a drooping moustache; a high domed jata bound with a rudraksha band; a
 * deer-skin (krishnajina) over his shoulders with two hanging hoof-flaps; an
 * ankle-length veshti; a CROOK-TOPPED STAFF in the near hand and a japa mala in
 * the far hand.
 *
 * SIGNATURE LIGHT: ivory. Where Sauti's rim is gold, the elder's is the pale
 * ivory of ash and white hair: rim #c9a27a → #fff0d0, ornaments ivory
 * (#9a8f7d → #f1e6c8), never gold. Fill #100a08 with an umber inner glow.
 *
 * Faces LEFT natively. Feet on (x, y). scale 1 ≈ 1000 px tall (he stoops).
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, CH = KIT.characters;
  const { TAU, clamp, lerp } = R;
  const { cut, limb, limbOutline, ik, hand } = CH;

  const D = { hip: 470, thigh: 236, shin: 224, foot: 70, sitHip: 140 };
  const SH_N = [4, -748], SH_F = [28, -752], UP = 160, FO = 150;

  function rig(P) {
    const po = P.po, T = P.T;
    const stride = po.name === 'walk' ? (po.stride ?? 1) * 0.65 : po.stride;
    const r = CH.profileRig({ ...po, stride }, D);
    const k = po.k;
    r.T = T;
    r.lean = 0.07 + r.st * 0.04 + (po.name === 'speak' ? 0.16 * k : 0) + (po.name === 'bow' ? 0.3 * k : 0);
    r.look = 0.1 + (P.ex.look || 0) + (po.name === 'speak' ? -0.16 * k : 0);
    r.speak = P.ex.speak || 0;
    r.wind = po.wind ?? 0.5;
    // staff (crook): planted ahead; in upper-body space (the upper body is shifted down by drop)
    const sw = r.st * Math.sin(r.ph) * 24;
    r.staffB = r.sitting ? [-190, -r.drop] : [-175 + sw, -r.bob];
    r.staffT = [r.staffB[0] + 40, r.staffB[1] - 1060];
    const hy = r.sitting ? -690 : -630;
    const u = (hy - r.staffB[1]) / (r.staffT[1] - r.staffB[1]);
    r.hand = [lerp(r.staffB[0], r.staffT[0], u) + 9, hy];
    // far hand: the japa mala at rest; opens toward the listener when he asks
    r.farKind = 'fist'; r.farA = Math.PI / 2;
    r.farHand = r.sitting ? [-60, -480] : [30, -505];
    if (po.name === 'speak') { r.farKind = 'open'; r.farHand = [lerp(r.farHand[0], -230, k), lerp(r.farHand[1], -690, k) + Math.sin(T * 3) * 8 * k]; r.farA = Math.PI + lerp(1.0, 0.25, k); }
    if (po.name === 'bless') { r.farKind = 'abhaya'; r.farHand = [lerp(30, -160, k), lerp(-505, -840, k)]; r.farA = -Math.PI / 2 - 0.1; }
    // shoulders ride on the stooped torso (rotated about the hip)
    const c = Math.cos(-r.lean), s = Math.sin(-r.lean);
    const rot = (p) => [p[0] * c - (p[1] + 470) * s, p[0] * s + (p[1] + 470) * c - 470];
    r.shN = rot(SH_N); r.shF = rot(SH_F);
    return r;
  }

  function headPath(g, r) {
    g.save();
    g.translate(6, -792);
    g.rotate(r.look);
    // skull + face: high brow, strong nose, sunken cheek
    g.moveTo(30, 6);
    g.bezierCurveTo(40, -30, 50, -70, 46, -102);
    g.bezierCurveTo(42, -136, 18, -152, -12, -150);
    g.bezierCurveTo(-38, -148, -50, -132, -52, -110);
    g.lineTo(-56, -98);
    g.lineTo(-50, -90);
    g.bezierCurveTo(-58, -82, -70, -72, -78, -60);      // the nose
    g.lineTo(-62, -58);
    g.lineTo(-62, -50);
    // drooping moustache, then the long beard flowing to the waist
    g.bezierCurveTo(-84, -46, -98, -34, -104, -10);    // moustache droops over the beard
    g.lineTo(-92, -8);
    g.bezierCurveTo(-112, 40, -136, 110, -134, 180);    // the beard juts forward and falls in waves
    g.bezierCurveTo(-132, 220, -126, 250, -120, 290);
    g.lineTo(-110, 262); g.lineTo(-100, 296);
    g.bezierCurveTo(-90, 240, -88, 180, -80, 120);
    g.bezierCurveTo(-70, 60, -40, 30, -2, 12);
    g.closePath(); cut(g);
    // domed jata, its knot, and long locks down the back
    g.moveTo(52, -168);
    g.ellipse(10, -170, 42, 46, -0.15, 0, TAU); cut(g);
    g.moveTo(22, -226);
    g.ellipse(8, -226, 15, 12, 0, 0, TAU); cut(g);
    g.moveTo(42, -110);
    g.bezierCurveTo(70, -70, 74, -10, 66, 50);
    g.lineTo(48, 44);
    g.bezierCurveTo(50, -10, 46, -60, 32, -100);
    g.closePath(); cut(g);
    if (r.speak > 0.02) {
      g.save(); g.globalCompositeOperation = 'destination-out';
      const o = 5 * r.speak;
      g.moveTo(-40, -36); g.lineTo(-80, -36 - o); g.lineTo(-80, -28 + o * 0.6); g.closePath(); cut(g);
      g.restore();
    }
    g.restore();
  }

  function torsoPath(g) {
    CH.torso(g, { waistY: -455, neckY: -790, chestY: -660, front: -44, back: 56, waistF: -34, waistB: 52, neckF: -6, neckB: 30, pec: 4, lat: 16 });
  }

  function deerskinPath(g, r) {
    // krishnajina over the shoulders, hanging down the back, two hoof-flaps
    const sway = Math.sin(r.T * 1.7) * 5 * r.wind;
    g.moveTo(-34, -770);
    g.bezierCurveTo(0, -800, 60, -796, 78, -748);
    g.bezierCurveTo(92, -690, 92, -600, 96 + sway, -540);
    g.lineTo(80 + sway, -500); g.lineTo(72 + sway, -548);   // hoof-flap
    g.lineTo(54, -530); g.lineTo(46, -486); g.lineTo(36, -540); // second flap
    g.bezierCurveTo(30, -640, 18, -720, -38, -742);
    g.closePath(); cut(g);
  }

  function staffPath(g, r) {
    limb(g, [r.staffB, along(r.staffB, r.staffT, 0.6), r.staffT], [13, 14, 15]);
    // the crook: curls forward at the top
    const t = r.staffT, pts = [];
    for (let i = 0; i <= 14; i++) { const a = Math.PI * (i / 14) * 1.25; pts.push([t[0] - 44 + Math.cos(a) * 44, t[1] - Math.sin(a) * 44]); }
    limbOutline(g, pts, pts.map(() => 13)); cut(g);
  }
  const along = CH.along;

  function armsPath(g, r, near) {
    if (near) {
      const el = ik(r.shN, r.hand, UP, FO, -1);
      limb(g, [r.shN, el, r.hand], [52, 34, 28]);
      hand(g, r.hand, 0.3, 40, 'fist');
    } else {
      const el = ik(r.shF, r.farHand, UP, FO, r.farKind === 'fist' ? 1 : -1);
      limb(g, [r.shF, el, r.farHand], [48, 32, 26]);
      hand(g, r.farHand, r.farA, 38, r.farKind);
    }
  }

  function upper(g, r, part) {
    g.save(); g.translate(0, r.drop);
    if (part === 'back') { g.beginPath(); armsPath(g, r, false); g.fill(); }
    if (part === 'body') {
      g.save(); g.translate(0, -470); g.rotate(-r.lean); g.translate(0, 470);
      g.beginPath(); torsoPath(g); g.fill();
      g.beginPath(); deerskinPath(g, r); g.fill();
      g.beginPath(); headPath(g, r); g.fill();
      g.restore();
    }
    if (part === 'front') {
      g.beginPath(); staffPath(g, r); g.fill();
      g.beginPath(); armsPath(g, r, true); g.fill();
    }
    g.restore();
  }

  function shape(g, color, P, r) {
    g.translate(0, r.bob);
    g.fillStyle = color;
    upper(g, r, 'back');
    g.beginPath(); CH.legs(g, r, [66, 40, 22]); g.fill();
    g.beginPath(); CH.lowerCloth(g, r, { waistY: -470, waistF: -38, waistB: 54, len: 'ankle', flare: 0.9, pleats: true, T: r.T, wind: r.wind }); g.fill();
    upper(g, r, 'body');
    upper(g, r, 'front');
  }

  function ornaments(g, P, r, a, color) {
    if (a <= 0.01) return;
    g.translate(0, r.bob);
    g.globalAlpha *= a;
    g.strokeStyle = color; g.fillStyle = color; g.lineCap = 'round';
    // hem border of the veshti
    if (!r.sitting) {
      const hemY = Math.max(r.legs[0].ankle[1], r.legs[1].ankle[1]) - 44;
      const xs = r.legs.map((l) => l.ankle[0]);
      g.beginPath(); g.moveTo(Math.min(...xs) - 30, hemY); g.quadraticCurveTo(lerp(xs[0], xs[1], 0.5), hemY + 12, Math.max(...xs) + 38, hemY - 4); g.lineWidth = 5; g.stroke();
    }
    g.save(); g.translate(0, r.drop);
    g.save(); g.translate(0, -470); g.rotate(-r.lean); g.translate(0, 470);
    // waist cord
    g.beginPath(); g.moveTo(-38, -470); g.quadraticCurveTo(10, -458, 56, -476); g.lineWidth = 4; g.stroke();
    // deer-skin spots
    for (const [x, y, s] of [[40, -740, 6], [62, -700, 5], [50, -650, 6], [74, -610, 5], [60, -570, 4], [20, -760, 4]]) { g.beginPath(); g.ellipse(x, y, s, s * 0.7, 0.4, 0, TAU); g.fill(); }
    // jata band (rudraksha) and a kundala
    g.save(); g.translate(6, -792); g.rotate(r.look);
    for (let i = 0; i <= 8; i++) { const ang = Math.PI * (0.95 + i * 0.14); g.beginPath(); g.arc(10 + Math.cos(ang) * 42, -150 + Math.sin(ang) * 10, 4, 0, TAU); g.fill(); }
    g.beginPath(); g.arc(14, -58, 6, 0, TAU); g.lineWidth = 3; g.stroke();
    g.restore();
    g.restore();
    // japa mala hanging from the far hand
    if (r.farKind === 'fist') CH.beads(g, [r.farHand[0] - 6, r.farHand[1] + 12], [r.farHand[0] - 30, r.farHand[1] + 120], [r.farHand[0] + 10, r.farHand[1] + 100], 12, 3.6);
    // staff bands
    for (const u of [0.38, 0.41, 0.88]) {
      const p = along(r.staffB, r.staffT, u);
      g.beginPath(); g.moveTo(p[0] - 9, p[1]); g.lineTo(p[0] + 9, p[1]); g.lineWidth = 3.5; g.stroke();
    }
    g.restore();
  }

  const bible = {
    name: 'The elder sage (Shaunaka, kulapati of Naimisha)',
    role: 'Head of the twelve-year sacrifice in the Naimisha forest; he asks Sauti for the story.',
    palette: { fill: '#100a08', inner: '#3a2416', rimDim: '#c9a27a', rimBright: '#fff0d0', ornamentDim: '#9a8f7d', ornament: '#f1e6c8' },
    proportions: 'Standing height ≈ 1000 units, stooped 0.1 rad forward from the hip; hip 470, thigh 236, shin 224; beard 270 long (to the waist); jata dome 92 tall.',
    props: ['crook-topped staff (near hand)', 'japa mala (far hand)', 'krishnajina deer-skin with hoof-flaps', 'rudraksha band round the jata', 'ankle-length veshti'],
    light: 'Ivory: fill #100a08, umber inner #3a2416, rim #c9a27a → #fff0d0; ornaments ivory, never gold.',
    poses: [
      { name: 'stand' }, { name: 'walk', note: 'slow: stride × 0.65' }, { name: 'sit' },
      { name: 'speak', note: 'leans in (+0.16 rad), far hand opens to the listener, looks up (k)' },
      { name: 'bless', note: 'abhaya (k)' }, { name: 'bow', note: 'k' },
    ],
    voice: 'elder_sage',   // the speaker key in script/cast.json (voice id, speed, pitch)
  };

  CH.define({
    id: 'elder', bible, rig, shape, ornaments, defaultPose: 'stand',
    rule: {
      fill: '#100a08', lit: '#7a5236', litGain: 0.8,
      rim: ['#c9a27a', '#fff0d0'], inner: '#3a2416', innerA: [0.85, 0.4], glow: 0.6,
      ornament: ['#9a8f7d', '#f1e6c8'], ornamentA: [0.4, 0.75],
    },
    bounds: () => [-460, -1200, 240, 20],
  });
  CH.ROSTER.push('elder');
})();
