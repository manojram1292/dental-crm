/*
 * CHARACTER · SHAMIKA, the silent sage · `shamika`
 *
 * Episode 7 (CE 1.36–38): a sage under a vow of silence (mauna), living among the
 * cows. Asked by the hunting King Parikshit where a wounded deer went, he says
 * nothing; the king lays a dead snake on his shoulder and he bears it without a word.
 * When his son Shringin curses the king, Shamika grieves at the curse and sends his
 * disciple to warn the king.
 *
 * A sage in the prime of age, still as a stone: a long beard falling to the chest,
 * a great coiled JATA bun with locks down the back, the three ash lines (tripundra)
 * on the brow, EYES CLOSED (a closed lid line, always, unless expression.look < −0.2
 * opens them in grief), a long rudraksha MALA wound twice round the near wrist, a
 * BARK SHAWL (valkala) over the far shoulder, a white loincloth; lean, a little
 * stooped. Seated cross-legged in meditation (dhyana mudra: the hands one in the
 * other in his lap) is his rest pose.
 *
 * SIGNATURE LIGHT: twilight lilac, the colour of stillness. Fill #0e0a12, inner
 * #2e2440, rim #9a84c0 → #f0e6ff (rim ×0.95, glow 0.7), ornaments #a898c0 → #f4eeff
 * (0.35–0.7). Never Vyasa's gold, the elder's ivory or the Pitrs' silver-blue.
 *
 * Faces LEFT natively. Feet (or seat) on (x, y). scale 1 ≈ 1010 px standing.
 * Anchors: mod.anchor(opts, 'shoulderN' | 'shoulderF' | 'neck' | 'head' | 'hand').
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, CH = KIT.characters;
  const { TAU, clamp, lerp } = R;
  const { cut, limb, ik, hand, along } = CH;

  const D = { hip: 480, thigh: 242, shin: 228, foot: 70, sitHip: 145 };
  const PIV = -480, UP = 164, FO = 150;

  function rig(P) {
    const po = P.po, k = po.k;
    const r = CH.profileRig(po, D);
    r.T = P.T; r.wind = po.wind ?? 0.4;
    r.lean = 0.06 + r.st * 0.04;
    r.look = (P.ex.look || 0) + 0.12;   // the head a little bowed: inward-turned
    r.speak = P.ex.speak || 0;
    r.open = (P.ex.look || 0) < -0.2;    // eyes open only when he lifts his head (grief)
    let nh = r.sitting ? [-110, -470] : [-20, -530], nk = r.sitting ? 'cup' : 'fist', na = r.sitting ? 0 : Math.PI / 2;
    let fh = r.sitting ? [-70, -476] : [40, -540], fk = r.sitting ? 'cup' : 'fist', fa = r.sitting ? 0 : Math.PI / 2;
    if (po.name === 'grieve') {
      // the head sinks, the near hand rises to the brow
      r.lean += 0.14 * k; r.look += 0.2 * k;
      nh = along(nh, [-90, -800], k); nk = 'open'; na = -Math.PI / 2 - 0.9;
    }
    if (po.name === 'bless') { nh = along(nh, [-170, -820], k); nk = 'abhaya'; na = -Math.PI / 2 - 0.1; }
    if (po.name === 'send') { nh = along(nh, [-300, -700], k); nk = 'point'; na = Math.PI + 0.3; }
    r.hand = nh; r.nearKind = nk; r.nearA = na; r.farHand = fh; r.farKind = fk; r.farA = fa;
    const c = Math.cos(-r.lean), s = Math.sin(-r.lean);
    r.rot = (p) => [p[0] * c - (p[1] - PIV) * s, p[0] * s + (p[1] - PIV) * c + PIV];
    r.shN = r.rot([4, -760]); r.shF = r.rot([28, -764]);
    return r;
  }

  function headPath(g, r) {
    g.save();
    g.translate(6, -796);
    g.rotate(r.look);
    // face and long beard
    g.moveTo(30, 8);
    g.bezierCurveTo(40, -24, 50, -62, 46, -96);
    g.bezierCurveTo(42, -128, 22, -142, -6, -142);
    g.bezierCurveTo(-34, -140, -48, -122, -50, -104);
    g.lineTo(-48, -92);
    g.bezierCurveTo(-54, -84, -62, -74, -66, -64);
    g.lineTo(-55, -60); g.lineTo(-60, -54); g.lineTo(-55, -48);
    g.bezierCurveTo(-64, -30, -70, 10, -66, 60);
    g.bezierCurveTo(-62, 110, -50, 150, -38, 180);
    g.bezierCurveTo(-24, 150, -6, 90, 6, 40);
    g.bezierCurveTo(12, 24, 20, 14, 30, 8);
    g.closePath(); cut(g);
    // the jata: a great coiled bun at the crown, locks down the back
    g.moveTo(-36, -120); g.bezierCurveTo(-40, -190, 40, -220, 60, -170); g.bezierCurveTo(78, -130, 52, -110, 30, -116); g.closePath(); cut(g);
    g.moveTo(-10, -186); g.ellipse(4, -200, 34, 24, -0.2, 0, TAU); cut(g);
    const sw = Math.sin(r.T * 1.7) * 4 * r.wind;
    g.moveTo(44, -120); g.bezierCurveTo(80, -80, 86, 20, 92 + sw, 140); g.bezierCurveTo(70, 120, 60, 40, 40, -40); g.closePath(); cut(g);
    if (r.speak > 0.02) {
      g.save(); g.globalCompositeOperation = 'destination-out';
      const o = 4 * r.speak;
      g.moveTo(-34, -36); g.lineTo(-58, -38 - o); g.lineTo(-58, -32 + o * 0.6); g.closePath(); cut(g);
      g.restore();
    }
    g.restore();
  }

  function torsoPath(g) {
    CH.torso(g, { waistY: -470, neckY: -790, chestY: -680, front: -44, back: 56, waistF: -32, waistB: 46, neckF: -4, neckB: 28, pec: 4, lat: 8 });
  }

  function shawlPath(g, r) {
    // bark-cloth shawl over the far shoulder, hanging down the back in stiff folds
    const sw = Math.sin(r.T * 1.9) * 5 * r.wind;
    g.moveTo(-16, -782);
    g.bezierCurveTo(30, -804, 70, -790, 78, -750);
    g.lineTo(96 + sw, -520); g.lineTo(84 + sw, -500); g.lineTo(70 + sw, -520); g.lineTo(56 + sw, -498); g.lineTo(44, -520);
    g.bezierCurveTo(40, -620, 20, -700, -24, -750);
    g.closePath(); cut(g);
  }

  function loinPath(g, r) {
    if (r.sitting) { CH.lowerCloth(g, r, { waistY: -150, waistF: -36, waistB: 50 }); return; }
    CH.lowerCloth(g, r, { waistY: -480, waistF: -36, waistB: 48, len: 'knee', flare: 1.0, pleats: false, T: r.T, wind: r.wind });
  }

  function armsPath(g, r, near) {
    const sh = near ? r.shN : r.shF, tgt = near ? r.hand : r.farHand;
    const el = ik(sh, tgt, UP, FO, near ? -1 : 1);
    limb(g, [sh, el, tgt], near ? [50, 34, 26] : [48, 32, 24]);
    hand(g, tgt, near ? r.nearA : r.farA, 34, near ? r.nearKind : r.farKind);
  }

  function upperT(g, r) { g.translate(0, PIV); g.rotate(-r.lean); g.translate(0, -PIV); }

  function shape(g, color, P, r) {
    g.translate(0, r.bob);
    g.fillStyle = color;
    g.save(); g.translate(0, r.drop);
    g.beginPath(); armsPath(g, r, false); g.fill();
    g.restore();
    g.beginPath(); CH.legs(g, r, [64, 40, 22]); g.fill();
    g.beginPath(); loinPath(g, r); g.fill();
    g.save(); g.translate(0, r.drop);
    g.save(); upperT(g, r);
    g.beginPath(); torsoPath(g); g.fill();
    g.beginPath(); shawlPath(g, r); g.fill();
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
    // sacred thread; the long mala
    g.beginPath(); g.moveTo(24, -776); g.quadraticCurveTo(-34, -630, -34, -478); g.lineWidth = 2.5; g.stroke();
    CH.beads(g, [-4, -784], [-60, -640], [-30, -560], 14, 4);
    // bark-cloth fibres on the shawl
    for (let i = 0; i < 2; i++) { g.beginPath(); g.moveTo(48 + i * 18, -770 + i * 6); g.lineTo(66 + i * 16, -530); g.lineWidth = 1.6; g.stroke(); }
    g.save(); g.translate(6, -796); g.rotate(r.look);
    // tripundra: three ash lines on the brow
    for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(-46, -118 + i * 7); g.lineTo(-20, -120 + i * 7); g.lineWidth = 2.4; g.stroke(); }
    // the eye: a closed lid (a down-curved line), or open in grief
    if (r.open) { g.beginPath(); g.ellipse(-34, -88, 7, 3, 0.1, 0, TAU); g.fill(); }
    else { g.beginPath(); g.moveTo(-42, -88); g.quadraticCurveTo(-34, -82, -26, -88); g.lineWidth = 2.6; g.stroke(); }
    // beard strands
    g.beginPath(); g.moveTo(-44, -30); g.quadraticCurveTo(-50, 60, -36, 150); g.lineWidth = 1.5; g.stroke();
    g.restore();
    g.restore();
    // mala wound round the near wrist
    g.beginPath(); g.arc(r.hand[0], r.hand[1], 22, 0, TAU); g.lineWidth = 3; g.setLineDash([3, 4]); g.stroke(); g.setLineDash([]);
    g.restore();
  }

  function scr(P, r, p) { const sx = P.flip ? -P.s : P.s; return [P.x + p[0] * sx, P.y + (p[1] + r.bob + r.drop) * P.s]; }

  const bible = {
    name: 'Shamika, the silent sage',
    role: 'A sage under a vow of silence. Parikshit lays a dead snake on his shoulder; he bears it without a word, grieves at his son\'s curse and warns the king (CE 1.36–38).',
    palette: { fill: '#0e0a12', inner: '#2e2440', rimDim: '#9a84c0', rimBright: '#f0e6ff', ornamentDim: '#a898c0', ornament: '#f4eeff' },
    proportions: '≈ 1010 units standing: hip 480, thigh 242, shin 228; lean, a little stooped (0.06 rad); beard ≈ 220 long; jata bun ≈ 110 high. Seated hip 145.',
    props: ['great coiled jata bun, locks down the back', 'long beard', 'tripundra (three ash lines) on the brow', 'eyes closed', 'long rudraksha mala, wound round the near wrist', 'bark-cloth shawl over the far shoulder', 'white loincloth'],
    light: 'Twilight lilac, the colour of stillness: fill #0e0a12, inner #2e2440, rim #9a84c0 → #f0e6ff; ornaments #a898c0 → #f4eeff (0.35–0.7).',
    poses: [
      { name: 'sit', note: 'meditation, hands in dhyana mudra (his rest pose)' }, { name: 'stand' }, { name: 'walk' },
      { name: 'grieve', note: 'k: head sinks, near hand to the brow' }, { name: 'send', note: 'k: points the way (sends his disciple)' }, { name: 'bless', note: 'k' },
    ],
    voice: 'shamika',
  };

  const mod = CH.define({
    id: 'shamika', bible, rig, shape, ornaments, defaultPose: 'sit',
    rule: {
      fill: '#0e0a12', lit: '#2a2234', litGain: 0.8, rimW: 0.95,
      rim: ['#9a84c0', '#f0e6ff'], inner: '#2e2440', innerA: [0.85, 0.4], glow: 0.7,
      ornament: ['#a898c0', '#f4eeff'], ornamentA: [0.35, 0.7],
    },
    bounds: () => [-460, -1240, 420, 30],
  });
  mod.anchor = (opts, name) => {
    const P = CH.resolve(opts, mod._def), r = rig(P);
    if (name === 'shoulderN') return scr(P, r, r.shN);
    if (name === 'shoulderF') return scr(P, r, r.shF);
    if (name === 'neck') return scr(P, r, r.rot([10, -790]));
    if (name === 'head') return scr(P, r, r.rot([0, -880]));
    return scr(P, r, r.hand);
  };
  CH.ROSTER.push('shamika');
  void clamp; void lerp;
})();
