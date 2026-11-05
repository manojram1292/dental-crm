/* Ep 23 · line "lake" · "Enemies still, they fight in a lake: the elephant six yojanas high, the tortoise three." · The storm-green lake, wide and low: the two vast animals locked together, reeds flattened, spray. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP22 = window.EP22;
  const { clamp, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'lake',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      const L = { dir: -2.3, intensity: 1.1, front: 0.5 };
      const f = 0.5 + 0.5 * Math.sin(T * 2.2);
      EP22.lake(ctx, T, { spray: 0.6, cam: { zoom: lerp(0.9, 1.0, p), dx: lerp(-40, 40, p), dy: 120 }, after: (g) => {
        CH.supratika.draw(g, { x: 330, y: 1360, scale: 0.55, facing: 'right', pose: { name: 'stand', fight: f, trunk: Math.sin(T * 1.5) }, light: L, t: T, key: 'l23-sup' });
        CH.vibhavasu.draw(g, { x: 780, y: 1350, scale: 0.4, facing: 'left', pose: { name: 'swim', phase: T * 2, fight: 1 - f }, light: L, t: T, key: 'l23-vib' });
      } });
    },
    post: () => ({ bloom: 0.36, vignette: 0.46, paper: 0.3 }),
  });
})();
