/* Ep 0 · line "essence" · "No hype, nothing twisted: the essence of the epic, condensed, as it is told." · The field of the eighteen days at dusk, seen from the ground: the two hosts' banners along the horizon, chariots facing each other, dust rising; held quiet, a slow push. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT;
  const { TAU, clamp, E, hash } = R;
  const A = KIT.army, HZ = 1080;
  function standard(ctx, x, y, h, kind, wave, col) {
    ctx.fillStyle = '#0c0608'; ctx.fillRect(x - 3, y - h, 6, h); ctx.fillStyle = col;
    if (kind === 0) { ctx.beginPath(); ctx.moveTo(x + 2, y - h); ctx.quadraticCurveTo(x + 44, y - h + 6 + wave, x + 90, y - h + 14 + wave * 1.5); ctx.lineTo(x + 2, y - h + 44); ctx.fill(); }
    else if (kind === 1) { ctx.fillStyle = '#0c0608'; ctx.beginPath(); ctx.ellipse(x, y - h, 38, 13, 0, Math.PI, TAU); ctx.fill(); }
    else { ctx.beginPath(); ctx.moveTo(x + 2, y - h); ctx.lineTo(x + 56, y - h + 10 + wave); ctx.lineTo(x + 30, y - h + 22 + wave * 0.5); ctx.lineTo(x + 56, y - h + 36 + wave); ctx.lineTo(x + 2, y - h + 40); ctx.fill(); }
  }
  R.scene({
    id: 'essence',
    fadeIn: 0.35,
    draw(ctx, t, env) {
      const T = env.T, p = E.inOutSine(clamp(t / env.dur));
      ctx.save(); KIT.camera(ctx, { x: 540, y: HZ, zoom: 1.0 + 0.12 * p });
      KIT.vgrad(ctx, -200, HZ + 2, [[0, '#14122c'], [0.5, '#3e2842'], [0.82, '#a85236'], [1, '#f0a050']], -300, R.W + 300);
      KIT.glow(ctx, 540, HZ - 40, 700, '#ffc070', 0.35, 'lighter', 0.3);
      ctx.fillStyle = '#ffe2a8'; ctx.beginPath(); ctx.arc(540, HZ - 70, 46, 0, TAU); ctx.fill();
      KIT.vgrad(ctx, HZ, R.H + 300, [[0, '#4a2a20'], [0.1, '#2a1712'], [1, '#0c0605']], -300, R.W + 300);
      for (const side of [-1, 1]) {
        const col = side < 0 ? '#9a3a1c' : '#3a4a8a';
        for (let i = 0; i < 9; i++) { const u = i / 8, x = (side < 0 ? 0 + u * 380 : 1080 - u * 380) + (hash(i, side + 9) - 0.5) * 30; standard(ctx, x, HZ + 6, 120 + hash(i, side + 5) * 180, i % 3, Math.sin(T * 2.4 + i) * 6, col); }
      }
      KIT.smoke.draw(ctx, 540, HZ + 20, T, { h: 520, w: 220, strands: 4, alpha: 0.2, color: '#8a6a5a', lean: 30, speed: 0.6, seed: 77, curls: 0.6, spread: 1.2 });
      const rimLight = Math.atan2(-1, 0);
      for (const [x, dir, ban, ph0] of [[170, 1, '#c0502a', 0], [380, 1, '#c0502a', 1.3], [910, -1, '#6a7ad0', 0.6], [700, -1, '#6a7ad0', 2.1]]) A.draw(ctx, 'chariot', { x, y: HZ + 190, s: 0.55, dir, t: T, phase: ph0, gait: 0.1, fill: '#0e0708', line: null, gold: '#5a4020', banner: ban, rim: '#f0a060', light: rimLight, rimW: 3 });
      for (let i = 0; i < 6; i++) { const side = i < 3 ? 1 : -1, x = side > 0 ? 80 + i * 80 : 1000 - (i - 3) * 80; A.draw(ctx, 'soldier', { x, y: HZ + 300, s: 0.7, dir: side, t: T, phase: i, gait: 0.1, fill: '#0e0708', line: null, gold: '#5a4020', rim: '#e09060', light: rimLight, rimW: 2 }); }
      ctx.restore();
    },
    post: () => ({ bloom: 0.36, vignette: 0.5, paper: 0.32 }),
  });
})();
