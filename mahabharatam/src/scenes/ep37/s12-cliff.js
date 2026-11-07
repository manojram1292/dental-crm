/* Ep 37 · line "cliff" · NEXT 1 · "Back in the present, the fire blazed, and Vasuki felt it pulling him in." · NEW LIGHT, the snake sacrifice ablaze now: serpents spiral into the white-cored fire; Vasuki's great hood strains against the pull at the frame's left edge (beats[2]). EP37.pull is reused by the Next overlay. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP36 = window.EP36, EP37 = window.EP37, EP8 = window.EP8;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  EP37.pull = (ctx, T, t, b2) => {
    const pull = E.inOutSine(clamp((t - b2 + 0.8) / 1.4)), u = clamp(t / 6);
    EP37.blaze(ctx, T, { cam: { zoom: 1.0 + 0.1 * u, dy: -120 }, after: (g) => {
      CH.vasuki.draw(g, { x: lerp(-40, 80, pull), y: 1900, scale: 0.85, facing: 'right', pose: { name: 'rise', k: lerp(0.7, 0.95, pull) }, expression: { mood: 'wrath' }, light: EP8.fireLight(80, 1700, 1.2, 0.7), t: T, key: 'p37-va' });
    } });
  };
  R.scene({
    id: 'cliff',
    fadeIn: 0.25,
    draw(ctx, t, env) { EP37.pull(ctx, env.T, t, env.beats[2]); },
    post: () => ({ bloom: 0.48, vignette: 0.5, paper: 0.3 }),
  });
})();
