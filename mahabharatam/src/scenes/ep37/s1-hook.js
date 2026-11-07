/* Ep 37 · line "hook" · COLD OPEN (a statement card) · "A man in the tree saw everything." · Inside the banyan's canopy: leaves part from frame 1 on the woodman's face, wide-eyed, looking down; far below on the white road, two small figures (healer, beggar); the card on the dark trunk. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP36 = window.EP36, EP37 = window.EP37, EP8 = window.EP8;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'hook',
    draw(ctx, t, env) {
      const T = env.T, part = E.outCubic(clamp(t / 1.4)), u = clamp(t / 3.4);
      EP37.road(ctx, T, { cam: { zoom: 1.0 }, after: (g) => {
        CH.healer.draw(g, { x: 470, y: 1560, scale: 0.22, facing: 'right', pose: { name: 'stand' }, light: EP37.noonLit(470, 1560), t: T, key: 'h37-he' });
        CH.takshaka.draw(g, { x: 600, y: 1560, scale: 0.22, facing: 'left', pose: { name: 'guise' }, light: EP37.noonLit(600, 1560), t: T, key: 'h37-tk' });
      } });
      ctx.save(); ctx.fillStyle = '#122a0c'; ctx.globalAlpha = 0.96;
      for (let i = 0; i < 16; i++) { const side = i % 2 ? 1 : -1, x = 540 + side * (160 + 260 * part) + (i - 8) * 30, y = 200 + (i * 97) % 1100; ctx.beginPath(); ctx.ellipse(x, y, 330, 170, side * 0.4, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
      ctx.strokeStyle = '#2a1a0a'; ctx.lineWidth = 70; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-100, 1240); ctx.quadraticCurveTo(500, 1150, 1180, 1220); ctx.stroke();
      CH.woodman.draw(ctx, { x: 600, y: lerp(1230, 1200, u), scale: 0.8, facing: 'left', pose: { name: 'crouch', k: 0.8 }, light: { dir: -Math.PI / 2, intensity: 1.1, front: 0.7, fill: 0.5 }, t: T, key: 'h37-wm' });
      ctx.save(); ctx.fillStyle = '#1a3a10'; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.ellipse(380 + i * 120 - 220 * part * (i < 2 ? 1 : -1), 760 + (i % 2) * 120, 140, 70, 0.3 * (i - 2), 0, Math.PI * 2); ctx.fill(); } ctx.restore();
      const sp = env.speech[1], out = clamp((t - sp - 0.05) / 0.3), line = env.script.lines[0];
      KIT.series.hookCard(ctx, T, 1, line.text, { y: 180, size: 82, gold: line.hookGold, out });
      const tk = clamp((t - sp - 0.15) / 0.7);
      if (tk > 0) KIT.series.episodeTitle(ctx, T, tk, env.strings, { y: 400, key: 'ep37-title' });
    },
    post: () => ({ bloom: 0.42, vignette: 0.5, paper: 0.3 }),
  });
})();
