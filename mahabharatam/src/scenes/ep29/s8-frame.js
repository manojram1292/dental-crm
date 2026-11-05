/* Ep 29 · line "frame" · FRAME (Sauti) · "Then Indra asked for the amrita back." · An eighteenth angle: through the smoke, Sauti's open hand held out, palm up. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP29 = window.EP29;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'frame',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      const fl = KIT.flicker(T, 0), F = KIT.ashram.FIRE;
      KIT.ashram.draw(ctx, T, {
        cycle: 0.8, speed: 0, hide: [3, 4, 5], fireH: 260, smoke: { alpha: 0.6, lean: 20, h: 1400 },
        cam: { zoom: 1.6 + 0.05 * p, dx: -180, dy: -300 },
        after: (g) => CH.sauti.draw(g, { x: 760, y: 1280, scale: 0.6, facing: 'left', pose: { name: 'speak', base: 'sit', k: E.inOutSine(clamp(t / 0.6)) }, expression: { speak: EP29.mouth(env, t) }, light: { dir: Math.atan2(F.y - 1000, F.x - 760), intensity: fl * 1.2, front: 0.55 }, t: T, key: 'f29-sauti' }),
      });
    },
    post: () => ({ bloom: 0.42, vignette: 0.5, paper: 0.32 }),
  });
})();
