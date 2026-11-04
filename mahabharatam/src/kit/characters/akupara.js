/*
 * CHARACTERS · AKUPARA, king of the tortoises · `akupara` and THE OCEAN (Samudra) · `samudra`
 *
 * AKUPARA (episodes 12–14; CE 1.16): asked by the gods, the king of tortoises (kurma-raja
 * Akupara) agrees to bear Mount Mandara on his back, and Indra sets the mountain on him.
 * In the epic he is the tortoise king himself, not (as in the Puranas) an avatar of Vishnu,
 * so he is drawn as a great ancient animal, not a god.
 *   A vast sea-tortoise in profile (faces LEFT): a high-domed shell patterned with mural
 *   hexagon plates and a gold rim, a scaled head on a long neck reaching forward, beak and
 *   a calm, ancient eye, four broad flippers that row slowly (pose.phase). `bear` (k) braces
 *   the flippers and lowers the head under a weight.
 *   SIGNATURE LIGHT: sea-bronze. Fill #120e08, lit #3a2c18, inner #4a3818, rim #e0b070 →
 *   #fff0d0, glow 0.6, shell plates #5ad0b0 → #d8fff0 (teal, the colour of deep water on
 *   bronze). Never Takshaka's green rim.
 *   (x, y) = the belly line. scale 1 ≈ 1400 px long, the shell ≈ 560 high.
 *
 * SAMUDRA, the Ocean (episode 12; CE 1.16): the ocean, lord of the waters, agrees to be
 * churned if he too gets a share of the amrita. Drawn frontally, rising waist-deep from the
 * waves: a crowned king of the waters, his hair and beard falling as waves, a jewelled
 * collar, his hands holding up pearls and coral, a canopy of a breaking wave behind him.
 *   SIGNATURE LIGHT: aquamarine. Fill #06141a, lit #134048, inner #1a5a66, rim #6ae0e8 →
 *   #eaffff, glow 0.85, ornaments (pearl, coral) #fff6e8 → #ffffff.
 *   facing 'front'. (x, y) = the waterline at his waist. scale 1 ≈ 700 px above the water.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, CH = KIT.characters;
  const { TAU, lerp, clamp } = R;
  const { cut, limb } = CH;

  // ─── Akupara ────────────────────────────────────────────────────────────────
  function rigA(P) {
    const po = P.po;
    return { T: P.T, ph: po.phase ?? P.T * 1.2, bear: po.name === 'bear' ? po.k : 0, look: P.ex.look || 0 };
  }
  function flipper(g, root, ang, len, w) {
    const tip = [root[0] + Math.cos(ang) * len, root[1] + Math.sin(ang) * len];
    const n = [-Math.sin(ang), Math.cos(ang)];
    g.moveTo(root[0] + n[0] * w * 0.5, root[1] + n[1] * w * 0.5);
    g.quadraticCurveTo(root[0] + Math.cos(ang) * len * 0.5 + n[0] * w, root[1] + Math.sin(ang) * len * 0.5 + n[1] * w, tip[0], tip[1]);
    g.quadraticCurveTo(root[0] + Math.cos(ang) * len * 0.4 - n[0] * w * 0.3, root[1] + Math.sin(ang) * len * 0.4 - n[1] * w * 0.3, root[0] - n[0] * w * 0.5, root[1] - n[1] * w * 0.5);
    g.closePath(); cut(g);
  }
  function shapeA(g, color, P, r) {
    g.fillStyle = color;
    const sw = Math.sin(r.ph) * (0.35 - 0.25 * r.bear), sw2 = Math.sin(r.ph + Math.PI) * (0.35 - 0.25 * r.bear);
    g.beginPath();
    // far flippers
    flipper(g, [-300, -110], Math.PI * 0.82 + sw2, 380, 120);
    flipper(g, [380, -80], Math.PI * 0.12 + sw2 * 0.6, 240, 90);
    // the shell: a high dome with a scalloped rim
    g.moveTo(-560, -120);
    g.bezierCurveTo(-540, -520, 520, -560, 600, -120);
    for (let i = 0; i <= 14; i++) { const x = lerp(600, -560, i / 14); g.lineTo(x, -90 + (i % 2 ? 26 : 0)); }
    g.closePath(); cut(g);
    // plastron (belly)
    g.moveTo(-520, -110); g.quadraticCurveTo(0, 30, 560, -110); g.closePath(); cut(g);
    // the neck and head, reaching forward and a little down under a weight
    const hy = -200 + 110 * r.bear, hx = -800 + 40 * r.bear;
    g.save(); g.translate(-560, -160); g.rotate(r.look + 0.18 * r.bear); g.translate(560, 160);
    g.moveTo(-540, -230); g.bezierCurveTo(-640, -250, -720, hy - 60, hx, hy - 50);
    g.bezierCurveTo(hx - 70, hy - 50, hx - 110, hy - 10, hx - 110, hy + 20);   // the beak
    g.lineTo(hx - 70, hy + 30); g.bezierCurveTo(hx - 40, hy + 60, -700, -120, -540, -110); g.closePath(); cut(g);
    g.restore();
    // near flippers
    flipper(g, [-360, -80], Math.PI * 0.78 + sw, 440, 140);
    flipper(g, [420, -60], Math.PI * 0.18 + sw * 0.6, 280, 100);
    // tail
    g.moveTo(590, -110); g.lineTo(700, -60); g.lineTo(580, -80); g.closePath(); cut(g);
  }
  function ornamentsA(g, P, r, a, color) {
    if (a <= 0.01) return;
    g.globalAlpha *= a; g.strokeStyle = color; g.lineWidth = 6; g.lineJoin = 'round';
    // hexagon plates on the dome
    const hex = (cx, cy, s) => { g.beginPath(); for (let i = 0; i < 6; i++) { const an = (i / 6) * TAU + Math.PI / 6; g.lineTo(cx + Math.cos(an) * s, cy + Math.sin(an) * s * 0.8); } g.closePath(); g.stroke(); };
    for (const [cx, cy, s] of [[0, -400, 90], [-200, -340, 80], [200, -350, 80], [-380, -220, 70], [380, -230, 70], [-120, -220, 70], [120, -225, 70], [0, -260, 0]]) if (s) hex(cx, cy, s);
    // the gold rim of the shell
    g.strokeStyle = '#e8c070'; g.lineWidth = 8; g.beginPath(); g.moveTo(-560, -120); g.lineTo(600, -120); g.stroke();
    // eye
    g.save(); g.translate(-560, -160); g.rotate(r.look + 0.18 * r.bear); g.translate(560, 160);
    g.fillStyle = '#fff0d0'; g.beginPath(); g.arc(-760 + 40 * r.bear, -230 + 110 * r.bear, 10, 0, TAU); g.fill();
    g.restore();
  }
  CH.define({
    id: 'akupara', rig: rigA, shape: shapeA, ornaments: ornamentsA, defaultPose: 'swim',
    bible: {
      name: 'Akupara, king of the tortoises',
      role: 'He bears Mount Mandara on his back for the churning; Indra sets the mountain on him (CE 1.16). The epic\'s tortoise king, not the Puranic avatar.',
      palette: { fill: '#120e08', lit: '#3a2c18', inner: '#4a3818', rimDim: '#e0b070', rimBright: '#fff0d0', ornamentDim: '#5ad0b0', ornament: '#d8fff0' },
      proportions: '≈ 1400 units nose to tail; the shell dome ≈ 560 high, ≈ 1160 long.',
      props: ['mural hexagon plates on the dome', 'a gold shell rim', 'four broad flippers'],
      light: 'Sea-bronze: rim #e0b070 → #fff0d0, glow 0.6, teal shell plates #5ad0b0 → #d8fff0.',
      poses: [{ name: 'swim', note: 'phase: the flippers row' }, { name: 'bear', note: 'k: braced under the mountain' }],
      voice: null,
    },
    rule: { fill: '#120e08', lit: '#3a2c18', litGain: 0.8, rim: ['#e0b070', '#fff0d0'], inner: '#4a3818', innerA: [0.85, 0.45], glow: 0.6, rimW: 1.4, ornament: ['#5ad0b0', '#d8fff0'], ornamentA: [0.5, 0.85] },
    bounds: () => [-960, -620, 760, 120],
  });

  // ─── Samudra, the Ocean ─────────────────────────────────────────────────────
  function rigS(P) {
    const po = P.po, k = po.k;
    return { T: P.T, k, name: po.name, offer: po.name === 'offer' ? k : 0, speak: P.ex.speak || 0 };
  }
  function shapeS(g, color, P, r) {
    g.fillStyle = color;
    g.beginPath();
    // torso rising from the water (the waterline is y = 0)
    g.moveTo(-150, 20); g.bezierCurveTo(-170, -160, -200, -300, -190, -380); g.quadraticCurveTo(0, -420, 190, -380); g.bezierCurveTo(200, -300, 170, -160, 150, 20); g.closePath(); cut(g);
    // neck, head
    g.moveTo(-34, -400); g.lineTo(34, -400); g.lineTo(30, -450); g.lineTo(-30, -450); g.closePath(); cut(g);
    g.moveTo(64, -510); g.ellipse(0, -510, 64, 78, 0, 0, TAU); cut(g);
    // beard falling as waves
    g.moveTo(-58, -490); g.bezierCurveTo(-80, -380, -40, -300, 0, -280); g.bezierCurveTo(40, -300, 80, -380, 58, -490); g.closePath(); cut(g);
    // hair falling to the shoulders in wave-curls
    for (const s of [-1, 1]) for (let i = 0; i < 4; i++) { const x = s * (70 + i * 16), y = -520 + i * 50; g.moveTo(x + s * 30, y); g.arc(x, y, 30, 0, TAU); cut(g); }
    // crown: a band and three wave-crests
    g.moveTo(-66, -560); g.lineTo(66, -560); g.lineTo(60, -600); g.lineTo(-60, -600); g.closePath(); cut(g);
    for (const x of [-44, 0, 44]) { g.moveTo(x - 24, -600); g.quadraticCurveTo(x - 30, -660 - (x ? 0 : 30), x + 6, -680 - (x ? 0 : 30)); g.quadraticCurveTo(x - 6, -640, x + 24, -600); g.closePath(); cut(g); }
    // arms: holding up pearls and coral (offer), or open at the sides
    for (const s of [-1, 1]) {
      const sh = [s * 175, -360], hd = [s * lerp(300, 240, r.offer), lerp(-150, -520, r.offer)], el = [s * lerp(300, 330, r.offer), lerp(-200, -330, r.offer)];
      limb(g, [sh, el, hd], [70, 52, 40]);
      g.moveTo(hd[0] + 40, hd[1]); g.arc(hd[0], hd[1], 40, 0, TAU); cut(g);
    }
  }
  function ornamentsS(g, P, r, a, color) {
    if (a <= 0.01) return;
    g.globalAlpha *= a; g.fillStyle = color; g.strokeStyle = color;
    g.lineWidth = 12; g.beginPath(); g.moveTo(-170, -380); g.quadraticCurveTo(0, -300, 170, -380); g.stroke();
    for (let i = 0; i < 9; i++) { const u = i / 8; g.beginPath(); g.arc(lerp(-150, 150, u), -362 + Math.sin(Math.PI * u) * 60, 9, 0, TAU); g.fill(); }
    // a pearl in one hand, a branch of coral in the other
    const hl = [-lerp(300, 240, r.offer), lerp(-150, -520, r.offer)], hr = [lerp(300, 240, r.offer), lerp(-150, -520, r.offer)];
    g.save(); g.shadowColor = '#ffffff'; g.shadowBlur = R.px(20 * P.s); g.beginPath(); g.arc(hl[0], hl[1] - 56, 26, 0, TAU); g.fill(); g.restore();
    g.strokeStyle = '#ff7a6a'; g.lineWidth = 9; g.lineCap = 'round';
    for (const [dx, dy] of [[0, -90], [-30, -70], [30, -64], [-14, -110], [20, -108]]) { g.beginPath(); g.moveTo(hr[0], hr[1] - 30); g.quadraticCurveTo(hr[0] + dx * 0.4, hr[1] - 50, hr[0] + dx, hr[1] + dy); g.stroke(); }
  }
  function beforeS(ctx, P, r, k) {
    // a canopy of a breaking wave behind him
    const s = P.s;
    ctx.save(); ctx.translate(P.x, P.y); ctx.scale(s, s);
    KIT.glow(ctx, 0, -420, 900, '#6ae0e8', 0.35 * k);
    ctx.fillStyle = 'rgba(30,110,130,0.55)'; ctx.strokeStyle = 'rgba(220,255,255,0.8)'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(-480, 0); ctx.bezierCurveTo(-520, -500, -200, -820, 120, -800); ctx.bezierCurveTo(380, -790, 520, -620, 470, -470);
    ctx.bezierCurveTo(420, -360, 300, -420, 330, -520); ctx.bezierCurveTo(250, -440, 360, -330, 480, -360); ctx.lineTo(480, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
    for (let i = 0; i < 6; i++) { const u = i / 5; ctx.globalAlpha = 0.6; ctx.beginPath(); ctx.arc(lerp(-430, 330, u), -lerp(300, 760, Math.sin(Math.PI * u * 0.9)), 18, 0, TAU); ctx.fillStyle = '#eaffff'; ctx.fill(); }
    ctx.restore();
    void r;
  }
  CH.define({
    id: 'samudra', rig: rigS, shape: shapeS, ornaments: ornamentsS, before: beforeS, defaultPose: 'stand',
    bible: {
      name: 'Samudra, the Ocean',
      role: 'The ocean, lord of the waters: he agrees to be churned if he too gets a share of the amrita (CE 1.16).',
      palette: { fill: '#06141a', lit: '#134048', inner: '#1a5a66', rimDim: '#6ae0e8', rimBright: '#eaffff', ornamentDim: '#fff6e8', ornament: '#ffffff', coral: '#ff7a6a' },
      proportions: 'Frontal, waist-deep in the waves: ≈ 700 units above the water to the crown.',
      props: ['a crown of three wave-crests', 'hair and beard falling as waves', 'a pearl and a branch of coral', 'a breaking wave behind him'],
      light: 'Aquamarine: rim #6ae0e8 → #eaffff, glow 0.85, pearl-white ornaments, coral red.',
      poses: [{ name: 'stand' }, { name: 'offer', note: 'k: pearl and coral held up' }],
      voice: 'samudra',
    },
    rule: { fill: '#06141a', lit: '#134048', litGain: 0.8, rim: ['#6ae0e8', '#eaffff'], inner: '#1a5a66', innerA: [0.85, 0.45], glow: 0.85, ornament: ['#fff6e8', '#ffffff'], ornamentA: [0.6, 0.95] },
    bounds: () => [-560, -860, 560, 60],
  });
  CH.ROSTER.push('akupara', 'samudra');
  void clamp;
})();
