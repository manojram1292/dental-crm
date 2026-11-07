/* Ep 31 · line "brothers" · "But his brothers schemed against Vinata and her son, and he would not live among them." · Close on the dark brothers hissing in a knot (beats[0]), Vinata and Garuda as a faint memory roundel; Shesha turns away (beats[2]) and leaves the grove. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP17 = window.EP17, EP11 = window.EP11;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'brothers',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T;
      const b0 = env.beats[0], b2 = env.beats[2];
      const knot = E.outCubic(clamp((t - b0 + 0.6) / 0.8)), go = E.inOutSine(clamp((t - b2 + 0.6) / 1.4));
      EP17.grove(ctx, T, { cam: { zoom: 1.5, dx: -140, dy: -260 }, after: (g) => {
        for (let i = 0; i < 4; i++) { const x = lerp(150 + i * 200, 380 + i * 60, knot); CH.naga.draw(g, { x, y: 1720, scale: 0.32, facing: i < 2 ? 'right' : 'left', index: [0, 2, 3, 5][i], pose: { name: 'rise', k: 0.5 + 0.4 * knot }, expression: { mood: 'wrath' }, light: EP17.moonLight(x, 1720), t: T * 1.4 + i, key: 'b31-n' + i }); }
        EPA.shesha(g, lerp(880, 1300, go), 1840, 0.5, T, { k: 0.9, light: EPA.lit(880, 1400, 1200, 300, 1.05, 0.55, 0.4), facing: go > 0.02 ? 'right' : 'left', key: 'b31-sh' });
      } });
      const ra = clamp((t - 0.8) / 0.4) * (1 - clamp((t - b2 + 0.2) / 0.4));
      EP11.roundel(ctx, 540, 520, 200, ra, (g, TT) => { const F = window.EP17; F.sunset(g, TT, { after: (q) => { CH.vinata.draw(q, { x: 420, y: 1500, scale: 0.5, facing: 'right', pose: { name: 'stand' }, light: F.sunLight(420, 1500), t: TT, key: 'b31-vi' }); CH.garuda.draw(q, { x: 700, y: 1500, scale: 0.42, facing: 'left', pose: { name: 'stand' }, light: F.sunLight(700, 1500), t: TT, key: 'b31-ga' }); } }); }, T, { focus: [560, 1150], zoom: 0.6, key: 'b31-r', glow: '#ff9a50' });
    },
    post: () => ({ bloom: 0.4, vignette: 0.5, paper: 0.3 }),
  });
})();
