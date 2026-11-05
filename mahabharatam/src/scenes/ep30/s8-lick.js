/* Ep 30 · line "lick" · "They came back to find it gone, and licked the grass where it had stood." · The serpents return to the empty kusha bed; heads lowered, they lick the blades. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP30 = window.EP30;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'lick',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      const b1 = env.beats[1] ?? 2;
      const low = E.inOutSine(clamp((t - b1 + 0.4) / 0.8));
      EP30.dawnIsle(ctx, T, { cam: { zoom: 2.0 + 0.06 * p, dy: -700 }, after: (g) => {
        EP30.kusha(g, 520, 1700, 0.8, T, { glow: 0.2 });
        for (let i = 0; i < 4; i++) { const x = 360 + i * 110; CH.naga.draw(g, { x, y: 1730, scale: 0.24, facing: x < 520 ? 'right' : 'left', index: i + 1, pose: { name: 'rise', k: lerp(0.8, 0.3, low) + 0.05 * Math.sin(T * 5 + i) }, light: EP30.dawn(x, 1730), t: T + i, key: 'l30-n' + i }); }
      } });
    },
    post: () => ({ bloom: 0.38, vignette: 0.42, paper: 0.3 }),
  });
})();
