/* Ep 20 · line "frame" · FRAME (Sauti) · "So they came to Ramaniyaka, a lovely island in the sea." · A ninth angle at the fire (low, between two sages); above the fire a medallion opens on the green island; its name card. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP11 = window.EP11, EP20 = window.EP20;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'frame',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b0 = env.beats[0] ?? 1.6;
      const v = E.outCubic(clamp((t - b0 + 0.8) / 0.7));
      const fl = KIT.flicker(T, 0), F = KIT.ashram.FIRE;
      KIT.ashram.draw(ctx, T, {
        cycle: 0.76, speed: 0, hide: [5, 6, 2], turn: () => -0.3,
        smoke: { alpha: 0.3, lean: 5 }, fireH: 230,
        cam: { zoom: 1.4 + 0.04 * p, dx: -60, dy: -260 },
        after: (g) => CH.sauti.draw(g, { x: 560, y: 1480, scale: 0.7, facing: 'left', pose: { name: 'speak', base: 'sit', k: 1 }, expression: { look: -0.1, speak: EP20.mouth(env, t) }, light: { dir: Math.atan2(F.y - 1150, F.x - 560), intensity: fl * 1.2, front: 0.55 }, t: T, key: 'f20-sauti' }),
      });
      EP11.roundel(ctx, 540, 640, 240, v, (g, TT) => EP20.island(g, TT, {}), T, { focus: [540, 1150], zoom: 0.5, key: 'f20-isle', glow: '#a8f0ff' });
      const la = clamp((t - b0) / 0.4) * (1 - clamp((t - dur + 0.3) / 0.3));
      EP20.plaque(ctx, env.strings.islandName, env.strings.islandEpithet, KIT.CX, 1000, la, { size: 46, key: 'f20-name' });
    },
    post: () => ({ bloom: 0.42, vignette: 0.5, paper: 0.32 }),
  });
})();
