/*
 * Ep 7 · line "heard" · "His son Shringin cursed:"
 *
 * NEW PLACE, NEW LIGHT: a river at dusk under a red sky (EP7.river), the low sun on the
 * water to the left. The young ascetic Shringin, large, turns from the water; his rim
 * kindles from vermilion to blaze (wrath) on "Shringin" (beats[0]) and he pours water from
 * his pot into his cupped hand (scoop): a curse is sealed with water.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP7 = window.EP7;
  const { clamp, E } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'heard',
    fadeIn: 0.4,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b0 = env.beats[0] ?? 0.6;
      const scoop = E.inOutCubic(clamp((t - (b0 - 0.2)) / 1.0));
      const wr = clamp((t - (b0 - 0.3)) / 0.5);
      EP7.river(ctx, T, {
        red: 0.4 + 0.5 * wr, cam: { zoom: 1.1 + 0.05 * p, dy: -40 },
        after: (g) => {
          CH.shringin.draw(g, { x: 640, y: 1640, scale: 1.02, facing: 'left', pose: { name: 'scoop', k: scoop }, expression: { mood: wr > 0.3 ? 'wrath' : 'calm' }, light: { ...EP7.riverLight(640, 1640), intensity: 1 + 0.25 * wr }, t: T, key: 'e7-sh' });
          if (scoop > 0.3) {
            // a thread of water from the spout into the cupped hand
            const pot = CH.shringin.anchor({ x: 640, y: 1640, scale: 1.02, facing: 'left', pose: { name: 'scoop', k: scoop }, t: T }, 'hand');
            g.save(); g.globalAlpha = clamp((scoop - 0.3) / 0.3) * 0.8; g.strokeStyle = '#ffe0b0'; g.lineWidth = 4;
            g.beginPath(); g.moveTo(pot[0] + 4, pot[1] - 70); g.quadraticCurveTo(pot[0] + 8 + Math.sin(T * 20) * 2, pot[1] - 30, pot[0], pot[1] - 6); g.stroke(); g.restore();
          }
        },
      });
      const la = clamp((t - (b0 - 0.1)) / 0.4) * (1 - clamp((t - dur - 0.2) / 0.3));
      EP7.label(ctx, (env.strings.shringinName || 'Shringin').toUpperCase(), KIT.CX, 330, la, { size: 62, key: 'e7-name' });
      if (la > 0.01) {
        ctx.save(); ctx.globalAlpha = la; ctx.font = R.font(40, 'caption', 600, 'italic'); ctx.textAlign = 'center';
        ctx.fillStyle = '#ffe8d0'; ctx.shadowColor = 'rgba(16,4,4,0.95)'; ctx.shadowBlur = R.px(10);
        ctx.fillText(env.strings.shringinEpithet || '', KIT.CX, 405); ctx.restore();
      }
    },
    post: () => ({ bloom: 0.4, vignette: 0.5, paper: 0.32 }),
  });
})();
