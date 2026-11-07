/* Ep 34 · line "answer" · THE TURN · Vasuki speaks · "Her name is Jaratkaru. And I will keep her." · After the 0.9 s silence, the reverse angle: close on the bride's face, lit; Vasuki's hood behind her; on her name (beats[0]) the sage's shadow falls across them. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP34 = window.EP34, EP33 = window.EP33;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'answer',
    fadeIn: 0.15,
    draw(ctx, t, env) {
      const T = env.T, p = E.inOutSine(clamp(t / env.dur)), sh = E.inOutSine(clamp((t - env.beats[0] + 0.4) / 0.8));
      EP34.forest(ctx, T, { cam: { zoom: lerp(2.0, 2.15, p), dy: -330, dx: -40 }, after: (g) => {
        CH.vasuki.draw(g, { x: 900, y: 1950, scale: 0.85, facing: 'left', pose: { name: 'rise', k: 1 }, expression: { speak: EPA.mouth(env, t) }, light: EP34.shaft(760, 1400, 1.1), t: T, key: 'r34-va' });
        CH.nagini.draw(g, { x: 430, y: 1900, scale: 0.95, facing: 'left', pose: { name: 'stand' }, light: EP34.shaft(520, 1500, 1.25), t: T, key: 'r34-ng' });
        g.save(); g.globalAlpha = 0.45 * sh; g.fillStyle = '#020402'; g.beginPath(); g.moveTo(-200, 2200); g.lineTo(200, 700); g.lineTo(380, 700); g.lineTo(300, 2200); g.fill(); g.restore();
      } });
    },
    post: () => ({ bloom: 0.44, vignette: 0.5, paper: 0.3 }),
  });
})();
