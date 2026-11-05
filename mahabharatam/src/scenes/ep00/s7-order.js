/* Ep 0 · line "order" · "One minute at a time, episode by episode, in order, from the very first frame story." · Quick cuts on the beats through four released episodes, each with its badge: the storyteller at the fire (ep 1), the snake sacrifice (ep 8), the churning (ep 12), Garuda blazing (ep 19). */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP0 = window.EP0, EP8 = window.EP8, EP11 = window.EP11, EP12 = window.EP12;
  const { clamp, E } = R;
  const CH = KIT.characters;
  const SHOTS = [
    (ctx, T, u) => KIT.ashram.draw(ctx, T, { cycle: 0.3, speed: 0, cam: { zoom: 1.05 + 0.06 * u, dy: -40 }, smoke: { alpha: 0.3, lean: 10 }, teller: { x: 820, y: 1380, scale: 0.6, facing: 'left', pose: { name: 'speak', base: 'stand', k: 1 } } }),
    (ctx, T, u) => EP8.satra(ctx, T, { fire: 1.2, cam: { zoom: 0.95 + 0.06 * u, dy: 60 }, sky: (g) => EP8.fallers(g, T, 540, 1260, 18, 1, { top: -300 }) }),
    (ctx, T, u) => EP11.sea(ctx, T, { hz: 1000, cam: { zoom: 1.0 + 0.08 * u, dy: 60 }, after: (g) => EP12.churn(g, T, { cx: 540, y: 1600, s: 0.6, spin: T * 0.8, wrap: 1, hosts: 1, pull: Math.sin(T * 1.6) }) }),
    (ctx, T, u) => {
      KIT.vgrad(ctx, 0, R.H, [[0, '#3a0a10'], [0.45, '#b8401a'], [0.8, '#f0a040'], [1, '#ffe0a0']]);
      CH.garuda.draw(ctx, { x: 540, y: 1750 - 60 * u, scale: 0.7, facing: 'left', pose: { name: 'spread', k: 1, blaze: 0.8 }, light: { dir: -Math.PI / 2, intensity: 1.15, front: 0.6 }, t: T, key: 'o0-ga' });
    },
  ];
  R.scene({
    id: 'order',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, S = env.strings;
      const bs = [0, (env.beats[1] ?? 1.9) - 0.15, (env.beats[2] ?? 3.7) - 0.15, (env.beats[3] ?? 4.8) - 0.15];
      let i = 0; for (let k = 1; k < 4; k++) if (t >= bs[k]) i = k;
      const t0 = bs[i], t1 = i < 3 ? bs[i + 1] : dur;
      SHOTS[i](ctx, T, clamp((t - t0) / Math.max(0.5, t1 - t0)));
      const fl = clamp((t - t0) / 0.12); if (i && fl < 1) { ctx.save(); ctx.globalAlpha = 0.5 * (1 - fl); ctx.fillStyle = '#fff4e0'; ctx.fillRect(0, 0, R.W, R.H); ctx.restore(); }
      EP0.badge(ctx, S['montage' + (i + 1)], KIT.CX, 300, E.outCubic(clamp((t - t0) / 0.2)));
    },
    post: () => ({ bloom: 0.38, vignette: 0.45, paper: 0.3 }),
  });
})();
