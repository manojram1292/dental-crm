/* PLACEHOLDER — Renew. Draws only the hand-off states from STORYBOARD.md. To be replaced. */
(function () {
  'use strict';
  const R = window.REEL, { PAL, E, seg, lerp } = R, RB = window.RB;
  let S;
  R.scene({
    id: 'renew', index: 6, label: 'Renew', start: 17.5, end: 22.5,
    init() {
      S = RB.stage();

    },
    draw(ctx, t, env) {
      const T = env.T;
      RB.atmos.backdrop(ctx, { gx: 960, gy: 540, gr: 900, lift: 0.7 });
      const a = RB.shots.palmSpark, b = RB.shots.riseSpark, p = t / 5;
      RB.fx.ember(ctx, lerp(a.x, b.x, p), lerp(a.y, b.y, p), lerp(a.r, b.r, p), { intensity: 1 });
      ctx.font = R.font(22, 'mono', 400); ctx.fillStyle = R.rgba(PAL.ivory, 0.5); ctx.textAlign = 'center';
      ctx.fillText('PLACEHOLDER · RENEW · t=' + t.toFixed(2), 960, 1040);
    },
    rail: (t) => ({ alpha: 1 - E.inOutCubic(seg(t, 4.5, 5)), active: 3, progress: t / 5 }),
  });
})();
