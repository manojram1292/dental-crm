/*
 * Episode 40 · shared pieces (not a scene): the ARC FINALE. Loads after ep31/_common (EPA), ep37/_common (EP37.blaze),
 * ep38/_common (EP38.noonSatra), ep39/_common (EP39.rings).
 * NEW LIGHTS:
 *   EP40.embers(ctx, T, o)    THE ENCLOSURE AFTER THE FIRE: the flames down to a bed of embers, thin grey smoke, a cool
 *                             blue dusk over the posts (the first cool light at the sacrifice in the series); o.k (0..1:
 *                             from blaze to embers), o.night (0..1), o.cam, o.after(g)
 *   EP40.goldHall(ctx, T, o)  VASUKI'S HALL AT FULL GOLD DAWN: the hall's dawn mood flooded warm gold from above, the
 *                             brightest it has been; o.cam, o.after(g)
 * CARD:
 *   EP40.arcCard(ctx, T, a, S)   the ARC-END CARD: a lapis cartouche with a serpent border: THE END OF AN ARC · ASTIKA ·
 *                             Episodes 31–40 · the playlist line (words from the script strings)
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP8 = window.EP8;
  const { TAU, clamp, lerp, hash } = R;
  const EP40 = (window.EP40 = {});
  EP40.duskLit = (x, y, k = 1.1) => ({ dir: Math.atan2(1450 - (y - 500), 540 - x), intensity: k, front: 0.65, fill: 0.5 });
  EP40.goldLit = (x, y, k = 1.2) => ({ dir: -Math.PI / 2 - 0.2, intensity: k, front: 0.8, fill: 0.55 });

  EP40.embers = (ctx, T, o = {}) => {
    const k = clamp(o.k ?? 1), n = clamp(o.night || 0);
    EP8.satra(ctx, T, { fire: lerp(1.2, 0.12, k), cam: o.cam, after: (g) => {
      g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = R.mix('#ffffff', n > 0.5 ? '#6a7aa8' : '#8a9ac8', k); g.fillRect(-600, -900, R.W + 1200, R.H + 1800); g.restore();
      const F = EP8.FIRE;
      for (let i = 0; i < 26; i++) { const x = F.x + (hash(i, 1) - 0.5) * 360, y = F.y - 10 + (hash(i, 2) - 0.5) * 40; g.globalAlpha = k * (0.5 + 0.5 * Math.sin(T * 2 + i)); g.fillStyle = i % 3 ? '#ff6a2a' : '#ffd070'; g.beginPath(); g.arc(x, y, 5 + 4 * hash(i, 3), 0, TAU); g.fill(); }
      g.globalAlpha = 1; KIT.glow(g, F.x, F.y, 320, '#ff5020', 0.45 * k);
      for (let i = 0; i < 5; i++) { const u = (T * 0.08 + i / 5) % 1; g.globalAlpha = 0.25 * k * (1 - u); g.fillStyle = '#9a9aa8'; g.beginPath(); g.ellipse(F.x + Math.sin(T * 0.4 + i) * 60 * u, F.y - 100 - u * 900, 60 + 160 * u, 40 + 80 * u, 0, 0, TAU); g.fill(); }
      g.globalAlpha = 1;
      if (o.after) o.after(g);
    } });
  };

  EP40.goldHall = (ctx, T, o = {}) => {
    EPA.hall(ctx, T, { mood: 'gold', cam: o.cam, after: (g) => {
      g.save(); g.globalCompositeOperation = 'screen'; g.fillStyle = '#5a3a10'; g.globalAlpha = 0.7; g.fillRect(-600, -900, R.W + 1200, R.H + 1800); g.restore();
      g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.16; g.fillStyle = '#ffe0a0';
      for (let i = 0; i < 4; i++) { const x = 200 + i * 230; g.beginPath(); g.moveTo(x, -800); g.lineTo(x + 90, -800); g.lineTo(x + 260, R.H + 400); g.lineTo(x + 80, R.H + 400); g.closePath(); g.fill(); }
      g.restore();
      if (o.after) o.after(g);
    } });
  };

  EP40.arcCard = (ctx, T, a, S) => {
    if (a <= 0.003) return;
    const cx = KIT.CX, y = 760, w = 820, h = 470;
    ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(10,6,28,0.9)'; ctx.beginPath(); ctx.roundRect(cx - w / 2, y - h / 2, w, h, 60); ctx.fill();
    ctx.strokeStyle = 'rgba(170,150,255,0.95)'; ctx.lineWidth = 10; ctx.setLineDash([30, 12]); ctx.lineDashOffset = -T * 40;
    ctx.beginPath(); ctx.roundRect(cx - w / 2 + 14, y - h / 2 + 14, w - 28, h - 28, 48); ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
    KIT.goldText(ctx, (S.arcLabel || '').toUpperCase(), cx, y - 120, { size: 36, spacing: 6, weight: 600, alpha: a, glow: 0.1, key: 'arc-l' });
    KIT.goldText(ctx, (S.arcTitle || '').toUpperCase(), cx, y + 10, { size: 104, spacing: 10, weight: 700, alpha: a, glow: 0.35, key: 'arc-t' });
    ctx.save(); ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.fillStyle = '#f4ecff'; ctx.font = R.font(44, 'caption', 600); ctx.fillText(S.arcRange || '', cx, y + 90); ctx.font = R.font(36, 'caption', 600, 'italic'); ctx.fillStyle = '#ffe0a0'; ctx.fillText(S.arcPlaylist || '', cx, y + 150); ctx.restore();
  };
})();
