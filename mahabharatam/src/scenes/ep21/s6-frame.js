/* Ep 21 · line "frame" · FRAME (Sauti) · "The price of his mother's freedom: the drink of the gods." · A tenth angle: from behind two sages' shoulders, the fire between them and Sauti, his hand cupped as if holding a pot; a small white glow in his palm. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP21 = window.EP21;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'frame',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      const fl = KIT.flicker(T, 0), F = KIT.ashram.FIRE;
      const b1 = env.beats[1] ?? 2.5;
      KIT.ashram.draw(ctx, T, {
        cycle: 0.82, speed: 0, hide: [3, 4], turn: () => 0, fireH: 240, smoke: { alpha: 0.28, lean: 4 },
        cam: { zoom: 1.35 + 0.05 * p, dx: 0, dy: -200 },
        middle: (g) => CH.sauti.draw(g, { x: 720, y: 1080, scale: 0.5, facing: 'left', pose: { name: 'speak', base: 'sit', k: E.inOutSine(clamp(t / 0.8)) }, expression: { speak: EP21.mouth(env, t) }, light: { dir: Math.atan2(F.y - 800, F.x - 540), intensity: fl * 1.2, front: 0.55 }, t: T, key: 'f21-sauti' }),
      });
      KIT.glow(ctx, 600, 980, 140, '#ffffff', 0.5 * E.outCubic(clamp((t - b1 + 0.3) / 0.5)), 'lighter', 0.4);
      // two sages' shoulders, close and dark in the foreground
      for (const [x, f] of [[120, 'right'], [960, 'left']]) CH.sage.draw(ctx, { x, y: 2250, scale: 1.25, facing: f === 'right' ? 'front' : 'front', index: x < 540 ? 3 : 5, pose: 'sit', light: { dir: -Math.PI / 2, intensity: fl * 0.7, front: 0.1 }, t: T, key: 'f21-s' + x });
    },
    post: () => ({ bloom: 0.42, vignette: 0.52, paper: 0.32 }),
  });
})();
