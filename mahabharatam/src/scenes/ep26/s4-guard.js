/* Ep 26 · line "guard" · "Its guardian, Vishvakarma, met him first, and fell." · Vishvakarma raises his hammer at the gate; Garuda's wing sweeps him down (beats[1]); the plaque. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP26 = window.EP26;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'guard',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const b0 = env.beats[0] ?? 0.8, b1 = env.beats[1] ?? 2.2;
      const fall = E.outCubic(clamp((t - b1 + 0.2) / 0.5));
      EP26.court(ctx, T, { storm: 1, cam: { zoom: 1.5, dy: -360 }, after: (g) => {
        CH.vishvakarma.draw(g, { x: lerp(380, 300, fall), y: 1500, scale: 0.55, facing: 'right', pose: fall > 0.1 ? { name: 'cower', k: fall } : { name: 'raise', k: E.outCubic(clamp(t / 0.6)) }, light: EP26.storm(380, 1500, 1.15), t: T, key: 'g26-vk' });
        g.save(); g.translate(760, 1500); g.rotate(-0.35 * Math.sin(Math.PI * clamp((t - b1 + 0.6) / 0.8))); g.translate(-760, -1500);
        CH.garuda.draw(g, { x: 760, y: 1500, scale: 0.55, facing: 'left', pose: { name: 'spread', k: 0.9 }, expression: { mood: 'wrath' }, light: EP26.storm(760, 1500, 1.2), t: T, key: 'g26-ga' });
        g.restore();
      } });
      const la = clamp((t - b0 + 0.2) / 0.3) * (1 - clamp((t - dur + 0.3) / 0.3));
      EP26.plaque(ctx, env.strings.vkName, env.strings.vkEpithet, KIT.CX, 300, la, { size: 50, key: 'g26-name' });
    },
    post: () => ({ bloom: 0.42, vignette: 0.46, paper: 0.3 }),
  });
})();
