/*
 * Ep 11 · line "narayana" · THE TURN · Narayana: "Churn the ocean, gods and asuras together, and the amrita will rise."
 *
 * After a 350 ms rest: Narayana himself, frontal and LARGE, at the summit of Meru, his gold
 * lotus aureole opening behind him; Brahma on his lotus at the left, listening. On "Churn"
 * (beats[0], a bell) he raises his hand in speech; on "asuras" (beats[1]) the light turns
 * warmer; on "rise" (beats[2]) the discus flares. Caption lifted above the action.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP11 = window.EP11;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'narayana',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b0 = env.beats[0] ?? 0.4, b2 = env.beats[2] ?? 4.5;
      const sp = E.inOutCubic(clamp((t - b0 + 0.2) / 0.6)), fl = E.inOutSine(clamp((t - b2 + 0.3) / 0.6));
      const open = E.outCubic(clamp(t / 0.9));
      EP11.meru(ctx, T, {
        cam: { zoom: 2.2, dy: 900 - 60 * p },
        after: (g) => { g.fillStyle = 'rgba(30,14,4,0.35)'; g.fillRect(-400, -400, 2000, 2800); },
      });
      KIT.glow(ctx, 600, 1050, 1100 * open, '#ffd890', 0.45);
      CH.brahma.draw(ctx, { x: 190, y: 1880, scale: 0.5, facing: 'front', pose: { name: 'sit' }, light: { dir: 0, intensity: 1, front: 0.55 }, t: T, key: 'n11-br' });
      CH.vishnu.draw(ctx, { x: 640, y: 1930, scale: lerp(1.08, 1.13, p), facing: 'front', pose: fl > 0.01 ? { name: 'discus', k: 0.5 * fl } : { name: 'speak', k: sp }, light: { dir: -Math.PI / 2, intensity: 1.05 + 0.2 * fl, front: 0.5 }, t: T, key: 'n11-vi' });
    },
    post: () => ({ bloom: 0.5, vignette: 0.42, paper: 0.3 }),
  });
})();
