/*
 * Episode 25 · shared pieces (not a scene).
 * LOCATIONS, each with its own light:
 *   EP25.hall(ctx, T, o)    INDRA'S COUNCIL HALL AT NIGHT: gold lamps on tall pillars, arches open on a sky reddened
 *                           by the omens; warm gold from the lamps, red from outside. EP25.lamp(x, y) lights a figure
 *   EP25.yajna(ctx, T, o)   KASHYAPA'S SACRIFICE AT BRIGHT MORNING: pale gold sky, white smoke from the altar, stacked
 *                           firewood; EP25.morning(x, y)
 *   EP25.macro(ctx, T, o)   GROUND LEVEL, MACRO: blades of grass like trees, a cow's hoofprint full of rain-water
 *                           reflecting the sky; o.splash 0..1
 *   EP25.rite(ctx, T, o)    THE VALAKHILYAS' RITE AT NIGHT: a blue-white fire far too big for them, sparks; o.wing 0..1
 *                           lets the flame rise into the shape of a great wing
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT;
  const { TAU, clamp, lerp, hash } = R;
  const EP25 = (window.EP25 = {});
  EP25.mouth = window.EP17.mouth; EP25.plaque = window.EP17.plaque;
  EP25.lamp = (x, y, k = 1.1) => ({ dir: Math.atan2(800 - (y - 600), 540 - x), intensity: k, front: 0.55 });
  EP25.morning = (x, y, k = 1.1) => ({ dir: Math.atan2(200 - (y - 600), 1200 - x), intensity: k, front: 0.55 });

  EP25.hall = (ctx, T, o = {}) => {
    ctx.save();
    const cam = o.cam || {};
    KIT.camera(ctx, { x: 540, y: 1100, zoom: cam.zoom || 1, dx: cam.dx || 0, dy: cam.dy || 0 });
    KIT.vgrad(ctx, -500, R.H + 500, [[0, '#1a0a0a'], [0.5, '#3a1810'], [1, '#120806']], -500, R.W + 500);
    // arches open on the red omen sky
    for (let i = 0; i < 4; i++) { const x = -60 + i * 400; ctx.save(); ctx.beginPath(); ctx.moveTo(x - 130, 1400); ctx.lineTo(x - 130, 700); ctx.quadraticCurveTo(x, 480, x + 130, 700); ctx.lineTo(x + 130, 1400); ctx.closePath(); ctx.clip(); KIT.vgrad(ctx, 400, 1400, [[0, '#2a0a20'], [0.6, '#8a2a1a'], [1, '#e86a30']], x - 130, x + 130); for (let k = 0; k < 4; k++) { const life = (T * 0.6 + hash(i, k)) % 1; ctx.strokeStyle = `rgba(255,220,160,${1 - life})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 100 + life * 200, 520 + life * 300); ctx.lineTo(x - 140 + life * 200, 480 + life * 300); ctx.stroke(); } ctx.restore(); }
    // pillars with gold lamps
    for (let i = 0; i < 5; i++) { const x = -260 + i * 400; ctx.fillStyle = '#2a140c'; ctx.fillRect(x - 60, 520, 120, 1100); ctx.fillStyle = '#c89040'; ctx.fillRect(x - 70, 520, 140, 24); ctx.fillRect(x - 70, 1590, 140, 30); const fl = KIT.flicker(T, i); KIT.glow(ctx, x, 980, 260, '#ffb040', 0.55 * fl); ctx.fillStyle = '#ffe0a0'; ctx.beginPath(); ctx.ellipse(x, 970, 12, 22 * fl, 0, 0, TAU); ctx.fill(); }
    ctx.fillStyle = '#3a1c10'; ctx.fillRect(-500, 1600, R.W + 1000, 900);
    ctx.fillStyle = 'rgba(255,190,90,0.12)'; for (let i = 0; i < 8; i++) ctx.fillRect(-500, 1620 + i * 60, R.W + 1000, 3);
    if (o.after) o.after(ctx);
    ctx.restore();
  };

  EP25.yajna = (ctx, T, o = {}) => {
    ctx.save();
    const cam = o.cam || {};
    KIT.camera(ctx, { x: 540, y: 1100, zoom: cam.zoom || 1, dx: cam.dx || 0, dy: cam.dy || 0 });
    KIT.vgrad(ctx, -500, 1400, [[0, '#a8c8e0'], [0.6, '#f4ecd0'], [1, '#fff4d8']], -500, R.W + 500);
    KIT.glow(ctx, 1200, 300, 700, '#fffae0', 0.7, 'lighter', 0.4);
    KIT.vgrad(ctx, 1400, R.H + 500, [[0, '#d8c090'], [1, '#8a6a40']], -500, R.W + 500);
    // the altar and its white smoke
    ctx.fillStyle = '#b07a50'; ctx.fillRect(160, 1360, 260, 50); ctx.fillRect(190, 1320, 200, 44);
    const fl = KIT.flicker(T, 1); KIT.glow(ctx, 290, 1300, 200, '#ffb050', 0.5 * fl); ctx.fillStyle = '#ffc060'; ctx.beginPath(); ctx.ellipse(290, 1290, 30, 50 * fl, 0, 0, TAU); ctx.fill();
    KIT.smoke.draw(ctx, 290, 1260, T, { h: 900, w: 80, strands: 3, alpha: 0.5, color: '#ffffff', lean: 40, speed: 0.6, seed: 25, curls: 0.6 });
    // stacked firewood
    for (let r = 0; r < 4; r++) for (let i = 0; i < 6 - r; i++) { ctx.fillStyle = (i + r) % 2 ? '#7a4a28' : '#8a5a30'; ctx.beginPath(); ctx.ellipse(-60 + i * 40 + r * 20, 1430 - r * 34, 18, 18, 0, 0, TAU); ctx.fill(); }
    if (o.after) o.after(ctx);
    ctx.restore();
  };

  EP25.macro = (ctx, T, o = {}) => {
    const sp = clamp(o.splash || 0);
    KIT.vgrad(ctx, 0, R.H, [[0, '#b8d8f0'], [0.45, '#e8f0e0'], [1, '#c8b890']]);
    // blades of grass like a forest, blurred behind
    for (let i = 0; i < 40; i++) { const x = hash(i, 1) * 1300 - 100, h = 500 + 600 * hash(i, 2), w = 18 + 20 * hash(i, 3); ctx.fillStyle = i % 3 ? '#6a9a48' : '#4a7a38'; ctx.globalAlpha = 0.85; ctx.beginPath(); ctx.moveTo(x - w, 1300); ctx.quadraticCurveTo(x + Math.sin(T + i) * 20, 1300 - h * 0.6, x + 40 * Math.sin(T * 0.7 + i), 1300 - h); ctx.quadraticCurveTo(x + w * 0.3, 1300 - h * 0.6, x + w, 1300); ctx.fill(); }
    ctx.globalAlpha = 1;
    KIT.vgrad(ctx, 1260, R.H, [[0, '#8a7048'], [1, '#4a3820']]);
    // the hoofprint: two crescent hollows full of water reflecting the sky
    for (const dx of [-170, 170]) { ctx.fillStyle = '#3a2a18'; ctx.beginPath(); ctx.ellipse(540 + dx, 1560, 210, 120, dx < 0 ? 0.25 : -0.25, 0, TAU); ctx.fill(); ctx.save(); ctx.beginPath(); ctx.ellipse(540 + dx, 1560, 186, 100, dx < 0 ? 0.25 : -0.25, 0, TAU); ctx.clip(); KIT.vgrad(ctx, 1450, 1670, [[0, '#d8ecff'], [1, '#88b0d0']], 540 + dx - 200, 540 + dx + 200); ctx.restore(); }
    for (let i = 0; i < 6; i++) { ctx.strokeStyle = `rgba(255,255,255,${0.5 * (0.5 + 0.5 * Math.sin(T * 3 + i)) + sp * 0.4})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(540 + (i % 2 ? 170 : -170), 1560, 40 + i * 25 + sp * 60, 16 + i * 10, 0, 0, TAU); ctx.stroke(); }
    if (o.after) o.after(ctx);
  };

  EP25.rite = (ctx, T, o = {}) => {
    const w = clamp(o.wing || 0);
    KIT.vgrad(ctx, 0, R.H, [[0, '#02040e'], [0.6, '#0a1430'], [1, '#141428']]);
    for (let i = 0; i < 70; i++) { ctx.globalAlpha = 0.5 * hash(i, 1); ctx.fillStyle = '#fff'; ctx.fillRect(hash(i, 2) * R.W, hash(i, 3) * 1300, 2, 2); }
    ctx.globalAlpha = 1;
    const cx = o.x ?? 540, by = o.y ?? 1560, H = (o.h ?? 900) * (0.9 + 0.1 * Math.sin(T * 5));
    KIT.glow(ctx, cx, by - H * 0.4, H, '#a8d8ff', 0.6, 'lighter', 0.4);
    for (const [c, k] of [['#3a6ac8', 1], ['#8ac0ff', 0.75], ['#f0f8ff', 0.45]]) {
      ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(cx - 200 * k, by);
      ctx.quadraticCurveTo(cx - 260 * k, by - H * 0.5 * k, cx - (60 + 500 * w) * k, by - H * k - 200 * w * k);
      ctx.quadraticCurveTo(cx - 40 * k + Math.sin(T * 6) * 20, by - H * 0.5 * k, cx, by - H * 0.9 * k);
      ctx.quadraticCurveTo(cx + 40 * k, by - H * 0.5 * k, cx + (60 + 500 * w) * k, by - H * k - 200 * w * k);
      ctx.quadraticCurveTo(cx + 260 * k, by - H * 0.5 * k, cx + 200 * k, by); ctx.fill();
    }
    ctx.fillStyle = '#6a4a3a'; ctx.fillRect(cx - 220, by, 440, 40);
    for (let i = 0; i < 24; i++) { const life = (T * 0.8 + hash(i, 4)) % 1; ctx.globalAlpha = 1 - life; ctx.fillStyle = '#e0f0ff'; ctx.beginPath(); ctx.arc(cx + (hash(i, 5) - 0.5) * 500, by - life * H * 1.3, 4, 0, TAU); ctx.fill(); }
    ctx.globalAlpha = 1;
    KIT.vgrad(ctx, by + 40, R.H, [[0, '#1a1a2a'], [1, '#05050a']]);
    if (o.after) o.after(ctx);
  };
  void lerp;
})();
