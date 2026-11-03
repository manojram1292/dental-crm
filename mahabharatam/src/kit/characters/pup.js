/*
 * CHARACTER · SARAMA'S SON (the pup) · built on CH.canine (src/kit/characters/sarama.js).
 *
 * Episode 5: the small dog who came near Janamejaya's sacrifice, was beaten by the
 * king's brothers though he had done nothing wrong, and ran crying to his mother.
 *
 * Unmistakably her son, unmistakably young: the same wedge head and arched neck,
 * but a short body, short legs, a big head, soft ears whose tips fold forward, a
 * thin whip of a tail (tucked when he is afraid), no mane, no collar. A small
 * star on his brow, like hers but faint.
 *
 * SIGNATURE LIGHT: his mother's dawn-pearl, smaller and dimmer. The same halo
 * rim all round, softer (#c89a80 → #ffe8d8), on the same violet-indigo fill,
 * no aura (a faint warm glow only around his head).
 *
 * Faces LEFT natively. Paws on (x, y). scale 1 ≈ 480 px to the ear tips
 * (shoulder ≈ 230): a little under half his mother's height.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, CH = KIT.characters;
  const { lerp } = R;
  const C = CH.canine;

  const D = { bx: 0.42, by: 0.5, leg: 0.42, legW: 1.5, neck: 0.42, head: 0.8, ears: 'soft', tail: 'thin', mane: false, swirls: false };
  const rig = (P) => C.rig(P, D);

  function after(ctx, P, r, k) {
    const sx = P.flip ? -P.s : P.s, h = C.headPt(r, -20, -10);
    KIT.glow(ctx, P.x + h[0] * sx, P.y + (h[1] + r.bob) * P.s, 160 * P.s, '#ffe4d0', 0.16 * k);
  }

  const bible = {
    name: 'Sarama\'s son (the pup)',
    role: 'Came near Janamejaya\'s sacrifice at Kurukshetra; beaten by the king\'s brothers though he did no wrong; ran crying to his mother (Adi Parva 3).',
    palette: { fill: '#1a1424', inner: '#7a5a6a', rimDim: '#c89a80', rimBright: '#ffe8d8', ornament: '#f8e4c8' },
    proportions: '≈ 230 units at the shoulder, ≈ 480 to the ear tips (a little under half his mother): body ×0.5, legs ×0.42, head ×0.72 of hers (a big head, short legs).',
    props: ['a faint star on his brow', 'soft ears with folded tips', 'a thin tail (tucked when afraid)'],
    light: 'His mother\'s dawn-pearl, smaller and dimmer: fill #1a1424, halo rim all round #c89a80 → #ffe8d8 (rim ×0.9), inner #7a5a6a, no aura; a faint warm glow round his head.',
    poses: [
      { name: 'stand' }, { name: 'walk', note: 'a bouncy trot (phase, stride)' }, { name: 'run', note: 'flight (phase)' },
      { name: 'sniff', note: 'k: nose to the ground, curious' }, { name: 'cower', note: 'k: crouched, ears back, tail tucked' },
      { name: 'sit' }, { name: 'cry', note: 'k: seated, head thrown back, mouth open (crying to his mother)' },
    ],
    voice: 'sarama_pup',
  };

  const mod = CH.define({
    id: 'pup', bible, rig, after, defaultPose: 'stand',
    shape: C.shape,
    ornaments: (g, P, r, a, c) => C.ornaments(g, P, r, a, c, { star: true }),
    rule: {
      fill: '#1a1424', lit: '#2e2638', litGain: 0.9,
      rim: ['#c89a80', '#ffe8d8'], inner: '#7a5a6a', innerA: [0.25, 0.35], glow: 0.7, halo: 0.6, rimW: 0.9,
      ornament: ['#d8b890', '#f8e4c8'], ornamentA: [0.4, 0.8],
    },
    bounds: () => [-420, -560, 360, 30],
  });
  mod.anchor = (opts, name) => {
    const P = CH.resolve(opts, mod._def), r = rig(P), sx = P.flip ? -P.s : P.s;
    const lp = name === 'nose' ? C.headPt(r, -170, 0) : C.headPt(r, -20, -10);
    return [P.x + lp[0] * sx, P.y + (lp[1] + r.bob) * P.s];
  };
  CH.ROSTER.push('pup');
  void lerp;
})();
