/* Ep 33 · line "ask" · Jaratkaru speaks · "Who are you, hanging there?" · Close on the ascetic's face at the lip, looking down, lit from below by the ancestors' pale glow. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP33 = window.EP33;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'ask',
    fadeIn: 0.15,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      EP33.wild(ctx, T, { dawn: 0, trees: [], cam: { zoom: 2.0 + 0.08 * p, dy: -320 }, after: (g) => {
        KIT.glow(g, 520, 1500, 500, '#c8dcff', 0.5);
        g.fillStyle = '#06050a'; g.beginPath(); g.ellipse(520, 1500, 420, 90, 0, 0, Math.PI * 2); g.fill();
        CH.jaratkaru.draw(g, { x: 600, y: 1480, scale: 0.75, facing: 'left', pose: { name: 'grieve', k: 0.35 }, expression: { speak: EPA.mouth(env, t) }, light: { dir: Math.PI / 2 + 0.3, intensity: 1.15, front: 0.75, fill: 0.5 }, t: T, key: 'a33-jk' });
      } });
    },
    post: () => ({ bloom: 0.42, vignette: 0.5, paper: 0.3 }),
  });
})();
