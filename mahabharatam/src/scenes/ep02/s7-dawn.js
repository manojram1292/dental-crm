/*
 * Ep 2 · line "dawn" · NEXT (the cliffhanger) · "On that ground, ages later… eighteen vast armies would meet."
 *
 * Dissolve: the same land at dawn, ages later. A wide flat plain; the five
 * lakes lie on it as long mirrors of the sunrise; mist; the sun lifts out of
 * the haze. On "eighteen" (beats[0]) faint shapes form on both horizons, left and
 * right: tall standards with pennants, parasols, chariots with their horses,
 * like a premonition in the mist. On "meet" (beats[1]) they lean in, a shade
 * nearer, and the light on the field cools.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT;
  const { TAU, clamp, lerp, E, hash } = R;
  const HZ = 1010;

  function chariot(ctx, x, y, s, dir) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s * dir, s);
    // two horses ahead (mural, flat), the car, a big spoked wheel, a canopy and a standard
    for (const o of [0, 26]) {
      ctx.beginPath();
      ctx.moveTo(-150 - o, -40); ctx.quadraticCurveTo(-130 - o, -80, -95 - o, -78); ctx.lineTo(-70 - o, -60); ctx.lineTo(-60 - o, -40);
      ctx.lineTo(-64 - o, 0); ctx.lineTo(-72 - o, 0); ctx.lineTo(-76 - o, -30); ctx.lineTo(-120 - o, -32); ctx.lineTo(-130 - o, 0); ctx.lineTo(-138 - o, 0); ctx.lineTo(-138 - o, -36);
      ctx.lineTo(-160 - o, -60); ctx.lineTo(-170 - o, -100); ctx.lineTo(-150 - o, -96); ctx.closePath(); ctx.fill();
    }
    ctx.fillRect(-60, -46, 80, 6);
    ctx.beginPath(); ctx.moveTo(-10, -20); ctx.lineTo(70, -20); ctx.lineTo(80, -80); ctx.lineTo(0, -80); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(30, -6, 34, 0, TAU); ctx.lineWidth = 7; ctx.stroke();
    for (let k = 0; k < 4; k++) { ctx.beginPath(); const a = k * Math.PI / 4; ctx.moveTo(30 - Math.cos(a) * 34, -6 - Math.sin(a) * 34); ctx.lineTo(30 + Math.cos(a) * 34, -6 + Math.sin(a) * 34); ctx.lineWidth = 3; ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(-6, -90); ctx.quadraticCurveTo(40, -130, 86, -90); ctx.closePath(); ctx.fill();
    ctx.fillRect(36, -260, 5, 170);
    ctx.beginPath(); ctx.moveTo(41, -260); ctx.lineTo(110, -244); ctx.lineTo(41, -222); ctx.fill();
    ctx.restore();
  }
  function standard(ctx, x, y, h, kind, wave) {
    ctx.fillRect(x - 2.5, y - h, 5, h);
    if (kind === 0) { ctx.beginPath(); ctx.moveTo(x + 2, y - h); ctx.quadraticCurveTo(x + 40, y - h + 6 + wave, x + 80, y - h + 14 + wave * 1.5); ctx.lineTo(x + 2, y - h + 40); ctx.fill(); }
    else if (kind === 1) { ctx.beginPath(); ctx.ellipse(x, y - h, 34, 12, 0, Math.PI, TAU); ctx.fill(); }
    else { ctx.beginPath(); ctx.moveTo(x, y - h - 26); ctx.lineTo(x + 12, y - h); ctx.lineTo(x - 12, y - h); ctx.fill(); ctx.fillRect(x + 2, y - h + 6, 40, 22); }
  }
  function army(ctx, T, side, a, lean) {
    if (a <= 0.01) return;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = side < 0 ? '#3a2a3a' : '#2e2a3e'; ctx.strokeStyle = ctx.fillStyle;
    const x0 = side < 0 ? 40 : 1040, dir = -side;   // they face the centre
    for (let i = 0; i < 16; i++) {
      const u = i / 15, x = x0 + dir * (u * 380 + lean * 40), y = HZ + 4 - hash(i, side + 5) * 6;
      standard(ctx, x, y, 110 + hash(i, side + 7) * 120, i % 3, Math.sin(T * 2 + i) * 6);
    }
    for (let i = 0; i < 5; i++) chariot(ctx, x0 + dir * (60 + i * 78 + lean * 40), HZ + 6, 0.32 + 0.04 * hash(i, side + 9), dir);
    // dust / mist along their line
    const g = ctx.createLinearGradient(0, HZ - 60, 0, HZ + 20);
    g.addColorStop(0, 'rgba(240,200,170,0)'); g.addColorStop(1, 'rgba(240,200,170,0.5)');
    ctx.fillStyle = g; ctx.fillRect(side < 0 ? 0 : 560, HZ - 60, 520, 80);
    ctx.restore();
  }

  R.scene({
    id: 'dawn',
    fadeIn: 0.9,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur, 0, 1.3);
      const [b0, b1] = env.beats.length >= 2 ? env.beats : [dur * 0.5, dur * 0.8];
      ctx.save();
      KIT.camera(ctx, { x: 540, y: HZ, zoom: 1 + 0.06 * E.inOutSine(p) });
      // dawn sky
      KIT.vgrad(ctx, 0, HZ + 2, [[0, '#141a3e'], [0.45, '#4a3e6a'], [0.75, '#b46a5c'], [0.92, '#eaa66a'], [1, '#f8d090']]);
      const sunY = lerp(HZ + 30, HZ - 120, E.outSine(clamp(t / dur)));
      KIT.glow(ctx, 540, sunY, 900, '#ffb070', 0.5, 'lighter', 0.5);
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, R.W, HZ); ctx.clip();
      ctx.fillStyle = '#ffe2a8'; ctx.beginPath(); ctx.arc(540, sunY, 70, 0, TAU); ctx.fill();
      ctx.restore();
      KIT.glow(ctx, 540, sunY, 220, '#fff0c8', 0.6);
      // the plain
      KIT.vgrad(ctx, HZ, R.H, [[0, '#a0705a'], [0.05, '#6a4434'], [0.3, '#3a241c'], [1, '#120a08']]);
      // the five lakes as long mirrors, by depth
      const lakes = [[300, 1060, 150, 9], [760, 1075, 190, 11], [540, 1130, 300, 18], [200, 1240, 360, 30], [860, 1330, 420, 40]];
      lakes.forEach(([x, y, rx, ry], i) => {
        const g = ctx.createLinearGradient(0, y - ry, 0, y + ry);
        g.addColorStop(0, '#f8d090'); g.addColorStop(0.5, '#d89a78'); g.addColorStop(1, '#6a4a5a');
        ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, TAU); ctx.fill();
        // the sun's path on the water
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.5;
        ctx.fillStyle = '#fff0c8'; ctx.fillRect(x - 6 - (x - 540) * 0.02, y - ry * 0.6, 12, ry * 1.2); ctx.restore();
        ctx.strokeStyle = 'rgba(40,24,20,0.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI); ctx.stroke();
        void i;
      });
      // the two armies, forming in the mist
      const a = 0.62 * E.inOutSine(clamp((t - (b0 - 0.3)) / 1.2));
      const lean = E.inOutCubic(clamp((t - b1) / 0.8));
      army(ctx, T, -1, a, lean);
      army(ctx, T, 1, a, lean);
      // mist bands drifting across the plain
      for (let i = 0; i < 4; i++) {
        const y = HZ - 10 + i * 60, drift = Math.sin(T * 0.2 + i) * 80;
        const g = ctx.createLinearGradient(0, y - 40, 0, y + 40);
        g.addColorStop(0, 'rgba(240,200,180,0)'); g.addColorStop(0.5, `rgba(240,200,180,${0.22 - i * 0.04})`); g.addColorStop(1, 'rgba(240,200,180,0)');
        ctx.fillStyle = g; ctx.fillRect(-100 + drift, y - 40, R.W + 200, 80);
      }
      ctx.restore();
      // the light cools a little when the armies meet
      if (lean > 0) { ctx.save(); ctx.globalAlpha = 0.12 * lean; ctx.fillStyle = '#3a4a7a'; ctx.globalCompositeOperation = 'multiply'; ctx.fillRect(0, 0, R.W, R.H); ctx.restore(); }
    },
    post: () => ({ bloom: 0.38, vignette: 0.5, paper: 0.32 }),
  });
})();
