/*
 * Ep 6 · line "ask" · "His teacher's wife asked for one gift: the earrings of King Paushya's queen."
 *
 * NEW PLACE, NEW LIGHT: the teacher's hermitage at morning (EP6.hermitage), a low warm
 * sun from the left, mist. The teacher's wife stands at the hut's door with her lamp;
 * Uttanka bows before her. On "wife" (beats[0]) her hand opens (ask); on "earrings"
 * (beats[1]) a vision of the two earrings kindles between them, gold.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP6 = window.EP6;
  const { clamp, E } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'ask',
    fadeIn: 0.6,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b0 = env.beats[0] ?? 1, b1 = env.beats[1] ?? dur * 0.6;
      const ask = E.inOutCubic(clamp((t - (b0 - 0.4)) / 0.8));
      const bow = E.inOutSine(clamp(t / 1.0)) * (1 - 0.6 * E.inOutSine(clamp((t - b1 + 0.2) / 0.8)));
      const vis = E.outCubic(clamp((t - (b1 - 0.3)) / 0.9));
      const S = EP6.HSUN;
      EP6.hermitage(ctx, T, {
        cam: { zoom: 1.06 + 0.05 * p, dy: -40 },
        after: (g) => {
          CH.gurupatni.draw(g, { x: 330, y: 1460, scale: 0.6, facing: 'right', pose: { name: 'ask', k: ask }, expression: { speak: 0 }, light: EP6.light(330, 1100, S.x, S.y, 1, 0.3), t: T, key: 'a6-w' });
          CH.uttanka.draw(g, { x: 760, y: 1480, scale: 0.6, facing: 'left', pose: { name: 'bow', k: bow }, expression: { look: -0.1 * vis }, light: EP6.light(760, 1100, S.x, S.y, 1, 0.3), t: T, key: 'a6-u' });
          if (vis > 0.01) {
            KIT.glow(g, 545, 1000, 300, '#ffd070', 0.35 * vis);
            KIT.kundala.pair(g, 545, 1000 + Math.sin(T * 1.2) * 8, 70 * (0.6 + 0.4 * vis), T, { a: vis, glow: 1.2 });
          }
        },
      });
    },
    post: () => ({ bloom: 0.32, vignette: 0.4, paper: 0.34 }),
  });
})();
