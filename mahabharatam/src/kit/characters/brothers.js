/*
 * CHARACTERS · THE CURSED BROTHERS · SUPRATIKA the elephant · `supratika` and VIBHAVASU the tortoise · `vibhavasu`
 *
 * Episodes 22–24 (CE 1.25–26): Kashyapa tells Garuda of two brothers, the wrathful sage Vibhavasu and his
 * younger brother Supratika, who wanted their inheritance divided. Vibhavasu cursed Supratika to become an
 * elephant; Supratika cursed him back to become a tortoise. Still enemies, they fight on in a lake: the
 * elephant six yojanas high and twice as long, the tortoise three yojanas high and ten round. Garuda seizes
 * one in each set of talons and carries them off to eat.
 *
 * SUPRATIKA, the elephant (faces LEFT): a vast war-elephant of the murals, high domed head with a fold above
 * the eye, a trunk that curls and swings (pose.trunk −1..1, phase), long tusks, fan ears that flap, pillar legs
 * that walk (pose.phase), a short tail; mural rope bands on the body (no howdah: he is a cursed sage, not a mount).
 *   SIGNATURE LIGHT: monsoon slate. Fill #0e0e12, lit #34343e, inner #4a4652, rim #b8b0d8 → #f2eeff,
 *   ornaments (tusks, bands) ivory #e8dcc0 → #fffaf0. Never Indra's gold.
 * VIBHAVASU, the tortoise: Akupara's body (a vast tortoise) in his own light, mud-gold and moss:
 *   fill #100c06, lit #3a3016, rim #c8b060 → #fff4c0, plates moss-green #8ab060 → #e8ffc0 (Akupara is
 *   sea-bronze with teal plates, a king; Vibhavasu is a lake animal, smaller and angrier).
 * pose.fight (0..1) rears the elephant / lifts the tortoise's head to bite. pose.seized (0..1) curls the legs
 * up (carried in Garuda's talons).
 * (x, y) = feet / belly line. Elephant scale 1 ≈ 1100 px high to the crown, ≈ 1500 long.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, CH = KIT.characters;
  const { TAU, clamp, lerp } = R;
  const { cut } = CH;

  function eRig(P) {
    const po = P.po || {};
    const T = P.T || 0, ph = po.phase ?? T * 2;
    return { T, ph, trunk: po.trunk ?? Math.sin(T * 1.3) * 0.5, fight: clamp(po.fight ?? (po.name === 'fight' ? po.k ?? 1 : 0)), seized: clamp(po.seized ?? (po.name === 'seized' ? po.k ?? 1 : 0)), walk: po.name === 'walk' ? 1 : 0, ear: Math.sin(T * 2.2) };
  }
  function legPath(g, x, y0, len, sw, w) {
    g.moveTo(x - w / 2, y0); g.lineTo(x - w / 2 + sw, y0 + len - 30); g.quadraticCurveTo(x + sw, y0 + len + 6, x + w / 2 + sw, y0 + len - 30); g.lineTo(x + w / 2, y0); cut(g);
  }
  function eShape(g, color, P, r) {
    g.fillStyle = color;
    const rear = r.fight * 0.28, up = r.seized;
    g.save(); g.translate(700, 0); g.rotate(-rear); g.translate(-700, 0);
    g.beginPath();
    // legs (far pair a little behind), lifted and curled when seized
    const legs = [[-380, 0.0], [380, Math.PI], [-300, Math.PI * 0.5], [460, Math.PI * 1.5]];
    for (const [x, o] of legs) { const sw = r.walk * 50 * Math.sin(r.ph + o); legPath(g, x, -460, lerp(460, 220, up), sw + up * 60, 170); }
    // body: a great barrel with a high back
    g.moveTo(-480, -440); g.bezierCurveTo(-520, -860, 260, -980, 600, -760); g.bezierCurveTo(700, -680, 680, -420, 560, -380);
    g.bezierCurveTo(200, -330, -200, -330, -480, -440); cut(g);
    // tail
    g.moveTo(600, -700); g.quadraticCurveTo(700, -560 + 20 * Math.sin(r.T * 2), 660, -440); g.lineTo(648, -440); g.quadraticCurveTo(680, -560, 590, -680); cut(g);
    // head: a high domed skull forward of the body
    g.moveTo(-420, -500); g.bezierCurveTo(-560, -560, -700, -760, -620, -960); g.bezierCurveTo(-560, -1100, -380, -1100, -300, -980); g.bezierCurveTo(-240, -880, -300, -700, -260, -560); cut(g);
    // the trunk: a tapering curve that swings and curls (raised when fighting)
    const tr = r.trunk + r.fight * 1.2;
    let x = -650, y = -760, a0 = Math.PI / 2 + 0.15;
    const left = [], right = [];
    for (let i = 0; i <= 14; i++) {
      const u = i / 14, w = lerp(70, 18, u), a = a0 - tr * u * 2.2;
      x += Math.cos(a) * 46; y += Math.sin(a) * 46;
      left.push([x + Math.cos(a + Math.PI / 2) * w / 2, y + Math.sin(a + Math.PI / 2) * w / 2]);
      right.push([x - Math.cos(a + Math.PI / 2) * w / 2, y - Math.sin(a + Math.PI / 2) * w / 2]);
    }
    g.moveTo(-690, -760); for (const p of left) g.lineTo(p[0], p[1]); for (let i = right.length - 1; i >= 0; i--) g.lineTo(right[i][0], right[i][1]); g.lineTo(-600, -760); cut(g);
    // ear: a great fan behind the head
    const ea = 0.15 * r.ear;
    g.moveTo(-360, -940); g.bezierCurveTo(-180 + 60 * ea, -1000, -80 + 80 * ea, -760, -150 + 40 * ea, -600); g.bezierCurveTo(-220, -540, -330, -620, -340, -700); cut(g);
    g.fill();
    g.restore();
  }
  function eOrn(g, P, r, a, color) {
    if (a <= 0.01) return;
    g.save(); g.globalAlpha *= a; g.strokeStyle = color; g.fillStyle = color; g.lineCap = 'round';
    const rear = r.fight * 0.28; g.translate(700, 0); g.rotate(-rear); g.translate(-700, 0);
    // tusks: long ivory curves from the jaw
    g.lineWidth = 26; g.beginPath(); g.moveTo(-600, -700); g.quadraticCurveTo(-760, -640 - r.fight * 120, -840, -760 - r.fight * 160); g.stroke();
    // the eye under a fold, fierce when fighting
    g.beginPath(); g.ellipse(-520, -860, 14, 8, -0.2, 0, TAU); g.fill();
    g.lineWidth = 6; g.beginPath(); g.moveTo(-560, -890); g.quadraticCurveTo(-520, -912, -470, -880); g.stroke();
    // trunk rings and body bands (painted mural ropes)
    g.lineWidth = 5; g.globalAlpha *= 0.7;
    for (const bx of [-120, 220]) { g.beginPath(); g.moveTo(bx - 40, -900); g.quadraticCurveTo(bx + 20, -620, bx - 30, -350); g.stroke(); }
    g.beginPath(); g.moveTo(-300, -950); g.bezierCurveTo(-240, -840, -260, -720, -250, -600); g.stroke();
    // the ear's veins
    for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(-330, -900 + i * 80); g.quadraticCurveTo(-230, -880 + i * 70, -170, -800 + i * 70); g.stroke(); }
    g.restore();
  }
  CH.define({
    id: 'supratika', rig: eRig, shape: eShape, ornaments: eOrn, defaultPose: 'stand',
    bible: {
      name: 'Supratika, cursed to be an elephant',
      role: 'The younger brother, cursed by Vibhavasu to become an elephant; still fighting his brother in a lake when Garuda seizes them both (CE 1.25–26).',
      palette: { fill: '#0e0e12', lit: '#34343e', inner: '#4a4652', rimDim: '#b8b0d8', rimBright: '#f2eeff', ornamentDim: '#e8dcc0', ornament: '#fffaf0' },
      proportions: '≈ 1100 units to the crown, ≈ 1500 long (the epic: six yojanas high, twice as long).',
      props: ['long ivory tusks', 'a swinging trunk', 'fan ears', 'painted rope bands (no howdah)'],
      light: 'Monsoon slate: rim #b8b0d8 → #f2eeff, ivory tusks.',
      poses: [{ name: 'stand' }, { name: 'walk', note: 'phase' }, { name: 'fight', note: 'pose.fight 0..1 rears him, trunk up, tusks forward' }, { name: 'seized', note: 'pose.seized 0..1: legs curled, carried' }],
      voice: null,
    },
    rule: { fill: '#0e0e12', lit: '#34343e', litGain: 0.9, rim: ['#b8b0d8', '#f2eeff'], inner: '#4a4652', innerA: [0.85, 0.45], glow: 0.6, rimW: 1.3, ornament: ['#e8dcc0', '#fffaf0'], ornamentA: [0.6, 0.95] },
    bounds: () => [-1000, -1250, 800, 40],
  });
  CH.ROSTER.push('supratika');

  // Vibhavasu: Akupara's tortoise body in his own light; pose.fight lifts the head to bite
  const AK = CH.akupara._def;
  CH.define({
    id: 'vibhavasu', rig: (P) => AK.rig({ ...P, po: { ...(P.po || {}), name: (P.po && P.po.name) || 'swim', k: P.po && P.po.fight ? 1 - 0.6 * P.po.fight : (P.po && P.po.k) } }), shape: AK.shape, ornaments: AK.ornaments, defaultPose: 'swim',
    bible: {
      name: 'Vibhavasu, cursed to be a tortoise',
      role: 'The elder brother, a wrathful sage, cursed by Supratika to become a tortoise; fighting in the lake when Garuda seizes them (CE 1.25–26).',
      palette: { fill: '#100c06', lit: '#3a3016', inner: '#4a4018', rimDim: '#c8b060', rimBright: '#fff4c0', ornamentDim: '#8ab060', ornament: '#e8ffc0' },
      proportions: 'Akupara\'s tortoise body (≈ 1400 long), drawn smaller than the elephant (the epic: three yojanas high, ten round).',
      props: ['a high shell with moss-green plates'],
      light: 'Mud-gold with moss plates (Akupara is sea-bronze with teal).',
      poses: [{ name: 'swim', note: 'phase' }, { name: 'bear', note: 'k: braced (fighting, seized)' }],
      voice: null,
    },
    rule: { fill: '#100c06', lit: '#3a3016', litGain: 0.8, rim: ['#c8b060', '#fff4c0'], inner: '#4a4018', innerA: [0.85, 0.45], glow: 0.55, rimW: 1.4, ornament: ['#8ab060', '#e8ffc0'], ornamentA: [0.5, 0.85] },
    bounds: AK.bounds,
  });
  CH.ROSTER.push('vibhavasu');
})();
