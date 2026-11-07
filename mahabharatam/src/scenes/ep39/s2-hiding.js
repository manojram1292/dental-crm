/* Ep 39 · line "hiding" · "Takshaka was hiding in heaven, with Indra." · NEW LIGHT, Indra's heaven by day under a rumour of smoke: Indra on his throne, lit; Takshaka coiled small behind it, hiding. Recap band at the top. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP8 = window.EP8, EP37 = window.EP37, EP38 = window.EP38, EP39 = window.EP39;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'hiding',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, p = E.inOutSine(clamp(t / env.dur));
      EP39.heaven(ctx, T, { cam: { zoom: lerp(1.1, 1.2, p), dy: -260 }, after: (g) => {
        CH.takshaka.draw(g, { x: 820, y: 1520, scale: 0.42, facing: 'left', pose: { name: 'recoil', k: 0.6 }, light: EP39.skyLit(820, 1520), t: T, key: 'hi39-tk' });
        CH.indra.draw(g, { x: 520, y: 1560, scale: 0.75, facing: 'right', pose: { name: 'sit' }, light: EP39.skyLit(520, 1560, 1.2), t: T, key: 'hi39-in' });
      } });
      KIT.series.recapBand(ctx, T, clamp(t / 0.3) * (1 - clamp((t - 2.4) / 0.3)), env.strings, { y: 300 });
    },
    post: () => ({ bloom: 0.42, vignette: 0.44, paper: 0.3 }),
  });
})();
