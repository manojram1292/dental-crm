/* Ep 36 · line "teacher" · "He learned the sacred texts from the sage Chyavana." · NEW LIGHT, a hermitage of Bhrigu's line at morning: green forest, an ember-red sacred fire; the boy seated before the ember-lit teacher, palm leaves; plaque "Chyavana · son of Bhrigu". */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP34 = window.EP34, EP35 = window.EP35, EP36 = window.EP36;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'teacher',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, p = E.inOutSine(clamp(t / env.dur));
      EP36.ashram(ctx, T, { cam: { zoom: lerp(1.15, 1.25, p), dy: -340 }, after: (g) => {
        CH.chyavana.draw(g, { x: 820, y: 1500, scale: 0.7, facing: 'left', pose: { name: 'speak', base: 'sit', k: 0.6 + 0.4 * Math.sin(t * 2) }, light: EP36.fireLit(820, 1300, 1.2), t: T, key: 't36-ch' });
        CH.astika.draw(g, { x: 260, y: 1520, scale: 0.5, facing: 'right', pose: { name: 'sit' }, light: EP36.fireLit(260, 1300, 1.2), t: T, key: 't36-as' });
      } });
      EPA.plaque(ctx, env.strings.chyavanaName, env.strings.chyavanaEpithet, KIT.CX, 360, clamp((t - env.beats[1] + 0.3) / 0.3) * (1 - clamp((t - env.dur + 0.4) / 0.3)), { size: 52, key: 't36-pl' });
    },
    post: () => ({ bloom: 0.42, vignette: 0.44, paper: 0.32 }),
  });
})();
