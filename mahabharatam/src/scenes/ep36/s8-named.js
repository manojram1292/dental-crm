/* Ep 36 · line "named" · "They called him Astika." · Vasuki lifts his hood over mother and child like a canopy; plaque. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP34 = window.EP34, EP35 = window.EP35, EP36 = window.EP36;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'named',
    fadeIn: 0.15,
    draw(ctx, t, env) {
      const T = env.T, up = E.inOutSine(clamp(t / 1.2));
      EP36.birth(ctx, T, { k: 0.6, center: [600, 1150], cam: { zoom: 1.45, dy: -560, dx: 40 }, after: (g) => {
        CH.vasuki.draw(g, { x: 860, y: 1850, scale: 0.8, facing: 'left', pose: { name: 'rise', k: lerp(0.7, 1, up) }, light: { dir: Math.PI, intensity: 1.1, front: 0.6, fill: 0.4 }, t: T, key: 'nm36-va' });
        CH.nagini.draw(g, { x: 560, y: 1700, scale: 0.72, facing: 'right', pose: { name: 'cradle', k: 1 }, light: { dir: -Math.PI / 2, intensity: 1.2, front: 0.9, fill: 0.6 }, t: T, key: 'nm36-ng' });
        KIT.glow(g, 620, 1240, 100, '#ffffff', 0.8);
      } });
      EPA.plaque(ctx, env.strings.astikaName, env.strings.astikaEpithet, KIT.CX, 380, clamp((t - env.beats[0] + 0.2) / 0.3), { size: 60, key: 'nm36-pl' });
    },
    post: () => ({ bloom: 0.5, vignette: 0.46, paper: 0.3 }),
  });
})();
