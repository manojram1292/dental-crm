/* Ep 37 · line "bite" · "He bit a great banyan, and it burned to ash." · The strike (beats[0]); green venom-fire runs up the trunk and the whole tree collapses into a grey heap (beats[1]). The woodman, unseen, crouches in the branches. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP36 = window.EP36, EP37 = window.EP37, EP8 = window.EP8;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'bite',
    fadeIn: 0.15,
    draw(ctx, t, env) {
      const T = env.T, B = env.beats, burn = clamp((t - B[0]) / (B[1] - B[0] + 0.4)), st = E.outCubic(clamp((t - B[0] + 0.4) / 0.4));
      EP37.road(ctx, T, { cam: { zoom: 1.0, dy: -40 }, after: (g) => {
        EP37.banyan(g, 600, 1500, 0.9, T, { burn, grow: 1, man: burn < 0.6 ? 1 - burn : 0, manKey: 'bt37-man' });
        CH.takshaka.draw(g, { x: 240, y: 1700, scale: 0.65, facing: 'right', pose: { name: 'strike', k: st }, light: EP37.noonLit(240, 1700), t: T, key: 'bt37-tk' });
      } });
    },
    post: () => ({ bloom: 0.46, vignette: 0.44, paper: 0.3 }),
  });
})();
