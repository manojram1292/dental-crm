/*
 * Episode 29 · shared pieces (not a scene). Loads after ep13/_common (EP13.storm), ep15/_common (EP15.potGlow).
 * LOCATIONS, each with its own light:
 *   EP29.silver(ctx, T, o)   A SILVER NOON AMONG HIGH CLOUDS: pale silver-blue, towers of white cloud, light from straight above
 *   EP29.rainbow(ctx, T, o)  THE SKY AFTER THE STORM: torn slate clouds parting on clear blue, a painted rainbow arc, a
 *                            washed golden light from the low right; EP29.clear(x, y)
 * PROPS:
 *   EP29.feather(ctx, x, y, s, rot, T, a)   a single great gold feather with a dark eye-bar and a glowing rim
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT;
  const { TAU, clamp, lerp, hash } = R;
  const EP29 = (window.EP29 = {});
  EP29.mouth = window.EP17.mouth; EP29.plaque = window.EP17.plaque;
  EP29.clear = (x, y, k = 1.15) => ({ dir: Math.atan2(1200 - (y - 600), 1300 - x), intensity: k, front: 0.6 });

  EP29.silver = (ctx, T, o = {}) => {
    KIT.vgrad(ctx, 0, R.H, [[0, '#9ab0d0'], [0.5, '#dce6f2'], [1, '#b8c4d8']]);
    KIT.glow(ctx, 540, -200, 1200, '#ffffff', 0.6, 'lighter', 0.4);
    for (let i = 0; i < 9; i++) { const x = hash(i, 1) * 1400 - 160, h = 500 + 600 * hash(i, 2), y = 1500 + hash(i, 3) * 600; ctx.fillStyle = i % 2 ? '#f4f8ff' : '#e4ecf8'; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(x + (k - 1.5) * 90, y - k * h / 4, 170 - k * 25, 0, TAU); ctx.fill(); } }
    if (o.after) o.after(ctx);
  };

  EP29.rainbow = (ctx, T, o = {}) => {
    ctx.save();
    const cam = o.cam || {};
    KIT.camera(ctx, { x: 540, y: 1000, zoom: cam.zoom || 1, dx: cam.dx || 0, dy: cam.dy || 0 });
    KIT.vgrad(ctx, -600, R.H + 600, [[0, '#3a6ab8'], [0.55, '#8ac0f0'], [1, '#f0e0c0']], -500, R.W + 500);
    KIT.glow(ctx, 1300, 1300, 900, '#ffd890', 0.5, 'lighter', 0.4);
    const cols = ['#e05050', '#f09040', '#f0d050', '#70c060', '#5090e0', '#8060c0'];
    ctx.save(); ctx.globalAlpha = 0.45 * (o.bow ?? 1); cols.forEach((c, i) => { ctx.strokeStyle = c; ctx.lineWidth = 30; ctx.beginPath(); ctx.arc(540, 1900, 1100 - i * 30, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke(); }); ctx.restore();
    for (let i = 0; i < 8; i++) { const x = hash(i, 4) * 1600 - 260, y = (i % 2 ? -100 : 1700) + hash(i, 5) * 200; ctx.fillStyle = 'rgba(70,80,110,0.85)'; ctx.beginPath(); ctx.ellipse(x + Math.sin(T * 0.3 + i) * 20, y, 420, 150, 0, 0, TAU); ctx.fill(); }
    if (o.after) o.after(ctx);
    ctx.restore();
  };

  EP29.feather = (ctx, x, y, s, rot, T, a = 1) => {
    if (a <= 0.01) return;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    KIT.glow(ctx, 0, 0, 420, '#ffd070', 0.5);
    ctx.fillStyle = '#e8a030';
    ctx.beginPath(); ctx.moveTo(0, -400); ctx.bezierCurveTo(130, -300, 140, 100, 20, 380); ctx.lineTo(-20, 380); ctx.bezierCurveTo(-140, 100, -130, -300, 0, -400); ctx.fill();
    ctx.fillStyle = '#ffd98a'; ctx.beginPath(); ctx.moveTo(0, -380); ctx.bezierCurveTo(80, -280, 80, 60, 6, 340); ctx.lineTo(0, 340); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#7a3a10'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(0, -400); ctx.lineTo(0, 470); ctx.stroke();
    ctx.lineWidth = 3; for (let i = 0; i < 14; i++) { const yy = -320 + i * 48; ctx.beginPath(); ctx.moveTo(0, yy); ctx.lineTo(-110 + Math.abs(i - 7) * 6, yy + 40); ctx.moveTo(0, yy); ctx.lineTo(110 - Math.abs(i - 7) * 6, yy + 40); ctx.stroke(); }
    ctx.fillStyle = '#3a1404'; ctx.beginPath(); ctx.ellipse(0, -200, 40, 60, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#ffe8a0'; ctx.beginPath(); ctx.ellipse(0, -200, 16, 26, 0, 0, TAU); ctx.fill();
    ctx.restore();
  };
  void clamp; void lerp;
})();
