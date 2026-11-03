/*
 * Ep 6 · line "anger" · "But his anger burned on."
 *
 * Night on the road above: Uttanka stands at the lip of the closing cleft, the earrings in
 * his hand, looking down at the last of the green light. On "anger" (beats[0]) his
 * dawn-coral rim burns toward red (mood wrath: an ember in his eye, a red under-glow).
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP6 = window.EP6;
  const { clamp, E } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'anger',
    fadeIn: 0.5,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b0 = env.beats[0] ?? 0.6;
      const wr = E.inOutSine(clamp((t - (b0 - 0.3)) / 0.8));
      EP6.road(ctx, T, {
        night: 0.85, cleft: 0.45 * (1 - p), cam: { zoom: 1.5 + 0.1 * p, dx: 150, dy: -260 },
        after: (g) => {
          const uo = { x: 380, y: 1556, scale: 0.6, facing: 'left', pose: { name: 'hold', k: 1 }, expression: { mood: wr > 0.4 ? 'wrath' : 'calm', look: 0.25 }, light: { dir: Math.atan2(-300, 400), intensity: 0.8 + 0.4 * wr, front: 0.1 }, t: T, key: 'g7-u' };
          if (wr > 0.01) KIT.glow(g, 380, 1200, 600, '#ff3a1a', 0.3 * wr);
          CH.uttanka.draw(g, uo);
          const h = CH.uttanka.anchor(uo, 'hand');
          KIT.kundala.pair(g, h[0], h[1] - 20, 30, T, { glow: 0.8 });
          KIT.embers(g, T, { x: 380, y: 1300, spread: 160, rate: 10 * wr, life: 1.8, rise: 200, sway: 30, size: 2.5, alpha: wr, seed: 77 });
        },
      });
    },
    post: () => ({ bloom: 0.42, vignette: 0.6, paper: 0.3 }),
  });
})();
