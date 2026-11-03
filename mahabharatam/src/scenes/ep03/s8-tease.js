/*
 * Ep 3 · line "tease" · NEXT (the cliffhanger) · "A war so vast needed a story just as vast.
 * Who first composed it?"
 *
 * Dusk on the field after the war: the banners are gone, the dust settles. On "story"
 * (beats[0]) palm leaves rise out of the dust, one above another, glowing. On "Who"
 * (beats[1]) a figure forms in the mist to the right: a dark sage with a soft gold halo
 * (Vyasa, not yet named), and the leaves drift toward him.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT;
  const { clamp, lerp, E, PAL } = R;
  const HZ = 1010;

  R.scene({
    id: 'tease',
    fadeIn: 0.8,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur, 0, 1.3);
      const b0 = env.beats[0] ?? dur * 0.3, b1 = env.beats[1] ?? dur * 0.65;
      KIT.vgrad(ctx, 0, HZ + 2, [[0, '#120f2a'], [0.5, '#3a2440'], [0.82, '#8a3a2a'], [1, '#c86a3a']]);
      KIT.glow(ctx, 540, HZ - 20, 800, '#ffb070', 0.25, 'lighter', 0.3);
      // the figure in the mist, behind
      const fa = E.inOutSine(clamp((t - (b1 - 0.3)) / 1.4));
      if (fa > 0.003) {
        KIT.glow(ctx, 760, HZ - 420, 420, '#ffcf7a', 0.25 * fa, 'lighter');
        KIT.characters.vyasa.draw(ctx, { x: 760, y: HZ + 40, scale: 0.66, facing: 'left', pose: 'stand', light: { dir: -Math.PI / 2, intensity: 0.9 * fa, front: 0 }, t: T, alpha: 0.85 * fa, key: 'tease3-vyasa' });
      }
      KIT.vgrad(ctx, HZ, R.H, [[0, '#4a2a20'], [0.08, '#2a1712'], [1, '#0c0605']]);
      // the settling dust
      KIT.smoke.draw(ctx, 540, HZ + 40, T, { h: 520, w: 260, strands: 4, alpha: 0.24 * (1 - 0.5 * p), color: '#8a6a5a', lean: 20, speed: 0.4, seed: 78, curls: 0.5, spread: 1.4 });
      const hz = ctx.createLinearGradient(0, HZ - 200, 0, HZ + 40);
      hz.addColorStop(0, 'rgba(160,110,90,0)'); hz.addColorStop(1, 'rgba(160,110,90,0.45)');
      ctx.fillStyle = hz; ctx.fillRect(0, HZ - 200, R.W, 240);
      // leaves rising out of the dust
      for (let k = 0; k < 5; k++) {
        const born = b0 - 0.2 + k * 0.28;
        const u = clamp((t - born) / 1.4);
        if (u <= 0) continue;
        const f = E.outCubic(u);
        const ty = lerp(HZ + 80, 520 + k * 72, f);
        const drift = fa * (40 + 30 * k);
        KIT.glow(ctx, 390 + drift, ty, 240, PAL.saffron, 0.18 * f);
        KIT.manuscript.leaf(ctx, 390 + Math.sin(T * 1.1 + k) * 30 * (1 - f) + drift, ty, 440 - Math.abs(k - 2) * 24, 42, E.inOutCubic(clamp((u - 0.2) / 0.8)), { seed: 600 + k, alpha: clamp(u * 3), light: 0.6, tilt: (1 - f) * (k % 2 ? 0.4 : -0.4) });
      }
    },
    post: () => ({ bloom: 0.4, vignette: 0.55, paper: 0.32 }),
  });
})();
