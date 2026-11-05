/* Ep 25 · line "omen" · "Under the omens, Indra asked his teacher, Brihaspati, what they meant." · NEW LIGHT: Indra's council hall at night, gold lamps, the arches red with the omen-sky; Indra turns to Brihaspati; the plaque. Unvoiced recap band for the first 2.6 s. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP25 = window.EP25;
  const { clamp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'omen',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b2 = env.beats[1] ?? 2.5;
      EP25.hall(ctx, T, { cam: { zoom: 1.0 + 0.05 * p }, after: (g) => {
        CH.indra.draw(g, { x: 700, y: 1640, scale: 0.75, facing: 'left', pose: { name: 'speak', k: 0.7 }, expression: { speak: 0 }, light: EP25.lamp(700, 1640), t: T, key: 'o25-in' });
        CH.brihaspati.draw(g, { x: 300, y: 1640, scale: 0.72, facing: 'right', pose: 'stand', light: EP25.lamp(300, 1640), t: T, key: 'o25-br' });
      } });
      KIT.series.recapBand(ctx, T, clamp(t / 0.3) * (1 - clamp((t - 2.6) / 0.35)), env.strings, { y: 1780 });
      const la = clamp((t - b2) / 0.3) * (1 - clamp((t - dur + 0.3) / 0.3));
      EP25.plaque(ctx, env.strings.brihaspatiName, env.strings.brihaspatiEpithet, KIT.CX, 760, la, { size: 50, key: 'o25-name' });
    },
    post: () => ({ bloom: 0.4, vignette: 0.46, paper: 0.32 }),
  });
})();
