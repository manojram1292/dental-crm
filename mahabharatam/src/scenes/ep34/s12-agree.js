/* Ep 34 · line "agree" · the bride speaks · "So be it." · Close on her, eyes lowered then lifted; one lamp beside her. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP34 = window.EP34, EP33 = window.EP33;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'agree',
    fadeIn: 0.15,
    draw(ctx, t, env) {
      const T = env.T, up = E.inOutSine(clamp((t - 0.3) / 0.8));
      EP34.chamber(ctx, T, { lampX: 820, lampY: 1180, cam: { zoom: 1.9, dy: -300, dx: 20 }, after: (g) => {
        CH.nagini.draw(g, { x: 540, y: 1780, scale: 1.0, facing: 'right', pose: { name: 'stand' }, expression: { look: lerp(0.2, -0.05, up), speak: EPA.mouth(env, t) }, light: EP34.lamp(540, 1500, 820, 1180, 1.2), t: T, key: 'g34-ng' });
      } });
    },
    post: () => ({ bloom: 0.44, vignette: 0.52, paper: 0.3 }),
  });
})();
