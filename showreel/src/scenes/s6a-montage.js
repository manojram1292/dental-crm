/* PLACEHOLDER — scene 06aa · Range. To be replaced. */
(function () {
  'use strict';
  const R = window.REEL;
  const { PAL, E, font, seg } = R;
  R.scene({
    id: 'montage-a', index: 6, label: 'Range', start: 10, end: 11,
    draw(ctx, t, env) {
      ctx.fillStyle = PAL.cobalt; ctx.fillRect(0, 0, env.W, env.H);
      ctx.fillStyle = PAL.paper;
      ctx.font = font(120, 'display', 900); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('RANGE a', env.W / 2, env.H / 2);
      ctx.font = font(28, 'mono', 400);
      ctx.fillText(`t=${t.toFixed(2)}  p=${env.p.toFixed(2)}`, env.W / 2, env.H / 2 + 110);
    },
  });
})();
