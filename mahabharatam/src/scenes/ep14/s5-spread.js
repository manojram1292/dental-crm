/*
 * Ep 14 · line "spread" · "Its fumes spread over the worlds, and gods and asuras fled."
 * Wide and high: the smoke rolls across the whole sky, the sea goes to slate; on "fled"
 * (beats[2]) the hosts in the foreground drop the rope and run outward, both ways. Tagged.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP13 = window.EP13, EP14 = window.EP14;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'spread',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b2 = env.beats[2] ?? 3.9;
      const run = E.inOutSine(clamp((t - b2 + 0.8) / 1.2));
      EP13.whiteSea(ctx, T, {
        hz: 1200, dark: 0.7 + 0.25 * p, cam: { zoom: 1.0 },
        after: (g) => {
          EP13.poison(g, 540, 1300, T, 1);
          EP13.poison(g, 200, 900, T + 3, 0.8 * p);
          EP13.poison(g, 880, 800, T + 7, 0.8 * p);
          for (let i = 0; i < 3; i++) {
            CH.deva.draw(g, { x: lerp(330 - i * 110, -260 - i * 90, run), y: 1900 + i * 14, scale: 0.8, facing: run > 0.05 ? 'left' : 'right', index: [1, 4, 0][i], pose: run > 0.05 ? { name: 'walk', phase: T * 7 + i } : { name: 'cower', k: 1 }, light: { dir: -Math.PI / 2, intensity: 0.85, front: 0.3 }, t: T + i, key: 's14-d' + i });
            CH.asura.draw(g, { x: lerp(750 + i * 110, 1340 + i * 90, run), y: 1900 + i * 14, scale: 0.82, facing: run > 0.05 ? 'right' : 'left', index: [0, 3, 5][i], pose: run > 0.05 ? { name: 'walk', phase: T * 7 + i } : { name: 'cower', k: 1 }, light: { dir: -Math.PI / 2, intensity: 0.85, front: 0.3 }, t: T + i, key: 's14-a' + i });
          }
        },
      });
      EP14.tag(ctx, T, 1, env.strings);
    },
    post: () => ({ bloom: 0.38, vignette: 0.55, paper: 0.3 }),
  });
})();
