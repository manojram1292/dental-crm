/* Ep 29 · line "feather" · THE TURN (≈ 45 %) · "One feather fell, so fine that all who saw it named him Suparna: the fine-feathered." · After a 0.9 s rest: NEW LIGHT, a silver noon among high clouds: a single gold feather falls, turning slowly, LARGE; small figures look up at it; the plaque. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP29 = window.EP29;
  const { clamp, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'feather',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b1 = env.beats[1] ?? 3;
      EP29.silver(ctx, T, {});
      EP29.feather(ctx, 540 + 120 * Math.sin(t * 1.3), lerp(500, 1150, p), 1.0, 0.35 * Math.sin(t * 1.1), T, 1);
      for (let i = 0; i < 5; i++) { const x = 160 + i * 190; CH.deva.draw(ctx, { x, y: 1880, scale: 0.28, facing: i < 2 ? 'right' : 'left', index: i, pose: { name: 'point', k: clamp((t - 0.8 - i * 0.2) / 0.5) }, light: { dir: -Math.PI / 2, intensity: 1.1, front: 0.6 }, t: T, key: 'fe29-d' + i }); }
      const la = clamp((t - b1 + 0.2) / 0.3) * (1 - clamp((t - dur + 0.3) / 0.3));
      EP29.plaque(ctx, env.strings.suparnaName, env.strings.suparnaEpithet, KIT.CX, 300, la, { size: 60, key: 'fe29-name' });
    },
    post: () => ({ bloom: 0.42, vignette: 0.38, paper: 0.3 }),
  });
})();
