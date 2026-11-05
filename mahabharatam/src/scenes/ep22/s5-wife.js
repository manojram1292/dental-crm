/* Ep 22 · line "wife" · THE TURN (≈ 45 %) · the brahmin: "Not without my wife. She is a Nishadi." · After a 0.8 s rest: the brahmin stands at the edge of the great beak on the sand, lit from inside like a coal (pose.coal), his hand turned back toward his wife still in the shadow of the beak. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP21 = window.EP21, EP22 = window.EP22;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'wife',
    fadeIn: 0.15,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      const b0 = env.beats[0] ?? 1.2;
      EP21.bay(ctx, T, { village: 0.25, cam: { zoom: 1.0, dy: 0 } });
      ctx.save(); ctx.fillStyle = 'rgba(6,14,22,0.35)'; ctx.fillRect(0, 0, R.W, R.H); ctx.restore();
      // the great head lowered to the sand, behind them
      CH.garuda.draw(ctx, { x: 1180, y: 3000, scale: 2.0, facing: 'left', pose: { name: 'bow', k: 1 }, light: EP21.moon(1180, 3000, 0.9), t: T, key: 'w22-ga' });
      CH.nishadi.draw(ctx, { x: 820, y: 1900, scale: 0.62, facing: 'left', pose: 'stand', light: EP21.moon(820, 1900, 0.75), t: T, alpha: 0.75, key: 'w22-ni' });
      CH.brahmin.draw(ctx, { x: 470, y: 1940, scale: 0.95 + 0.04 * p, facing: 'left', pose: { name: 'speak', k: E.inOutSine(clamp((t - b0 + 0.4) / 0.6)), coal: 0.7 }, expression: { speak: EP22.mouth(env, t) }, light: { dir: Math.atan2(-1, 1), intensity: 1.1, front: 0.6 }, t: T, key: 'w22-br' });
    },
    post: () => ({ bloom: 0.42, vignette: 0.5, paper: 0.32 }),
  });
})();
