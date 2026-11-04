/*
 * CHARACTER · NARA, the companion of Narayana · `nara`
 *
 * Episode 16 (CE 1.17): in the war for the amrita, the god Nara with his divine bow and
 * Narayana with the discus Sudarshana drive the asuras into the earth and the sea. (The epic
 * later names Arjuna and Krishna as Nara and Narayana; that is not said here.)
 *
 * The warrior body of the devas (crest variant 4) with his own palette and props: a great
 * BOW always in the near hand, a QUIVER on the back, the sash flying. `draw` (k) draws the
 * bow to the ear; `loose` (k) releases, a streak of light leaving the string.
 *
 * SIGNATURE LIGHT: storm-jade. Fill #06120e, lit #163a2e, inner #1e4a3a, rim #5ad8a8 →
 * #e8fff4, glow 0.9; ornaments gold #e8c060 → #fff4c8; his arrows white-gold. Distinct from
 * Takshaka's venom-green by its gold ornaments and pale, near-white rim.
 * Faces LEFT. (x, y) = feet. scale 1 ≈ 1050 px.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, CH = KIT.characters;
  const { TAU, lerp, clamp } = R;
  const { cut, along } = CH;

  function rig(P) {
    const po = P.po, k = po.k;
    const base = po.name === 'draw' || po.name === 'loose' ? 'stand' : po.name;
    const r = CH.deva._def.rig({ ...P, index: 4, po: { ...po, name: base } });
    r.draw = po.name === 'draw' ? k : po.name === 'loose' ? 1 - k : 0;
    r.loose = po.name === 'loose' ? k : 0;
    // near hand holds the bow out in front at shoulder height; far hand draws the string
    if (po.name === 'draw' || po.name === 'loose') { r.hand = [-330, -800]; r.farHand = along([-300, -790], [20, -820], r.draw); r.wa = -Math.PI / 2; r.pull = 1; }
    return r;
  }
  function shape(g, color, P, r) {
    CH.deva._def.shape(g, color, P, r);
    g.fillStyle = color;
    // quiver on the back
    g.save(); g.translate(0, r.bob + r.drop); g.beginPath(); g.moveTo(40, -820); g.lineTo(90, -830); g.lineTo(110, -560); g.lineTo(70, -556); g.closePath(); cut(g);
    for (let i = 0; i < 4; i++) { g.moveTo(52 + i * 10, -830); g.lineTo(46 + i * 10, -900); g.lineTo(58 + i * 10, -900); g.lineTo(62 + i * 10, -830); cut(g); }
    // the great bow at the near hand (drawn even in the pull pose, where the deva hides its weapon)
    const c = r.hand;
    if (r.pull) {
      g.beginPath(); g.moveTo(c[0] + 10, c[1] - 360); g.quadraticCurveTo(c[0] - 120, c[1], c[0] + 10, c[1] + 360); g.lineTo(c[0] + 26, c[1] + 360); g.quadraticCurveTo(c[0] - 100, c[1], c[0] + 26, c[1] - 360); g.closePath(); cut(g);
    }
    g.restore();
  }
  function ornaments(g, P, r, a, color) {
    CH.deva._def.ornaments(g, P, r, a, color);
    if (!r.pull) return;
    g.save(); g.translate(0, r.bob + r.drop); g.globalAlpha *= a;
    const c = r.hand, s = r.farHand;
    g.strokeStyle = '#fff4d8'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(c[0] + 18, c[1] - 360); g.lineTo(s[0], s[1]); g.lineTo(c[0] + 18, c[1] + 360); g.stroke();
    if (r.draw > 0.05) { g.strokeStyle = '#ffe9a0'; g.lineWidth = 6; g.beginPath(); g.moveTo(s[0], s[1]); g.lineTo(c[0] - 80, c[1]); g.stroke(); }
    g.restore();
  }
  function after(ctx, P, r) {
    if (r.loose <= 0.01) return;
    const sx = P.flip ? -P.s : P.s, c = r.hand;
    const x0 = P.x + (c[0] - 80) * sx, y0 = P.y + (c[1] + r.bob + r.drop) * P.s, d = r.loose * 1400 * P.s;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 3; i++) { const x = x0 - Math.sign(sx) * (d - i * 140 * P.s); KIT.glow(ctx, x, y0 + i * 8 * P.s, 90 * P.s, '#fff0b0', 0.8 * (1 - i * 0.3) * (1 - r.loose * 0.5)); }
    ctx.strokeStyle = '#fffbe8'; ctx.lineWidth = 5 * P.s; ctx.beginPath(); ctx.moveTo(x0 - Math.sign(sx) * Math.max(0, d - 300 * P.s), y0); ctx.lineTo(x0 - Math.sign(sx) * d, y0); ctx.stroke();
    ctx.restore();
  }
  CH.define({
    id: 'nara', rig, shape, ornaments, after, defaultPose: 'stand',
    bible: {
      name: 'Nara',
      role: 'The god who fights beside Narayana in the war for the amrita, with a divine bow (CE 1.17).',
      palette: { fill: '#06120e', lit: '#163a2e', inner: '#1e4a3a', rimDim: '#5ad8a8', rimBright: '#e8fff4', ornamentDim: '#e8c060', ornament: '#fff4c8' },
      proportions: 'The deva warrior body (crest variant 4), ≈ 1050 units; a bow ≈ 720 tall.',
      props: ['a great bow', 'a quiver on the back', 'arrows of white-gold light'],
      light: 'Storm-jade: rim #5ad8a8 → #e8fff4, glow 0.9, gold ornaments; arrows white-gold.',
      poses: [{ name: 'stand' }, { name: 'walk' }, { name: 'draw', note: 'k: the string to the ear' }, { name: 'loose', note: 'k: the arrow flies' }],
      voice: null,
    },
    rule: { fill: '#06120e', lit: '#163a2e', litGain: 0.8, rim: ['#5ad8a8', '#e8fff4'], inner: '#1e4a3a', innerA: [0.85, 0.45], glow: 0.9, ornament: ['#e8c060', '#fff4c8'], ornamentA: [0.6, 0.95] },
    bounds: () => [-760, -1340, 480, 30],
  });
  CH.ROSTER.push('nara');
  void TAU; void lerp; void clamp;
})();
