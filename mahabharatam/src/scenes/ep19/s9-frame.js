/* Ep 19 · line "frame" · FRAME (Sauti) · "Then the great bird flew home, to his mother." · An eighth angle: high above the Naimisha clearing, the fire a small sun, Sauti's hand lifted; a great bird's shadow sweeps across the sages. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP17 = window.EP17;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'frame',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const fl = KIT.flicker(T, 0), F = KIT.ashram.FIRE;
      KIT.ashram.draw(ctx, T, {
        cycle: 0.76, speed: 0, hide: [5, 6], turn: () => -0.4 * p,
        smoke: { alpha: 0.3, lean: 6 }, fireH: 220,
        cam: { zoom: 0.92, dx: 0, dy: 60 },
        after: (g) => CH.sauti.draw(g, { x: 220, y: 1600, scale: 0.85, facing: 'right', pose: { name: 'speak', base: 'sit', k: E.inOutSine(clamp(t / 0.8)) }, expression: { look: -0.2, speak: EP17.mouth(env, t) }, light: { dir: Math.atan2(F.y - 1250, F.x - 220), intensity: fl * 1.15, front: 0.5 }, t: T, key: 'f19-sauti' }),
      });
      const sx = lerp(-300, 1400, E.inOutSine(clamp((t - 0.6) / (dur - 0.8))));
      ctx.save(); ctx.globalAlpha = 0.45; ctx.translate(sx, 1300); ctx.fillStyle = '#05030a';
      ctx.beginPath(); ctx.moveTo(-320, -60); ctx.quadraticCurveTo(-120, -10, 0, 20); ctx.quadraticCurveTo(120, -10, 320, -60); ctx.quadraticCurveTo(140, 40, 30, 90); ctx.lineTo(-30, 90); ctx.quadraticCurveTo(-140, 40, -320, -60); ctx.fill(); ctx.restore();
    },
    post: () => ({ bloom: 0.42, vignette: 0.5, paper: 0.32 }),
  });
})();
