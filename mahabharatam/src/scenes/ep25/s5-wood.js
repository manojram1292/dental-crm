/* Ep 25 · line "wood" · "At Kashyapa's sacrifice, Indra carried firewood the size of a mountain, with ease." · NEW LIGHT: the sacrificial ground at bright morning, white smoke from the altar: Indra strides across with a mountain of logs on his shoulder. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP25 = window.EP25;
  const { clamp, lerp, hash } = R;
  const CH = KIT.characters;
  EP25.woodpile = (g, x, y, s) => { for (let r = 0; r < 7; r++) for (let i = 0; i < 8 - r; i++) { g.fillStyle = (i + r) % 2 ? '#7a4a28' : '#9a6a38'; g.beginPath(); g.ellipse(x + (i - (8 - r) / 2) * 60 * s, y - r * 52 * s, 30 * s, 30 * s, 0, 0, R.TAU); g.fill(); g.fillStyle = '#e8c890'; g.beginPath(); g.arc(x + (i - (8 - r) / 2) * 60 * s, y - r * 52 * s, 12 * s, 0, R.TAU); g.fill(); } void hash; };
  R.scene({
    id: 'wood',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      EP25.yajna(ctx, T, { cam: { zoom: 1.0 }, after: (g) => {
        const x = lerp(1000, 640, p);
        EP25.woodpile(g, x - 40, 860, 0.9);
        CH.indra.draw(g, { x, y: 1460, scale: 0.6, facing: 'left', pose: { name: 'walk', phase: T * 4 }, light: EP25.morning(x, 1460), t: T, key: 'w25-in' });
      } });
    },
    post: () => ({ bloom: 0.34, vignette: 0.36, paper: 0.32 }),
  });
})();
