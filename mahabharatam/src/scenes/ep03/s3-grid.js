/*
 * Ep 3 · lines "multiply" ("Multiply it, step by step…") and "chariots" ("…until one
 * akshauhini stands: twenty-one thousand, eight hundred and seventy chariots.")
 *
 * One continuous shot drawn by EP3.grid (a pure function of absolute time, so the
 * two lines join without a seam). The patti panel of the previous line becomes a
 * single tile; copies of the block slide in and triple it (down, across, down, …),
 * the gaps closing as each step completes, while the camera pulls back. Seven ×3
 * steps run from "Multiply" to just before "akshauhini"; on "akshauhini" the
 * 27 × 81 block becomes ten (×10): one akshauhini. A gold counter at the top rolls
 * the chariots up with each step and settles on 21,870 before "twenty-one" is
 * spoken, then holds; the step's multiplier (×3, ×10) flashes beside it.
 * Everything that matters sits above y ≈ 1200, clear of the captions.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP3 = window.EP3;
  const { clamp, lerp, E, PAL } = R;

  function draw(ctx, t, env) {
    const T = env.T;
    const fl = KIT.flicker(T, 0);
    KIT.vgrad(ctx, 0, R.H, [[0, '#08081a'], [0.4, '#151328'], [0.8, '#24130f'], [1, '#160a06']]);
    KIT.glow(ctx, 540, 1700, 1200, PAL.saffron, 0.22 * fl, 'lighter', 0.5);
    const S = EP3.schedule();
    const last = S[S.length - 1];
    const drift = 1 - 0.06 * E.inOutSine(clamp((T - last.t0 - last.d) / 5));
    const g = EP3.grid(ctx, T, { flicker: fl, zoom: drift });
    // the counter (from the first step on)
    const ca = E.outCubic(clamp((T - S[0].t0 + 0.2) / 0.5));
    const done = clamp((T - last.t0 - last.d) / 0.6);
    const L = R.lines.find((l) => l.id === 'chariots');
    const cb = L.beats[2] ?? L.end - 1;   // 'chariots'
    const hi = Math.exp(-Math.max(0, T - cb) / 0.6) * (T > cb - 0.05 ? 1 : 0);
    // a dark field behind the numerals so they read over the grid
    KIT.vgrad(ctx, 150, 520, [[0, 'rgba(8,8,26,0)'], [0.25, 'rgba(8,8,26,0.72)'], [0.75, 'rgba(8,8,26,0.72)'], [1, 'rgba(8,8,26,0)']]);
    EP3.counter(ctx, g.count, KIT.CX, 330, {
      env, size: 128, alpha: ca, key: 'ctr-chariots', glow: 0.3 + 0.3 * done, sheen: lerp(-0.3, 1.3, clamp((T - last.t0 - last.d) / 1.1)),
      label: env.strings.chariots, labelSize: 54, gap: 70, labelColor: R.mix(PAL.cream, '#ffe6a6', hi),
    });
    // the multiplier of the step in progress
    if (g.step > 0) {
      const st = S[g.step - 1];
      const k = clamp((T - st.t0) / 0.15) * (1 - clamp((T - st.t0 - st.d - 0.1) / 0.25));
      const big = g.step === 8;
      KIT.goldText(ctx, `${env.strings.times || '×'}${g.mult}`, big ? 880 : 865, 318, { size: big ? 84 : 70, spacing: 2, weight: 700, alpha: k * ca, glow: 0.5, key: 'ctr-mult' });
    }
    // the step badges: ×3 seven times, then ×10; each lights as its step happens (the eye can count them)
    // (they retire once the ×10 has landed: the akshauhini's name and the long caption take over)
    const ba = E.outCubic(clamp((T - S[0].t0 + 0.6) / 0.5)) * (1 - clamp((T - S[7].t0 - 0.7) / 0.4));
    if (ba > 0.003) {
      const n = S.length, bw = 88, gap = 12, x0 = KIT.CX - (n * bw + (n - 1) * gap) / 2, by = 1222;
      ctx.save();
      ctx.font = R.font(36, 'display', 700); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (let i = 0; i < n; i++) {
        const st = S[i], x = x0 + i * (bw + gap), big = i === n - 1;
        const on = clamp((T - st.t0) / 0.15), hot = on * Math.exp(-Math.max(0, T - st.t0) / 0.6);
        ctx.globalAlpha = ba;
        ctx.fillStyle = on > 0 ? R.mix('#3a2410', '#8a5a1c', on) : 'rgba(30,20,14,0.85)';
        ctx.beginPath(); R.roundRectPath(ctx, x, by - 34, bw, 68, 12); ctx.fill();
        ctx.lineWidth = 2.5; ctx.strokeStyle = on > 0 ? PAL.gold : 'rgba(231,181,74,0.35)'; ctx.stroke();
        if (hot > 0.02) KIT.glow(ctx, x + bw / 2, by, 90, '#ffb04a', 0.7 * hot);
        ctx.fillStyle = on > 0 ? R.mix(PAL.goldPale, '#ffffff', hot) : 'rgba(231,181,74,0.45)';
        ctx.fillText(`${env.strings.times || '×'}${big ? 10 : 3}`, x + bw / 2, by + 2);
      }
      ctx.restore();
    }
    // "1 Akshauhini" on its word
    const a = E.outCubic(clamp((T - ((L.beats[1] ?? last.t0 + 0.8) - 0.15)) / 0.6));
    if (a > 0) {
      KIT.ornament(ctx, KIT.CX, 468, 380, a, a);
      KIT.goldText(ctx, (env.strings.akshauhiniName || '').toUpperCase(), KIT.CX, 528, { size: 52, spacing: 8, weight: 600, alpha: a, reveal: E.inOutSine(a), glow: 0.3, key: 'aksh-name' });
    }
  }

  R.scene({ id: 'multiply', fadeIn: 0.4, draw, post: () => ({ bloom: 0.38, vignette: 0.55, paper: 0.32 }) });
  R.scene({ id: 'chariots', draw, post: () => ({ bloom: 0.38, vignette: 0.55, paper: 0.32 }) });
})();
