/* Ep 35 · line "named" · "Because his father said asti, the boy would be called Astika." · NEW LIGHT, the chamber at night, one lamp: she sits with her hands over the small gold flame; plaque "Astika · he who is". */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP34 = window.EP34, EP35 = window.EP35;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'named',
    fadeIn: 0.35,
    draw(ctx, t, env) {
      const T = env.T, p = E.inOutSine(clamp(t / env.dur));
      EP35.night(ctx, T, { lampX: 860, lampY: 1250, cam: { zoom: lerp(1.5, 1.65, p), dy: -560 }, after: (g) => {
        CH.nagini.draw(g, { x: 520, y: 1700, scale: 0.85, facing: 'right', pose: { name: 'sit' }, light: EP34.lamp(520, 1450, 860, 1250, 1.2), t: T, key: 'n35-ng' });
        EP35.flame(g, 610, 1420, 1.0, T, 1);
      } });
      EPA.plaque(ctx, env.strings.astikaName, env.strings.astikaEpithet, KIT.CX, 420, clamp((t - env.beats[1] + 0.2) / 0.3), { size: 60, key: 'n35-pl' });
    },
    post: () => ({ bloom: 0.46, vignette: 0.52, paper: 0.3 }),
  });
})();
