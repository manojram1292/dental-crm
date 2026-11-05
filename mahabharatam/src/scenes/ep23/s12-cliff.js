/* Ep 23 · line "cliff" · NEXT 1 (the catalog line) · "Hanging from that branch, upside down, were thousands of tiny sages." · Close along the cracked branch in the violet light: rows of thumb-sized sages hang head-down, each with an ash-white glow; one opens his eyes. EP23.hangers is reused by the Next overlay and episode 24. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP23 = window.EP23;
  const { clamp, E, lerp, hash } = R;
  const CH = KIT.characters;
  EP23.cliffShot = (ctx, T, t, b0) => {
    const r = E.outCubic(clamp((t - b0 + 0.6) / 0.8));
    EP23.alamba(ctx, T, { crack: 1, drop: 0.25, cam: { zoom: lerp(3.0, 3.4, clamp(t / 4)), dx: 260, dy: 200 }, after: (g) => EP23.hangers(g, T, 40, r, { crack: 1, drop: 0.25, s: 0.085 }) });
  };
  R.scene({
    id: 'cliff',
    fadeIn: 0.2,
    draw(ctx, t, env) { EP23.cliffShot(ctx, env.T, t, env.beats[0] ?? 1); },
    post: () => ({ bloom: 0.44, vignette: 0.48, paper: 0.32 }),
  });
})();
