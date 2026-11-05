/*
 * Episode 24 · shared pieces (not a scene). Loads after ep23/_common (EP23.alamba, EP23.carry, EP23.hangers).
 * LOCATIONS, each with its own light:
 *   EP24.glare(ctx, T, o)    THE WORLD FROM HIGH ABOVE AT MIDDAY: a white glare, a sea of cloud with coasts and
 *                            mountains sliding under it (o.slide: how far the land has moved)
 *   EP24.gandha(ctx, T, o)   GANDHAMADANA, THE FRAGRANT MOUNTAIN: warm green-gold slopes, flowering trees, drifting
 *                            petals, a stone seat; EP24.warm(x, y) lights a figure from the high sun at the right
 *   EP24.snow(ctx, T, o)     AN EMPTY SNOW MOUNTAIN AT EVENING: rose alpenglow on white, deep blue shadows (o.shake)
 *   EP24.night(ctx, T, o)    HEAVEN AT NIGHT, WITH OMENS: indigo cloud-palaces, meteors (o.omens 0..1), a red haze
 * PROPS:
 *   EP24.loaded(ctx, x, y, s, T, o)   Garuda in flight with the elephant and tortoise in his talons and the branch
 *                                     in his beak, the Valakhilyas hanging from it (o.sages 0..1, o.branch 0..1)
 *   EP24.beakTip(x, y, s)              where his beak is in flight (from the rig: head at the lean of 0.55 rad)
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP23 = window.EP23;
  const { TAU, clamp, lerp, hash } = R;
  const CH = KIT.characters;
  const EP24 = (window.EP24 = {});
  EP24.mouth = window.EP17.mouth; EP24.plaque = window.EP17.plaque;
  EP24.warm = (x, y, k = 1.1) => ({ dir: Math.atan2(300 - (y - 600), 1300 - x), intensity: k, front: 0.55 });
  EP24.beakTip = (x, y, s) => [x - 363 * s, y - 753 * s];

  EP24.loaded = (ctx, x, y, s, T, o = {}) => {
    const L = o.light || { dir: -Math.PI / 2 - 0.3, intensity: 1.15, front: 0.6 };
    EP23.carry(ctx, x, y, s, T, { key: o.key || 'ld', light: L });
    const br = o.branch ?? 1;
    if (br > 0.01) {
      const [bx, by] = EP24.beakTip(x, y, s), w = 900 * s;
      ctx.save(); ctx.globalAlpha = br;
      ctx.fillStyle = '#2a1a20'; ctx.beginPath(); ctx.moveTo(bx - w * 0.6, by + 10 * s); ctx.quadraticCurveTo(bx, by - 30 * s, bx + w * 0.4, by - 10 * s); ctx.lineTo(bx + w * 0.4, by + 14 * s); ctx.quadraticCurveTo(bx, by - 4 * s, bx - w * 0.6, by + 36 * s); ctx.fill();
      ctx.fillStyle = '#3a2440'; for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.ellipse(bx - w * 0.55 + i * w * 0.11, by - 10 * s, 50 * s, 20 * s, hash(i, 2) - 0.5, 0, TAU); ctx.fill(); }
      const n = Math.round(22 * (o.sages ?? 1));
      for (let i = 0; i < n; i++) { const u = i / 22; CH.valakhilya.hang(ctx, { x: bx - w * 0.55 + u * w * 0.92, y: by + 20 * s, scale: 0.05 * s * (0.85 + 0.3 * hash(i, 7)), index: i % 8, t: T, light: { dir: -Math.PI / 2, intensity: 1.05, front: 0.6 }, key: 'vk' + (i % 8) }); }
      ctx.restore();
    }
  };

  EP24.glare = (ctx, T, o = {}) => {
    const sl = o.slide ?? T * 60;
    KIT.vgrad(ctx, 0, R.H, [[0, '#cfe4f6'], [0.5, '#eaf2fa'], [1, '#bcd2e4']]);
    // land masses sliding under the clouds (coasts, a mountain chain)
    for (let i = 0; i < 6; i++) { const y = ((i * 420 + sl) % 2520) - 300; ctx.fillStyle = i % 2 ? '#a8b890' : '#8aa0b0'; ctx.beginPath(); ctx.moveTo(-100, y); for (let x = -100; x <= R.W + 100; x += 90) ctx.lineTo(x, y + 60 * Math.sin(x * 0.01 + i) + 40 * hash(x, i)); ctx.lineTo(R.W + 100, y + 260); ctx.lineTo(-100, y + 260); ctx.fill(); }
    // cloud-sea on top
    for (let i = 0; i < 26; i++) { const y = ((hash(i, 3) * 2400 + sl * 1.6) % 2400) - 240; ctx.globalAlpha = 0.85; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(hash(i, 4) * R.W, y, 220 + 160 * hash(i, 5), 70, 0, 0, TAU); ctx.fill(); }
    ctx.globalAlpha = 1;
    KIT.glow(ctx, 900, 200, 900, '#ffffff', 0.6, 'lighter', 0.4);
    if (o.after) o.after(ctx);
  };

  EP24.gandha = (ctx, T, o = {}) => {
    ctx.save();
    const cam = o.cam || {};
    KIT.camera(ctx, { x: 540, y: 1100, zoom: cam.zoom || 1, dx: cam.dx || 0, dy: cam.dy || 0 });
    KIT.vgrad(ctx, -500, 1300, [[0, '#7ab0c8'], [0.6, '#d8e4b0'], [1, '#f8eab0']], -400, R.W + 400);
    KIT.glow(ctx, 1200, 300, 800, '#fff4c0', 0.6, 'lighter', 0.4);
    ctx.fillStyle = '#6a8a50'; ctx.beginPath(); ctx.moveTo(-500, 1300); ctx.quadraticCurveTo(200, 500, 640, 620); ctx.quadraticCurveTo(1100, 700, 1600, 1300); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#4a7038'; ctx.beginPath(); ctx.moveTo(-500, 1500); ctx.quadraticCurveTo(300, 1100, 800, 1200); ctx.quadraticCurveTo(1200, 1250, 1600, 1500); ctx.lineTo(1600, R.H + 500); ctx.lineTo(-500, R.H + 500); ctx.fill();
    // flowering trees
    for (let i = 0; i < 7; i++) { const x = -150 + i * 210, y = 1250 + 60 * Math.sin(i); ctx.fillStyle = '#3a2a18'; ctx.fillRect(x - 10, y - 160, 20, 160); ctx.fillStyle = '#5a8a40'; ctx.beginPath(); ctx.arc(x, y - 200, 110, 0, TAU); ctx.fill(); for (let k = 0; k < 9; k++) { ctx.fillStyle = k % 2 ? '#f8c0d0' : '#fff0a0'; ctx.beginPath(); ctx.arc(x + (hash(i, k) - 0.5) * 180, y - 200 + (hash(i, k + 9) - 0.5) * 160, 14, 0, TAU); ctx.fill(); } }
    if (o.after) o.after(ctx);
    for (let i = 0; i < 30; i++) { const life = (T * 0.12 + hash(i, 1)) % 1, x = hash(i, 2) * R.W + 120 * Math.sin(T + i) - 200 * life, y = -100 + life * 2200; ctx.fillStyle = i % 2 ? '#ffd0dc' : '#fff4b0'; ctx.globalAlpha = 0.8; ctx.beginPath(); ctx.ellipse(x, y, 10, 5, T + i, 0, TAU); ctx.fill(); }
    ctx.globalAlpha = 1;
    ctx.restore();
  };

  EP24.snow = (ctx, T, o = {}) => {
    ctx.save();
    const cam = o.cam || {}, sh = o.shake || 0;
    KIT.camera(ctx, { x: 540, y: 1100, zoom: cam.zoom || 1, dx: (cam.dx || 0) + sh * Math.sin(T * 60) * 10, dy: cam.dy || 0 });
    KIT.vgrad(ctx, -500, 1400, [[0, '#2a2a5a'], [0.6, '#8a6a9a'], [1, '#f0b0a0']], -400, R.W + 400);
    ctx.fillStyle = '#f4e0e4'; ctx.beginPath(); ctx.moveTo(-400, 1600); ctx.lineTo(280, 760); ctx.lineTo(420, 860); ctx.lineTo(560, 560); ctx.lineTo(760, 900); ctx.lineTo(1500, 1600); ctx.fill();
    ctx.fillStyle = '#5a6aa0'; ctx.beginPath(); ctx.moveTo(560, 560); ctx.lineTo(760, 900); ctx.lineTo(1500, 1600); ctx.lineTo(700, 1600); ctx.lineTo(620, 900); ctx.fill();
    ctx.fillStyle = '#2a3060'; ctx.fillRect(-400, 1580, R.W + 800, R.H);
    if (o.after) o.after(ctx);
    ctx.restore();
  };

  EP24.night = (ctx, T, o = {}) => {
    const om = clamp(o.omens ?? 1);
    KIT.vgrad(ctx, 0, R.H, [[0, '#06041a'], [0.6, '#1a1040'], [1, R.mix('#2a1a4a', '#6a1a1a', om)]]);
    for (let i = 0; i < 80; i++) { ctx.globalAlpha = 0.5 * hash(i, 1); ctx.fillStyle = '#fff'; ctx.fillRect(hash(i, 2) * R.W, hash(i, 3) * 1200, 2, 2); }
    ctx.globalAlpha = 1;
    for (let i = 0; i < 4; i++) { const x = 140 + i * 260; ctx.fillStyle = '#2a2050'; ctx.beginPath(); ctx.arc(x, 1300 - (i % 2) * 80, 120, Math.PI, 0); ctx.fill(); ctx.fillRect(x - 120, 1300 - (i % 2) * 80, 240, 700); }
    for (let i = 0; i < 9; i++) { const life = (T * 0.7 + hash(i, 5)) % 1; const x0 = hash(i, 6) * R.W, y0 = hash(i, 7) * 400; ctx.globalAlpha = om * (1 - life); ctx.strokeStyle = '#ffd8a0'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x0 + life * 500, y0 + life * 500); ctx.lineTo(x0 + life * 500 - 120, y0 + life * 500 - 120); ctx.stroke(); }
    ctx.globalAlpha = 1;
    if (o.after) o.after(ctx);
  };
  void lerp;
})();
