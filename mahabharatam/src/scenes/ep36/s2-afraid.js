/* Ep 36 · line "afraid" · "Vasuki came to his sister at night, afraid for his people." · The chamber at night (episode 35's): Vasuki's hood leans in at the doorway (left, large), she sits alone by the lamp (right). Recap band at the top. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP34 = window.EP34, EP35 = window.EP35, EP36 = window.EP36;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'afraid',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, p = E.inOutSine(clamp(t / env.dur));
      EP35.night(ctx, T, { lampX: 880, lampY: 1250, cam: { zoom: 1.25, dy: -460 }, after: (g) => {
        CH.nagini.draw(g, { x: 720, y: 1660, scale: 0.65, facing: 'left', pose: { name: 'sit' }, light: EP34.lamp(720, 1450, 880, 1250, 1.15), t: T, key: 'a36-ng' });
        CH.vasuki.draw(g, { x: lerp(-60, 60, p), y: 1950, scale: 0.75, facing: 'right', pose: { name: 'rise', k: 0.9 }, light: EP34.lamp(60, 1400, 880, 1250, 1.0), t: T, key: 'a36-va' });
      } });
      KIT.series.recapBand(ctx, T, clamp(t / 0.3) * (1 - clamp((t - 2.6) / 0.3)), env.strings, { y: 300 });
    },
    post: () => ({ bloom: 0.42, vignette: 0.52, paper: 0.3 }),
  });
})();
