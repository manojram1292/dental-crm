/* Ep 26 · line "vayu" · THE TURN (≈ 45 %) · Indra: "Vayu! Blow this dust away!" · After a 0.85 s rest: Indra through the dust, close, vajra raised, crying out. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP26 = window.EP26;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'vayu',
    fadeIn: 0.15,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      EP26.court(ctx, T, { storm: 0.8, dust: 0.75 - 0.3 * p, cam: { zoom: 1.0 } });
      CH.indra.draw(ctx, { x: 560, y: 2600 - 30 * p, scale: 1.7, facing: 'left', pose: { name: 'raise', k: E.outCubic(clamp(t / 0.5)) }, expression: { speak: EP26.mouth(env, t), mood: 'wrath' }, light: { dir: -Math.PI / 2 - 0.4, intensity: 1.15, front: 0.6 }, t: T, key: 'v26-in' });
    },
    post: () => ({ bloom: 0.42, vignette: 0.5, paper: 0.3 }),
  });
})();
