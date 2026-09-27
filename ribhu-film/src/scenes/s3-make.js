/* PLACEHOLDER — Make. Draws only the hand-off states from STORYBOARD.md. To be replaced. */
(function () {
  'use strict';
  const R = window.REEL, { PAL, E, seg, lerp } = R, RB = window.RB;
  let S;
  R.scene({
    id: 'make', index: 3, label: 'Make', start: 7.5, end: 10,
    init() {
      S = RB.stage();
      S.cups = [0, 1, 2, 3].map(() => { const c = RB.cup(); S.scene.add(c.group); return c; });
    },
    draw(ctx, t, env) {
      const T = env.T;
      RB.atmos.backdrop(ctx);
      const xs = RB.shots.rowX;
      S.cups.forEach((c, i) => { c.group.visible = i < xs.length; if (i < xs.length) { c.group.position.set(xs[i], 0, 0); c.group.rotation.set(0, 0, 0); } });
      RB.setCam(S.camera, RB.shots.row4);
      RB.draw3D(ctx, S.scene, S.camera);
      ctx.font = R.font(22, 'mono', 400); ctx.fillStyle = R.rgba(PAL.ivory, 0.5); ctx.textAlign = 'center';
      ctx.fillText('PLACEHOLDER · MAKE · t=' + t.toFixed(2), 960, 1040);
    },
    rail: (t, env) => ({ alpha: 1, active: 2, progress: (env.T - 7.5) / 10 }),
  });
})();
