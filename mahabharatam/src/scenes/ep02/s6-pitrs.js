/*
 * Ep 2 · line "pitrs" · "His ancestors appeared, and asked him to stop. He did — and the land became holy."
 *
 * The storm parts: a silver radiance opens above, and three Pitrs descend,
 * robes trailing upward, settling by "appeared" (beats[0]). Parashurama stands
 * on the shore of a red lake, below, axe still raised. On "stop" (beats[1])
 * the ancestors hold out their palms; on "did" (beats[2]) he lowers the axe,
 * blade to the earth, head bowed. From then until "holy" (beats[3]) the lake
 * clears from red to clean sacred water and lotuses open on it.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP2 = window.EP2;
  const { TAU, clamp, lerp, E, hash } = R;
  const CH = KIT.characters;
  const HZ = 1160;                                  // horizon
  const PITRS = [{ x: 470, y: 840, i: 0, d: 0.15 }, { x: 680, y: 770, i: 1, d: 0 }, { x: 880, y: 860, i: 2, d: 0.3 }];

  function lake(ctx, T, clear, a) {
    const cx = 560, cy = 1745, rx = 640, ry = 200;
    ctx.save();
    ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, TAU); ctx.clip();
    const g = ctx.createLinearGradient(0, cy - ry, 0, cy + ry);
    g.addColorStop(0, R.mix('#8a1a14', '#9ad0d8', clear)); g.addColorStop(0.35, R.mix('#5a0a0c', '#3a8890', clear)); g.addColorStop(1, R.mix('#2a0406', '#123a44', clear));
    ctx.fillStyle = g; ctx.fillRect(cx - rx, cy - ry, rx * 2, ry * 2);
    // reflections of the silver light: horizontal glints
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 26; i++) {
      const y = cy - ry + 20 + hash(i, 3) * ry * 1.7, x = cx + (hash(i, 4) - 0.5) * rx * 1.4 + Math.sin(T * 0.8 + i) * 20;
      const w = 40 + hash(i, 5) * 120;
      ctx.globalAlpha = (0.08 + 0.25 * clear) * (0.5 + 0.5 * Math.sin(T * 2.2 + i * 1.7)) * a;
      ctx.fillStyle = clear > 0.5 ? '#e8fff8' : '#ff8a6a';
      ctx.fillRect(x - w / 2, y, w, 2.5);
    }
    ctx.restore();
    ctx.save(); ctx.strokeStyle = R.mix('#c0603a', '#d8f0e8', clear); ctx.globalAlpha = 0.5; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke(); ctx.restore();
  }

  R.scene({
    id: 'pitrs',
    fadeIn: 0.5,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur, 0, 1.3);
      const [bA, bS, bD, bH] = env.beats.length >= 4 ? env.beats : [dur * 0.15, dur * 0.4, dur * 0.52, dur * 0.88];
      const open = E.inOutSine(clamp(t / Math.max(0.6, bA)));          // the sky opens
      const calm = E.inOutSine(clamp((t - bD + 0.2) / 1.2));            // after "did"
      const clear = E.inOutCubic(clamp((t - bD) / Math.max(0.8, bH - bD)));
      // sky: storm red → indigo night with a silver opening
      const m3 = (a, b, c, u, v) => { const A = R.mixRgb(a, b, u), C = R.hexToRgb(c); return `rgb(${R.lerp(A[0], C[0], v) | 0},${R.lerp(A[1], C[1], v) | 0},${R.lerp(A[2], C[2], v) | 0})`; };
      KIT.vgrad(ctx, 0, HZ + 20, [[0, R.mix('#12060c', '#0a0d24', open)], [0.6, R.mix('#3a0a10', '#1c2350', open)], [1, m3('#7a1a10', '#4a3a6a', '#c8a888', open, calm * open)]]);
      KIT.glow(ctx, 680, 260, 900, '#b8c8ff', 0.45 * open, 'lighter', 0.8);
      KIT.glow(ctx, 680, 200, 360, '#ffffff', 0.35 * open);
      // light shafts from the opening
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 7; i++) {
        const a = -0.5 + i * 0.17 + Math.sin(T * 0.3 + i) * 0.01;
        ctx.globalAlpha = 0.05 * open * (0.6 + 0.4 * hash(i, 2));
        ctx.fillStyle = '#dfe8ff';
        ctx.beginPath(); ctx.moveTo(680, 150); ctx.lineTo(680 + Math.sin(a) * 1600 - 60, 150 + Math.cos(a) * 1600); ctx.lineTo(680 + Math.sin(a) * 1600 + 60, 150 + Math.cos(a) * 1600); ctx.fill();
      }
      ctx.restore();
      // the parting storm clouds at the edges
      ctx.save(); ctx.fillStyle = '#0a0610'; ctx.globalAlpha = 1 - 0.4 * open;
      ctx.beginPath();
      for (let i = 0; i < 8; i++) { const s = i < 4 ? -1 : 1, k = i % 4; KIT.scallopPath(ctx, 540 + s * (420 + 120 * open + k * 40), 140 + k * 170, 200, 90, 9, i * 5, 0.28); }
      ctx.fill(); ctx.restore();
      // the land
      KIT.vgrad(ctx, HZ, R.H, [[0, R.mix('#2a0e0a', '#3a2a24', clear)], [0.4, '#160a08'], [1, '#080404']]);
      ctx.save(); ctx.fillStyle = '#0c0606';
      ctx.beginPath(); ctx.moveTo(0, HZ + 10); for (let i = 0; i <= 10; i++) ctx.lineTo(i * 108, HZ - 20 * Math.abs(Math.sin(i * 1.3))); ctx.lineTo(1080, HZ + 40); ctx.lineTo(0, HZ + 40); ctx.fill(); ctx.restore();
      lake(ctx, T, clear, 1);
      // lotuses open on the cleared water
      const lots = [[260, 1700, 0.8], [520, 1640, 0.65], [760, 1720, 0.9], [420, 1820, 1.0], [900, 1650, 0.6], [640, 1840, 0.95]];
      lots.forEach(([x, y, s], i) => EP2.lotus(ctx, x + Math.sin(T * 0.7 + i) * 4, y, s, clamp((t - (lerp(bD, bH, 0.55) + i * 0.12)) / 0.8), clamp(clear * 1.4)));
      // the Pitrs descend
      for (const P of PITRS) {
        const u = E.outCubic(clamp((t - P.d * 0.6) / Math.max(0.8, bA + 0.2 - P.d * 0.6)));
        const y = lerp(-140, P.y, u);
        const plead = E.inOutCubic(clamp((t - (bS - 0.6)) / 0.7)) * (1 - 0.5 * calm);
        const pose = u < 1 ? { name: 'descend', k: u } : plead > 0.01 ? { name: 'plead', k: plead } : { name: 'bless', k: E.inOutCubic(clamp((t - bA) / 0.8)) * 0.6 };
        CH.pitr.draw(ctx, {
          x: P.x, y, scale: 0.46, facing: 'front', index: P.i, pose, expression: { look: -0.25 },
          light: { dir: -Math.PI / 2, intensity: 0.75 + 0.25 * open, front: 0.3 }, t: T, key: 'pitr' + P.i,
        });
      }
      // Parashurama on the shore: axe raised… then lowered, blade to the earth
      const lower = E.inOutCubic(clamp((t - (bD - 0.55)) / 0.9));
      CH.parashurama.draw(ctx, {
        x: 250, y: 1585, scale: 0.6, facing: 'right',
        pose: lower > 0 ? { name: 'lower-axe', k: lower } : { name: 'raise-axe', k: 1 },
        expression: { mood: t < bS ? 'wrath' : 'sorrow', look: -0.18 * (1 - lower) },
        light: { dir: Math.atan2(-700, 450), intensity: lerp(1.0, 0.6, calm), front: 0.1 }, t: T, key: 'pitrs-p',
      });
      // the holy moment: a soft bloom of clear light over the water
      const h = clamp((t - bH + 0.2) / 0.5) * (1 - 0.6 * clamp((t - bH - 0.5) / 1.2));
      KIT.glow(ctx, 560, 1700, 700, '#c8fff0', 0.22 * h, 'lighter', 0.4);
      void p;
    },
    post: () => ({ bloom: 0.45, vignette: 0.55, paper: 0.3 }),
  });
})();
