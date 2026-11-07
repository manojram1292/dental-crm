/* Ep 35 · line "asti" · Jaratkaru speaks · "Asti. There is one. He will shine like fire." · At the doorway, turning back, lit red from the window; the word ASTI in gold (beats[0]); a small gold flame kindles at her waist (beats[2]). */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP34 = window.EP34, EP35 = window.EP35;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'asti',
    fadeIn: 0.15,
    draw(ctx, t, env) {
      const T = env.T, B = env.beats, fl = E.outCubic(clamp((t - B[2] + 0.3) / 0.6));
      EP34.chamber(ctx, T, { sun: 0.9, lampX: 980, cam: { zoom: 1.35, dx: 0, dy: -460 }, after: (g) => {
        g.fillStyle = '#05030a'; g.beginPath(); g.moveTo(80, 1700); g.lineTo(80, 1050); g.quadraticCurveTo(230, 900, 380, 1050); g.lineTo(380, 1700); g.fill();
        CH.jaratkaru.draw(g, { x: 230, y: 1700, scale: 0.7, facing: 'right', pose: { name: 'bless', k: 0.6 }, expression: { speak: EPA.mouth(env, t) }, light: EP35.red(230, 1400, 1.2), t: T, key: 'a35-jk' });
        CH.nagini.draw(g, { x: 760, y: 1720, scale: 0.72, facing: 'left', pose: { name: 'cradle', k: 1 }, light: EP34.lamp(760, 1500, 980, 1560, 1.2), t: T, key: 'a35-ng' });
        EP35.flame(g, 700, 1290, 1.0, T, fl);
      } });
      const a = clamp((t - B[0] + 0.1) / 0.3) * (1 - clamp((t - B[1]) / 0.4));
      EPA.plaque(ctx, env.strings.astiWord, env.strings.astiGloss, KIT.CX, 420, a, { size: 64, key: 'a35-pl' });
    },
    post: () => ({ bloom: 0.46, vignette: 0.5, paper: 0.3 }),
  });
})();
