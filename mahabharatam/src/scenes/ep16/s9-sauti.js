/*
 * Ep 16 · line "sauti" · FRAME, closing the tale within the tale · Sauti: "And that is how the white horse rose from the ocean."
 * The Naimisha fire, Sauti at the left speaking, the elder nodding; above the fire the gold-ringed
 * medallion opens on the white horse once more (beats[0]), closing the loop opened in episode 11.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP11 = window.EP11, EP13 = window.EP13;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'sauti',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b0 = env.beats[0] ?? 1.6;
      const v = E.outCubic(clamp((t - b0 + 0.6) / 0.7));
      const fl = KIT.flicker(T, 0), F = KIT.ashram.FIRE;
      KIT.ashram.draw(ctx, T, {
        cycle: 0.75, speed: 0, hide: [5, 6], turn: (i) => (i < 2 ? -0.5 : i > 2 ? 0.4 : -0.3),
        smoke: { alpha: 0.3, lean: 6 }, fireH: 240,
        cam: { zoom: 1.18 + 0.04 * p, dx: 20, dy: -40 },
        after: (g) => {
          CH.sauti.draw(g, { x: 190, y: 1580, scale: 0.9, facing: 'right', pose: { name: 'speak', base: 'sit', k: 1 }, expression: { look: -0.1, speak: EP13.mouth(env, t) }, light: { dir: Math.atan2(F.y - 1250, F.x - 190), intensity: fl * 1.15, front: 0.45 }, t: T, key: 's16-sauti' });
          CH.elder.draw(g, { x: 900, y: 1590, scale: 0.86, facing: 'left', pose: { name: 'bow', base: 'sit', k: 0.3 + 0.2 * Math.sin(T * 2) }, expression: { look: -0.15 }, light: { dir: Math.atan2(F.y - 1250, F.x - 900), intensity: fl * 1.15, front: 0.4 }, t: T, key: 's16-elder' });
        },
      });
      EP11.roundel(ctx, 540, 640, 250, v, (g, TT) => EP11.shore(g, TT, { horse: { x: 560, y: 1200, scale: 0.42, pose: { name: 'walk', phase: TT * 3 } } }), T, { focus: [560, 980], zoom: 0.7, key: 's16-roundel' });
    },
    post: () => ({ bloom: 0.42, vignette: 0.5, paper: 0.32 }),
  });
})();
