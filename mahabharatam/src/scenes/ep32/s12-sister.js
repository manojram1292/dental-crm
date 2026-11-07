/* Ep 32 · line "sister" · "And Vasuki had a sister. Her name was Jaratkaru." · Back in the hall at full warmth: Vasuki (left, large, low) turns toward his sister standing at the edge of the light (right, lit rose and violet); she looks up (beats[1]). Not a side-by-side two-shot: he is a foreground shape, she is mid-ground. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP32 = window.EP32;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'sister',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, p = E.inOutSine(clamp(t / env.dur)), look = E.inOutSine(clamp((t - env.beats[1] + 0.3) / 0.6));
      EP32.fireHall(ctx, T, { cam: { zoom: 1.1 + 0.08 * p, dx: lerp(-60, 40, p) }, after: (g) => {
        CH.nagini.draw(g, { x: 720, y: 1900, scale: 1.15, facing: 'left', pose: { name: 'stand' }, expression: { look: -0.15 * look }, light: { ...EP32.fireLit(720, 1500, 1.25), fill: 0.6 }, t: T, key: 's32-ng' });
        CH.vasuki.draw(g, { x: 150, y: 2250, scale: 0.85, facing: 'right', pose: { name: 'rise', k: 0.8 }, light: EP32.fireLit(150, 1800, 1.0), t: T, key: 's32-va' });
      } });
    },
    post: () => ({ bloom: 0.44, vignette: 0.48, paper: 0.3 }),
  });
})();
