/* Ep 29 · line "friend" · Indra: "Let us be friends. Tell me, how strong are you?" · NEW LIGHT: the sky after the storm, a rainbow over the breaking clouds; Indra lowers the vajra and opens his hand to Garuda. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP29 = window.EP29;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'friend',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      EP29.rainbow(ctx, T, { bow: E.inOutSine(clamp(t / 1.5)), cam: { zoom: 1.0 + 0.04 * p }, after: (g) => {
        CH.indra.draw(g, { x: 330, y: 1600, scale: 0.75, facing: 'right', pose: { name: 'speak', k: E.inOutSine(clamp(t / 0.6)) }, expression: { speak: EP29.mouth(env, t) }, light: EP29.clear(330, 1600), t: T, key: 'fr29-in' });
        CH.garuda.draw(g, { x: 800, y: 1650, scale: 0.6, facing: 'left', pose: { name: 'stand' }, light: EP29.clear(800, 1650, 1.2), t: T, key: 'fr29-ga' });
      } });
    },
    post: () => ({ bloom: 0.4, vignette: 0.4, paper: 0.3 }),
  });
})();
