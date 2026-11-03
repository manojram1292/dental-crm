/*
 * Ep 2 · line "lakes" · "With their blood, he filled five great lakes."
 *
 * Seen from above, the land laid out like a temple mandala: an outer square
 * with four T-shaped gates (bhupura), a ring of lotus petals, and the five
 * lakes in a quincunx. They fill one after another with a deep, glowing red
 * (from "filled", beats[0], to "lakes", beats[2]), ripples spreading. The
 * camera turns slowly and rises. Restrained: colour and light, nothing more.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP2 = window.EP2;
  const { TAU, clamp, lerp, E, PAL } = R;

  /** Draw the mandala ground in plan coordinates (0..1000). fill[i] = 0..1 per lake, redness 0..1. */
  function mandala(ctx, T, fills, o = {}) {
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
  }

  R.scene({
    id: 'lakes',
    fadeIn: 0.4,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur, 0, 1.3);
      const [b0, b1, b2] = env.beats.length >= 3 ? env.beats : [dur * 0.4, dur * 0.55, dur * 0.75];
      // the lakes fill in turn: centre first on "filled", the four quarters by "lakes"
      const order = [0, 1, 2, 3, 4];
      const fills = order.map((i) => {
        const s = i === 0 ? b0 - 0.25 : lerp(b0, b2, (i - 1) / 4) - 0.1;
        return E.inOutSine(clamp((t - s) / 0.9));
      });
      ctx.save();
      ctx.fillStyle = '#1e120a'; ctx.fillRect(0, 0, R.W, R.H);
      ctx.translate(540, 860);
      ctx.rotate(-0.12 + 0.1 * E.inOutSine(p));
      const sc = lerp(1.25, 1.0, E.inOutSine(p)) * 0.96;
      ctx.scale(sc, sc);
      ctx.translate(-500, -500);
      mandala(ctx, T, fills, { red: 1 });
      ctx.restore();
      // the whole field breathes red on "lakes"
      const k = clamp((t - b2) / 0.4) * (1 - 0.5 * clamp((t - b2 - 0.6) / 1.5));
      KIT.glow(ctx, 540, 860, 900, '#c0141c', 0.25 * k);
      void b1;
    },
    post: () => ({ bloom: 0.45, vignette: 0.62, paper: 0.36 }),
  });
  window.EP2.mandala = mandala;
})();
