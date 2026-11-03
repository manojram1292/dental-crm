/*
 * Ep 7 · line "strike" · "It became Takshaka, and burned the king with his venom."
 *
 * The insect swells: a cold green light blooms from the king's hand and on "Takshaka"
 * (beats[0]) the serpent king rises out of it, growing to fill the arch behind the king,
 * hoods flaring. On "burned" (beats[1]) he strikes; the venom's fire (green-gold mural
 * flames, never gore) floods the pavilion from below and the king falls back into it; on
 * "venom" (beats[2]) the flames tower and the frame goes green-white.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP7 = window.EP7;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'strike',
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b0 = env.beats[0] ?? 0.9, b1 = env.beats[1] ?? 2.8, b2 = env.beats[2] ?? 3.9;
      const grow = E.outCubic(clamp((t - (b0 - 0.6)) / 1.2));
      const strike = E.inOutCubic(clamp((t - (b1 - 0.35)) / 0.45));
      const burn = E.inOutSine(clamp((t - (b1 - 0.1)) / 1.4));
      const fall = E.inOutSine(clamp((t - (b1 - 0.05)) / 0.9));
      const flash = clamp((t - (b2 - 0.2)) / 0.5) * (1 - clamp((t - b2 - 0.6) / 0.6));
      const PK = { x: 780, y: 2050, scale: 1.3, facing: 'left', t: T };
      EP7.pavilion(ctx, T, {
        sky: 1, burn: burn * 0.9, cam: { zoom: lerp(1.0, 0.92, p) },
        after: (g) => {
          const h = CH.parikshit.anchor({ ...PK, pose: { name: 'hold', k: 1 } }, 'hand');
          KIT.glow(g, h[0], h[1] - 50, 160 + 600 * grow, '#30ff9a', 0.6 * (1 - 0.5 * grow) * clamp(t / 0.3));
          if (grow > 0.01) {
            const sc = lerp(0.08, 0.95, grow);
            EP7.ghost(g, clamp(0.3 + grow), (q) => CH.takshaka.draw(q, { x: lerp(h[0] - 40, 430, grow), y: lerp(h[1], 1720, grow), scale: sc, facing: 'right', pose: strike > 0 ? { name: 'strike', k: strike } : { name: 'stand' }, expression: { mood: 'wrath' }, light: { dir: -Math.PI / 2 + 0.5, intensity: 1.2, front: 0.15 }, t: T, key: 's7-tk' }), 's7-g');
          }
          const pose = fall > 0.01 ? { name: 'fall', k: fall } : { name: 'hold', k: 1 };
          CH.parikshit.draw(g, { ...PK, x: PK.x + 40 * fall, pose, expression: { look: -0.1 * strike }, light: { dir: Math.PI + 0.3, intensity: 1 + 0.4 * burn, front: 0.2 }, t: T, key: 's7-pk' });
          if (grow < 0.5) { g.save(); g.globalAlpha = 1 - 2 * grow; EP7.insect(g, h[0] - 60, h[1] - 60, 1.3 * (1 + grow), T, { ang: -0.3, glint: 1 }); g.restore(); }
        },
      });
      if (flash > 0) { ctx.save(); ctx.globalAlpha = 0.55 * flash; ctx.fillStyle = '#d8ffe8'; ctx.fillRect(0, 0, R.W, R.H); ctx.restore(); }
    },
    post: () => ({ bloom: 0.55, vignette: 0.5, paper: 0.3 }),
  });
})();
