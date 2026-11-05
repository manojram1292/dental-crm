/* Ep 0 · line "vyasa" · "This series tells it the way Vyasa's text tells it." · Vyasa at his hermitage in the morning light, dictating, the verses rising from him as gold script; his name plaque. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP0 = window.EP0, EP4 = window.EP4;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'vyasa',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b0 = env.beats[0] ?? 1.5;
      const z = 1.25 - 0.1 * E.inOutSine(p);
      EP4.hermitage(ctx, T, { cam: { zoom: z, dy: -60 }, sunUp: 1 });
      ctx.save(); KIT.camera(ctx, { x: 540, y: 1300, zoom: z, dy: -60 });
      ctx.fillStyle = '#2a2a26'; ctx.beginPath(); ctx.ellipse(470, 1365, 230, 50, 0, 0, R.TAU); ctx.fill();
      CH.vyasa.draw(ctx, { x: 470, y: 1340, scale: 0.9, facing: 'right', pose: { name: 'dictate', base: 'sit', k: E.inOutSine(clamp(t / 0.8)) }, expression: { speak: 0.3 + 0.3 * Math.sin(T * 7) }, light: EP4.sunLight(470, 1100, 1.0), t: T, key: 'v0-vy' });
      EP4.verses(ctx, T, 640, 900, 320, clamp((t - 0.3) / 1.4), { n: 46, seed: 5 });
      ctx.restore();
      EP4.grass(ctx, T, 1700, 0.9);
      const la = clamp((t - b0 + 0.6) / 0.4) * (1 - clamp((t - dur + 0.3) / 0.3));
      EP0.plaque(ctx, 'Vyasa', 'who composed the epic', KIT.CX, 300, la, { size: 60, key: 'v0-name' });
    },
    post: () => ({ bloom: 0.3, vignette: 0.42, paper: 0.3 }),
  });
})();
