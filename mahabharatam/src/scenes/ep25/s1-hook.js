/* Ep 25 · line "hook" · COLD OPEN (style B, in medias res) · the Valakhilyas: "Let there be another Indra!" · Night: the thumb-sized sages round a blue-white fire far too big for them, ladles raised; the flame surges from frame 1; the line on the card. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP25 = window.EP25;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'hook',
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      ctx.save(); KIT.camera(ctx, { x: 540, y: 1400, zoom: lerp(1.25, 1.1, E.outCubic(clamp(t / 1.5))) + 0.03 * p });
      EP25.rite(ctx, T, { h: lerp(500, 900, E.outCubic(clamp(t / 1.0))), after: (g) => {
        for (let i = 0; i < 12; i++) { const x = 280 + (i % 6) * 104 + (i > 5 ? 52 : 0), y = 1600 + (i > 5 ? 40 : 0); CH.valakhilya.draw(g, { x, y, scale: 0.13, facing: 'front', index: i % 8, pose: { name: 'bless', k: 0.6 + 0.4 * Math.sin(T * 3 + i) }, light: { dir: -Math.PI / 2, intensity: 1.1, front: 0.6 }, t: T, key: 'vk' + (i % 8) }); }
      } });
      ctx.restore();
      const sp = env.speech[1], out = clamp((t - sp - 0.05) / 0.3), line = env.script.lines[0];
      KIT.series.hookCard(ctx, T, 1, line.text, { y: 200, size: 84, gold: line.hookGold, out });
      const tk = clamp((t - sp - 0.25) / 0.8);
      if (tk > 0) KIT.series.episodeTitle(ctx, T, tk, env.strings, { y: 520, key: 'ep25-title' });
    },
    post: () => ({ bloom: 0.44, vignette: 0.46, paper: 0.3 }),
  });
})();
