/* PLACEHOLDER — The mark. Draws only the hand-off states from STORYBOARD.md. To be replaced. */
(function () {
  'use strict';
  const R = window.REEL, { PAL, E, seg, lerp } = R, RB = window.RB;
  let S;
  R.scene({
    id: 'mark', index: 7, label: 'The mark', start: 22.5, end: 30,
    init() {
      S = RB.stage();
      S.mark = RB.mark3D(); S.scene.add(S.mark.group);
    },
    draw(ctx, t, env) {
      const T = env.T;
      const p = E.inOutCubic(seg(t, 1.5, 3.1));
      RB.atmos.backdrop(ctx, { gx: 960, gy: 540, gr: 900, lift: 0.7 });
      ctx.globalAlpha = p; ctx.fillStyle = PAL.ivory; ctx.fillRect(0, 0, 1920, 1080); ctx.globalAlpha = 1;
      RB.setCam(S.camera, { pos: [0, 0.1, 3.4], look: [0, 0.1, 0], fov: 26 });
      RB.draw3D(ctx, S.scene, S.camera);
      RB.wordmark(ctx, 960, 900, 72, { color: '#141514', align: 'center', alpha: p });
      ctx.font = R.font(22, 'mono', 400); ctx.fillStyle = R.rgba(PAL.ivory, 0.5); ctx.textAlign = 'center';
      ctx.fillText('PLACEHOLDER · THE MARK · t=' + t.toFixed(2), 960, 1040);
    },
    post: () => ({ bloom: 0.12, vignette: 0.16, grain: 0.12 }),
  });
})();
