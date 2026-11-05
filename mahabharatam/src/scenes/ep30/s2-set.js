/* Ep 30 · line "set" · "Garuda set the amrita down on a bed of kusha grass." · NEW LIGHT, Ramaniyaka at dawn: Garuda lowers the white pot onto the kusha; the plaque.  */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP30 = window.EP30, EP15 = window.EP15;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'set',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const b0 = env.beats[0] ?? 1;
      const down = E.inOutSine(clamp((t - 0.2) / (b0 + 0.6)));
      EP30.dawnIsle(ctx, T, { cam: { zoom: 1.4, dy: -380 }, after: (g) => {
        EP30.kusha(g, 520, 1700, 0.8, T, {});
        CH.garuda.draw(g, { x: 740, y: 1700, scale: 0.55, facing: 'left', pose: { name: 'bow', k: 0.6 * down }, light: EP30.dawn(740, 1700, 1.2), t: T, key: 's30-ga' });
        EP15.potGlow(g, 520, lerp(1350, 1640, down), 0.8, 1);
      } });
      const la = clamp((t - (env.beats[1] ?? 2) + 0.2) / 0.3) * (1 - clamp((t - dur + 0.3) / 0.3));
      EP30.plaque(ctx, env.strings.kushaName, env.strings.kushaEpithet, KIT.CX, 760, la, { size: 50, key: 's30-name' });
    },
    post: () => ({ bloom: 0.38, vignette: 0.4, paper: 0.3 }),
  });
})();
