/*
 * CHARACTER · AGNI (Vibhavasu), god of fire · `agni`
 *
 * Episode 19 (CE 1.20): when Garuda is born blazing, the gods take his radiance for Agni's and run to
 * Agni himself, who tells them it is Garuda, his equal in splendour. Recurs (the Khandava forest).
 *
 * The warrior body of the devas (crest variant 4, the flame crest) in Agni's own light, with his
 * signs: a beard of flame, a ring of seven tongues of fire rising behind him, a ladle (sruva) in
 * the near hand. Faces LEFT. (x, y) = feet. scale 1 ≈ 1050 px.
 *
 * SIGNATURE LIGHT: living fire. Fill #1a0602, lit #4a1404, inner #8a2a06, rim #ff7a2a → #ffe8a0,
 * glow 1.1, ornaments gold; the seven tongues of fire behind him breathe. Never Garuda's gold wings,
 * never Aruna's dawn-red halo.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, CH = KIT.characters;
  const { TAU, clamp } = R;
  function rig(P) { const r = CH.deva._def.rig({ ...P, index: 4 }); r.T = P.T; return r; }
  function before(ctx, P, r, k) {
    const s = P.s, sx = P.flip ? -1 : 1;
    const cx = P.x + 20 * s * sx, cy = P.y - 760 * s;
    KIT.glow(ctx, cx, cy, 1000 * s, '#ff6a1a', 0.45 * k);
    ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
    for (let i = 0; i < 7; i++) {
      const a = -Math.PI / 2 + (i - 3) * 0.38, h = 380 + 90 * Math.sin(r.T * 4 + i * 1.7);
      for (const [col, w, f] of [['#c8300c', 60, 1], ['#ff8a20', 40, 0.82], ['#ffe070', 22, 0.6]]) {
        ctx.save(); ctx.rotate(a + Math.PI / 2); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-w, 0); ctx.quadraticCurveTo(-w * 0.6, -h * f * 0.6, Math.sin(r.T * 5 + i) * 14, -h * f); ctx.quadraticCurveTo(w * 0.6, -h * f * 0.6, w, 0); ctx.closePath(); ctx.fill(); ctx.restore();
      }
    }
    ctx.restore();
  }
  function after(ctx, P, r) {
    // a beard of flame at the jaw
    const s = P.s, sx = P.flip ? -s : s;
    ctx.save(); ctx.translate(P.x, P.y + (r.bob + r.drop) * s); ctx.scale(sx, s);
    ctx.fillStyle = '#ffb040';
    for (let i = 0; i < 4; i++) { ctx.globalAlpha = 0.8; ctx.beginPath(); ctx.moveTo(-40 + i * 12, -800); ctx.quadraticCurveTo(-60 + i * 10, -760 + Math.sin(r.T * 6 + i) * 6, -50 + i * 8, -720 - i * 8); ctx.lineTo(-24 + i * 12, -796); ctx.closePath(); ctx.fill(); }
    ctx.restore();
  }
  CH.define({
    id: 'agni', rig, shape: (g, c, P, r) => CH.deva._def.shape(g, c, P, r), ornaments: (g, P, r, a, c) => CH.deva._def.ornaments(g, P, r, a, c), before, after, defaultPose: 'stand',
    bible: {
      name: 'Agni (Vibhavasu), god of fire',
      role: 'The gods take newborn Garuda\'s blaze for Agni\'s and run to him; Agni tells them it is Garuda, his equal in splendour (CE 1.20).',
      palette: { fill: '#1a0602', lit: '#4a1404', inner: '#8a2a06', rimDim: '#ff7a2a', rimBright: '#ffe8a0', ornamentDim: '#e8b040', ornament: '#fff0c0' },
      proportions: 'The deva body (flame crest), ≈ 1050 units; seven tongues of fire ≈ 470 behind him.',
      props: ['seven tongues of fire behind him', 'a beard of flame', 'the flame crest'],
      light: 'Living fire: rim #ff7a2a → #ffe8a0, glow 1.1, the seven tongues breathing.',
      poses: [{ name: 'stand' }, { name: 'speak', note: 'k' }, { name: 'point', note: 'k' }],
      voice: 'agni',
    },
    rule: { fill: '#1a0602', lit: '#4a1404', litGain: 0.9, rim: ['#ff7a2a', '#ffe8a0'], inner: '#8a2a06', innerA: [0.85, 0.45], glow: 1.1, ornament: ['#e8b040', '#fff0c0'], ornamentA: [0.6, 0.95] },
    bounds: () => [-560, -1400, 520, 30],
  });
  CH.ROSTER.push('agni');
  void TAU; void clamp;
})();
