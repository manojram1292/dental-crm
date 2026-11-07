/* Ep 40 · line "payoff" · THE ARC'S PAYOFF (≥ 4 s, lit, close) · "And Astika went home, to his mother." · The mother kneels and the boy runs into her arms in the gold hall; Vasuki's hood over them both; a slow push in held through the long post. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP8 = window.EP8, EP34 = window.EP34, EP37 = window.EP37, EP38 = window.EP38, EP39 = window.EP39, EP40 = window.EP40;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'payoff',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, run = E.inOutSine(clamp(t / 1.6)), p = E.inOutSine(clamp(t / env.dur));
      EP40.goldHall(ctx, T, { cam: { zoom: lerp(1.3, 1.75, p), dy: lerp(-420, -600, p), dx: lerp(0, 40, p) }, after: (g) => {
        CH.vasuki.draw(g, { x: 1010, y: 1900, scale: 0.7, facing: 'left', pose: { name: 'rise', k: 0.75 }, light: EP40.goldLit(860, 1500, 1.15), t: T, key: 'p40-va' });
        CH.nagini.draw(g, { x: 660, y: 1780, scale: 0.85, facing: 'left', pose: { name: 'cradle', k: run }, expression: { look: 0.1 }, light: EP40.goldLit(620, 1500, 1.3), t: T, key: 'p40-ng' });
        CH.astika.draw(g, { x: lerp(140, 500, run), y: 1780, scale: 0.6, facing: 'right', pose: { name: run < 0.95 ? 'run' : 'stand', phase: T * 4 }, light: EP40.goldLit(400, 1500, 1.3), t: T, key: 'p40-as' });
        KIT.glow(g, 560, 1300, 360, '#fff0c0', 0.35 * run);
      } });
    },
    post: () => ({ bloom: 0.52, vignette: 0.42, paper: 0.3 }),
  });
})();
