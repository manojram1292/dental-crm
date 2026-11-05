/* Ep 22 · line "father" · "Flying on, he came to his father, Kashyapa." · NEW LIGHT: a high mountain hermitage at dawn, cold blue snow and a rose sky: Garuda alights before Kashyapa on the ledge; the plaque. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP22 = window.EP22;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'father',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const land = E.outCubic(clamp(t / (dur * 0.6)));
      const b1 = env.beats[1] ?? 2;
      EP22.peak(ctx, T, { cam: { zoom: 1.05 }, after: (g) => {
        CH.kashyapa.draw(g, { x: 330, y: 1430, scale: 0.55, facing: 'right', pose: 'sit', light: EP22.dawn(330, 1430), t: T, key: 'fa22-ka' });
        CH.garuda.draw(g, { x: lerp(980, 760, land), y: lerp(900, 1430, land), scale: 0.5, facing: 'left', pose: land < 0.95 ? { name: 'fly', phase: T * 5 } : { name: 'stand' }, light: EP22.dawn(760, 1430, 1.1), t: T, key: 'fa22-ga' });
      } });
      const la = clamp((t - b1 + 0.2) / 0.4) * (1 - clamp((t - dur + 0.3) / 0.3));
      EP22.plaque(ctx, env.strings.kashyapaName, env.strings.kashyapaEpithet, KIT.CX, 300, la, { size: 58, key: 'fa22-name' });
    },
    post: () => ({ bloom: 0.38, vignette: 0.42, paper: 0.32 }),
  });
})();
