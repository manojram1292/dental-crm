/* Ep 25 · line "answer" · Brihaspati: "Vinata's son is coming for the amrita. Your own fault made him." · Close on Brihaspati in his yellow-gold light, a finger raised; the red arch behind him. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP25 = window.EP25;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'answer',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      EP25.hall(ctx, T, { cam: { zoom: 1.55 + 0.06 * p, dx: 330, dy: -200 }, after: (g) => {
        CH.brihaspati.draw(g, { x: 300, y: 1640, scale: 0.72, facing: 'right', pose: { name: 'dictate', k: E.inOutSine(clamp(t / 0.6)) }, expression: { speak: EP25.mouth(env, t) }, light: EP25.lamp(300, 1640, 1.15), t: T, key: 'a25-br' });
      } });
    },
    post: () => ({ bloom: 0.4, vignette: 0.5, paper: 0.32 }),
  });
})();
