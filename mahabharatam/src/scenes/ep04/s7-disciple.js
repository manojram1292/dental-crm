/*
 * Ep 4 · lines "disciple" and "why" · NEXT (the cliffhanger)
 *  "Vyasa taught it to his disciple Vaishampayana, who first told it aloud at King
 *   Janamejaya's sacrifice." / "But why was that sacrifice held?"
 *
 * disciple: the hermitage, later in the morning. Vyasa, seated, holds out the bound
 *   manuscript; his disciple Vaishampayana (dawn-rose rim) stands before him and receives
 *   it on his name (beats[0]), which is set in gold. On "King" (beats[1]) the hermitage
 *   dissolves into night and fire: Janamejaya's great sacrifice. The king sits enthroned
 *   on the right; Vaishampayana, on the left, recites to the assembly; the sacred fire
 *   burns between them (the court Sauti remembered in episode 1).
 * why: the same court. The smoke over the great fire coils into the shapes of serpents,
 *   rising; on "held" (beats[1]) the fire flares. (Why a snake sacrifice is the next story.)
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP4 = window.EP4;
  const { TAU, clamp, lerp, E, PAL, hash } = R;
  const CH = KIT.characters;

  function court(ctx, T, o = {}) {
    const flare = o.flare || 0, snakes = o.snakes || 0;
    const fl = KIT.flicker(T, 3);
    KIT.vgrad(ctx, 0, R.H, [[0, '#07061a'], [0.45, '#1a1230'], [0.75, '#3a1a18'], [1, '#1a0a06']]);
    // pillars of the sacrificial hall, in the firelight
    for (const x of [70, 250, 830, 1010]) {
      ctx.fillStyle = '#140a08'; ctx.fillRect(x - 26, 420, 52, 1200);
      ctx.fillStyle = R.rgba('#ff9a40', 0.25 * fl); ctx.fillRect(x + (x < 540 ? 20 : -26), 420, 6, 1200);
      ctx.fillStyle = '#1e0e0a'; ctx.fillRect(x - 48, 400, 96, 34);
    }
    ctx.fillStyle = '#120806'; ctx.fillRect(0, 360, R.W, 48);
    // the floor
    KIT.vgrad(ctx, 1500, R.H, [[0, '#3a1c10'], [1, '#120806']]);
    const FX = 540, FY = 1520;
    KIT.fire.pool(ctx, FX, FY + 30, 640, 200, T, 1 + 0.4 * flare);
    KIT.glow(ctx, FX, FY - 260, 900, PAL.saffron, (0.3 + 0.3 * flare) * fl, 'lighter', 0.9);
    // the smoke: rising, and coiling into serpents
    KIT.smoke.draw(ctx, FX, FY - 260, T, { h: 1100, w: 70, strands: 5, alpha: 0.36, color: '#8a7a96', speed: 0.8, seed: 44, curls: 0.9, spread: 0.7, fadeOutAt: 0.75 });
    if (snakes > 0.01) {
      ctx.save();
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      for (let i = 0; i < 3; i++) {
        const a = clamp(snakes * 1.6 - i * 0.3) * 0.85;
        if (a <= 0) continue;
        const x0 = FX + (i - 1) * 150, rise = ((T * 60 + i * 140) % 320);
        const pts = [];
        for (let k = 0; k <= 24; k++) {
          const u = k / 24;
          pts.push([x0 + Math.sin(u * 8 + T * 2 + i) * 46 * (1 - u * 0.4), FY - 360 - u * 520 - rise * 0.3]);
        }
        ctx.globalAlpha = a;
        for (const [col, extra] of [['rgba(255,150,70,0.55)', 6], ['#1e1424', 0]]) {
          ctx.strokeStyle = col;
          for (let k = 1; k <= 24; k++) { ctx.lineWidth = lerp(4, 26, k / 24) + extra; ctx.beginPath(); ctx.moveTo(pts[k - 1][0], pts[k - 1][1]); ctx.lineTo(pts[k][0], pts[k][1]); ctx.stroke(); }
        }
        // the hood at the top
        const h = pts[24];
        ctx.fillStyle = 'rgba(255,150,70,0.55)'; ctx.beginPath(); ctx.ellipse(h[0], h[1] - 14, 38, 48, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#1e1424'; ctx.beginPath(); ctx.ellipse(h[0], h[1] - 14, 34, 44, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = R.rgba('#ff8a40', 0.8 * a); ctx.beginPath(); ctx.arc(h[0] - 10, h[1] - 18, 3.5, 0, TAU); ctx.arc(h[0] + 10, h[1] - 18, 3.5, 0, TAU); ctx.fill();
      }
      ctx.restore();
    }
    // the assembly: seated sages along the back
    for (let i = 0; i < 6; i++) {
      const x = 300 + i * 96, s = 0.26;
      CH.sage.draw(ctx, { x, y: 1440, scale: s, index: i, facing: 'front', pose: 'sit', expression: { look: x < 540 ? 0.4 : -0.4 }, light: { dir: Math.atan2(FY - 1300, FX - x), intensity: fl, front: 0.55 }, t: T, key: 'ct-sage' + i });
    }
    const base = KIT.fire.altar(ctx, FX, FY, 300, T, { light: 1 });
    KIT.fire.draw(ctx, FX, base + 2, 300 + 200 * flare, T, { intensity: 1 + 0.3 * flare, seed: 5 });
    // the king, enthroned on the right
    CH.janamejaya.draw(ctx, { x: 870, y: 1760, scale: 0.6, facing: 'left', pose: 'sit', expression: { look: -0.04 }, light: { dir: Math.atan2(FY - 1300, FX - 870), intensity: fl * (1 + 0.3 * flare), front: 0.15 }, t: T, key: 'ct-king' });
    // Vaishampayana, reciting
    CH.vaishampayana.draw(ctx, { x: 230, y: 1770, scale: 0.6, facing: 'right', pose: { name: 'speak', k: 1 }, expression: { speak: o.speak || 0 }, light: { dir: Math.atan2(FY - 1300, FX - 230), intensity: fl, front: 0.15 }, t: T, key: 'ct-vai' });
  }
  EP4.court = court;

  function fullBuffer(key, draw) {
    const b = R.buffer(key);
    b.clear('#000');
    draw(b.ctx);
    R.resetCtx(b.ctx);
    return b;
  }

  R.scene({
    id: 'disciple',
    fadeIn: 0.6,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const b0 = env.beats[0] ?? dur * 0.3, b1 = env.beats[1] ?? dur * 0.7;
      const rk = E.inOutCubic(clamp((t - (b0 - 1.0)) / 1.0));
      const [vx, vy, vs] = EP4.POS.vyasa;
      EP4.hermitage(ctx, T, { cam: { zoom: 1.04 } });
      ctx.save();
      KIT.camera(ctx, { x: 540, y: 1100, zoom: 1.04 });
      ctx.fillStyle = '#2a2a26'; ctx.beginPath(); ctx.ellipse(vx, vy + 22, 170, 38, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#7a5a36'; ctx.beginPath(); ctx.ellipse(vx - 6, vy + 8, 120, 22, -0.04, 0, TAU); ctx.fill();
      CH.vyasa.draw(ctx, { x: vx, y: vy, scale: vs, facing: 'right', pose: { name: 'bless', base: 'sit', k: E.inOutCubic(clamp((t - b0 - 0.3) / 0.8)) }, light: EP4.sunLight(vx, vy - 400, 0.95), t: T, key: 'd4-vyasa' });
      // the bound manuscript passes between them
      const hx = lerp(vx + 170, 600, rk), hy = lerp(vy - 140, vy - 230, Math.sin(Math.PI * rk) * 0.3 + rk * 0.7);
      if (rk < 0.98) EP4.stack(ctx, hx, hy, 6, { w: 150, bound: true });
      CH.vaishampayana.draw(ctx, { x: 760, y: vy + 20, scale: 0.66, facing: 'left', pose: { name: 'receive', k: Math.min(1, rk * 1.02) }, light: EP4.sunLight(760, vy - 400, 0.95), t: T, key: 'd4-vai' });
      ctx.restore();
      EP4.grass(ctx, T, 1720, 0.85);
      // his name
      const S = env.strings, keys = env.line.display || [];
      const nk = clamp((t - (b0 - 0.12)) / 0.75) * (1 - clamp((t - (b1 - 0.6)) / 0.4));
      if (nk > 0 && keys[0]) {
        const y = 380;
        ctx.save(); ctx.font = R.font(100, 'display', 600); ctx.letterSpacing = '8px';
        const w = ctx.measureText((S[keys[0]] || '').toUpperCase()).width; ctx.restore();
        const size = Math.min(84, (100 * 820) / w);
        KIT.goldText(ctx, (S[keys[0]] || '').toUpperCase(), KIT.CX, y, { size, spacing: 8, weight: 600, alpha: nk, reveal: clamp((t - (b0 - 0.12)) / 0.75), sheen: lerp(-0.3, 1.3, clamp((t - b0 - 0.3) / 1.1)), glow: 0.35, key: 'd4-name' });
        ctx.save(); ctx.globalAlpha = nk * clamp((t - b0 - 0.35) / 0.6); ctx.font = R.font(46, 'caption', 500, 'italic'); ctx.textAlign = 'center';
        ctx.fillStyle = PAL.cream; ctx.shadowColor = 'rgba(0,0,0,0.85)'; ctx.shadowBlur = R.px(12);
        ctx.fillText(S[keys[1]] || '', KIT.CX, y + 64); ctx.restore();
      }
      // dissolve to the king's sacrifice on "King"
      const ck = E.inOutSine(clamp((t - (b1 - 0.3)) / 0.9));
      if (ck > 0.003) {
        const b = fullBuffer('d4-court', (g) => court(g, T, { speak: EP4.mouth(env, t) * 0.6 }));
        ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = ck; ctx.drawImage(b.canvas, 0, 0); ctx.restore();
        R.resetCtx(ctx);
      }
    },
    post: () => ({ bloom: 0.34, vignette: 0.45, paper: 0.3 }),
  });

  R.scene({
    id: 'why',
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const b0 = env.beats[0] ?? 0.3, b1 = env.beats[1] ?? dur * 0.7;
      const snakes = E.inOutSine(clamp((t - (b0 - 0.3)) / 1.6));
      const flare = clamp((t - (b1 - 0.1)) / 0.3) * (1 - 0.4 * clamp((t - b1 - 0.5) / 1.2));
      ctx.save();
      KIT.camera(ctx, { x: 540, y: 1300, zoom: 1 + 0.06 * E.inOutSine(clamp(t / dur)) });
      court(ctx, T, { snakes, flare });
      ctx.restore();
      void hash;
    },
    post: () => ({ bloom: 0.42, vignette: 0.52, paper: 0.3 }),
  });
})();
