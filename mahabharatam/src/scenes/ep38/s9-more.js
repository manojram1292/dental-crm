/* Ep 38 · line "more" · "He praised the king, the priests, and the fire itself." · NEW LIGHT, inside the enclosure at noon through smoke: three cuts on the beats: the king on his seat, the four priests in black, the fire. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP8 = window.EP8, EP34 = window.EP34, EP37 = window.EP37, EP38 = window.EP38;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'more',
    fadeIn: 0.1,
    draw(ctx, t, env) {
      const T = env.T, B = env.beats, sh = t < B[1] - 0.1 ? 0 : t < B[2] - 0.1 ? 1 : 2, ts = t - [0, B[1] - 0.1, B[2] - 0.1][sh];
      if (sh === 0) EP38.noonSatra(ctx, T, { cam: { zoom: 1.6 + 0.05 * ts, dy: -500, dx: -160 }, after: (g) => CH.janamejaya.draw(g, { x: 840, y: 1760, scale: 0.85, facing: 'left', pose: { name: 'sit' }, light: EP8.fireLight(520, 1500, 1.2, 0.75), t: T, key: 'mo38-jj' }) });
      else if (sh === 1) EP38.noonSatra(ctx, T, { cam: { zoom: 1.3 + 0.05 * ts, dy: -300 }, after: (g) => { for (let i = 0; i < 4; i++) CH.priest.draw(g, { x: 180 + i * 240, y: 1700, scale: 0.55, facing: i < 2 ? 'right' : 'left', index: i, pose: { name: 'offer', k: 0.6 }, light: EP8.fireLight(180 + i * 240, 1500, 1.15, 0.7), t: T + i, key: 'mo38-p' + i }); } });
      else EP38.noonSatra(ctx, T, { fire: 1.3, cam: { zoom: 1.6 + 0.08 * ts, dy: -220 } });
    },
    post: () => ({ bloom: 0.46, vignette: 0.46, paper: 0.3 }),
  });
})();
