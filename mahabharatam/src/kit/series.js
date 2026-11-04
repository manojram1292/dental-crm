/*
 * KIT.series · the series' CONTINUITY GRAMMAR. Every episode is
 *
 *     RECAP (~3 s, not in episode 1) → HOOK (one question) → STORY → NEXT (cliffhanger + teaser card)
 *
 * and these components draw the parts that must look the same in every episode.
 * All on-screen words come from the episode script's `strings` (dubbing-ready), with
 * English fallbacks. All functions are pure in their arguments (time in, pixels out).
 *
 * ── Script strings (script/epNN.<lang>.json → "strings") ────────────────────────────
 *   previouslyLabel   "Previously"                    (recap strip label)
 *   prevEpisodeLabel  "Episode 1"                     prevEpisodeTitle  "The Storyteller Arrives"
 *   episodeLabel      "Episode 2"                     episodeTitle      "The Field of Five Lakes"
 *   episodeSeparator  " · "
 *   nextLabel         "Next"                          (teaser card label)
 *   nextEpisodeLabel  "Episode 3"                     nextTitle         "Eighteen Armies"
 *   seriesTitle       "Mahabharatam"                  seriesSubtitle    "As Vyasa Told It"
 *   traditionNote     "As tradition tells it"         (KIT.series.traditionTag, for non-Critical-Edition lore)
 *
 * ── Components ──────────────────────────────────────────────────────────────────────
 *   KIT.series.recapStrip(ctx, T, k, S, o)
 *       The "Previously…" treatment. Draws, over a dark plaster ground, the visual
 *       callback to the last episode as a sepia MEMORY inside a gold-framed temple niche,
 *       slowly pushing in, and the strip at the top: PREVIOUSLY + "Episode 1 · Title".
 *       k = 0..1 intro (≈ 0.6 s is plenty), o.out = 0..1 outro (fade to the next scene).
 *       o = { picture(g, T) → draws a FULL 1080×1920 frame (any scene code works: the
 *             niche crops it), focus: [x, y] the picture point centred in the niche
 *             (default [540, 960]), zoom (default 1), push (0..1 slow push-in progress),
 *             out, key }
 *   KIT.series.episodeTitle(ctx, T, k, S, o)
 *       The episode's title lockup, as an overlay: a short gold "EPISODE 2" flanked by
 *       rules, then the title in large engraved gold with a sheen. Shown once per episode,
 *       right after the hook's question. o = { y (baseline of the title, default 330),
 *       out (0..1), scrim (default true), key }
 *   KIT.series.nextTeaser(ctx, T, k, S, o)
 *       The "Next" card, the last shot of every episode: the series title, NEXT, a niche
 *       opening on a GLIMPSE of the next episode's key image (full colour, a slow push),
 *       and "Episode N · Title". The script line it plays under has "caption": false.
 *       o = { picture(g, T) full-frame glimpse, focus, zoom, push, key }
 *   KIT.series.traditionTag(ctx, T, a, S, o)
 *       A small italic gold tag ("As tradition tells it") with a lotus ornament, top of
 *       frame: marks material from later tradition rather than the Critical Edition.
 *       o = { y (default 236) }
 *   KIT.series.memory(ctx, picture, box, T, o)    the niche itself (used by both cards)
 *
 * ── Cold open (episode 11 on; research/engagement.md) ───────────────────────────────
 *   Order: HOOK (cold open, 0–3 s, the episode's strongest image, moving) → title (in the
 *   hook's post) → RECAP (2–3 s) → STORY (with a brief cut to Sauti at the fire) → the
 *   cliffhanger image + line → a silent ≈1.5 s Next card that dissolves back into the
 *   episode's first image (a loop).
 *   KIT.series.hookCard(ctx, T, k, text, o)
 *       The hook question as big engraved text from frame 1 (for viewers with the sound off).
 *       k = 0..1 visibility (1 at frame 0: never a blank first frame), o = { y (top of the
 *       block, default 250), size (default 84), gold: [words to gild], out (0..1), maxW }
 *   KIT.series.fireEdge(ctx, T, a, o)
 *       The Naimisha fire seen close, licking up from the bottom edge of the frame: the
 *       first frame and the last frame share it, so the episode loops into itself.
 *   KIT.series.loopNextScene({ id = 'next', picture, focus, zoom, loop(g, T) })
 *       The short Next card (≈1.5 s, no voice: the script line has "voice": false and an
 *       est): NEXT + the niche glimpse + "Episode N · Title", then in the last 0.45 s the
 *       fire rises and dissolves into loop(g, 0) (default: the first line's scene at t = 0).
 *   KIT.series.archPath(g, x, y, w, h, rise)      a temple-niche outline (ogee arch top)
 *
 * ── Standard scenes (register them from an episode's scene file) ────────────────────
 *   KIT.series.recapScene({ id = 'recap', picture(g, T, env), focus, zoom, fadeIn })
 *   KIT.series.nextScene({ id = 'next', picture(g, T, env), focus, zoom, fadeIn })
 *   Both take timing from the line (env), so any language's voice fits.
 *
 * ── Score (tools/score.py) ──────────────────────────────────────────────────────────
 *   series_recap_sting(bus_dry, bus_wet, line) and series_next_sting(bus_dry, bus_wet, line)
 *   play the shared recap and "Next" stings at those lines; every episode calls them.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT;
  const { TAU, clamp, lerp, E, PAL } = R;

  const DEF = {
    previouslyLabel: 'Previously', nextLabel: 'Next', episodeSeparator: ' · ',
    seriesTitle: 'Mahabharatam', seriesSubtitle: 'As Vyasa Told It', traditionNote: 'As tradition tells it',
  };
  const str = (S, k) => (S && S[k] != null ? S[k] : DEF[k] || '');

  /** Temple-niche outline: a rectangle whose top rises into a pointed (ogee) arch by `rise` px. */
  function archPath(g, x, y, w, h, rise) {
    const cx = x + w / 2, top = y + rise;
    g.moveTo(x, y + h);
    g.lineTo(x, top);
    g.bezierCurveTo(x, top - rise * 0.62, cx - w * 0.22, y + rise * 0.18, cx, y);
    g.bezierCurveTo(cx + w * 0.22, y + rise * 0.18, x + w, top - rise * 0.62, x + w, top);
    g.lineTo(x + w, y + h);
    g.closePath();
  }

  /** Gold double frame around a niche, lotus finial at the apex. */
  function nicheFrame(ctx, box, a, glow = 0) {
    if (a <= 0.003) return;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = PAL.gold; ctx.lineWidth = 5;
    ctx.shadowColor = PAL.saffron; ctx.shadowBlur = R.px(10 + 20 * glow);
    ctx.beginPath(); archPath(ctx, box.x, box.y, box.w, box.h, box.rise); ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = a * 0.5; ctx.lineWidth = 2; ctx.strokeStyle = PAL.goldDeep;
    ctx.beginPath(); archPath(ctx, box.x - 14, box.y - 16, box.w + 28, box.h + 30, box.rise + 6); ctx.stroke();
    // lotus finial
    ctx.globalAlpha = a;
    ctx.fillStyle = PAL.gold;
    const fx = box.x + box.w / 2, fy = box.y - 18;
    ctx.beginPath();
    ctx.moveTo(fx, fy - 26); ctx.bezierCurveTo(fx + 14, fy - 12, fx + 12, fy + 4, fx, fy + 10);
    ctx.bezierCurveTo(fx - 12, fy + 4, fx - 14, fy - 12, fx, fy - 26); ctx.fill();
    for (const s of [-1, 1]) {
      ctx.beginPath(); ctx.moveTo(fx + s * 6, fy + 8); ctx.quadraticCurveTo(fx + s * 30, fy - 4, fx + s * 34, fy - 18);
      ctx.quadraticCurveTo(fx + s * 20, fy + 2, fx + s * 4, fy + 12); ctx.fill();
    }
    // the plinth line under the niche
    ctx.fillRect(box.x - 24, box.y + box.h + 8, box.w + 48, 4);
    ctx.restore();
  }

  /**
   * A picture (a full 1080×1920 frame) seen through a niche. o = { focus, zoom, push,
   * tone: 'memory' (sepia, faded) | 'glimpse' (full colour), alpha, open (0..1 reveal from the centre), key }
   */
  function memory(ctx, picture, box, T, o = {}) {
    const a = o.alpha ?? 1;
    if (a <= 0.003 || !picture) return;
    const b = R.buffer('series-niche-' + (o.key || 'm'), box.w, box.h);
    b.clear('#0b0806');
    const g = b.ctx;
    const [fx, fy] = o.focus || [540, 960];
    const z = (o.zoom ?? 1) * (1 + 0.07 * E.inOutSine(clamp(o.push ?? 0)));
    g.save();
    g.translate(box.w / 2, box.h / 2 + box.rise * 0.25);
    g.scale(z, z);
    g.translate(-fx, -fy);
    try { picture(g, T); } catch (e) { R.errors.push(`series.picture: ${e && e.stack || e}`); }
    g.restore();
    R.resetCtx(g);
    g.setTransform(R.scale, 0, 0, R.scale, 0, 0);
    // inner vignette: the niche is deeper at its edges
    const vg = g.createRadialGradient(box.w / 2, box.h * 0.55, Math.min(box.w, box.h) * 0.25, box.w / 2, box.h * 0.55, Math.max(box.w, box.h) * 0.72);
    vg.addColorStop(0, 'rgba(8,5,3,0)'); vg.addColorStop(1, `rgba(8,5,3,${o.tone === 'memory' ? 0.75 : 0.55})`);
    g.fillStyle = vg; g.fillRect(0, 0, box.w, box.h);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.beginPath();
    archPath(ctx, box.x, box.y, box.w, box.h, box.rise);
    ctx.clip();
    if (o.open != null && o.open < 1) {
      // the niche opens from the centre outward (two leaves of a door of light)
      const half = (box.w / 2) * E.inOutCubic(clamp(o.open));
      ctx.beginPath(); ctx.rect(box.x + box.w / 2 - half, box.y - 10, half * 2, box.h + 20); ctx.clip();
    }
    if (o.tone === 'memory') ctx.filter = 'sepia(0.85) saturate(0.75) brightness(0.86) contrast(1.06)';
    ctx.drawImage(b.canvas, box.x, box.y, box.w, box.h);
    ctx.filter = 'none';
    if (o.tone === 'memory') {
      // a warm wash and faded paper on top: it is remembered, not happening
      ctx.globalCompositeOperation = 'soft-light';
      ctx.fillStyle = 'rgba(210,160,100,0.35)'; ctx.fillRect(box.x, box.y, box.w, box.h);
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.restore();
  }

  const RECAP_BOX = { x: 120, y: 470, w: 840, h: 900, rise: 150 };
  const NEXT_BOX = { x: 175, y: 640, w: 730, h: 560, rise: 120 };

  /** Dark plaster ground behind the cards (with the fire's warmth from below). */
  function ground(ctx, T, warm = 1) {
    KIT.vgrad(ctx, 0, R.H, [[0, '#0a0814'], [0.5, '#16101c'], [0.85, '#21110c'], [1, '#160a06']]);
    KIT.glow(ctx, 540, 1980, 1100, PAL.saffron, 0.22 * warm * KIT.flicker(T, 5), 'lighter', 0.6);
  }

  /** The "Previously" strip at the top: a dark band with gold rules, label + last episode's title. */
  function strip(ctx, T, k, S, y = 214) {
    if (k <= 0.003) return;
    const e = E.outCubic(clamp(k));
    const h = 150;
    ctx.save();
    // the band wipes in from the left
    ctx.beginPath(); ctx.rect(0, y - 10, R.W * clamp(e * 1.15), h + 20); ctx.clip();
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, 'rgba(18,10,8,0.92)'); g.addColorStop(1, 'rgba(26,14,10,0.92)');
    ctx.fillStyle = g; ctx.fillRect(0, y, R.W, h);
    ctx.fillStyle = PAL.gold; ctx.globalAlpha = 0.85;
    ctx.fillRect(0, y + 6, R.W, 2.5); ctx.fillRect(0, y + h - 8, R.W, 2.5);
    ctx.globalAlpha = 0.4; ctx.fillRect(0, y + 13, R.W, 1); ctx.fillRect(0, y + h - 14, R.W, 1);
    ctx.restore();
    // label: PREVIOUSLY, with a small "turning back" mark (two left chevrons)
    const la = E.outCubic(clamp((k - 0.15) / 0.6));
    const label = str(S, 'previouslyLabel').toUpperCase();
    const cx = KIT.CX;
    ctx.save();
    ctx.font = R.font(50, 'display', 600); ctx.letterSpacing = '10px';
    const lw = ctx.measureText(label).width;
    ctx.restore();
    const lx = cx + 24;
    KIT.goldText(ctx, label, lx, y + 72, { size: 50, spacing: 10, weight: 600, alpha: la, reveal: clamp((k - 0.1) / 0.6), sheen: lerp(-0.3, 1.3, clamp((k - 0.4) / 0.9)), glow: 0.3, key: 'series-prev' });
    ctx.save();
    ctx.globalAlpha = la; ctx.fillStyle = PAL.gold;
    const chx = lx - lw / 2 - 40;
    for (const d of [0, 22]) {
      ctx.beginPath(); ctx.moveTo(chx - d, y + 38); ctx.lineTo(chx - d - 18, y + 55); ctx.lineTo(chx - d, y + 72); ctx.lineTo(chx - d + 6, y + 72); ctx.lineTo(chx - d - 11, y + 55); ctx.lineTo(chx - d + 6, y + 38); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
    // "Episode 1 · The Storyteller Arrives"
    const sa = E.outCubic(clamp((k - 0.35) / 0.5));
    if (sa > 0.003 && (S.prevEpisodeLabel || S.prevEpisodeTitle)) {
      ctx.save();
      ctx.globalAlpha = sa;
      ctx.font = R.font(38, 'caption', 600, 'italic');
      const a1 = (S.prevEpisodeLabel || '') + (S.prevEpisodeLabel && S.prevEpisodeTitle ? str(S, 'episodeSeparator') : ''), a2 = S.prevEpisodeTitle || '';
      const w1 = ctx.measureText(a1).width, w2 = ctx.measureText(a2).width;
      const x = cx - (w1 + w2) / 2;
      ctx.shadowColor = 'rgba(0,0,0,0.85)'; ctx.shadowBlur = R.px(8);
      ctx.fillStyle = PAL.gold; ctx.fillText(a1, x, y + 122 + (1 - sa) * 8);
      ctx.fillStyle = PAL.cream; ctx.fillText(a2, x + w1, y + 122 + (1 - sa) * 8);
      ctx.restore();
    }
  }

  function recapStrip(ctx, T, k, S, o = {}) {
    const out = clamp(o.out ?? 0);
    ground(ctx, T, 1 - out * 0.5);
    const box = o.box || RECAP_BOX;
    const ne = E.outCubic(clamp(k / 0.8));
    // the niche: the memory fades up inside its frame
    memory(ctx, o.picture, box, T, { focus: o.focus, zoom: o.zoom, push: o.push ?? 0, tone: 'memory', alpha: ne * (1 - out), key: o.key || 'recap' });
    nicheFrame(ctx, box, ne * (1 - out), 0.3);
    // a few embers drifting up past it (the fire is still burning while he remembers)
    KIT.embers(ctx, T, { x: 540, y: box.y + box.h + 40, spread: 700, rate: 6, life: 3.2, rise: 140, sway: 40, size: 2, alpha: 0.5 * ne * (1 - out), seed: 611 });
    ctx.save(); ctx.globalAlpha = 1 - out;
    strip(ctx, T, k, S, o.y ?? 214);
    ctx.restore();
  }

  function episodeTitle(ctx, T, k, S, o = {}) {
    const out = clamp(o.out ?? 0), vis = clamp(k * 3) * (1 - out);
    if (vis <= 0.003) return;
    const y = o.y ?? 330;
    const title = (S.episodeTitle || '').toUpperCase();
    ctx.save();
    ctx.font = R.font(100, 'display', 600); ctx.letterSpacing = '6px';
    const tw = ctx.measureText(title).width;
    ctx.restore();
    const size = Math.min(78, (100 * 840) / Math.max(1, tw));
    if (o.scrim !== false) {
      ctx.save(); ctx.globalAlpha = vis * 0.85;
      const g = ctx.createLinearGradient(0, y - 190, 0, y + 90);
      g.addColorStop(0, 'rgba(8,6,10,0)'); g.addColorStop(0.35, 'rgba(8,6,10,0.66)'); g.addColorStop(0.75, 'rgba(8,6,10,0.66)'); g.addColorStop(1, 'rgba(8,6,10,0)');
      ctx.fillStyle = g; ctx.fillRect(0, y - 190, R.W, 280);
      ctx.restore();
    }
    // "EPISODE 2" flanked by gold rules
    const la = E.outCubic(clamp(k / 0.35)) * (1 - out);
    const lab = (S.episodeLabel || '').toUpperCase();
    ctx.save();
    ctx.globalAlpha = la;
    ctx.font = R.font(34, 'display', 600); ctx.letterSpacing = '8px'; ctx.textAlign = 'center';
    const lw = ctx.measureText(lab).width;
    ctx.fillStyle = PAL.gold; ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = R.px(8);
    ctx.fillText(lab, KIT.CX + 4, y - size - 18);
    const rl = 150 * E.outCubic(clamp((k - 0.1) / 0.5));
    ctx.fillRect(KIT.CX - lw / 2 - 24 - rl, y - size - 30, rl, 2.5);
    ctx.fillRect(KIT.CX + lw / 2 + 24, y - size - 30, rl, 2.5);
    ctx.restore();
    KIT.goldText(ctx, title, KIT.CX, y, { size, spacing: 6, weight: 600, alpha: E.outCubic(clamp((k - 0.12) / 0.4)) * (1 - out), reveal: clamp((k - 0.1) / 0.45), sheen: lerp(-0.3, 1.3, clamp((k - 0.35) / 0.6)), glow: 0.35, key: o.key || 'series-title' });
    KIT.ornament(ctx, KIT.CX, y + 42, 360, la * 0.9, E.outCubic(clamp((k - 0.3) / 0.4)));
  }

  function nextTeaser(ctx, T, k, S, o = {}) {
    KIT.endCard.background(ctx, T);
    KIT.glow(ctx, 540, 1980, 1000, PAL.saffron, 0.16 * KIT.flicker(T, 6), 'lighter', 0.6);
    KIT.endCard.frame(ctx, E.inOutSine(clamp(k / 0.5)));
    const cx = KIT.CX;
    // the series, small, at the top
    const ta = E.outCubic(clamp(k / 0.3));
    const series = str(S, 'seriesTitle').toUpperCase();
    KIT.goldText(ctx, series, cx, 300, { size: 48, spacing: 9, weight: 600, alpha: ta * 0.9, glow: 0.15, key: 'series-next-series' });
    ctx.save(); ctx.globalAlpha = ta * 0.85; ctx.font = R.font(34, 'caption', 500, 'italic'); ctx.textAlign = 'center';
    ctx.fillStyle = PAL.cream; ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = R.px(8);
    ctx.fillText(str(S, 'seriesSubtitle'), cx, 348); ctx.restore();
    // NEXT
    const na = E.outCubic(clamp((k - 0.08) / 0.35));
    const next = str(S, 'nextLabel').toUpperCase();
    KIT.goldText(ctx, next, cx + 10, 500, { size: 96, spacing: 22, weight: 700, alpha: na, reveal: clamp((k - 0.05) / 0.4), sheen: lerp(-0.3, 1.3, clamp((k - 0.3) / 0.8)), glow: 0.45, key: 'series-next-label' });
    // a right-pointing double chevron after NEXT (the mirror of the recap's)
    ctx.save(); ctx.globalAlpha = na; ctx.fillStyle = PAL.gold;
    ctx.font = R.font(96, 'display', 700); ctx.letterSpacing = '22px';
    const nw = ctx.measureText(next).width;
    ctx.restore();
    ctx.save(); ctx.globalAlpha = na; ctx.fillStyle = PAL.gold;
    const chx = cx + 10 + nw / 2 + 20;
    for (const d of [0, 26]) {
      const x0 = chx + d;
      ctx.beginPath(); ctx.moveTo(x0, 440); ctx.lineTo(x0 + 22, 464); ctx.lineTo(x0, 488); ctx.lineTo(x0 - 7, 488); ctx.lineTo(x0 + 13, 464); ctx.lineTo(x0 - 7, 440); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
    // the glimpse, through the niche
    const box = o.box || NEXT_BOX;
    const open = clamp((k - 0.15) / 0.5);
    KIT.glow(ctx, box.x + box.w / 2, box.y + box.h * 0.5, 620, PAL.saffron, 0.2 * open, 'lighter', 0.8);
    memory(ctx, o.picture, box, T, { focus: o.focus, zoom: o.zoom, push: o.push ?? k, tone: 'glimpse', alpha: 1, open, key: o.key || 'next' });
    nicheFrame(ctx, box, E.outCubic(clamp((k - 0.1) / 0.4)), 0.5);
    // "Episode 3 · Eighteen Armies"
    const ea = E.outCubic(clamp((k - 0.35) / 0.35));
    const lab = (S.nextEpisodeLabel || '').toUpperCase();
    ctx.save(); ctx.globalAlpha = ea; ctx.font = R.font(36, 'display', 600); ctx.letterSpacing = '8px'; ctx.textAlign = 'center';
    ctx.fillStyle = PAL.gold; ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = R.px(8);
    ctx.fillText(lab, cx + 4, box.y + box.h + 92 + (1 - ea) * 10); ctx.restore();
    const title = (S.nextTitle || '').toUpperCase();
    ctx.save(); ctx.font = R.font(100, 'display', 600); ctx.letterSpacing = '5px';
    const tw = ctx.measureText(title).width; ctx.restore();
    const size = Math.min(76, (100 * 820) / Math.max(1, tw));
    KIT.goldText(ctx, title, cx, box.y + box.h + 92 + 30 + size, { size, spacing: 5, weight: 600, alpha: ea, reveal: clamp((k - 0.35) / 0.4), sheen: lerp(-0.3, 1.3, clamp((k - 0.55) / 0.6)), glow: 0.4, key: 'series-next-title' });
    KIT.embers(ctx, T, { x: cx, y: box.y + box.h + 10, spread: 600, rate: 5, life: 3, rise: 120, sway: 40, size: 2, alpha: 0.45 * ea, seed: 612 });
  }

  function traditionTag(ctx, T, a, S, o = {}) {
    if (a <= 0.003) return;
    const y = o.y ?? 236;
    const txt = str(S, 'traditionNote');
    ctx.save();
    ctx.globalAlpha = a;
    ctx.font = R.font(40, 'caption', 600, 'italic');
    ctx.textAlign = 'center';
    const w = ctx.measureText(txt).width;
    const g = ctx.createLinearGradient(0, y - 60, 0, y + 30);
    g.addColorStop(0, 'rgba(10,7,6,0)'); g.addColorStop(0.5, 'rgba(10,7,6,0.55)'); g.addColorStop(1, 'rgba(10,7,6,0)');
    ctx.fillStyle = g; ctx.fillRect(KIT.CX - w / 2 - 120, y - 60, w + 240, 90);
    ctx.fillStyle = PAL.goldPale; ctx.shadowColor = 'rgba(0,0,0,0.85)'; ctx.shadowBlur = R.px(10);
    ctx.fillText(txt, KIT.CX, y);
    ctx.restore();
    // small lotus marks either side
    for (const s of [-1, 1]) KIT.ornament(ctx, KIT.CX + s * (w / 2 + 44), y - 12, 0, a * 0.9, 0.8);
  }

  /** Visibility envelope: 0 → 1 over [a, a+fi], 1 → 0 over [b−fo, b]. */
  const vis = (t, a, b, fi = 0.4, fo = 0.4) => clamp((t - a) / fi) * (1 - clamp((t - (b - fo)) / fo));

  /** Register the standard recap scene for a line (default id 'recap'). */
  function recapScene(def) {
    R.scene({
      id: def.id || 'recap',
      fadeIn: def.fadeIn ?? 0,
      draw(ctx, t, env) {
        // the next line dissolves in over it (give that scene a fadeIn); the recap never fades itself
        const k = clamp(0.3 + t / 0.9);   // never a black first frame
        recapStrip(ctx, env.T, k, env.strings, {
          picture: def.picture ? (g, T) => def.picture(g, T, env) : null,
          focus: def.focus, zoom: def.zoom, push: clamp(t / env.dur),
          key: 'recap-' + (def.id || 'recap'),
        });
      },
      post: () => ({ bloom: 0.3, vignette: 0.5, paper: 0.42 }),
    });
  }

  /** Register the standard "Next" teaser scene (default id 'next'). */
  function nextScene(def) {
    R.scene({
      id: def.id || 'next',
      fadeIn: def.fadeIn ?? 0.5,
      draw(ctx, t, env) {
        const k = clamp(t / Math.max(1.4, Math.min(2.2, env.speech[1])));
        nextTeaser(ctx, env.T, k, env.strings, {
          picture: def.picture ? (g, T) => def.picture(g, T, env) : null,
          focus: def.focus, zoom: def.zoom, push: clamp(t / env.dur), key: 'next-' + (def.id || 'next'),
        });
      },
      post: () => ({ bloom: 0.36, vignette: 0.45, paper: 0.32 }),
    });
  }

  /** The hook question as big text (cold open). Words in o.gold are gilded. */
  function hookCard(ctx, T, k, text, o = {}) {
    const a = clamp(k) * (1 - clamp(o.out ?? 0));
    if (a <= 0.003 || !text) return;
    const size = o.size || 84, maxW = o.maxW || 900, y0 = o.y ?? 250, lh = size * 1.18;
    const gold = new Set((o.gold || []).map((w) => w.replace(/[^\p{L}\p{N}']/gu, '').toLowerCase()));
    ctx.save();
    ctx.font = R.font(size, 'display', 700); ctx.letterSpacing = '2px';
    const words = text.toUpperCase().split(/\s+/), lines = [];
    let cur = [];
    for (const w of words) {
      const test = [...cur, w].join(' ');
      if (cur.length && ctx.measureText(test).width > maxW) { lines.push(cur); cur = [w]; } else cur.push(w);
    }
    if (cur.length) lines.push(cur);
    const h = lines.length * lh;
    // a soft dark band behind the block (legible on any picture)
    const g = ctx.createLinearGradient(0, y0 - size * 1.3, 0, y0 + h + size * 0.6);
    g.addColorStop(0, 'rgba(8,5,6,0)'); g.addColorStop(0.25, 'rgba(8,5,6,0.62)'); g.addColorStop(0.8, 'rgba(8,5,6,0.62)'); g.addColorStop(1, 'rgba(8,5,6,0)');
    ctx.globalAlpha = a; ctx.fillStyle = g; ctx.fillRect(0, y0 - size * 1.3, R.W, h + size * 1.9);
    ctx.textBaseline = 'alphabetic'; ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = R.px(14);
    const settle = 1 + 0.035 * (1 - E.outCubic(clamp(k)));
    lines.forEach((ln, i) => {
      const y = y0 + (i + 0.8) * lh;
      const full = ln.join(' '), fw = ctx.measureText(full).width * settle;
      let x = KIT.CX - fw / 2;
      ctx.save(); ctx.translate(KIT.CX, y); ctx.scale(settle, settle); ctx.translate(-KIT.CX, -y);
      x = KIT.CX - ctx.measureText(full).width / 2;
      for (const w of ln) {
        const key = w.replace(/[^\p{L}\p{N}']/gu, '').toLowerCase();
        ctx.fillStyle = gold.has(key) ? '#ffd27a' : '#fbf1dc';
        ctx.fillText(w, x, y);
        x += ctx.measureText(w + ' ').width;
      }
      ctx.restore();
    });
    ctx.restore();
  }

  /** The Naimisha fire, close, licking up from the bottom edge (shared by first and last frames). */
  function fireEdge(ctx, T, a, o = {}) {
    if (a <= 0.003) return;
    const base = o.y ?? R.H + 30, hgt = o.h ?? 330;
    ctx.save();
    ctx.globalAlpha = clamp(a);
    KIT.glow(ctx, 540, base, 900, PAL.saffron, 0.55 * KIT.flicker(T, 3), 'lighter', 0.5);
    const tongues = 13;
    for (let layer = 0; layer < 3; layer++) {
      ctx.fillStyle = ['#7a1e06', '#e0601a', '#ffd070'][layer];
      ctx.globalAlpha = clamp(a) * [0.9, 0.85, 0.8][layer];
      ctx.beginPath(); ctx.moveTo(-40, base + 40);
      for (let i = 0; i <= tongues; i++) {
        const x = -40 + (i / tongues) * (R.W + 80);
        const ph = T * (3.1 + (i % 4) * 0.4) + i * 1.7 + layer;
        const hh = hgt * (1 - layer * 0.3) * (0.45 + 0.35 * Math.abs(Math.sin(i * 2.3)) + 0.2 * Math.sin(ph)) * (0.7 + 0.3 * Math.sin(Math.PI * i / tongues));
        const xm = x - (R.W / tongues) * 0.5;
        ctx.quadraticCurveTo(xm, base - hh * 0.35, x + 10 * Math.sin(ph * 1.3), base - hh);
        ctx.quadraticCurveTo(x + 20, base - hh * 0.4, x + (R.W / tongues) * 0.25, base - hh * 0.1);
      }
      ctx.lineTo(R.W + 40, base + 40); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
    KIT.embers(ctx, T, { x: 540, y: base - 60, spread: 1000, rate: 10, life: 2.4, rise: 260, sway: 50, size: 2.4, alpha: 0.7 * a, seed: 733 });
  }

  /** The short, silent Next card that loops back into the episode's first image. */
  function loopNextScene(def) {
    R.scene({
      id: def.id || 'next',
      fadeIn: def.fadeIn ?? 0.3,
      draw(ctx, t, env) {
        const k = clamp(t / 0.9);
        nextTeaser(ctx, env.T, k, env.strings, {
          picture: def.picture ? (g, T) => def.picture(g, T, env) : null,
          focus: def.focus, zoom: def.zoom, push: clamp(t / env.dur), key: 'next-' + (def.id || 'next'),
        });
        // the loop: the fire rises and the first image returns (frame 0 of the hook)
        const tail = env.DURATION - env.line.start;   // the card holds through the end card's tail
        const lp = E.inOutSine(clamp((t - (tail - 0.5)) / 0.42));
        const first = R.scenes.get(R.timeline.lines[0].id);
        const loop = def.loop || (first && first !== this ? (g) => first.draw(g, 0, R.envFor(0, 0)) : null);
        if (lp > 0.003 && loop) {
          const b = R.buffer('series-loop', R.W, R.H);
          b.clear('#0b0806');
          b.ctx.save(); loop(b.ctx, 0); b.ctx.restore();
          R.resetCtx(b.ctx);
          ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = lp; ctx.drawImage(b.canvas, 0, 0); ctx.restore();
        }
        fireEdge(ctx, env.T, E.inOutSine(clamp((t - (tail - 0.85)) / 0.4)) * (def.loopFire ?? 1), {});
      },
      post: () => ({ bloom: 0.36, vignette: 0.45, paper: 0.32 }),
    });
  }

  KIT.series = { recapStrip, episodeTitle, nextTeaser, traditionTag, memory, archPath, nicheFrame, ground, vis, recapScene, nextScene, hookCard, fireEdge, loopNextScene, RECAP_BOX, NEXT_BOX };
})();
