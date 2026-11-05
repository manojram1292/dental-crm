/* Ep 25 · line "laugh" · THE TURN (≈ 47 %) · "Indra laughed at them, and stepped over them." · After a 0.9 s rest: the same macro ground; Indra's great foot and ankle come down over the puddle and pass above the floundering sages (beats[1]); his laughter as a gold shimmer from above. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP25 = window.EP25;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'laugh',
    fadeIn: 0.15,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const b0 = env.beats[0] ?? 0.5, b1 = env.beats[1] ?? 2;
      const step = E.inOutSine(clamp((t - b1 + 0.8) / 1.2));
      ctx.save(); KIT.camera(ctx, { x: 540, y: 1500, zoom: 1.0 });
      EP25.macro(ctx, T, { splash: 1, after: (g) => EP25.stalk(g, T, t, 1) });
      ctx.restore();
      // the laughter: gold shimmer pouring down from above
      const lg = Math.max(0, Math.sin(Math.PI * clamp((t - b0 + 0.2) / 1.6)));
      KIT.glow(ctx, 540, -100, 900, '#ffd060', 0.5 * lg, 'lighter', 0.4);
      // Indra's foot and shin, huge, sweeping across over the puddle
      CH.indra.draw(ctx, { x: lerp(-300, 1500, step), y: lerp(1300, 1180, Math.sin(Math.PI * step)), scale: 3.2, facing: 'right', pose: { name: 'walk', phase: 1.2 }, light: { dir: -Math.PI / 2 - 0.4, intensity: 1.05, front: 0.5 }, t: T, key: 'l25-in' });
      void dur;
    },
    post: () => ({ bloom: 0.36, vignette: 0.42, paper: 0.32 }),
  });
})();
