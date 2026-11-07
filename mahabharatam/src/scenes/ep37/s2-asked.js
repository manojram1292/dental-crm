/* Ep 37 · line "asked" · "Janamejaya asked his ministers how his father had died." · Janamejaya's court at night by torchlight, from behind two ministers: the king leaning in; then the oldest minister's torch dissolves toward the noon road. Recap band at the top. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP36 = window.EP36, EP37 = window.EP37, EP8 = window.EP8;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'asked',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, p = E.inOutSine(clamp(t / env.dur));
      EP36.court(ctx, T, { cam: { zoom: lerp(1.0, 1.15, p), dy: -220 }, after: (g) => {
        CH.janamejaya.draw(g, { x: 560, y: 1500, scale: 0.8, facing: 'left', pose: { name: 'sit' }, expression: { look: 0.12 }, light: EP36.torch(560, 1200, 1.2), t: T, key: 'a37-jj' });
        CH.sage.draw(g, { x: 180, y: 2050, scale: 1.0, facing: 'right', index: 2, pose: { name: 'stand' }, light: EP36.torch(150, 1600, 0.9), t: T, key: 'a37-m1' });
        CH.sage.draw(g, { x: 960, y: 2080, scale: 1.0, facing: 'left', index: 3, pose: { name: 'stand' }, light: EP36.torch(930, 1600, 0.9), t: T, key: 'a37-m2' });
      } });
      KIT.series.recapBand(ctx, T, clamp(t / 0.3) * (1 - clamp((t - 2.6) / 0.3)), env.strings, { y: 300 });
      const dv = clamp((t - env.dur + 0.6) / 0.6);
      if (dv > 0) { ctx.save(); ctx.globalAlpha = dv; ctx.fillStyle = '#fff4d8'; ctx.fillRect(0, 0, R.W, R.H); ctx.restore(); }
    },
    post: () => ({ bloom: 0.42, vignette: 0.5, paper: 0.3 }),
  });
})();
