/*
 * Episode 11 · shared pieces (not a scene). Loads after ep05–ep10's _common. Episodes 12–16
 * (the churning) reuse it.
 *
 * LOCATIONS AND LIGHT (each its own key light; characters keep their signature light):
 *   EP11.sea(ctx, T, o)      the cosmic ocean before the churning: a deep night-blue water
 *                            under an indigo sky, a cold silver glow on the horizon, jewels
 *                            glinting in the depths, a sea-monster (makara) surfacing.
 *                            o.milk (0..1) turns it white (episode 13), o.cam, o.after(g),
 *                            o.monster (0..1), o.jewels (0..1). Light: EP11.seaLight.
 *   EP11.meru(ctx, T, o)     Meru, the golden mountain, blazing: a white-gold sky, a stepped
 *                            peak of gold whose light comes from the mountain itself, a
 *                            terrace where the gods sit in council. Light: EP11.meruLight
 *                            (rim toward the peak, strong front light).
 *   EP11.shore(ctx, T, o)    the shore at sunrise (episode 10's EP10.shore) with the horse
 *                            drawn by his own module: o.horse { x, y, scale, pose, rise }.
 *   EP11.surf(ctx, y, T, a, o)   a band of breaking foam that hides what is below the water
 *   EP11.roundel(ctx, x, y, r, a, picture, T, o)
 *                            a VISION as a solid painted medallion in a gold ring, not a faint
 *                            ghost (the fix for episodes 7–10's faint glimpses over the fire).
 *   EP11.makara(ctx, x, y, s, T, a)   a sea-monster: crocodile jaws, an elephant's curling
 *                            trunk, a fish's tail (the mural makara)
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP5 = window.EP5;
  const { TAU, clamp, lerp, hash } = R;
  const EP11 = (window.EP11 = {});
  const hex = EP5.hex;
  EP11.hex = hex; EP11.mouth = EP5.mouth; EP11.label = window.EP7.label;
  /** A name card on a dark lacquer plaque: legible on bright grounds (Meru's gold, the white sea). */
  EP11.plaque = (ctx, text, sub, x, y, a, o = {}) => {
    if (a <= 0.003) return;
    const sz = o.size || 64;
    ctx.save(); ctx.font = R.font(sz, 'display', 600); ctx.letterSpacing = '8px';
    const w = Math.max(ctx.measureText(text.toUpperCase()).width, sub ? 360 : 0) + 120, h = sub ? sz * 2.7 : sz * 1.6;
    ctx.globalAlpha = a * 0.82; ctx.fillStyle = '#140a06'; ctx.beginPath(); R.roundRectPath(ctx, x - w / 2, y - sz * 1.15, w, h, 18); ctx.fill();
    ctx.globalAlpha = a; ctx.strokeStyle = '#e7b54a'; ctx.lineWidth = 2.5; ctx.beginPath(); R.roundRectPath(ctx, x - w / 2 + 8, y - sz * 1.15 + 8, w - 16, h - 16, 12); ctx.stroke();
    ctx.restore();
    window.EP5.label(ctx, text, x, y, a, { size: sz, key: o.key, sheen: o.sheen });
    if (sub) { ctx.save(); ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.font = R.font(sz * 0.6, 'caption', 600, 'italic'); ctx.fillStyle = '#fbf1dc'; ctx.fillText(sub, x, y + sz * 1.08); ctx.restore(); }
  };
  const lightTo = (x, y, lx, ly, k = 1, front = 0.3) => ({ dir: Math.atan2(ly - (y - 600), lx - x), intensity: k, front });
  EP11.PEAK = { x: 540, y: 380 };
  EP11.meruLight = (x, y, k = 1.15) => lightTo(x, y, EP11.PEAK.x, EP11.PEAK.y, k, 0.45);
  EP11.seaLight = (x, y, k = 0.95) => lightTo(x, y, 540, 1050, k, 0.3);
  EP11.fireLight = (x, y) => { const F = KIT.ashram.FIRE; return { dir: Math.atan2(F.y - 250 - (y - 600), F.x - x), intensity: KIT.flicker(0, 0), front: 0.25 }; };

  EP11.surf = (ctx, y, T, a = 1, o = {}) => {
    if (a <= 0.01) return;
    ctx.save(); ctx.globalAlpha = a;
    const col = o.color || '#eef2ff', deep = o.deep || '#3a4a8a';
    const g = ctx.createLinearGradient(0, y - 30, 0, y + 260);
    g.addColorStop(0, deep); g.addColorStop(1, o.deep2 || '#101838');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(-300, R.H + 400);
    for (let x = -300; x <= R.W + 300; x += 30) ctx.lineTo(x, y + Math.sin(x * 0.013 + T * 1.8) * 16 + Math.sin(x * 0.031 - T * 2.6) * 8);
    ctx.lineTo(R.W + 300, R.H + 400); ctx.closePath(); ctx.fill();
    // foam crests: scalloped white along the top, and spray
    ctx.fillStyle = col;
    for (let i = 0; i < 26; i++) {
      const x = -280 + i * 60 + Math.sin(T * 1.2 + i) * 10, yy = y + Math.sin(x * 0.013 + T * 1.8) * 16 - 6;
      ctx.beginPath(); ctx.ellipse(x, yy, 46, 16 + 6 * Math.sin(T * 3 + i * 1.7), 0, Math.PI, TAU); ctx.fill();
    }
    ctx.globalAlpha = a * 0.7;
    for (let i = 0; i < 40; i++) {
      const life = (T * 0.7 + hash(i, 5)) % 1, x = hash(i, 7) * R.W, yy = y - life * 120 * (0.4 + hash(i, 9));
      ctx.beginPath(); ctx.arc(x, yy, (1 - life) * 6 + 1, 0, TAU); ctx.fill();
    }
    ctx.restore();
  };

  EP11.makara = (ctx, x, y, s, T, a = 1) => {
    if (a <= 0.01) return;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(s, s);
    ctx.fillStyle = '#0a1a2a'; ctx.strokeStyle = '#7ad8d0'; ctx.lineWidth = 5; ctx.lineJoin = 'round';
    ctx.beginPath();
    // body arching out of the water, jaws open to the left, an elephant's trunk curling up
    ctx.moveTo(300, 60); ctx.bezierCurveTo(220, -120, 40, -170, -120, -130);
    ctx.quadraticCurveTo(-190, -160, -230, -230 - 20 * Math.sin(T * 2)); ctx.quadraticCurveTo(-270, -260, -250, -200); ctx.quadraticCurveTo(-220, -150, -170, -110);   // trunk
    ctx.lineTo(-300, -80); ctx.lineTo(-180, -70); ctx.lineTo(-300, -30); ctx.lineTo(-150, -30);   // jaws
    ctx.bezierCurveTo(-60, 0, 120, -40, 180, 60); ctx.closePath(); ctx.fill(); ctx.stroke();
    // a fish's tail fin
    ctx.beginPath(); ctx.moveTo(280, 40); ctx.lineTo(420, -60 + 20 * Math.sin(T * 3)); ctx.lineTo(380, 60); ctx.lineTo(430, 150); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#c8fff4'; ctx.beginPath(); ctx.arc(-140, -110, 8, 0, TAU); ctx.fill();
    // scale arcs along the back
    ctx.globalAlpha = a * 0.6;
    for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.arc(-60 + i * 50, -110 + i * 18, 18, Math.PI, TAU); ctx.stroke(); }
    ctx.restore();
  };

  EP11.sea = (ctx, T, o = {}) => {
    ctx.save();
    const cam = o.cam || {};
    KIT.camera(ctx, { x: 540, y: 1000, zoom: cam.zoom || 1, dx: cam.dx || 0, dy: cam.dy || 0 });
    const hz = o.hz ?? 980, milk = clamp(o.milk || 0);
    KIT.vgrad(ctx, -500, hz, [[0, '#04061a'], [0.55, hex('#141a4a', '#2a3a7a', milk)], [0.9, hex('#4a5a9a', '#c8d0f0', milk)], [1, hex('#b8c4e8', '#ffffff', milk)]], -400, R.W + 400);
    // stars
    ctx.fillStyle = '#e8eeff';
    for (let i = 0; i < 90; i++) { const x = hash(i, 1) * 1500 - 210, y = -400 + hash(i, 2) * (hz + 200); ctx.globalAlpha = 0.25 + 0.5 * Math.abs(Math.sin(T * 0.8 + i)); ctx.beginPath(); ctx.arc(x, y, 1 + hash(i, 3) * 2.2, 0, TAU); ctx.fill(); }
    ctx.globalAlpha = 1;
    KIT.glow(ctx, 540, hz, 900, hex('#9ab0ff', '#ffffff', milk), 0.45);
    // the water: bands of deep blue (or milk), rolling swells
    KIT.vgrad(ctx, hz, R.H + 500, [[0, hex('#4a5aa0', '#f4f2ff', milk)], [0.2, hex('#1e2a6a', '#d8d8f0', milk)], [1, hex('#060a24', '#8a8ab0', milk)]], -400, R.W + 400);
    ctx.strokeStyle = hex('#8aa0e8', '#ffffff', milk); ctx.lineWidth = 3;
    for (let i = 0; i < 18; i++) {
      const y = hz + 14 + Math.pow(i / 17, 1.6) * 900, w = 80 + i * 16;
      ctx.globalAlpha = 0.25 + 0.5 * (i / 17);
      for (let j = 0; j < 5; j++) { const x = ((j * 300 + i * 97 + T * (12 + i * 2)) % 1700) - 300; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + w * 0.5, y - 6 - i * 0.6, x + w, y); ctx.stroke(); }
    }
    ctx.globalAlpha = 1;
    // jewels glinting in the depths
    const jw = o.jewels ?? 1;
    if (jw > 0.01) for (let i = 0; i < 26; i++) {
      const x = hash(i, 11) * R.W, y = hz + 180 + hash(i, 12) * 800, tw = 0.5 + 0.5 * Math.sin(T * 2.2 + i * 1.9);
      KIT.glow(ctx, x, y, 40 + 30 * tw, ['#ff6a8a', '#6affd8', '#ffe46a', '#8ab0ff'][i % 4], 0.5 * tw * jw);
    }
    if (o.monster) EP11.makara(ctx, o.monsterX ?? 760, (o.monsterY ?? 1350) + (1 - clamp(o.monster)) * 220, o.monsterS ?? 0.9, T, clamp(o.monster * 1.6));
    if (o.after) o.after(ctx);
    ctx.restore();
  };

  EP11.meru = (ctx, T, o = {}) => {
    ctx.save();
    const cam = o.cam || {};
    KIT.camera(ctx, { x: 540, y: 1000, zoom: cam.zoom || 1, dx: cam.dx || 0, dy: cam.dy || 0 });
    const P = EP11.PEAK;
    KIT.vgrad(ctx, -500, R.H + 400, [[0, '#fff6d8'], [0.35, '#ffd890'], [0.7, '#e89a50'], [1, '#6a3a20']], -400, R.W + 400);
    // radiance from the peak
    ctx.save(); ctx.translate(P.x, P.y); ctx.globalAlpha = 0.22;
    for (let i = 0; i < 24; i++) { ctx.rotate(TAU / 24); ctx.fillStyle = i % 2 ? '#ffffff' : '#ffe8a0'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(1600, -90); ctx.lineTo(1600, 90); ctx.closePath(); ctx.fill(); }
    ctx.restore();
    KIT.glow(ctx, P.x, P.y, 800, '#fffbe8', 0.9);
    // far golden ranges
    for (let l = 0; l < 3; l++) {
      ctx.fillStyle = ['#f0b860', '#d8903a', '#b06a24'][l];
      ctx.beginPath(); ctx.moveTo(-400, 1300);
      for (let x = -400; x <= R.W + 400; x += 50) ctx.lineTo(x, 1000 + l * 120 - 160 * Math.abs(Math.sin(x * 0.005 + l * 1.7)) - 60 * Math.abs(Math.sin(x * 0.017 + l)));
      ctx.lineTo(R.W + 400, R.H + 400); ctx.lineTo(-400, R.H + 400); ctx.closePath(); ctx.fill();
    }
    // the stepped golden peak (a temple-mountain), its terraces catching light
    const tiers = 7;
    for (let i = 0; i < tiers; i++) {
      const u = i / (tiers - 1), w = lerp(820, 120, u), y = lerp(1420, P.y + 60, u), h = (1420 - (P.y + 60)) / (tiers - 1);
      const g = ctx.createLinearGradient(P.x - w / 2, 0, P.x + w / 2, 0);
      g.addColorStop(0, '#c8802a'); g.addColorStop(0.45, '#ffe08a'); g.addColorStop(0.55, '#fff4c8'); g.addColorStop(1, '#b8701e');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(P.x - w / 2, y); ctx.lineTo(P.x - w / 2 + 30, y - h); ctx.lineTo(P.x + w / 2 - 30, y - h); ctx.lineTo(P.x + w / 2, y); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(120,60,10,0.35)'; ctx.fillRect(P.x - w / 2, y - 10, w, 10);
    }
    ctx.fillStyle = '#fffbe8'; ctx.beginPath(); ctx.moveTo(P.x - 60, P.y + 60); ctx.lineTo(P.x, P.y - 60); ctx.lineTo(P.x + 60, P.y + 60); ctx.closePath(); ctx.fill();
    // the council terrace in front (where the figures stand)
    KIT.vgrad(ctx, 1480, R.H + 400, [[0, '#e8b060'], [0.25, '#a8682a'], [1, '#3a1e0e']], -400, R.W + 400);
    ctx.strokeStyle = 'rgba(255,240,200,0.6)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-400, 1482); ctx.lineTo(R.W + 400, 1482); ctx.stroke();
    // drifting gold motes
    KIT.embers(ctx, T, { x: 540, y: 1500, spread: 1200, rate: 8, life: 4, rise: 300, sway: 40, size: 2.2, alpha: 0.6, seed: 1101 });
    if (o.after) o.after(ctx);
    ctx.restore();
  };

  EP11.shore = (ctx, T, o = {}) => {
    window.EP10.shore(ctx, T, {
      cam: o.cam,
      after: (g) => {
        const h = o.horse;
        if (h) {
          KIT.characters.horse.draw(g, { x: h.x ?? 560, y: h.y ?? 1180, scale: h.scale ?? 0.5, facing: h.facing || 'left', pose: h.pose || 'stand', light: { dir: Math.atan2(1080 - (h.y ?? 1180) + 400, 820 - (h.x ?? 560)), intensity: 0.95, front: 0.35 }, t: T, key: 'shore-horse' });
          if (h.rise != null && h.rise < 1) EP11.surf(g, (h.y ?? 1180) - (1 - h.rise) * 300 * (h.scale ?? 0.5) * 2, T, 1, { color: '#fff4ec', deep: '#d8b0b8', deep2: '#7a6a90' });
        }
        if (o.after) o.after(g);
      },
    });
  };

  EP11.roundel = (ctx, x, y, r, a, picture, T, o = {}) => {
    if (a <= 0.003) return;
    const s = 0.85 + 0.15 * clamp(a * 1.4);
    const b = R.buffer(o.key || 'ep11-roundel', 2 * r, 2 * r);
    b.clear('#0b0806');
    const g = b.ctx;
    const [fx, fy] = o.focus || [540, 960], z = o.zoom || 0.6;
    g.save(); g.translate(r, r); g.scale(z, z); g.translate(-fx, -fy);
    try { picture(g, T); } catch (e) { R.errors.push(`roundel: ${e && e.stack || e}`); }
    g.restore(); R.resetCtx(g);
    ctx.save(); ctx.globalAlpha = clamp(a * 1.3);
    KIT.glow(ctx, x, y, r * 2.4, o.glow || '#ffd890', 0.5);
    ctx.translate(x, y); ctx.scale(s, s);
    ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.save(); ctx.clip();
    ctx.drawImage(b.canvas, -r, -r, 2 * r, 2 * r);
    const vg = ctx.createRadialGradient(0, 0, r * 0.55, 0, 0, r);
    vg.addColorStop(0, 'rgba(10,6,4,0)'); vg.addColorStop(1, 'rgba(10,6,4,0.55)');
    ctx.fillStyle = vg; ctx.fillRect(-r, -r, 2 * r, 2 * r);
    ctx.restore();
    // the gold ring: a double rim with lotus beads
    ctx.strokeStyle = '#e7b54a'; ctx.lineWidth = 9; ctx.shadowColor = '#ffb040'; ctx.shadowBlur = R.px(14);
    ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.stroke();
    ctx.shadowBlur = 0; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(0, 0, r + 16, 0, TAU); ctx.stroke();
    ctx.fillStyle = '#ffe9a8';
    for (let i = 0; i < 24; i++) { const an = (i / 24) * TAU; ctx.beginPath(); ctx.arc(Math.cos(an) * (r + 8), Math.sin(an) * (r + 8), 4, 0, TAU); ctx.fill(); }
    ctx.restore();
  };
})();
