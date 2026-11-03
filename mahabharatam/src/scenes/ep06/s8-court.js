/*
 * Ep 6 · line "court" · NEXT · "He went to King Janamejaya:"
 *
 * NEW PLACE, NEW LIGHT: Janamejaya's court at Hastinapura (EP6.court), saffron lamplight,
 * the red parasol over the throne. The king sits enthroned on the left; Uttanka strides in
 * from the right. "Hastinapura" in gold.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP6 = window.EP6;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'court',
    fadeIn: 0.6,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const w = E.outSine(clamp(t / (dur - 0.2)));
      EP6.court(ctx, T, {
        cam: { zoom: 1.05 },
        after: (g) => {
          const fl = KIT.flicker(T, 240);
          CH.janamejaya.draw(g, { x: 300, y: 1480, scale: 0.62, facing: 'right', pose: 'sit', expression: { look: -0.04 }, light: EP6.light(300, 1100, 240, 980, fl, 0.3), t: T, key: 'k6-king' });
          const x = lerp(1180, 820, w);
          CH.uttanka.draw(g, { x, y: 1500, scale: 0.6, facing: 'left', pose: w < 0.97 ? { name: 'walk', phase: T * 6, stride: 0.9 } : 'stand', expression: { mood: 'wrath' }, light: EP6.light(x, 1100, 860, 980, KIT.flicker(T, 860), 0.25), t: T, key: 'k6-u' });
        },
      });
      const la = clamp((t - 0.2) / 0.5) * (1 - clamp((t - dur + 0.3) / 0.3));
      EP6.label(ctx, (env.strings.placeHastinapura || 'Hastinapura').toUpperCase(), KIT.CX, 330, la, { size: 60, key: 'k6-place' });
      void p;
    },
    post: () => ({ bloom: 0.38, vignette: 0.5, paper: 0.32 }),
  });
})();
