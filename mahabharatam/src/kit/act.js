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

  /**
   * 0 → 1 over REAL TIME (dt in seconds since the key), in three phases (visual review of kit 41, M2):
   *   anticipation  `antic` s (default 0.24 = 7 frames): eases OUT to −an and stays there (the body goes the other way first)
   *   action        `act` s (default 0.3; a strike: 0.12 = 3–4 frames, with the rig's smear): −an → 1 + ov
   *   settle        `settle` s (default 0.4 = 12 frames): a damped overshoot back to 1
   * Never a 2-frame twitch: every phase is at least 3 frames long.
   */
  A.arc = (dt, o = {}) => {
    const an = o.an ?? 0.1, ov = o.over ?? 0.09, ta = Math.max(0.1, o.antic ?? 0.24), tb = Math.max(0.1, o.act ?? 0.3), tc = Math.max(0.2, o.settle ?? 0.4);
    if (dt <= 0) return 0;
    if (dt < ta) return -an * E.outCubic(dt / ta);
    if (dt < ta + tb) { const u = (dt - ta) / tb; return -an + (1 + ov + an) * (tb < 0.2 ? u * u * (3 - 2 * u) : E.inOutSine(u)); }
    const v = Math.min(1, (dt - ta - tb) / tc);
    return 1 + ov * Math.exp(-4.2 * v) * Math.cos(v * Math.PI * 2.2) * (1 - v);
  };
  const asW = (p) => (typeof p === 'string' ? { [p]: 1 } : p);
  const mixW = (a, b, k) => { const o = {}; for (const n of new Set([...Object.keys(a), ...Object.keys(b)])) { const v = lerp(a[n] || 0, b[n] || 0, k); if (Math.abs(v) > 1e-4) o[n] = v; } return o; };
  /** Pose weights at t from keys [[time, pose, { antic, act, settle, an, over }]]: each key STARTS at its time (anticipation first). */
  A.keys = (t, keys, o = {}) => {
    let w = asW(keys[0][1]);
    for (let i = 1; i < keys.length; i++) {
      const [t0, p, ko = {}] = keys[i];
      if (t <= t0) break;
      w = mixW(w, asW(p), A.arc(t - t0, { ...o, ...ko }));
    }
    return w;
  };
  /** The full pose object for the actor rig: the weights now, a moment ago (cloth and hair read the past), and 1½ frames ago (the smear). */
  A.pose = (t, keys, o = {}) => {
    const lag = o.lag ?? 0.13;
    return { w: A.keys(t, keys, o), lag: A.keys(t - lag, keys, o), lag2: A.keys(t - 2 * lag, keys, o), sm: A.keys(t - 0.05, keys, o), phase: o.phase || 0, stride: o.stride, wind: o.wind, prop: o.prop, hold: o.hold };
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
    for (let i = 1; i < keys.length; i++) { const [t0, n, ko = {}] = keys[i]; if (t <= t0) break; e = mixE(e, asE(n), E.inOutSine(clamp((t - t0) / (ko.dur ?? o.dur ?? 0.45)))); }
    return e;
  };
  /** EYES LEAD THE HEAD: the pupils go to the new target first and the head follows 4 frames later.
   *  expression: { ...A.lead(t, keys) } → { gaze, look } (look: the head's pitch, a part of the gaze's y). */
  A.lead = (t, keys, dur = 0.3, head = 0.16) => { const g = A.gaze(t + 0.13, keys, dur * 0.7), h = A.gaze(t, keys, dur * 1.5); return { gaze: [g[0] - h[0] * 0.35, g[1] - h[1] * 0.35], look: h[1] * head }; };
  /** PLANTED FEET: the walk phase for a body that has travelled `dist` px (scene units) at draw scale `scale`. */
  A.stride = (dist, scale = 1, leg = 1) => (Math.PI * dist) / (236 * leg * scale);
  A.gaze = (t, keys, dur = 0.3) => {
    let g = keys[0][1];
    for (let i = 1; i < keys.length; i++) { const [t0, v] = keys[i]; if (t <= t0) break; const k = E.outCubic(clamp((t - t0) / dur)); g = [lerp(g[0], v[0], k), lerp(g[1], v[1], k)]; }
    return g;
  };

  // ─── Typography in motion ─────────────────────────────────────────────────────────────────────────────────────
  const TY = (KIT.type = {});
  /** TEXT NEVER CROSSES A FACE. rect = [x0, y0, x1, y1] (logical px). Returns [dx, dy] to a clear place (tries the mirror side,
   *  then up and down), or reports the hit to the gate's probe when there is none. Faces come from the acting figures drawn
   *  earlier in the same frame (REEL.faces). */
  const hits = (r) => (R.faces || []).some((f) => f.x + f.r > r[0] && f.x - f.r < r[2] && f.y + f.r > r[1] && f.y - f.r < r[3]);
  TY.hits = hits;
  TY.clear = (r, name) => {
    if (!hits(r)) return [0, 0];
    const w = r[2] - r[0], cx = (r[0] + r[2]) / 2;
    for (const [dx, dy] of [[R.W - 2 * cx + (cx < R.W / 2 ? -90 : 0), 0], [0, -220], [0, 220], [0, -420], [0, 420], [R.W - 2 * cx, -220], [R.W - 2 * cx, 220]]) {
      const q = [r[0] + dx, r[1] + dy, r[2] + dx, r[3] + dy];
      if (q[0] > 20 && q[2] < R.W - 20 && q[1] > 190 && q[3] < 1250 && !hits(q)) { void w; return [dx, dy]; }
    }
    note('type', 'faceHit:' + name);
    return [0, 0];
  };
  /** A name plaque that ARRIVES. k = 0..1 intro (≈ 0.7 s), o.out = 0..1. */
  TY.plaque = (ctx, T, k, name, epithet, o = {}) => {
    if (k <= 0.003 || (o.out ?? 0) >= 0.997) return;
    note('type', 'plaque');
    let x = o.x ?? KIT.CX; const y = o.y ?? 420, size = o.size ?? 62, out = 1 - E.inOutSine(clamp(o.out ?? 0));
    ctx.save(); ctx.font = R.font(size, 'display', 700); ctx.letterSpacing = `${size * 0.08}px`;
    const text = String(name).toUpperCase(), tw = ctx.measureText(text).width;
    ctx.font = R.font(size * 0.56, 'caption', 600, 'normal'); ctx.letterSpacing = '0px';
    const ew = epithet ? ctx.measureText(epithet).width : 0;
    const w = Math.max(tw, ew) + size * 1.5, h = size * (epithet ? 2.35 : 1.6);
    x = Math.min(R.W - 24 - w / 2, Math.max(24 + w / 2, x));   // a plaque is never cut by the frame's edge
    const mv = TY.clear([x - w / 2, y - size * 1.12, x + w / 2, y - size * 1.12 + h], 'plaque'); ctx.restore(); ctx.save(); ctx.translate(mv[0], mv[1]); const x0 = x - w / 2, y0 = y - size * 1.12;
    // the lacquer band brushes on from the left, with a bristled leading edge
    const b = E.outCubic(clamp(k / 0.45)), bw = w * b;
    ctx.globalAlpha = out * 0.9; ctx.fillStyle = o.color || 'rgba(14,8,6,0.86)';
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + bw - 14, y0);
    for (let i = 0; i <= 6; i++) ctx.lineTo(x0 + bw + (i % 2 ? 10 : -6) * (1 - b * 0.6) + 8 * hash(i, 3) * (1 - b), y0 + (h * i) / 6);
    ctx.lineTo(x0, y0 + h); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = out * b; ctx.fillStyle = o.edge || PAL.gold; ctx.fillRect(x0, y0, bw, 4); ctx.fillRect(x0, y0 + h - 4, bw, 4);
    ctx.restore();
    // the letters land one by one (each drops a few px and warms in)
    ctx.save(); ctx.translate(mv[0], mv[1]); ctx.font = R.font(size, 'display', 700); ctx.letterSpacing = `${size * 0.08}px`; ctx.textBaseline = 'alphabetic';
    let cx = x - tw / 2;
    [...text].forEach((ch, i) => {
      const lk = E.outBack ? E.outBack(clamp((k - i * 0.02) / 0.28)) : E.outCubic(clamp((k - i * 0.02) / 0.28));
      const cw = ctx.measureText(ch).width;
      if (lk > 0) { ctx.globalAlpha = out * clamp(lk); ctx.fillStyle = KIT.hex(PAL.goldPale, '#ffffff', 0.5 * (1 - clamp(lk))); ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = R.px(8); ctx.fillText(ch, cx, y - (1 - lk) * 26); }
      cx += cw;
    });
    ctx.restore();
    const ul = E.inOutCubic(clamp((k - 0.5) / 0.4));
    if (ul > 0) { ctx.save(); ctx.translate(mv[0], mv[1]); ctx.globalAlpha = out; ctx.fillStyle = PAL.gold; ctx.beginPath(); ctx.moveTo(x - tw / 2, y + 14); ctx.quadraticCurveTo(x - tw / 2 + tw * ul * 0.5, y + 8, x - tw / 2 + tw * ul, y + 13); ctx.quadraticCurveTo(x - tw / 2 + tw * ul * 0.5, y + 19, x - tw / 2, y + 20); ctx.fill(); ctx.restore(); }
    if (epithet) { ctx.save(); ctx.translate(mv[0], mv[1]); ctx.globalAlpha = out * E.outCubic(clamp((k - 0.35) / 0.35)); ctx.font = R.font(size * 0.56, 'caption', 600); ctx.textAlign = 'center'; ctx.fillStyle = PAL.cream; ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = R.px(6); ctx.fillText(epithet, x, y + size * 0.9); ctx.restore(); }
  };
  /** THE WORD OF THE TURN: stamps in large with an ink ring; holds; o.out fades. */
  TY.turnWord = (ctx, T, k, word, o = {}) => {
    if (k <= 0.003 || (o.out ?? 0) >= 0.997) return;
    note('type', 'turnWord');
    const size = o.size ?? 130, out = 1 - E.inOutSine(clamp(o.out ?? 0)), text = String(word).toUpperCase();
    ctx.save(); ctx.font = R.font(size, 'display', 700); ctx.letterSpacing = `${size * 0.06}px`; const tw = ctx.measureText(text).width; ctx.restore();
    let x = clamp(o.x ?? KIT.CX, tw / 2 + 70, R.W - tw / 2 - 70), y = o.y ?? 620;
    const mv = TY.clear([x - tw / 2 - 20, y - size, x + tw / 2 + 20, y + (o.sub ? size * 0.6 : size * 0.2)], 'turnWord'); x += mv[0]; y += mv[1];
    const st = clamp(k / 0.3), sc = lerp(1.28, 1, E.outCubic(st)) * (1 + 0.03 * Math.sin(Math.PI * clamp((k - 0.3) / 0.3)));
    // a soft dark ground of brushed lacquer behind the word (no ring: a ring round a head reads as a noose)
    ctx.save(); ctx.globalAlpha = out * 0.55 * clamp(st * 1.4); ctx.fillStyle = '#120a08'; ctx.beginPath(); ctx.roundRect(x - tw / 2 - 40, y - size * 0.98, tw + 80, size * (o.sub ? 1.62 : 1.26), 18); ctx.fill(); ctx.restore();
    ctx.save(); ctx.translate(x, y - size * 0.3); ctx.scale(sc, sc); ctx.translate(-x, -(y - size * 0.3));
    KIT.goldText(ctx, text, x, y, { size, spacing: size * 0.06, weight: 700, alpha: out * clamp(st * 1.5), glow: 0.3, sheen: clamp((k - 0.3) / 0.6) * 1.6 - 0.3, key: o.key || 'turnword' });
    ctx.restore();
    if (o.sub) { ctx.save(); ctx.globalAlpha = out * E.outCubic(clamp((k - 0.5) / 0.4)); ctx.font = R.font(size * 0.3, 'caption', 600, 'italic'); ctx.textAlign = 'center'; ctx.fillStyle = PAL.cream; ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = R.px(8); ctx.fillText(o.sub, x, y + size * 0.42); ctx.restore(); }
  };
  /** THE SOURCE LINE (research/audience-2027.md §5.4): what the text is and what is synthetic, small and quiet, the same
   *  wording every episode (strings.sourceLine, strings.madeLine). Shown over the cliffhanger and the Next (≥ 1 s). */
  TY.source = (ctx, T, a, S, o = {}) => {
    if (a <= 0.003 || !S) return;
    note('type', 'source');
    const x = o.x ?? KIT.CX, y = o.y ?? 236; let size = o.size ?? 34;
    ctx.save(); ctx.globalAlpha = clamp(a); ctx.textAlign = 'center'; ctx.font = R.font(size, 'caption', 600);
    const l1 = S.sourceLine || '', l2 = S.madeLine || '';
    while (size > 24 && Math.max(ctx.measureText(l1).width, ctx.measureText(l2).width) + 48 > R.W - 72) { size -= 1; ctx.font = R.font(size, 'caption', 600); } // a longer source line (an honest note on the order of telling) shrinks to fit, never clips
    const w = Math.max(ctx.measureText(l1).width, ctx.measureText(l2).width) + 48;
    // the source line keeps ONE fixed place (it never moves to dodge a figure): a face under it is reported to the gate, and the shot is re-staged
    if (hits([x - w / 2, y - size * 1.05, x + w / 2, y + size * 1.55])) note('type', 'faceHit:source');
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
