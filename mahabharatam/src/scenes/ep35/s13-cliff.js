/* Ep 35 · line "cliff" · NEXT 1 · "The boy grew up among the serpents. And the sacrifice drew near." · The flame grows into a small boy standing in Vasuki's hall at dawn among serpents (beats[0]); far off in the dark arcade, the red glow of the sacrificial fire swells (beats[1]). EP35.near is reused by the Next overlay. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP34 = window.EP34, EP35 = window.EP35;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  EP35.near = (ctx, T, t, b1) => {
    const boy = E.outCubic(clamp(t / 1.2)), red = E.inOutSine(clamp((t - b1 + 0.6) / 1.2));
    EPA.hall(ctx, T, { mood: 'dawn', cam: { zoom: 1.3, dy: -560 }, after: (g) => {
      KIT.glow(g, 900, 1000, 500 * (0.5 + red), '#ff3020', 0.55 * red);
      for (let i = 0; i < 4; i++) { const x = [120, 260, 830, 980][i]; CH.naga.draw(g, { x, y: 1700, scale: 0.34, facing: x < 540 ? 'right' : 'left', index: [0, 2, 3, 0][i], pose: { name: 'rise', k: 0.6 }, light: { dir: -Math.PI / 2, intensity: 1, front: 0.6, fill: 0.4 }, t: T + i, key: 'c35-n' + i }); }
      EP35.flame(g, 540, 1250, 1.3, T, 1 - boy);
      CH.astika.draw(g, { x: 540, y: 1700, scale: 0.62 * boy + 0.01, facing: 'right', pose: { name: 'stand' }, alpha: boy, light: { dir: -Math.PI / 2 - 0.3, intensity: 1.15, front: 0.75, fill: 0.5 }, t: T, key: 'c35-as' });
    } });
  };
  R.scene({
    id: 'cliff',
    fadeIn: 0.25,
    draw(ctx, t, env) { EP35.near(ctx, env.T, t, env.beats[1]); },
    post: () => ({ bloom: 0.46, vignette: 0.48, paper: 0.3 }),
  });
})();
