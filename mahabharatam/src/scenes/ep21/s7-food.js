/* Ep 21 · line "food" · Garuda: "I will bring it. But what may I eat on the way?" · The shore at dusk beyond the grove: Garuda half-spread, ready to fly; Vinata before him (a two-shot from the sea side). */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP21 = window.EP21;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'food',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, p = E.inOutSine(clamp(t / env.dur));
      EP21.grove(ctx, T, { near: false, cam: { zoom: 1.25 - 0.08 * p, dx: 60, dy: 160 }, after: (g) => {
        g.save(); g.fillStyle = 'rgba(60,30,80,0.22)'; g.fillRect(-400, -500, R.W + 800, R.H + 1000); g.restore();
        CH.garuda.draw(g, { x: 380, y: 1640, scale: 0.6, facing: 'right', pose: { name: 'spread', k: lerp(0.3, 0.7, p) }, expression: { speak: EP21.mouth(env, t) }, light: EP21.amber(380, 1640, 1.15), t: T, key: 'fo21-ga' });
        CH.vinata.draw(g, { x: 820, y: 1640, scale: 0.75, facing: 'left', pose: { name: 'stand', slave: true }, light: EP21.amber(820, 1640, 1.0), t: T, key: 'fo21-vn' });
      } });
    },
    post: () => ({ bloom: 0.4, vignette: 0.45, paper: 0.32 }),
  });
})();
