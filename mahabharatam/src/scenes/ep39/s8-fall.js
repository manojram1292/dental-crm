/* Ep 39 · line "fall" · "Takshaka fell, whirling, toward the flames." · Takshaka tumbling (rotating) down the smoke toward the great fire; the camera falls with him. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP8 = window.EP8, EP37 = window.EP37, EP38 = window.EP38, EP39 = window.EP39;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'fall',
    fadeIn: 0.1,
    draw(ctx, t, env) {
      const T = env.T, u = clamp(t / env.dur);
      EP37.blaze(ctx, T, { cam: { zoom: lerp(1.6, 1.1, u), dy: lerp(-700, -150, u) }, after: (g) => {
        g.save(); g.translate(540, lerp(800, 1100, u)); g.rotate(t * 2.4);
        CH.takshaka.draw(g, { x: 0, y: 330, scale: 0.5, facing: 'left', pose: { name: 'recoil', k: 1 }, light: EP39.fireLit(540, 900, 1.2), t: T, key: 'fa39-tk' });
        g.restore();
      } });
    },
    post: () => ({ bloom: 0.5, vignette: 0.5, paper: 0.3 }),
  });
})();
