/*
 * Ep 8 · line "hook" · HOOK (Sauti) · "How would Janamejaya take revenge?"
 *
 * The Naimisha fire, close: Sauti large on the left, the elder on the right. On
 * "Janamejaya" (beats[0]) the young king's crowned figure rises in the smoke, lit from
 * below; on "revenge" (beats[1]) the fire leaps and a ring of serpents falls into it.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP8 = window.EP8;
  const { clamp, E } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'hook',
    fadeIn: 0.5,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur, 0, 1.3);
      const fl = KIT.flicker(T, 0);
      const b0 = env.beats[0] ?? 1, b1 = env.beats[1] ?? 2.4;
      const king = E.outCubic(clamp((t - (b0 - 0.3)) / 0.9));
      const rev = E.outCubic(clamp((t - (b1 - 0.2)) / 0.8));
      const k = E.inOutCubic(clamp((t - 0.1) / 0.8));
      const F = KIT.ashram.FIRE;
      KIT.ashram.draw(ctx, T, {
        cycle: 0.75, speed: 0, hide: [5, 6], turn: (i) => (i < 2 ? -0.5 : i > 2 ? 0.4 : -0.3),
        smoke: { alpha: 0.42, lean: 6 }, fireH: 240 + 90 * rev,
        cam: { zoom: 1.22 + 0.05 * E.inOutSine(p), dx: 30, dy: -60 },
        vision: (g) => {
          if (king > 0.01) {
            KIT.glow(g, 540, 820, 380, '#ff8a3a', 0.3 * king, 'lighter', 0.8);
            EP8.ghost(g, 1.0 * king, (q) => CH.janamejaya.draw(q, { x: 520, y: 1000, scale: 0.4, facing: 'left', pose: { name: 'bless', k: rev }, expression: { mood: 'wrath' }, light: { dir: Math.PI / 2, intensity: 1.1, front: 0.3 }, t: T, key: 'h8-jj' }), 'h8-g');
          }
          if (rev > 0.01) EP8.fallers(g, T, F.x, F.y - 40, 10, rev, { top: 380, wide: 0.5 });
        },
        after: (g) => {
          CH.sauti.draw(g, { x: 200, y: 1560, scale: 0.86, facing: 'right', pose: { name: 'speak', base: 'sit', k }, expression: { look: -0.06 * k, speak: EP8.mouth(env, t) }, light: { dir: Math.atan2(F.y - 1250, F.x - 200), intensity: fl, front: 0.25 }, t: T, key: 'h8-sauti' });
          CH.elder.draw(g, { x: 900, y: 1570, scale: 0.84, facing: 'left', pose: 'sit', expression: { look: -0.1 * king }, light: { dir: Math.atan2(F.y - 1250, F.x - 900), intensity: fl, front: 0.2 }, t: T, key: 'h8-elder' });
        },
      });
      const tk = clamp((t - (env.speech[1] + 0.02)) / 1.0);
      if (tk > 0) KIT.series.episodeTitle(ctx, T, tk, env.strings, { y: 340, key: 'ep8-title' });
    },
    post: () => ({ bloom: 0.38, vignette: 0.5, paper: 0.32 }),
  });
})();
