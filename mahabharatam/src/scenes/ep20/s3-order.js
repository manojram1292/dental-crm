/* Ep 20 · line "order" · Kadru: "Vinata, carry me to Ramaniyaka. Your son will carry my sons." · Morning shore; Kadru LARGE, pointing out to sea (beats[1]) then at Garuda (beats[3]); the island's name card. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP11 = window.EP11, EP20 = window.EP20;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'order',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const b1 = env.beats[1] ?? 1, b3 = env.beats[3] ?? 3;
      const pt = E.inOutCubic(clamp((t - b1 + 0.3) / 0.5));
      EP11.shore(ctx, T, { cam: { zoom: 1.15, dy: -80 }, after: (g) => {
        const L = { dir: Math.atan2(1080 - 1400, 820 - 540), intensity: 1.05, front: 0.45 };
        CH.vinata.draw(g, { x: 620, y: 2000, scale: 0.9, facing: 'left', pose: { name: 'bow', k: 0.4, slave: true }, light: L, t: T, key: 'o20-vn' });
        CH.garuda.draw(g, { x: 930, y: 2000, scale: 0.62, facing: 'left', pose: 'stand', light: L, t: T, key: 'o20-ga' });
        CH.kadru.draw(g, { x: 250, y: 2000, scale: 1.15, facing: t < b3 ? 'left' : 'right', pose: { name: 'point', k: pt }, expression: { mood: 'wrath', speak: EP20.mouth(env, t) }, light: L, t: T, key: 'o20-kd' });
      } });
      const la = clamp((t - b1) / 0.4) * (1 - clamp((t - b3 + 0.2) / 0.4));
      EP20.plaque(ctx, env.strings.islandName, env.strings.islandEpithet, KIT.CX, 250, la, { size: 52, key: 'o20-name' });
      void dur;
    },
    post: () => ({ bloom: 0.42, vignette: 0.42, paper: 0.32 }),
  });
})();
