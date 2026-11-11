/*
 * KIT.act · CHARACTER ACTING (episode 41 on) and KIT.type · TYPOGRAPHY IN MOTION.
 *
 * The rule: a figure never SWITCHES pose. A performance is a list of keys in time; between two keys the body travels
 * with ANTICIPATION (a small move the other way first), the ACTION, and FOLLOW-THROUGH (it overshoots and settles),
 * and the cloth and hair arrive late (they read the pose of a moment ago).
 *
 *   KIT.act.arc(u, o)            0 → 1 with anticipation and overshoot (u = 0..1; o = { antic 0.12, over 0.1 })
 *   KIT.act.keys(t, keys, o)     keys = [[time, 'pose' | { pose: weight, … }, { antic, over, dur }], …] (line-local s)
 *                                → the pose WEIGHTS at t (may run a little below 0 / above 1: that is the acting)
 *   KIT.act.pose(t, keys, o)     → { w, lag, lag2, phase, … }: the weights now, 0.13 s ago and 0.26 s ago: pass it as a
 *                                character's `pose` (the actor rig, characters/actor.js, hangs the cloth and hair on the lags)
 *   KIT.act.blink(T, seed)       0..1 eyelid closure: a blink every 2.4–5 s, sometimes double; pure in T
 *   KIT.act.breath(T, seed, rate) −1..1
 *   KIT.act.EMO                  named faces: calm · tender · joy · wonder · fear · shock · plead · sorrow · wrath ·
 *                                resolve · weary: { brow (−1 angry … +1 raised), pinch (inner brow up = grief), lid
 *                                (0..1 open), mouth (−1 down … +1 up), open (0..1 jaw), tear (0..1) }
 *   KIT.act.emo(t, keys)         keys = [[time, 'calm'], [time, 'fear'], …] → the blended face at t (eased): a READABLE
 *                                CHANGE of emotion for the close-up
 *   KIT.act.gaze(t, keys)        keys = [[time, [gx, gy]], …] → eye direction (−1..1 each)
 *
 *   KIT.type.plaque(ctx, T, k, name, epithet, o)   a NAME PLAQUE that arrives: the lacquer band brushes on, the letters
 *                                land one by one, a gold underline draws; o = { x, y, out, size, color, align }
 *   KIT.type.turnWord(ctx, T, k, word, o)          THE WORD OF THE TURN, large: it stamps in (scale settle), an ink ring
 *                                spreads behind it; o = { x, y, size, out, sub (a small line under it) }
 *   KIT.type.tag(ctx, T, k, text, o)               a small upright label (a place, a time, "As tradition tells it")
 *   Captions stay in ONE fixed upright band (kit/captions.js); "captionBand": { "kinetic": true } lets a gilded word
 *   swell as it is spoken and draws a brushed underline under it.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT;
  const { clamp, lerp, hash, E, PAL } = R;
  const note = (bag, k) => { if (R.probe) { R.probe[bag] = R.probe[bag] || {}; R.probe[bag][k] = (R.probe[bag][k] || 0) + 1; } };
  const A = (KIT.act = {});

  /** 0 → 1 with anticipation (dips to −antic first) and follow-through (peaks at 1 + over, then settles). */
  A.arc = (u, o = {}) => {
    u = clamp(u);
    const an = o.antic ?? 0.12, ov = o.over ?? 0.1, a = 0.2, b = 0.72;
    if (u < a) return -an * Math.sin(Math.PI * (u / a));
    if (u < b) return (1 + ov) * E.inOutCubic((u - a) / (b - a));
    const v = (u - b) / (1 - b);
    return 1 + ov * Math.cos(v * Math.PI * 1.5) * (1 - v);
  };
  const asW = (p) => (typeof p === 'string' ? { [p]: 1 } : p);
  const mixW = (a, b, k) => { const o = {}; for (const n of new Set([...Object.keys(a), ...Object.keys(b)])) { const v = lerp(a[n] || 0, b[n] || 0, k); if (Math.abs(v) > 1e-4) o[n] = v; } return o; };
  /** Pose weights at t from keys [[time, pose, { dur, antic, over }]]: each key is REACHED at its time + dur (default 0.55 s). */
  A.keys = (t, keys, o = {}) => {
    let w = asW(keys[0][1]);
    for (let i = 1; i < keys.length; i++) {
      const [t0, p, ko = {}] = keys[i], dur = ko.dur ?? o.dur ?? 0.55;
      if (t <= t0) break;
      w = mixW(w, asW(p), A.arc((t - t0) / dur, { antic: ko.antic ?? o.antic, over: ko.over ?? o.over }));
    }
    return w;
  };
  /** The full pose object for the actor rig: weights now and a moment ago (the cloth and the hair read the past). */
  A.pose = (t, keys, o = {}) => {
    const lag = o.lag ?? 0.13;
    return { w: A.keys(t, keys, o), lag: A.keys(t - lag, keys, o), lag2: A.keys(t - 2 * lag, keys, o), phase: o.phase || 0, stride: o.stride, wind: o.wind, prop: o.prop, hold: o.hold };
  };
  A.blink = (T, seed = 0) => {
    const per = 2.4 + 2.6 * hash(Math.floor(seed * 13) + 3, 5), ph = hash(Math.floor(seed * 7) + 1, 9) * per;
    const n = Math.floor((T + ph) / per), u = (T + ph) - n * per, dbl = hash(n, seed * 3 + 2) > 0.72;
    const one = (x) => (x < 0 || x > 0.15 ? 0 : Math.sin(Math.PI * x / 0.15));
    return Math.max(one(u), dbl ? one(u - 0.26) : 0);
  };
  A.breath = (T, seed = 0, rate = 0.27) => Math.sin(T * Math.PI * 2 * rate + seed * 4.1);
  const F = (brow, pinch, lid, mouth, open, tear = 0) => ({ brow, pinch, lid, mouth, open, tear });
  A.EMO = {
    calm: F(0, 0, 0.82, 0.05, 0), tender: F(0.15, 0.2, 0.7, 0.45, 0), joy: F(0.35, 0, 0.75, 0.9, 0.25), wonder: F(0.8, 0.1, 1, 0.1, 0.45),
    fear: F(0.7, 0.75, 1, -0.45, 0.4), shock: F(1, 0.3, 1, -0.2, 0.8), plead: F(0.4, 0.9, 0.85, -0.3, 0.3), sorrow: F(0.1, 1, 0.45, -0.75, 0.05, 1),
    wrath: F(-1, 0, 0.9, -0.6, 0.3), resolve: F(-0.45, 0, 0.72, -0.15, 0), weary: F(-0.1, 0.4, 0.4, -0.25, 0),
  };
  const mixE = (a, b, k) => F(lerp(a.brow, b.brow, k), lerp(a.pinch, b.pinch, k), lerp(a.lid, b.lid, k), lerp(a.mouth, b.mouth, k), lerp(a.open, b.open, k), lerp(a.tear, b.tear, k));
  const asE = (e) => (typeof e === 'string' ? A.EMO[e] || A.EMO.calm : { ...A.EMO.calm, ...e });
  A.emo = (t, keys, o = {}) => {
    let e = asE(keys[0][1]);
    for (let i = 1; i < keys.length; i++) { const [t0, n, ko = {}] = keys[i]; if (t <= t0) break; e = mixE(e, asE(n), A.arc((t - t0) / (ko.dur ?? o.dur ?? 0.5), { antic: 0.06, over: 0.08 })); }
    return e;
  };
  A.gaze = (t, keys, dur = 0.3) => {
    let g = keys[0][1];
    for (let i = 1; i < keys.length; i++) { const [t0, v] = keys[i]; if (t <= t0) break; const k = E.outCubic(clamp((t - t0) / dur)); g = [lerp(g[0], v[0], k), lerp(g[1], v[1], k)]; }
    return g;
  };

  // ─── Typography in motion ─────────────────────────────────────────────────────────────────────────────────────
  const TY = (KIT.type = {});
  /** A name plaque that ARRIVES. k = 0..1 intro (≈ 0.7 s), o.out = 0..1. */
  TY.plaque = (ctx, T, k, name, epithet, o = {}) => {
    if (k <= 0.003 || (o.out ?? 0) >= 0.997) return;
    note('type', 'plaque');
    const x = o.x ?? KIT.CX, y = o.y ?? 420, size = o.size ?? 62, out = 1 - E.inOutSine(clamp(o.out ?? 0));
    ctx.save(); ctx.font = R.font(size, 'display', 700); ctx.letterSpacing = `${size * 0.08}px`;
    const text = String(name).toUpperCase(), tw = ctx.measureText(text).width;
    ctx.font = R.font(size * 0.56, 'caption', 600, 'normal'); ctx.letterSpacing = '0px';
    const ew = epithet ? ctx.measureText(epithet).width : 0;
    const w = Math.max(tw, ew) + size * 1.5, h = size * (epithet ? 2.35 : 1.6), x0 = x - w / 2, y0 = y - size * 1.12;
    // the lacquer band brushes on from the left, with a bristled leading edge
    const b = E.outCubic(clamp(k / 0.45)), bw = w * b;
    ctx.globalAlpha = out * 0.9; ctx.fillStyle = o.color || 'rgba(14,8,6,0.86)';
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + bw - 14, y0);
    for (let i = 0; i <= 6; i++) ctx.lineTo(x0 + bw + (i % 2 ? 10 : -6) * (1 - b * 0.6) + 8 * hash(i, 3) * (1 - b), y0 + (h * i) / 6);
    ctx.lineTo(x0, y0 + h); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = out * b; ctx.fillStyle = o.edge || PAL.gold; ctx.fillRect(x0, y0, bw, 4); ctx.fillRect(x0, y0 + h - 4, bw, 4);
    ctx.restore();
    // the letters land one by one (each drops a few px and warms in)
    ctx.save(); ctx.font = R.font(size, 'display', 700); ctx.letterSpacing = `${size * 0.08}px`; ctx.textBaseline = 'alphabetic';
    let cx = x - tw / 2;
    [...text].forEach((ch, i) => {
      const lk = E.outBack ? E.outBack(clamp((k - 0.2 - i * 0.035) / 0.3)) : E.outCubic(clamp((k - 0.2 - i * 0.035) / 0.3));
      const cw = ctx.measureText(ch).width;
      if (lk > 0) { ctx.globalAlpha = out * clamp(lk); ctx.fillStyle = KIT.hex(PAL.goldPale, '#ffffff', 0.5 * (1 - clamp(lk))); ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = R.px(8); ctx.fillText(ch, cx, y - (1 - lk) * 26); }
      cx += cw;
    });
    ctx.restore();
    const ul = E.inOutCubic(clamp((k - 0.5) / 0.4));
    if (ul > 0) { ctx.save(); ctx.globalAlpha = out; ctx.fillStyle = PAL.gold; ctx.beginPath(); ctx.moveTo(x - tw / 2, y + 14); ctx.quadraticCurveTo(x - tw / 2 + tw * ul * 0.5, y + 8, x - tw / 2 + tw * ul, y + 13); ctx.quadraticCurveTo(x - tw / 2 + tw * ul * 0.5, y + 19, x - tw / 2, y + 20); ctx.fill(); ctx.restore(); }
    if (epithet) { ctx.save(); ctx.globalAlpha = out * E.outCubic(clamp((k - 0.6) / 0.35)); ctx.font = R.font(size * 0.56, 'caption', 600); ctx.textAlign = 'center'; ctx.fillStyle = PAL.cream; ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = R.px(6); ctx.fillText(epithet, x, y + size * 0.9); ctx.restore(); }
  };
  /** THE WORD OF THE TURN: stamps in large with an ink ring; holds; o.out fades. */
  TY.turnWord = (ctx, T, k, word, o = {}) => {
    if (k <= 0.003 || (o.out ?? 0) >= 0.997) return;
    note('type', 'turnWord');
    const x = o.x ?? KIT.CX, y = o.y ?? 620, size = o.size ?? 150, out = 1 - E.inOutSine(clamp(o.out ?? 0));
    const st = clamp(k / 0.28), sc = lerp(1.9, 1, E.outCubic(st)) * (1 + 0.04 * Math.sin(Math.PI * clamp((k - 0.28) / 0.3)));
    const ring = E.outCubic(clamp((k - 0.12) / 0.6));
    ctx.save(); ctx.globalAlpha = out * 0.5 * (1 - ring * 0.6); ctx.strokeStyle = o.ink || '#120a08'; ctx.lineWidth = lerp(60, 10, ring);
    ctx.beginPath(); KIT.scallopPath(ctx, x, y - size * 0.3, size * (1.2 + 1.6 * ring), size * (0.7 + 0.8 * ring), 13, 4, 0.1); ctx.stroke(); ctx.restore();
    ctx.save(); ctx.translate(x, y - size * 0.3); ctx.scale(sc, sc); ctx.translate(-x, -(y - size * 0.3));
    KIT.goldText(ctx, String(word).toUpperCase(), x, y, { size, spacing: size * 0.06, weight: 700, alpha: out * clamp(st * 1.5), glow: 0.35, sheen: clamp((k - 0.3) / 0.6) * 1.6 - 0.3, key: o.key || 'turnword' });
    ctx.restore();
    if (o.sub) { ctx.save(); ctx.globalAlpha = out * E.outCubic(clamp((k - 0.5) / 0.4)); ctx.font = R.font(size * 0.3, 'caption', 600, 'italic'); ctx.textAlign = 'center'; ctx.fillStyle = PAL.cream; ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = R.px(8); ctx.fillText(o.sub, x, y + size * 0.42); ctx.restore(); }
  };
  /** THE SOURCE LINE (research/audience-2027.md §5.4): what the text is and what is synthetic, small and quiet, the same
   *  wording every episode (strings.sourceLine, strings.madeLine). Shown over the cliffhanger and the Next (≥ 1 s). */
  TY.source = (ctx, T, a, S, o = {}) => {
    if (a <= 0.003 || !S) return;
    note('type', 'source');
    const x = o.x ?? KIT.CX, y = o.y ?? 236, size = o.size ?? 34;
    ctx.save(); ctx.globalAlpha = clamp(a); ctx.textAlign = 'center'; ctx.font = R.font(size, 'caption', 600);
    const l1 = S.sourceLine || '', l2 = S.madeLine || '', w = Math.max(ctx.measureText(l1).width, ctx.measureText(l2).width) + 48;
    ctx.fillStyle = 'rgba(12,8,6,0.7)'; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 1.05, w, size * 2.6, 14); ctx.fill();
    ctx.fillStyle = PAL.goldPale; ctx.fillText(l1, x, y); ctx.fillStyle = PAL.cream; ctx.fillText(l2, x, y + size * 1.2);
    ctx.restore();
  };
  /** A small upright label. */
  TY.tag = (ctx, T, k, text, o = {}) => {
    if (k <= 0.003) return;
    note('type', 'tag');
    const x = o.x ?? KIT.CX, y = o.y ?? 250, size = o.size ?? 38, a = E.outCubic(clamp(k)) * (1 - clamp(o.out ?? 0));
    ctx.save(); ctx.globalAlpha = a; ctx.font = R.font(size, 'caption', 600, o.italic ? 'italic' : 'normal'); ctx.textAlign = 'center';
    const w = ctx.measureText(text).width + 56;
    ctx.fillStyle = 'rgba(14,8,6,0.72)'; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 1.05, w, size * 1.55, size * 0.78); ctx.fill();
    ctx.strokeStyle = 'rgba(216,168,80,0.8)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = o.color || PAL.goldPale; ctx.fillText(text, x, y + (1 - E.outCubic(clamp(k))) * 10); ctx.restore();
  };
})();
