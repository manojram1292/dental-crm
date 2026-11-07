/* Ep 34 · line "came" · "The serpents heard. Vasuki came, and brought his sister." · From the roots, serpents' eyes (beats[0]); Vasuki rises out of a cleft (beats[1]); his sister steps into a shaft of light beside him (beats[2]); plaque. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP34 = window.EP34, EP33 = window.EP33;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'came',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, B = env.beats;
      const v = E.outCubic(clamp((t - B[1] + 0.5) / 0.8)), s = E.inOutSine(clamp((t - B[2] + 0.6) / 0.9));
      EP34.forest(ctx, T, { cam: { zoom: 1.05, dy: 40 }, after: (g) => {
        for (let k = 0; k < 10; k++) { const x = 120 + k * 95, y = 1820 + 40 * Math.sin(k * 2.3); if (Math.sin(T * 1.2 + k * 1.9) < -0.5) continue; g.fillStyle = '#e8ff90'; for (const d of [-7, 7]) { g.beginPath(); g.ellipse(x + d, y, 5, 3, 0, 0, Math.PI * 2); g.fill(); } }
        g.fillStyle = '#060a04'; g.beginPath(); g.ellipse(360, 1700, 230, 50, 0, 0, Math.PI * 2); g.fill();
        if (v > 0) CH.vasuki.draw(g, { x: 340, y: lerp(2300, 1700, v), scale: 0.62, facing: 'right', pose: { name: 'rise', k: v }, light: EP34.shaft(340, 1500, 1.15), t: T, key: 'm34-va' });
        if (s > 0) CH.nagini.draw(g, { x: lerp(560, 700, s), y: 1720, scale: 0.78, facing: 'right', pose: { name: 'walk', phase: T * 2 * (1 - s) }, alpha: s, light: EP34.shaft(700, 1500, 1.2), t: T, key: 'm34-ng' });
      } });
      EPA.plaque(ctx, env.strings.brideName, env.strings.brideEpithet, KIT.CX, 470, clamp((t - B[2] - 0.2) / 0.3) * (1 - clamp((t - env.dur + 0.4) / 0.3)), { size: 50, key: 'm34-pl' });
    },
    post: () => ({ bloom: 0.42, vignette: 0.46, paper: 0.3 }),
  });
})();
