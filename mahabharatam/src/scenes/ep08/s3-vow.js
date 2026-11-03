/*
 * Ep 8 · line "vow" · Janamejaya: "I will burn Takshaka and all his kind in the fire!"
 *
 * Close and low on the king: he rises from the throne, wrath in his eye, and lifts his
 * hand (bless pose as an oath) on "burn" (beats[0]); on "Takshaka" a green glint dies in
 * the lamp smoke; on "fire" (beats[2]) every lamp in the hall flares up.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP6 = window.EP6, EP8 = window.EP8;
  const { clamp, E } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'vow',
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b0 = env.beats[0] ?? 0.6, b2 = env.beats[2] ?? 3.5;
      const rise = E.inOutCubic(clamp((t - 0.05) / 0.5));
      const oath = E.inOutCubic(clamp((t - (b0 - 0.3)) / 0.6));
      const flare = E.outCubic(clamp((t - (b2 - 0.3)) / 0.6));
      EP6.court(ctx, T, {
        throneX: 620, fire: 0.25 * flare, cam: { zoom: 1.5 + 0.06 * p, dx: -120, dy: 120 },
        after: (g) => {
          const fl = KIT.flicker(T, 240) * (1 + 0.5 * flare);
          CH.janamejaya.draw(g, { x: 640, y: 1500, scale: 0.92, facing: 'left', pose: rise < 0.5 ? 'sit' : { name: 'bless', k: oath }, expression: { mood: 'wrath', look: -0.06, speak: EP8.mouth(env, t) }, light: EP6.light(640, 1100, 860, 980, fl, 0.35), t: T, key: 'v8-king' });
        },
      });
    },
    post: () => ({ bloom: 0.45, vignette: 0.55, paper: 0.3 }),
  });
})();
