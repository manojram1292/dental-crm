/* Ep 38 · line "praise" · THE TURN · Astika speaks · "This sacrifice shines like the sacrifices of the gods!" · After the 0.9 s silence, the reverse: the boy frontal-ish at the gate, lit, his voice ringing; the guards turn; the great fire behind them flares gold (beats[0]). */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP8 = window.EP8, EP34 = window.EP34, EP37 = window.EP37, EP38 = window.EP38;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'praise',
    fadeIn: 0.1,
    draw(ctx, t, env) {
      const T = env.T, fl = E.outCubic(clamp((t - env.beats[0] + 0.2) / 0.5)), p = clamp(t / env.dur);
      EP38.noonSatra(ctx, T, { fire: 0.9 + 0.5 * fl, cam: { zoom: 1.7 + 0.08 * p, dy: -560, dx: 140 }, after: (g) => {
        KIT.glow(g, 540, 1000, 700, '#ffd070', 0.4 * fl); g.save(); g.fillStyle = 'rgba(30,14,8,0.55)'; g.fillRect(-400, -400, 820, 2600); g.restore();
        CH.astika.draw(g, { x: 330, y: 1800, scale: 0.85, facing: 'left', pose: { name: 'speak', k: 1 }, expression: { speak: EPA.mouth(env, t) }, light: { dir: -Math.PI / 2 - 0.4, intensity: 1.25, front: 0.85, fill: 0.55 }, t: T, key: 'pr38-as' });
      } });
    },
    post: () => ({ bloom: 0.5, vignette: 0.46, paper: 0.3 }),
  });
})();
