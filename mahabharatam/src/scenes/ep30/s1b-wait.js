/* Ep 30 · line "wait" · "On Ramaniyaka, the serpents were waiting." · NEW LIGHT, Ramaniyaka at dawn: the serpents coiled on the pale beach looking up; a gold speck, Garuda, descends out of the pink sky. Unvoiced recap band first 2.6 s. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP30 = window.EP30;
  const { clamp, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'wait',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      EP30.dawnIsle(ctx, T, { cam: { zoom: 1.0 }, after: (g) => {
        for (let i = 0; i < 6; i++) { const x = 220 + i * 130; CH.naga.draw(g, { x, y: 1620 + (i % 2) * 20, scale: 0.2, facing: x < 540 ? 'right' : 'left', index: i, pose: { name: 'rise', k: 0.7 }, light: EP30.dawn(x, 1620), t: T + i, key: 'w30-n' + i }); }
        CH.garuda.draw(g, { x: lerp(860, 700, p), y: lerp(500, 800, p), scale: 0.16, facing: 'left', pose: { name: 'carry', k: 1 }, light: EP30.dawn(800, 700, 1.3), t: T, key: 'w30-ga' });
        KIT.glow(g, lerp(820, 670, p), lerp(380, 680, p), 90, '#ffffff', 0.6);
      } });
      KIT.series.recapBand(ctx, T, clamp(t / 0.3) * (1 - clamp((t - 2.6) / 0.35)), env.strings, { y: 1640 });
    },
    post: () => ({ bloom: 0.4, vignette: 0.4, paper: 0.3 }),
  });
})();
