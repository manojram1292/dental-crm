/* Ep 27 · line "take" · "He broke the wheel, and flew off with the amrita, without drinking a drop." · The wheel shatters (beats[0]); Garuda, full size again, bursts upward holding the white pot (beats[1]); he does not lift it to his beak. EP27.away is reused by the cliffhanger. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP26 = window.EP26, EP27 = window.EP27, EP15 = window.EP15;
  const { clamp, E, lerp, hash } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'take',
    fadeIn: 0.1,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const b0 = env.beats[0] ?? 0.6, b1 = env.beats[1] ?? 2;
      const br = clamp((t - b0 + 0.1) / 0.6), up = E.inOutSine(clamp((t - b1 + 0.6) / (dur - b1 + 0.6)));
      EP27.vault(ctx, T, { pot: 0, cam: { zoom: 1.0, dy: lerp(0, 400, up) }, after: (g) => {
        if (br < 1) EP26.wheel(g, 540, 1000, 440, T, { a: 1 - br, spin: T * 5 });
        for (let i = 0; i < 18; i++) { if (br <= 0) break; const a = hash(i, 1) * R.TAU, d = 900 * E.outCubic(br); g.save(); g.globalAlpha = 1 - br * 0.8; g.translate(540 + Math.cos(a) * d, 1000 + Math.sin(a) * d); g.rotate(a + T * 3); g.fillStyle = '#c8ccd8'; g.beginPath(); g.moveTo(-40, 0); g.lineTo(0, -80); g.lineTo(40, 0); g.fill(); g.restore(); }
        const y = lerp(1500, 600, up), s = lerp(0.2, 0.55, clamp(up * 2));
        CH.garuda.draw(g, { x: 540, y, scale: s, facing: 'left', pose: { name: 'carry', k: 1 }, light: EP27.steel(540, y, 1.25), t: T, key: 'tk27-ga' });
        EP15.potGlow(g, 540 - 220 * s, y - 560 * s, 1.0 * s / 0.55, 1);
      } });
    },
    post: () => ({ bloom: 0.46, vignette: 0.46, paper: 0.3 }),
  });
})();
