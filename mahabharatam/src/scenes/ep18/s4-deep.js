/*
 * Ep 18 · line "deep" · "Below them moved monsters and jewels, and a fire that burns beneath the sea."
 * A cut-away under the surface (the sisters' shadows pass over at the top): makaras and jewels
 * (beats[0..1]); far down, the fire under the sea glows red and breathes (beats[2..3]).
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP17 = window.EP17;
  const { clamp, E, hash } = R;
  R.scene({
    id: 'deep',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b0 = env.beats[0] ?? 1.2, b2 = env.beats[2] ?? 3.4;
      const deep = E.outCubic(clamp((t - b0 + 0.6) / 0.8)), fire = E.inOutSine(clamp((t - b2 + 0.6) / 1.0));
      EP17.ocean(ctx, T, { hz: 260, deep, cam: { zoom: 1.0 + 0.05 * p, dy: -150 * p }, after: (g) => {
        g.fillStyle = 'rgba(4,8,30,0.4)'; g.fillRect(-400, 300, 1880, 2200);
        // the fire under the sea: a glowing mouth of flame breathing on the sea-floor
        const fx = 560, fy = 1950;
        KIT.glow(g, fx, fy, 900, '#ff4a1a', 0.6 * fire);
        g.save(); g.globalAlpha = fire;
        for (let i = 0; i < 12; i++) { const ph = T * 3 + i; const h = 120 + 120 * (0.5 + 0.5 * Math.sin(ph)) + 80 * hash(i, 4); g.fillStyle = i % 2 ? '#ff7a2a' : '#ffd070'; g.beginPath(); g.moveTo(fx - 300 + i * 52, fy + 60); g.quadraticCurveTo(fx - 290 + i * 52, fy - h * 0.6, fx - 280 + i * 52 + Math.sin(ph) * 10, fy - h); g.quadraticCurveTo(fx - 270 + i * 52, fy - h * 0.5, fx - 250 + i * 52, fy + 60); g.closePath(); g.fill(); }
        g.restore();
        // the sisters' shadows passing over the surface
        g.save(); g.globalAlpha = 0.35; g.fillStyle = '#020410';
        for (let i = 0; i < 2; i++) { const x = ((T * 140 + i * 180) % 1600) - 300; g.beginPath(); g.ellipse(x, 330 + i * 30, 70, 14, 0, 0, R.TAU); g.fill(); }
        g.restore();
      } });
    },
    post: () => ({ bloom: 0.46, vignette: 0.5, paper: 0.3 }),
  });
})();
