/*
 * CHARACTER · VISHVAKARMA (Bhauvana), the gods' builder, guardian of the soma · `vishvakarma`
 *
 * Episode 26 (CE 1.28): when Garuda reaches heaven, the first to fight him is Vishvakarma, the divine artisan, who
 * guarded the soma; Garuda wounds him with wings, beak and talons and he falls.
 *
 * Built on the warrior body of the devas (crest variant 0, the kirita) with the builder's signs: a heavy beard, a
 * leather apron, a measuring cord coiled at the waist and a great hammer in the near hand (drawn in `after`).
 * His own light: FORGE COPPER: fill #160a04, lit #4a2410, inner #6a3410, rim #e88a40 → #ffe0b0, ornaments brass.
 * Never Agni's living fire (no tongues of flame), never Indra's gold.
 * Faces LEFT. (x, y) = feet. scale 1 ≈ 1050 px. Poses: the deva poses (stand · raise · strike · cower · bow …).
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, CH = KIT.characters;
  const D = CH.deva._def;
  function after(ctx, P, r) {
    const s = P.s, sx = P.flip ? -s : s;
    ctx.save(); ctx.translate(P.x, P.y + (r.bob || 0) * s); ctx.scale(sx, s);
    // the hammer, held up in raise/strike, at rest otherwise
    const up = P.po && (P.po.name === 'raise' || P.po.name === 'strike') ? (P.po.k ?? 1) : 0;
    ctx.save(); ctx.translate(-80, -640 - 260 * up); ctx.rotate(-0.4 - 1.4 * up);
    ctx.fillStyle = '#3a2214'; ctx.fillRect(-10, 0, 20, 260); ctx.fillStyle = '#c8884a'; ctx.fillRect(-60, -40, 120, 70);
    ctx.restore();
    // the apron and measuring cord
    ctx.fillStyle = 'rgba(90,50,24,0.9)'; ctx.beginPath(); ctx.moveTo(-50, -500); ctx.lineTo(60, -500); ctx.lineTo(50, -260); ctx.lineTo(-40, -260); ctx.fill();
    ctx.strokeStyle = '#e8c070'; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(40, -470, 26, 14, 0, 0, R.TAU); ctx.stroke();
    ctx.restore();
  }
  CH.define({
    id: 'vishvakarma', rig: (P) => { const r = D.rig({ ...P, index: 0 }); r.T = P.T; return r; }, shape: D.shape, ornaments: D.ornaments, after, defaultPose: 'stand',
    bible: {
      name: 'Vishvakarma (Bhauvana), the gods\' builder',
      role: 'The divine artisan who guarded the soma; the first to fight Garuda in heaven, and the first to fall (CE 1.28).',
      palette: { fill: '#160a04', lit: '#4a2410', inner: '#6a3410', rimDim: '#e88a40', rimBright: '#ffe0b0', ornamentDim: '#c09040', ornament: '#ffe8b0' },
      proportions: 'The deva body (kirita crest), ≈ 1050 units; a hammer and a measuring cord.',
      props: ['great hammer', 'leather apron', 'measuring cord'],
      light: 'Forge copper: rim #e88a40 → #ffe0b0, brass ornaments.',
      poses: [{ name: 'stand' }, { name: 'raise', note: 'k: the hammer high' }, { name: 'strike', note: 'k' }, { name: 'cower', note: 'k: struck down' }],
      voice: null,
    },
    rule: { fill: '#160a04', lit: '#4a2410', litGain: 0.9, rim: ['#e88a40', '#ffe0b0'], inner: '#6a3410', innerA: [0.85, 0.45], glow: 0.8, ornament: ['#c09040', '#ffe8b0'], ornamentA: [0.55, 0.95] },
    bounds: () => [-600, -1500, 520, 30],
  });
  CH.ROSTER.push('vishvakarma');
})();
