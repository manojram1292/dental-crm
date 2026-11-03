/*
 * Line "fire" · "In the Naimisha forest, sages kept a sacred fire burning… for twelve years."
 * (dissolves in from the hook's last ember; the place name is set in gold on "Naimisha")
 *
 * The clearing in the Naimisha forest. The sacred fire burns in its stepped
 * altar; seven sages sit around it; smoke rises. The sky runs through twelve
 * and a half days and nights, slow at first, then so fast that the sun and
 * moon become long-exposure arcs and the stars wheel around Dhruva, the pole
 * star, then it slows again into night. The fire never changes: it is the one
 * constant thing. The camera pushes in slowly.
 * Starts at dawn (continuity with the forest), ends at midnight (continuity
 * with the next shot).
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT;
  const { clamp, lerp, E, PAL } = R;

  const C0 = 0.02, DAYS = 12.73;          // sunrise → midnight, twelve years later
  const ramp = (u) => E.inOutCubic(clamp(u));
  function cycleAt(t, dur) {
    const a = 0.08 * dur, b = 0.94 * dur;
    return C0 + DAYS * ramp((t - a) / (b - a));
  }

  R.scene({
    id: 'fire',
    fadeIn: 0.8,
    draw(ctx, t, env) {
      const p = clamp(t / env.dur, 0, 1.2);
      const c = cycleAt(t, env.dur);
      const speed = Math.abs(cycleAt(t + 0.02, env.dur) - cycleAt(t - 0.02, env.dur)) / 0.04;
      KIT.ashram.draw(ctx, env.T, {
        cycle: c, speed,
        cam: { zoom: 1.0 + 0.05 * E.inOutSine(p), dy: 20 * p },
        smoke: { alpha: 0.36, lean: 30 },
      });
      // the place name, in gold, on its word; it leaves as the days begin to race
      const S = env.strings, keys = env.line.display || [];
      const nb = env.beats[0] ?? 1;
      const k = clamp((t - (nb - 0.12)) / 0.75) * (1 - clamp((t - (env.beats[1] ?? env.dur * 0.6) - 0.4) / 0.6));
      if (k > 0 && keys[0]) {
        const y = 330, fl = KIT.flicker(env.T, 0);
        ctx.save(); ctx.globalAlpha = 0.75 * k;
        const g = ctx.createLinearGradient(0, y - 150, 0, y + 150);
        g.addColorStop(0, 'rgba(8,6,12,0)'); g.addColorStop(0.5, 'rgba(8,6,12,0.6)'); g.addColorStop(1, 'rgba(8,6,12,0)');
        ctx.fillStyle = g; ctx.fillRect(0, y - 150, R.W, 300); ctx.restore();
        KIT.glow(ctx, KIT.CX, y - 30, 480, PAL.saffron, 0.18 * k * fl, 'lighter', 0.35);
        KIT.goldText(ctx, (S[keys[0]] || '').toUpperCase(), KIT.CX, y, { size: 96, spacing: 12, weight: 600, alpha: k, reveal: clamp((t - (nb - 0.12)) / 0.75), sheen: lerp(-0.3, 1.3, clamp((t - nb - 0.3) / 1.1)), glow: 0.35, key: 'place' });
        if (keys[1] && S[keys[1]]) {
          const ka = clamp((t - nb - 0.35) / 0.6) * k;
          ctx.save(); ctx.globalAlpha = ka; ctx.font = R.font(50, 'caption', 500, 'italic'); ctx.textAlign = 'center';
          ctx.fillStyle = PAL.cream; ctx.shadowColor = 'rgba(0,0,0,0.85)'; ctx.shadowBlur = R.px(12);
          ctx.fillText(S[keys[1]], KIT.CX, y + 74); ctx.restore();
        }
      }
    },
    post: () => ({ bloom: 0.34, vignette: 0.5, paper: 0.32 }),
  });
})();
