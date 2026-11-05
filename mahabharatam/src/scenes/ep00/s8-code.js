/* Ep 0 · line "code" · TITLE MOMENT 3 · "It is drawn like the old temple murals, and every frame is made in code." · The series' own drawing code scrolls in a dark panel; from "made" (beats[1]) a diagonal wipe paints the picture it draws over it: Garuda in flight over the dawn sea. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP0 = window.EP0, EP17 = window.EP17, EP20 = window.EP20;
  const { clamp, E, lerp } = R;
  R.scene({
    id: 'code',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const b1 = env.beats[1] ?? 3.5;
      const w = E.inOutCubic(clamp((t - b1 + 1.6) / 1.6));
      // underneath: the picture
      EP17.ocean(ctx, T, { hz: 1250, cam: { zoom: 1.0 }, after: (g) => EP20.carrier(g, 560, 1900 + 25 * Math.sin(T * 2), 0.75, T, { key: 'cd0', light: { dir: -0.9, intensity: 1.15, front: 0.6 } }) });
      // over it: the code, wiped away from the top-right corner
      ctx.save();
      const edge = lerp(-400, 2600, w);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.max(0, R.W - edge), 0); ctx.lineTo(0, Math.max(0, R.H - edge) * 1.7); ctx.closePath();
      if (w < 0.999) { ctx.clip(); EP0.ground(ctx, T, 0.6); EP0.code(ctx, T, 60, 560, 960, 760, t * 1.6, 1); }
      ctx.restore();
      // the wipe's edge: a line of gold paint
      if (w > 0.01 && w < 0.99) {
        ctx.save(); ctx.strokeStyle = '#f6d080'; ctx.lineWidth = 8; ctx.shadowColor = '#ffb040'; ctx.shadowBlur = R.px(20);
        ctx.beginPath(); ctx.moveTo(Math.max(0, R.W - edge), 0); ctx.lineTo(0, Math.max(0, R.H - edge) * 1.7); ctx.stroke(); ctx.restore();
      }
      const ka = clamp((t - 0.2) / 0.5) * (1 - clamp((t - dur + 0.3) / 0.3));
      KIT.goldText(ctx, env.strings.codeTitle.toUpperCase(), KIT.CX, 400, { size: 66, spacing: 6, weight: 600, alpha: ka, reveal: ka, sheen: lerp(-0.3, 1.3, clamp((t - 0.6) / 1.2)), glow: 0.4, key: 'cd0-t' });
    },
    post: () => ({ bloom: 0.38, vignette: 0.44, paper: 0.3 }),
  });
})();
