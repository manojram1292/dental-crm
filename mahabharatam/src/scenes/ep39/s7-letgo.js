/* Ep 39 · line "letgo" · THE TURN · "And Indra let go." · After the 0.9 s silence: close on Indra's hand opening at the car's rail (beats[1]); the green coil slips out of his robe and the car springs up and away. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP8 = window.EP8, EP37 = window.EP37, EP38 = window.EP38, EP39 = window.EP39;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'letgo',
    fadeIn: 0.1,
    draw(ctx, t, env) {
      const T = env.T, b = env.beats[1], go = E.inOutSine(clamp((t - b + 0.1) / 0.9)), slip = clamp((t - b + 0.2) / 0.8);
      EP39.storm(ctx, T, { cam: { zoom: lerp(2.1, 1.4, go), dy: lerp(-120, -300, go) }, after: (g) => {
        const y = lerp(1250, 800, go);
        EP39.car(g, 540, y, 1.0, T, { tilt: -0.1 + 0.2 * go });
        CH.indra.draw(g, { x: 540, y: y - 40, scale: 0.55, facing: 'left', pose: { name: 'speak', k: 1 }, light: EP39.fireLit(540, y, 1.25), t: T, key: 'l39-in' });
        if (slip > 0) CH.takshaka.draw(g, { x: 600, y: 1000 + slip * 500, scale: 0.4, facing: 'left', pose: { name: 'recoil', k: 1 }, light: EP39.fireLit(600, 1200, 1.2), t: T, key: 'l39-tk' });
      } });
    },
    post: () => ({ bloom: 0.48, vignette: 0.48, paper: 0.3 }),
  });
})();
