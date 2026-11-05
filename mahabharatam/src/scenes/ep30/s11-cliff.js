/* Ep 30 · line "cliff" · NEXT 1 (the catalog line) · "The serpents were cheated twice over. And their mother's curse still stood." · The serpents' grove at night (episode 17's place): the serpents coiled under the roots; over them a red memory medallion of the snake sacrifice's fire (episode 8). EP30.curse is reused by the Next overlay. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP17 = window.EP17, EP11 = window.EP11, EP8 = window.EP8, EP30 = window.EP30;
  const { clamp, E } = R;
  const CH = KIT.characters;
  EP30.curse = (ctx, T, t, b1) => {
    const v = E.outCubic(clamp((t - b1 + 0.4) / 0.6));
    EP17.grove(ctx, T, { after: (g) => { for (let i = 0; i < 5; i++) CH.naga.draw(g, { x: 240 + i * 150, y: 1700, scale: 0.3, facing: i < 2 ? 'right' : 'left', index: i, pose: { name: 'rise', k: 0.5 }, light: EP17.moonLight(240 + i * 150, 1700), t: T + i, key: 'cu30-n' + i }); } });
    EP11.roundel(ctx, 540, 700, 260, v, (g, TT) => EP8.satra(g, TT, { fire: 1.2, sky: (q) => EP8.fallers(q, TT, 540, 1260, 14, 1, { top: -300 }) }), T, { focus: [540, 1150], zoom: 0.5, key: 'cu30-r', glow: '#ff6040' });
  };
  R.scene({
    id: 'cliff',
    fadeIn: 0.25,
    draw(ctx, t, env) { EP30.curse(ctx, env.T, t, env.beats[1] ?? 2); },
    post: () => ({ bloom: 0.42, vignette: 0.48, paper: 0.3 }),
  });
})();
