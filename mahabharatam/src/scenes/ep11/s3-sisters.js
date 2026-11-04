/*
 * Ep 11 · line "sisters" · "At sunrise, the sisters Kadru and Vinata saw him on the shore."
 *
 * The shore at sunrise (EP11.shore: episode 10's shore, the horse now drawn by his module).
 * The two sisters LARGE in the foreground, cut at the knee (Kadru left, Vinata right), lit
 * by the low sun across the water; between them, far out, the horse walks up out of the
 * shining sea. On "Kadru" (beats[1]) she turns her head to him; on "Vinata" (beats[2]) her
 * sister turns; on "him" (beats[3]) the horse lifts his head. Caption lifted (high).
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP11 = window.EP11;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'sisters',
    fadeIn: 0.35,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b1 = env.beats[1] ?? 2.3, b2 = env.beats[2] ?? 3, b3 = env.beats[3] ?? 4;
      const kd = E.inOutCubic(clamp((t - b1 + 0.3) / 0.7)), vn = E.inOutCubic(clamp((t - b2 + 0.3) / 0.7)), hd = E.inOutSine(clamp((t - b3 + 0.2) / 0.8));
      const sun = (x, y) => ({ dir: Math.atan2(1080 - (y - 600), 820 - x), intensity: 1.05, front: 0.42 });
      EP11.shore(ctx, T, {
        cam: { zoom: 1.0 + 0.05 * p },
        horse: { x: lerp(620, 560, p), y: 1150, scale: 0.3, pose: { name: 'walk', phase: T * 3.4 }, rise: lerp(0.55, 1, E.outCubic(clamp(t / 2.5))) },
        after: (g) => {
          CH.kadru.draw(g, { x: 200, y: 2020, scale: 1.18, facing: 'right', pose: 'stand', expression: { look: lerp(0.15, -0.08, kd) }, light: sun(200, 2020), t: T, key: 's11-kd' });
          CH.vinata.draw(g, { x: 900, y: 2020, scale: 1.12, facing: 'left', pose: 'stand', expression: { look: lerp(0.2, -0.06, vn) }, light: sun(900, 2020), t: T, key: 's11-vn' });
        },
      });
      void hd;
    },
    post: () => ({ bloom: 0.42, vignette: 0.36, paper: 0.34 }),
  });
})();
