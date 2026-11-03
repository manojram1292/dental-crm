/*
 * Episode 10 · shared pieces (not a scene). Loads after ep05–ep09's _common: Kashyapa's
 * hermitage (EP9.hermitage), its jars and eggs (EP9.jar, EP9.egg) are the same place.
 *
 * LIGHT: this episode is the coming of the dawn. The hermitage starts in a cold grey
 * before-dawn (EP9.hermitage with a low glow), Aruna's own red light becomes the key light
 * of every shot he is in (EP10.arunaLight), and the sky ends flushed red and gold.
 *   EP10.sky(ctx, T, o)        the open sky at dawn: o.red (0..1) floods it from the horizon
 *                              up (grey → rose → red and gold), o.cam, o.after
 *   EP10.chariot(ctx, x, y, s, T, o)   the Sun's chariot: a great gold disc-wheel and seven
 *                              horses of light galloping ahead of it (o.a alpha)
 *   EP10.shore(ctx, T, o)      the shore of the ocean at sunrise, the water shining: where the
 *                              sisters see the white horse (o.horse 0..1 rises from the waves)
 *   EP10.whiteHorse(ctx, x, y, s, T, a)   Uchchaihshravas, a luminous white horse (a prop
 *                              here; his own module comes with episode 11)
 *   EP10.arunaLight(x, y, ax, ay, k)
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP5 = window.EP5;
  const { TAU, clamp, lerp, hash } = R;
  const EP10 = (window.EP10 = {});
  const hex = EP5.hex;
  EP10.mouth = EP5.mouth; EP10.ghost = EP5.ghost; EP10.label = window.EP7.label;
  EP10.arunaLight = (x, y, ax, ay, k = 1) => ({ dir: Math.atan2(ay - (y - 600), ax - x), intensity: k, front: 0.35 });

  EP10.sky = (ctx, T, o = {}) => {
    ctx.save();
    const cam = o.cam || {};
    KIT.camera(ctx, { x: 540, y: 1100, zoom: cam.zoom || 1, dx: cam.dx || 0, dy: cam.dy || 0 });
    const red = clamp(o.red || 0), hz = 1500;
    KIT.vgrad(ctx, -600, hz, [[0, hex('#1a1a30', '#3a1a4a', red)], [0.4, hex('#3a3a54', '#a83a4a', red)], [0.75, hex('#6a6070', '#ff6a3a', red)], [1, hex('#8a7a80', '#ffd070', red)]], -400, R.W + 400);
    // banded clouds catching the light
    for (let i = 0; i < 7; i++) {
      const y = 300 + i * 150, x = ((i * 210 + T * (6 + i)) % 1700) - 300;
      EP5.cloud(ctx, x, y, 380 + i * 30, i * 13, hex('#4a4a5a', i % 2 ? '#ff9a6a' : '#ffc890', red * (0.6 + 0.4 * (i / 6))), hex('#6a6a7a', '#fff0c8', red), 0.75);
    }
    // far ridge
    ctx.fillStyle = hex('#1a1a24', '#3a1a1a', red);
    ctx.beginPath(); ctx.moveTo(-400, hz); for (let x = -400; x <= R.W + 400; x += 60) ctx.lineTo(x, hz - 120 - 140 * Math.abs(Math.sin(x * 0.004 + 1.3))); ctx.lineTo(R.W + 400, hz + 600); ctx.lineTo(-400, hz + 600); ctx.closePath(); ctx.fill();
    if (o.after) o.after(ctx);
    ctx.restore();
  };

  EP10.chariot = (ctx, x, y, s, T, o = {}) => {
    const a = o.a ?? 1;
    if (a <= 0.01) return;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(s, s);
    // seven horses of light, galloping ahead (to the left), in a staggered team
    for (let i = 6; i >= 0; i--) {
      const hx = -420 - (i % 4) * 70 - Math.floor(i / 4) * 40, hy = -40 - i * 26, ph = T * 9 + i * 0.9;
      ctx.save(); ctx.translate(hx, hy); ctx.globalAlpha = a * (0.55 + 0.06 * i);
      ctx.fillStyle = ['#fff4d8', '#ffe0a0', '#ffd080', '#ffc070', '#ffb060', '#ffa050', '#ff9040'][i];
      ctx.beginPath(); ctx.ellipse(0, 0, 110, 40, -0.1, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-80, -10); ctx.quadraticCurveTo(-130, -80, -150, -110); ctx.lineTo(-190, -96); ctx.lineTo(-180, -76); ctx.quadraticCurveTo(-130, -40, -100, 20); ctx.closePath(); ctx.fill();
      ctx.lineWidth = 14; ctx.strokeStyle = ctx.fillStyle; ctx.lineCap = 'round';
      for (const [lx, off] of [[-70, 0], [-50, 1.5], [70, 3], [90, 4.5]]) { const sw = Math.sin(ph + off) * 0.8; ctx.beginPath(); ctx.moveTo(lx, 20); ctx.lineTo(lx + Math.sin(sw) * 60 * (lx < 0 ? -1 : 1), 70 + Math.cos(sw) * 30); ctx.stroke(); }
      // flaming mane
      for (let j = 0; j < 4; j++) { ctx.beginPath(); ctx.moveTo(-110 + j * 18, -60 + j * 14); ctx.quadraticCurveTo(-80 + j * 20, -110 + j * 10 + Math.sin(T * 7 + j) * 10, -40 + j * 22, -70 + j * 12); ctx.lineWidth = 6; ctx.stroke(); }
      ctx.restore();
    }
    // reins to the chariot
    ctx.strokeStyle = '#ffe9b0'; ctx.lineWidth = 3; ctx.globalAlpha = a * 0.8;
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-480 - i * 40, -60 - i * 40); ctx.quadraticCurveTo(-260, -160, -120, -200 - i * 10); ctx.stroke(); }
    ctx.globalAlpha = a;
    // the disc-wheel (the Sun itself)
    KIT.glow(ctx, 0, 0, 700, '#ffd060', 0.7);
    const g = ctx.createRadialGradient(0, 0, 40, 0, 0, 280);
    g.addColorStop(0, '#fffbe8'); g.addColorStop(0.6, '#ffd060'); g.addColorStop(1, '#ff9a30');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 280, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#b8701a'; ctx.lineWidth = 8;
    for (let i = 0; i < 12; i++) { const an = (i / 12) * TAU + T * 0.6; ctx.beginPath(); ctx.moveTo(Math.cos(an) * 50, Math.sin(an) * 50); ctx.lineTo(Math.cos(an) * 250, Math.sin(an) * 250); ctx.stroke(); }
    ctx.beginPath(); ctx.arc(0, 0, 250, 0, TAU); ctx.stroke();
    ctx.fillStyle = '#b8701a'; ctx.beginPath(); ctx.arc(0, 0, 46, 0, TAU); ctx.fill();
    ctx.restore();
  };

  EP10.whiteHorse = (ctx, x, y, s, T, a = 1) => {
    if (a <= 0.01) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha = a;
    KIT.glow(ctx, 0, -200, 520, '#e8f0ff', 0.35);
    ctx.shadowColor = 'rgba(30,30,80,0.9)'; ctx.shadowBlur = R.px(14 * s);
    ctx.fillStyle = '#f8f8ff'; ctx.strokeStyle = '#f8f8ff'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    // body, rearing out of the waves
    ctx.beginPath(); ctx.ellipse(0, -180, 170, 72, -0.35, 0, TAU); ctx.fill();
    // neck and head (wedge, muzzle down-left)
    ctx.beginPath(); ctx.moveTo(-60, -260); ctx.quadraticCurveTo(-120, -340, -150, -420); ctx.lineTo(-190, -436); ctx.quadraticCurveTo(-240, -410, -262, -350); ctx.lineTo(-236, -336); ctx.quadraticCurveTo(-200, -360, -170, -360); ctx.quadraticCurveTo(-150, -290, -120, -200); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-176, -430); ctx.lineTo(-160, -478); ctx.lineTo(-150, -424); ctx.fill();
    // forelegs tucked high (rearing), hind legs in the water
    ctx.lineWidth = 22;
    const fk = Math.sin(T * 4) * 12;
    ctx.beginPath(); ctx.moveTo(-110, -200); ctx.lineTo(-190, -250 + fk); ctx.lineTo(-210, -180 + fk); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-80, -180); ctx.lineTo(-150, -210 - fk); ctx.lineTo(-180, -150 - fk); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(110, -130); ctx.lineTo(140, -40); ctx.lineTo(120, 30); ctx.stroke();
    // the long white tail streaming (the subject of the wager)
    ctx.lineWidth = 26; ctx.beginPath(); ctx.moveTo(160, -220); ctx.quadraticCurveTo(300 + Math.sin(T * 2) * 30, -200, 360, -80); ctx.stroke();
    ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(300, -160); ctx.quadraticCurveTo(380, -120, 400, -20); ctx.stroke();
    // mane along the neck
    ctx.shadowBlur = 0; ctx.strokeStyle = '#c8d0f0'; ctx.lineWidth = 6;
    for (let k = 0; k < 5; k++) { const y = -400 + k * 40, x = -150 + k * 22; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 40, y - 10 + Math.sin(T * 3 + k) * 8, x + 60, y + 20); ctx.stroke(); }
    ctx.fillStyle = '#2a2a5a'; ctx.beginPath(); ctx.arc(-205, -392, 6, 0, TAU); ctx.fill();
    ctx.restore();
  };

  EP10.shore = (ctx, T, o = {}) => {
    ctx.save();
    const cam = o.cam || {};
    KIT.camera(ctx, { x: 540, y: 1100, zoom: cam.zoom || 1, dx: cam.dx || 0, dy: cam.dy || 0 });
    const hz = 1080;
    KIT.vgrad(ctx, -400, hz, [[0, '#1e2a5a'], [0.55, '#9a5a7a'], [0.9, '#f0a080'], [1, '#ffd8a0']], -300, R.W + 300);
    KIT.glow(ctx, 820, hz, 500, '#fff0c8', 0.6);
    // the ocean of milk, shining
    KIT.vgrad(ctx, hz, 1480, [[0, '#f8d8c0'], [0.4, '#a88aa8'], [1, '#4a4a7a']], -300, R.W + 300);
    ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 3;
    for (let i = 0; i < 14; i++) { const y = hz + 20 + i * 28, x = ((i * 170 + T * 30) % 1400) - 200; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 60, y - 8, x + 140, y); ctx.stroke(); }
    if (o.horse) EP10.whiteHorse(ctx, 560, lerp(1300, 1080, clamp(o.horse)), 0.8, T, clamp(o.horse * 1.5));
    ctx.fillStyle = '#d8c8a8'; ctx.globalAlpha = 0.6;
    for (let i = 0; i < 5; i++) { const x = 100 + hash(i, 3) * 900; ctx.beginPath(); ctx.ellipse(x, 1200 + i * 8, 120, 6, 0, 0, TAU); ctx.fill(); }
    ctx.globalAlpha = 1;
    KIT.vgrad(ctx, 1460, R.H + 300, [[0, '#c8a880'], [0.3, '#7a5a40'], [1, '#1a1008']], -300, R.W + 300);
    if (o.after) o.after(ctx);
    ctx.restore();
  };

  void TAU;
})();
