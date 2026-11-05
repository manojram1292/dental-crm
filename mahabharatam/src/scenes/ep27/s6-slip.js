/* Ep 27 · line "slip" · "He found the gap between its spokes, and slipped through." · Behind the tiny gold Garuda: he times the spokes and darts through a gap (beats[1]); the camera follows him in. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP26 = window.EP26, EP27 = window.EP27;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'slip',
    fadeIn: 0.15,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const b1 = env.beats[1] ?? 2;
      const dart = E.inOutCubic(clamp((t - b1 + 0.6) / 0.8));
      const spin = T * 5 * (1 - 0.85 * clamp((t - b1 + 0.9) / 0.3) * (1 - clamp((t - b1 + 0.2) / 0.3)));
      EP27.vault(ctx, T, { cam: { zoom: lerp(1.6, 2.6, dart), dy: lerp(-200, 120, dart) }, after: (g) => {
        EP26.wheel(g, 540, 1000, 440, T, { spin });
        const x = lerp(470, 560, dart), y = lerp(1500, 1050, dart);
        KIT.glow(g, x, y - 80, 140, '#ffd060', 0.6);
        CH.garuda.draw(g, { x, y, scale: lerp(0.12, 0.08, dart), facing: 'left', pose: { name: 'fly', phase: T * 10, blaze: 0.5 }, light: EP27.steel(x, y, 1.3), t: T, key: 'sl27-ga' });
      } });
      void dur;
    },
    post: () => ({ bloom: 0.44, vignette: 0.5, paper: 0.3 }),
  });
})();
