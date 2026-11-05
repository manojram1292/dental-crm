/* Ep 21 · line "demand" · "He asked the serpents: 'What will free us?'" · Low angle from behind the serpents' hoods: Garuda strides out of the grove onto the sand and towers over them. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP21 = window.EP21;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'demand',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, p = E.inOutSine(clamp(t / env.dur));
      EP21.grove(ctx, T, { near: false, cam: { zoom: 1.0, dy: 120 }, after: (g) => {
        CH.garuda.draw(g, { x: lerp(620, 540, p), y: 1640, scale: lerp(0.62, 0.72, p), facing: 'left', pose: { name: 'stand' }, expression: { speak: EP21.mouth(env, t), look: 0.1 }, light: EP21.amber(560, 1640, 1.2), t: T, key: 'd21-ga' });
      } });
      // the serpents' hoods close in the foreground, dark against the gold
      for (let i = 0; i < 3; i++) { const x = [150, 900, 420][i]; CH.naga.draw(ctx, { x, y: 2260, scale: [0.62, 0.55, 0.42][i], facing: x < 540 ? 'right' : 'left', index: i + 2, pose: { name: 'rise', k: 0.9 }, light: { dir: -0.6, intensity: 0.9, front: 0.25 }, t: T + i, key: 'd21-n' + i }); }
    },
    post: () => ({ bloom: 0.4, vignette: 0.45, paper: 0.32 }),
  });
})();
