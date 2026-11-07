/*
 * Episode 38 · shared pieces (not a scene). Loads after ep31/_common (EPA), ep37/_common (EP37.blaze), ep08/_common (EP8).
 * NEW LIGHTS:
 *   EP38.redHall(ctx, T, o)   VASUKI'S HALL UNDER THE SPELL: the violet hall with the vault cracked open, a red shaft from the
 *                             fire above, sparks falling; o.cam, o.after(g)
 *   EP38.plain(ctx, T, o)     THE PLAIN BEFORE THE SACRIFICE AT A SMOKY RED NOON: an ochre-red sky, the smoke column, the
 *                             enclosure's posts on the horizon, a long road; o.cam, o.after(g)
 *   EP38.noonSatra(ctx, T, o) INSIDE THE ENCLOSURE AT NOON THROUGH SMOKE (episode 8's place, a daylit grade: grey-gold smoke,
 *                             a pale sun disc, the fire paler in daylight); o.cam, o.after(g)
 *   EP38.gate(g, x, y, s, T)  the enclosure's gate: two posts with black streamers and a lintel
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP8 = window.EP8;
  const { TAU, clamp, hash, lerp } = R;
  const EP38 = (window.EP38 = {});
  EP38.redLit = (x, y, k = 1.15) => ({ dir: Math.atan2(-400 - (y - 600), 540 - x), intensity: k, front: 0.65, fill: 0.45 });
  EP38.noonLit = (x, y, k = 1.1) => ({ dir: -Math.PI / 2 - 0.2, intensity: k, front: 0.6, fill: 0.5 });

  EP38.redHall = (ctx, T, o = {}) => {
    EPA.hall(ctx, T, { mood: 'violet', cam: o.cam, after: (g) => {
      g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.3; g.fillStyle = '#ff4020';
      g.beginPath(); g.moveTo(420, -800); g.lineTo(660, -800); g.lineTo(900, R.H + 400); g.lineTo(180, R.H + 400); g.closePath(); g.fill(); g.restore();
      KIT.glow(g, 540, -100, 600, '#ff6030', 0.6);
      for (let k = 0; k < 24; k++) { const u = (T * 0.3 + hash(k, 1)) % 1, x = 300 + hash(k, 2) * 480 + Math.sin(T + k) * 30, y = -200 + u * 2000; g.globalAlpha = 1 - u; g.fillStyle = '#ffb050'; g.beginPath(); g.arc(x, y, 4, 0, TAU); g.fill(); }
      g.globalAlpha = 1;
      if (o.after) o.after(g);
    } });
  };

  EP38.plain = (ctx, T, o = {}) => {
    ctx.save();
    const cam = o.cam || {}, hz = 1250;
    KIT.camera(ctx, { x: 540, y: 1000, zoom: cam.zoom || 1, dx: cam.dx || 0, dy: cam.dy || 0 });
    KIT.vgrad(ctx, -800, hz, [[0, '#3a1a14'], [0.5, '#8a3a1a'], [1, '#e8a060']], -500, R.W + 500);
    ctx.fillStyle = '#fff0d0'; ctx.globalAlpha = 0.7; ctx.beginPath(); ctx.arc(820, 260, 70, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
    // the smoke column from the enclosure
    for (let i = 0; i < 9; i++) { const u = ((T * 0.06 + i / 9) % 1), y = hz - 80 - u * 1500; ctx.globalAlpha = 0.22 * (1 - u * 0.7); ctx.fillStyle = '#1a0a08'; ctx.beginPath(); ctx.ellipse(540 + Math.sin(T * 0.3 + i) * 80 * u + u * 160, y, 120 + 300 * u, 90 + 160 * u, 0, 0, TAU); ctx.fill(); }
    ctx.globalAlpha = 1; KIT.glow(ctx, 540, hz - 40, 300, '#ff5020', 0.6);
    ctx.fillStyle = '#2a120a'; for (let i = 0; i < 9; i++) ctx.fillRect(380 + i * 40, hz - 90, 8, 90);
    KIT.vgrad(ctx, hz, R.H + 700, [[0, '#a8603a'], [0.3, '#6a3a20'], [1, '#1a0c06']], -500, R.W + 500);
    ctx.fillStyle = 'rgba(240,200,150,0.4)'; ctx.beginPath(); ctx.moveTo(520, hz); ctx.lineTo(560, hz); ctx.lineTo(900, R.H + 700); ctx.lineTo(160, R.H + 700); ctx.closePath(); ctx.fill();
    if (o.after) o.after(ctx);
    ctx.restore();
  };

  EP38.noonSatra = (ctx, T, o = {}) => {
    EP8.satra(ctx, T, { fire: o.fire ?? 0.9, cam: o.cam, after: (g) => {
      g.save(); g.globalCompositeOperation = 'screen'; g.fillStyle = '#8a7a6a'; g.globalAlpha = 0.35; g.fillRect(-600, -900, R.W + 1200, R.H + 1800); g.restore();
      g.fillStyle = 'rgba(255,240,210,0.6)'; g.beginPath(); g.arc(800, 220, 60, 0, TAU); g.fill();
      if (o.after) o.after(g);
    } });
  };

  EP38.gate = (g, x, y, s, T) => {
    g.save(); g.translate(x, y); g.scale(s, s);
    g.fillStyle = '#1a0c06'; g.fillRect(-330, -900, 50, 900); g.fillRect(280, -900, 50, 900); g.fillRect(-380, -940, 760, 60);
    g.strokeStyle = '#0a0404'; g.lineWidth = 14;
    for (let i = 0; i < 6; i++) { const x0 = -340 + i * 136; g.beginPath(); g.moveTo(x0, -880); g.quadraticCurveTo(x0 + 20 * Math.sin(T * 2 + i), -760, x0 + 30 * Math.sin(T * 1.5 + i), -640); g.stroke(); }
    g.restore();
    void lerp; void clamp;
  };
})();
