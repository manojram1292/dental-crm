/*
 * Ep 13 · line "cliff" · NEXT (cliffhanger image) · "But something else rose too: a poison that could burn the worlds."
 * AS TRADITION TELLS IT (the tag at the top: the poison is not in the CE's text). The white sea
 * darkens at the centre; a black-blue smoke boils up out of it (beats[1]) and spreads; the gods
 * and asuras in the foreground fall back (cower) on "burn" (beats[2]).
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP13 = window.EP13;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'cliff',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const b1 = env.beats[1] ?? 2.4, b2 = env.beats[2] ?? 4;
      const pk = E.inOutSine(clamp((t - b1 + 1.0) / 1.8)), fall = E.outCubic(clamp((t - b2 + 0.5) / 0.7));
      EP13.whiteSea(ctx, T, {
        hz: 1150, dark: 0.75 * pk, cam: { zoom: 1.0 + 0.05 * clamp(t / dur) },
        after: (g) => {
          EP13.poison(g, 540, 1350, T, pk);
          for (let i = 0; i < 3; i++) {
            CH.deva.draw(g, { x: 60 + i * 120, y: 1980 + i * 10, scale: 0.72, facing: 'right', index: [0, 3, 5][i], pose: { name: 'cower', k: fall }, light: { dir: -Math.PI / 2, intensity: 0.9, front: 0.3 }, t: T + i, key: 'x13-d' + i });
            CH.asura.draw(g, { x: 1020 - i * 120, y: 1980 + i * 10, scale: 0.74, facing: 'left', index: [1, 2, 4][i], pose: { name: 'cower', k: fall }, light: { dir: -Math.PI / 2, intensity: 0.9, front: 0.3 }, t: T + i, key: 'x13-a' + i });
          }
        },
      });
      KIT.series.traditionTag(ctx, T, clamp(t / 0.5), env.strings, { y: 250 });
    },
    post: () => ({ bloom: 0.4, vignette: 0.55, paper: 0.3 }),
  });
})();
