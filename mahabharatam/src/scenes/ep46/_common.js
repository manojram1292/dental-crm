/* Episodes 46–48 · shared (not a scene). Loads after ep41/_common.
 *   EP46.hall(ctx, T, cam, o)   JANAMEJAYA'S SACRIFICIAL HALL while the rite is in session: receding painted pillars, the
 *                               fire high and to one side, ranks of seated priests and kings as dark shapes with a warm rim.
 *                               o = { pal ('satra-teal-night' | 'arrival-umber-gold' | 'seat-ivory'), fx, fire, fs, crowd
 *                               (0..1), figs(g, pal, fl), back(g, pal), front(g, pal) }
 *   EP46.lit(x, fl, front, fx)  the hall fire's light on a figure
 *   EP46.arcCard(ctx, T, a, S)  the ARC-END CARD: a lacquer cartouche with a flame border (words from the script strings) */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, ST = KIT.stage, CH = KIT.characters, EP41 = window.EP41;
  const { TAU, clamp, lerp, hash } = R;
  const GY = EP41.GY;
  const EP46 = (window.EP46 = {});
  EP46.lit = (x, fl = 1, front = 0.45, fx = 250) => ({ dir: Math.atan2(130, fx - x), intensity: 1.25 * fl, front, fill: 0.16, wrap: 0.5, tint: ['#ffb050', 0.5], bounce: ['#2a6a80', 0.3], minLum: 0 });
  EP46.hall = (ctx, T, cam, o = {}) => {
    const fl = KIT.flicker(T, 9), FX = o.fx ?? 250, fs = o.fs ?? 1.25, k = o.fire ?? 1.1, crowd = o.crowd ?? 1;
    ST.shot(ctx, T, { pal: o.pal || 'satra-teal-night', cam, layers: [
      { z: 0, draw: (g, p) => { ST.sky(g, p, { hz: 1500 }); g.fillStyle = KIT.hex(p.sky[0], '#000000', 0.45); g.fillRect(-900, -1200, 2880, 700); } },   // the roof's dark
      { z: 0.35, draw: (g, p) => { ST.pillars(g, p, { y: 1380, n: 5 }); if (o.back) o.back(g, p); } },
      { z: 0.6, haze: false, draw: (g) => { KIT.glow(g, FX, GY - 520 * fs / 1.25, 1000 * fs / 1.25, '#ff7a1e', (o.glow ?? 0.42) * fl * Math.min(1, k)); } },
      { z: 0.7, draw: (g, p) => { if (crowd <= 0) return;   // the far ranks: seated shapes
        for (let r = 0; r < 2; r++) for (let i = 0; i < 9; i++) { const x = -60 + i * 150 + r * 70, y = 1250 + r * 70; if (Math.abs(x - FX) < 170 || hash(i, r + 5) > crowd) continue; g.fillStyle = KIT.hex(p.near, '#000000', 0.35); g.beginPath(); g.ellipse(x, y - 60, 52, 66, 0, 0, TAU); g.fill(); g.beginPath(); g.arc(x, y - 150, 30, 0, TAU); g.fill(); g.strokeStyle = 'rgba(255,170,80,0.5)'; g.lineWidth = 3; g.beginPath(); g.arc(x, y - 150, 30, x < FX ? -1.2 : 1.9, x < FX ? 0.4 : 3.6); g.stroke(); } } },
      { z: 0.8, haze: false, draw: (g) => CH.hearthfire.draw(g, { x: FX, y: GY - 10, scale: fs, t: T, k, key: o.key || 'hall' }) },
      { z: 1, haze: false, draw: (g, p) => { ST.ground(g, p, { y: GY - 20 });
        g.save(); g.globalCompositeOperation = 'lighter'; g.translate(FX, GY + 50); g.scale(1, 0.2); KIT.glow(g, 0, 0, 800 * fs / 1.25, '#ff8a2a', (o.glow ?? 0.42) * 1.2 * fl * Math.min(1, k)); g.restore();
        if (o.figs) o.figs(g, p, fl); } },
      { z: 1.4, haze: false, draw: (g) => ST.particles(g, T, { kind: 'ember', count: 36, box: [FX - 320, 100, 640, 1150], cam }) },
      { z: 2.0, haze: false, soft: 0.35, draw: (g, p) => { if (o.front) return o.front(g, p);   // near: the backs of two seated listeners, dark
        for (const x of [60, 1040]) { g.fillStyle = '#06080a'; g.beginPath(); g.ellipse(x, 1900, 210, 250, 0, 0, TAU); g.fill(); g.beginPath(); g.arc(x, 1590, 96, 0, TAU); g.fill(); } } },
    ] });
    return fl;
  };
  EP46.arcCard = (ctx, T, a, S) => {
    if (a <= 0.003) return;
    const cx = KIT.CX, y = 760, w = 820, h = 470;
    ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(26,8,4,0.92)'; ctx.beginPath(); ctx.roundRect(cx - w / 2, y - h / 2, w, h, 60); ctx.fill();
    ctx.strokeStyle = 'rgba(255,170,70,0.95)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.roundRect(cx - w / 2 + 14, y - h / 2 + 14, w - 28, h - 28, 48); ctx.stroke();
    for (let i = 0; i < 44; i++) { const u = i / 44, per = 2 * (w - 60) + 2 * (h - 60), d = u * per; let px, py;   // a border of small flames
      if (d < w - 60) { px = cx - w / 2 + 30 + d; py = y - h / 2 + 14; } else if (d < w - 60 + h - 60) { px = cx + w / 2 - 14; py = y - h / 2 + 30 + (d - (w - 60)); } else if (d < 2 * (w - 60) + h - 60) { px = cx + w / 2 - 30 - (d - (w - 60) - (h - 60)); py = y + h / 2 - 14; } else { px = cx - w / 2 + 14; py = y + h / 2 - 30 - (d - 2 * (w - 60) - (h - 60)); }
      const fh = 20 + 8 * Math.sin(T * 5 + i); ctx.fillStyle = i % 2 ? '#ffd070' : '#ff8a2a'; ctx.beginPath(); ctx.moveTo(px - 8, py + 6); ctx.quadraticCurveTo(px - 9, py - fh * 0.4, px, py - fh); ctx.quadraticCurveTo(px + 9, py - fh * 0.4, px + 8, py + 6); ctx.closePath(); ctx.fill(); }
    ctx.restore();
    KIT.goldText(ctx, (S.arcLabel || '').toUpperCase(), cx, y - 120, { size: 36, spacing: 6, weight: 600, alpha: a, glow: 0.1, key: 'arc46-l' });
    KIT.goldText(ctx, (S.arcTitle || '').toUpperCase(), cx, y + 10, { size: 96, spacing: 8, weight: 700, alpha: a, glow: 0.35, key: 'arc46-t' });
    ctx.save(); ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.fillStyle = '#fff0e0'; ctx.font = R.font(44, 'caption', 600); ctx.fillText(S.arcRange || '', cx, y + 90); ctx.font = R.font(32, 'caption', 600, 'italic'); ctx.fillStyle = '#ffe0a0'; ctx.fillText(S.arcPlaylist || '', cx, y + 150); ctx.restore();
  };
})();
