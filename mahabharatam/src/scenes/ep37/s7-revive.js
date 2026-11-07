/* Ep 37 · line "revive" · THE TURN · "Kashyapa gathered the ash, and the tree grew back, leaf by leaf." · After the 0.9 s silence: the healer kneels at the ash heap (beats[0]); a sprout, two leaves, then the whole banyan rises in green-gold light (NEW LIGHT, the regrowth). */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP36 = window.EP36, EP37 = window.EP37, EP8 = window.EP8;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'revive',
    fadeIn: 0.1,
    draw(ctx, t, env) {
      const T = env.T, B = env.beats, grow = E.inOutSine(clamp((t - B[0] - 0.2) / (B[2] - B[0] + 0.6)));
      EP37.road(ctx, T, { green: grow, greenAt: [600, 1200], cam: { zoom: lerp(1.3, 1.0, grow), dy: lerp(-300, -40, grow) }, after: (g) => {
        EP37.banyan(g, 600, 1500, 0.9, T, { burn: grow > 0 ? 0 : 1, grow });
        CH.healer.draw(g, { x: 300, y: 1640, scale: 0.6, facing: 'right', pose: { name: 'bless', k: 1 }, light: { dir: Math.atan2(1200 - 1040, 600 - 300), intensity: 1.2, front: 0.75, fill: 0.5 }, t: T, key: 'r37-he' });
      } });
    },
    post: () => ({ bloom: 0.48, vignette: 0.42, paper: 0.3 }),
  });
})();
