/*
 * CHARACTER · JANAMEJAYA'S BROTHERS (the Kuru princes Shrutasena, Ugrasena, Bhimasena) · `prince`
 *
 * Episode 5 (Adi Parva 3): they sat with the king at his long sacrifice at
 * Kurukshetra, and beat Sarama's son though he had done nothing wrong.
 *
 * Princes of the king's own house, so they share his costume (crowns, earrings,
 * armlets, a jewelled belt, a pleated dhoti, a sash) but never his tall
 * kirita-mukuta: that is the king's alone. Each carries a staff of office (the
 * danda they beat the pup with). opts.index picks the brother, a FIXED design:
 *
 *   0 Shrutasena  slim and tall · a conical karanda crown · long locks down the back · a slender cane
 *   1 Ugrasena    stocky · a low crown band with three points · curled moustache and short beard · a knobbed staff
 *   2 Bhimasena   the biggest · a jewelled fillet round a high topknot · heavy shoulders · a long banded bamboo staff
 *
 * SIGNATURE LIGHT: the Kuru saffron of their brother, a shade duller: a copper
 * rim #a8501c → #f2a05a, inner #3e1a0a, ornaments #a87a2a → #e8c070 (never as
 * bright as the king's).
 *
 * Faces LEFT natively. Feet on (x, y). scale 1 ≈ 1060 px (×0.98–1.06 by index).
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, CH = KIT.characters;
  const { TAU, clamp, lerp } = R;
  const { cut, limb, limbOutline, ik, hand, along, ribbon } = CH;

  const VARIANTS = [
    { name: 'Shrutasena', crown: 'cone', w: 0.94, h: 1.03, beard: false, locks: true, staff: 'cane', chest: 0 },
    { name: 'Ugrasena', crown: 'band', w: 1.1, h: 0.98, beard: true, locks: false, staff: 'club', chest: 10 },
    { name: 'Bhimasena', crown: 'fillet', w: 1.18, h: 1.06, beard: false, locks: false, staff: 'bamboo', chest: 22 },
  ];
  const variant = (i) => VARIANTS[((i % 3) + 3) % 3];
  const D = { hip: 500, thigh: 250, shin: 236, foot: 74, sitHip: 150 };
  const PIV = -500, SH_N = [4, -790], SH_F = [30, -794], UP = 176, FO = 162;

  function rig(P) {
    const raw = P.po, k = raw.k, v = variant(P.index);
    const run = raw.name === 'run';
    const po = run ? { ...raw, name: 'walk', stride: 1.35 } : raw;
    const r = CH.profileRig(po, D);
    r.v = v; r.T = P.T; r.wind = raw.wind ?? (run ? 1 : 0.5);
    r.lean = r.st * 0.05 + (run ? 0.12 : 0);
    r.look = P.ex.look || 0; r.speak = P.ex.speak || 0;
    // the staff: [hand, direction angle] — planted by default
    let hnd = [-60, -560], ang = Math.PI / 2, nearKind = 'fist';
    let far = [44, -560], farKind = 'fist', farA = Math.PI / 2;
    if (r.sitting) { hnd = [-150, -470]; ang = Math.PI / 2 + 0.25; far = [40, -470]; }
    if (raw.name === 'walk' || run) { hnd = [-80 - 30 * Math.sin(raw.phase || 0), -600]; ang = Math.PI / 2 - 0.5; far = [40 + 40 * Math.sin((raw.phase || 0) + Math.PI), -580]; }
    if (raw.name === 'raise' || raw.name === 'strike') {
      const up = raw.name === 'raise' ? k : 1, down = raw.name === 'strike' ? k : 0;
      // overhead, staff pointing up and back → swung down and forward
      const top = [-40, -1080], end = [-330, -640];
      hnd = along(along(hnd, top, up), end, down);
      ang = lerp(lerp(Math.PI / 2, -1.25, up), -3.7, down);
      r.lean += 0.08 * up - 0.06 * up * (1 - down) + 0.22 * down;
      far = along(far, [60, -720], up * (1 - down) + 0.3 * down); farKind = 'fist';
    }
    if (raw.name === 'point') {
      far = along(far, [-300, -840], k); farKind = 'point'; farA = Math.PI + 0.25;
      r.lean += 0.05 * k;
    }
    r.hand = hnd; r.ang = ang; r.nearKind = nearKind; r.farHand = far; r.farKind = farKind; r.farA = farA;
    const c = Math.cos(-r.lean), s = Math.sin(-r.lean);
    const rot = (p) => [p[0] * c - (p[1] - PIV) * s, p[0] * s + (p[1] - PIV) * c + PIV];
    r.shN = rot([SH_N[0], SH_N[1] + 0]); r.shF = rot(SH_F);
    // the hands are given in world space; keep them reachable
    return r;
  }

  function headPath(g, r) {
    const v = r.v;
    g.save();
    g.translate(8, -822);
    g.rotate(r.look);
    // face
    g.moveTo(32, 8);
    g.bezierCurveTo(44, -26, 54, -66, 50, -100);
    g.bezierCurveTo(46, -126, 30, -140, 0, -142);
    g.lineTo(-48, -134); g.lineTo(-52, -108); g.lineTo(-48, -94);
    g.bezierCurveTo(-56, -84, -66, -74, -70, -64);
    g.lineTo(-58, -60); g.lineTo(-66, -56); g.lineTo(-58, -52); g.lineTo(-58, -44);
    if (v.beard) {
      // a short squared beard
      g.bezierCurveTo(-66, -30, -66, -4, -54, 14); g.bezierCurveTo(-34, 22, -10, 20, 4, 14);
    } else {
      g.bezierCurveTo(-60, -30, -54, -14, -36, -6); g.bezierCurveTo(-20, 0, -4, 6, 4, 14);
    }
    g.closePath(); cut(g);
    if (v.beard) {
      // curled moustache: a hook up toward the cheek
      g.moveTo(-58, -50); g.quadraticCurveTo(-40, -58, -26, -78); g.quadraticCurveTo(-30, -56, -50, -42); g.closePath(); cut(g);
    }
    if (v.locks) {
      // long locks down the back
      g.moveTo(40, -120); g.bezierCurveTo(90, -80, 96, 20, 80, 110); g.lineTo(52, 104); g.bezierCurveTo(64, 20, 54, -50, 30, -96); g.closePath(); cut(g);
    } else {
      for (let i = 0; i < 3; i++) { const y = -96 + i * 30; g.moveTo(60, y); g.ellipse(46 + i * 3, y, 15, 14, 0, 0, TAU); cut(g); }
    }
    if (v.crown === 'cone') {
      // karanda-mukuta: a tall stacked cone
      g.moveTo(-50, -130); g.lineTo(50, -130); g.lineTo(46, -152); g.lineTo(-48, -152); g.closePath(); cut(g);
      for (let i = 0; i < 4; i++) { const y0 = -152 - i * 34, w0 = 42 - i * 9, w1 = 34 - i * 9; g.moveTo(-w0, y0); g.lineTo(w0, y0); g.lineTo(w1 + 4, y0 - 32); g.quadraticCurveTo(0, y0 - 42, -w1 - 4, y0 - 32); g.closePath(); cut(g); }
      g.moveTo(10, -300); g.arc(0, -300, 10, 0, TAU); cut(g);
    } else if (v.crown === 'band') {
      // a low band with three points
      g.moveTo(-52, -126); g.lineTo(52, -126); g.lineTo(50, -156); g.lineTo(-50, -158); g.closePath(); cut(g);
      for (const [x, h] of [[-36, 40], [0, 56], [34, 40]]) { g.moveTo(x - 14, -156); g.lineTo(x, -156 - h); g.lineTo(x + 14, -156); g.closePath(); cut(g); }
    } else {
      // jewelled fillet round a high topknot
      g.moveTo(-52, -128); g.lineTo(54, -128); g.lineTo(54, -146); g.lineTo(-50, -148); g.closePath(); cut(g);
      g.moveTo(34, -170); g.ellipse(10, -168, 34, 28, -0.2, 0, TAU); cut(g);
      g.moveTo(22, -206); g.ellipse(6, -204, 18, 16, 0, 0, TAU); cut(g);
    }
    // earring
    g.moveTo(26, -48); g.ellipse(16, -44, 12, 16, 0.2, 0, TAU); cut(g);
    if (r.speak > 0.02) {
      g.save(); g.globalCompositeOperation = 'destination-out';
      const o = 4 * r.speak;
      g.moveTo(-34, -36); g.lineTo(-60, -38 - o); g.lineTo(-60, -32 + o * 0.6); g.closePath(); cut(g);
      g.restore();
    }
    g.restore();
  }

  function torsoPath(g, r) {
    const c = r.v.chest;
    CH.torso(g, { waistY: -490, neckY: -818, chestY: -700, front: -54 - c, back: 62 + c * 0.6, waistF: -38, waistB: 54, neckF: -6, neckB: 32, pec: 8 + c * 0.5, lat: 10 + c });
  }

  function staffPath(g, r) {
    const v = r.v, d = [Math.cos(r.ang), Math.sin(r.ang)];
    const L = v.staff === 'bamboo' ? 640 : v.staff === 'club' ? 520 : 560;
    const butt = [r.hand[0] - d[0] * 130, r.hand[1] - d[1] * 130], tip = [r.hand[0] + d[0] * (L - 130), r.hand[1] + d[1] * (L - 130)];
    const w = v.staff === 'club' ? [16, 26] : v.staff === 'bamboo' ? [14, 14] : [10, 9];
    limb(g, [butt, tip], w);
    if (v.staff === 'club') { g.moveTo(tip[0] + 26, tip[1]); g.arc(tip[0], tip[1], 26, 0, TAU); cut(g); }
    if (v.staff === 'cane') { g.moveTo(butt[0] + 12, butt[1]); g.arc(butt[0], butt[1], 12, 0, TAU); cut(g); }
  }

  function sashPath(g, r) {
    const pts = ribbon([52, -500], 1.25 - 0.3 * r.wind, 200, r.T, 14 * r.wind, 3.3 + r.v.w);
    limbOutline(g, pts, pts.map((_, i) => lerp(28, 9, i / (pts.length - 1)))); cut(g);
  }

  function armsPath(g, r, near) {
    const sh = near ? r.shN : r.shF, tgt = near ? r.hand : r.farHand;
    const el = ik(sh, tgt, UP, FO, near ? -1 : 1);
    const t = r.v.chest * 0.4;
    limb(g, [sh, el, tgt], near ? [62 + t, 42 + t * 0.6, 30] : [58 + t, 40 + t * 0.6, 28]);
    if (near) hand(g, tgt, r.ang, 38, 'fist');
    else hand(g, tgt, r.farA, 36, r.farKind);
  }

  function shape(g, color, P, r) {
    const v = r.v;
    g.scale(v.w, v.h);
    g.translate(0, r.bob);
    g.fillStyle = color;
    g.save(); g.translate(0, r.drop);
    g.beginPath(); armsPath(g, r, false); g.fill();
    g.beginPath(); sashPath(g, r); g.fill();
    g.restore();
    g.beginPath(); CH.legs(g, r, [74 + v.chest * 0.6, 46, 24]); g.fill();
    g.beginPath();
    if (r.sitting) CH.lowerCloth(g, r, { waistY: -150, waistF: -40, waistB: 58 });
    else CH.lowerCloth(g, r, { waistY: -500, waistF: -40, waistB: 56, len: 'knee', flare: 1.1, pleats: true, T: r.T, wind: r.wind });
    g.fill();
    g.save(); g.translate(0, r.drop);
    g.save(); g.translate(0, PIV); g.rotate(-r.lean); g.translate(0, -PIV);
    g.beginPath(); torsoPath(g, r); g.fill();
    g.beginPath(); headPath(g, r); g.fill();
    g.restore();
    g.beginPath(); staffPath(g, r); g.fill();
    g.beginPath(); armsPath(g, r, true); g.fill();
    g.restore();
  }

  function ornaments(g, P, r, a, color) {
    if (a <= 0.01) return;
    const v = r.v;
    g.scale(v.w, v.h);
    g.translate(0, r.bob);
    g.globalAlpha *= a;
    g.strokeStyle = color; g.fillStyle = color; g.lineCap = 'round';
    if (!r.sitting) {
      // knee-length dhoti border
      const hemY = Math.max(r.legs[0].knee[1], r.legs[1].knee[1]) + 26;
      const xs = r.legs.map((l) => l.knee[0]);
      g.beginPath(); g.moveTo(Math.min(...xs) - 30, hemY); g.quadraticCurveTo(lerp(xs[0], xs[1], 0.5), hemY + 14, Math.max(...xs) + 40, hemY - 4); g.lineWidth = 5; g.stroke();
    }
    g.save(); g.translate(0, r.drop);
    g.save(); g.translate(0, PIV); g.rotate(-r.lean); g.translate(0, -PIV);
    // belt, necklace, sacred thread
    g.beginPath(); g.moveTo(-40, -498); g.quadraticCurveTo(8, -486, 56, -504); g.lineWidth = 7; g.stroke();
    CH.beads(g, [-8, -808], [-58, -754], [-40, -712], 8, 4.2);
    g.beginPath(); g.moveTo(30, -800); g.quadraticCurveTo(-30, -650, -40, -500); g.lineWidth = 2.5; g.stroke();
    g.save(); g.translate(8, -822); g.rotate(r.look);
    if (v.crown === 'cone') for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(-40 + i * 9, -152 - i * 34); g.lineTo(42 - i * 9, -152 - i * 34); g.lineWidth = 4; g.stroke(); }
    else if (v.crown === 'band') { g.beginPath(); g.moveTo(-50, -142); g.lineTo(50, -142); g.lineWidth = 5; g.stroke(); g.beginPath(); g.arc(0, -180, 5, 0, TAU); g.fill(); }
    else { for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(-40 + i * 22, -137, 4.5, 0, TAU); g.fill(); } }
    g.beginPath(); g.ellipse(16, -44, 12, 16, 0.2, 0, TAU); g.lineWidth = 3; g.stroke();
    g.restore();
    g.restore();
    // staff bands
    const d = [Math.cos(r.ang), Math.sin(r.ang)];
    const n = v.staff === 'bamboo' ? 4 : 2;
    for (let i = 1; i <= n; i++) {
      const u = 60 + i * (v.staff === 'bamboo' ? 110 : 140), p = [r.hand[0] + d[0] * u, r.hand[1] + d[1] * u];
      g.beginPath(); g.moveTo(p[0] - d[1] * 12, p[1] + d[0] * 12); g.lineTo(p[0] + d[1] * 12, p[1] - d[0] * 12); g.lineWidth = 4; g.stroke();
    }
    g.restore();
  }

  const bible = {
    name: 'Janamejaya\'s brothers: Shrutasena · Ugrasena · Bhimasena',
    role: 'They sat with the king at his long sacrifice at Kurukshetra and beat Sarama\'s son, though he had done nothing wrong (Adi Parva 3).',
    palette: { fill: '#0d0806', inner: '#3e1a0a', rimDim: '#a8501c', rimBright: '#f2a05a', ornamentDim: '#a87a2a', ornament: '#e8c070' },
    proportions: 'As their brother (≈ 1060 units, hip 500), varied by index: Shrutasena ×0.94 wide ×1.03 tall; Ugrasena ×1.10 × 0.98; Bhimasena ×1.18 × 1.06. Never the king\'s tall crown.',
    props: ['index 0 Shrutasena: conical karanda crown, long locks, slender cane', 'index 1 Ugrasena: low three-point crown band, curled moustache and short beard, knobbed staff', 'index 2 Bhimasena: jewelled fillet round a high topknot, heavy shoulders, long banded bamboo staff', 'earrings · necklace · sacred thread · jewelled belt · knee-length pleated dhoti · sash'],
    variations: VARIANTS,
    light: 'Kuru copper-saffron, a shade duller than the king: fill #0d0806, inner #3e1a0a, rim #a8501c → #f2a05a; ornaments #a87a2a → #e8c070 at 0.45–0.85.',
    poses: [
      { name: 'stand', note: 'staff planted' }, { name: 'walk' }, { name: 'run', note: 'phase: a chase' }, { name: 'sit', note: 'cross-legged at the rite' },
      { name: 'raise', note: 'k: the staff lifted overhead' }, { name: 'strike', note: 'k: overhead → down and forward' }, { name: 'point', note: 'k: the far hand accuses' },
    ],
    voice: 'kuru_princes',
  };

  CH.define({
    id: 'prince', bible, rig, shape, ornaments, defaultPose: 'stand',
    rule: {
      fill: '#0d0806', lit: '#341709', litGain: 0.8,
      rim: ['#a8501c', '#f2a05a'], inner: '#3e1a0a', innerA: [0.85, 0.45], glow: 0.7,
      ornament: ['#a87a2a', '#e8c070'], ornamentA: [0.45, 0.85],
    },
    bounds: () => [-820, -1700, 560, 30],
  });
  CH.PRINCE_VARIANTS = VARIANTS;
  CH.ROSTER.push('prince');
})();
