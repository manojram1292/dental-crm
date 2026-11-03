/*
 * Episode 3 · shared pieces for its scenes (not a scene itself).
 *
 *   EP3.fmt(n, env)                  a figure in the script's number locale (strings.numberLocale)
 *   EP3.counter(ctx, n, x, y, o)     gold numerals with an italic label; o = { size, label, alpha, align,
 *                                    sheen, glow, key, labelSize, gap }
 *   EP3.PANEL                        the patti frieze panel on screen (line "patti"); the grid's level 0
 *   EP3.panelUnits(ctx, T, o)        the patti's ten units in the panel, each with its own appear 0..1
 *   EP3.grid(ctx, T, o)              the multiplying patti grid (lines "multiply" and "chariots"),
 *                                    a pure function of absolute time; returns { count, step, e }
 *   EP3.frieze(ctx, T, kind, y, o)   a band of one kind of unit marching (line "units")
 *   EP3.fig(env, key)                a figure from script.figures
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT;
  const { clamp, lerp, E, PAL } = R;
  const EP3 = (window.EP3 = {});
  const A = KIT.army;

  EP3.fig = (env, key) => (env.script.figures || {})[key];
  const fmts = new Map();
  EP3.fmt = (n, env) => {
    const loc = (env && env.strings.numberLocale) || 'en-US';
    let f = fmts.get(loc);
    if (!f) { f = new Intl.NumberFormat(loc, { maximumFractionDigits: 0 }); fmts.set(loc, f); }
    return f.format(Math.round(n));
  };

  EP3.counter = (ctx, n, x, y, o = {}) => {
    const a = o.alpha ?? 1;
    if (a <= 0.003) return 0;
    const size = o.size || 110, txt = typeof n === 'string' ? n : EP3.fmt(n, o.env);
    const align = o.align || 'center';
    let lw = 0;
    if (o.label) {
      ctx.save(); ctx.font = R.font(o.labelSize || Math.round(size * 0.46), 'caption', 500, 'italic'); lw = ctx.measureText(o.label).width; ctx.restore();
    }
    const inline = o.inline && o.label;
    // inline: "21,870 chariots" on one baseline (left aligned at x)
    const w = KIT.goldText(ctx, txt, inline ? x : x, y, { size, spacing: size * 0.04, weight: 700, alpha: a, align: inline ? 'left' : align, sheen: o.sheen, glow: o.glow ?? 0.3, key: o.key || 'ctr' });
    if (o.label) {
      ctx.save();
      ctx.globalAlpha = a * (o.labelAlpha ?? 1);
      ctx.font = R.font(o.labelSize || Math.round(size * 0.46), 'caption', 500, 'italic');
      ctx.fillStyle = o.labelColor || PAL.cream;
      ctx.shadowColor = 'rgba(0,0,0,0.85)'; ctx.shadowBlur = R.px(10);
      if (inline) { ctx.textAlign = 'left'; ctx.fillText(o.label, x + w + (o.gap ?? size * 0.22), y); }
      else { ctx.textAlign = align; ctx.fillText(o.label, x, y + (o.gap ?? size * 0.62)); }
      ctx.restore();
    }
    return w + (inline ? lw + (o.gap ?? size * 0.22) : 0);
  };

  // ─── the patti panel (line "patti") = the grid's level 0 ─────────────────────
  const PANEL = { x: 90, y: 240, w: 900 };
  PANEL.h = PANEL.w / A.TILE.aspect;
  PANEL.k = PANEL.w / A.TILE.w;
  EP3.PANEL = PANEL;

  /** The ten units of the patti at panel scale. appear(i) → 0..1 per unit (index into KIT.army.PATTI). */
  EP3.panelUnits = (ctx, T, o = {}) => {
    const fl = o.flicker ?? 1;
    A.PATTI.forEach(([kind, x, y, s], i) => {
      const k = o.appear ? o.appear(i) : 1;
      if (k <= 0.003) return;
      const e = E.outCubic(k);
      const X = PANEL.x + x * PANEL.k, Y = PANEL.y + y * PANEL.k;
      A.draw(ctx, kind, {
        x: X, y: Y + (1 - e) * 26, s: s * PANEL.k, t: T, phase: i * 0.9, gait: 0.12,
        fill: '#8a3c1e', line: '#140906', lw: 2.6, gold: '#f2c560', banner: '#e7b54a',
        rim: R.mix('#f08a24', '#ffd890', 0.4 * fl), light: o.light ?? 1.2, rimW: 3.5 * (0.7 + 0.3 * fl), alpha: e,
      });
    });
  };

  EP3.panelFrame = (ctx, a, gold = 0.75) => {
    if (a <= 0.003) return;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = '#1c0f0a';
    ctx.fillRect(PANEL.x, PANEL.y, PANEL.w, PANEL.h);
    ctx.strokeStyle = `rgba(231,181,74,${gold})`; ctx.lineWidth = 8 * PANEL.k;
    ctx.strokeRect(PANEL.x + 6 * PANEL.k, PANEL.y + 6 * PANEL.k, PANEL.w - 12 * PANEL.k, PANEL.h - 12 * PANEL.k);
    ctx.fillStyle = `rgba(231,181,74,${gold * 0.6})`;
    ctx.fillRect(PANEL.x + 14 * PANEL.k, PANEL.y + 212 * PANEL.k, PANEL.w - 28 * PANEL.k, 4 * PANEL.k);
    ctx.restore();
  };

  // ─── the multiplying grid ────────────────────────────────────────────────────
  // Levels (cols × rows of patti cells): ×3 alternately down and across, then ×10 as 5 × 2 blocks.
  const DIMS = [[1, 1], [1, 3], [3, 3], [3, 9], [9, 9], [9, 27], [27, 27], [27, 81]];
  const COUNT = [1, 3, 9, 27, 81, 243, 729, 2187, 21870];
  const BOX = { cx: 540, cy: 900, w: 840, h: 620 };
  EP3.GRID = { DIMS, COUNT, BOX };

  /** Step schedule in absolute seconds, from the timeline: [{ t0, d }] for steps 1..8. */
  function schedule() {
    const L = Object.fromEntries(R.lines.map((l) => [l.id, l]));
    const m = L.multiply, c = L.chariots;
    const s0 = m.beats[0] + 0.55, s1 = c.beats[0] - 0.6;
    const out = [];
    for (let i = 0; i < 7; i++) {
      const sp = (s1 - s0) / 7;
      out.push({ t0: s0 + i * sp, d: Math.min(0.62, sp * 0.92) });
    }
    out.push({ t0: c.beats[0] - 0.2, d: 1.0 });
    out.pre = [m.start, s0 - 0.05];      // the panel shrinks into the box before the first step
    return out;
  }
  EP3.schedule = schedule;

  /** Cell height (px) that fits level j in the box (with its gaps). */
  function fitU(j) {
    if (j === 0) return Math.min(BOX.w / (A.TILE.aspect * 1.1), BOX.h / 1.1);
    if (j === 8) { const [c, r] = DIMS[7]; return Math.min(BOX.w / (5 * c * A.TILE.aspect * 1.06), BOX.h / (2 * r * 1.04)); }
    const [c, r] = DIMS[j];
    return Math.min(BOX.w / (c * A.TILE.aspect * 1.1), BOX.h / (r * 1.1));
  }
  const centre = () => [BOX.cx, BOX.cy];

  function block(ctx, x, y, cw, ch, cols, rows, a, devScale, lit) {
    if (a <= 0.003) return;
    const w = cols * cw, h = rows * ch;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.fillStyle = A.pattern(ctx, x, y, cw, ch, cw * devScale);
    ctx.fillRect(x, y, w, h);
    if (lit > 0) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a * lit; ctx.fillStyle = '#ffb04a'; ctx.fillRect(x, y, w, h); }
    ctx.restore();
  }

  /**
   * The grid at absolute time T. o = { zoom (extra camera zoom about the box centre), flicker }.
   * Returns { count (chariots, rolling), step (completed), e (progress of the current step), mult }.
   */
  EP3.grid = (ctx, T, o = {}) => {
    const S = schedule();
    let k = 0, e = 1;                // k = the step in progress (1..8), or the last done
    for (let i = 0; i < S.length; i++) if (T >= S[i].t0) { k = i + 1; e = clamp((T - S[i].t0) / S[i].d); }
    const ee = E.inOutCubic(e);
    const from = Math.max(0, k - 1), to = k;
    let u = Math.exp(lerp(Math.log(fitU(from)), Math.log(fitU(to)), k ? ee : 1)) * (o.zoom || 1);
    let [cx, cy] = centre();
    if (k === 0) {
      // from the patti panel of the previous line into the box
      const q = E.inOutCubic(clamp((T - S.pre[0]) / (S.pre[1] - S.pre[0])));
      u = lerp(PANEL.h, u, q);
      cx = lerp(PANEL.x + PANEL.w / 2, cx, q); cy = lerp(PANEL.y + PANEL.h / 2, cy, q);
    }
    const cw = u * A.TILE.aspect, ch = u;
    const dev = R.scale || 1;
    const fl = o.flicker ?? 1;
    // keep the sliding copies below the counter (and out of the captions) once the panel has left
    ctx.save();
    if (k > 0 || T > S.pre[0] + 0.3) { ctx.beginPath(); ctx.rect(0, k === 8 ? 572 : k > 0 ? 470 : lerp(0, 470, clamp((T - S.pre[0]) / (S.pre[1] - S.pre[0]))), R.W, 1300 - 470 + (k > 0 ? 0 : 400)); ctx.clip(); }
    if (k === 0) {
      block(ctx, cx - cw / 2, cy - ch / 2, cw, ch, 1, 1, 1, dev, 0);
    } else if (k <= 7) {
      // the previous block and two copies: down (odd steps) or across (even steps)
      const [c, r] = DIMS[from];
      const vertical = k % 2 === 1;
      const bw = c * cw, bh = r * ch;
      const gap = (vertical ? bh : bw) * 0.08 * (1 - E.inOutSine(clamp((e - 0.7) / 0.3)));
      for (const j of [-1, 0, 1]) {
        const ej = j === 0 ? 1 : E.outCubic(clamp((e - (j < 0 ? 0 : 0.12)) / 0.6));
        const off = j * (1 + 1.4 * (1 - ej));
        const x = cx - bw / 2 + (vertical ? 0 : off * (bw + gap)), y = cy - bh / 2 + (vertical ? off * (bh + gap) : 0);
        const lit = j === 0 ? 0 : 0.35 * Math.exp(-Math.max(0, e - 0.45) / 0.18) * ej;
        block(ctx, x, y, cw, ch, c, r, j === 0 ? 1 : ej, dev, lit);
      }
    } else {
      // ×10: ten blocks of 27 × 81, five across and two down; the first one is the old block
      const [c, r] = DIMS[7];
      const bw = c * cw, bh = r * ch, gx = bw * 0.06, gy = bh * 0.04;
      const W = 5 * bw + 4 * gx, H = 2 * bh + gy;
      for (let q = 0; q < 10; q++) {
        const col = q % 5, row = Math.floor(q / 5);
        const tx = cx - W / 2 + col * (bw + gx), ty = cy - H / 2 + row * (bh + gy);
        // the old block slides from the centre into its slot (column 2, row 0); the others appear in turn
        const order = [2, 1, 3, 0, 4, 7, 6, 8, 5, 9].indexOf(col + row * 5);
        if (order === 0) {
          const sx = lerp(cx - bw / 2, tx, ee), sy = lerp(cy - bh / 2, ty, ee);
          block(ctx, sx, sy, cw, ch, c, r, 1, dev, 0.14 * ee);
        } else {
          const tq = S[7].t0 + (0.15 + order * 0.06) * S[7].d;
          const eq = E.outCubic(clamp((T - tq) / (0.35 * S[7].d)));
          block(ctx, tx, ty + (1 - eq) * bh * 0.15, cw, ch, c, r, eq, dev, (0.14 + 0.3 * Math.exp(-Math.max(0, T - tq - 0.35) / 0.25)) * eq);
        }
        // each akshauhini's regiment framed in gold once it stands
        ctx.save();
        ctx.globalAlpha = 0.6 * clamp((e - 0.6) / 0.4);
        ctx.strokeStyle = PAL.gold; ctx.lineWidth = 2;
        ctx.strokeRect(tx - 1, ty - 1, bw + 2, bh + 2);
        ctx.restore();
      }
    }
    ctx.restore();
    // the fire's warmth over the grid
    KIT.glow(ctx, cx, cy + 200, 900, PAL.saffron, 0.08 * fl, 'lighter', 0.8);
    const count = k === 0 ? 1 : COUNT[from] + (COUNT[to] - COUNT[from]) * E.outCubic(clamp(e * 1.15));
    return { count, step: k, e, mult: k === 8 ? 10 : 3, S };
  };

  // ─── a marching frieze band (line "units") ──────────────────────────────────
  const BAND = {
    chariot: { s: 0.3, gap: 168 },
    elephant: { s: 0.36, gap: 150 },
    horse: { s: 0.5, gap: 140 },
    soldier: { s: 0.55, gap: 56 },
  };
  EP3.BAND = BAND;
  EP3.frieze = (ctx, T, kind, y, o = {}) => {
    const a = o.alpha ?? 1;
    if (a <= 0.003) return;
    const b = BAND[kind], sp = o.speed ?? 26;
    const n = Math.ceil((R.W + 400) / b.gap) + 1;
    const shift = ((T * sp) % b.gap + b.gap) % b.gap;
    for (let i = 0; i < n; i++) {
      const x = -200 + i * b.gap + shift + (o.dx || 0);
      A.draw(ctx, kind, {
        x, y, s: b.s, t: T, phase: i * 1.7, gait: 0.6, fill: o.fill || '#7a3418', line: '#120806', lw: 1.8,
        gold: '#e7b54a', banner: o.banner || '#e7b54a', rim: o.rim || '#e08a3a', light: -2.2, rimW: 2, alpha: a,
      });
    }
  };
})();
