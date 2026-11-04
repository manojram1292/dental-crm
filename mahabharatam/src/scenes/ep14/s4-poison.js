/*
 * Ep 14 · line "poison" · "As the churning went on, a poison rose: the kalakuta, black as smoke."
 * The rig at night on the white sea; out of the centre the black-blue smoke boils up (beats[1])
 * and towers; its name card on "kalakuta" (beats[2]). Tagged.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP12 = window.EP12, EP13 = window.EP13, EP14 = window.EP14;
  const { clamp, E } = R;
  R.scene({
    id: 'poison',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b1 = env.beats[1] ?? 2.8, b2 = env.beats[2] ?? 3.9;
      const pk = E.inOutSine(clamp((t - b1 + 1.2) / 2.0));
      EP13.whiteSea(ctx, T, {
        hz: 1000, dark: 0.35 + 0.35 * pk, cam: { zoom: 1.0 + 0.06 * p },
        after: (g) => {
          EP12.churn(g, T, { cx: 760, y: 1560, s: 0.42, spin: T * 1.2 * (1 - pk * 0.8), wrap: 1, hosts: 1, pull: Math.sin(T * 2), light: EP13.seaGlow(760, 1400, 0.9) });
          EP13.poison(g, 380, 1550, T, pk);
          window.EP11.surf(g, 1530, T, 1, { color: '#e8e8f4', deep: '#9a9ab8', deep2: '#3a3a58' });
        },
      });
      EP14.tag(ctx, T, 1, env.strings);
      const la = clamp((t - b2) / 0.4) * (1 - clamp((t - dur + 0.3) / 0.3));
      EP14.plaque(ctx, env.strings.poisonName, env.strings.poisonEpithet, KIT.CX, 760, la, { size: 58, key: 'p14-name' });
    },
    post: () => ({ bloom: 0.4, vignette: 0.5, paper: 0.3 }),
  });
})();
