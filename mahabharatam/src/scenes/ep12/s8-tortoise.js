/*
 * Ep 12 · line "tortoise" · "Akupara, king of the tortoises, took the mountain on his back."
 *
 * A cut-away of the sea: above the waterline the night sky, below it the deep. The vast
 * tortoise rises from the depths (beats[0], name card); Indra above the water, vajra
 * raised, lowers the mountain onto his shell, and on "back" (beats[2], a drum) it settles.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP11 = window.EP11, EP12 = window.EP12;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'tortoise',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const b0 = env.beats[0] ?? 0.2, b2 = env.beats[2] ?? 4.4;
      const up = E.outCubic(clamp((t - b0 + 0.3) / 2.0)), set = E.inOutCubic(clamp((t - b2 + 1.6) / 1.6));
      EP11.sea(ctx, T, {
        hz: 760, jewels: 0.8,
        after: (g) => {
          // the deep: darker water below the line
          KIT.vgrad(g, 900, 2400, [[0, 'rgba(10,30,70,0.0)'], [0.15, 'rgba(6,16,44,0.65)'], [1, 'rgba(2,6,20,0.95)']], -400, 1480);
          CH.akupara.draw(g, { x: 600, y: lerp(2200, 1480, up), scale: 0.8, facing: 'left', pose: { name: 'bear', k: set, phase: T * 1.1 }, light: { dir: -Math.PI / 2 + 0.2, intensity: 1.2, front: 0.6 }, t: T, key: 't12-ak' });
          const my = lerp(500, 1090, set);
          CH.mandara.draw(g, { x: 540, y: my, scale: 0.36, facing: 'front', pose: { name: 'uprooted', k: 1 - 0.5 * set }, light: { dir: -Math.PI / 2 - 0.3, intensity: 1, front: 0.4 }, t: T, alpha: clamp(t / 0.6), key: 't12-m' });
          window.EP11.surf(g, 900, T, 0.85, { color: '#cfe0ff', deep: 'rgba(30,50,110,0.6)', deep2: 'rgba(6,16,44,0.4)' });
          CH.indra.draw(g, { x: 880, y: lerp(820, 880, set), scale: 0.55, facing: 'left', pose: { name: 'raise', k: 1 }, light: { dir: -Math.PI / 2 - 0.5, intensity: 1.05, front: 0.35 }, t: T, key: 't12-in' });
        },
      });
      const la = clamp((t - b0) / 0.5) * (1 - clamp((t - b2 + 0.3) / 0.4));
      EP12.plaque(ctx, env.strings.akuparaName, env.strings.akuparaEpithet, KIT.CX, 300, la, { size: 60, key: 't12-name' });
    },
    post: () => ({ bloom: 0.38, vignette: 0.45, paper: 0.3 }),
  });
})();
