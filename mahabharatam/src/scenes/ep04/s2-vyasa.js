/*
 * Ep 4 · line "vyasa" · "The sage Vyasa held the whole epic… in his mind."
 *
 * A new place and a new light: Vyasa's hermitage in the Himalayan foothills, morning
 * (EP4.hermitage: snow peaks, mist in the valleys, deodars, a thatched hut, a stream;
 * the sun low on the left). Vyasa sits on a stone in meditation, his soft gold halo
 * against the morning. On his name (beats[0]) it is set in gold; on "epic" (beats[1])
 * the verses kindle as small marks of light and circle his head: the whole story, held
 * in one mind. The camera pushes in.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP4 = window.EP4;
  const { clamp, lerp, E, PAL } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'vyasa',
    fadeIn: 0.8,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur, 0, 1.3);
      const b0 = env.beats[0] ?? 0.6, b1 = env.beats[1] ?? dur * 0.5;
      const z = 1 + 0.08 * E.inOutSine(p);
      EP4.hermitage(ctx, T, { cam: { zoom: z, dy: 20 * p }, sunUp: lerp(0.85, 1, p) });
      ctx.save();
      KIT.camera(ctx, { x: 540, y: 1300, zoom: z });
      // his seat: a flat stone with a deer-skin
      ctx.fillStyle = '#2a2a26'; ctx.beginPath(); ctx.ellipse(540, 1365, 210, 46, 0, 0, R.TAU); ctx.fill();
      ctx.fillStyle = '#7a5a36'; ctx.beginPath(); ctx.ellipse(530, 1348, 150, 26, -0.04, 0, R.TAU); ctx.fill();
      CH.vyasa.draw(ctx, { x: 540, y: 1340, scale: 0.86, facing: 'right', pose: 'sit', expression: { look: 0.05 }, light: EP4.sunLight(540, 1100, 0.95), t: T, key: 'v4' });
      const va = clamp((t - (b1 - 0.3)) / 1.6);
      EP4.verses(ctx, T, 532, 950, 300, va, { n: 46, seed: 11 });
      ctx.restore();
      EP4.grass(ctx, T, 1700, 0.9);
      // his name
      const S = env.strings, keys = env.line.display || [];
      const nk = clamp((t - (b0 - 0.12)) / 0.75);
      if (nk > 0 && keys[0]) {
        const y = 330;
        ctx.save(); ctx.globalAlpha = 0.7 * nk;
        const g = ctx.createLinearGradient(0, y - 150, 0, y + 150);
        g.addColorStop(0, 'rgba(20,24,44,0)'); g.addColorStop(0.5, 'rgba(20,24,44,0.55)'); g.addColorStop(1, 'rgba(20,24,44,0)');
        ctx.fillStyle = g; ctx.fillRect(0, y - 150, R.W, 300); ctx.restore();
        KIT.goldText(ctx, (S[keys[0]] || '').toUpperCase(), KIT.CX, y, { size: 104, spacing: 14, weight: 600, reveal: E.inOutSine(nk), sheen: lerp(-0.3, 1.3, clamp((t - b0 - 0.3) / 1.1)), glow: 0.35, key: 'v4-name' });
        const ka = clamp((t - b0 - 0.35) / 0.6);
        ctx.save(); ctx.globalAlpha = ka; ctx.font = R.font(48, 'caption', 500, 'italic'); ctx.textAlign = 'center';
        ctx.fillStyle = PAL.cream; ctx.shadowColor = 'rgba(0,0,0,0.85)'; ctx.shadowBlur = R.px(12);
        ctx.fillText(S[keys[1]] || '', KIT.CX, y + 72); ctx.restore();
      }
    },
    post: () => ({ bloom: 0.3, vignette: 0.42, paper: 0.3 }),
  });
})();
