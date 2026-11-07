/* Ep 33 · line "stalk" · the ancestors speak · "The grass is our line. The rat is time. And you are the last root." · Three cuts on the beats: the tuft glowing gold (the line), the rat black against the moon (time), the single root lit gold (him). */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP33 = window.EP33;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'stalk',
    fadeIn: 0.15,
    draw(ctx, t, env) {
      const T = env.T, B = env.beats;
      const shot = t < B[1] - 0.15 ? 0 : t < B[2] - 0.15 ? 1 : 2;
      const ts = t - (shot === 0 ? 0 : shot === 1 ? B[1] - 0.15 : B[2] - 0.15);
      if (shot === 0) EP33.pit(ctx, T, { view: 'up', cam: { zoom: 1.7 + 0.05 * ts, dy: 0 }, after: (g) => EP33.tuft(g, 540, 860, 1.5, T, { roots: 1, glow: clamp(ts / 0.6) }) });
      else if (shot === 1) EP33.pit(ctx, T, { view: 'up', cam: { zoom: 1.4 + 0.05 * ts, dy: 0 }, after: (g) => { KIT.glow(g, 560, 900, 500, '#c8dcff', 0.5); EP33.rat(g, 520, 1000, 1.3, T, { gnaw: 1 }); } });
      else EP33.pit(ctx, T, { view: 'up', cam: { zoom: 2.2 + 0.08 * ts, dy: 0 }, after: (g) => EP33.tuft(g, 540, 820, 1.4, T, { roots: 1, lastGold: true, glow: 0.4 * clamp(ts / 0.5) }) });
    },
    post: () => ({ bloom: 0.46, vignette: 0.55, paper: 0.3 }),
  });
})();
