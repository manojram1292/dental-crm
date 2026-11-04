/*
 * Ep 16 · line "nara" · "Beside him, Nara drew his great bow, and his arrows split the falling peaks."
 * Nara in profile, LARGE, the fire-sky behind; name card (beats[1]); he draws (beats[2]) and looses;
 * on "split" (beats[3]) a falling peak bursts into shards of light.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP16 = window.EP16;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'nara',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const b1 = env.beats[1] ?? 1.2, b2 = env.beats[2] ?? 1.6, b3 = env.beats[3] ?? 4.2;
      const draw = E.inOutCubic(clamp((t - b2 + 0.2) / 0.9)), loose = clamp((t - b3 + 0.5) / 0.5), burst = clamp((t - b3) / 0.8);
      const pk = clamp(t / (b3 + 0.1));
      EP16.battle(ctx, T, {
        streaks: 0.4,
        after: (g) => {
          if (burst <= 0) EP16.peak(g, lerp(500, 260, pk), lerp(-150, 640, pk), 0.8, T * 0.8, T, 1);
          EP16.burst(g, 260, 640, burst, T);
          CH.nara.draw(g, { x: 760, y: 2000, scale: 1.2, facing: 'left', pose: loose > 0 ? { name: 'loose', k: loose } : { name: 'draw', k: draw }, light: EP16.fireLight(760, 2000, 1.15), t: T, key: 'n16-na' });
        },
      });
      const la = clamp((t - b1) / 0.4) * (1 - clamp((t - b3 + 0.6) / 0.4));
      EP16.plaque(ctx, env.strings.naraName, null, KIT.CX, 250, la, { size: 60, key: 'n16-name' });
      void dur;
    },
    post: () => ({ bloom: 0.5, vignette: 0.48, paper: 0.3 }),
  });
})();
