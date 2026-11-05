/* Ep 24 · line "beak" · "He caught the falling branch in his beak, and flew on." · Alamba at violet twilight: the branch falling; Garuda snatches it in his beak (beats[1]) and lifts away. The unvoiced recap band rides the first 2.6 s. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP23 = window.EP23, EP24 = window.EP24;
  const { clamp, E, lerp } = R;
  R.scene({
    id: 'beak',
    fadeIn: 0.15,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const b1 = env.beats[1] ?? 1.6;
      const catchK = clamp((t - b1 + 0.1) / 0.2), up = E.inOutSine(clamp((t - b1) / (dur - b1)));
      EP23.alamba(ctx, T, { crack: 1, drop: catchK > 0 ? 1.5 : lerp(0.25, 0.6, clamp(t / b1)), cam: { zoom: 1.0, dy: 60 }, after: (g) => {
        if (catchK <= 0) { EP23.hangers(g, T, 26, 1, { crack: 1, drop: lerp(0.25, 0.6, clamp(t / b1)), s: 0.05 }); EP23.carry(g, lerp(300, 520, clamp(t / b1)), 820, 0.5, T, { key: 'bk24', light: EP23.dusk(500, 800, 1.15) }); }
        else EP24.loaded(g, lerp(520, 420, up), lerp(860, 520, up), 0.5, T, { key: 'bk24b', light: EP23.dusk(500, 800, 1.15) });
      } });
      KIT.series.recapBand(ctx, T, clamp(t / 0.3) * (1 - clamp((t - 2.6) / 0.35)), env.strings, { y: 1600 });
    },
    post: () => ({ bloom: 0.4, vignette: 0.45, paper: 0.32 }),
  });
})();
