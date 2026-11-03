/*
 * Line "episode" · "Episode one. The storyteller arrives." (not captioned:
 * the end card shows strings.episodeLabel + episodeTitle instead)
 *
 * The reusable series end card (KIT.endCard): the title handed over from the
 * previous shot stays exactly in place while the mural frame, "As Vyasa Told
 * It", the episode line and the sacred fire below arrive around it. Holds
 * through the timeline's tail.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT;
  const { clamp } = R;

  R.scene({
    id: 'episode',
    fadeIn: 0.6,
    draw(ctx, t, env) {
      const k = clamp(t / Math.max(1.2, env.speech[1] + 0.2));
      KIT.endCard.draw(ctx, env.T, k, env.strings, { titleFrom: 1, sheen: -1 });
      // a few embers drifting up from the fire through the card
      KIT.embers(ctx, env.T, { x: KIT.CX, y: 1180, spread: 120, rate: 5, life: 3.2, rise: 160, sway: 50, size: 2, alpha: 0.6 * k, seed: 93 });
    },
    post: () => ({ bloom: 0.36, vignette: 0.45, paper: 0.3 }),
  });
})();
