/*
 * CHARACTER · SHIVA (Mahadeva, Rudra, Shankara) · `shiva`
 *
 * Episode 14 (AS TRADITION TELLS IT: the poison at the churning and Shiva holding it in his
 * throat are in the Southern manuscripts and the vulgate, not in the CE's constituted Adi
 * 1.16; see the catalog note). Recurs in the epic proper (the Kirata, Ashvatthaman's night).
 *
 * Drawn FRONTALLY and with reverence, as in temple iconography: the body pale with sacred
 * ash; a tall crown of matted locks (jata-mukuta) bound with a serpent, a crescent moon set
 * in it; a third eye on the brow; a serpent coiled round the neck; earrings; a tiger skin
 * at the waist; the TRIDENT (trishula) in the left hand, with the small drum (damaru) tied
 * below its prongs; the right hand in blessing. `drink` (k) brings both hands cupped to the
 * mouth; pose.throat (0..1) makes the throat glow deep blue (Nilakantha).
 *
 * SIGNATURE LIGHT: ash and ice. A PALE figure: fill #b8bcc8 (ash), lit #eef0f6, inner
 * #d8dce8, rim #7ad0ff → #e8faff (glacier cyan), glow 0.8; ornaments (serpent, beads, stripes) slate
 * #4a5a7a → #2a3a5a so they read on the ash; the crescent moon pure white; the throat #1a3aa8 → #3a7aff, glowing. Never the horse's silver-blue or
 * Ananta's gold rim; the only figure with a blue throat.
 *
 * facing 'front'. (x, y) = feet. scale 1 ≈ 1150 px to the top of the locks.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, CH = KIT.characters;
  const { TAU, lerp, clamp } = R;
  const { cut, limb, along, hand } = CH;

  function rig(P) {
    const po = P.po, k = po.k;
    const r = { T: P.T, k, name: po.name, throat: clamp(po.throat ?? 0) };
    r.rh = [-200, -720]; r.rKind = 'abhaya'; r.rA = -Math.PI / 2;
    r.lh = [210, -560];
    r.drink = po.name === 'drink' ? k : 0;
    if (r.drink) { r.rh = along(r.rh, [-34, -830], k); r.rKind = 'cup'; r.rA = 0; }
    if (po.name === 'stand') { r.rh = [-170, -560]; r.rKind = 'open'; r.rA = Math.PI / 2; }
    return r;
  }

  /** The tall jata: piled locks bound in coils, a few falling to the shoulders (shape and hair layer). */
  function locks(g) {
    g.moveTo(-64, -960); g.bezierCurveTo(-96, -1060, -66, -1150, 0, -1170); g.bezierCurveTo(66, -1150, 96, -1060, 64, -960);
    g.quadraticCurveTo(0, -990, -64, -960); g.closePath(); cut(g);
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { g.moveTo(s * 56, -950 + i * 4); g.quadraticCurveTo(s * (90 + i * 16), -880 + i * 30, s * (100 + i * 18), -780 + i * 20); g.lineTo(s * (84 + i * 18), -780 + i * 20); g.quadraticCurveTo(s * (74 + i * 14), -870, s * 48, -940); cut(g); }
  }

  function shape(g, color, P, r) {
    g.fillStyle = color;
    g.beginPath();
    // legs and the tiger skin
    g.moveTo(-110, -540); g.lineTo(110, -540); g.lineTo(130, -300); g.lineTo(70, -300); g.lineTo(60, -40); g.lineTo(84, 0); g.lineTo(20, 0); g.lineTo(14, -300); g.lineTo(-14, -300); g.lineTo(-20, 0); g.lineTo(-84, 0); g.lineTo(-60, -40); g.lineTo(-70, -300); g.lineTo(-130, -300); g.closePath(); cut(g);
    // torso
    g.moveTo(-100, -540); g.bezierCurveTo(-110, -620, -150, -700, -144, -790); g.quadraticCurveTo(0, -820, 144, -790); g.bezierCurveTo(150, -700, 110, -620, 100, -540); g.closePath(); cut(g);
    g.moveTo(-30, -810); g.lineTo(30, -810); g.lineTo(28, -860); g.lineTo(-28, -860); g.closePath(); cut(g);
    g.moveTo(58, -920); g.ellipse(0, -920, 58, 72, 0, 0, TAU); cut(g);
    locks(g);
    for (const s of [-1, 1]) { g.moveTo(s * 60, -900); g.arc(s * 62, -892, 14, 0, TAU); cut(g); }
    // arms
    const shR = [-136, -770], shL = [136, -770];
    limb(g, [shR, r.drink ? [-170, -640] : [-200, -650], r.rh], [58, 42, 32]);
    limb(g, [shL, [200, -650], r.lh], [58, 42, 32]);
    hand(g, r.rh, r.rA, 36, r.rKind);
    if (r.drink) { const c = along([-34, -830], [34, -830], 0.5); limb(g, [shL, [170, -640], [34, -830]], [58, 42, 32]); hand(g, [34, -830], Math.PI, 36, 'cup'); void c; }
    else hand(g, r.lh, -Math.PI / 2, 34, 'fist');
    // the trident (held in the left hand, or planted beside him while he drinks)
    const tx = r.drink ? 300 : r.lh[0], ty = r.drink ? -560 : r.lh[1];
    limb(g, [[tx, 0], [tx, ty - 620]], [16, 14]);
    const top = ty - 620;
    g.moveTo(tx - 8, top); g.lineTo(tx, top - 120); g.lineTo(tx + 8, top); g.closePath(); cut(g);
    for (const s of [-1, 1]) { g.moveTo(tx, top + 10); g.quadraticCurveTo(tx + s * 70, top, tx + s * 60, top - 90); g.lineTo(tx + s * 46, top - 70); g.quadraticCurveTo(tx + s * 50, top + 10, tx, top + 30); cut(g); }
    // the damaru tied below the prongs
    g.moveTo(tx - 30, top + 60); g.lineTo(tx + 30, top + 60); g.lineTo(tx - 30, top + 120); g.lineTo(tx + 30, top + 120); g.closePath(); cut(g);
  }

  function ornaments(g, P, r, a, color) {
    if (a <= 0.01) return;
    g.globalAlpha *= a; g.lineCap = 'round';
    // the hair, dark against the ash (so the face reads), bound with coils of a pale serpent
    g.save(); g.globalAlpha /= Math.max(0.01, a); g.fillStyle = '#23263a'; g.beginPath(); locks(g); g.restore();
    g.strokeStyle = '#c8d0e0'; g.lineWidth = 6;
    for (const y of [-1010, -1060, -1110]) { g.beginPath(); g.moveTo(-60 + (y + 1000) * -0.2, y); g.quadraticCurveTo(0, y + 14, 60 - (y + 1000) * -0.2, y); g.stroke(); }
    g.strokeStyle = color; g.fillStyle = color;
    // the face: eyes half-closed in calm, the brows, the mouth
    g.lineWidth = 4;
    for (const sx of [-1, 1]) { g.beginPath(); g.moveTo(sx * 14, -920); g.quadraticCurveTo(sx * 26, -914, sx * 38, -920); g.stroke(); g.beginPath(); g.moveTo(sx * 12, -940); g.quadraticCurveTo(sx * 26, -948, sx * 42, -940); g.stroke(); }
    g.beginPath(); g.moveTo(-12, -884); g.quadraticCurveTo(0, -878, 12, -884); g.stroke();
    // the crescent moon in the locks
    g.save(); g.fillStyle = '#ffffff'; g.shadowColor = '#e8faff'; g.shadowBlur = R.px(14 * P.s);
    g.beginPath(); g.arc(-34, -1090, 34, Math.PI * 0.6, Math.PI * 1.6); g.arc(-22, -1094, 26, Math.PI * 1.55, Math.PI * 0.65, true); g.closePath(); g.fill(); g.restore();
    // the third eye
    g.beginPath(); g.ellipse(0, -948, 5, 11, 0, 0, TAU); g.fill();
    // a serpent round the neck, its hood raised on the right shoulder
    g.lineWidth = 12; g.beginPath(); g.moveTo(-120, -800); g.quadraticCurveTo(0, -720, 110, -800); g.stroke();
    g.beginPath(); g.ellipse(118, -836, 20, 30, 0.3, 0, TAU); g.fill();
    // rudraksha strand, tiger-skin stripes
    g.lineWidth = 4; g.beginPath(); g.moveTo(-110, -790); g.quadraticCurveTo(-10, -620, 90, -540); g.stroke();
    g.lineWidth = 6; for (let i = 0; i < 6; i++) { const x = -100 + i * 40; g.beginPath(); g.moveTo(x, -500); g.quadraticCurveTo(x + 14, -440, x, -380); g.stroke(); }
    // the blue throat (Nilakantha): a band glowing from within
    if (r.throat > 0.01) {
      g.save(); g.globalAlpha = clamp(r.throat * 1.2) * a;
      g.fillStyle = R.mix('#1a3aa8', '#3a7aff', r.throat); g.shadowColor = '#3a7aff'; g.shadowBlur = R.px(26 * P.s * r.throat);
      g.beginPath(); g.ellipse(0, -836, 34, 22, 0, 0, TAU); g.fill();
      g.restore();
    }
  }

  function before(ctx, P, r, k) { KIT.glow(ctx, P.x, P.y - 760 * P.s, 950 * P.s, '#a8d8ff', 0.25 * k); }

  const bible = {
    name: 'Shiva (Mahadeva)',
    role: 'As tradition tells it, he takes the kalakuta poison at the churning and holds it in his throat: Nilakantha (vulgate/Southern recension of Adi 16; not in the CE text).',
    palette: { fill: '#b8bcc8', lit: '#eef0f6', inner: '#d8dce8', rimDim: '#7ad0ff', rimBright: '#e8faff', ornamentDim: '#4a5a7a', ornament: '#2a3a5a', throat: '#3a7aff' },
    proportions: 'Frontal, ≈ 1150 units to the top of the locks.',
    props: ['tall matted locks with a crescent moon', 'third eye', 'a serpent round the neck', 'tiger skin', 'trident with a damaru', 'the blue throat (pose.throat)'],
    light: 'Ash and ice: a PALE ash-white figure, glacier-cyan rim #7ad0ff → #e8faff, glow 0.8; the throat glows deep blue.',
    poses: [{ name: 'stand' }, { name: 'bless', note: 'k' }, { name: 'drink', note: 'k: both hands cupped to the mouth' }, { name: 'any + throat', note: '0..1: the blue throat' }],
    voice: null,
  };
  CH.define({
    id: 'shiva', bible, rig, shape, ornaments, before, defaultPose: 'bless',
    rule: { fill: '#b8bcc8', lit: '#eef0f6', litGain: 0.85, rim: ['#7ad0ff', '#e8faff'], inner: '#d8dce8', innerA: [0.5, 0.3], glow: 0.8, ornament: ['#4a5a7a', '#2a3a5a'], ornamentA: [0.75, 0.95] },
    bounds: () => [-360, -1320, 420, 30],
  });
  CH.ROSTER.push('shiva');
  void lerp;
})();
