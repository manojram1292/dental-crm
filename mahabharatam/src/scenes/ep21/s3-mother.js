/* Ep 21 · line "mother" · Vinata: "My sister cheated me in a wager. I became her slave." · Close on Vinata, head covered; a memory roundel above her shows the white horse's black-streaked tail (beats[0] 'cheated'). */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP21 = window.EP21, EP11 = window.EP11, EP10 = window.EP10;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'mother',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      const b0 = env.beats[0] ?? 0.8, b2 = env.beats[2] ?? 2.8;
      EP21.grove(ctx, T, { near: false, cam: { zoom: 1.0, dx: 0 } });
      ctx.save(); ctx.fillStyle = 'rgba(40,16,10,0.25)'; ctx.fillRect(0, 0, R.W, R.H); ctx.restore();
      const bow = E.inOutSine(clamp((t - b2 + 0.4) / 0.8));
      CH.vinata.draw(ctx, { x: 560, y: 2700 - 30 * p, scale: 1.95, facing: 'right', pose: { name: bow > 0.01 ? 'bow' : 'stand', k: 0.35 * bow, slave: true }, expression: { speak: EP21.mouth(env, t), look: -0.05 }, light: EP21.amber(560, 2700, 1.1), t: T, key: 'm21-vn' });
      const v = E.outCubic(clamp((t - b0 + 0.3) / 0.6));
      EP11.roundel(ctx, 800, 700, 200, v, (g, TT) => { EP10.shore(g, TT, {}); CH.horse.draw(g, { x: 520, y: 1600, scale: 0.9, facing: 'left', pose: { name: 'stand', tail: 1 }, light: { dir: -2.4, intensity: 1.1, front: 0.5 }, t: TT, key: 'm21-horse' }); }, T, { focus: [640, 1250], zoom: 0.5, key: 'm21-mem', glow: '#ffd0a0' });
    },
    post: () => ({ bloom: 0.36, vignette: 0.5, paper: 0.32 }),
  });
})();
