/* PLACEHOLDER (revision 2) — S6 Renew in FILM time (tf 0–9). Draws only the hand-off states. */
(function () {
  'use strict';
  const R = window.REEL, { PAL, E, seg, lerp } = R, RB = window.RB;
  R.scene({
    id: 'renew', index: 6, label: 'Renew', start: 17.5, end: 22.5,
    draw(ctx, t, env) {
      const tf = env.tf;
      RB.atmos.backdrop(ctx, { gx: 960, gy: 540, gr: 900, lift: 0.7 });
      const a = RB.shots.palmSpark, b = RB.shots.riseSpark;
      const p = E.inQuad(seg(tf, 7.5, 9));
      RB.fx.ember(ctx, lerp(a.x, b.x, p), lerp(a.y, b.y, p), lerp(a.r, b.r, p), { intensity: 1 });
      ctx.font = R.font(24, 'mono', 400); ctx.fillStyle = R.rgba(PAL.ivory, 0.5); ctx.textAlign = 'center';
      ctx.fillText('PLACEHOLDER · RENEW (rev 2) · tf=' + tf.toFixed(2), 960, 1040);
    },
    rail: (t, env) => ({ alpha: 1 - E.inOutCubic(seg(env.tf, 8.4, 9)), active: 3, progress: env.tf / 9 }),
  });
})();
