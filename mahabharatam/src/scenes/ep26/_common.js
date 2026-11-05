/*
 * Episode 26 · shared pieces (not a scene). Episodes 27–30 load it too.
 * LOCATIONS, each with its own light:
 *   EP26.court(ctx, T, o)   HEAVEN'S COURTYARD UNDER A STORM: a bruised green-violet sky over white colonnades and a
 *                           gate; o.storm (0..1: torn banners, meteors, red rain-streaks), o.dust (0..1: a wall of dust),
 *                           o.pot (0..1: the amrita on its pedestal), o.cam. EP26.storm(x, y) lights a figure.
 *   EP26.compass(ctx, T, o) HEAVEN SEEN FROM ABOVE: a round court with the four quarters; o.lit[i] lights a quarter
 * PROPS:
 *   EP26.fireRing(ctx, x, y, r, T, a)       a ring of roaring fire round the amrita
 *   EP26.wheel(ctx, x, y, r, T, o)          the spinning iron wheel edged with blades (o.spin rad, o.a)
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP15 = window.EP15;
  const { TAU, clamp, lerp, hash } = R;
  const EP26 = (window.EP26 = {});
  EP26.mouth = window.EP17.mouth; EP26.plaque = window.EP17.plaque;
  EP26.storm = (x, y, k = 1.1) => ({ dir: Math.atan2(200 - (y - 600), 700 - x), intensity: k, front: 0.55 });

  EP26.court = (ctx, T, o = {}) => {
    ctx.save();
    const cam = o.cam || {}, st = clamp(o.storm ?? 1), du = clamp(o.dust || 0);
    KIT.camera(ctx, { x: 540, y: 1100, zoom: cam.zoom || 1, dx: cam.dx || 0, dy: cam.dy || 0 });
    KIT.vgrad(ctx, -600, 1560, [[0, R.mix('#9ac0e8', '#1a1a34', st)], [0.55, R.mix('#e8f0ff', '#4a3a6a', st)], [1, R.mix('#fff8e8', '#8aa080', st)]], -500, R.W + 500);
    for (let i = 0; i < 8; i++) { const life = (T * 0.7 + hash(i, 3)) % 1; ctx.globalAlpha = st * (1 - life); ctx.strokeStyle = '#fff0c0'; ctx.lineWidth = 4; const x0 = hash(i, 4) * R.W; ctx.beginPath(); ctx.moveTo(x0 + life * 400, -200 + life * 600); ctx.lineTo(x0 + life * 400 - 90, -290 + life * 600); ctx.stroke(); }
    ctx.globalAlpha = 1;
    // colonnade and the gate
    ctx.fillStyle = R.mix('#f4f0e8', '#8a8aa8', st * 0.6);
    for (let i = 0; i < 9; i++) { const x = -360 + i * 230; ctx.fillRect(x - 34, 760, 68, 760); ctx.beginPath(); ctx.ellipse(x, 760, 60, 26, 0, 0, TAU); ctx.fill(); }
    ctx.fillRect(-500, 700, R.W + 1000, 70);
    ctx.fillStyle = R.mix('#d8c890', '#6a6080', st * 0.6); ctx.beginPath(); ctx.moveTo(380, 760); ctx.lineTo(380, 520); ctx.quadraticCurveTo(540, 380, 700, 520); ctx.lineTo(700, 760); ctx.fill();
    // banners torn by the wind
    for (let i = 0; i < 6; i++) { const x = -250 + i * 300; ctx.fillStyle = i % 2 ? '#c84a3a' : '#e8b040'; ctx.beginPath(); ctx.moveTo(x, 640); ctx.quadraticCurveTo(x + 60, 640 + 30 * Math.sin(T * 6 + i) * st, x + 130 + 40 * st, 660 + 20 * Math.sin(T * 7 + i)); ctx.lineTo(x, 700); ctx.fill(); }
    // the court floor
    KIT.vgrad(ctx, 1500, R.H + 500, [[0, R.mix('#f0ece0', '#7a7a90', st * 0.7)], [1, R.mix('#c8c0b0', '#2a2a3a', st * 0.7)]], -500, R.W + 500);
    if ((o.pot ?? 0) > 0.01) { ctx.fillStyle = '#e8e0d0'; ctx.fillRect(470, 1380, 140, 140); ctx.fillRect(440, 1360, 200, 30); EP15.potGlow(ctx, 540, 1300, 0.9, o.pot); }
    if (o.after) o.after(ctx);
    // red rain-streaks (an omen; drawn as rain, not gore)
    if (st > 0.5) { ctx.strokeStyle = 'rgba(200,40,40,0.45)'; ctx.lineWidth = 3; for (let i = 0; i < 60; i++) { const x = (hash(i, 7) * 1700 - 300 + T * 200) % 1700 - 300, y = (hash(i, 8) * 2400 + T * 1400) % 2400 - 300; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 14, y + 70); ctx.stroke(); } }
    if (du > 0.01) { ctx.fillStyle = `rgba(190,160,120,${0.7 * du})`; ctx.fillRect(-500, -600, R.W + 1000, R.H + 1200); for (let i = 0; i < 30; i++) { ctx.globalAlpha = 0.35 * du; ctx.fillStyle = '#d8c0a0'; ctx.beginPath(); ctx.ellipse((hash(i, 9) * 1600 + T * 300) % 1600 - 260, hash(i, 10) * 2000, 220, 60, 0.3, 0, TAU); ctx.fill(); } ctx.globalAlpha = 1; }
    ctx.restore();
  };

  EP26.compass = (ctx, T, o = {}) => {
    const lit = o.lit || [0, 0, 0, 0];
    KIT.vgrad(ctx, 0, R.H, [[0, '#14142a'], [1, '#08080e']]);
    ctx.save(); ctx.translate(540, 1150); ctx.scale(0.9, 0.9);
    ctx.fillStyle = '#e8e2d0'; ctx.beginPath(); ctx.arc(0, 0, 420, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#c8a050'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(0, 0, 420, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, 120, 0, TAU); ctx.stroke();
    const cols = ['#ffd080', '#ff9070', '#c090ff', '#90d0ff'];
    for (let q = 0; q < 4; q++) { const a = [0, Math.PI / 2, Math.PI, -Math.PI / 2][q]; ctx.save(); ctx.globalAlpha = 0.6 * lit[q]; ctx.fillStyle = cols[q]; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 420, a - Math.PI / 4, a + Math.PI / 4); ctx.fill(); ctx.restore(); }
    ctx.restore();
    if (o.after) o.after(ctx);
  };

  EP26.fireRing = (ctx, x, y, r, T, a) => {
    if (a <= 0.01) return;
    ctx.save(); ctx.globalAlpha = a;
    KIT.glow(ctx, x, y, r * 1.6, '#ff6a1a', 0.6);
    for (let i = 0; i < 28; i++) { const an = (i / 28) * TAU, px = x + Math.cos(an) * r, py = y + Math.sin(an) * r * 0.35, h = 160 + 70 * Math.sin(T * 7 + i * 1.7); for (const [c, w, f] of [['#c8300c', 40, 1], ['#ff8a20', 28, 0.8], ['#ffe070', 14, 0.55]]) { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(px - w, py); ctx.quadraticCurveTo(px - w * 0.5, py - h * f * 0.6, px + Math.sin(T * 6 + i) * 10, py - h * f); ctx.quadraticCurveTo(px + w * 0.5, py - h * f * 0.6, px + w, py); ctx.fill(); } }
    ctx.restore();
  };

  EP26.wheel = (ctx, x, y, r, T, o = {}) => {
    const a = o.a ?? 1, sp = o.spin ?? T * 8;
    if (a <= 0.01) return;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.rotate(sp);
    KIT.glow(ctx, 0, 0, r * 1.4, '#c8e0ff', 0.35);
    ctx.strokeStyle = '#3a3a48'; ctx.lineWidth = r * 0.12; ctx.beginPath(); ctx.arc(0, 0, r * 0.82, 0, TAU); ctx.stroke();
    ctx.strokeStyle = '#d8dce8'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, r * 0.88, 0, TAU); ctx.stroke();
    // spokes, with gaps between
    ctx.fillStyle = '#4a4a58'; for (let i = 0; i < 8; i++) { ctx.save(); ctx.rotate((i / 8) * TAU); ctx.fillRect(-r * 0.03, 0, r * 0.06, r * 0.8); ctx.restore(); }
    ctx.fillStyle = '#8a8a98'; ctx.beginPath(); ctx.arc(0, 0, r * 0.14, 0, TAU); ctx.fill();
    // the blades round the rim
    for (let i = 0; i < 24; i++) { ctx.save(); ctx.rotate((i / 24) * TAU); ctx.fillStyle = '#eef2ff'; ctx.beginPath(); ctx.moveTo(-r * 0.06, r * 0.86); ctx.lineTo(r * 0.1, r * 1.16); ctx.lineTo(r * 0.04, r * 0.86); ctx.fill(); ctx.restore(); }
    ctx.restore();
    // motion blur arcs
    ctx.save(); ctx.globalAlpha = 0.25 * a; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(x, y, r * (1.0 + 0.06 * k), sp + k, sp + k + 1.2); ctx.stroke(); } ctx.restore();
  };
  void lerp;
})();
