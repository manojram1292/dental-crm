/* Ep 30 · line "vinata" · THE TURN (≈ 42 %) · "And Vinata was free." · After a 0.9 s rest, the payoff of the arc: Vinata lifts the slave's sari end from her head, her ornaments shine again; Garuda bows to her and she blesses him (episode 18's bow, reversed). */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP30 = window.EP30;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'vinata',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      const b1 = env.beats[1] ?? 1.2;
      const free = clamp((t - b1 + 0.3) / 0.3);
      EP30.dawnIsle(ctx, T, { cam: { zoom: 1.5 + 0.04 * p, dy: -380 }, after: (g) => {
        KIT.glow(g, 420, 1300, 500, '#ffe0c0', 0.5 * free, 'lighter', 0.4);
        CH.vinata.draw(g, { x: 420, y: 1720, scale: 0.75, facing: 'right', pose: free > 0.5 ? { name: 'speak', k: E.outCubic(clamp((t - b1) / 0.6)) } : { name: 'stand', slave: true }, light: EP30.dawn(420, 1720, 1.15), t: T, key: 'v30-vn' });
        CH.garuda.draw(g, { x: 760, y: 1720, scale: 0.55, facing: 'left', pose: { name: 'bow', k: 0.7 * E.inOutSine(clamp((t - b1) / 0.8)) }, light: EP30.dawn(760, 1720, 1.2), t: T, key: 'v30-ga' });
      } });
    },
    post: () => ({ bloom: 0.42, vignette: 0.4, paper: 0.3 }),
  });
})();
