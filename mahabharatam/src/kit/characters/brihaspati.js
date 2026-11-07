/*
 * CHARACTER · BRIHASPATI, teacher of the gods · `brihaspati`
 *
 * Episode 25 (CE 1.26): when omens fill heaven, Indra asks his teacher Brihaspati what they mean; Brihaspati tells
 * him that Vinata's son, born through the Valakhilyas' austerity and Indra's own fault, is coming for the soma.
 *
 * Built on Vyasa's body (the great seer: long beard, top-knot, the manuscript) in his own light: JUPITER'S YELLOW
 * GOLD (Brihaspati is the planet Jupiter): fill #160e02, lit #4a3410, inner #6a4a10, rim #f0c840 → #fff6c0,
 * ornaments gold, a faint yellow aureole. Never Surya's white disc, never Indra's gold crown (he wears none).
 * Faces LEFT. (x, y) = feet. scale 1 ≈ 1000 px. Poses as Vyasa's: stand · walk · sit · speak (k) · dictate (k) · bless (k).
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, CH = KIT.characters;
  const V = CH.vyasa._def;
  CH.define({
    id: 'brihaspati', rig: V.rig, shape: V.shape, ornaments: V.ornaments,
    before: (ctx, P, r, k) => KIT.glow(ctx, P.x, P.y - 800 * P.s, 520 * P.s, '#ffd040', 0.3 * k),
    defaultPose: 'stand',
    bible: {
      name: 'Brihaspati, teacher of the gods',
      role: 'Indra\'s guru, who explains the omens: Vinata\'s son is coming for the soma (CE 1.26).',
      palette: { fill: '#160e02', lit: '#8a6a28', inner: '#6a4a10', rimDim: '#f0c840', rimBright: '#fff6c0', ornamentDim: '#d8a840', ornament: '#fff0b0' },
      proportions: 'Vyasa\'s body (≈ 1000 units): long beard, top-knot, the manuscript.',
      props: ['long beard', 'top-knot', 'palm-leaf manuscript', 'a faint yellow aureole'],
      light: 'Jupiter\'s yellow gold: rim #f0c840 → #fff6c0, a faint aureole; no crown.',
      poses: [{ name: 'stand' }, { name: 'sit' }, { name: 'speak', note: 'k' }, { name: 'dictate', note: 'k' }, { name: 'bless', note: 'k' }],
      voice: 'brihaspati',
    },
    rule: { fill: '#160e02', lit: '#8a6a28', litGain: 0.9, rim: ['#f0c840', '#fff6c0'], inner: '#6a4a10', innerA: [0.85, 0.45], glow: 0.9, ornament: ['#d8a840', '#fff0b0'], ornamentA: [0.55, 0.95] },
    bounds: V.bounds,
  });
  CH.ROSTER.push('brihaspati');
})();
