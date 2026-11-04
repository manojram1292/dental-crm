/*
 * Ep 14 · line "drink" · "Shiva took the poison in his hands, and drank."
 * Shiva, LARGE and frontal, his ash-white light pushing the dark back; the smoke streams down
 * into his cupped hands (beats[1]) and he drinks (beats[2]); the sky begins to clear. Name card.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP13 = window.EP13, EP14 = window.EP14;
  const { clamp, E, lerp, hash } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'drink',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b1 = env.beats[1] ?? 1.7, b2 = env.beats[2] ?? 3;
      const cup = E.inOutCubic(clamp((t - b1 + 0.6) / 0.9)), drunk = E.inOutSine(clamp((t - b2 + 0.3) / 1.0));
      EP13.whiteSea(ctx, T, {
        hz: 1700, dark: lerp(0.9, 0.6, drunk),
        after: (g) => {
          EP13.poison(g, 540, 700, T, 1 - 0.6 * drunk);
          // the smoke streaming down into his hands
          g.save();
          for (let i = 0; i < 16; i++) { const life = (T * 0.8 + hash(i, 71)) % 1; const x = lerp(540 + (hash(i, 72) - 0.5) * 700, 540, life), y = lerp(500, 1060, life); KIT.glow(g, x, y, 90, '#16204a', 0.55 * cup * (1 - drunk * 0.5), 'source-over'); }
          g.restore();
          CH.shiva.draw(g, { x: 540, y: 1960, scale: 1.18, facing: 'front', pose: { name: 'drink', k: cup, throat: 0.15 * drunk }, light: { dir: -Math.PI / 2, intensity: 1.1, front: 0.55 }, t: T, key: 'd14-sh' });
        },
      });
      EP14.tag(ctx, T, 1, env.strings);
      const la = clamp((t - 0.2) / 0.4) * (1 - clamp((t - dur + 0.3) / 0.3));
      EP14.plaque(ctx, env.strings.shivaName, env.strings.shivaEpithet, KIT.CX, 340, la, { size: 56, key: 'd14-name' });
      void p;
    },
    post: () => ({ bloom: 0.44, vignette: 0.5, paper: 0.3 }),
  });
})();
