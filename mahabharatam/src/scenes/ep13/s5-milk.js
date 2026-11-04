/*
 * Ep 13 · line "milk" · "The sap of its trees and herbs ran into the sea, and the water turned to milk, then to ghee."
 * Golden streams of sap run down Mandara's flanks (beats[0..1]); the dark sea whitens outward
 * (beats[2] 'milk', a soft swell) and then takes a gold sheen (beats[3] 'ghee').
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP11 = window.EP11, EP12 = window.EP12, EP13 = window.EP13;
  const { clamp, E } = R;
  R.scene({
    id: 'milk',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b0 = env.beats[0] ?? 0.3, b2 = env.beats[2] ?? 4.2, b3 = env.beats[3] ?? 5.3;
      const sap = E.outCubic(clamp((t - b0 + 0.2) / 1.0)), milk = E.inOutSine(clamp((t - b2 + 1.4) / 1.6)), ghee = E.inOutSine(clamp((t - b3 + 0.3) / 0.9));
      const draw = (g) => {
        EP12.churn(g, T, { cx: 540, y: 1560, s: 0.6, spin: T * 0.8, wrap: 1, hosts: 0, light: EP13.seaGlow(540, 1400, 0.9 + 0.3 * milk) });
        EP13.sap(g, 540, 1500, 0.6, T, sap);
        EP11.surf(g, 1500, T, 1, { color: '#ffffff', deep: EP11.hex('#1e2a6a', EP11.hex('#ecebf8', '#f4e0a8', ghee), milk), deep2: EP11.hex('#060a24', EP11.hex('#b8b8d8', '#c8a060', ghee), milk) });
      };
      if (milk < 0.999) EP11.sea(ctx, T, { cam: { zoom: 1.12 - 0.08 * p, dy: 40 }, hz: 1000, jewels: 0.3, milk: 0.25, after: draw });
      if (milk > 0.001) { ctx.save(); ctx.globalAlpha = milk; EP13.whiteSea(ctx, T, { cam: { zoom: 1.12 - 0.08 * p, dy: 40 }, hz: 1000, ghee, after: draw }); ctx.restore(); }
    },
    post: () => ({ bloom: 0.42, vignette: 0.4, paper: 0.3 }),
  });
})();
