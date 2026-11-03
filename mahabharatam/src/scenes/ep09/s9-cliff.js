/*
 * Ep 9 · line "cliff" · NEXT · "Kadru's eggs hatched. Vinata's did not. And she could not wait."
 *
 * Kadru's jars crack on "hatched" (beats[0]): small serpents of every colour pour out and
 * rise, hoods spread, and Kadru stands among them. Vinata kneels by her two silent jars
 * (beats[1], "not"); on "wait" (beats[2]) her hand reaches for one.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP8 = window.EP8, EP9 = window.EP9;
  const { clamp, E, hash, lerp } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'cliff',
    fadeIn: 0.5,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b0 = env.beats[0] ?? 1.1, b1 = env.beats[1] ?? 3.4, b2 = env.beats[2] ?? 5.3;
      const crack = clamp((t - (b0 - 0.5)) / 0.6), out = E.outCubic(clamp((t - b0) / 1.4));
      const reach = E.inOutSine(clamp((t - (b2 - 0.9)) / 1.0));
      const toV = E.inOutSine(clamp((t - (b1 - 1.0)) / 1.2));
      EP9.hermitage(ctx, T, {
        glow: 0.9, cam: { zoom: lerp(1.05, 1.35, toV), dx: lerp(0, -300, toV), dy: lerp(0, 200, toV) },
        after: (g) => {
          for (let i = 0; i < 4; i++) EP9.jar(g, 120 + i * 130, 1520, 0.62, T, { kind: 'serpent', crack, glow: 0.4 });
          for (let i = 0; i < 14; i++) {
            const a = clamp(out * 1.5 - hash(i, 91) * 0.5);
            if (a > 0.01) EP8.serpent(g, 120 + (i % 4) * 130 + Math.sin(T + i) * 20, lerp(1440, 1200 - hash(i, 92) * 260, a), 70 + hash(i, 93) * 60, -Math.PI / 2 + (hash(i, 94) - 0.5) * 1.6, T, i, { kind: i, w: 9, hood: i % 3 === 0, alpha: a });
          }
          CH.kadru.draw(g, { x: 320, y: 1640, scale: 0.86, facing: 'right', pose: 'stand', expression: { mood: 'wrath' }, light: EP9.light(320, 1640), t: T, key: 'c9-kd' });
          EP9.jar(g, 760, 1640, 0.85, T, { kind: 'rose', glow: 0.5 });
          EP9.jar(g, 930, 1660, 0.85, T, { kind: 'gold', glow: 0.5 });
          CH.vinata.draw(g, { x: 1000, y: 1700, scale: 0.86, facing: 'left', pose: reach > 0.01 ? { name: 'reach', k: reach * 0.7 } : 'stand', expression: { look: 0.1 }, light: EP9.light(1000, 1700), t: T, key: 'c9-vn' });
        },
      });
      void p;
    },
    post: () => ({ bloom: 0.4, vignette: 0.48, paper: 0.34 }),
  });
})();
