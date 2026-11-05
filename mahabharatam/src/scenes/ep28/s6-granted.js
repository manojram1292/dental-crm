/* Ep 28 · line "granted" · Vishnu: "So be it." · Vishnu's hand in abhaya; a ring of blue light passes over Garuda (beats[1]). */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP28 = window.EP28;
  const { clamp, E, lerp } = R;
  R.scene({
    id: 'granted',
    fadeIn: 0.15,
    draw(ctx, t, env) {
      const T = env.T;
      const b1 = env.beats[1] ?? 0.8;
      const ring = E.outCubic(clamp((t - b1 + 0.3) / 0.9));
      EP28.dawnSky(ctx, T, { cam: { zoom: 1.1 }, after: (g) => {
        EP28.pair(g, T, 760, 1450, 0.5, { vx: 330, vy: 1600, vs: 0.65, vpose: { name: 'bless', k: 1 }, vex: { speak: EP28.mouth(env, t) } });
        if (ring > 0 && ring < 1) { g.save(); g.strokeStyle = `rgba(140,190,255,${1 - ring})`; g.lineWidth = 14; g.beginPath(); g.ellipse(700, lerp(700, 1450, ring), 320, 70, 0, 0, R.TAU); g.stroke(); g.restore(); }
      } });
    },
    post: () => ({ bloom: 0.44, vignette: 0.42, paper: 0.3 }),
  });
})();
