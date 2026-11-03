/*
 * KIT.manuscript · palm-leaf (ola) manuscript pages.
 *
 *   KIT.manuscript.leaf(ctx, cx, cy, w, h, open, o)
 *     a single dried palm leaf, centred on (cx, cy), unrolling from its middle
 *     outward (open 0..1) with a roll at each moving edge.
 *     o = { seed, alpha, light (0..1 warm rim from below), tilt (rad), ink (0..1) }
 *   Leaves carry rows of incised, ink-darkened marks that suggest old script
 *   without being readable text (all words in the film come from the script file).
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT;
  const { TAU, clamp, lerp, hash } = R;

  function leafPath(g, x0, y0, w, h) {
    const r = h * 0.5;
    g.moveTo(x0 + r, y0);
    g.lineTo(x0 + w - r, y0);
    g.quadraticCurveTo(x0 + w + r * 0.2, y0 + h * 0.5, x0 + w - r, y0 + h);
    g.lineTo(x0 + r, y0 + h);
    g.quadraticCurveTo(x0 - r * 0.2, y0 + h * 0.5, x0 + r, y0);
    g.closePath();
  }

  function leaf(ctx, cx, cy, w, h, open, o = {}) {
    const a = o.alpha ?? 1;
    if (a <= 0.003 || open <= 0.001) return;
    const seed = o.seed || 0;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(cx, cy);
    if (o.tilt) ctx.rotate(o.tilt);
    const vw = w * clamp(open);
    // soft shadow under the leaf
    ctx.save();
    ctx.globalAlpha = a * 0.45;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.filter = R.blur(8);
    ctx.fillRect(-vw / 2 + 6, -h / 2 + 10, vw - 12, h);
    ctx.restore();
    // reveal window
    ctx.save();
    ctx.beginPath(); ctx.rect(-vw / 2, -h, vw, h * 2); ctx.clip();
    ctx.beginPath(); leafPath(ctx, -w / 2, -h / 2, w, h);
    const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
    g.addColorStop(0, '#ead29a'); g.addColorStop(0.45, '#d7b678'); g.addColorStop(1, '#a87d43');
    ctx.fillStyle = g; ctx.fill();
    // browned ends and age spots
    const eg = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
    eg.addColorStop(0, 'rgba(110,64,26,0.55)'); eg.addColorStop(0.12, 'rgba(110,64,26,0)'); eg.addColorStop(0.88, 'rgba(110,64,26,0)'); eg.addColorStop(1, 'rgba(110,64,26,0.55)');
    ctx.fillStyle = eg; ctx.fill();
    ctx.fillStyle = 'rgba(120,80,40,0.18)';
    for (let k = 0; k < 7; k++) { ctx.beginPath(); ctx.ellipse((hash(k, seed + 1) - 0.5) * w * 0.9, (hash(k, seed + 2) - 0.5) * h * 0.6, 6 + hash(k, seed + 3) * 22, 3 + hash(k, seed + 4) * 6, 0, 0, TAU); ctx.fill(); }
    // fibres
    ctx.strokeStyle = 'rgba(120,84,40,0.28)'; ctx.lineWidth = 1;
    for (const f of [-0.3, -0.05, 0.22, 0.38]) { ctx.beginPath(); ctx.moveTo(-w / 2 + h * 0.4, f * h); ctx.lineTo(w / 2 - h * 0.4, f * h + 1); ctx.stroke(); }
    // incised, ink-darkened marks (suggesting old script; not text)
    const ink = o.ink ?? 1;
    if (ink > 0) {
      ctx.strokeStyle = `rgba(52,30,14,${(0.72 * ink).toFixed(3)})`; ctx.lineWidth = 1.7; ctx.lineCap = 'round';
      const rows = 3, x0 = -w / 2 + h * 0.9, x1 = w / 2 - h * 0.9;
      for (let r = 0; r < rows; r++) {
        const y = lerp(-h * 0.26, h * 0.26, r / (rows - 1));
        ctx.beginPath();
        let x = x0 + hash(r, seed + 9) * 10;
        let k = 0;
        while (x < x1) {
          const hole = Math.abs(Math.abs(x) - w * 0.3) < 18;
          const gw = 9 + hash(k + r * 97, seed + 5) * 9;
          if (!hole) {
            const t = Math.floor(hash(k + r * 131, seed + 6) * 5);
            const s = 5.5;
            if (t === 0) { ctx.moveTo(x, y + s); ctx.quadraticCurveTo(x + gw * 0.5, y - s * 1.6, x + gw, y + s); }
            else if (t === 1) { ctx.moveTo(x + gw * 0.5 + s, y); ctx.arc(x + gw * 0.5, y, s, 0, TAU * 0.85); }
            else if (t === 2) { ctx.moveTo(x, y - s); ctx.lineTo(x + gw, y - s); ctx.moveTo(x + gw * 0.5, y - s); ctx.quadraticCurveTo(x + gw, y + s, x + gw * 0.2, y + s); }
            else if (t === 3) { ctx.moveTo(x, y); ctx.bezierCurveTo(x + gw * 0.3, y - s * 1.5, x + gw * 0.7, y + s * 1.5, x + gw, y); }
            else { ctx.moveTo(x + 2, y + s); ctx.lineTo(x + 2, y - s * 0.6); ctx.quadraticCurveTo(x + gw * 0.6, y - s * 1.6, x + gw, y - s * 0.2); }
            if (hash(k, seed + 7) < 0.25) { x += gw + 10; k++; continue; }   // word gap
          }
          x += gw + 3; k++;
        }
        ctx.stroke();
      }
    }
    // binding holes
    for (const hx of [-w * 0.3, w * 0.3]) {
      ctx.fillStyle = 'rgba(40,22,10,0.9)';
      ctx.beginPath(); ctx.arc(hx, 0, 5.5, 0, TAU); ctx.fill();
    }
    // warm rim (lit from the fire below)
    if (o.light) {
      ctx.strokeStyle = `rgba(255,208,130,${(0.7 * o.light).toFixed(3)})`; ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.moveTo(-w / 2 + h * 0.5, h / 2 - 1); ctx.lineTo(w / 2 - h * 0.5, h / 2 - 1); ctx.stroke();
    }
    ctx.restore();
    // the rolls at the moving edges
    if (open < 0.999) {
      for (const sd of [-1, 1]) {
        const ex = sd * vw / 2;
        const rw = lerp(26, 10, open);
        const rg = ctx.createLinearGradient(ex - rw / 2, 0, ex + rw / 2, 0);
        rg.addColorStop(0, '#8a6232'); rg.addColorStop(0.5, '#e6cc90'); rg.addColorStop(1, '#7a5428');
        ctx.fillStyle = rg;
        ctx.beginPath(); R.roundRectPath(ctx, ex - rw / 2, -h / 2 - 4, rw, h + 8, rw / 2); ctx.fill();
      }
    }
    ctx.restore();
  }

  KIT.manuscript = { leaf };
})();
