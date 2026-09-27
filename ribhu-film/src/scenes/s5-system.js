/* PLACEHOLDER — One system. Draws only the hand-off states from STORYBOARD.md. To be replaced. */
(function () {
  'use strict';
  const R = window.REEL, { PAL, E, seg, lerp } = R, RB = window.RB;
  let S;
  R.scene({
    id: 'system', index: 5, label: 'One system', start: 15, end: 17.5,
    init() {
      S = RB.stage();

    },
    draw(ctx, t, env) {
      const T = env.T;
      RB.atmos.backdrop(ctx, { gx: 960, gy: 540, gr: 900, lift: 0.7 });
      const s = RB.shots.palmSpark; RB.fx.ember(ctx, s.x, s.y, s.r, { intensity: 1 });
      ctx.font = R.font(22, 'mono', 400); ctx.fillStyle = R.rgba(PAL.ivory, 0.5); ctx.textAlign = 'center';
      ctx.fillText('PLACEHOLDER · ONE SYSTEM · t=' + t.toFixed(2), 960, 1040);
    },
    rail: (t, env) => ({ alpha: 1, active: 2, progress: (env.T - 7.5) / 10 }),
  });
})();
