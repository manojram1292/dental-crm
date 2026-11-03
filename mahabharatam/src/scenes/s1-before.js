/*
 * Line "before" · THE HOOK
 * "Before the war. Before the dice. Before any throne was fought for…"
 *
 * Black. Three ghost images flare up in gold, each on a drum hit (env.beats =
 * the three "Before"s, from the timeline), and burn away into embers:
 *   1. crossed arrows over a drawn bow   (the war)
 *   2. long pasa dice tumbling down      (the dice)
 *   3. an empty throne under a parasol   (the throne)
 * A faint fire-glow breathes at the bottom of frame, the source of every light.
 * After the third flash a single ember lingers and rises (it becomes the dawn
 * of the next shot, which dissolves in over it).
 * All motion is in local time relative to the beats, so it works for any voice.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT;
  const { TAU, clamp, lerp, E, PAL, hash } = R;
  const CX = 540, CY = 760;

  // ─── the three images, as strokes / fills / dots in a 700×700 box ─────────
  function arrowsArt() {
    const S = [], F = [], D = [];
    // a drawn longbow behind, its string pulled
    const bow = [];
    for (let i = 0; i <= 40; i++) {
      const u = i / 40 * 2 - 1;
      bow.push([350 + 150 * (1 - u * u) - 230 + 26 * Math.pow(Math.abs(u), 5) * 3, 350 + u * 320]);
    }
    S.push(bow);
    S.push([bow[0], [350 - 80 + 210, 350], bow[40]]);
    for (const s of [-1, 1]) {
      const ang = s * 0.5, c = Math.cos(ang), sn = Math.sin(ang);
      const P = (x, y) => [350 + x * c - y * sn, 350 + x * sn + y * c];
      S.push([P(0, -300), P(0, 310)]);
      F.push([P(0, -372), P(-26, -318), P(-9, -300), P(0, -308), P(9, -300), P(26, -318)]);      // broad blade
      for (const k of [0, 1, 2]) {
        F.push([P(0, 236 + k * 26), P(-24, 266 + k * 26), P(-24, 290 + k * 26), P(0, 262 + k * 26)]);
        F.push([P(0, 236 + k * 26), P(24, 266 + k * 26), P(24, 290 + k * 26), P(0, 262 + k * 26)]);
      }
    }
    D.push([350, 350, 12]);
    return { S, F, D, lw: 10 };
  }
  /** Long four-sided pasa dice, tumbling: computed per time (they fall). */
  function diceArt(u) {
    const S = [], F = [], D = [];
    const dice = [[-150, -120, 0.5, 1.6], [70, -40, -0.35, -1.2], [210, 120, 0.9, 2.2]];
    dice.forEach(([dx, dy, a0, spin], i) => {
      const a = a0 + spin * u, fall = 220 * u * u + 60 * u;
      const cx = 350 + dx + 20 * u * (i - 1), cy = 350 + dy + fall;
      const L = 230, Wd = 64, Dp = 34 * Math.cos(spin * u * 2 + i);
      const c = Math.cos(a), s = Math.sin(a);
      const P = (x, y) => [cx + x * c - y * s, cy + x * s + y * c];
      const top = [P(-L / 2, -Wd / 2), P(L / 2, -Wd / 2), P(L / 2, Wd / 2), P(-L / 2, Wd / 2)];
      const off = [-Dp * s * 0.5, Dp * c * 0.5 + Math.abs(Dp) * 0.6];
      const side = [top[3], top[2], [top[2][0] + off[0], top[2][1] + off[1]], [top[3][0] + off[0], top[3][1] + off[1]]];
      F.push(side.map((p) => [...p, 0.55]));
      F.push(top);
      S.push([...top, top[0]]);
      S.push([side[2], side[3]]);
      const pips = [[-80, 1], [-25, 2], [30, 3], [85, 4]][(i + 1) % 4];
      for (let k = 0; k < 3 + i; k++) {
        const px = -L / 2 + 30 + k * ((L - 60) / (2 + i)), py = 0;
        D.push([...P(px, py), 7]);
      }
      void pips;
    });
    return { S, F, D };
  }
  function throneArt() {
    const S = [], F = [], D = [];
    // seat platform
    F.push([[180, 470], [520, 470], [540, 500], [160, 500]]);
    F.push([[200, 500], [500, 500], [500, 540], [200, 540]]);
    // lion legs
    for (const x of [205, 470]) F.push([[x, 540], [x + 28, 540], [x + 34, 600], [x + 44, 612], [x - 8, 612], [x, 590]]);
    // cushion
    F.push([[215, 470], [235, 445], [465, 445], [485, 470]]);
    // the back: a tall arch (prabhavali) with flame scallops
    const arch = [];
    for (let i = 0; i <= 48; i++) {
      const a = Math.PI + (i / 48) * Math.PI;
      arch.push([350 + Math.cos(a) * 150, 330 + Math.sin(a) * 210]);
    }
    S.push([[200, 470], [200, 330], ...arch, [500, 330], [500, 470]]);
    S.push([[230, 470], [230, 335], ...arch.map(([x, y]) => [350 + (x - 350) * 0.8, 330 + (y - 330) * 0.82]), [470, 335], [470, 470]]);
    for (let i = 0; i <= 16; i++) {
      const a = Math.PI + (i / 16) * Math.PI;
      const x = 350 + Math.cos(a) * 168, y = 330 + Math.sin(a) * 230;
      const nx = Math.cos(a), ny = Math.sin(a);
      F.push([[x - ny * 9, y + nx * 9], [x + nx * 34, y + ny * 34], [x + ny * 9, y - nx * 9]]);
    }
    // parasol (chhatra) above
    S.push([[350, 95], [350, 20]]);
    const dome = [];
    for (let i = 0; i <= 30; i++) { const a = Math.PI + (i / 30) * Math.PI; dome.push([350 + Math.cos(a) * 130, 40 + Math.sin(a) * 50]); }
    F.push([...dome, [480, 40], [220, 40]]);
    for (let i = 0; i < 9; i++) D.push([228 + i * 30.5, 52, 6]);
    // pillars of light either side
    S.push([[120, 612], [120, 260]]); S.push([[580, 612], [580, 260]]);
    D.push([120, 245, 10], [580, 245, 10]);
    return { S, F, D };
  }

  const ARROWS = arrowsArt(), THRONE = throneArt();

  function sampleArt(art, n, seed) {
    // points along strokes (by length), for the burn-away embers
    const segs = [];
    let total = 0;
    for (const s of art.S) for (let i = 1; i < s.length; i++) { const l = Math.hypot(s[i][0] - s[i - 1][0], s[i][1] - s[i - 1][1]); segs.push([s[i - 1], s[i], l]); total += l; }
    for (const f of art.F) for (let i = 0; i < f.length; i++) { const a = f[i], b = f[(i + 1) % f.length]; const l = Math.hypot(b[0] - a[0], b[1] - a[1]); segs.push([a, b, l]); total += l; }
    const pts = [];
    for (let k = 0; k < n; k++) {
      let d = hash(k, seed) * total;
      for (const [a, b, l] of segs) { if (d <= l) { const u = d / l; pts.push([lerp(a[0], b[0], u), lerp(a[1], b[1], u)]); break; } d -= l; }
    }
    return pts;
  }

  function drawArt(g, art, a, glow) {
    if (a <= 0.003) return;
    g.save();
    g.lineCap = 'round'; g.lineJoin = 'round';
    // flat terracotta fills, then gold line-work with a hot glow
    for (const f of art.F) {
      const shade = f[0].length > 2 ? f[0][2] : 1;
      g.globalAlpha = a * 0.85;
      g.fillStyle = shade < 1 ? PAL.terracottaDk : PAL.terracotta;
      g.beginPath(); R.polyPath(g, f); g.fill();
    }
    g.globalAlpha = a;
    g.shadowColor = PAL.saffron; g.shadowBlur = R.px(26 * glow);
    g.strokeStyle = PAL.goldPale; g.lineWidth = art.lw || 7;
    for (const s of art.S) { g.beginPath(); R.polyPath(g, s, false); g.stroke(); }
    g.fillStyle = PAL.goldPale;
    for (const f of art.F) { g.beginPath(); R.polyPath(g, f); g.lineWidth = 3; g.stroke(); }
    for (const [x, y, r] of art.D) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
    g.restore();
  }

  /** Envelope of a flash at local time t relative to its beat b. */
  function flashEnv(t, b, hold, decay, pre = 0.02) {
    const d = t - b;
    if (d < -pre) return 0;
    const atk = E.outCubic(clamp((d + pre) / (0.06 + pre)));
    const dec = d < hold ? 1 : Math.exp(-(d - hold) / decay);
    return atk * dec;
  }

  R.scene({
    id: 'before',
    draw(ctx, t, env) {
      const T = env.T;
      const beats = env.beats.length >= 3 ? env.beats : [0.05, env.dur * 0.27, env.dur * 0.52];
      ctx.fillStyle = '#050304'; ctx.fillRect(0, 0, R.W, R.H);
      // the unseen fire below, breathing (stronger on each hit)
      let hit = 0;
      for (const b of beats) hit = Math.max(hit, flashEnv(t, b, 0.05, 0.5));
      const fl = KIT.flicker(T, 2);
      KIT.glow(ctx, 540, 2050, 1100, PAL.saffron, (0.22 + 0.25 * hit) * fl);
      KIT.glow(ctx, 540, 1980, 600, '#ff7a2a', (0.15 + 0.2 * hit) * fl);
      // slow drifting smoke haze
      KIT.smoke.draw(ctx, 540, 1900, T, { h: 1900, w: 220, strands: 4, alpha: 0.16 + 0.1 * hit, color: '#6e5a66', speed: 0.5, seed: 9, curls: 0.4 });

      const arts = [
        { art: ARROWS, hold: 0.22, decay: 0.32, seed: 11 },
        { art: null, hold: 0.25, decay: 0.34, seed: 12 },
        { art: THRONE, hold: 0.5, decay: 0.55, seed: 13 },
      ];
      arts.forEach((A, k) => {
        const b = beats[k];
        const a = flashEnv(t, b, A.hold, A.decay, k === 0 ? 0.1 : 0.02);
        const d = t - b;
        if (d < -0.03 || d > 3.2) return;
        const art = A.art || diceArt(clamp(d / 1.1));
        const zoom = 0.92 + 0.12 * E.outCubic(clamp(d / 1.4)) + (k === 2 ? 0.05 * clamp(d / 2) : 0);
        ctx.save();
        ctx.translate(CX, CY);
        ctx.scale(zoom, zoom);
        ctx.translate(-350, -350);
        // the hit: a white-gold flare that settles into the image
        const flare = Math.exp(-Math.max(0, d) / 0.07) * clamp((d + (k === 0 ? 0.1 : 0.02)) / 0.05);
        KIT.glow(ctx, 350, 350, 560, PAL.saffron, 0.5 * a + 0.4 * flare);
        drawArt(ctx, art, a, 1 + flare * 1.5);
        // burning away: embers peel off the line-work and rise
        const burn = clamp((d - A.hold) / 1.4);
        if (burn > 0) {
          const pts = sampleArt(art, 90, A.seed);
          ctx.globalCompositeOperation = 'lighter';
          pts.forEach((p, i) => {
            const start = hash(i, A.seed + 5) * 0.55;
            const u = clamp((burn - start) / 0.45);
            if (u <= 0 || u >= 1) return;
            const rise = 260 * u * (0.5 + hash(i, A.seed + 6));
            const x = p[0] + Math.sin(u * 5 + i) * 18 * u, y = p[1] - rise;
            const al = Math.sin(Math.PI * u) * 0.95;
            ctx.globalAlpha = al;
            ctx.fillStyle = u < 0.5 ? PAL.goldPale : PAL.saffronLt;
            ctx.beginPath(); ctx.arc(x, y, 2.6 * (1 - u * 0.6), 0, TAU); ctx.fill();
            KIT.glow(ctx, x, y, 16, PAL.saffron, al * 0.4);
          });
        }
        ctx.restore();
      });

      // the lingering ember: rises toward the next shot
      const last = beats[2] + 0.9;
      const u = clamp((t - last) / Math.max(0.6, env.dur - last + 0.8));
      if (u > 0) {
        const x = CX + Math.sin(u * 5) * 26, y = lerp(CY + 120, CY - 260, E.inOutSine(u));
        const a = Math.sin(Math.PI * Math.min(1, u * 1.6 + 0.1)) * KIT.flicker(T, 4);
        KIT.glow(ctx, x, y, 70, PAL.saffron, a * 0.7);
        ctx.fillStyle = PAL.goldPale; ctx.globalAlpha = a;
        ctx.beginPath(); ctx.arc(x, y, 4.5, 0, TAU); ctx.fill();
        ctx.globalAlpha = 1;
      }
    },
    post: () => ({ bloom: 0.45, vignette: 0.55, paper: 0.18 }),
  });
})();
