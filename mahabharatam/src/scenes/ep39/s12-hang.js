/* Ep 39 · line "hang" · "And Takshaka hung in the air, above the fire." · Takshaka held motionless in mid-air over the flames, rings of gold around him, the smoke parting; a slow push. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP8 = window.EP8, EP37 = window.EP37, EP38 = window.EP38, EP39 = window.EP39;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  EP39.hangShot = (ctx, T, t, zoom) => {
    EP37.blaze(ctx, T, { cam: { zoom, dy: -360 }, after: (g) => {
      KIT.glow(g, 540, 900, 500, '#ffe080', 0.35);
      CH.takshaka.draw(g, { x: 540, y: 1250 + 10 * Math.sin(T * 1.5), scale: 0.5, facing: 'left', pose: { name: 'recoil', k: 0.8 }, light: { dir: Math.PI / 2, intensity: 1.2, front: 0.75, fill: 0.5 }, t: T, key: 'hg39-tk' });
      EP39.rings(g, 540, 1100, 380, T, 1);
    } });
  };
  R.scene({
    id: 'hang',
    fadeIn: 0.2,
    draw(ctx, t, env) { EP39.hangShot(ctx, env.T, t, 1.1 + 0.12 * clamp(t / env.dur)); },
    post: () => ({ bloom: 0.5, vignette: 0.48, paper: 0.3 }),
  });
})();
