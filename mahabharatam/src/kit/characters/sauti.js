/*
 * CHARACTER · SAUTI (Ugrashravas, son of Lomaharshana) · the storyteller.
 *
 * A wandering bard-sage: lean, upright, a long pointed beard, a jata topknot
 * with a small crown knot, shoulder-length locks, a knee-length veshti with
 * kasavu-gold borders, an uttariya shawl whose end streams behind him, a
 * rudraksha mala, a kundala earring and a gold armband. Always carries his
 * STAFF (near hand) and his KAMANDALU water pot (far hand, or set down beside
 * him when that hand speaks).
 *
 * SIGNATURE LIGHT: warm fire rim, gold. A near-black fill, an ember-brown
 * inner glow, a rim from deep amber (#d8903e) to pale gold (#ffe2a0) with the
 * fire's intensity, and gold ornaments that catch the same light.
 *
 * Episode 1's look is this module's stand/walk exactly (the geometry is the
 * episode-1 storyteller, unchanged). Faces LEFT natively. Feet on (x, y).
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, CH = KIT.characters;
  const { TAU, clamp, lerp, PAL } = R;
  const { cut, limb, limbOutline, ik, ribbon, hand } = CH;

  const D = { hip: 500, thigh: 252, shin: 238, foot: 74, sitHip: 150 };

  // ─── rig ─────────────────────────────────────────────────────────────────
  function rig(P) {
    const po = P.po, T = P.T;
    const sitting = po.base === 'sit';
    const ph = po.phase, st = sitting ? 0 : po.stride;
    let legs, bob = 0, drop = 0;
    if (!sitting) {
      const hip = [0, -500];
      legs = [0, Math.PI].map((off) => {
        const p = ph + off;
        const th = st * 0.36 * Math.sin(p);                          // thigh swing (+ = forward)
        const flex = st * (0.12 + 0.55 * clamp(Math.sin(p + 1.25)));  // knee bends in the swing phase
        const knee = [hip[0] - Math.sin(th) * 252, hip[1] + Math.cos(th) * 252];
        const sa = th - flex;
        const ankle = [knee[0] - Math.sin(sa) * 238, knee[1] + Math.cos(sa) * 238];
        const fa = clamp(-sa * 0.6 + st * 0.25 * clamp(Math.sin(p + 2.4)), -0.5, 0.6);
        const toe = [ankle[0] - Math.cos(fa) * 74, ankle[1] + 10 + Math.sin(fa) * 74];
        const heel = [ankle[0] + 16, ankle[1] + 12];
        return { hip, knee, ankle, toe, heel, th };
      });
      const low = Math.max(...legs.map((l) => Math.max(l.toe[1], l.heel[1], l.ankle[1] + 22)));
      bob = -low;
    } else {
      const sr = CH.profileRig(po, D);
      legs = sr.legs; drop = sr.drop;
    }
    const lean = st * 0.05 + (po.name === 'bow' ? 0.16 * po.k : 0);
    // staff: planted ahead, swinging with the stride (seated: planted beside him, upright)
    let staffB, staffT, handY;
    if (!sitting) {
      const sw = st * Math.sin(ph) * 30;
      staffB = [-150 + sw, 0 - bob];
      staffT = [staffB[0] + 70 + st * 10, -1150 - bob];
      handY = -650;
    } else {
      staffB = [-205, 0 - drop];          // in upper-body space (the upper body is drawn shifted down by drop)
      staffT = [-150, -1120 - drop];
      handY = -740;
    }
    const kk = (handY - staffB[1]) / (staffT[1] - staffB[1]);
    const hnd = [lerp(staffB[0], staffT[0], kk) + 10, handY];
    // far hand: the kamandalu, or a gesture (the pot is then set down)
    let farHand = [44 + st * 22 * Math.sin(ph + Math.PI), -560], farKind = 'pot', farA = 0;
    const g = po.k;
    if (sitting && po.name === 'sit') farHand = [40, -470];
    if (po.name === 'speak') {
      farKind = 'open';
      const beat = Math.sin(T * 3.4) * 10 * g;
      farHand = [lerp(40, -205, g), lerp(-560, -705, g) + beat];
      farA = Math.PI + lerp(0.9, 0.35, g);
    } else if (po.name === 'bless') {
      farKind = 'abhaya';
      farHand = [lerp(40, -150, g), lerp(-560, -860, g)];
      farA = -Math.PI / 2 - 0.12;
    }
    // extra lean (a bow) carries the shoulders with it; the walk's own lean does not (episode 1)
    const xl = lean - st * 0.05, c = Math.cos(-xl), s = Math.sin(-xl);
    const rot = (p) => [p[0] * c - (p[1] + 500) * s, p[0] * s + (p[1] + 500) * c - 500];
    return { shN: rot([6, -778]), shF: rot([30, -782]), legs, bob, drop, lean, staffB, staffT, hand: hnd, farHand, farKind, farA, T, wind: po.wind ?? 0.6, look: P.ex.look || 0, speak: P.ex.speak || 0, st, sitting };
  }

  // ─── geometry (episode 1's storyteller) ─────────────────────────────────────
  function torsoPath(g) {
    g.moveTo(-36, -560);
    g.bezierCurveTo(-44, -620, -50, -660, -48, -705);
    g.bezierCurveTo(-46, -760, -30, -800, -4, -822);
    g.lineTo(34, -824);
    g.bezierCurveTo(54, -800, 66, -760, 64, -720);
    g.bezierCurveTo(62, -660, 50, -615, 56, -565);
    g.closePath(); cut(g);
  }
  function dhotiPath(g, r) {
    // veshti, knee length, flaring over the moving knees
    const [a, b] = r.legs;
    const front = a.knee[0] < b.knee[0] ? a : b, back = front === a ? b : a;
    const hemY = Math.max(a.knee[1], b.knee[1]) + 34;
    g.moveTo(-40, -575);
    g.bezierCurveTo(-58, -500, front.knee[0] - 40, front.knee[1] - 120, front.knee[0] - 34, hemY - 6);
    g.quadraticCurveTo(lerp(front.knee[0], back.knee[0], 0.5), hemY + 14, back.knee[0] + 40, hemY - 4);
    g.bezierCurveTo(back.knee[0] + 52, back.knee[1] - 120, 84, -440, 70, -515);
    g.lineTo(58, -585);
    g.closePath(); cut(g);
    // front pleats (the tucked kaccha), swaying
    const sway = Math.sin(r.T * 3.1) * 6 * r.wind + r.st * 10;
    g.moveTo(-44, -560);
    g.quadraticCurveTo(-70 - sway, -440, -64 - sway, -330);
    g.lineTo(-30 - sway * 0.5, -345);
    g.quadraticCurveTo(-34, -450, -16, -555);
    g.closePath(); cut(g);
  }
  function seatedClothPath(g, r) {
    // the veshti gathered over the folded legs (world space)
    CH.lowerCloth(g, r, { waistY: -150, waistF: -40, waistB: 58 });
    const sway = Math.sin(r.T * 3.1) * 4 * r.wind;
    g.moveTo(-40, -200); g.quadraticCurveTo(-120 - sway, -120, -150 - sway, -40); g.lineTo(-110, -40); g.quadraticCurveTo(-80, -120, -14, -196); g.closePath(); cut(g);
  }

  function headPath(g, r) {
    g.save();
    g.translate(8, -830);
    g.rotate(r.look);
    g.moveTo(34, 10);
    g.bezierCurveTo(40, -20, 52, -60, 50, -95);
    g.bezierCurveTo(48, -130, 25, -155, -8, -156);
    g.bezierCurveTo(-35, -156, -50, -140, -54, -116);
    g.lineTo(-56, -102);
    g.lineTo(-50, -95);
    g.bezierCurveTo(-56, -88, -67, -78, -76, -68);
    g.lineTo(-62, -64);
    g.lineTo(-68, -58);
    g.lineTo(-58, -55);
    g.lineTo(-61, -50);
    // the beard: a long pointed wedge flowing down and forward
    g.bezierCurveTo(-63, -36, -64, -12, -60, 8);
    g.bezierCurveTo(-58, 22, -56, 34, -50, 50);
    g.bezierCurveTo(-42, 30, -30, 8, -12, -12);
    g.lineTo(-10, 12);
    g.closePath(); cut(g);
    // jata: topknot with a small crown knot, and shoulder-length locks
    g.moveTo(38, -162);
    g.ellipse(14, -164, 24, 17, -0.3, 0, TAU); cut(g);
    g.moveTo(15, -184);
    g.ellipse(6, -184, 9, 8, 0, 0, TAU); cut(g);
    g.moveTo(44, -100);
    g.bezierCurveTo(64, -70, 62, -18, 54, 22);
    g.lineTo(40, 14);
    g.bezierCurveTo(44, -30, 42, -60, 34, -92);
    g.closePath(); cut(g);
    // speaking: the lips part (a cut through the puppet's leather)
    if (r.speak > 0.02) {
      g.save();
      g.globalCompositeOperation = 'destination-out';
      const o = 5 * r.speak;
      g.moveTo(-36, -50); g.lineTo(-64, -52 - o); g.lineTo(-64, -46 + o * 0.6); g.closePath(); cut(g);
      g.restore();
    }
    g.restore();
  }

  function kamandalu(g, at, swing) {
    g.save();
    g.translate(at[0], at[1]);
    g.rotate(swing);
    g.moveTo(-26, 8); g.quadraticCurveTo(0, -30, 26, 8); g.lineTo(20, 10); g.quadraticCurveTo(0, -20, -20, 10); g.closePath(); cut(g);
    g.moveTo(40, 66);
    g.ellipse(0, 66, 42, 38, 0, 0, TAU); cut(g);
    g.moveTo(-30, 40); g.lineTo(-74, 22); g.lineTo(-76, 30); g.lineTo(-34, 54); g.closePath(); cut(g);
    g.moveTo(20, 30); g.ellipse(0, 30, 20, 9, 0, 0, TAU); cut(g);
    g.restore();
  }

  function armsPath(g, r, near) {
    if (near) {
      const sh = r.shN;
      const el = ik(sh, r.hand, 172, 158, -1);
      limb(g, [sh, el, r.hand], [62, 40, 32]);
      g.moveTo(r.hand[0] + 24, r.hand[1]);
      g.ellipse(r.hand[0], r.hand[1] + 2, 24, 20, 0.3, 0, TAU); cut(g);
    } else {
      const sh = r.shF;
      const el = ik(sh, r.farHand, 172, 150, r.farKind === 'pot' ? 1 : -1);
      limb(g, [sh, el, r.farHand], [56, 38, 30]);
      if (r.farKind === 'pot') {
        const swing = Math.sin(r.T * 2.4) * 0.05 + r.st * 0.08 * Math.sin((r.T || 0) * 4);
        kamandalu(g, r.farHand, swing);
      } else hand(g, r.farHand, r.farA, 40, r.farKind);
    }
  }

  function shawlPath(g, r) {
    // uttariya over the shoulder, its end streaming behind in the wind
    g.moveTo(-30, -800);
    g.bezierCurveTo(10, -826, 56, -818, 72, -770);
    g.bezierCurveTo(78, -720, 66, -640, 70, -600);
    g.lineTo(40, -604);
    g.bezierCurveTo(30, -680, 20, -740, -38, -760);
    g.closePath(); cut(g);
    const pts = ribbon([62, -760], 1.4 - 0.22 * r.wind, 210, r.T, 12 * r.wind, 1.3);
    limbOutline(g, pts, pts.map((_, i) => lerp(36, 12, i / (pts.length - 1))));
  }

  function staffPath(g, r) {
    limb(g, [r.staffB, r.staffT], [12, 15]);
    g.moveTo(r.staffT[0] + 12, r.staffT[1] - 6);
    g.ellipse(r.staffT[0], r.staffT[1] - 8, 12, 16, 0, 0, TAU); cut(g);
  }

  function shape(g, color, P, r) {
    g.translate(0, r.bob);
    g.fillStyle = color;
    if (r.sitting) {
      if (r.farKind !== 'pot') { g.beginPath(); kamandalu(g, [-330, -104], 0); g.fill(); }
      g.beginPath(); CH.legs(g, r, [74, 46, 24]); g.fill();
      g.beginPath(); seatedClothPath(g, r); g.fill();
      g.save(); g.translate(0, r.drop);
      g.beginPath(); armsPath(g, r, false); g.fill();
      g.save(); g.translate(0, -500); g.rotate(-r.lean); g.translate(0, 500);
      g.beginPath(); torsoPath(g); g.fill();
      g.beginPath(); shawlPath(g, r); g.fill();
      g.beginPath(); headPath(g, r); g.fill();
      g.restore();
      g.beginPath(); staffPath(g, r); g.fill();
      g.beginPath(); armsPath(g, r, true); g.fill();
      g.restore();
      return;
    }
    if (r.farKind !== 'pot') { g.beginPath(); kamandalu(g, [92, -104 - r.bob], 0); g.fill(); }
    g.beginPath(); armsPath(g, r, false); g.fill();
    g.beginPath(); CH.legs(g, r, [74, 46, 24]); g.fill();
    g.save(); g.translate(0, -500); g.rotate(-r.lean); g.translate(0, 500);
    g.beginPath(); torsoPath(g); dhotiPath(g, r); g.fill();
    g.beginPath(); shawlPath(g, r); g.fill();
    g.beginPath(); headPath(g, r); g.fill();
    g.restore();
    g.beginPath(); staffPath(g, r); g.fill();
    g.beginPath(); armsPath(g, r, true); g.fill();
  }

  /** Gold cloth borders, rudraksha mala, kundala, armband, staff bands. */
  function ornaments(g, P, r, a, color) {
    if (a <= 0.01) return;
    g.translate(0, r.bob);
    g.globalAlpha *= a;
    g.strokeStyle = color; g.fillStyle = color; g.lineCap = 'round';
    if (!r.sitting) {
      g.save(); g.translate(0, -500); g.rotate(-r.lean); g.translate(0, 500);
      const [l0, l1] = r.legs;
      const front = l0.knee[0] < l1.knee[0] ? l0 : l1, back = front === l0 ? l1 : l0;
      const hemY = Math.max(l0.knee[1], l1.knee[1]) + 34;
      for (const off of [-12, -22]) {
        g.beginPath();
        g.moveTo(front.knee[0] - 30, hemY - 6 + off);
        g.quadraticCurveTo(lerp(front.knee[0], back.knee[0], 0.5), hemY + 14 + off, back.knee[0] + 38, hemY - 4 + off);
        g.lineWidth = off === -12 ? 7 : 2.5; g.stroke();
      }
      g.beginPath(); g.moveTo(-44, -572); g.quadraticCurveTo(10, -560, 60, -580); g.lineWidth = 5; g.stroke();
      g.restore();
    } else {
      const kn = r.legs[0].knee;
      for (const off of [0, 10]) {
        g.beginPath(); g.moveTo(kn[0] - 10, -6 - off); g.quadraticCurveTo(-60, -2 - off, 150, -6 - off); g.lineWidth = off ? 2.5 : 6; g.stroke();
      }
    }
    g.save(); g.translate(0, r.drop);
    g.save(); g.translate(0, -500); g.rotate(-r.lean); g.translate(0, 500);
    if (r.sitting) { g.beginPath(); g.moveTo(-44, -572); g.quadraticCurveTo(10, -560, 60, -580); g.lineWidth = 5; g.stroke(); }
    // shawl border
    g.beginPath(); g.moveTo(-30, -764); g.bezierCurveTo(14, -748, 26, -690, 36, -610); g.lineWidth = 4; g.stroke();
    // rudraksha mala: beads hanging down the chest
    CH.beads(g, [-4, -815], [-46, -755], [-30, -688], 10, 4.2);
    // kundala earring, hair tie
    g.save(); g.translate(8, -830); g.rotate(r.look);
    g.beginPath(); g.arc(12, -62, 7, 0, TAU); g.lineWidth = 3; g.stroke();
    g.beginPath(); g.ellipse(14, -164, 24, 17, -0.3, Math.PI * 1.05, Math.PI * 1.55); g.lineWidth = 3.5; g.stroke();
    g.restore();
    g.restore();
    // armband on the near (staff) arm
    const sh = r.shN, el = ik(sh, r.hand, 172, 158, -1);
    const am = [lerp(sh[0], el[0], 0.5), lerp(sh[1], el[1], 0.5)];
    const ax = el[0] - sh[0], ay = el[1] - sh[1], al = Math.hypot(ax, ay);
    const nx = -ay / al, ny = ax / al;
    for (const off of [-6, 6]) {
      g.beginPath(); g.moveTo(am[0] - nx * 26 + (ax / al) * off, am[1] - ny * 26 + (ay / al) * off); g.lineTo(am[0] + nx * 26 + (ax / al) * off, am[1] + ny * 26 + (ay / al) * off);
      g.lineWidth = 3.5; g.stroke();
    }
    // staff bands
    for (const u of [0.42, 0.45, 0.93]) {
      const p = [lerp(r.staffB[0], r.staffT[0], u), lerp(r.staffB[1], r.staffT[1], u)];
      g.beginPath(); g.moveTo(p[0] - 9, p[1]); g.lineTo(p[0] + 9, p[1]); g.lineWidth = 4; g.stroke();
    }
    g.restore();
  }

  const bible = {
    name: 'Sauti (Ugrashravas, son of Lomaharshana)',
    role: 'The storyteller of the frame story; a Suta bard trained by Vyasa\'s disciple, who tells the epic to the sages of the Naimisha forest.',
    palette: { fill: '#0c0809', inner: '#46200f', rimDim: '#d8903e', rimBright: '#ffe2a0', ornamentDim: PAL.goldDeep, ornament: PAL.gold },
    proportions: 'Standing height 1040 units (scale 1); hip 500, thigh 252, shin 238; head ≈ 1/6.7 of the height; lean, upright. Seated hip height 150.',
    props: ['staff (danda) with a round finial and three gold bands, always in the near hand', 'kamandalu water pot (far hand; set down when that hand speaks)', 'uttariya shawl streaming behind', 'rudraksha mala', 'kundala earring', 'gold armband', 'kasavu-gold veshti borders'],
    light: 'Warm fire rim, gold: fill #0c0809, ember inner #46200f, rim #d8903e → #ffe2a0 with intensity; ornaments goldDeep → gold.',
    poses: [
      { name: 'stand' }, { name: 'walk', note: 'phase (rad) + stride 0..1' }, { name: 'sit', note: 'cross-legged, staff upright, pot in the far hand' },
      { name: 'speak', note: 'far hand opens toward the listener (k = how far); pot set down; base stand|sit' },
      { name: 'bless', note: 'far hand raised, abhaya; base stand|sit' }, { name: 'bow', note: 'k = bow depth' },
    ],
    voice: 'sauti',   // the speaker key in script/cast.json (voice id, speed, pitch)
  };

  CH.define({
    id: 'sauti', bible, rig, shape, ornaments,
    rule: {
      fill: '#0c0809', lit: '#6a3a22', litGain: 0.8,
      rim: ['#d8903e', '#ffe2a0'], inner: '#46200f', innerA: 0.88, glow: 0.8,
      ornament: [PAL.goldDeep, PAL.gold], ornamentA: [0.45, 0.8],
    },
    bounds: (P, r) => [-400, -1220, 260, 20],
  });
  CH.ROSTER.push('sauti');
})();
