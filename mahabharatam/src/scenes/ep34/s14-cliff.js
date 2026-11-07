/* Ep 34 · line "cliff" · NEXT 1 · "One evening, the sun began to set while he slept." · The chamber: the red-gold sunset shaft from the high window crawls across the floor toward the sleeping sage (beats[0]); she looks from him to the light (beats[1]). EP34.sunset is reused by the Next overlay. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP34 = window.EP34, EP33 = window.EP33;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  EP34.sunset = (ctx, T, t, b1) => {
    const sun = clamp(t / 4), look = E.inOutSine(clamp((t - b1 + 0.4) / 0.6));
    EP34.chamber(ctx, T, { sun, cam: { zoom: 1.25 + 0.08 * sun, dx: 60, dy: -660 }, after: (g) => EP34.sleep(g, T, { look: lerp(0.25, -0.35, look) }) });
  };
  R.scene({
    id: 'cliff',
    fadeIn: 0.2,
    draw(ctx, t, env) { EP34.sunset(ctx, env.T, t, env.beats[1]); },
    post: () => ({ bloom: 0.44, vignette: 0.5, paper: 0.3 }),
  });
})();
