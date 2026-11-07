/* Ep 34 · line "hook" · COLD OPEN (direct speech) · "Give me a bride with my name!" · The deep forest in green-gold shafts: the gaunt sage, arms raised, crying out; a ring of light spreads from him and birds lift from frame 1; the card at mid-height. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP34 = window.EP34, EP33 = window.EP33;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'hook',
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / 3.5);
      EP34.forest(ctx, T, { rings: [clamp(t / 1.6), clamp((t - 1.2) / 1.6)], ringAt: [600, 1500], cam: { zoom: 1.15 - 0.08 * p, dy: 40 }, after: (g) => {
        CH.jaratkaru.draw(g, { x: 620, y: 1880, scale: 1.05, facing: 'left', pose: { name: 'bless', k: 1 }, expression: { speak: EPA.mouth(env, t) }, light: EP34.shaft(620, 1700, 1.2), t: T, key: 'h34-jk' });
        for (let i = 0; i < 6; i++) { const u = clamp(t / 2.5 - i * 0.08), x = 200 + i * 130 + u * 200 * (i % 2 ? 1 : -1), y = 500 - u * 500 - i * 20; g.strokeStyle = '#0a1406'; g.lineWidth = 6; g.beginPath(); g.moveTo(x - 24, y + 10 * Math.sin(T * 14 + i)); g.lineTo(x, y); g.lineTo(x + 24, y + 10 * Math.sin(T * 14 + i)); g.stroke(); }
      } });
      const sp = env.speech[1], out = clamp((t - sp - 0.05) / 0.3), line = env.script.lines[0];
      KIT.series.hookCard(ctx, T, 1, line.text, { y: 640, size: 80, gold: line.hookGold, out });
      const tk = clamp((t - sp - 0.15) / 0.7);
      if (tk > 0) KIT.series.episodeTitle(ctx, T, tk, env.strings, { y: 760, key: 'ep34-title' });
    },
    post: () => ({ bloom: 0.4, vignette: 0.46, paper: 0.3 }),
  });
})();
