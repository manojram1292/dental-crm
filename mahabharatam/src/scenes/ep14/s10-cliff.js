/*
 * Ep 14 · line "cliff" · NEXT (cliffhanger image; back in the CE, no tag) · "And the asuras, seeing the amrita, wanted it all."
 * The asuras crowd forward, LARGE in the right foreground, toward Dhanvantari and his glowing pot
 * at the left; on "all" (beats[2]) the nearest reaches for it.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP13 = window.EP13;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'cliff',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b2 = env.beats[2] ?? 3.5;
      const reach = E.inOutCubic(clamp((t - b2 + 0.4) / 0.6));
      EP13.whiteSea(ctx, T, {
        hz: 1350, cam: { zoom: 1.0 + 0.05 * p },
        after: (g) => {
          CH.dhanvantari.draw(g, { x: 300, y: 1800, scale: 0.85, facing: 'front', pose: { name: 'offer', k: 0.5 }, light: EP13.seaGlow(300, 1700, 1.1), t: T, key: 'c14-dh' });
          window.EP11.surf(g, 1760, T, 1, { color: '#ffffff', deep: '#ecebf8', deep2: '#b8b8d8' });
          for (let i = 2; i >= 0; i--) {
            const x = lerp(1250, 800 + i * 150, E.outCubic(clamp(t / 1.6))) , y = 2020 + i * 20;
            CH.asura.draw(g, { x, y, scale: 1.05 - i * 0.08, facing: 'left', index: [2, 0, 5][i], pose: i === 0 ? { name: 'point', k: reach } : { name: 'walk', phase: T * 3 + i, stride: 0.4 }, expression: { mood: 'wrath', look: -0.1 }, light: { dir: Math.PI + 0.2, intensity: 1.1, front: 0.45 }, t: T + i, key: 'c14-a' + i });
          }
        },
      });
    },
    post: () => ({ bloom: 0.42, vignette: 0.45, paper: 0.3 }),
  });
})();
