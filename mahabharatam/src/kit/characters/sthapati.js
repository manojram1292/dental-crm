/*
 * CHARACTER · THE BUILDER (sthapati, sutradhara) · `sthapati`
 *
 * Episode 8 (CE 1.47): as the ground of the snake sacrifice is measured, a builder
 * versed in the lore of building, a sutradhara ("holder of the cord"), foretells that the
 * rite will not be completed: a brahmin will be the cause. The king orders that no
 * stranger be let in.
 *
 * A master builder in profile: middle-aged, a short square beard, a wrapped TURBAN with a
 * tail; a coil of MEASURING CORD over the far shoulder; a knee-length work dhoti tucked up;
 * a plumb-bob hanging from the near hand when he measures; a wooden peg-mallet at the belt.
 *
 * SIGNATURE LIGHT: ochre clay. Fill #0e0a06, inner #3a2410, rim #b8865a → #f8dcb8,
 * ornaments #a88a5a → #f0d8a8 (0.3–0.55): earthy, plainer than any brahmin or king.
 *
 * Faces LEFT natively. Feet on (x, y). scale 1 ≈ 990 px.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, CH = KIT.characters;
  const { TAU, lerp } = R;
  const { cut, limb, ik, hand, along } = CH;

  const D = { hip: 475, thigh: 240, shin: 226, foot: 72, sitHip: 145 };
  const PIV = -475, UP = 162, FO = 150;

  function rig(P) {
    const po = P.po, k = po.k;
    const r = CH.profileRig(po, D);
    r.T = P.T; r.wind = po.wind ?? 0.4;
    r.lean = 0.03 + r.st * 0.05;
    r.look = P.ex.look || 0; r.speak = P.ex.speak || 0;
    let nh = r.sitting ? [-140, -480] : [-20, -530], nk = 'fist', na = Math.PI / 2;
    let fh = r.sitting ? [-60, -480] : [40, -540];
    r.plumb = 0;
    if (po.name === 'measure') { nh = along(nh, [-300, -560], k); r.plumb = k; r.lean += 0.15 * k; r.look += 0.2 * k; }
    if (po.name === 'warn') { nh = along(nh, [-190, -920], k); nk = 'point'; na = -Math.PI / 2 - 0.2; r.look -= 0.1 * k; }
    r.hand = nh; r.nearKind = nk; r.nearA = na; r.farHand = fh;
    const c = Math.cos(-r.lean), s = Math.sin(-r.lean);
    r.rot = (p) => [p[0] * c - (p[1] - PIV) * s, p[0] * s + (p[1] - PIV) * c + PIV];
    r.shN = r.rot([4, -756]); r.shF = r.rot([28, -760]);
    return r;
  }

  function headPath(g, r) {
    g.save(); g.translate(6, -790); g.rotate(r.look);
    g.moveTo(30, 8);
    g.bezierCurveTo(40, -24, 50, -62, 46, -96);
    g.lineTo(-48, -110); g.lineTo(-48, -92);
    g.bezierCurveTo(-54, -84, -62, -74, -66, -64);
    g.lineTo(-55, -60); g.lineTo(-60, -54); g.lineTo(-55, -48);
    g.bezierCurveTo(-62, -30, -62, 0, -50, 16); g.lineTo(-20, 20); g.bezierCurveTo(0, 18, 14, 14, 30, 8);
    g.closePath(); cut(g);
    // the turban: wrapped bands and a tail behind
    g.moveTo(-56, -96); g.bezierCurveTo(-64, -170, 50, -186, 60, -110); g.lineTo(48, -88); g.closePath(); cut(g);
    const sw = Math.sin(r.T * 2.2) * 6 * r.wind;
    g.moveTo(54, -120); g.quadraticCurveTo(96, -110, 104 + sw, -40); g.lineTo(88 + sw, -44); g.quadraticCurveTo(80, -96, 50, -100); g.closePath(); cut(g);
    if (r.speak > 0.02) {
      g.save(); g.globalCompositeOperation = 'destination-out';
      const o = 4 * r.speak;
      g.moveTo(-34, -32); g.lineTo(-58, -34 - o); g.lineTo(-58, -28 + o * 0.6); g.closePath(); cut(g);
      g.restore();
    }
    g.restore();
  }

  function torsoPath(g) {
    CH.torso(g, { waistY: -466, neckY: -786, chestY: -676, front: -50, back: 58, waistF: -38, waistB: 50, neckF: -4, neckB: 28, pec: 8, lat: 8 });
  }

  function cordPath(g) {
    // a coil of cord over the far shoulder
    g.moveTo(80, -720); g.ellipse(40, -720, 40, 64, 0.3, 0, TAU); cut(g);
  }

  function armsPath(g, r, near) {
    const sh = near ? r.shN : r.shF, tgt = near ? r.hand : r.farHand;
    const el = ik(sh, tgt, UP, FO, near ? -1 : 1);
    limb(g, [sh, el, tgt], near ? [54, 36, 28] : [50, 34, 26]);
    hand(g, tgt, near ? r.nearA : Math.PI / 2, 36, near ? r.nearKind : 'fist');
    if (near && r.plumb > 0.01) {
      limb(g, [tgt, [tgt[0], tgt[1] + 300 * r.plumb]], [3, 3]);
      const b = [tgt[0], tgt[1] + 300 * r.plumb + 20];
      g.moveTo(b[0], b[1] - 22); g.lineTo(b[0] + 14, b[1]); g.lineTo(b[0], b[1] + 26); g.lineTo(b[0] - 14, b[1]); g.closePath(); cut(g);
    }
  }

  function upperT(g, r) { g.translate(0, PIV); g.rotate(-r.lean); g.translate(0, -PIV); }

  function shape(g, color, P, r) {
    g.translate(0, r.bob);
    g.fillStyle = color;
    g.save(); g.translate(0, r.drop);
    g.beginPath(); armsPath(g, r, false); g.fill();
    g.restore();
    g.beginPath(); CH.legs(g, r, [68, 44, 24]); g.fill();
    g.beginPath();
    if (r.sitting) CH.lowerCloth(g, r, { waistY: -150, waistF: -36, waistB: 50 });
    else CH.lowerCloth(g, r, { waistY: -475, waistF: -38, waistB: 50, len: 'short', flare: 1.05, T: r.T, wind: r.wind });
    g.fill();
    g.save(); g.translate(0, r.drop);
    g.save(); upperT(g, r);
    g.beginPath(); torsoPath(g); g.fill();
    g.beginPath(); cordPath(g); g.fill();
    g.beginPath(); headPath(g, r); g.fill();
    // the peg-mallet at the belt
    g.beginPath(); limb(g, [[48, -470], [90, -380]], [12, 10]); g.moveTo(110, -380); g.ellipse(92, -372, 22, 14, 0.5, 0, TAU); g.fill();
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
    g.beginPath(); g.moveTo(-38, -478); g.quadraticCurveTo(6, -466, 50, -482); g.lineWidth = 4; g.stroke();
    for (let i = 0; i < 3; i++) { g.beginPath(); g.ellipse(40, -720, 40 - i * 10, 64 - i * 14, 0.3, 0, TAU); g.lineWidth = 2; g.stroke(); }
    g.save(); g.translate(6, -790); g.rotate(r.look);
    for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(-54, -118 - i * 18); g.quadraticCurveTo(0, -140 - i * 18, 56, -114 - i * 12); g.lineWidth = 2.4; g.stroke(); }
    g.beginPath(); g.ellipse(-34, -86, 7, 3, 0.1, 0, TAU); g.fill();
    g.restore();
    g.restore();
    g.restore();
  }

  const bible = {
    name: 'The builder (sthapati, sutradhara)',
    role: 'The master builder who measures the ground of the snake sacrifice and foretells that a brahmin will stop it (CE 1.47).',
    palette: { fill: '#0e0a06', inner: '#3a2410', rimDim: '#b8865a', rimBright: '#f8dcb8', ornamentDim: '#a88a5a', ornament: '#f0d8a8' },
    proportions: '≈ 990 units: hip 475, thigh 240, shin 226; a working man\'s square chest.',
    props: ['wrapped turban with a tail', 'short square beard', 'coil of measuring cord over the far shoulder', 'plumb-bob (measure)', 'peg-mallet at the belt', 'short work dhoti'],
    light: 'Ochre clay: fill #0e0a06, inner #3a2410, rim #b8865a → #f8dcb8; ornaments #a88a5a → #f0d8a8 (0.3–0.55).',
    poses: [{ name: 'stand' }, { name: 'walk' }, { name: 'sit', note: 'at work on the ground' }, { name: 'measure', note: 'k: plumb-line held out, bending' }, { name: 'warn', note: 'k: a raised forefinger' }, { name: 'speak' }],
    voice: 'sthapati',
  };

  CH.define({
    id: 'sthapati', bible, rig, shape, ornaments, defaultPose: 'stand',
    rule: {
      fill: '#0e0a06', lit: '#6a5030', litGain: 0.8,
      rim: ['#b8865a', '#f8dcb8'], inner: '#3a2410', innerA: [0.85, 0.4], glow: 0.7,
      ornament: ['#a88a5a', '#f0d8a8'], ornamentA: [0.3, 0.55],
    },
    bounds: () => [-480, -1100, 420, 30],
  });
  CH.ROSTER.push('sthapati');
  void lerp;
})();
