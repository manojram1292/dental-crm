/* Ep 31 · line "hook" · COLD OPEN (style B, direct speech in medias res) · "Hold the earth still, Shesha." · Beneath the earth: the seven-headed canopy rises into frame from t = 0 and meets the quaking underside of the earth, which steadies. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA;
  const { clamp, E, lerp } = R;
  R.scene({
    id: 'hook',
    draw(ctx, t, env) {
      const T = env.T;
      const up = E.outCubic(clamp(t / 1.6)), still = clamp((t - 1.2) / 0.8);
      EPA.under(ctx, T, { glow: 0.6 + 0.4 * up, shake: 1 - still, cam: { zoom: 1.1 - 0.06 * up, dy: 0 }, after: (g) => {
        EPA.shesha(g, 520, lerp(2750, 2420, up), 1.0, T, { k: 1, light: EPA.lit(520, 1600, 540, 2400, 1.1, 0.7, 0.4), key: 'h31-sh' });
        EPA.earth(g, 540, 700 + 20 * (1 - still) * Math.sin(T * 9), 1150, T, { tilt: 0.06 * (1 - still) * Math.sin(T * 5) });
      } });
      const sp = env.speech[1], out = clamp((t - sp - 0.05) / 0.3), line = env.script.lines[0];
      KIT.series.hookCard(ctx, T, 1, line.text, { y: 110, size: 84, gold: line.hookGold, out });
      const tk = clamp((t - sp - 0.25) / 0.8);
      if (tk > 0) KIT.series.episodeTitle(ctx, T, tk, env.strings, { y: 300, key: 'ep31-title' });
    },
    post: () => ({ bloom: 0.42, vignette: 0.46, paper: 0.3 }),
  });
})();
