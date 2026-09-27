/* PLACEHOLDER — scene 05 · 3D & Dimension. To be replaced. */
(function () {
  'use strict';
  const R = window.REEL;
  const { PAL, E, font, seg } = R;
  R.scene({
    id: 'dimension', index: 5, label: '3D & Dimension', start: 8, end: 10,
    draw(ctx, t, env) {
      ctx.fillStyle = PAL.ink; ctx.fillRect(0, 0, env.W, env.H);
      ctx.fillStyle = PAL.ink === PAL.paper ? PAL.ink : PAL.paper;
      ctx.font = font(120, 'display', 900); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.globalAlpha = E.outCubic(seg(t, 0, 0.3));
      ctx.fillText('3D & DIMENSION', env.W / 2, env.H / 2 + (1 - E.outExpo(seg(t, 0, 0.5))) * 80);
      ctx.font = font(28, 'mono', 400);
      ctx.fillText(`t=${t.toFixed(2)}  p=${env.p.toFixed(2)}`, env.W / 2, env.H / 2 + 110);
    },
  });
})();
