/*
 * Ep 2 · line "answer" · sauti: "In a sacred land… called Samantapanchaka."
 *
 * Close on Sauti, seated, facing the fire (right); his hand opens as he
 * speaks. On "land" (beats[0]) the fire flares: a column of sparks, and the
 * smoke above opens into a vision drawn in gold like an old map: a ring of
 * boundary (samanta, "all around"), two rivers (Sarasvati and Drishadvati),
 * five lakes (panchaka) in a quincunx, groves, and four gates. On the name
 * (beats[1]) the map settles and the name is written in gold above it.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP2 = window.EP2;
  const { TAU, clamp, lerp, E, PAL, hash } = R;
  const CH = KIT.characters;
  const MX = 610, MY = 610, MR = 280;     // the map's centre and radius on screen

  /** Map strokes, as polylines in plan coordinates (0..1000) → drawn with a reveal 0..1. */
  let MAP = null;
  function mapArt() {
    if (MAP) return MAP;
    const S = [];
    const ring = (r, n = 96) => Array.from({ length: n + 1 }, (_, i) => [500 + Math.cos((i / n) * TAU) * r, 500 + Math.sin((i / n) * TAU) * r]);
    S.push({ pts: ring(470), w: 5, kind: 'ring' }, { pts: ring(448), w: 2, kind: 'ring' });
    // four gates on the ring
    for (let q = 0; q < 4; q++) {
      const a = q * Math.PI / 2, c = Math.cos(a), s = Math.sin(a), P = (r, o) => [500 + c * r - s * o, 500 + s * r + c * o];
      S.push({ pts: [P(430, -36), P(500, -36), P(500, 36), P(430, 36)], w: 4, kind: 'gate' });
    }
    // two rivers, flowing from the top right down past the field
    const river = (x0, bend, ph) => Array.from({ length: 40 }, (_, i) => { const u = i / 39; return [x0 + Math.sin(u * 5 + ph) * 30 + bend * u * u, 20 + u * 960]; });
    S.push({ pts: river(130, 60, 0), w: 6, kind: 'river' }, { pts: river(880, -70, 2), w: 6, kind: 'river' });
    // the five lakes
    for (let i = 0; i < 5; i++) {
      const [cx, cy, r] = EP2.LAKES[i];
      const pts = Array.from({ length: 41 }, (_, j) => { const a = (j / 40) * TAU, rr = r * 0.8 * (1 + 0.14 * Math.sin(a * 3 + i * 1.3) + 0.08 * Math.sin(a * 5 + i * 2.1)); return [cx + Math.cos(a) * rr * 1.08, cy + Math.sin(a) * rr * 0.92]; });
      S.push({ pts, w: 4, kind: 'lake', i });
    }
    // groves: little mural trees (trunk + three-lobed crown) around the ring
    const trees = [];
    for (let k = 0; k < 14; k++) {
      const a = (k / 14) * TAU + 0.2, r = 380 + (k % 3) * 18;
      trees.push([500 + Math.cos(a) * r, 500 + Math.sin(a) * r]);
    }
    MAP = { S, trees };
    return MAP;
  }

  function drawMap(ctx, T, reveal, a, settle) {
    if (a <= 0.01) return;
    const art = mapArt();
    ctx.save();
    ctx.translate(MX, MY);
    const sc = (MR / 500) * lerp(0.86, 1, E.outCubic(settle));
    ctx.scale(sc, sc * lerp(0.7, 1, E.outCubic(settle)));  // it rises from the fire flattened, then faces us
    ctx.rotate(lerp(-0.25, 0, E.outCubic(settle)));
    ctx.translate(-500, -500);
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    // a disc of warm haze behind the map
    KIT.glow(ctx, 500, 500, 640, PAL.saffron, 0.22 * a);
    art.S.forEach((s, i) => {
      const start = (i / art.S.length) * 0.55, u = clamp((reveal - start) / 0.45);
      if (u <= 0) return;
      const n = Math.max(2, Math.floor(s.pts.length * u));
      ctx.globalAlpha = a * (s.kind === 'river' ? 0.75 : 0.95);
      ctx.strokeStyle = s.kind === 'river' ? '#9fc8e0' : s.kind === 'lake' ? '#ffd890' : PAL.goldPale;
      ctx.lineWidth = s.w;
      ctx.shadowColor = PAL.saffron; ctx.shadowBlur = R.px(14);
      ctx.beginPath(); R.polyPath(ctx, s.pts.slice(0, n), false); ctx.stroke();
      if (s.kind === 'lake' && u > 0.95) {
        // hatched water
        ctx.globalAlpha = a * 0.35; ctx.lineWidth = 2;
        const [cx, cy, r] = EP2.LAKES[s.i];
        for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(cx - r * 0.55, cy + k * r * 0.22 + Math.sin(T * 2 + k) * 3); ctx.quadraticCurveTo(cx, cy + k * r * 0.22 - 10, cx + r * 0.55, cy + k * r * 0.22 + Math.sin(T * 2 + k + 1) * 3); ctx.stroke(); }
      }
    });
    ctx.shadowBlur = 0;
    // groves
    art.trees.forEach(([x, y], k) => {
      const u = clamp((reveal - 0.5 - k * 0.02) / 0.2);
      if (u <= 0) return;
      ctx.globalAlpha = a * u * 0.8; ctx.fillStyle = PAL.gold;
      ctx.fillRect(x - 2, y - 4, 4, 22);
      ctx.beginPath(); KIT.scallopPath(ctx, x, y - 20, 18 * u, 15 * u, 6, k, 0.3); ctx.fill();
    });
    // the centre: a small lotus mark
    ctx.globalAlpha = a * clamp((reveal - 0.8) / 0.2);
    KIT.ornament(ctx, 500, 500 - 150, 0, 1, 1);
    ctx.restore();
  }

  R.scene({
    id: 'answer',
    fadeIn: 0.35,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const fl = KIT.flicker(T, 0);
      const b0 = env.beats[0] ?? dur * 0.25, b1 = env.beats[1] ?? dur * 0.6;
      const flare = clamp((t - (b0 - 0.1)) / 0.25) * (1 - 0.55 * clamp((t - b0 - 0.6) / 1.6));
      // night, the fire to the right below
      KIT.vgrad(ctx, 0, R.H, [[0, '#06071a'], [0.45, '#151634'], [0.8, '#2a1520'], [1, '#2a120a']]);
      KIT.glow(ctx, 780, 1500, 900, PAL.saffron, (0.4 + 0.35 * flare) * fl);
      // smoke climbing from the fire to where the map forms
      KIT.smoke.draw(ctx, 780, 1380, T, { h: 1100, w: 60, strands: 4, alpha: 0.32 + 0.1 * flare, color: '#a597b5', speed: 0.9, seed: 21, curls: 0.8, lean: -220, spread: 0.6, fadeOutAt: 0.7 });
      // the vision
      const va = E.inOutSine(clamp((t - b0) / 0.9));
      const reveal = clamp((t - b0) / Math.max(0.8, b1 - b0 + 0.4));
      drawMap(ctx, T, reveal, va * (0.9 + 0.1 * fl), clamp((t - b0) / Math.max(0.9, b1 - b0)));
      // the fire in its altar, flaring on "land"
      const base = KIT.fire.altar(ctx, 790, 1530, 260, T, { light: 1 });
      KIT.fire.draw(ctx, 790, base + 2, 260 + 220 * flare, T, { intensity: 1 + 0.35 * flare, seed: 0, lean: -0.15 });
      KIT.embers(ctx, T, { x: 790, y: 1300, spread: 160, rate: 40 * flare, life: 2.2, rise: 520, sway: 60, size: 3, alpha: flare, seed: 202, lean: -0.6 });
      // Sauti, seated, speaking toward the fire and the vision
      const k = E.inOutCubic(clamp((t - 0.15) / 0.9));
      CH.sauti.draw(ctx, {
        x: 215, y: 1640, scale: 0.88, facing: 'right', pose: { name: 'speak', base: 'sit', k },
        expression: { speak: EP2.mouth(env, t), look: -0.06 * va },
        light: { dir: Math.atan2(-120, 560), intensity: Math.min(1.25, fl + 0.3 * flare), front: 0.15 }, t: T, key: 'answer-sauti',
      });
      // the name, in gold above the map, on its word
      const nk = clamp((t - (b1 - 0.1)) / 0.7);
      if (nk > 0) {
        const S = env.strings, keys = env.line.display || ['landName', 'landEpithet'];
        const name = (S[keys[0]] || '').toUpperCase();
        ctx.save(); ctx.font = R.font(100, 'display', 600); ctx.letterSpacing = '6px';
        const w = ctx.measureText(name).width; ctx.restore();
        const size = Math.min(80, (100 * 820) / w), y = 238;
        KIT.glow(ctx, KIT.CX, y - size * 0.35, 520, PAL.saffron, 0.22 * E.outCubic(nk) * fl, 'lighter', 0.35);
        KIT.goldText(ctx, name, KIT.CX, y, { size, spacing: 6, weight: 600, reveal: E.inOutSine(nk), sheen: lerp(-0.3, 1.3, clamp((t - b1 - 0.3) / 1.1)), glow: 0.35, key: 'land-name' });
        if (keys[1] && S[keys[1]]) {
          const ka = E.outCubic(clamp((t - b1 - 0.35) / 0.6));
          ctx.save(); ctx.globalAlpha = ka; ctx.font = R.font(50, 'caption', 500, 'italic'); ctx.textAlign = 'center';
          ctx.fillStyle = PAL.cream; ctx.shadowColor = 'rgba(0,0,0,0.85)'; ctx.shadowBlur = R.px(12);
          ctx.fillText(S[keys[1]], KIT.CX, y + 62 + (1 - ka) * 12); ctx.restore();
        }
      }
      void hash;
    },
    post: () => ({ bloom: 0.42, vignette: 0.5, paper: 0.3 }),
  });
})();
