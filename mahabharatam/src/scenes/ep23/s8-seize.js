/* Ep 23 · line "seize" · THE TURN (≈ 50 %) · "Garuda seized the elephant in one claw, and the tortoise in the other." · After a 0.85 s rest Garuda drops onto the lake and rises with the elephant in one set of talons and the tortoise in the other, water streaming off them. EP23.carry draws the load (reused at Alamba). */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP22 = window.EP22, EP23 = window.EP23;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'seize',
    fadeIn: 0.15,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const b0 = env.beats[0] ?? 0.4, b2 = env.beats[2] ?? 3;
      const down = E.inCubic(clamp(t / Math.max(0.3, b0))), up = E.inOutSine(clamp((t - b0) / (dur - b0)));
      const gy = lerp(lerp(500, 1100, down), 700, up);
      EP22.lake(ctx, T, { spray: Math.max(0, 1 - Math.abs(t - b0) * 1.5), cam: { zoom: 0.95, dy: 100 }, after: (g) => {
        if (up < 0.02) {
          CH.supratika.draw(g, { x: 400, y: 1360, scale: 0.42, facing: 'right', pose: { name: 'stand', fight: 0.6 }, light: { dir: -2.3, intensity: 1.05, front: 0.5 }, t: T, key: 's23-sup0' });
          CH.vibhavasu.draw(g, { x: 740, y: 1350, scale: 0.32, facing: 'left', pose: { name: 'swim', phase: T * 2, fight: 0.5 }, light: { dir: -2.3, intensity: 1.05, front: 0.5 }, t: T, key: 's23-vib0' });
          CH.garuda.draw(g, { x: 560, y: gy, scale: 0.6, facing: 'left', pose: { name: 'fly', phase: T * 6 }, light: { dir: -2.3, intensity: 1.15, front: 0.6 }, t: T, key: 's23-ga0' });
        } else {
          EP23.carry(g, 560, gy + 300, 0.75, T, { key: 's23', tortoise: clamp((t - b2 + 0.4) / 0.3) * 0 + 1 });
          for (let i = 0; i < 16; i++) { const life = (T * 1.4 + i / 16) % 1; g.globalAlpha = 0.6 * (1 - life); g.fillStyle = '#e8f0d0'; g.fillRect(420 + (i % 8) * 30, gy + 400 + life * 700, 4, 30); }
          g.globalAlpha = 1;
        }
      } });
    },
    post: () => ({ bloom: 0.4, vignette: 0.45, paper: 0.3 }),
  });
})();
