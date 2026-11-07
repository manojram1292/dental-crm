/* Ep 31 · line "eldest" · "Shesha was the eldest of the serpents." · NEW LIGHT, the serpents' grove at moonset: the white serpent among his dark brothers, taller than all; plaque. Unvoiced recap band over the first 2.6 s. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP17 = window.EP17;
  const { clamp, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'eldest',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      EP17.grove(ctx, T, { cam: { zoom: 1.05 + 0.08 * p, dy: -60 }, after: (g) => {
        KIT.glow(g, 820, 300, 700, '#ffd8a0', 0.25);   // the setting moon, warm and low (new light for the grove)
        for (let i = 0; i < 6; i++) { const x = 110 + i * 170 + (i > 2 ? 120 : 0); if (i === 3) continue; CH.naga.draw(g, { x, y: 1760, scale: 0.28, facing: x < 540 ? 'right' : 'left', index: i === 1 ? 0 : i, pose: { name: 'rise', k: 0.55 }, light: EP17.moonLight(x, 1760), t: T + i, key: 'e31-n' + i }); }
        EPA.shesha(g, 560, 1820, 0.62, T, { k: lerp(0.85, 1, p), light: EPA.lit(560, 1400, 820, 300, 1.1, 0.6, 0.4), key: 'e31-sh' });
      } });
      const pa = clamp((t - env.beats[1] + 0.3) / 0.3);
      EPA.plaque(ctx, env.strings.sheshaName, env.strings.sheshaEpithet, KIT.CX, 520, pa, { size: 52, key: 'e31-pl' });
      KIT.series.recapBand(ctx, T, clamp(t / 0.3) * (1 - clamp((t - 2.5) / 0.3)), env.strings, { y: 300 });
    },
    post: () => ({ bloom: 0.4, vignette: 0.44, paper: 0.3 }),
  });
})();
