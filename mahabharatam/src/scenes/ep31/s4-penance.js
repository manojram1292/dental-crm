/* Ep 31 · line "penance" · "He went from holy place to holy place, and lived on air alone." · NEW LIGHT, the holy places before dawn: a cut on each beat (Gandhamadana, Badari, Gokarna, Pushkara), each with its plaque; the white serpent smaller each time (a journey). */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA;
  const { clamp } = R;
  R.scene({
    id: 'penance',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, B = env.beats;
      let i = 0; for (let k = 1; k < 4; k++) if (t >= B[k] - 0.1) i = k;
      const tin = t - (i ? B[i] - 0.1 : 0), next = i < 3 ? B[i + 1] - 0.1 : env.dur;
      const xs = [700, 380, 760, 420], ss = [0.42, 0.36, 0.32, 0.3];
      EPA.penance(ctx, T, { place: i, cam: { zoom: 1.08 + 0.05 * clamp(tin / (next - (i ? B[i] - 0.1 : 0))), dx: (i % 2 ? 1 : -1) * 30 * tin }, after: (g) => {
        EPA.shesha(g, xs[i], 1560, ss[i], T, { k: 0.9, w: 130 - i * 14, light: EPA.lit(xs[i], 1200, 540, 1200, 0.9, 0.55, 0.45), key: 'p31-sh' + i });
      } });
      const a = clamp(tin / 0.25) * (1 - clamp((tin - (next - (i ? B[i] - 0.1 : 0)) + 0.2) / 0.2));
      EPA.plaque(ctx, env.strings.places[i], null, KIT.CX, 470, a, { size: 56, key: 'p31-pl' + i });
    },
    post: () => ({ bloom: 0.36, vignette: 0.46, paper: 0.32 }),
  });
})();
