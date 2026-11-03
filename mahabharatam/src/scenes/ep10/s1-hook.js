/*
 * Ep 10 · line "hook" · HOOK (Sauti) · "What would a mother do, who could not wait?"
 *
 * The Naimisha fire, close. In the smoke above it a woman's hand hovers over a glowing
 * rose-red egg (beats[0], "mother"); on "wait" (beats[1]) a hairline crack of red light
 * runs across it. The title follows.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP9 = window.EP9, EP10 = window.EP10;
  const { clamp, E } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'hook',
    fadeIn: 0.5,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur, 0, 1.3);
      const fl = KIT.flicker(T, 0);
      const b0 = env.beats[0] ?? 0.9, b1 = env.beats[1] ?? 2.9;
      const v = E.outCubic(clamp((t - (b0 - 0.4)) / 0.9));
      const cr = clamp((t - (b1 - 0.3)) / 0.6);
      const k = E.inOutCubic(clamp((t - 0.1) / 0.8));
      const F = KIT.ashram.FIRE;
      KIT.ashram.draw(ctx, T, {
        cycle: 0.75, speed: 0, hide: [5, 6], turn: (i) => (i < 2 ? -0.5 : i > 2 ? 0.4 : -0.3),
        smoke: { alpha: 0.42, lean: 6 }, fireH: 240,
        cam: { zoom: 1.22 + 0.05 * E.inOutSine(p), dx: 30, dy: -60 },
        vision: (g) => {
          if (v > 0.01) {
            EP10.ghost(g, 0.9 * v, (q) => {
              EP9.egg(q, 560, 860, 70, 'rose', T, { glow: 0.5, crack: cr * 0.7 });
              CH.vinata.draw(q, { x: 700, y: 1100, scale: 0.42, facing: 'left', pose: { name: 'reach', k: 0.5 + 0.2 * cr }, light: { dir: Math.PI, intensity: 1, front: 0.3 }, t: T, key: 'h10-vn' });
            }, 'h10-g');
          }
        },
        after: (g) => {
          CH.sauti.draw(g, { x: 200, y: 1560, scale: 0.86, facing: 'right', pose: { name: 'speak', base: 'sit', k }, expression: { look: -0.06 * k, speak: EP10.mouth(env, t) }, light: { dir: Math.atan2(F.y - 1250, F.x - 200), intensity: fl, front: 0.25 }, t: T, key: 'h10-sauti' });
          CH.elder.draw(g, { x: 900, y: 1570, scale: 0.84, facing: 'left', pose: 'sit', expression: { look: -0.1 * v }, light: { dir: Math.atan2(F.y - 1250, F.x - 900), intensity: fl, front: 0.2 }, t: T, key: 'h10-elder' });
        },
      });
      const tk = clamp((t - (env.speech[1] + 0.02)) / 1.0);
      if (tk > 0) KIT.series.episodeTitle(ctx, T, tk, env.strings, { y: 340, key: 'ep10-title' });
    },
    post: () => ({ bloom: 0.36, vignette: 0.5, paper: 0.32 }),
  });
})();
