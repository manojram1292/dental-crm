/* Ep 26 · line "clear" · "The wind swept the sky clear, and the gods attacked." · The dust torn away in long streaks (beats[0]); the gods charge with spears from both sides toward Garuda. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP26 = window.EP26;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'clear',
    fadeIn: 0.15,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const b0 = env.beats[0] ?? 0.4, b1 = env.beats[1] ?? 2.4;
      const dust = 1 - E.inOutSine(clamp((t - b0 + 0.2) / 1.0)), ch = E.inOutSine(clamp((t - b1 + 1.0) / 1.2));
      EP26.court(ctx, T, { storm: 0.9, dust: dust * 0.8, cam: { zoom: 1.1, dy: -120 }, after: (g) => {
        CH.garuda.draw(g, { x: 540, y: 1480, scale: 0.5, facing: 'left', pose: { name: 'spread', k: 1 }, expression: { mood: 'wrath' }, light: EP26.storm(540, 1480, 1.2), t: T, key: 'c26-ga' });
        for (let i = 0; i < 6; i++) { const side = i < 3 ? -1 : 1, x = 540 + side * lerp(560 + (i % 3) * 90, 220 + (i % 3) * 90, ch), y = 1520 + (i % 3) * 25; CH.deva.draw(g, { x, y, scale: 0.4, facing: side < 0 ? 'right' : 'left', index: i, pose: { name: 'walk', phase: T * 7 + i }, light: EP26.storm(x, y), t: T, key: 'c26-d' + i }); }
      } });
      if (dust > 0.02) { ctx.save(); ctx.strokeStyle = `rgba(230,220,200,${0.6 * dust})`; ctx.lineWidth = 10; for (let i = 0; i < 12; i++) { const y = 200 + i * 140, x = (t * 900 + i * 170) % 1600 - 300; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 500, y - 60); ctx.stroke(); } ctx.restore(); }
      void dur;
    },
    post: () => ({ bloom: 0.4, vignette: 0.44, paper: 0.3 }),
  });
})();
