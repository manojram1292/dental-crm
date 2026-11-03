/*
 * Episode 2 · shared pieces for its scenes (not a scene itself).
 *
 *   EP2.mouth(env, t)            0..1 jaw opening while the line's words are spoken (for expression.speak)
 *   EP2.storm(ctx, T, o)         a mural storm sky: scalloped cloud banks, a red underglow, rain, lightning
 *   EP2.LAKES                    the five lakes of Samantapanchaka, in a 1000×1000 plan (centre 500,500)
 *   EP2.lakePath(ctx, i, k)      lake i's shoreline (k = scale), as a closed path
 *   EP2.crown(ctx, x, y, s, rot, col, line)   a fallen king's crown (kirita), mural style
 *   EP2.lotus(ctx, x, y, s, open, a)          a lotus in bloom on the water
 *   EP2.mandala(ctx, T, fills, o)              the field seen from above, in plan coordinates (0..1000):
 *                                              bhupura, lotus ring, the five lakes (fills[i] 0..1; o.red, o.clear)
 *                                              (also episode 3's battlefield)
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT;
  const { TAU, clamp, lerp, hash, noise, E, PAL } = R;
  const EP2 = (window.EP2 = {});

  EP2.mouth = (env, t) => {
    let m = 0;
    for (const w of env.words) {
      if (t >= w.t0 && t <= w.t1) { const u = (t - w.t0) / Math.max(0.05, w.t1 - w.t0); m = Math.max(m, Math.sin(Math.PI * u) * (0.6 + 0.4 * Math.sin(t * 23))); }
    }
    return clamp(m);
  };

  /** Lightning envelope at local time t for strikes at times `at` (sharp double flash, quick decay). */
  EP2.flash = (t, at) => {
    let f = 0;
    for (const b of at) {
      const d = t - b;
      if (d < -0.02 || d > 1.2) continue;
      f = Math.max(f, Math.exp(-Math.max(0, d) / 0.09) + 0.6 * Math.exp(-Math.abs(d - 0.16) / 0.05));
    }
    return clamp(f);
  };

  EP2.storm = (ctx, T, o = {}) => {
    const fl = o.flash || 0, red = o.red ?? 1;
    KIT.vgrad(ctx, 0, R.H, [[0, R.mix('#07060f', '#8a86b8', fl * 0.8)], [0.45, R.mix('#1a0c18', '#b0a0c8', fl * 0.7)], [0.72, R.mix('#4a0d10', '#d07060', fl * 0.5)], [0.86, R.mix('#7a1a10', '#f0a080', fl * 0.4)], [1, '#140606']]);
    // the red underglow on the horizon
    KIT.glow(ctx, 540, o.horizon || 1500, 1100, '#c0141c', 0.35 * red, 'lighter', 0.35);
    // cloud banks hanging from the top, scalloped underneath, their undersides lit red (white in a flash)
    const banks = [[230, 0.9, 8], [430, 1.0, 9], [620, 1.15, 10], [820, 1.3, 11]];
    banks.forEach(([y, sc, n], b) => {
      const drift = ((T * (16 + b * 7) * (b % 2 ? -1 : 1)) % (1200 / n) + 1200 / n) % (1200 / n);
      const lumps = [];
      for (let i = -1; i <= n + 1; i++) lumps.push([i * (1200 / n) + drift - 60 + hash(i + 40, b) * 30, y + Math.sin(i * 1.7 + b) * 40 + hash(i + 3, b) * 40, (90 + 60 * hash(i + 9, b)) * sc]);
      const body = (dy) => {
        ctx.beginPath();
        ctx.rect(0, (b ? y - 230 * sc : -10) + dy, R.W, b ? 230 * sc : y + 10);
        for (const [cx, cy, r] of lumps) { ctx.moveTo(cx + r, cy + dy); ctx.arc(cx, cy + dy, r, 0, TAU); }
        ctx.fill();
      };
      ctx.save();
      // the lit underside: the cloud in the rim colour, then the cloud again shifted up over it
      ctx.fillStyle = fl > 0.3 ? R.mix('#8a3030', '#d8d0ff', fl) : R.mix('#3a0e10', '#d0301e', 0.35 + 0.15 * b);
      ctx.globalAlpha = clamp((0.45 + 0.15 * b) * red + fl * 0.5);
      body(0);
      ctx.globalAlpha = 1;
      ctx.fillStyle = R.mix(['#1c1424', '#2a1828', '#341a22', '#3e1a1c'][b], '#141020', fl * 0.8);
      body(-6 - 2 * b);
      ctx.restore();
    });
    // rain: long thin diagonal streaks
    if (o.rain !== 0) {
      ctx.save();
      ctx.strokeStyle = R.mix('#6a5a7a', '#e8e0ff', fl);
      ctx.lineWidth = 1.6;
      ctx.globalAlpha = 0.22 * (o.rain ?? 1) + 0.2 * fl;
      ctx.beginPath();
      for (let i = 0; i < 140; i++) {
        const sp = 1400 + hash(i, 3) * 700;
        const x0 = hash(i, 1) * 1400 - 200, y0 = ((hash(i, 2) * 2200 + T * sp) % 2200) - 200;
        ctx.moveTo(x0 + y0 * 0.22, y0); ctx.lineTo(x0 + (y0 + 70) * 0.22, y0 + 70);
      }
      ctx.stroke();
      ctx.restore();
    }
  };

  /** A forked lightning bolt from (x, y0) down to y1 (deterministic per seed), alpha a. */
  EP2.bolt = (ctx, x, y0, y1, seed, a) => {
    if (a <= 0.01) return;
    const pts = [[x, y0]];
    let px = x;
    const n = 14;
    for (let i = 1; i <= n; i++) { px += (hash(i, seed) - 0.5) * 90; pts.push([px, lerp(y0, y1, i / n)]); }
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    for (const [w, c, al] of [[18, '#8070ff', 0.25], [7, '#d8d0ff', 0.6], [2.5, '#ffffff', 1]]) {
      ctx.globalAlpha = a * al; ctx.strokeStyle = c; ctx.lineWidth = w;
      ctx.beginPath(); R.polyPath(ctx, pts, false); ctx.stroke();
      // a branch
      ctx.beginPath(); const k = 5; ctx.moveTo(pts[k][0], pts[k][1]);
      let bx = pts[k][0], by = pts[k][1];
      for (let i = 1; i < 6; i++) { bx += 30 + hash(i, seed + 9) * 40; by += 50; ctx.lineTo(bx, by); }
      ctx.stroke();
    }
    ctx.restore();
  };

  // The five lakes in a 1000×1000 plan: the quincunx of a mandala (centre + four quarters),
  // each an irregular natural shoreline.
  EP2.LAKES = [[500, 500, 118], [300, 300, 92], [700, 300, 92], [700, 700, 92], [300, 700, 92]];
  EP2.lakePath = (ctx, i, k = 1, wob = 0) => {
    const [cx, cy, r] = EP2.LAKES[i];
    const N = 40;
    for (let j = 0; j <= N; j++) {
      const a = (j / N) * TAU;
      const rr = r * k * (1 + 0.14 * Math.sin(a * 3 + i * 1.3) + 0.08 * Math.sin(a * 5 + i * 2.1) + wob * noise.n2(Math.cos(a) * 2 + i * 9, Math.sin(a) * 2));
      const x = cx + Math.cos(a) * rr * 1.08, y = cy + Math.sin(a) * rr * 0.92;
      if (j) ctx.lineTo(x, y); else ctx.moveTo(x, y);
    }
    ctx.closePath();
  };

  /** A crown (kirita-mukuta) ~ s×110 px tall, base centred on (x, y), rotated rot. */
  EP2.crown = (ctx, x, y, s, rot, col, line, variant = 0) => {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    ctx.beginPath();
    const tiers = variant % 2 ? [[-46, 0, -18], [-38, -18, -44], [-28, -44, -70], [-16, -70, -92]] : [[-48, 0, -22], [-40, -22, -52], [-26, -52, -84]];
    for (const [w, y0, y1] of tiers) { ctx.moveTo(w, y0); ctx.lineTo(-w, y0); ctx.lineTo(-w * 0.86, y1); ctx.lineTo(w * 0.86, y1); ctx.closePath(); }
    const top = tiers[tiers.length - 1][2];
    ctx.moveTo(-10, top); ctx.quadraticCurveTo(0, top - 30, 0, top - 40); ctx.quadraticCurveTo(0, top - 30, 10, top); ctx.closePath();
    // side wings
    ctx.moveTo(-48, -6); ctx.quadraticCurveTo(-78, -20, -84, -48); ctx.quadraticCurveTo(-66, -26, -44, -24); ctx.closePath();
    ctx.moveTo(48, -6); ctx.quadraticCurveTo(78, -20, 84, -48); ctx.quadraticCurveTo(66, -26, 44, -24); ctx.closePath();
    ctx.fillStyle = col; ctx.fill();
    ctx.strokeStyle = line; ctx.lineWidth = 3;
    for (const [w, y0] of tiers) { ctx.beginPath(); ctx.moveTo(-w, y0 - 4); ctx.lineTo(w, y0 - 4); ctx.stroke(); }
    ctx.fillStyle = line;
    ctx.beginPath(); ctx.arc(0, -12, 7, 0, TAU); ctx.fill();
    ctx.restore();
  };

  /** A mural lotus: rings of pointed petals, open 0..1. */
  EP2.lotus = (ctx, x, y, s, open, a = 1, seed = 0) => {
    if (a <= 0.01 || open <= 0.01) return;
    ctx.save();
    ctx.translate(x, y); ctx.scale(s, s * 0.62);
    ctx.globalAlpha = a;
    // pad
    ctx.fillStyle = '#1f4a3a';
    ctx.beginPath(); ctx.arc(0, 18, 64 * Math.min(1, open * 1.5), 0.25, TAU - 0.25); ctx.lineTo(0, 18); ctx.fill();
    const rings = [[8, 54, '#f3c6cf', 0], [7, 42, '#f8dfe4', 0.2], [5, 28, '#fff3ee', 0.4]];
    for (const [n, L, col, lag] of rings) {
      const o = E.outBack(clamp((open - lag) / (1 - lag)));
      if (o <= 0) continue;
      ctx.fillStyle = col;
      for (let i = 0; i < n; i++) {
        const ang = -Math.PI / 2 + ((i - (n - 1) / 2) / n) * Math.PI * 1.15 * o;
        ctx.save(); ctx.rotate(ang + Math.PI / 2);
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(L * 0.32, -L * 0.5, 0, -L * o); ctx.quadraticCurveTo(-L * 0.32, -L * 0.5, 0, 0); ctx.fill();
        ctx.restore();
      }
    }
    ctx.fillStyle = '#f0c040';
    ctx.beginPath(); ctx.arc(0, -6, 7 * open, 0, TAU); ctx.fill();
    ctx.restore();
    void seed;
  };

  /** Draw the mandala ground in plan coordinates (0..1000). fill[i] = 0..1 per lake, redness 0..1. */
  EP2.mandala = function mandala(ctx, T, fills, o = {}) {
    const red = o.red ?? 1, clear = o.clear ?? 0;
    // earth
    ctx.fillStyle = '#2a1a10'; ctx.fillRect(-400, -400, 1800, 1800);
    const eg = ctx.createRadialGradient(500, 500, 100, 500, 500, 760);
    eg.addColorStop(0, '#5a3a22'); eg.addColorStop(1, '#1e120a');
    ctx.fillStyle = eg; ctx.fillRect(-400, -400, 1800, 1800);
    ctx.save();
    ctx.lineJoin = 'round';
    // bhupura: outer square with T-gates, double line
    const gate = (d) => {
      // the top side with its T-gate, then the same turned three times (clockwise)
      const top = [[-d, -d], [-90, -d], [-90, -d - 50], [-140, -d - 50], [-140, -d - 90], [140, -d - 90], [140, -d - 50], [90, -d - 50], [90, -d]];
      const pts = [];
      let side = top;
      for (let q = 0; q < 4; q++) { pts.push(...side.map(([x, y]) => [500 + x, 500 + y])); side = side.map(([x, y]) => [-y, x]); }
      return pts;
    };
    ctx.strokeStyle = PAL.gold; ctx.globalAlpha = 0.75; ctx.lineWidth = 6;
    ctx.beginPath(); R.polyPath(ctx, gate(420)); ctx.stroke();
    ctx.globalAlpha = 0.45; ctx.lineWidth = 3;
    ctx.beginPath(); R.polyPath(ctx, gate(400)); ctx.stroke();
    // a ring of lotus petals
    ctx.globalAlpha = 0.5; ctx.fillStyle = '#7a4a26'; ctx.strokeStyle = PAL.goldDeep; ctx.lineWidth = 2;
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * TAU;
      ctx.save(); ctx.translate(500, 500); ctx.rotate(a);
      ctx.beginPath(); ctx.moveTo(0, -330); ctx.quadraticCurveTo(26, -370, 0, -400); ctx.quadraticCurveTo(-26, -370, 0, -330); ctx.fill(); ctx.stroke();
      ctx.restore();
    }
    ctx.globalAlpha = 0.55; ctx.strokeStyle = PAL.gold; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(500, 500, 330, 0, TAU); ctx.stroke();
    ctx.restore();
    // the lakes
    EP2.LAKES.forEach((L, i) => {
      const f = fills[i];
      const [cx, cy, r] = L;
      // dry bed
      ctx.save();
      ctx.beginPath(); EP2.lakePath(ctx, i, 1.0); ctx.fillStyle = '#160c08'; ctx.fill();
      ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(231,181,74,0.55)'; ctx.stroke();
      if (f > 0) {
        ctx.beginPath(); EP2.lakePath(ctx, i, 0.94 * Math.sqrt(f), 0.04); ctx.clip();
        const water = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.25, 4, cx, cy, r * 1.1);
        const deep = R.mix('#5a0608', '#123c46', clear), mid = R.mix('#a0141a', '#2a7a80', clear), hi = R.mix('#ff5a3a', '#bfe8e0', clear);
        water.addColorStop(0, hi); water.addColorStop(0.35, mid); water.addColorStop(1, deep);
        ctx.fillStyle = water; ctx.fillRect(cx - r * 1.3, cy - r * 1.3, r * 2.6, r * 2.6);
        // ripples
        ctx.strokeStyle = R.mix('#ff8a6a', '#e8fff8', clear); ctx.lineWidth = 2.5;
        for (let k = 0; k < 3; k++) {
          const u = ((T * 0.45 + k / 3 + i * 0.17) % 1);
          ctx.globalAlpha = (1 - u) * 0.4;
          ctx.beginPath(); ctx.ellipse(cx, cy, r * u * 1.1, r * u * 0.92, 0, 0, TAU); ctx.stroke();
        }
      }
      ctx.restore();
      if (f > 0) KIT.glow(ctx, cx, cy, r * 2.4, clear > 0.5 ? '#8fd8d0' : '#d0201a', (0.35 + 0.25 * Math.sin(T * 2 + i)) * f * (red * (1 - clear) + clear * 0.6));
    });
  };
})();
