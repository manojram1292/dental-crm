/* Ep 19 · line "gods" · "The gods were afraid, and ran to Agni, the god of fire." · Indra's heaven under a burning sky: three gods hurry toward Agni, his seven tongues of fire behind him; name card. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP8 = window.EP8;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'gods',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b2 = env.beats[2] ?? 3;
      EP8.svarga(ctx, T, {});
      ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = 'rgba(255,130,80,0.75)'; ctx.fillRect(0, 0, R.W, R.H); ctx.restore();
      KIT.glow(ctx, 540, 0, 1200, '#ff8a20', 0.5);
      CH.agni.draw(ctx, { x: 820, y: 1960, scale: 1.0, facing: 'left', pose: 'stand', light: { dir: -Math.PI / 2, intensity: 1.15, front: 0.5 }, t: T, key: 'g19-ag' });
      for (let i = 0; i < 3; i++) { const x = lerp(-150 - i * 120, 230 - i * 110, E.outCubic(p)); CH.deva.draw(ctx, { x, y: 1980 + i * 12, scale: 0.85 - i * 0.05, facing: 'right', index: [1, 3, 5][i], pose: p < 0.9 ? { name: 'walk', phase: T * 7 + i } : { name: 'cower', k: 0.5 }, light: { dir: 0.2, intensity: 1.05, front: 0.4 }, t: T + i, key: 'g19-d' + i }); }
      const la = clamp((t - b2) / 0.4) * (1 - clamp((t - dur + 0.3) / 0.3));
      window.EP17.plaque(ctx, env.strings.agniName, env.strings.agniEpithet, KIT.CX, 250, la, { size: 56, key: 'g19-name' });
    },
    post: () => ({ bloom: 0.46, vignette: 0.42, paper: 0.3 }),
  });
})();
