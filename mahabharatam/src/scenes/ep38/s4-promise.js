/* Ep 38 · line "promise" · Astika speaks · "I will go, uncle. I will set you free." · The boy, lit gold, looks up at Vasuki's great hood (a high-low two-shot, the boy foreground right); the uncle bows to him. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP8 = window.EP8, EP34 = window.EP34, EP37 = window.EP37, EP38 = window.EP38;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'promise',
    fadeIn: 0.15,
    draw(ctx, t, env) {
      const T = env.T, bow = E.inOutSine(clamp((t - env.beats[1] + 0.4) / 0.8));
      EP38.redHall(ctx, T, { cam: { zoom: 1.3, dy: -380 }, after: (g) => {
        CH.vasuki.draw(g, { x: 300, y: 1800, scale: 0.75, facing: 'right', pose: { name: 'rise', k: lerp(0.95, 0.6, bow) }, light: EP38.redLit(300, 1400), t: T, key: 'p38-va' });
        CH.astika.draw(g, { x: 780, y: 1820, scale: 0.85, facing: 'left', pose: { name: 'speak', k: 1 }, expression: { speak: EPA.mouth(env, t) }, light: { dir: -Math.PI / 2 - 0.3, intensity: 1.2, front: 0.8, fill: 0.55 }, t: T, key: 'p38-as' });
      } });
    },
    post: () => ({ bloom: 0.46, vignette: 0.48, paper: 0.3 }),
  });
})();
