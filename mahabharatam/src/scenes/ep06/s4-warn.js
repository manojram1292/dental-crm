/*
 * Ep 6 · line "warn" · the queen: "Takshaka, the serpent king, wants these."
 *
 * Closer on the queen, finger raised, speaking; Uttanka at the right edge holding the
 * earrings. On "Takshaka" (beats[0]) the lattice behind her darkens in one place: a
 * hooded shadow glides past behind the stone, and a cold green glint shows through
 * its holes. On "these" (beats[1]) the earrings flash.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP6 = window.EP6;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'warn',
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b0 = env.beats[0] ?? 0.2, b1 = env.beats[1] ?? dur * 0.7;
      const sh = clamp((t - b0) / (dur - b0));
      const flash = Math.exp(-Math.max(0, t - b1) / 0.4) * (t > b1 - 0.05 ? 1 : 0);
      const L = EP6.PLAMP;
      EP6.palace(ctx, T, {
        cam: { zoom: 1.3 + 0.06 * p, dx: 60, dy: -90 },
        behindJali: (g) => {
          // the hooded shadow gliding past behind the lattice
          const x = lerp(820, 260, E.inOutSine(sh));
          g.save(); g.globalAlpha = 0.85 * Math.sin(Math.PI * sh);
          CH.takshaka.shape(g, '#1a0e06', { x, y: 1380, scale: 0.5, facing: 'left', pose: 'stand', t: T });
          g.restore();
          KIT.glow(g, x - 20, 830, 180, '#30ff9a', 0.6 * Math.sin(Math.PI * sh));
        },
        after: (g) => {
          CH.queen.draw(g, { x: 400, y: 1480, scale: 0.68, facing: 'right', pose: { name: 'warn', k: 1, earrings: false }, expression: { speak: EP6.mouth(env, t), look: -0.03 }, light: EP6.light(400, 1100, L.x, L.y, 1, 0.4), t: T, key: 'w6-q' });
          const uo = { x: 900, y: 1490, scale: 0.62, facing: 'left', pose: { name: 'hold', k: 1 }, expression: { look: 0.05 }, light: EP6.light(900, 1100, L.x, L.y, 1, 0.35), t: T, key: 'w6-u' };
          CH.uttanka.draw(g, uo);
          const h = CH.uttanka.anchor(uo, 'hand');
          KIT.kundala.pair(g, h[0], h[1] - 22, 34, T, { glow: 0.9 + 1.5 * flash });
          if (flash > 0.02) KIT.glow(g, h[0], h[1] - 22, 260, '#fff0c0', 0.6 * flash);
        },
      });
    },
    post: () => ({ bloom: 0.36, vignette: 0.48, paper: 0.32 }),
  });
})();
