/* Ep 23 · line "rauhina" · "At Alamba, a great tree, Rauhina, offered him its branch, a hundred yojanas long." · NEW LIGHT: the holy grove at violet twilight, gold fruit-lamps in the giant trees; Rauhina's vast branch across the frame; Garuda flies in with his load; the plaque. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP23 = window.EP23;
  const { clamp, E, lerp } = R;
  R.scene({
    id: 'rauhina',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = E.inOutSine(clamp(t / dur));
      const b1 = env.beats[1] ?? 1.5;
      EP23.alamba(ctx, T, { cam: { zoom: 0.9 + 0.08 * p, dy: 60 }, after: (g) => {
        EP23.carry(g, lerp(-200, 420, p), lerp(300, 520, p), 0.55, T, { key: 'r23', light: EP23.dusk(400, 600, 1.15) });
      } });
      const la = clamp((t - b1 + 0.2) / 0.4) * (1 - clamp((t - dur + 0.3) / 0.3));
      EP23.plaque(ctx, env.strings.rauhinaName, env.strings.rauhinaEpithet, KIT.CX, 1640, la, { size: 52, key: 'r23-name' });
    },
    post: () => ({ bloom: 0.4, vignette: 0.45, paper: 0.32 }),
  });
})();
