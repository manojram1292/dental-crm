/* Ep 31 · line "ask" · THE TURN · "Shesha, what are you doing? Choose a boon." · After the 0.9 s rest: NEW LIGHT, Brahma's rose-gold dawn floods the snow (beats[0]); Brahma frontal on his lotus, large in the upper sky; the thin serpent small, low right (a vertical, not a side-by-side, two-shot). */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'ask',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0];
      const rose = E.inOutSine(clamp((t - b0 + 0.5) / 0.9)), app = E.outCubic(clamp((t - b0 + 0.3) / 0.8));
      EPA.penance(ctx, T, { place: 4, hz: 1400, rose, cam: { zoom: 1.0 + 0.05 * clamp(t / env.dur) }, after: (g) => {
        if (app > 0) { KIT.glow(g, 540, 640, 700, '#ffd0c0', 0.6 * app); CH.brahma.draw(g, { x: 540, y: lerp(1060, 980, app), scale: 0.62, facing: 'front', pose: { name: 'speak', k: E.inOutSine(clamp((t - b0) / 0.5)) }, expression: { speak: EPA.mouth(env, t) }, alpha: app, light: { dir: Math.PI / 2, intensity: 1.1, front: 0.8, fill: 0.4 }, t: T, key: 'a31-br' }); }
        EPA.shesha(g, 820, 1900, 0.42, T, { k: 1, w: 62, sway: 0.3, light: EPA.lit(820, 1500, 540, 700, 1.0, 0.7, 0.5), key: 'a31-sh' });
      } });
    },
    post: () => ({ bloom: 0.46, vignette: 0.4, paper: 0.3 }),
  });
})();
