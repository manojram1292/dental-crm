/* Ep 19 · line "agni" · THE TURN · Agni: "This is not my fire. It is Garuda, Vinata's son, as bright as I am." · Agni LARGE, speaking, pointing out across the sky at the far blaze of Garuda. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP8 = window.EP8;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'agni',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b1 = env.beats[1] ?? 1.6;
      const pt = E.inOutCubic(clamp((t - b1 + 0.4) / 0.6));
      EP8.svarga(ctx, T, {});
      ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = 'rgba(255,130,80,0.75)'; ctx.fillRect(0, 0, R.W, R.H); ctx.restore();
      KIT.glow(ctx, 180, 560, 400, '#ffd060', 0.8);
      CH.garuda.draw(ctx, { x: 200, y: 820, scale: 0.22, facing: 'right', pose: { name: 'fly', phase: T * 4, blaze: 1 }, light: { dir: -1.4, intensity: 1.1, front: 0.6 }, t: T, key: 'a19-ga' });
      CH.agni.draw(ctx, { x: 700, y: 2000, scale: 1.25 + 0.04 * p, facing: 'left', pose: pt > 0.01 ? { name: 'point', k: pt } : { name: 'speak', k: 1 }, expression: { speak: window.EP17.mouth(env, t) }, light: { dir: -Math.PI / 2 - 0.4, intensity: 1.2, front: 0.55 }, t: T, key: 'a19-ag' });
      void dur;
    },
    post: () => ({ bloom: 0.48, vignette: 0.42, paper: 0.3 }),
  });
})();
