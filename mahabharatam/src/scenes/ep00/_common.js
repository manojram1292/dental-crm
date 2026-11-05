/*
 * Episode 0 · THE INTRODUCTION (the channel's opening statement) · shared pieces (not a scene).
 * It is a montage of the series' own locations and characters, plus three new title moments.
 *
 *   EP0.mouth(env, t)                      jaw opening while the line's words are spoken
 *   EP0.plaque(ctx, name, epithet, x, y, a, o)   the lacquer name plaque (episode 15's)
 *   EP0.ground(ctx, T, warm)               the dark plaster ground of the title moments, warm from below
 *   EP0.pile(ctx, T, n, o)                 a stack of palm-leaf pages, n leaves high (0..), centred at o.x,
 *                                          its base at o.y; leaves above o.keep drift away when o.trim > 0
 *   EP0.code(ctx, T, x, y, w, h, scroll, a) the series' own drawing code, scrolling in a dark panel
 *                                          (real lines from src/kit/characters/garuda.js and the kit)
 *   EP0.wave(ctx, T, x, y, w, amp, a, env, t)  a gold waveform that follows the voice (the words' times)
 *   EP0.badge(ctx, text, x, y, a)          a small gold-on-lacquer episode badge
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP15 = window.EP15;
  const { TAU, clamp, lerp, hash, PAL } = R;
  const EP0 = (window.EP0 = {});
  EP0.mouth = EP15.mouth;
  EP0.plaque = EP15.plaque;

  EP0.ground = (ctx, T, warm = 1) => {
    KIT.vgrad(ctx, 0, R.H, [[0, '#0b0912'], [0.55, '#17101a'], [0.88, '#24130c'], [1, '#170a05']]);
    KIT.glow(ctx, 540, 1980, 1100, PAL.saffron, 0.24 * warm * KIT.flicker(T, 5), 'lighter', 0.6);
  };

  /** One leaf of the pile: a dried palm leaf, lit from the front and the fire below. */
  function leaf(ctx, x, y, w, h, tilt, seed, a) {
    KIT.manuscript.leaf(ctx, x, y, w, h, 1, { seed, alpha: a, light: 0.6, tilt, ink: 0.9 });
  }
  EP0.pile = (ctx, T, n, o = {}) => {
    const x0 = o.x ?? 540, y0 = o.y ?? 1260, step = o.step ?? 15, w = o.w ?? 640, h = o.h ?? 64;
    const keep = o.keep ?? Infinity, trim = clamp(o.trim || 0);
    const full = Math.floor(n), frac = n - full;
    for (let i = 0; i <= full && i < 400; i++) {
      const a = i === full ? frac : 1;
      if (a <= 0.01) continue;
      const jx = (hash(i, 1) - 0.5) * 34, tilt = (hash(i, 2) - 0.5) * 0.06;
      let x = x0 + jx, y = y0 - i * step, al = a;
      if (i >= keep && trim > 0) {
        // the later additions lift away and fade (the Critical Edition sets them aside)
        const u = clamp(trim * 1.4 - hash(i, 3) * 0.4);
        x += (hash(i, 4) < 0.5 ? -1 : 1) * (500 + 400 * hash(i, 6)) * u; y += 40 * Math.sin(T + i) * u; al *= 1 - u;
      }
      // a leaf arriving falls into place from above
      const drop = i === full ? (1 - frac) * 260 : 0;
      leaf(ctx, x, y - drop, w * (0.92 + 0.08 * hash(i, 5)), h, tilt, i * 7 + 3, al);
    }
  };

  const CODE = [
    "CH.garuda.draw(ctx, {",
    "  x: 560, y: 1700, scale: 0.75,",
    "  facing: 'left',",
    "  pose: { name: 'fly', phase: T * 4 },",
    "  light: { dir: -1.57, front: 0.55 },",
    "});",
    "// an eagle's head: brow, hooked beak",
    "g.moveTo(40, 10);",
    "g.bezierCurveTo(56, -40, 58, -100, 30, -136);",
    "g.bezierCurveTo(-100, -110, -130, -96, -150, -70);",
    "// wings: a fan of long primaries",
    "for (let i = 0; i <= 9; i++) {",
    "  const a = lead + sg * spread * u;",
    "  pts.push({ a, len });",
    "}",
    "rule: { fill: '#3a1806', lit: '#9a5418',",
    "  rim: ['#ffb030', '#fff4c0'], glow: 1.1 }",
    "KIT.ashram.draw(ctx, T, { cycle: 0.76 });",
    "KIT.series.hookCard(ctx, T, 1, line.text);",
    "EP17.ocean(ctx, T, { hz: 1300 });",
  ];
  EP0.code = (ctx, T, x, y, w, h, scroll, a) => {
    if (a <= 0.01) return;
    ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(8,6,10,0.88)'; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = 'rgba(232,190,110,0.5)'; ctx.lineWidth = 2; ctx.strokeRect(x + 6, y + 6, w - 12, h - 12);
    ctx.beginPath(); ctx.rect(x + 10, y + 10, w - 20, h - 20); ctx.clip();
    ctx.font = `500 34px "DejaVu Sans Mono", "Courier New", monospace`;
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    const lh = 44, off = scroll * lh;
    for (let i = 0; i < 40; i++) {
      const yy = y + 50 + i * lh - off;
      if (yy < y - lh || yy > y + h + lh) continue;
      const s = CODE[i % CODE.length];
      ctx.fillStyle = s.trim().startsWith('//') ? '#8a9a7a' : (i % 3 === 0 ? '#f0c878' : '#e8dcc4');
      ctx.fillText(s, x + 28, yy);
    }
    ctx.restore();
  };

  EP0.wave = (ctx, T, x, y, w, amp, a, env, t) => {
    if (a <= 0.01) return;
    const m = EP0.mouth(env, t);
    ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = '#f2c66a'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    KIT.glow(ctx, x + w / 2, y, w * 0.6, '#ffb040', 0.18 * a, 'lighter', 0.4);
    ctx.beginPath();
    for (let i = 0; i <= 120; i++) {
      const u = i / 120, env2 = Math.sin(Math.PI * u);
      const v = (Math.sin(u * 47 + T * 19) * 0.6 + Math.sin(u * 83 - T * 27) * 0.4) * env2 * (0.12 + 0.88 * m);
      const xx = x + u * w, yy = y + v * amp;
      i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy);
    }
    ctx.stroke(); ctx.restore();
  };

  EP0.badge = (ctx, text, x, y, a) => {
    if (a <= 0.01) return;
    ctx.save(); ctx.globalAlpha = a;
    ctx.font = R.font(38, 'display', 600); ctx.letterSpacing = '3px'; ctx.textAlign = 'center';
    const w = ctx.measureText(text).width + 70;
    ctx.fillStyle = 'rgba(30,10,8,0.82)'; ctx.beginPath(); ctx.roundRect(x - w / 2, y - 46, w, 66, 12); ctx.fill();
    ctx.strokeStyle = '#d8a850'; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#f6dc9a'; ctx.fillText(text, x, y); ctx.restore();
  };
  void TAU; void lerp;
})();
