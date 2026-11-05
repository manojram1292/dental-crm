/*
 * Episode 28 · shared pieces (not a scene). Loads after ep15/_common (EP15.potGlow) and ep13/_common (EP13.storm).
 * LOCATIONS, each with its own light:
 *   EP28.dawnSky(ctx, T, o)  THE SKY AT FIRST LIGHT OVER A CLOUD-SEA: gold below, clear blue above, the sun just
 *                            under the cloud rim; EP28.dawn(x, y) lights a figure from the low gold east (right)
 *   EP28.whiteGold(ctx, T, o) A WHITE-GOLD SKY for the banner: high and bright, faint rays
 * PROPS:
 *   EP28.banner(ctx, x, y, h, T, a)   Vishnu's banner: a tall gold staff, a long saffron pennant, Garuda's image at the top
 *   EP28.pair(ctx, T, x, y, s, o)     Garuda carrying the pot meeting Vishnu (o.vx, o.vy, o.vs)
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP15 = window.EP15;
  const { TAU, clamp, lerp, hash } = R;
  const CH = KIT.characters;
  const EP28 = (window.EP28 = {});
  EP28.mouth = window.EP17.mouth; EP28.plaque = window.EP17.plaque;
  EP28.dawn = (x, y, k = 1.15) => ({ dir: Math.atan2(1500 - (y - 600), 1300 - x), intensity: k, front: 0.6 });

  EP28.dawnSky = (ctx, T, o = {}) => {
    ctx.save();
    const cam = o.cam || {};
    KIT.camera(ctx, { x: 540, y: 1000, zoom: cam.zoom || 1, dx: cam.dx || 0, dy: cam.dy || 0 });
    KIT.vgrad(ctx, -600, 1500, [[0, '#2a4a9a'], [0.55, '#8ab0e0'], [0.85, '#ffd8a0'], [1, '#ffb060']], -500, R.W + 500);
    KIT.glow(ctx, 1150, 1500, 900, '#ffd080', 0.7, 'lighter', 0.4);
    for (let i = 0; i < 30; i++) { const x = (hash(i, 1) * 1800 - 360 + T * 15 * (1 + hash(i, 4))) % 1800 - 360, y = 1440 + hash(i, 2) * 700; ctx.fillStyle = i % 3 ? '#fff0dc' : '#f4d8c0'; ctx.beginPath(); ctx.ellipse(x, y, 260 + 160 * hash(i, 3), 80, 0, 0, TAU); ctx.fill(); }
    if (o.after) o.after(ctx);
    ctx.restore();
  };

  EP28.whiteGold = (ctx, T, o = {}) => {
    KIT.vgrad(ctx, 0, R.H, [[0, '#f4f0ff'], [0.6, '#fff4d8'], [1, '#f0d8a0']]);
    ctx.save(); ctx.globalAlpha = 0.2; ctx.fillStyle = '#ffffff'; for (let i = 0; i < 12; i++) { const a = -Math.PI / 2 + (i - 6) * 0.14 + 0.02 * Math.sin(T + i); ctx.beginPath(); ctx.moveTo(540, 2200); ctx.lineTo(540 + Math.cos(a - 0.03) * 2600, 2200 + Math.sin(a - 0.03) * 2600); ctx.lineTo(540 + Math.cos(a + 0.03) * 2600, 2200 + Math.sin(a + 0.03) * 2600); ctx.fill(); } ctx.restore();
    if (o.after) o.after(ctx);
  };

  EP28.banner = (ctx, x, y, h, T, a = 1) => {
    if (a <= 0.01) return;
    ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = '#c89a3a'; ctx.fillRect(x - 10, y - h, 20, h);
    ctx.fillStyle = '#ffe08a'; ctx.beginPath(); ctx.arc(x, y - h, 22, 0, TAU); ctx.fill();
    // the pennant
    ctx.fillStyle = '#ff9a2a'; ctx.beginPath(); ctx.moveTo(x + 10, y - h + 40);
    for (let i = 0; i <= 12; i++) { const u = i / 12; ctx.lineTo(x + 10 + u * 520, y - h + 40 + 30 * Math.sin(T * 3 - u * 5) * u + u * 60); }
    for (let i = 12; i >= 0; i--) { const u = i / 12; ctx.lineTo(x + 10 + u * 520, y - h + 40 + 30 * Math.sin(T * 3 - u * 5) * u + u * 60 + lerp(240, 60, u)); }
    ctx.fill();
    ctx.restore();
    // Garuda's image on the banner (a small figure at the staff's top, above everything)
    CH.garuda.draw(ctx, { x: x + 150, y: y - h + 250, scale: 0.16, facing: 'left', pose: { name: 'spread', k: 1 }, alpha: a, light: { dir: -Math.PI / 2, intensity: 1.2, front: 0.7 }, t: T, key: 'banner-ga' });
  };

  EP28.pair = (ctx, T, x, y, s, o = {}) => {
    CH.vishnu.draw(ctx, { x: o.vx ?? 330, y: o.vy ?? 1500, scale: o.vs ?? 0.7, facing: 'front', pose: o.vpose || 'stand', expression: o.vex || {}, light: EP28.dawn(o.vx ?? 330, o.vy ?? 1500), t: T, key: 'pr-vi' });
    CH.garuda.draw(ctx, { x, y, scale: s, facing: 'left', pose: o.gpose || { name: 'carry', k: 1 }, expression: o.gex || {}, light: EP28.dawn(x, y, 1.2), t: T, key: 'pr-ga' });
    if (o.pot !== false) EP15.potGlow(ctx, x - 220 * s, y - 560 * s, s / 0.55, 1);
  };
  void clamp;
})();
