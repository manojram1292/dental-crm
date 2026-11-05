/* Ep 29 · line "laugh" · "Garuda was not hurt. He laughed, and spoke gently." · The light clears: Garuda unharmed, his head thrown back (beats[1]); then turning calmly toward Indra. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP13 = window.EP13;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'laugh',
    fadeIn: 0.15,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const b1 = env.beats[1] ?? 1.4;
      const back = Math.sin(Math.PI * clamp((t - b1 + 0.2) / 1.0));
      EP13.storm(ctx, T, { flash: 0, rain: 0.1 });
      ctx.save(); ctx.fillStyle = 'rgba(255,240,210,0.12)'; ctx.fillRect(0, 0, R.W, R.H); ctx.restore();
      CH.garuda.draw(ctx, { x: 560, y: 2350, scale: 1.25, facing: 'left', pose: { name: 'spread', k: 0.7 + 0.3 * back }, expression: { look: -0.35 * back }, light: { dir: -Math.PI / 2 - 0.6, intensity: 1.2, front: 0.65 }, t: T, key: 'l29-ga' });
      void E; void dur;
    },
    post: () => ({ bloom: 0.44, vignette: 0.46, paper: 0.3 }),
  });
})();
