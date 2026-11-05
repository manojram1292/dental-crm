/*
 * CHARACTERS · THE VALAKHILYAS, the thumb-sized sages · `valakhilya`
 *
 * Episodes 23–25 (CE 1.26–27): sixty thousand sages no bigger than a thumb, who hang head-down from the branch
 * of the great tree Rauhina in austerity. Garuda, seeing them, catches the falling branch in his beak so as not
 * to kill them; at Kashyapa's word they let go and leave for the Himalaya. Once, at Kashyapa's sacrifice, Indra
 * laughed at them as they struggled, all together, with a single leaf-stalk; their anger brought about the birth
 * of an Indra of birds: Garuda.
 *
 * Built on the sages' body (`sage`, index 0..7 for variety) in their OWN light: ASH-WHITE TAPAS, a pale glow
 * that reads at a tiny size: fill #1a1612, lit #4a4438, rim #e8e4d8 → #ffffff, glow 1.0, ornaments ash-gold.
 * They are always drawn SMALL (scale 0.03–0.12 next to Garuda at 0.5): their size is the point.
 *   CH.valakhilya.draw(ctx, opts)               an upright sage (pose sit / stand / speak / bless)
 *   CH.valakhilya.hang(ctx, opts)               hanging head-down from (x, y) (the feet), swaying with t
 * (x, y) = feet. scale 1 ≈ 1000 px.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, CH = KIT.characters;
  const S = CH.sage._def;
  const mod = CH.define({
    id: 'valakhilya', rig: S.rig, shape: S.shape, ornaments: S.ornaments, defaultPose: 'sit',
    bible: {
      name: 'The Valakhilyas, the thumb-sized sages',
      role: 'Tiny ascetics hanging head-down from Rauhina\'s branch; Garuda saves them; once Indra mocked them (CE 1.26–27).',
      palette: { fill: '#1a1612', lit: '#4a4438', inner: '#5a5448', rimDim: '#e8e4d8', rimBright: '#ffffff', ornamentDim: '#c8b890', ornament: '#fff4d8' },
      proportions: 'The sages\' body; always drawn tiny beside other figures (their size is the story).',
      props: ['bark garments', 'matted hair', 'the sages\' variety by index'],
      light: 'Ash-white tapas: rim #e8e4d8 → #ffffff, glow 1.0, so a figure a few pixels tall still reads.',
      poses: [{ name: 'sit' }, { name: 'stand' }, { name: 'speak', note: 'k' }, { name: 'bless', note: 'k' }, { name: 'hang', note: 'CH.valakhilya.hang: head-down from the feet' }],
      voice: 'valakhilyas',
    },
    rule: { fill: '#1a1612', lit: '#4a4438', litGain: 0.9, rim: ['#e8e4d8', '#ffffff'], inner: '#5a5448', innerA: [0.8, 0.4], glow: 1.0, rimW: 1.4, ornament: ['#c8b890', '#fff4d8'], ornamentA: [0.5, 0.9] },
    bounds: S.bounds,
  });
  mod.hang = (ctx, o) => {
    const sway = 0.06 * Math.sin((o.t || 0) * 1.7 + (o.index || 0) * 1.3);
    ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(Math.PI + sway);
    const L = o.light || { dir: -Math.PI / 2, intensity: 1, front: 0.5 };
    mod.draw(ctx, { ...o, x: 0, y: 0, pose: o.pose || 'stand', facing: o.facing || 'front', light: { ...L, dir: L.dir + Math.PI - sway } });
    ctx.restore();
  };
  CH.ROSTER.push('valakhilya');
})();
