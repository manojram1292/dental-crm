/*
 * Ep 8 · line "fall" · "And serpents of every size and colour fell into the fire."
 *
 * Looking up through the smoke: serpents of every size and colour (green, gold-banded,
 * red, black-hooded, blue, spotted) are drawn down in slow spirals and vanish into the
 * fire in bursts of sparks: a mural, not a slaughter. They thicken on "serpents"
 * (beats[0]); the biggest falls on "fire" (beats[2]).
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP8 = window.EP8;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'fall',
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b0 = env.beats[0] ?? 0.4, b2 = env.beats[2] ?? 3.3;
      const a = clamp(0.3 + (t - b0 + 0.3) / 1.4);
      const big = E.inQuad(clamp((t - (b2 - 1.0)) / 1.1));
      EP8.satra(ctx, T, {
        fire: 1.25, cam: { zoom: 0.9 + 0.06 * p, dy: 60 },
        sky: (g) => EP8.fallers(g, T, 540, 1260, 26, a, { top: -300 }),
        after: (g) => {
          if (big < 1) EP8.serpent(g, lerp(820, 560, big), lerp(-200, 1180, big), 420, Math.PI / 2 + 0.4 * (1 - big), T, 3, { kind: 3, w: 40, speed: 4 });
          else { KIT.glow(g, 540, 1180, 400, '#ffd070', 0.6 * (1 - clamp((t - b2) / 0.8))); }
          for (const [x, i, f] of [[110, 0, 'right'], [970, 1, 'left']]) CH.priest.draw(g, { x, y: 1700, scale: 0.9, facing: f, index: i, pose: { name: 'chant', base: 'sit', k: 1 }, expression: { speak: 0.4 + 0.4 * Math.sin(T * 9 + i) }, light: EP8.fireLight(x, 1700, KIT.flicker(T, i), 0.4), t: T, key: 'f8-' + i });
        },
      });
    },
    post: () => ({ bloom: 0.5, vignette: 0.5, paper: 0.3 }),
  });
})();
