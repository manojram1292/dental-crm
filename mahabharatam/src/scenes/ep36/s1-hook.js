/* Ep 36 · line "hook" · COLD OPEN (a question card) · "Can one boy save a whole people?" · The small boy in the dark hall inside a vast ring of serpents' eyes that open one by one from frame 1; the card low in the dark beneath him. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP34 = window.EP34, EP35 = window.EP35, EP36 = window.EP36;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'hook',
    draw(ctx, t, env) {
      const T = env.T, u = clamp(t / 3.2);
      EPA.hall(ctx, T, { mood: 'violet', cam: { zoom: 1.1 - 0.05 * u, dy: -380 }, after: (g) => {
        g.save(); g.globalAlpha = 0.6; g.fillStyle = '#04020c'; g.fillRect(-600, -900, R.W + 1200, R.H + 1800); g.restore();
        for (let k = 0; k < 28; k++) { const a = (k / 28) * Math.PI * 2, x = 540 + Math.cos(a) * 470, y = 1250 + Math.sin(a) * 300, op = clamp(t * 9 - k * 0.3); if (op <= 0) continue; g.globalAlpha = op; g.fillStyle = k % 3 ? '#c8ff90' : '#ffe080'; for (const d of [-10, 10]) { g.beginPath(); g.ellipse(x + d, y, 7, 4, 0, 0, Math.PI * 2); g.fill(); } KIT.glow(g, x, y, 30, '#c8ff90', 0.5 * op); }
        g.globalAlpha = 1;
        CH.astika.draw(g, { x: 540, y: 1420, scale: 0.6, facing: 'left', pose: { name: 'stand' }, light: { dir: -Math.PI / 2, intensity: 1.15, front: 0.75, fill: 0.5 }, t: T, key: 'h36-as' });
      } });
      const sp = env.speech[1], out = clamp((t - sp - 0.05) / 0.3), line = env.script.lines[0];
      KIT.series.hookCard(ctx, T, 1, line.text, { y: 1440, size: 80, gold: line.hookGold, out });
      const tk = clamp((t - sp - 0.15) / 0.7);
      if (tk > 0) KIT.series.episodeTitle(ctx, T, tk, env.strings, { y: 1560, key: 'ep36-title' });
    },
    post: () => ({ bloom: 0.44, vignette: 0.52, paper: 0.3 }),
  });
})();
