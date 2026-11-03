/*
 * Line "asked" · "They asked him for one story — the one he heard at King
 * Janamejaya's great sacrifice."
 *
 * Night in the clearing (the sky has stopped running). The storyteller walks in
 * from the left and stops at the edge of the circle. One by one the sages turn
 * their heads toward him; the fire leans toward him, and its smoke bends his
 * way before rising. On env.beats[0] (the word index set in the script), a
 * vision forms in the smoke: a pillared court, a king enthroned beneath a
 * parasol, the great sacrificial fire and the assembly around it:
 * Janamejaya's sacrifice, where he first heard the story. It wavers like heat.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT;
  const { TAU, clamp, lerp, E, PAL, hash } = R;
  const VW = 900, VH = 640;

  /** The court, drawn once per render scale into an offscreen canvas. */
  let art = null;
  function courtArt() {
    if (art && art.scale === R.scale) return art.c;
    const s = R.scale;
    const c = document.createElement('canvas');
    c.width = Math.round(VW * s); c.height = Math.round(VH * s);
    const g = c.getContext('2d');
    g.scale(s, s);
    const LINE = 'rgba(255,206,130,0.9)', FILL = 'rgba(240,160,80,0.16)', DEEP = 'rgba(250,186,104,0.34)';
    g.lineJoin = 'round'; g.lineCap = 'round';
    const stroke = (w = 3) => { g.strokeStyle = LINE; g.lineWidth = w; g.stroke(); };
    const fill = (f = FILL) => { g.fillStyle = f; g.fill(); };
    // floor + steps
    g.beginPath(); g.rect(40, 560, 820, 10); fill(DEEP);
    g.beginPath(); g.rect(80, 570, 740, 8); fill();
    // roof: entablature, a row of kudu arches, stepped tiers and finials
    g.beginPath(); g.rect(60, 150, 780, 26); fill(DEEP); stroke(2.5);
    for (let i = 0; i < 13; i++) {
      const x = 90 + i * 60;
      g.beginPath(); g.moveTo(x - 18, 150); g.quadraticCurveTo(x, 112, x + 18, 150); fill(); stroke(2);
    }
    for (let k = 0; k < 3; k++) {
      const w = 520 - k * 150, y = 110 - k * 32;
      g.beginPath(); g.rect(450 - w / 2, y, w, 30); fill(k === 2 ? DEEP : FILL); stroke(2);
    }
    for (const x of [300, 450, 600]) { g.beginPath(); g.moveTo(x, 46 - (x === 450 ? 30 : 0)); g.lineTo(x - 9, 60 - (x === 450 ? 30 : 0)); g.lineTo(x + 9, 60 - (x === 450 ? 30 : 0)); g.closePath(); fill(DEEP); }
    g.beginPath(); g.arc(450, 6, 8, 0, TAU); fill(DEEP);
    // pillars with bracket capitals
    for (const x of [100, 220, 330, 570, 680, 800]) {
      g.beginPath(); g.rect(x - 11, 196, 22, 364); fill(); stroke(2.5);
      g.beginPath(); g.moveTo(x - 34, 176); g.lineTo(x + 34, 176); g.lineTo(x + 20, 196); g.lineTo(x - 20, 196); g.closePath(); fill(DEEP); stroke(2);
      for (const y of [260, 380, 500]) { g.beginPath(); g.rect(x - 15, y, 30, 10); fill(DEEP); }
      g.beginPath(); g.rect(x - 20, 545, 40, 15); fill(DEEP);
    }
    // the king, enthroned, beneath the royal parasol
    g.beginPath(); g.rect(395, 470, 110, 90); fill(); stroke(2.5);       // throne
    g.beginPath(); g.moveTo(385, 470); g.lineTo(385, 360); g.quadraticCurveTo(450, 300, 515, 360); g.lineTo(515, 470); fill(FILL); stroke(2.5); // back
    g.save(); g.translate(450, 520); g.scale(0.22, 0.22);
    KIT.sage.draw(g, 'rgba(255,196,112,0.8)', { x: 0, y: 0, s: 1, T: 0, back: false, turn: 0 });
    g.restore();
    g.beginPath(); g.moveTo(436, 410); g.lineTo(450, 368); g.lineTo(464, 410); g.closePath(); fill('rgba(255,226,170,0.95)'); // crown (kirita)
    g.beginPath(); g.moveTo(450, 330); g.lineTo(450, 250); stroke(3);
    g.beginPath(); g.ellipse(450, 250, 70, 26, 0, Math.PI, TAU); g.closePath(); fill(DEEP); stroke(2.5);
    for (let i = 0; i < 7; i++) { g.beginPath(); g.arc(388 + i * 20.7, 254, 4, 0, TAU); fill('rgba(255,232,178,0.9)'); }
    // the great sacrificial fire before him
    g.beginPath(); g.rect(410, 600 - 18, 80, 18); fill(DEEP);
    for (let k = 0; k < 5; k++) {
      const x = 425 + k * 12.5, h = 40 + 26 * Math.sin(k * 1.9 + 1) ** 2;
      g.beginPath(); g.moveTo(x - 9, 582); g.quadraticCurveTo(x - 6, 582 - h * 0.6, x + 3, 582 - h); g.quadraticCurveTo(x + 4, 582 - h * 0.4, x + 9, 582); g.closePath(); fill('rgba(255,214,140,0.75)');
    }
    // the assembly: seated figures in two rows either side
    for (const side of [-1, 1]) {
      for (let row = 0; row < 2; row++) {
        for (let k = 0; k < 3; k++) {
          const x = 450 + side * (120 + k * 62 + row * 26), y = 560 - row * 26;
          g.save(); g.translate(x, y); g.scale(0.13 - row * 0.02, 0.13 - row * 0.02);
          KIT.sage.draw(g, row ? 'rgba(240,170,90,0.5)' : 'rgba(255,196,112,0.72)', { x: 0, y: 0, s: 1, T: 0, back: false, turn: -side * 0.8 });
          g.restore();
        }
      }
    }
    art = { c, scale: s };
    return c;
  }

  function drawVision(ctx, T, a, settle) {
    if (a <= 0.003) return;
    const src = courtArt();
    const b = R.buffer('vision', VW, VH);
    b.clear();
    const g = b.ctx;
    // heat-shimmer: copy the art in horizontal strips, each nudged sideways
    const strip = 6, s = R.scale;
    g.setTransform(1, 0, 0, 1, 0, 0);
    for (let y = 0; y < VH; y += strip) {
      const off = (Math.sin(y * 0.045 + T * 2.6) * 7 + Math.sin(y * 0.013 - T * 1.3) * 5) * (1.2 - settle) * s;
      const sy = Math.round(y * s), sh = Math.round((y + strip) * s) - sy;
      g.drawImage(src, 0, sy, src.width, sh, off, sy, src.width, sh);
    }
    g.setTransform(s, 0, 0, s, 0, 0);
    // soft oval mask, and it rises out of the smoke from the bottom
    g.globalCompositeOperation = 'destination-in';
    const m = g.createRadialGradient(VW / 2, VH * 0.62, 60, VW / 2, VH * 0.6, VW * 0.52);
    m.addColorStop(0, 'rgba(0,0,0,1)'); m.addColorStop(0.45, 'rgba(0,0,0,0.7)'); m.addColorStop(0.8, 'rgba(0,0,0,0.22)'); m.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = m; g.fillRect(0, 0, VW, VH);
    const rise = E.outCubic(clamp(a * 1.2));
    const lg = g.createLinearGradient(0, VH, 0, 0);
    lg.addColorStop(0, 'rgba(0,0,0,1)'); lg.addColorStop(clamp(rise), 'rgba(0,0,0,1)'); lg.addColorStop(clamp(rise + 0.25), 'rgba(0,0,0,0)');
    g.fillStyle = lg; g.fillRect(0, 0, VW, VH);
    g.globalCompositeOperation = 'source-over';
    const k = 0.92, x0 = 540 - (VW / 2) * k, y0 = 190;
    KIT.glow(ctx, 540, y0 + VH * 0.6 * k, 520, PAL.saffron, 0.26 * a, 'lighter', 0.8);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = clamp(a) * 0.8;
    ctx.drawImage(b.canvas, x0, y0, VW * k, VH * k);
    ctx.restore();
    // smoke drifting through the vision keeps it inside the smoke
    KIT.smoke.draw(ctx, 540, y0 + VH * k, T, { h: VH * k, w: 120, strands: 3, alpha: 0.22 * a, color: '#b7a6c0', speed: 0.7, seed: 41, curls: 0.6, fadeOutAt: 0.7 });
  }

  R.scene({
    id: 'asked',
    fadeIn: 0,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur, 0, 1.3), dur = env.dur;
      // he walks in from the left and stops at the edge of the circle
      const walk = clamp(t / 1.7);
      const x = lerp(-200, 225, E.outCubic(walk));
      const stride = 1 - E.inCubic(clamp((walk - 0.55) / 0.45));
      const teller = { x, y: 1660, s: 0.62, flip: true, walk: E.outCubic(walk) * 5.2, stride, T, wind: 0.5, look: 0.04 };
      // the sages turn to him, one after another (nearest first)
      const order = [0, 6, 1, 5, 2, 4, 3];
      const turn = (i) => -E.inOutCubic(clamp((t - 0.55 - order.indexOf(i) * 0.16) / 0.55)) * (i === 0 || i === 6 ? 0.6 : 0.95);
      // the fire leans toward him; its smoke bends his way, then rises
      const lean = -0.55 * E.inOutSine(clamp((t - 0.9) / 1.0)) + 0.06 * Math.sin(T * 1.7);
      const vb = env.beats[0] ?? dur * 0.45;
      const va = clamp((t - (vb - 0.25)) / 1.3);
      KIT.ashram.draw(ctx, T, {
        cycle: 0.75, speed: 0, tellerFront: true,
        fireLean: lean,
        turn,
        smoke: { alpha: 0.42, lean: -160 * clamp((t - 0.9) / 1.2), h: 980 },
        cam: { zoom: 1.0 - 0.05 * E.inOutSine(p), dy: 70 * E.inOutSine(p) },
        teller,
        vision: (g) => drawVision(g, T, E.inOutSine(va), E.outCubic(clamp((t - vb) / 2.4))),
      });
    },
    post: () => ({ bloom: 0.36, vignette: 0.5, paper: 0.32 }),
  });
})();
