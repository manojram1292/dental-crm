/* Ep 19 · line "praise" · "So the gods praised Garuda, and asked him to spare them." · The gods bow with folded hands before Garuda, who hangs in the red sky, wings spread, blazing. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP10 = window.EP10;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'praise',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      const bow = E.inOutSine(clamp(t / 1.2));
      EP10.sky(ctx, T, { red: 1, cam: { zoom: 1.0 + 0.04 * p }, after: (g) => {
        CH.garuda.draw(g, { x: 560, y: 1350, scale: 0.6, facing: 'left', pose: { name: 'spread', k: 1, blaze: 0.9 }, light: { dir: -Math.PI / 2, intensity: 1.15, front: 0.55 }, t: T, key: 'p19-ga' });
        for (let i = 0; i < 4; i++) { const x = [120, 300, 780, 960][i]; CH.deva.draw(g, { x, y: 2000, scale: 0.8, facing: x < 540 ? 'right' : 'left', index: i, pose: { name: 'bow', k: bow }, light: { dir: -Math.PI / 2, intensity: 1.1, front: 0.45 }, t: T + i, key: 'p19-d' + i }); }
      } });
    },
    post: () => ({ bloom: 0.46, vignette: 0.42, paper: 0.3 }),
  });
})();
