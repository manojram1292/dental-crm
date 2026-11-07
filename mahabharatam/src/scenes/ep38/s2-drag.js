/* Ep 38 · line "drag" · "Most of his people had burned. Now the spell was pulling Vasuki in." · NEW LIGHT, the hall under the spell (a red shaft through the cracked vault): the hall's empty coils; Vasuki writhing on his throne-coil, gold mantra bands closing. Recap band at the top. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP8 = window.EP8, EP34 = window.EP34, EP37 = window.EP37, EP38 = window.EP38;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'drag',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur), b = E.inOutSine(clamp((t - env.beats[2] + 1.2) / 1.2));
      EP38.redHall(ctx, T, { cam: { zoom: 1.0 + 0.1 * p, dy: -200 }, after: (g) => {
        for (let i = 0; i < 4; i++) { const x = [120, 300, 800, 960][i]; g.globalAlpha = 0.5; g.strokeStyle = '#3a2a5a'; g.lineWidth = 30; g.beginPath(); g.ellipse(x, 1820, 90, 24, 0, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; }
        CH.vasuki.draw(g, { x: 560, y: 1640, scale: 0.6, facing: 'left', pose: { name: 'rise', k: 0.7 + 0.2 * Math.sin(T * 4) }, expression: { mood: 'wrath' }, light: EP38.redLit(560, 1300), t: T, key: 'd38-va' });
        EP8.bindings(g, 520, 1150, 160, T, b);
      } });
      KIT.series.recapBand(ctx, T, clamp(t / 0.3) * (1 - clamp((t - 2.6) / 0.3)), env.strings, { y: 300 });
    },
    post: () => ({ bloom: 0.44, vignette: 0.5, paper: 0.3 }),
  });
})();
