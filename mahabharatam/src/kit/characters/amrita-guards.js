/*
 * CHARACTERS · THE TWO SERPENTS WHO GUARD THE AMRITA · `guardsnake` (index 0, 1)
 *
 * Episode 27 (CE 1.29): beneath the spinning wheel lie two great serpents set to guard the soma, blazing like fire,
 * their tongues flickering lightning, their eyes never closing, their very gaze poison. Garuda fills their eyes with
 * dust and cuts them down unseen.
 *
 * Built on the serpent-king body of `vasuki` (banded belly, hood, the head turned off the hood) in their own light:
 * IRON AND EMBER: fill #120604, lit #3a1408, inner #5a1a0a, rim #ff6a3a → #ffd8b0, eyes and ornaments ember-gold.
 * pose.blind (0..1) greys the eyes (the dust). Never Vasuki's violet, never the nagas' olive green.
 * (x, y) = the base of the coil. Poses: rise (k) · coil.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, CH = KIT.characters;
  const V = CH.vasuki._def;
  CH.define({
    id: 'guardsnake', rig: V.rig, shape: V.shape, ornaments: V.ornaments, after: V.after, bounds: V.bounds, defaultPose: 'rise',
    before: (ctx, P, r, k) => { const b = R.clamp((P.po && P.po.blind) || 0); KIT.glow(ctx, P.x, P.y - 700 * P.s, 600 * P.s, '#ff5a20', 0.4 * k * (1 - 0.8 * b)); },
    bible: {
      name: 'The two serpents who guard the amrita',
      role: 'Fire-eyed serpents under the wheel of blades, whose gaze is poison; Garuda blinds them with dust and cuts them down (CE 1.29).',
      palette: { fill: '#120604', lit: '#3a1408', inner: '#5a1a0a', rimDim: '#ff6a3a', rimBright: '#ffd8b0', ornamentDim: '#ff9a40', ornament: '#ffe8a0' },
      proportions: 'The serpent-king body (Vasuki\'s), drawn as a pair under the wheel.',
      props: ['ember eyes that never close', 'a flickering tongue'],
      light: 'Iron and ember: rim #ff6a3a → #ffd8b0; pose.blind dims the ember glow.',
      poses: [{ name: 'rise', note: 'k' }, { name: 'coil' }],
      voice: null,
    },
    rule: { fill: '#120604', lit: '#3a1408', litGain: 0.85, rim: ['#ff6a3a', '#ffd8b0'], inner: '#5a1a0a', innerA: [0.85, 0.45], glow: 0.9, ornament: ['#ff9a40', '#ffe8a0'], ornamentA: [0.6, 0.95] },
  });
  CH.ROSTER.push('guardsnake');
})();
