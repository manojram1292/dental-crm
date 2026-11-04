/* Ep 20 · line "fly" · "Vinata bore Kadru. Garuda bore the serpents, out over the sea." · Wide over the ocean: Vinata carrying Kadru below, Garuda with the serpents above. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP17 = window.EP17, EP20 = window.EP20;
  const { clamp, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'fly',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      EP17.ocean(ctx, T, { hz: 450, cam: { zoom: 1.0 }, after: (g) => {
        const L = { dir: -0.7, intensity: 1.05, front: 0.5 };
        const vx = lerp(820, 560, p), vy = 1700;
        CH.vinata.draw(g, { x: vx, y: vy, scale: 0.55, facing: 'left', pose: { name: 'bow', k: 0.5, slave: true }, light: L, t: T, key: 'f20-vn' });
        CH.kadru.draw(g, { x: vx + 40, y: vy - 230, scale: 0.42, facing: 'left', pose: 'sit', light: L, t: T, key: 'f20-kd' });
        EP20.carrier(g, lerp(700, 420, p), 1150, 0.5, T, { key: 'f20' });
      } });
    },
    post: () => ({ bloom: 0.4, vignette: 0.4, paper: 0.3 }),
  });
})();
