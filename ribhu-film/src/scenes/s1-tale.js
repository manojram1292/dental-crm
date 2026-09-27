/* PLACEHOLDER — The tale. Draws only the hand-off states from STORYBOARD.md. To be replaced. */
(function () {
  'use strict';
  const R = window.REEL, { PAL, E, seg, lerp } = R, RB = window.RB;
  let S;
  R.scene({
    id: 'tale', index: 1, label: 'The tale', start: 0, end: 5,
    init() {
      S = RB.stage();
      S.cups = [0, 1, 2, 3].map(() => { const c = RB.cup(); S.scene.add(c.group); return c; });
    },
    draw(ctx, t, env) {
      const T = env.T;
      RB.atmos.backdrop(ctx);
      const xs = [0];
      S.cups.forEach((c, i) => { c.group.visible = i < xs.length; if (i < xs.length) { c.group.position.set(xs[i], 0, 0); c.group.rotation.set(0, 0, 0); } });
      RB.setCam(S.camera, RB.shots.cupHero);
      RB.draw3D(ctx, S.scene, S.camera);
      ctx.font = R.font(22, 'mono', 400); ctx.fillStyle = R.rgba(PAL.ivory, 0.5); ctx.textAlign = 'center';
      ctx.fillText('PLACEHOLDER · THE TALE · t=' + t.toFixed(2), 960, 1040);
    },
  });
})();
