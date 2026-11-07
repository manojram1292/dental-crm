/*
 * CHARACTERS · THE ASTIKA ARC (episodes 31–40; CE Adi 1.32–53). Built on shared bodies with fixed variations (SERIES.md:
 * the epic names many people who appear in one arc), each in its OWN light. Every rule has a lit fill light enough that
 * the face reads on bright grounds (the eps 21–30 weakness):
 *
 *   elapatra   ELAPATRA, the young serpent who heard Brahma (1.34): the naga body, one hood, slender; SILVER-TEAL.
 *   nagini     JARATKARU, Vasuki's sister, the sage's bride (1.35–44): Kadru's figure (CH.female, a small serpent
 *              diadem, the sari) in her brother's LAPIS-VIOLET with ROSE jewels. Poses as Kadru (stand · walk · sit ·
 *              speak · point · cradle).
 *   jaratkaru  JARATKARU the ascetic (1.13, 1.41–44): Shamika's hermit body (sit · stand · walk · grieve · send · bless),
 *              gaunt, in ASH-GREY and ember: the man who "dried up his body" (jarat-karu).
 *   astika     ASTIKA, their son (1.44–53): Shringin's young body (stand · walk · run · sit · speak · point), scaled small
 *              by the scene; DAWN-GOLD with LAPIS ornaments (the brahmin father, the serpent mother).
 *   chyavana   CHYAVANA, son of Bhrigu, Astika's teacher (1.44): the elder sage's body; EMBER-RED (he was born blazing).
 *   healer     KASHYAPA THE HEALER, who could cure Takshaka's bite (1.38–39, 1.46): the young bard's body with the sacred
 *              thread and a pouch of herbs; LEAF-GREEN and ivory. Not Kashyapa the Prajapati (kashyapa.js).
 *   woodman    THE WITNESS IN THE TREE, who gathered wood (1.46): the young man's body of `uttanka` with a bundle of
 *              sticks on his back; EARTH-BROWN and straw.
 * Face LEFT. (x, y) = feet. scale 1 ≈ 1000 px.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, CH = KIT.characters;
  const { TAU } = R;
  const N = CH.naga._def, K = CH.kadru._def, SH = CH.shamika._def, SR = CH.shringin._def, EL = CH.elder._def, VA = CH.vaishampayana._def, U = CH.uttanka._def;
  const bible = (name, role, palette, proportions, props, light, poses, voice) => ({ name, role, palette, proportions, props, light, poses, voice });

  CH.define({
    id: 'elapatra', rig: (P) => { const r = N.rig({ ...P, index: 0 }); r.w = P.po.w || 64; r.w0 = r.w; return r; }, shape: N.shape, ornaments: N.ornaments, after: N.after, bounds: N.bounds, defaultPose: 'rise',
    bible: bible('Elapatra, the young serpent', 'At Vasuki\'s council he recalls what he heard from his mother\'s lap: Brahma\'s word that Astika will save the good serpents (CE 1.34).',
      { fill: '#081416', lit: '#3a7078', inner: '#1a4a50', rimDim: '#7ad8d8', rimBright: '#f0ffff', ornamentDim: '#c0d8d8', ornament: '#ffffff' },
      'The naga body, slender (≈ 64 units), one hood.', ['one hood', 'silver belly plates'], 'Silver-teal: rim #7ad8d8 → #f0ffff; never Takshaka\'s green.', [{ name: 'rise' }, { name: 'coil' }], 'elapatra'),
    rule: { fill: '#081416', lit: '#3a7078', litGain: 0.85, rim: ['#7ad8d8', '#f0ffff'], inner: '#1a4a50', innerA: [0.8, 0.4], glow: 0.8, ornament: ['#c0d8d8', '#ffffff'], ornamentA: [0.55, 0.95] },
  });

  CH.define({
    id: 'nagini', rig: (P) => { const r = K.rig(P); if (P.po.name === 'stand' || !P.po.name) { r.hand = [-60, -430]; r.farHand = [-40, -436]; r.nearA = 0.9; r.farA = 0.8; } return r; }, shape: K.shape, ornaments: K.ornaments, defaultPose: 'stand',
    after: (ctx, P, r, k) => { const sx = P.flip ? -P.s : P.s, e = r.rot([6 - 30, -770 - 84]); KIT.glow(ctx, P.x + e[0] * sx, P.y + (e[1] + r.bob + r.drop) * P.s, 26 * P.s, '#ff6a9a', 0.45 * k); },
    bible: bible('Jaratkaru, Vasuki\'s sister', 'Given in marriage to the sage of the same name on his conditions; she wakes him for the evening rite and he leaves her; mother of Astika (CE 1.35–44, 1.49).',
      { fill: '#0c0820', lit: '#5a4a8a', inner: '#2c2060', rimDim: '#a890ff', rimBright: '#fff0fa', ornamentDim: '#ff7aa0', ornament: '#ffe0ec' },
      'CH.female (Kadru\'s figure) ≈ 1040 units to the diadem.', ['a small serpent diadem', 'sari, the pallu down her back', 'rose jewels'], 'Lapis-violet like her brother, rose jewels; a rose glint in the eye.',
      [{ name: 'stand' }, { name: 'walk' }, { name: 'sit' }, { name: 'speak', note: 'k' }, { name: 'point', note: 'k' }, { name: 'cradle', note: 'k' }], 'nagini'),
    rule: { fill: '#0c0820', lit: '#5a4a8a', litGain: 0.85, rim: ['#a890ff', '#fff0fa'], inner: '#2c2060', innerA: [0.8, 0.4], glow: 0.8, ornament: ['#ff7aa0', '#ffe0ec'], ornamentA: [0.55, 0.95] },
    bounds: K.bounds,
  });

  CH.define({
    id: 'jaratkaru', rig: SH.rig, shape: SH.shape, ornaments: SH.ornaments, defaultPose: 'stand',
    before: (ctx, P, r, k) => KIT.glow(ctx, P.x, P.y - 700 * P.s, 380 * P.s, '#ff9a50', 0.18 * k),
    bible: bible('Jaratkaru, the wandering ascetic', 'A celibate sage who lives on air and sleeps where night finds him; he finds his ancestors hanging in a pit and agrees to marry, on conditions (CE 1.13, 1.41–44).',
      { fill: '#121010', lit: '#847868', inner: '#3a3430', rimDim: '#c8bca8', rimBright: '#fff8ec', ornamentDim: '#d89a50', ornament: '#ffe0b0' },
      'Shamika\'s hermit body (≈ 1240 units), gaunt.', ['matted hair', 'bark cloth', 'a staff'], 'Ash-grey with an ember glow: rim #c8bca8 → #fff8ec.',
      [{ name: 'sit' }, { name: 'stand' }, { name: 'walk' }, { name: 'grieve', note: 'k' }, { name: 'send', note: 'k' }, { name: 'bless', note: 'k' }], 'jaratkaru'),
    rule: { fill: '#121010', lit: '#847868', litGain: 0.85, rim: ['#c8bca8', '#fff8ec'], inner: '#3a3430', innerA: [0.8, 0.4], glow: 0.7, ornament: ['#d89a50', '#ffe0b0'], ornamentA: [0.5, 0.9] },
    bounds: () => [-460, -1240, 420, 30],
  });

  CH.define({
    id: 'astika', rig: SR.rig, shape: SR.shape, ornaments: SR.ornaments, defaultPose: 'stand',
    before: (ctx, P, r, k) => KIT.glow(ctx, P.x, P.y - 600 * P.s, 520 * P.s, '#ffd890', 0.28 * k),
    bible: bible('Astika, son of Jaratkaru', 'Born of the sage and Vasuki\'s sister, taught by Chyavana; he walks into Janamejaya\'s sacrifice, praises it, and asks for its end as his boon (CE 1.44–53).',
      { fill: '#140c04', lit: '#8a6a3a', inner: '#5a3a14', rimDim: '#ffd890', rimBright: '#fffbe8', ornamentDim: '#7a8aff', ornament: '#e0e4ff' },
      'Shringin\'s young body (≈ 1220 units), drawn at a boy\'s scale.', ['a boy\'s top-knot', 'the sacred thread', 'lapis beads'], 'Dawn-gold with lapis ornaments: his father\'s fire, his mother\'s jewels.',
      [{ name: 'stand' }, { name: 'walk' }, { name: 'run' }, { name: 'sit' }, { name: 'speak', note: 'k' }, { name: 'point', note: 'k' }], 'astika'),
    rule: { fill: '#140c04', lit: '#c89a5a', litGain: 0.9, rim: ['#ffd890', '#fffbe8'], inner: '#5a3a14', innerA: [0.8, 0.4], glow: 0.9, ornament: ['#7a8aff', '#e0e4ff'], ornamentA: [0.55, 0.95] },
    bounds: () => [-520, -1220, 440, 30],
  });

  CH.define({
    id: 'chyavana', rig: EL.rig, shape: EL.shape, ornaments: EL.ornaments, defaultPose: 'sit',
    before: (ctx, P, r, k) => KIT.glow(ctx, P.x, P.y - 650 * P.s, 460 * P.s, '#ff6a2a', 0.3 * k),
    bible: bible('Chyavana, son of Bhrigu', 'Astika\'s teacher of the Vedas (CE 1.44).', { fill: '#140604', lit: '#7a3a24', inner: '#5a1a08', rimDim: '#ff7a3a', rimBright: '#ffe0b0', ornamentDim: '#e8a050', ornament: '#fff0c0' },
      'The elder sage\'s body (≈ 1200 units).', ['long beard', 'top-knot'], 'Ember-red: he was born blazing.', [{ name: 'sit' }, { name: 'speak', note: 'k' }, { name: 'bless', note: 'k' }], null),
    rule: { fill: '#140604', lit: '#7a3a24', litGain: 0.85, rim: ['#ff7a3a', '#ffe0b0'], inner: '#5a1a08', innerA: [0.8, 0.4], glow: 0.9, ornament: ['#e8a050', '#fff0c0'], ornamentA: [0.5, 0.9] },
    bounds: () => [-460, -1200, 240, 20],
  });

  CH.define({
    id: 'healer', rig: VA.rig, shape: VA.shape, defaultPose: 'walk',
    ornaments: (g, P, r, a, color) => {
      VA.ornaments(g, P, r, a, color);
      g.save(); g.globalAlpha *= a; g.strokeStyle = color; g.fillStyle = color; g.lineWidth = 3;
      g.beginPath(); g.moveTo(26, -786); g.quadraticCurveTo(-36, -640, -36, -488); g.stroke();       // the sacred thread
      g.beginPath(); g.moveTo(40, -700); g.quadraticCurveTo(70, -560, 60, -470); g.stroke();          // the pouch strap
      g.beginPath(); g.ellipse(58, -450, 34, 40, 0, 0, TAU); g.fill();                                 // the pouch of herbs
      for (let i = 0; i < 3; i++) { g.beginPath(); g.ellipse(46 + i * 12, -496 - i * 6, 6, 16, -0.4 + i * 0.4, 0, TAU); g.fill(); }   // leaves
      g.restore();
    },
    bible: bible('Kashyapa the healer', 'A brahmin who could cure any poison; he set out to save Parikshit, met Takshaka on the road, revived the banyan the serpent burned, and took Takshaka\'s wealth to turn back (CE 1.38–39, 1.46).',
      { fill: '#081008', lit: '#4a7040', inner: '#1a3a14', rimDim: '#a8e090', rimBright: '#f4ffe8', ornamentDim: '#e8e0b0', ornament: '#ffffff' },
      'The young bard\'s body (≈ 1200 units) with the sacred thread and a pouch of herbs.', ['sacred thread', 'pouch of herbs with leaves'], 'Leaf-green and ivory: a healer\'s light.',
      [{ name: 'stand' }, { name: 'walk' }, { name: 'speak', note: 'k' }, { name: 'receive', note: 'k' }, { name: 'bless', note: 'k' }, { name: 'bow', note: 'k' }], 'healer'),
    rule: { fill: '#081008', lit: '#4a7040', litGain: 0.85, rim: ['#a8e090', '#f4ffe8'], inner: '#1a3a14', innerA: [0.8, 0.4], glow: 0.8, ornament: ['#e8e0b0', '#ffffff'], ornamentA: [0.55, 0.95] },
    bounds: () => [-380, -1200, 300, 20],
  });

  CH.define({
    id: 'woodman', rig: U.rig, defaultPose: 'stand',
    shape: (g, color, P, r) => {
      U.shape(g, color, P, r);
      g.save(); g.translate(0, (r.bob || 0) + (r.drop || 0)); g.fillStyle = color;
      g.beginPath(); g.moveTo(40, -880); g.lineTo(150, -900); g.lineTo(170, -520); g.lineTo(60, -500); g.closePath(); g.fill();   // the bundle of sticks
      g.restore();
    },
    ornaments: (g, P, r, a, color) => {
      U.ornaments(g, P, r, a, color);
      g.save(); g.translate(0, (r.bob || 0) + (r.drop || 0)); g.globalAlpha *= a; g.strokeStyle = color; g.lineWidth = 3;
      for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(48 + i * 20, -890 + i * 3); g.lineTo(66 + i * 18, -505); g.stroke(); }
      g.beginPath(); g.moveTo(40, -700); g.lineTo(165, -712); g.stroke();
      g.restore();
    },
    bible: bible('The witness in the tree', 'A man who had climbed the banyan for dry wood; he burned to ash with it when Takshaka bit it, came back to life with it when Kashyapa healed it, and told what he saw (CE 1.46).',
      { fill: '#120c06', lit: '#6a5232', inner: '#3a2a14', rimDim: '#d8b878', rimBright: '#fff4d8', ornamentDim: '#c8a868', ornament: '#fff0c8' },
      'The young man\'s body (≈ 1000 units) with a bundle of sticks.', ['bundle of dry sticks', 'rope'], 'Earth-brown and straw.', [{ name: 'stand' }, { name: 'walk' }, { name: 'crouch', note: 'k' }, { name: 'point', note: 'k' }], null),
    rule: { fill: '#120c06', lit: '#6a5232', litGain: 0.85, rim: ['#d8b878', '#fff4d8'], inner: '#3a2a14', innerA: [0.8, 0.4], glow: 0.7, ornament: ['#c8a868', '#fff0c8'], ornamentA: [0.5, 0.9] },
    bounds: () => [-560, -1360, 460, 30],
  });

  CH.ROSTER.push('elapatra', 'nagini', 'jaratkaru', 'astika', 'chyavana', 'healer', 'woodman');
})();
