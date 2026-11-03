/*
 * Ep 9 · line "hook" · HOOK (Sauti) · "But why would a mother curse her own sons?"
 *
 * The Naimisha fire, close: Sauti large, speaking; the elder leans in. In the smoke above
 * the fire, on "mother" (beats[0]) a crowned woman's shape (Kadru) bends over a nest of
 * small eggs; on "sons" (beats[1]) tiny hoods rise from the eggs. The title follows.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP9 = window.EP9;
  const { clamp, E } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'hook',
    fadeIn: 0.5,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur, 0, 1.3);
      const fl = KIT.flicker(T, 0);
      const b0 = env.beats[0] ?? 1.2, b1 = env.beats[1] ?? 2.4;
      const mom = E.outCubic(clamp((t - (b0 - 0.4)) / 0.9));
      const sons = E.outCubic(clamp((t - (b1 - 0.3)) / 0.8));
      const k = E.inOutCubic(clamp((t - 0.1) / 0.8));
      const F = KIT.ashram.FIRE;
      KIT.ashram.draw(ctx, T, {
        cycle: 0.75, speed: 0, hide: [5, 6], turn: (i) => (i < 2 ? -0.5 : i > 2 ? 0.4 : -0.3),
        smoke: { alpha: 0.42, lean: 6 }, fireH: 240,
        cam: { zoom: 1.22 + 0.05 * E.inOutSine(p), dx: 30, dy: -60 },
        vision: (g) => {
          if (mom > 0.01) {
            KIT.glow(g, 540, 800, 380, '#c8e070', 0.25 * mom, 'lighter', 0.8);
            EP9.ghost(g, 0.85 * mom, (q) => {
              CH.kadru.draw(q, { x: 470, y: 1000, scale: 0.4, facing: 'right', pose: { name: 'cradle', k: 0.4 }, light: { dir: Math.PI / 2, intensity: 1.1, front: 0.3 }, t: T, key: 'h9-kd' });
              for (let i = 0; i < 9; i++) EP9.egg(q, 560 + (i % 3) * 30, 975 - Math.floor(i / 3) * 18, 12, 'serpent', T, { glow: 0.2 });
              EP9.hoods(q, T, 590, 930, 30, sons, { r: 70, size: 10 });
            }, 'h9-g');
          }
        },
        after: (g) => {
          CH.sauti.draw(g, { x: 200, y: 1560, scale: 0.86, facing: 'right', pose: { name: 'speak', base: 'sit', k }, expression: { look: -0.06 * k, speak: EP9.mouth(env, t) }, light: { dir: Math.atan2(F.y - 1250, F.x - 200), intensity: fl, front: 0.25 }, t: T, key: 'h9-sauti' });
          CH.elder.draw(g, { x: 900, y: 1570, scale: 0.84, facing: 'left', pose: { name: 'speak', base: 'sit', k: 0.3 * mom }, expression: { look: -0.1 * mom }, light: { dir: Math.atan2(F.y - 1250, F.x - 900), intensity: fl, front: 0.2 }, t: T, key: 'h9-elder' });
        },
      });
      const tk = clamp((t - (env.speech[1] + 0.02)) / 1.0);
      if (tk > 0) KIT.series.episodeTitle(ctx, T, tk, env.strings, { y: 340, key: 'ep9-title' });
    },
    post: () => ({ bloom: 0.36, vignette: 0.5, paper: 0.32 }),
  });
})();
