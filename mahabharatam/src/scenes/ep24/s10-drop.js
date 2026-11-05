/* Ep 24 · line "drop" · "He dropped it on a lonely snow mountain, and ate his meal on the peak." · NEW LIGHT: an empty snow mountain at evening alpenglow: the branch falls and the mountain shakes (beats[0]); Garuda alights on the peak, seen from far (no eating shown). */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP24 = window.EP24, EP23 = window.EP23;
  const { clamp, E, lerp } = R;
  R.scene({
    id: 'drop',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const b0 = env.beats[0] ?? 0.4, b2 = env.beats[2] ?? 3;
      const fall = E.inCubic(clamp(t / Math.max(0.4, b0 + 0.2))), sh = Math.exp(-Math.max(0, t - b0 - 0.2) * 4) * (t > b0 + 0.2 ? 1 : 0);
      const land = E.inOutSine(clamp((t - b2 + 1.2) / 1.2));
      EP24.snow(ctx, T, { shake: sh, cam: { zoom: 1.0 }, after: (g) => {
        if (fall < 1) { g.save(); g.translate(560, lerp(200, 600, fall)); g.rotate(fall * 0.6); g.fillStyle = '#2a1a20'; g.fillRect(-300, -14, 600, 28); g.restore(); }
        else { g.fillStyle = '#2a1a20'; g.save(); g.translate(600, 660); g.rotate(0.35); g.fillRect(-280, -14, 560, 28); g.restore(); KIT.glow(g, 600, 660, 300, '#ffffff', 0.5 * sh); }
        EP23.carry(g, lerp(900, 580, land), lerp(300, 450, land), 0.22, T, { key: 'dr24', light: { dir: Math.PI, intensity: 1.1, front: 0.6 } });
      } });
    },
    post: () => ({ bloom: 0.38, vignette: 0.42, paper: 0.32 }),
  });
})();
