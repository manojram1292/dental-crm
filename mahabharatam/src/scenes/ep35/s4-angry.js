/* Ep 35 · line "angry" · "But if she woke him, he would be angry." · Close on her face, half in red light, half in violet shadow; her hand hovers and draws back. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP34 = window.EP34, EP35 = window.EP35;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'angry',
    fadeIn: 0.15,
    draw(ctx, t, env) {
      const T = env.T, p = E.inOutSine(clamp(t / env.dur));
      EP34.chamber(ctx, T, { sun: 0.55, cam: { zoom: lerp(2.6, 2.75, p), dx: 380, dy: -1040 }, after: (g) => EP34.sleep(g, T, { look: 0.1 + 0.15 * Math.sin(t * 1.5) }) });
    },
    post: () => ({ bloom: 0.42, vignette: 0.56, paper: 0.3 }),
  });
})();
