/*
 * CHARACTER · PARASHURAMA (Rama of the axe, son of Jamadagni).
 *
 * A warrior-sage: taller than everyone else in the series (1.15 × Sauti) and
 * built like a wrestler who lives on roots: broad chest and shoulders, heavy
 * arms, narrow waist, bare torso with the sacred thread. A short full beard
 * and a TALL MATTED-HAIR TOWER (jata) bound three times, with locks down the
 * back. A short deer-skin loincloth. Props: the PARASHU (a long-hafted axe
 * with a crescent blade and a back spike) in the near hand, and a great BOW
 * slung across his back.
 *
 * SIGNATURE LIGHT: blood-red rim. Fill #140507, inner #5a0c0c, rim #8e0f14 →
 * #ff4a3a with intensity, ornaments copper-red. When his mood is 'wrath' an
 * ember glints in his eye.
 *
 * Faces LEFT natively. Feet on (x, y). scale 1 ≈ 1200 px tall (to the top of the jata).
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, CH = KIT.characters;
  const { TAU, clamp, lerp, E } = R;
  const { cut, limb, limbOutline, ik, hand, along } = CH;

  const D = { hip: 560, thigh: 282, shin: 262, foot: 84, sitHip: 160 };
  const PIV = -560;                    // the torso pivots about the hip
  const SH_N = [2, -868], SH_F = [30, -872], UP = 190, FO = 176;
  const HAFT = 800, GRIP = 300;        // haft length; near-hand grip measured from the butt

  // pose → [hand target, haft angle θ from vertical (+ = toward his back)]
  function axePose(po, r, T) {
    const k = po.k;
    const rest = { hand: [-150, -600], th: -0.05 };
    const raised = { hand: [-175, -1175], th: 0.38 };
    const struck = { hand: [-330, -640], th: -1.75 };
    const lowered = { hand: [-120, -560], th: Math.PI - 0.12 };
    const sh = { hand: [-60, -720], th: 0.95 };
    const mixP = (a, b, u) => ({ hand: along(a.hand, b.hand, u), th: lerp(a.th, b.th, u) });
    switch (po.name) {
      case 'walk': return sh;
      case 'raise-axe': return mixP(rest, raised, E.inOutCubic(k));
      case 'strike': {
        // overhead → down through a forward arc
        const u = E.inQuad(k), a = lerp(-1.75, 0.55, 1 - u);
        return { hand: [lerp(-175, -330, Math.sin(u * Math.PI / 2)), lerp(-1175, -640, 1 - Math.cos(u * Math.PI / 2))], th: lerp(-1.75, 0.38, 1 - u) };
      }
      case 'lower-axe': return mixP(raised, lowered, E.inOutCubic(k));
      case 'sit': return { hand: [-235, -560 - 0], th: 0.02 };
      default: return rest;
    }
  }

  function rig(P) {
    const po = P.po, T = P.T;
    const r = CH.profileRig(po, D);
    const k = po.k;
    r.T = T; r.mood = P.ex.mood || 'calm';
    r.lean = r.st * 0.06 + (po.name === 'strike' ? 0.18 * E.inQuad(k) : 0) + (po.name === 'lower-axe' ? 0.12 * k : 0) - (po.name === 'raise-axe' ? 0.05 * k : 0);
    r.look = (P.ex.look || 0) + (po.name === 'lower-axe' ? 0.28 * E.inOutCubic(k) : 0) + (po.name === 'raise-axe' ? -0.1 * k : 0);
    r.speak = P.ex.speak || 0;
    r.wind = po.wind ?? 0.6;
    const ax = axePose(po, r, T);
    r.hand = ax.hand.slice(); r.th = ax.th;
    if (r.sitting) { r.hand = [-235, -560 - 0]; }
    const d = [Math.sin(r.th), -Math.cos(r.th)];
    r.axeHead = [r.hand[0] + d[0] * (HAFT - GRIP), r.hand[1] + d[1] * (HAFT - GRIP)];
    r.axeButt = [r.hand[0] - d[0] * GRIP, r.hand[1] - d[1] * GRIP];
    // far hand: a clenched fist at rest; opens to speak; forward and down when he raises the axe
    r.farKind = 'fist'; r.farA = Math.PI / 2;
    r.farHand = r.sitting ? [-90, -520] : [40, -600];
    if (po.name === 'raise-axe' || po.name === 'strike') { r.farHand = along([40, -600], [120, -650], E.inOutCubic(k)); }
    if (po.name === 'speak') { r.farKind = 'open'; r.farHand = [lerp(40, -250, k), lerp(-600, -800, k) + Math.sin(T * 3) * 8 * k]; r.farA = Math.PI + lerp(1, 0.3, k); }
    if (po.name === 'bless') { r.farKind = 'abhaya'; r.farHand = [lerp(40, -170, k), lerp(-600, -960, k)]; r.farA = -Math.PI / 2 - 0.1; }
    if (po.name === 'lower-axe') { r.farHand = along([40, -600], [-80, -600], k); }
    const c = Math.cos(-r.lean), s = Math.sin(-r.lean);
    const rot = (p) => [p[0] * c - (p[1] - PIV) * s, p[0] * s + (p[1] - PIV) * c + PIV];
    r.shN = rot(SH_N); r.shF = rot(SH_F);
    return r;
  }

  function headPath(g, r) {
    g.save();
    g.translate(-8, -900);
    g.rotate(r.look);
    g.scale(1.14, 1.14);
    // a strong head: heavy brow, straight nose, full short beard
    g.moveTo(36, 8);
    g.bezierCurveTo(46, -30, 56, -70, 52, -104);
    g.bezierCurveTo(48, -138, 22, -158, -10, -156);
    g.bezierCurveTo(-38, -154, -52, -136, -56, -114);
    g.lineTo(-62, -104);                       // brow ridge
    g.lineTo(-54, -96);
    g.bezierCurveTo(-60, -86, -70, -74, -76, -64); // nose
    g.lineTo(-62, -60);
    g.lineTo(-66, -52);
    g.bezierCurveTo(-74, -40, -74, -10, -66, 14);  // beard front
    g.bezierCurveTo(-58, 34, -40, 46, -20, 44);
    g.bezierCurveTo(-4, 40, 8, 26, 10, 12);
    g.closePath(); cut(g);
    // the jata tower: tall, slightly swept back, three bindings
    g.moveTo(-30, -136);
    const lumps = 7;
    for (let i = 0; i < lumps; i++) {          // front edge: matted coils bulging out
      const y0 = -136 - i * 32, y1 = y0 - 32, x0 = lerp(-34, -20, i / lumps), x1 = lerp(-34, -20, (i + 1) / lumps);
      g.quadraticCurveTo(x0 - 18, (y0 + y1) / 2, x1, y1);
    }
    g.bezierCurveTo(-14, -378, 10, -384, 22, -360);
    for (let i = lumps - 1; i >= 0; i--) {     // back edge
      const y0 = -136 - (i + 1) * 32, y1 = y0 + 32, x0 = lerp(46, 26, (i + 1) / lumps), x1 = lerp(46, 26, i / lumps);
      g.quadraticCurveTo(x0 + 18, (y0 + y1) / 2, x1, y1);
    }
    g.closePath(); cut(g);
    g.moveTo(16, -386); g.ellipse(2, -386, 18, 16, 0.2, 0, TAU); cut(g);
    // matted locks down the back
    for (const [x0, len, w] of [[40, 150, 22], [50, 120, 18], [30, 170, 16]]) {
      const pts = [];
      for (let i = 0; i <= 8; i++) { const u = i / 8; pts.push([x0 + u * 22 + Math.sin(u * 3 + x0 + r.T * 1.2) * 4 * r.wind, -120 + u * len]); }
      limbOutline(g, pts, pts.map((_, i) => lerp(w, 6, i / 8))); cut(g);
    }
    if (r.speak > 0.02) {
      g.save(); g.globalCompositeOperation = 'destination-out';
      const o = 5 * r.speak;
      g.moveTo(-40, -42); g.lineTo(-72, -44 - o); g.lineTo(-72, -36 + o * 0.6); g.closePath(); cut(g);
      g.restore();
    }
    g.restore();
  }

  function torsoPath(g) {
    // a wrestler's chest: big pectoral bulge, wide lats, narrow waist
    CH.torso(g, { waistY: -545, neckY: -900, chestY: -775, front: -74, back: 84, waistF: -36, waistB: 50, neckF: -14, neckB: 38, pec: 12, lat: 30 });
    // shoulder caps (deltoids)
    g.moveTo(66, -858); g.ellipse(8, -856, 60, 52, 0.3, 0, TAU); cut(g);
  }

  function bowPath(g, r) {
    // a great bow slung diagonally across the back, string in front of it
    const pts = [];
    for (let i = 0; i <= 18; i++) {
      const u = i / 18, a = lerp(-1, 1, u);
      pts.push([70 + 150 * (1 - a * a) * 0.55 + a * -60, -700 + a * 330]);
    }
    limbOutline(g, pts, pts.map((_, i) => 8 + 12 * Math.sin(Math.PI * i / 18))); cut(g);
    limbOutline(g, [pts[0], pts[18]], [4, 4]); cut(g);
    // the grip binding
    g.moveTo(pts[9][0] + 12, pts[9][1]); g.ellipse(pts[9][0], pts[9][1], 12, 22, 0, 0, TAU); cut(g);
  }

  function axePath(g, r) {
    limb(g, [r.axeButt, r.axeHead], [15, 19]);
    g.save();
    g.translate(r.axeHead[0], r.axeHead[1]);
    g.rotate(r.th);
    g.scale(1.35, 1.35);
    // crescent blade, cutting edge forward (−x)
    g.moveTo(-6, 34);
    g.bezierCurveTo(-40, 40, -80, 70, -120, 96);
    g.bezierCurveTo(-150, 40, -152, -40, -126, -96);
    g.bezierCurveTo(-90, -70, -48, -46, -8, -40);
    g.closePath(); cut(g);
    // back spike and socket
    g.moveTo(10, -26); g.lineTo(62, -6); g.lineTo(10, 18); g.closePath(); cut(g);
    g.moveTo(20, -50); g.lineTo(20, 46); g.lineTo(-12, 46); g.lineTo(-12, -50); g.closePath(); cut(g);
    g.moveTo(10, -58); g.ellipse(4, -58, 10, 12, 0, 0, TAU); cut(g);
    g.restore();
  }

  function armsPath(g, r, near) {
    const sh = near ? r.shN : r.shF, tgt = near ? r.hand : r.farHand;
    const bend = near ? (r.th > 1.5 ? 1 : -1) : (r.farKind === 'fist' ? 1 : -1);
    const el = ik(sh, tgt, UP, FO, bend);
    const ws = near ? [80, 70, 48, 50, 36] : [74, 64, 44, 46, 34];
    limb(g, [sh, along(sh, el, 0.45), el, along(el, tgt, 0.4), tgt], ws);
    if (near) hand(g, tgt, Math.atan2(r.axeHead[1] - tgt[1], r.axeHead[0] - tgt[0]) + Math.PI / 2, 46, 'fist');
    else hand(g, tgt, r.farA, 44, r.farKind);
  }

  function upper(g, r, part) {
    g.save(); g.translate(0, r.drop);
    if (part === 'back') {
      g.save(); g.translate(0, PIV); g.rotate(-r.lean); g.translate(0, -PIV);
      g.beginPath(); bowPath(g, r); g.fill();
      g.restore();
      g.beginPath(); armsPath(g, r, false); g.fill();
    } else if (part === 'body') {
      g.save(); g.translate(0, PIV); g.rotate(-r.lean); g.translate(0, -PIV);
      g.beginPath(); torsoPath(g); g.fill();
      g.beginPath(); headPath(g, r); g.fill();
      g.restore();
    } else {
      g.beginPath(); axePath(g, r); g.fill();
      g.beginPath(); armsPath(g, r, true); g.fill();
    }
    g.restore();
  }

  function shape(g, color, P, r) {
    g.translate(0, r.bob);
    g.fillStyle = color;
    upper(g, r, 'back');
    g.beginPath(); CH.legs(g, r, [92, 56, 30]); g.fill();
    g.beginPath(); CH.lowerCloth(g, r, { waistY: -560, waistF: -40, waistB: 56, len: 'short', flare: 1.1 }); g.fill();
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
    // sacred thread across the chest, waist cord
    g.beginPath(); g.moveTo(-20, -880); g.quadraticCurveTo(-30, -700, 40, -575); g.lineWidth = 4; g.stroke();
    g.beginPath(); g.moveTo(-40, -556); g.quadraticCurveTo(8, -544, 52, -562); g.lineWidth = 6; g.stroke();
    // rudraksha at the throat
    CH.beads(g, [-10, -892], [-40, -840], [14, -846], 8, 4.4);
    g.save(); g.translate(-8, -900); g.rotate(r.look); g.scale(1.14, 1.14);
    // jata bindings
    for (const [y, w] of [[-200, 44], [-300, 36]]) { g.beginPath(); g.moveTo(-w, y + 6); g.quadraticCurveTo(0, y - 4, w * 0.9, y - 4); g.lineWidth = 5; g.stroke(); }
    // the eye: an ember in wrath, a dull glint otherwise
    const hot = r.mood === 'wrath' ? 1 : 0.35;
    g.save(); g.globalAlpha *= hot; g.fillStyle = r.mood === 'wrath' ? '#ff6a3a' : color;
    g.beginPath(); g.ellipse(-36, -92, 8, 3.6, 0.15, 0, TAU); g.fill();
    g.restore();
    g.restore();
    g.restore();
    // armband on the near arm
    const el = ik(r.shN, r.hand, UP, FO, r.th > 1.5 ? 1 : -1), am = along(r.shN, el, 0.55);
    const ax = el[0] - r.shN[0], ay = el[1] - r.shN[1], al = Math.hypot(ax, ay), nx = -ay / al, ny = ax / al;
    for (const off of [-7, 7]) { g.beginPath(); g.moveTo(am[0] - nx * 34 + (ax / al) * off, am[1] - ny * 34 + (ay / al) * off); g.lineTo(am[0] + nx * 34 + (ax / al) * off, am[1] + ny * 34 + (ay / al) * off); g.lineWidth = 4; g.stroke(); }
    // the blade's edge catches the light
    g.save(); g.translate(r.axeHead[0], r.axeHead[1]); g.rotate(r.th); g.scale(1.35, 1.35);
    g.beginPath(); g.moveTo(-120, 92); g.bezierCurveTo(-146, 40, -148, -40, -124, -92); g.lineWidth = 5; g.stroke();
    g.restore();
    g.restore();
  }

  const bible = {
    name: 'Parashurama (Rama of the axe, son of Jamadagni)',
    role: 'The Brahmin warrior-sage who cleared the earth of kshatriyas twenty-one times and filled the five lakes of Samantapanchaka.',
    palette: { fill: '#140507', inner: '#5a0c0c', rimDim: '#8e0f14', rimBright: '#ff4a3a', ornamentDim: '#7a2216', ornament: '#f08a5a', wrathEye: '#ff6a3a' },
    proportions: 'Standing height ≈ 1200 units to the top of the jata (1.15 × Sauti): hip 560, thigh 282, shin 262; chest 162 deep, waist 86; arms 190 + 176, as thick as Sauti\'s legs; the jata tower is 250 tall (1.6 × the head).',
    props: ['parashu: 800-unit haft, crescent blade with a back spike (near hand)', 'great bow slung across the back', 'sacred thread, rudraksha at the throat', 'armband', 'short deer-skin loincloth'],
    light: 'Blood-red rim: fill #140507, inner #5a0c0c, rim #8e0f14 → #ff4a3a, glow 1.0; ornaments copper-red #7a2216 → #f08a5a; mood "wrath" lights an ember in the eye.',
    poses: [
      { name: 'stand', note: 'axe planted ahead' }, { name: 'walk', note: 'axe shouldered' }, { name: 'sit', note: 'axe planted beside him' },
      { name: 'speak', note: 'far hand opens (k)' }, { name: 'bless', note: 'k' },
      { name: 'raise-axe', note: 'k: from planted to overhead, blade high and swept back' },
      { name: 'strike', note: 'k: overhead → down and forward' },
      { name: 'lower-axe', note: 'k: raised → blade turned to the ground, head bowed (renunciation)' },
    ],
    voice: 'parashurama',   // the speaker key in script/cast.json (voice id, speed, pitch)
  };

  CH.define({
    id: 'parashurama', bible, rig, shape, ornaments, defaultPose: 'stand',
    rule: {
      fill: '#140507', lit: '#3e0a0a', litGain: 0.8,
      rim: ['#8e0f14', '#ff4a3a'], inner: '#5a0c0c', innerA: [0.9, 0.5], glow: 1.0, rimW: 1.1,
      ornament: ['#7a2216', '#f08a5a'], ornamentA: [0.45, 0.85],
    },
    bounds: (P, r) => [Math.min(-520, r.axeHead[0] - 180), Math.min(-1360, r.axeHead[1] - 180), Math.max(380, r.axeHead[0] + 180), 20],
  });
  CH.ROSTER.push('parashurama');
})();
