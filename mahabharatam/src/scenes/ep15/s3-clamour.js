/*
 * Ep 15 · line "clamour" · "\"It is ours!\" they cried."
 * Close and low: asura arms and crowns jostling in from both sides round the glowing white pot,
 * Dhanvantari's light flickering between them; a drum on "ours" (beats[0]).
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP13 = window.EP13, EP15 = window.EP15;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'clamour',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b0 = env.beats[0] ?? 0.6;
      const push = E.outCubic(clamp((t - b0 + 0.4) / 0.8));
      EP13.whiteSea(ctx, T, {
        hz: 1500, cam: { zoom: 1.05 + 0.05 * p },
        after: (g) => {
          EP15.potGlow(g, 540, 1080 + 10 * Math.sin(T * 9) * push, 1.4, 1);
          for (const [x0, x1, y, s, f, i] of [[-300, 110, 2100, 1.2, 'right', 1], [1380, 980, 2100, 1.22, 'left', 2], [-400, 260, 2280, 1.35, 'right', 4], [1480, 830, 2280, 1.35, 'left', 0]]) {
            CH.asura.draw(g, { x: lerp(x0, x1, push), y, scale: s, facing: f, index: i, pose: { name: 'point', k: push }, expression: { mood: 'wrath', speak: EP15.mouth(env, t) }, light: { dir: f === 'right' ? 0 : Math.PI, intensity: 1.15, front: 0.5 }, t: T + i, key: 'c15-a' + i });
          }
        },
      });
    },
    post: () => ({ bloom: 0.44, vignette: 0.45, paper: 0.3 }),
  });
})();
