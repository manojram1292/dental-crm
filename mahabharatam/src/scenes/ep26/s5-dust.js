/* Ep 26 · line "dust" · "The dust of his wings blinded the gods." · A wall of dust rolls across the courtyard from his beating wings; the gods' figures blur and shield their eyes. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP26 = window.EP26;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'dust',
    fadeIn: 0.15,
    draw(ctx, t, env) {
      const T = env.T;
      const d = E.inOutSine(clamp(t / 1.4));
      EP26.court(ctx, T, { storm: 0.8, dust: d, cam: { zoom: 1.2, dy: -180 }, after: (g) => {
        CH.garuda.draw(g, { x: 820, y: 1460, scale: 0.5, facing: 'left', pose: { name: 'fly', phase: T * 7 }, light: EP26.storm(820, 1460, 1.1), t: T, key: 'd26-ga' });
        for (let i = 0; i < 4; i++) { const x = 160 + i * 130; CH.deva.draw(g, { x, y: 1520, scale: 0.42, facing: 'right', index: i + 1, pose: { name: 'cower', k: d }, light: EP26.storm(x, 1520, 0.9), t: T, key: 'd26-d' + i }); }
      } });
    },
    post: () => ({ bloom: 0.38, vignette: 0.44, paper: 0.32 }),
  });
})();
