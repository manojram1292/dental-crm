/* Ep 23 · line "hook" · COLD OPEN (style C: a statement card over the answer image) · "Two brothers became an elephant and a tortoise." · The storm-green lake: the elephant rears and crashes down on the tortoise from frame 1, spray thrown high. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP22 = window.EP22;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'hook',
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      const f = 0.5 + 0.5 * Math.cos(t * 2.6);   // rearing up from frame 0, crashing at ≈ 1.2 s, rising again
      const L = { dir: -2.3, intensity: 1.1, front: 0.5 };
      EP22.lake(ctx, T, { spray: 1 - f * 0.6, cam: { zoom: lerp(1.25, 1.35, p), dy: -120 }, after: (g) => {
        CH.vibhavasu.draw(g, { x: 740, y: 1330, scale: 0.42, facing: 'left', pose: { name: 'swim', phase: T * 2, fight: 1 - f }, light: L, t: T, key: 'h23-vib' });
        CH.supratika.draw(g, { x: 380, y: 1340, scale: 0.48, facing: 'right', pose: { name: 'stand', fight: f, trunk: lerp(-0.4, 0.8, f) }, light: L, t: T, key: 'h23-sup' });
      } });
      const sp = env.speech[1], out = clamp((t - sp - 0.05) / 0.3), line = env.script.lines[0];
      KIT.series.hookCard(ctx, T, 1, line.text, { y: 200, size: 80, gold: line.hookGold, out });
      const tk = clamp((t - sp - 0.25) / 0.8);
      if (tk > 0) KIT.series.episodeTitle(ctx, T, tk, env.strings, { y: 520, key: 'ep23-title' });
      void E;
    },
    post: () => ({ bloom: 0.38, vignette: 0.46, paper: 0.3 }),
  });
})();
