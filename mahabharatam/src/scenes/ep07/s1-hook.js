/*
 * Ep 7 · line "hook" · HOOK (Sauti) · "How did Takshaka kill King Parikshit?"
 *
 * The Naimisha fire at night, closer than before: Sauti large on the left, speaking; the
 * elder listening on the right. In the smoke above the fire, on "Takshaka" (beats[0]) a
 * cold green hood uncoils; on "Parikshit" (beats[1]) a crowned king's profile appears
 * beneath it in rose light and his name is set in gold. The episode title follows.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP7 = window.EP7;
  const { clamp, E } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'hook',
    fadeIn: 0.5,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur, 0, 1.3);
      const fl = KIT.flicker(T, 0);
      const b0 = env.beats[0] ?? 0.9, b1 = env.beats[1] ?? 2.5;
      const hood = E.outCubic(clamp((t - (b0 - 0.3)) / 0.9));
      const king = E.outCubic(clamp((t - (b1 - 0.4)) / 0.8));
      const k = E.inOutCubic(clamp((t - 0.1) / 0.8));
      const F = KIT.ashram.FIRE;
      KIT.ashram.draw(ctx, T, {
        cycle: 0.75, speed: 0, hide: [5, 6], turn: (i) => (i < 2 ? -0.5 : i > 2 ? 0.4 : -0.3),
        smoke: { alpha: 0.42, lean: 6 }, fireH: 240 + 30 * hood,
        cam: { zoom: 1.22 + 0.05 * E.inOutSine(p), dx: 30, dy: -60 },
        vision: (g) => {
          if (hood > 0.01) {
            KIT.glow(g, 560, 700, 420, '#20c880', 0.3 * hood, 'lighter', 0.8);
            EP7.ghost(g, 0.75 * hood, (q) => CH.takshaka.draw(q, { x: 600, y: 980, scale: 0.36, facing: 'left', pose: { name: 'strike', k: 0.25 * hood }, expression: { mood: 'wrath' }, light: { dir: -Math.PI / 2, intensity: 1, front: 0 }, t: T, key: 'h7-tk' }), 'h7-g1', 'screen');
          }
          if (king > 0.01) {
            KIT.glow(g, 470, 860, 260, '#ff8a8a', 0.25 * king, 'lighter');
            EP7.ghost(g, 1.0 * king, (q) => CH.parikshit.draw(q, { x: 450, y: 1000, scale: 0.34, facing: 'left', pose: 'stand', light: { dir: -Math.PI / 2 + 0.3, intensity: 1, front: 0.3 }, t: T, key: 'h7-pk' }), 'h7-g2', 'screen');
          }
        },
        after: (g) => {
          CH.sauti.draw(g, { x: 200, y: 1560, scale: 0.86, facing: 'right', pose: { name: 'speak', base: 'sit', k }, expression: { look: -0.06 * k, speak: EP7.mouth(env, t) }, light: { dir: Math.atan2(F.y - 1250, F.x - 200), intensity: fl, front: 0.25 }, t: T, key: 'h7-sauti' });
          CH.elder.draw(g, { x: 900, y: 1570, scale: 0.84, facing: 'left', pose: 'sit', expression: { look: -0.1 * hood }, light: { dir: Math.atan2(F.y - 1250, F.x - 900), intensity: fl, front: 0.2 }, t: T, key: 'h7-elder' });
        },
      });
      const na = clamp((t - (b1 - 0.1)) / 0.5) * (1 - clamp((t - env.speech[1] + 0.05) / 0.35));
      EP7.label(ctx, (env.strings.parikshitName || 'Parikshit').toUpperCase(), KIT.CX, 470, na, { size: 60, key: 'h7-name' });
      const tk = clamp((t - (env.speech[1] + 0.02)) / 1.0);
      if (tk > 0) KIT.series.episodeTitle(ctx, T, tk, env.strings, { y: 340, key: 'ep7-title' });
    },
    post: () => ({ bloom: 0.36, vignette: 0.5, paper: 0.32 }),
  });
})();
