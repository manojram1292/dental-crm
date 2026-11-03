/*
 * Line "vyasa" · "The story composed by Vyasa. The Mahabharatam."
 *
 * Close on the rising smoke at night, the fire glowing below frame. As the
 * smoke climbs, each strand flattens and opens into a palm-leaf page: five
 * leaves unroll from their middles, one above another, threaded on a red
 * cord: the manuscript of the story. On env.beats[0] (the title word, set in
 * the script) MAHABHARATAM blooms in gold above the leaves with a burst of
 * light and embers; it lands exactly where the end card wants its title
 * (KIT.endCard.TITLE), so the next shot dissolves around it.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT;
  const { clamp, lerp, E, PAL } = R;
  const LEAVES = [0, 1, 2, 3, 4].map((k) => ({ k, y: 838 + k * 84, w: 800 - Math.abs(k - 2) * 26, tilt: (k % 2 ? 1 : -1) * 0.012 }));

  R.scene({
    id: 'vyasa',
    fadeIn: 0.35,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const fl = KIT.flicker(T, 0);
      const tb = env.beats[0] ?? dur * 0.6;
      // night, the fire glowing from below
      KIT.vgrad(ctx, 0, R.H, [[0, '#05061a'], [0.5, '#141638'], [0.85, '#2a1620'], [1, '#3a1a10']]);
      KIT.glow(ctx, 540, 2050, 1150, PAL.saffron, 0.55 * fl);
      KIT.glow(ctx, 540, 1980, 520, '#ffc060', 0.35 * fl);
      // camera: a slow rise with the smoke
      const rise = E.inOutSine(clamp(t / dur)) * 60;
      ctx.save();
      ctx.translate(0, rise);
      // the smoke column, climbing
      KIT.smoke.draw(ctx, 540, 1950, T, { h: 1500, w: 70, strands: 5, alpha: 0.4, color: '#a597b5', speed: 1.1, seed: 12, curls: 0.9, spread: 0.55, fadeOutAt: 0.6 });
      // leaves: born from the smoke in turn, bottom first
      const span = Math.max(0.6, tb - 0.35);
      for (const L of [...LEAVES].reverse()) {
        const born = 0.05 + (4 - L.k) / 4 * span * 0.5;
        const u = clamp((t - born) / 1.25);
        if (u <= 0) {
          continue;
        }
        // a flattening wisp marks where the leaf will open
        const wisp = clamp(1 - u * 3) * clamp(u * 12);
        if (wisp > 0) {
          ctx.save();
          ctx.globalAlpha = wisp * 0.5;
          const g = ctx.createLinearGradient(540 - 300, 0, 540 + 300, 0);
          g.addColorStop(0, 'rgba(170,150,190,0)'); g.addColorStop(0.5, 'rgba(200,180,210,0.9)'); g.addColorStop(1, 'rgba(170,150,190,0)');
          ctx.fillStyle = g; ctx.fillRect(540 - 300, 1700 + L.k * 30 - 14, 600, 28);
          ctx.restore();
        }
        // each page rises out of the smoke column, tumbling, and unrolls as it settles
        const f = E.outCubic(u);
        const y0 = 1700 + L.k * 30, y = lerp(y0, L.y, f);
        const sway = (1 - f) * (Math.sin(T * 2.2 + L.k * 1.7) * 60 + (L.k % 2 ? 40 : -40));
        const tilt = lerp((L.k % 2 ? 1 : -1) * 0.5, L.tilt, E.outBack(clamp(u * 1.1)));
        const open = E.inOutCubic(clamp((u - 0.25) / 0.75));
        const drift = Math.sin(T * 0.9 + L.k) * 3;
        KIT.manuscript.leaf(ctx, KIT.CX + sway, y + drift, L.w * lerp(0.35, 1, E.outCubic(clamp(u * 1.6))), 54, Math.max(0.06, open), { seed: 300 + L.k * 17, alpha: clamp(u * 4), light: 0.5 + 0.5 * fl, tilt });
      }
      // the red binding cord through the holes
      const cordA = E.inOutSine(clamp((t - (0.05 + span * 0.5 + 1.25)) / 0.5));
      if (cordA > 0) {
        ctx.save();
        ctx.globalAlpha = cordA;
        ctx.strokeStyle = '#9a2a1c'; ctx.lineWidth = 3; ctx.lineCap = 'round';
        for (const sd of [-1, 1]) {
          ctx.beginPath();
          LEAVES.forEach((L, i) => { const x = KIT.CX + sd * L.w * 0.3 + Math.sin(L.k * 1.3) * 2, y = L.y + Math.sin(T * 0.9 + L.k) * 3; if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y - 40); });
          ctx.stroke();
        }
        ctx.restore();
      }
      ctx.restore();
      // the title blooms in gold on its word
      const k = clamp((t - (tb - 0.1)) / 0.7);
      if (k > 0) {
        const S = env.strings, key = (env.line.display || ['epicTitle'])[0];
        const title = (S[key] || S.seriesTitle || '').toUpperCase();
        const TT = KIT.endCard.TITLE, size = TT.size(ctx, title);
        const flash = Math.exp(-Math.max(0, t - tb) / 0.35) * clamp((t - tb + 0.1) / 0.1);
        KIT.glow(ctx, TT.x, TT.y - size * 0.35, 700, PAL.saffron, 0.45 * flash + 0.14 * k, 'lighter', 0.45);
        KIT.goldText(ctx, title, TT.x, TT.y, { size, spacing: 8, weight: 600, reveal: E.inOutSine(k), sheen: lerp(-0.3, 1.3, clamp((t - tb) / 1.2)), glow: 0.25 + 0.5 * flash, key: 'ec-title' });
        KIT.embers(ctx, T, { x: TT.x, y: TT.y - 30, spread: 760, rate: 30 * clamp(1.6 - (t - tb)), life: 1.8, rise: 110, sway: 40, size: 2.4, alpha: clamp(k * 2), seed: 88 });
      }
    },
    post: () => ({ bloom: 0.42, vignette: 0.5, paper: 0.3 }),
  });
})();
