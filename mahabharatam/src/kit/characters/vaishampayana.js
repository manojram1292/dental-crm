/*
 * CHARACTER · VAISHAMPAYANA, Vyasa's disciple (a sage variant built on Vyasa's frame).
 *
 * Young and upright; a short trimmed beard, a high bun, hair to the nape; bare chest with
 * the sacred thread and an uttariya over the shoulder; the bark-cloth valkala. He receives
 * the bound manuscript from Vyasa ('receive' pose) and carries it in the far hand.
 *
 * SIGNATURE LIGHT: dawn-rose. A soft rim #a8706a → #ffd6c4 on near-black #0d0a0c, a plum
 * inner glow; no halo (the halo is his teacher's).
 *
 * Faces LEFT natively. Feet on (x, y). scale 1 ≈ 1010 px tall.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, CH = KIT.characters;
  const { TAU, clamp, lerp } = R;
  const { cut, limb, limbOutline, ik, hand, along } = CH;

  const D = { hip: 490, thigh: 246, shin: 232, foot: 72, sitHip: 150 };
  const PIV = -490, SH_N = [6, -770], SH_F = [30, -774], UP = 168, FO = 156;

  function rig(P) {
    const po = P.po, T = P.T, k = po.k;
    const r = CH.profileRig(po, D);
    r.T = T; r.wind = po.wind ?? 0.5;
    r.lean = r.st * 0.04 + (po.name === 'bow' ? 0.25 * k : 0);
    r.look = (P.ex.look || 0) + (po.name === 'dictate' ? -0.06 * k : 0);
    r.speak = P.ex.speak || 0;
    // near hand: the mala at his side; raised to teach/dictate/bless
    r.nearKind = 'fist'; r.nearA = Math.PI / 2;
    r.hand = r.sitting ? [-150, -470] : [-30, -520];
    if (po.name === 'speak') { r.nearKind = 'open'; r.hand = along(r.hand, [-230, -720], k); r.nearA = Math.PI + 0.4; }
    if (po.name === 'dictate') { r.nearKind = 'point'; r.hand = along(r.hand, [-190, -860], k); r.nearA = -Math.PI / 2 - 0.25; }
    if (po.name === 'bless') { r.nearKind = 'abhaya'; r.hand = along(r.hand, [-160, -850], k); r.nearA = -Math.PI / 2 - 0.1; }
    if (po.name === 'receive') { r.nearKind = 'open'; r.hand = along(r.hand, [-250, -600], k); r.nearA = Math.PI + 0.25; r.lean += 0.12 * k; }
    r.holds = po.holds ?? (po.name !== 'receive' || k > 0.98);
    // far hand: the manuscript, held at the chest (on the lap when seated)
    r.farHand = r.sitting ? [-110, -560] : [-40, -650];
    r.pothiA = r.sitting ? 0.05 : -1.1;
    if (po.name === 'receive') { r.farHand = along(r.farHand, [-230, -630], k); r.pothiA = lerp(r.pothiA, 0, k); }
    const c = Math.cos(-r.lean), s = Math.sin(-r.lean);
    const rot = (p) => [p[0] * c - (p[1] - PIV) * s, p[0] * s + (p[1] - PIV) * c + PIV];
    r.shN = rot(SH_N); r.shF = rot(SH_F);
    return r;
  }

  function headPath(g, r) {
    g.save();
    g.translate(8, -812);
    g.rotate(r.look);
    // a young face: straight nose, a short trimmed beard
    g.moveTo(32, 8);
    g.bezierCurveTo(42, -26, 50, -66, 46, -100);
    g.bezierCurveTo(42, -132, 20, -148, -8, -148);
    g.bezierCurveTo(-34, -146, -48, -130, -50, -110);
    g.lineTo(-56, -98);
    g.lineTo(-48, -92);
    g.bezierCurveTo(-54, -82, -62, -72, -66, -62);
    g.lineTo(-56, -58);
    g.lineTo(-58, -50);
    g.bezierCurveTo(-64, -36, -64, -14, -54, 2);
    g.bezierCurveTo(-40, 18, -20, 20, -2, 14);
    g.bezierCurveTo(8, 12, 20, 10, 32, 8);
    g.closePath(); cut(g);
    // a high bun (shikha knot) bound with a cord
    g.moveTo(40, -150); g.ellipse(14, -160, 34, 26, -0.2, 0, TAU); cut(g);
    g.moveTo(26, -190); g.ellipse(10, -188, 18, 16, 0, 0, TAU); cut(g);
    // hair to the nape
    const sw = Math.sin(r.T * 1.1) * 4 * r.wind;
    g.moveTo(30, -140);
    g.bezierCurveTo(60, -110, 66, -60, 62 + sw, -10);
    g.lineTo(46 + sw, -4);
    g.bezierCurveTo(44, -50, 40, -90, 22, -120);
    g.closePath(); cut(g);
    if (r.speak > 0.02) {
      g.save(); g.globalCompositeOperation = 'destination-out';
      const o = 4 * r.speak;
      g.moveTo(-34, -40); g.lineTo(-64, -42 - o); g.lineTo(-64, -34 + o * 0.6); g.closePath(); cut(g);
      g.restore();
    }
    g.restore();
  }

  function torsoPath(g) {
    CH.torso(g, { waistY: -480, neckY: -808, chestY: -680, front: -46, back: 56, waistF: -36, waistB: 50, neckF: -6, neckB: 32, pec: 4, lat: 6 });
  }

  function pothi(g, r) {
    g.save();
    g.translate(r.farHand[0], r.farHand[1] - 20);
    g.rotate(r.pothiA);
    g.moveTo(-62, -16); g.lineTo(62, -16); g.lineTo(68, 0); g.lineTo(62, 16); g.lineTo(-62, 16); g.lineTo(-68, 0); g.closePath(); cut(g);
    // the cord's loose ends
    limbOutline(g, [[30, 16], [36, 46], [28, 70]], [5, 4, 3]); cut(g);
    g.restore();
  }

  function armsPath(g, r, near) {
    if (near) {
      const el = ik(r.shN, r.hand, UP, FO, r.nearKind === 'fist' ? -1 : -1);
      limb(g, [r.shN, el, r.hand], [54, 36, 28]);
      hand(g, r.hand, r.nearA, 38, r.nearKind);
    } else {
      const el = ik(r.shF, r.farHand, UP, FO, 1);
      limb(g, [r.shF, el, r.farHand], [50, 34, 26]);
      hand(g, r.farHand, -0.4, 36, 'cup');
      if (r.holds) pothi(g, r);
    }
  }

  function clothPath(g, r) {
    CH.lowerCloth(g, r, { waistY: -490, waistF: -38, waistB: 52, len: 'ankle', flare: 1, pleats: false });
    if (!r.sitting) {
      // ragged bark-cloth hem
      const hemY = Math.max(r.legs[0].ankle[1], r.legs[1].ankle[1]) - 30;
      const xs = r.legs.map((l) => l.ankle[0]), x0 = Math.min(...xs) - 40, x1 = Math.max(...xs) + 44;
      for (let i = 0; i < 6; i++) {
        const x = lerp(x0, x1, (i + 0.5) / 6);
        g.moveTo(x - 14, hemY); g.lineTo(x, hemY + 22 + (i % 2) * 8); g.lineTo(x + 14, hemY); g.closePath(); cut(g);
      }
    }
  }

  function upper(g, r, part) {
    g.save(); g.translate(0, r.drop);
    if (part === 'back') { g.beginPath(); armsPath(g, r, false); g.fill(); }
    else if (part === 'body') {
      g.save(); g.translate(0, PIV); g.rotate(-r.lean); g.translate(0, -PIV);
      g.beginPath(); torsoPath(g); g.fill();
      g.beginPath(); headPath(g, r); g.fill();
      g.restore();
    } else { g.beginPath(); armsPath(g, r, true); g.fill(); }
    g.restore();
  }

  function shape(g, color, P, r) {
    g.translate(0, r.bob);
    g.fillStyle = color;
    upper(g, r, 'back');
    g.beginPath(); CH.legs(g, r, [70, 44, 24]); g.fill();
    g.beginPath(); clothPath(g, r); g.fill();
    upper(g, r, 'body');
    upper(g, r, 'front');
  }

  function ornaments(g, P, r, a, color) {
    if (a <= 0.01) return;
    g.translate(0, r.bob);
    g.globalAlpha *= a;
    g.strokeStyle = color; g.fillStyle = color; g.lineCap = 'round';
    g.save(); g.translate(0, r.drop);
    g.save(); g.translate(0, PIV); g.rotate(-r.lean); g.translate(0, -PIV);
    g.beginPath(); g.moveTo(-14, -790); g.quadraticCurveTo(-34, -640, 40, -500); g.lineWidth = 3.5; g.stroke();   // sacred thread
    g.beginPath(); g.moveTo(-38, -486); g.quadraticCurveTo(8, -474, 52, -492); g.lineWidth = 4; g.stroke();      // waist cord
    g.beginPath(); g.moveTo(-40, -700); g.quadraticCurveTo(10, -640, 56, -706); g.lineWidth = 9; g.stroke();     // uttariya fold over the shoulder
    g.save(); g.translate(8, -812); g.rotate(r.look);
    g.beginPath(); g.ellipse(14, -160, 34, 26, -0.2, Math.PI * 0.95, Math.PI * 1.6); g.lineWidth = 3; g.stroke(); // bun cord
    g.restore();
    g.restore();
    // the manuscript's boards and cord
    if (r.holds) {
    g.save(); g.translate(r.farHand[0], r.farHand[1] - 20); g.rotate(r.pothiA);
    g.lineWidth = 3; g.strokeRect(-62, -16, 124, 32);
    g.beginPath(); g.moveTo(22, -16); g.lineTo(22, 16); g.lineWidth = 3; g.stroke();
    g.restore();
    }
    // the japa mala in the near hand
    if (r.nearKind === 'fist') CH.beads(g, [r.hand[0] + 4, r.hand[1] + 14], [r.hand[0] - 26, r.hand[1] + 120], [r.hand[0] + 16, r.hand[1] + 96], 12, 3.6);
    g.restore();
  }

  const bible = {
    name: 'Vaishampayana',
    role: "Vyasa's disciple, to whom he taught the epic; he first recited it, at King Janamejaya's snake sacrifice (CE 1.1.57). Sauti heard it there.",
    palette: { fill: '#0d0a0c', inner: '#2a1a20', rimDim: '#a8706a', rimBright: '#ffd6c4', ornamentDim: '#9a7a5a', ornament: '#f2dcc0' },
    proportions: 'Standing height ≈ 1010 units (Vyasa\'s frame, younger and straighter): hip 490, thigh 246, shin 232; short beard; a high bun; hair to the nape.',
    props: ['the bound manuscript he receives from Vyasa (far hand)', 'japa mala (near hand)', 'uttariya over the shoulder', 'bark-cloth valkala'],
    light: 'Dawn-rose: a soft rim #a8706a → #ffd6c4 on near-black #0d0a0c with a plum inner glow; no halo (that is his teacher\'s).',
    poses: [
      { name: 'stand' }, { name: 'walk' }, { name: 'sit' }, { name: 'speak', note: 'k' },
      { name: 'receive', note: 'k: both hands forward to take the manuscript (holds: false until k = 1)' },
      { name: 'bless', note: 'k' }, { name: 'bow', note: 'k' },
    ],
    voice: 'vaishampayana',
  };

  CH.define({
    id: 'vaishampayana', bible, rig, shape, ornaments, defaultPose: 'stand',
    rule: {
      fill: '#0d0a0c', lit: '#2e2024', litGain: 0.8,
      rim: ['#a8706a', '#ffd6c4'], inner: '#2a1a20', innerA: [0.8, 0.4], glow: 0.6, rimW: 0.9,
      ornament: ['#9a7a5a', '#f2dcc0'], ornamentA: [0.45, 0.8],
    },
    bounds: () => [-380, -1200, 300, 20],
  });
  CH.ROSTER.push('vaishampayana');
})();
