/*
 * CHARACTER · KASHYAPA (the Prajapati), father of gods, serpents and birds · `kashyapa`
 *
 * Episode 9+ (CE 1.14): the great sage, son of Marichi, husband of Daksha's daughters.
 * Pleased with his wives Kadru and Vinata, he grants each a boon (a thousand serpent
 * sons; two sons greater than them), tells them to guard their children well, and goes
 * into the forest. (Not the healer Kashyapa whom Takshaka turned back: that is another
 * sage, told in episode 37.)
 *
 * An ancient sage of great presence: a very long beard to the waist, a TALL JATA crown
 * bound in three bands with a small round finial, locks down the back; a black-buck
 * skin (krishnajina) over the far shoulder; the sacred thread; a rudraksha mala; a tall
 * STAFF with a hanging gourd always in the FAR hand; a white lower cloth. Upright, not
 * stooped. Eyes open (he is the giver).
 *
 * SIGNATURE LIGHT: sky turquoise, the clear sky before sunrise. Fill #080e12, inner
 * #10303a, rim #40b0d8 → #e0f8ff (rim ×1.0, glow 0.85), ornaments #c8a050 → #fff0c0
 * (0.4–0.8, gold). Never Indra's electric blue, Takshaka's green or the Pitrs' silver.
 *
 * Faces LEFT natively. Feet (or seat) on (x, y). scale 1 ≈ 1100 px to the jata finial.
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
    r.lean = 0.0 + r.st * 0.04;
    r.look = (P.ex.look || 0);
    r.speak = P.ex.speak || 0;
    r.open = true;
    let nh = r.sitting ? [-110, -470] : [-20, -530], nk = r.sitting ? 'cup' : 'fist', na = r.sitting ? 0 : Math.PI / 2;
    let fh = r.sitting ? [60, -560] : [80, -600], fk = 'fist', fa = Math.PI / 2;
    if (po.name === 'grieve') {
      // the head sinks, the near hand rises to the brow
      r.lean += 0.14 * k; r.look += 0.2 * k;
      nh = along(nh, [-90, -800], k); nk = 'open'; na = -Math.PI / 2 - 0.9;
    }
    if (po.name === 'bless') { nh = along(nh, [-170, -820], k); nk = 'abhaya'; na = -Math.PI / 2 - 0.1; }
    if (po.name === 'speak') { nh = along(nh, [-250, -730], k); nk = 'open'; na = Math.PI + 0.45; }
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
    g.bezierCurveTo(-60, 160, -44, 260, -30, 320);
    g.bezierCurveTo(-14, 240, -2, 120, 6, 40);
    g.bezierCurveTo(12, 24, 20, 14, 30, 8);
    g.closePath(); cut(g);
    // the jata: a tall crown bound in three bands, a round finial
    g.moveTo(-42, -120); g.bezierCurveTo(-48, -170, -20, -230, -12, -270); g.quadraticCurveTo(10, -296, 30, -270); g.bezierCurveTo(40, -230, 64, -170, 58, -120); g.closePath(); cut(g);
    for (const [y, w] of [[-170, 50], [-215, 38]]) { g.moveTo(8 + w, y); g.ellipse(8, y, w, 14, 0, 0, TAU); cut(g); }
    g.moveTo(26, -292); g.arc(10, -292, 16, 0, TAU); cut(g);
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
    // the black-buck skin over the far shoulder, hoof-flaps behind
    const sw = Math.sin(r.T * 1.9) * 5 * r.wind;
    g.moveTo(-16, -782);
    g.bezierCurveTo(30, -804, 76, -790, 84, -740);
    g.bezierCurveTo(98, -660, 104, -580, 112 + sw, -500);
    g.lineTo(60 + sw * 0.6, -490);
    g.bezierCurveTo(54, -600, 30, -700, -24, -750);
    g.closePath(); cut(g);
    for (const [x, y] of [[112, -500], [76, -492]]) { g.moveTo(x + sw, y); g.lineTo(x + sw + 10, y + 46); g.lineTo(x + sw - 8, y + 44); g.closePath(); cut(g); }
  }

  function staffPath(g, r) {
    const f = r.farHand;
    limb(g, [[f[0] + 20, f[1] + (r.sitting ? 225 : 600)], [f[0] - 14, f[1] - 520]], [14, 12]);
    g.moveTo(f[0] - 14 + 26, f[1] - 470); g.ellipse(f[0] - 14, f[1] - 470, 24, 34, 0, 0, TAU); cut(g);
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
    g.beginPath(); staffPath(g, r); g.fill();
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
    for (const [x, y] of [[60, -720], [80, -640], [94, -570]]) { g.beginPath(); g.arc(x, y, 5, 0, TAU); g.fill(); }
    g.save(); g.translate(6, -796); g.rotate(r.look);
    for (const [y, w] of [[-150, 50], [-195, 44], [-240, 28]]) { g.beginPath(); g.moveTo(8 - w, y); g.quadraticCurveTo(8, y + 8, 8 + w, y); g.lineWidth = 4; g.stroke(); }
    // tripundra: three ash lines on the brow
    for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(-46, -118 + i * 7); g.lineTo(-20, -120 + i * 7); g.lineWidth = 2.4; g.stroke(); }
    // the eye: a closed lid (a down-curved line), or open in grief
    if (r.open) { g.beginPath(); g.ellipse(-34, -88, 7, 3, 0.1, 0, TAU); g.fill(); }
    else { g.beginPath(); g.moveTo(-42, -88); g.quadraticCurveTo(-34, -82, -26, -88); g.lineWidth = 2.6; g.stroke(); }
    // beard strands
    g.beginPath(); g.moveTo(-44, -30); g.quadraticCurveTo(-50, 120, -32, 280); g.lineWidth = 1.5; g.stroke();
    g.restore();
    g.restore();
    // mala wound round the near wrist
    g.beginPath(); g.arc(r.hand[0], r.hand[1], 22, 0, TAU); g.lineWidth = 3; g.setLineDash([3, 4]); g.stroke(); g.setLineDash([]);
    g.restore();
  }

  function scr(P, r, p) { const sx = P.flip ? -P.s : P.s; return [P.x + p[0] * sx, P.y + (p[1] + r.bob + r.drop) * P.s]; }

  const bible = {
    name: 'Kashyapa (the Prajapati)',
    role: 'The great sage, husband of Daksha\'s daughters: he grants Kadru a thousand serpent sons and Vinata two greater sons, and goes into the forest (CE 1.14).',
    palette: { fill: '#080e12', inner: '#10303a', rimDim: '#40b0d8', rimBright: '#e0f8ff', ornamentDim: '#c8a050', ornament: '#fff0c0' },
    proportions: '≈ 1010 units to the brow, ≈ 1100 to the jata finial: hip 480, thigh 242, shin 228; upright. Beard ≈ 320 (to the waist).',
    props: ['tall jata crown in three bands, a round finial', 'very long beard', 'tripundra on the brow', 'black-buck skin over the far shoulder, hoof-flaps', 'sacred thread, rudraksha mala', 'tall staff with a hanging gourd, always in the FAR hand', 'white lower cloth'],
    light: 'Sky turquoise (before sunrise): fill #080e12, inner #10303a, rim #40b0d8 → #e0f8ff; ornaments gold #c8a050 → #fff0c0 (0.4–0.8).',
    poses: [{ name: 'sit' }, { name: 'stand' }, { name: 'walk' }, { name: 'speak', note: 'k' }, { name: 'bless', note: 'k: abhaya, the boon' }, { name: 'grieve', note: 'k' }],
    voice: 'kashyapa',
  };

  const mod = CH.define({
    id: 'kashyapa', bible, rig, shape, ornaments, defaultPose: 'sit',
    rule: {
      fill: '#080e12', lit: '#4a7080', litGain: 0.8,
      rim: ['#40b0d8', '#e0f8ff'], inner: '#10303a', innerA: [0.85, 0.4], glow: 0.85,
      ornament: ['#c8a050', '#fff0c0'], ornamentA: [0.4, 0.8],
    },
    bounds: () => [-480, -1340, 460, 30],
  });
  mod.anchor = (opts, name) => {
    const P = CH.resolve(opts, mod._def), r = rig(P);
    if (name === 'head') return scr(P, r, r.rot([0, -880]));
    return scr(P, r, r.hand);
  };
  CH.ROSTER.push('kashyapa');
  void clamp; void lerp;
})();
