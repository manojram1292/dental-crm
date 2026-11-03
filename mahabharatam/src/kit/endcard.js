/*
 * KIT.endCard · the series end card (reusable for every episode).
 *
 *   KIT.endCard.draw(ctx, T, k, strings, o)
 *     T = absolute time (fire flicker), k = 0..1 intro progress (0 = nothing yet,
 *     1 = settled), strings = script strings:
 *        seriesTitle, seriesSubtitle, episodeLabel, episodeSeparator, episodeTitle
 *     o = { background: true, fire: true, titleFrom: 0..1 (title already on screen,
 *           e.g. handed over from the previous shot), sheen }
 *   KIT.endCard.TITLE → { x, y, size(ctx, text) } so a previous shot can land its
 *     title exactly where the card wants it.
 *
 * Layout (Shorts safe zone): text centred on KIT.CX; title y=700, subtitle 790,
 * ornament 860, episode line 950; the fire in its altar below at y≈1300.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT;
  const { clamp, lerp, E, PAL } = R;

  const TITLE = {
    get x() { return KIT.CX; },
    y: 690,
    /** Largest Cinzel size ≤ 96 that fits the safe width. */
    size(ctx, text) {
      ctx.save();
      ctx.font = R.font(100, 'display', 600); ctx.letterSpacing = '8px';
      const w = ctx.measureText(text).width;
      ctx.restore();
      return Math.min(96, (100 * 800) / w);
    },
  };

  function background(ctx, T, a = 1) {
    ctx.save();
    ctx.globalAlpha = a;
    KIT.vgrad(ctx, 0, R.H, [[0, '#07081a'], [0.45, PAL.indigo], [0.75, '#1b1430'], [1, '#0d0806']]);
    ctx.restore();
  }

  /** Mural frame: double gold rule with lotus corners. */
  function frame(ctx, a) {
    if (a <= 0.01) return;
    const m = 54, x0 = m, y0 = 150, x1 = R.W - m, y1 = R.H - 150;
    ctx.save();
    ctx.globalAlpha = a * 0.55;
    ctx.strokeStyle = PAL.goldDeep; ctx.lineWidth = 2;
    ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
    ctx.globalAlpha = a * 0.35;
    ctx.strokeRect(x0 + 12, y0 + 12, x1 - x0 - 24, y1 - y0 - 24);
    ctx.globalAlpha = a * 0.7;
    ctx.fillStyle = PAL.gold;
    for (const [cx, cy] of [[x0, y0], [x1, y0], [x0, y1], [x1, y1]]) {
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(Math.PI / 4);
      ctx.fillRect(-7, -7, 14, 14);
      ctx.restore();
    }
    ctx.restore();
  }

  function draw(ctx, T, k, S, o = {}) {
    const cx = TITLE.x;
    if (o.background !== false) background(ctx, T);
    const fk = E.outCubic(clamp(k / 0.5));
    // the fire below, in its altar, with its light pooled on the ground
    if (o.fire !== false) {
      const fy = 1310;
      KIT.fire.pool(ctx, cx, fy + 30, 520, 150, T, fk);
      KIT.glow(ctx, cx, fy - 120, 700, PAL.saffron, 0.18 * fk * KIT.flicker(T));
      ctx.save(); ctx.globalAlpha = fk;
      const base = KIT.fire.altar(ctx, cx, fy, 250, T, { light: fk });
      KIT.fire.draw(ctx, cx, base + 4, 210 * lerp(0.4, 1, fk), T, { intensity: fk, seed: 3 });
      ctx.restore();
    }
    frame(ctx, E.inOutSine(clamp((k - 0.1) / 0.6)));
    // title (may already be on screen: titleFrom)
    const title = S.seriesTitle.toUpperCase();
    const size = TITLE.size(ctx, title);
    const ta = o.titleFrom != null ? 1 : E.outCubic(clamp(k / 0.35));
    KIT.goldText(ctx, title, cx, TITLE.y, { size, spacing: 8, weight: 600, alpha: ta, reveal: o.titleFrom != null ? 1 : clamp(k / 0.35), sheen: o.sheen ?? lerp(-0.3, 1.3, clamp((k - 0.15) / 0.7)), glow: 0.25, key: 'ec-title' });
    // "As Vyasa Told It"
    const sa = E.outCubic(clamp((k - 0.18) / 0.3));
    ctx.save();
    ctx.globalAlpha = sa;
    ctx.font = R.font(60, 'caption', 500, 'italic');
    ctx.textAlign = 'center';
    ctx.fillStyle = PAL.cream;
    ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = R.px(10);
    ctx.fillText(S.seriesSubtitle, cx, TITLE.y + 92 + (1 - sa) * 14);
    ctx.restore();
    KIT.ornament(ctx, cx, TITLE.y + 162, 420, E.outCubic(clamp((k - 0.28) / 0.3)), E.outCubic(clamp((k - 0.28) / 0.4)));
    // "Episode 1 · The Storyteller Arrives"
    const ea = E.outCubic(clamp((k - 0.4) / 0.3));
    ctx.save();
    ctx.globalAlpha = ea;
    ctx.textBaseline = 'alphabetic';
    const lab = S.episodeLabel, sep = S.episodeSeparator || ' · ', ttl = S.episodeTitle;
    ctx.font = R.font(48, 'caption', 600);
    const wl = ctx.measureText(lab + sep).width, wt = ctx.measureText(ttl).width;
    let x = cx - (wl + wt) / 2;
    const y = TITLE.y + 262 + (1 - ea) * 14;
    ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = R.px(10);
    ctx.fillStyle = PAL.gold; ctx.fillText(lab + sep, x, y);
    ctx.fillStyle = PAL.cream; ctx.fillText(ttl, x + wl, y);
    ctx.restore();
  }

  KIT.endCard = { draw, background, frame, TITLE };
})();
