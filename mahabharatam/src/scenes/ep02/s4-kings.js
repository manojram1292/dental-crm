/*
 * Ep 2 · line "kings" · "…struck down the warrior kings. Twenty-one times."
 *
 * Told, not shown: no bodies, no blood. A dark red mural wall; Parashurama's
 * shadow, huge, with the axe raised, pulses on it. On each of the 21 ticks
 * (env.line.ticks, built by the timeline from the script) a king's crown falls
 * from above and lands on the ground in rhythm, tipping over and losing its
 * gold; and a tally mark is cut into the stone band above, in groups of five
 * like a temple wall's count. On "Twenty-one" (beats[0]) the count is shown
 * as XXI.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP2 = window.EP2;
  const { TAU, clamp, lerp, E, PAL, hash } = R;
  const CH = KIT.characters;
  const GROUND = 1170;

  function tallyPos(i) {
    // 4 groups of 5 (four strokes + a slash) and one more
    const g = Math.floor(i / 5), j = i % 5;
    const gx = 150 + g * 168;
    return { g, j, x: gx + Math.min(j, 3) * 28, slash: j === 4, gx };
  }

  R.scene({
    id: 'kings',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const ticks = (env.line.ticks || []).map((x) => x - env.line.start);
      const n = ticks.length || 21;
      const count = ticks.filter((x) => t >= x).length;
      const last = count ? ticks[count - 1] : -9;
      const hit = Math.exp(-Math.max(0, t - last) / 0.12) * (count ? 1 : 0);
      // the wall: dark red plaster, the ground below
      KIT.vgrad(ctx, 0, R.H, [[0, '#120406'], [0.35, '#2a0a0a'], [0.69, '#3a0e0a'], [0.7, '#1a0806'], [1, '#0a0403']]);
      KIT.glow(ctx, 540, 900, 1000, '#c0141c', 0.18 + 0.22 * hit, 'lighter', 0.8);
      // his shadow on the wall: the axe raised, swaying with each blow
      ctx.save();
      ctx.globalAlpha = 0.55;
      const sway = Math.sin(count * 1.3) * 0.03 * (count < n ? 1 : 0);
      ctx.translate(560, GROUND + 20); ctx.rotate(sway); ctx.translate(-560, -(GROUND + 20));
      CH.parashurama.shape(ctx, '#070102', { x: 600, y: GROUND + 20, scale: 0.66, facing: 'left', pose: { name: 'raise-axe', k: 1 }, t: T });
      ctx.restore();
      // fallen standards along the horizon, leaning
      ctx.save(); ctx.strokeStyle = '#120505'; ctx.lineWidth = 7; ctx.fillStyle = '#120505';
      for (let i = 0; i < 6; i++) {
        const x = 80 + i * 190 + hash(i, 4) * 40, a = (hash(i, 5) - 0.5) * 0.9;
        ctx.save(); ctx.translate(x, GROUND); ctx.rotate(a);
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -220); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, -220); ctx.lineTo(70, -200); ctx.lineTo(0, -170); ctx.fill();
        ctx.restore();
      }
      ctx.restore();
      ctx.fillStyle = '#0c0403'; ctx.fillRect(0, GROUND, R.W, R.H - GROUND);
      KIT.vgrad(ctx, GROUND - 2, GROUND + 6, [[0, 'rgba(255,90,60,0.5)'], [1, 'rgba(255,90,60,0)']]);
      // the crowns
      for (let i = 0; i < n; i++) {
        const tk = ticks[i] ?? (i / n) * dur;
        const fall = 0.42, u = (t - (tk - fall)) / fall;
        if (u < 0) continue;
        const x = 150 + ((i * 263) % 740) + hash(i, 9) * 30, s = 0.8 + 0.35 * hash(i, 10);
        const row = Math.floor(i / 7);
        const gy = GROUND + 50 + row * 40 - hash(i, 12) * 10;
        let y, rot, gold;
        if (u < 1) { const e = E.inQuad(u); y = lerp(-160, gy, e); rot = (hash(i, 11) - 0.5) * 0.6 * e; gold = 1; }
        else {
          const d = t - tk;
          const bounce = Math.abs(Math.sin(d * 14)) * Math.exp(-d * 9) * 26;
          y = gy - bounce;
          const side = hash(i, 13) < 0.5 ? -1 : 1;
          rot = side * lerp(0.2, 1.35, E.outBack(clamp(d / 0.35)));
          gold = Math.exp(-d / 0.9);
        }
        const col = R.mix('#3a2410', PAL.gold, 0.25 + 0.75 * gold), line = R.mix('#4a3018', PAL.goldPale, gold);
        EP2.crown(ctx, x, y, s * 1.35, rot, col, line, i);
        if (u >= 1 && t - tk < 0.25) KIT.glow(ctx, x, gy, 120, '#ff6a3a', (1 - (t - tk) / 0.25) * 0.5);
      }
      // the tally band: a carved stone strip
      const by = 290;
      ctx.save();
      ctx.fillStyle = '#1e0d0a'; ctx.fillRect(100, by - 90, 880, 180);
      ctx.strokeStyle = 'rgba(231,181,74,0.35)'; ctx.lineWidth = 2; ctx.strokeRect(112, by - 78, 856, 156);
      ctx.lineCap = 'round';
      for (let i = 0; i < count; i++) {
        const P = tallyPos(i), age = t - ticks[i];
        const cut = E.outCubic(clamp(age / 0.08));
        const hot = Math.exp(-age / 0.3);
        ctx.strokeStyle = R.mix(PAL.goldDeep, '#fff0c0', hot);
        ctx.lineWidth = 9;
        ctx.beginPath();
        if (P.slash) { ctx.moveTo(P.gx - 18, by + 46); ctx.lineTo(lerp(P.gx - 18, P.gx + 104, cut), lerp(by + 46, by - 46, cut)); }
        else { ctx.moveTo(P.x, by - 52); ctx.lineTo(P.x, lerp(by - 52, by + 52, cut)); }
        ctx.stroke();
        if (hot > 0.05) KIT.glow(ctx, P.slash ? P.gx + 40 : P.x, by, 70, '#ffb04a', hot * 0.6);
      }
      ctx.restore();
      // XXI on "Twenty-one"
      const b0 = env.beats[0] ?? dur * 0.6;
      const k = clamp((t - (b0 - 0.05)) / 0.5);
      if (k > 0) {
        KIT.goldText(ctx, env.strings.tallyLabel || 'XXI', KIT.CX, 520, { size: 110, spacing: 14, weight: 700, reveal: E.inOutSine(k), sheen: lerp(-0.3, 1.3, clamp((t - b0) / 1.0)), glow: 0.5, key: 'xxi' });
      }
      void TAU;
    },
    post: () => ({ bloom: 0.4, vignette: 0.6, paper: 0.34 }),
  });
})();
