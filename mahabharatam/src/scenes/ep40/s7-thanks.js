/* Ep 40 · line "thanks" · THE TURN · "Then the serpents came to Astika, overjoyed, and offered him a boon." · After the 0.9 s silence, NEW LIGHT, Vasuki's hall at full gold dawn: the serpents rise in rings round the boy, Vasuki and Elapatra among them, every head bowed. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP8 = window.EP8, EP34 = window.EP34, EP37 = window.EP37, EP38 = window.EP38, EP39 = window.EP39, EP40 = window.EP40;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  EP40.ring = (g, T, t, bow) => {
    for (let i = 0; i < 7; i++) { const a = Math.PI * (0.05 + i / 6 * 0.9), x = 540 + Math.cos(a) * 430, y = 1700 - Math.sin(a) * 150; const id = i === 5 ? 'vasuki' : i === 1 ? 'elapatra' : 'naga'; CH[id].draw(g, { x, y, scale: id === 'vasuki' ? 0.5 : 0.3, facing: x < 540 ? 'right' : 'left', index: [0, 0, 2, 0, 3, 5, 0][i], pose: { name: 'rise', k: lerp(0.9, 0.45, bow) }, light: EP40.goldLit(x, y), t: T + i, key: 'r40-n' + i }); }
  };
  R.scene({
    id: 'thanks',
    fadeIn: 0.1,
    draw(ctx, t, env) {
      const T = env.T, up = E.outCubic(clamp((t - env.beats[0] + 0.6) / 0.8)), bow = E.inOutSine(clamp((t - env.beats[2] + 0.6) / 0.8)), p = clamp(t / env.dur);
      EP40.goldHall(ctx, T, { cam: { zoom: 1.05 + 0.06 * p, dy: -300 }, after: (g) => {
        EP40.ring(g, T, t, bow * up);
        CH.astika.draw(g, { x: 540, y: 1660, scale: 0.6, facing: 'left', pose: { name: 'stand' }, light: EP40.goldLit(540, 1660, 1.25), t: T, key: 'th40-as' });
      } });
    },
    post: () => ({ bloom: 0.5, vignette: 0.42, paper: 0.3 }),
  });
})();
