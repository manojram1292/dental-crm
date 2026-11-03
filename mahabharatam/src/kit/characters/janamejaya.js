/*
 * CHARACTER · KING JANAMEJAYA (son of Parikshit, great-grandson of Arjuna).
 *
 * The young Kuru king at whose snake sacrifice the epic was first recited.
 * Clean-shaven but for a small upturned moustache; long curls at the nape; a
 * tall tiered KIRITA-MUKUTA crown with a pointed finial and flared side wings;
 * great makara earrings; layered necklaces; pointed armlets; a jewelled belt
 * with hanging tassels; an ankle-length pleated silk dhoti and a sash whose
 * ends fly behind him; a SWORD in its scabbard at the hip.
 *
 * SIGNATURE LIGHT: the sacrificial fire's saffron with gold glints. Rim
 * #c45a1a → #ffb35a (deeper and more orange than Sauti's gold), a hot inner
 * #4a1a08, and the brightest ornaments in the series (#c8902a → #ffe08a).
 *
 * Faces LEFT natively. Feet on (x, y). scale 1 ≈ 1060 px tall without the
 * crown (≈ 1230 with it). 'sit' seats him on his simhasana.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, CH = KIT.characters;
  const { TAU, clamp, lerp } = R;
  const { cut, limb, limbOutline, ik, hand, along, ribbon } = CH;

  const D = { hip: 500, thigh: 250, shin: 236, foot: 74, sitHip: 150, throneHip: 300 };
  const PIV = -500, SH_N = [4, -790], SH_F = [30, -794], UP = 174, FO = 160;

  function rig(P) {
    const raw = P.po, k = raw.k;
    const po = raw.name === 'sit' ? { ...raw, base: 'throne' } : raw;
    const r = CH.profileRig(po, D);
    r.T = P.T; r.wind = po.wind ?? 0.6;
    r.lean = r.st * 0.05;
    r.look = P.ex.look || 0; r.speak = P.ex.speak || 0;
    // near hand rests on the sword hilt; commands; offers the ladle
    r.nearKind = 'fist'; r.nearA = Math.PI / 2;
    r.hand = r.throne ? [-170, -660] : [-12, -560];
    if (raw.name === 'speak') { r.nearKind = 'point'; r.hand = along(r.hand, [-270, -790], k); r.nearA = Math.PI + 0.2; }
    if (raw.name === 'bless') { r.nearKind = 'abhaya'; r.hand = along(r.hand, [-170, -870], k); r.nearA = -Math.PI / 2 - 0.1; }
    r.farHand = r.throne ? [-60, -650] : [40, -560]; r.farKind = 'fist'; r.farA = Math.PI / 2;
    r.ladle = 0;
    if (raw.name === 'offer') {
      r.ladle = k;
      r.hand = along(r.hand, [-250, -650], k); r.nearKind = 'fist';
      r.farHand = along(r.farHand, [-200, -640], k);
    }
    const c = Math.cos(-r.lean), s = Math.sin(-r.lean);
    const rot = (p) => [p[0] * c - (p[1] - PIV) * s, p[0] * s + (p[1] - PIV) * c + PIV];
    r.shN = rot(SH_N); r.shF = rot(SH_F);
    return r;
  }

  function headPath(g, r) {
    g.save();
    g.translate(8, -822);
    g.rotate(r.look);
    // a young face: smooth jaw, small upturned moustache
    g.moveTo(32, 8);
    g.bezierCurveTo(42, -26, 52, -66, 48, -100);
    g.bezierCurveTo(44, -126, 30, -140, 0, -142);
    g.lineTo(-48, -136);
    g.lineTo(-52, -110);
    g.lineTo(-48, -94);
    g.bezierCurveTo(-56, -84, -64, -74, -70, -64);
    g.lineTo(-58, -60);
    g.lineTo(-66, -56); g.lineTo(-58, -52);
    g.lineTo(-58, -44);
    g.bezierCurveTo(-60, -30, -54, -14, -36, -6);
    g.bezierCurveTo(-20, 0, -4, 6, 4, 14);
    g.closePath(); cut(g);
    // curls at the nape
    for (let i = 0; i < 4; i++) { const y = -96 + i * 30; g.moveTo(60, y); g.ellipse(46 + i * 3, y, 16, 15, 0, 0, TAU); cut(g); }
    // the kirita-mukuta: band, three tiers, finial; side wings behind the ears
    g.moveTo(-54, -128); g.lineTo(52, -128); g.lineTo(54, -150); g.lineTo(-50, -152); g.closePath(); cut(g);
    g.moveTo(-44, -150); g.lineTo(-36, -210); g.lineTo(34, -210); g.lineTo(44, -150); g.closePath(); cut(g);
    g.moveTo(-34, -210); g.lineTo(-24, -262); g.lineTo(24, -262); g.lineTo(32, -210); g.closePath(); cut(g);
    g.moveTo(-22, -262); g.lineTo(-10, -306); g.lineTo(10, -306); g.lineTo(20, -262); g.closePath(); cut(g);
    g.moveTo(-8, -306); g.quadraticCurveTo(0, -330, 0, -350); g.quadraticCurveTo(2, -330, 10, -306); g.closePath(); cut(g);
    g.moveTo(14, -322); g.arc(0, -322, 14, 0, TAU); cut(g);
    // side wing (karna-pushpa) flaring back
    g.moveTo(36, -150); g.quadraticCurveTo(80, -170, 96, -210); g.quadraticCurveTo(84, -160, 46, -120); g.closePath(); cut(g);
    // makara earring
    g.moveTo(32, -50); g.ellipse(18, -44, 16, 22, 0.2, 0, TAU); cut(g);
    if (r.speak > 0.02) {
      g.save(); g.globalCompositeOperation = 'destination-out';
      const o = 4 * r.speak;
      g.moveTo(-34, -36); g.lineTo(-60, -38 - o); g.lineTo(-60, -32 + o * 0.6); g.closePath(); cut(g);
      g.restore();
    }
    g.restore();
  }

  function torsoPath(g) {
    CH.torso(g, { waistY: -490, neckY: -818, chestY: -700, front: -54, back: 62, waistF: -38, waistB: 54, neckF: -6, neckB: 32, pec: 8, lat: 10 });
  }

  function swordPath(g, r) {
    // scabbard slung at the hip, angled back and down; hilt forward
    limb(g, [[16, -500], [196, -170]], [26, 18]);
    g.moveTo(206, -150); g.lineTo(186, -176); g.lineTo(210, -184); g.closePath(); cut(g);
    limb(g, [[16, -500], [-30, -584]], [14, 12]);
    g.moveTo(-26, -560); g.lineTo(22, -530); g.lineTo(30, -544); g.lineTo(-20, -574); g.closePath(); cut(g);
  }

  function sashPath(g, r) {
    const pts = ribbon([52, -500], 1.25 - 0.3 * r.wind, 230, r.T, 14 * r.wind, 2.1);
    limbOutline(g, pts, pts.map((_, i) => lerp(30, 10, i / (pts.length - 1)))); cut(g);
    // belt tassels at the front
    for (const x of [-34, -18]) { g.moveTo(x - 6, -488); g.lineTo(x + 6, -488); g.lineTo(x + 2, -400); g.lineTo(x - 4, -400); g.closePath(); cut(g); }
  }

  function throne(g) {
    // simhasana: seat slab, a lion-paw leg, a tall back with a flame arch
    g.moveTo(-170, -300); g.lineTo(150, -300); g.lineTo(150, -268); g.lineTo(-170, -268); g.closePath(); cut(g);
    g.moveTo(120, -268); g.lineTo(150, -268); g.lineTo(150, -30); g.lineTo(172, 0); g.lineTo(110, 0); g.lineTo(122, -30); g.closePath(); cut(g);
    g.moveTo(-150, -268); g.lineTo(-120, -268); g.lineTo(-122, -30); g.lineTo(-104, 0); g.lineTo(-170, 0); g.lineTo(-148, -30); g.closePath(); cut(g);
    g.moveTo(110, -300); g.lineTo(150, -300); g.lineTo(150, -820); g.quadraticCurveTo(140, -880, 110, -900); g.closePath(); cut(g);
  }

  function armsPath(g, r, near) {
    const sh = near ? r.shN : r.shF, tgt = near ? r.hand : r.farHand;
    const el = ik(sh, tgt, UP, FO, near ? -1 : 1);
    limb(g, [sh, el, tgt], near ? [60, 40, 30] : [56, 38, 28]);
    // pointed armlet (keyura) on the upper arm
    const am = along(sh, el, 0.5), ax = el[0] - sh[0], ay = el[1] - sh[1], al = Math.hypot(ax, ay);
    g.moveTo(am[0] - (ay / al) * 30, am[1] + (ax / al) * 30); g.lineTo(am[0] - (ay / al) * 50 - (ax / al) * 10, am[1] + (ax / al) * 50 - (ay / al) * 10); g.lineTo(am[0] - (ay / al) * 30 - (ax / al) * 18, am[1] + (ax / al) * 30 - (ay / al) * 18); g.closePath(); cut(g);
    hand(g, tgt, near ? r.nearA : r.farA, 38, near ? r.nearKind : r.farKind);
    if (near && r.ladle > 0.01) {
      // the sruk: a long ladle offering ghee to the fire
      limb(g, [tgt, [tgt[0] - 260 * r.ladle, tgt[1] + 40 * r.ladle]], [10, 8]);
      g.moveTo(tgt[0] - 260 * r.ladle - 30, tgt[1] + 40 * r.ladle); g.ellipse(tgt[0] - 260 * r.ladle - 4, tgt[1] + 44 * r.ladle, 30, 14, 0.15, 0, TAU); cut(g);
    }
  }

  function upper(g, r, part) {
    g.save(); g.translate(0, r.drop);
    if (part === 'back') {
      g.beginPath(); armsPath(g, r, false); g.fill();
      g.beginPath(); sashPath(g, r); g.fill();
    } else if (part === 'body') {
      g.save(); g.translate(0, -PIV); g.rotate(-r.lean); g.translate(0, PIV);
      g.beginPath(); torsoPath(g); g.fill();
      g.beginPath(); headPath(g, r); g.fill();
      g.restore();
      g.beginPath(); swordPath(g, r); g.fill();
    } else { g.beginPath(); armsPath(g, r, true); g.fill(); }
    g.restore();
  }

  function shape(g, color, P, r) {
    g.translate(0, r.bob);
    g.fillStyle = color;
    if (r.throne) { g.beginPath(); throne(g); g.fill(); }
    upper(g, r, 'back');
    g.beginPath(); CH.legs(g, r, [72, 46, 24]); g.fill();
    g.beginPath();
    if (r.throne) {
      // silk over the thigh, hanging in pleats in front of the seat
      const kn = r.legs[0].knee;
      g.moveTo(-40, -340); g.lineTo(60, -340); g.lineTo(60, -270); g.lineTo(kn[0] - 30, kn[1] + 30); g.lineTo(kn[0] - 36, kn[1] - 40); g.closePath(); cut(g);
      g.moveTo(kn[0] - 30, kn[1]); g.quadraticCurveTo(kn[0] - 50, -150, kn[0] - 20, -60); g.lineTo(kn[0] + 30, -70); g.quadraticCurveTo(kn[0] + 20, -180, kn[0] + 30, kn[1]); g.closePath(); cut(g);
    } else CH.lowerCloth(g, r, { waistY: -500, waistF: -40, waistB: 56, len: 'ankle', flare: 1.15, pleats: true, T: r.T, wind: r.wind });
    g.fill();
    upper(g, r, 'body');
    upper(g, r, 'front');
  }

  function ornaments(g, P, r, a, color) {
    if (a <= 0.01) return;
    g.translate(0, r.bob);
    g.globalAlpha *= a;
    g.strokeStyle = color; g.fillStyle = color; g.lineCap = 'round';
    if (!r.sitting) {
      const hemY = Math.max(r.legs[0].ankle[1], r.legs[1].ankle[1]) - 36;
      const xs = r.legs.map((l) => l.ankle[0]);
      for (const off of [0, -12]) { g.beginPath(); g.moveTo(Math.min(...xs) - 34, hemY + off); g.quadraticCurveTo(lerp(xs[0], xs[1], 0.5), hemY + 14 + off, Math.max(...xs) + 40, hemY - 4 + off); g.lineWidth = off ? 2.5 : 6; g.stroke(); }
    }
    g.save(); g.translate(0, r.drop);
    g.save(); g.translate(0, -PIV); g.rotate(-r.lean); g.translate(0, PIV);
    // jewelled belt, layered necklaces
    g.beginPath(); g.moveTo(-40, -498); g.quadraticCurveTo(8, -484, 56, -504); g.lineWidth = 8; g.stroke();
    CH.beads(g, [-8, -808], [-56, -760], [-40, -720], 9, 4.5);
    CH.beads(g, [-6, -806], [-66, -700], [-48, -640], 12, 4);
    g.beginPath(); g.moveTo(-6, -812); g.quadraticCurveTo(-44, -780, -50, -760); g.lineWidth = 6; g.stroke();
    g.save(); g.translate(8, -822); g.rotate(r.look);
    // crown tiers and jewels
    for (const [y, w] of [[-150, 48], [-210, 36], [-262, 24]]) { g.beginPath(); g.moveTo(-w - 4, y); g.lineTo(w + 6, y); g.lineWidth = 5; g.stroke(); }
    for (const [x, y] of [[0, -180], [-2, -236], [0, -284], [0, -322]]) { g.beginPath(); g.arc(x, y, 5, 0, TAU); g.fill(); }
    g.beginPath(); g.ellipse(18, -44, 16, 22, 0.2, 0, TAU); g.lineWidth = 3; g.stroke();
    g.restore();
    g.restore();
    // hilt and scabbard fittings
    g.beginPath(); g.moveTo(76, -400); g.lineTo(96, -388); g.lineWidth = 5; g.stroke();
    g.beginPath(); g.moveTo(170, -216); g.lineTo(190, -204); g.lineWidth = 5; g.stroke();
    g.restore();
    if (r.throne) {
      g.lineWidth = 4;
      g.beginPath(); g.moveTo(-170, -296); g.lineTo(150, -296); g.stroke();
      for (let i = 0; i < 7; i++) { g.beginPath(); g.arc(150, -840 + i * 70, 6, 0, TAU); g.fill(); }
    }
  }

  const bible = {
    name: 'King Janamejaya (son of Parikshit)',
    role: 'Kuru king; the epic is first recited by Vaishampayana at his sarpa-satra (snake sacrifice). Sauti heard it there.',
    palette: { fill: '#0e0806', inner: '#4a1a08', rimDim: '#c45a1a', rimBright: '#ffb35a', ornamentDim: '#c8902a', ornament: '#ffe08a' },
    proportions: 'Standing height ≈ 1060 units without the crown, ≈ 1230 with it; hip 500, thigh 250, shin 236; young, square-shouldered (chest 116).',
    props: ['kirita-mukuta crown: band, three tiers, finial, side wings', 'makara earrings', 'layered necklaces', 'pointed armlets', 'jewelled belt + tassels', 'sash flying behind', 'sword in scabbard at the hip', 'simhasana throne (sit pose)', 'sruk ladle (offer pose)'],
    light: 'Sacrificial saffron + gold glints: fill #0e0806, inner #4a1a08, rim #c45a1a → #ffb35a; ornaments #c8902a → #ffe08a at 0.6–1.0 (the brightest in the series).',
    poses: [
      { name: 'stand', note: 'hand on the sword hilt' }, { name: 'walk' }, { name: 'sit', note: 'enthroned on the simhasana' },
      { name: 'speak', note: 'command: near hand points (k)' }, { name: 'bless', note: 'k' }, { name: 'offer', note: 'pours ghee from the sruk ladle (k)' },
    ],
    voice: 'janamejaya',   // the speaker key in script/cast.json (voice id, speed, pitch)
  };

  CH.define({
    id: 'janamejaya', bible, rig, shape, ornaments, defaultPose: 'stand',
    rule: {
      fill: '#0e0806', lit: '#3a1a0c', litGain: 0.8,
      rim: ['#c45a1a', '#ffb35a'], inner: '#4a1a08', innerA: [0.88, 0.45], glow: 0.8,
      ornament: ['#c8902a', '#ffe08a'], ornamentA: [0.6, 1.0],
    },
    bounds: () => [-440, -1220, 300, 20],
  });
  CH.ROSTER.push('janamejaya');
})();
