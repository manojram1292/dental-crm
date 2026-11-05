/* Ep 18 · line "aruna" · "Just as her son Aruna had cursed." · The sky reddens; Aruna at the reins of the Sun's chariot, high and small, looks down on the two figures on the shore (a callback to episode 10). */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP10 = window.EP10;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'aruna',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const red = E.inOutSine(clamp(t / dur));
      EP10.sky(ctx, T, { red: 0.5 + 0.5 * red, after: (g) => {
        EP10.chariot(g, 760, 700, 0.5, T, { a: 1 });
        CH.aruna.draw(g, { x: 560, y: 960, scale: 0.42, facing: 'right', pose: { name: 'rein', k: 1 }, expression: { look: 0.25 }, light: { dir: 0, intensity: 1.1, front: 0.4 }, t: T, key: 'u18-ar' });
        CH.kadru.draw(g, { x: 430, y: 1900, scale: 0.42, facing: 'right', pose: 'stand', light: { dir: -1.2, intensity: 0.9, front: 0.3 }, t: T, key: 'u18-kd' });
        CH.vinata.draw(g, { x: 600, y: 1900, scale: 0.4, facing: 'left', pose: { name: 'bow', k: 1, slave: true }, light: { dir: -1.2, intensity: 0.9, front: 0.3 }, t: T, key: 'u18-vn' });
      } });
    },
    post: () => ({ bloom: 0.46, vignette: 0.45, paper: 0.3 }),
  });
})();
