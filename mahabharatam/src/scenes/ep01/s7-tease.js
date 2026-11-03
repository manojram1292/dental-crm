/*
 * Line "tease" · NEXT (the cliffhanger) · "And Sauti began — with a field of blood."
 *
 * Back at the fire, close: Sauti seated on the left, facing the fire (right). On "began"
 * (beats[0]) his hand opens to the fire and it flares; the smoke above starts to turn. On
 * "blood" (beats[1]) the fire burns red, the whole picture is graded toward blood-red,
 * and in the smoke five dark-red pools glimmer in a quincunx: the field of five lakes,
 * the next episode, already forming.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP2 = window.EP2;
  const { clamp, E, PAL } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'tease',
    fadeIn: 0.6,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const fl = KIT.flicker(T, 0);
      const b0 = env.beats[0] ?? dur * 0.25, b1 = env.beats[1] ?? dur * 0.7;
      const flare = clamp((t - (b0 - 0.1)) / 0.3) * (1 - 0.5 * clamp((t - b0 - 0.5) / 1.2));
      const red = E.inOutSine(clamp((t - (b1 - 0.5)) / 0.8));
      KIT.vgrad(ctx, 0, R.H, [[0, '#06071a'], [0.45, '#151634'], [0.8, '#2a1520'], [1, '#2a120a']]);
      KIT.glow(ctx, 790, 1500, 950, red > 0.5 ? '#c0141c' : PAL.saffron, (0.4 + 0.3 * flare) * fl);
      // the smoke column, bending over toward the middle of the frame
      KIT.smoke.draw(ctx, 790, 1380, T, { h: 1150, w: 64, strands: 4, alpha: 0.34 + 0.1 * flare, color: red > 0.3 ? '#a06878' : '#a597b5', speed: 0.9, seed: 21, curls: 0.8, lean: -260, spread: 0.6, fadeOutAt: 0.75 });
      // five pools glimmering in the smoke (the field of five lakes, seen from above, far off)
      if (red > 0.01) {
        ctx.save();
        ctx.translate(560, 600); ctx.scale(0.72, 0.72 * 0.62); ctx.translate(-500, -500);
        ctx.globalCompositeOperation = 'lighter';
        EP2.LAKES.forEach((L, i) => {
          const a = red * clamp((t - b1 + 0.2 - i * 0.12) / 0.6) * (0.75 + 0.25 * Math.sin(T * 2 + i));
          if (a <= 0.01) return;
          ctx.globalAlpha = a * 0.75;
          ctx.fillStyle = '#b0141a';
          ctx.beginPath(); EP2.lakePath(ctx, i, 0.95, 0.04); ctx.fill();
          ctx.globalAlpha = a * 0.6; ctx.strokeStyle = '#ff6a4a'; ctx.lineWidth = 6;
          ctx.beginPath(); EP2.lakePath(ctx, i, 1.0); ctx.stroke();
          KIT.glow(ctx, L[0], L[1], L[2] * 2.2, '#d0201a', 0.5 * a);
        });
        ctx.restore();
      }
      // the fire, flaring on "began"
      const base = KIT.fire.altar(ctx, 790, 1530, 260, T, { light: 1 });
      KIT.fire.draw(ctx, 790, base + 2, 250 + 160 * flare, T, { intensity: 1 + 0.3 * flare, seed: 0, lean: -0.15 });
      KIT.embers(ctx, T, { x: 790, y: 1320, spread: 140, rate: 10 + 30 * flare, life: 2.2, rise: 480, sway: 60, size: 2.8, alpha: 0.9, seed: 202, lean: -0.6 });
      // Sauti begins
      const k = E.inOutCubic(clamp((t - (b0 - 0.4)) / 0.9));
      CH.sauti.draw(ctx, {
        x: 215, y: 1640, scale: 0.88, facing: 'right', pose: { name: 'speak', base: 'sit', k },
        expression: { look: -0.08 * k }, light: { dir: Math.atan2(-120, 560), intensity: Math.min(1.25, fl + 0.3 * flare), front: 0.15 }, t: T, key: 'tease-sauti',
      });
      // the grade toward blood
      if (red > 0.01) {
        ctx.save();
        ctx.globalCompositeOperation = 'color'; ctx.globalAlpha = 0.5 * red;
        ctx.fillStyle = '#8a1010'; ctx.fillRect(0, 0, R.W, R.H);
        ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.25 * red;
        ctx.fillStyle = '#7a2020'; ctx.fillRect(0, 0, R.W, R.H);
        ctx.restore();
      }
    },
    post: () => ({ bloom: 0.42, vignette: 0.55, paper: 0.3 }),
  });
})();
