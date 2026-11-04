/* Ep 20 · line "pray" · Kadru: "Indra, lord of the gods, save my sons!" · Kadru, riding on Vinata's back above the sea, lifts her hands to the sky. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP17 = window.EP17, EP20 = window.EP20;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'pray',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T;
      const k = E.inOutCubic(clamp(t / 0.7));
      EP17.ocean(ctx, T, { hz: 1500, cam: { zoom: 1.0 }, after: (g) => {
        const L = { dir: -Math.PI / 2, intensity: 1.1, front: 0.5 };
        CH.vinata.draw(g, { x: 520, y: 2080, scale: 1.05, facing: 'left', pose: { name: 'bow', k: 0.6, slave: true }, light: L, t: T, key: 'p20-vn' });
        CH.kadru.draw(g, { x: 620, y: 1560, scale: 1.0, facing: 'left', pose: { name: 'curse', base: 'sit', k }, expression: { speak: EP20.mouth(env, t) }, light: L, t: T, key: 'p20-kd' });
      } });
    },
    post: () => ({ bloom: 0.42, vignette: 0.42, paper: 0.3 }),
  });
})();
