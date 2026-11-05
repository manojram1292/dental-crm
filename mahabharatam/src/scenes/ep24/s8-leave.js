/* Ep 24 · line "leave" · "The tiny sages let go of the branch, and left for the Himalaya." · One by one the sages let go and drift away like sparks of ash-white light toward far snow peaks. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP24 = window.EP24;
  const { clamp, E, lerp, hash } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'leave',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const b0 = env.beats[0] ?? 1;
      EP24.gandha(ctx, T, { cam: { zoom: 0.9, dy: 100 }, after: (g) => {
        g.save(); g.fillStyle = '#f4f4ff'; for (let i = 0; i < 5; i++) { const x = 600 + i * 120; g.beginPath(); g.moveTo(x - 80, 660); g.lineTo(x, 520 - (i % 2) * 40); g.lineTo(x + 80, 660); g.fill(); } g.restore();
      } });
      ctx.fillStyle = '#2a1a20'; ctx.fillRect(-20, 820, R.W + 40, 40);
      for (let i = 0; i < 16; i++) {
        const go = E.inOutSine(clamp((t - b0 + 0.3 - i * 0.12) / 1.6)), x0 = 40 + i * 66, y0 = 860;
        if (go <= 0) CH.valakhilya.hang(ctx, { x: x0, y: y0 - 4, scale: 0.12, index: i % 8, t: T, light: { dir: -Math.PI / 2, intensity: 1.05, front: 0.6 }, key: 'vk' + (i % 8) });
        else { const x = lerp(x0, 760 + hash(i, 2) * 260, go), y = lerp(y0, 560, go) - Math.sin(go * Math.PI) * 200; KIT.glow(ctx, x, y, 40, '#ffffff', 0.7 * (1 - go * 0.5)); CH.valakhilya.draw(ctx, { x, y: y + 60, scale: lerp(0.12, 0.03, go), facing: 'front', pose: 'stand', index: i % 8, alpha: 1 - go * 0.7, light: { dir: -Math.PI / 2, intensity: 1.05, front: 0.6 }, t: T, key: 'vk' + (i % 8) }); }
      }
      void dur;
    },
    post: () => ({ bloom: 0.42, vignette: 0.42, paper: 0.32 }),
  });
})();
