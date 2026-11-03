/*
 * Ep 9 · line "wives" · Sauti: "Long ago, the sage Kashyapa had two wives: the sisters Kadru and Vinata."
 *
 * NEW PLACE, NEW LIGHT: Kashyapa's hermitage before sunrise (EP9.hermitage): cool blue-violet,
 * the east glowing low on the right. "Long ago" is set first. Kashyapa sits large under the
 * banyan; on "Kashyapa" (beats[0]) his name; the sisters walk in, Kadru from the left on
 * "Kadru" (beats[1]), Vinata from the right on "Vinata" (beats[2]), each with her name in
 * her own colour.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP9 = window.EP9;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;

  function name(ctx, text, x, y, a, col) {
    if (a <= 0.01) return;
    ctx.save(); ctx.globalAlpha = a; ctx.font = R.font(52, 'display', 600); ctx.letterSpacing = '6px'; ctx.textAlign = 'center';
    ctx.fillStyle = col; ctx.shadowColor = 'rgba(6,6,16,0.95)'; ctx.shadowBlur = R.px(12);
    ctx.fillText(text.toUpperCase(), x, y); ctx.restore();
  }

  R.scene({
    id: 'wives',
    fadeIn: 0.7,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b0 = env.beats[0] ?? 2.2, b1 = env.beats[1] ?? 5.8, b2 = env.beats[2] ?? 7.4;
      const kd = E.outSine(clamp((t - (b1 - 1.6)) / 1.8)), vn = E.outSine(clamp((t - (b2 - 1.6)) / 1.8));
      EP9.hermitage(ctx, T, {
        glow: 0.3 + 0.2 * p, cam: { zoom: 1.04 + 0.04 * p, dy: -30 },
        after: (g) => {
          CH.kashyapa.draw(g, { x: 540, y: 1520, scale: 0.86, facing: 'left', pose: 'sit', light: EP9.light(540, 1520), t: T, key: 'w9-ks' });
          if (kd > 0.01) CH.kadru.draw(g, { x: lerp(-200, 220, kd), y: 1620, scale: 0.86, facing: 'right', pose: kd < 0.98 ? { name: 'walk', phase: T * 4, stride: 0.6 } : 'stand', light: EP9.light(220, 1620), t: T, key: 'w9-kd' });
          if (vn > 0.01) CH.vinata.draw(g, { x: lerp(1280, 870, vn), y: 1620, scale: 0.84, facing: 'left', pose: vn < 0.98 ? { name: 'walk', phase: T * 4, stride: 0.6 } : 'stand', light: EP9.light(870, 1620), t: T, key: 'w9-vn' });
        },
      });
      const la = clamp((t - 0.2) / 0.6) * (1 - clamp((t - (b0 - 0.6)) / 0.5));
      EP9.label(ctx, (env.strings.longAgo || 'Long ago').toUpperCase(), KIT.CX, 300, la, { size: 52, key: 'w9-long' });
      const ka = clamp((t - (b0 - 0.1)) / 0.5) * (1 - clamp((t - (b1 - 0.6)) / 0.4));
      EP9.label(ctx, (env.strings.kashyapaName || 'Kashyapa').toUpperCase(), KIT.CX, 300, ka, { size: 60, key: 'w9-ksn' });
      const na = clamp((t - (b1 - 0.1)) / 0.4) * (1 - clamp((t - dur + 0.3) / 0.3));
      name(ctx, env.strings.kadruName || 'Kadru', 270, 330, na, '#ece084');
      name(ctx, env.strings.vinataName || 'Vinata', 760, 330, clamp((t - (b2 - 0.1)) / 0.4) * (1 - clamp((t - dur + 0.3) / 0.3)), '#ffd0e4');
      const ea = clamp((t - (b2 + 0.1)) / 0.5) * (1 - clamp((t - dur + 0.3) / 0.3));
      if (ea > 0.01) {
        ctx.save(); ctx.globalAlpha = ea; ctx.font = R.font(36, 'caption', 600, 'italic'); ctx.textAlign = 'center';
        ctx.fillStyle = '#f4ecff'; ctx.shadowColor = 'rgba(6,6,16,0.95)'; ctx.shadowBlur = R.px(10);
        ctx.fillText(env.strings.sistersEpithet || '', KIT.CX, 390); ctx.restore();
      }
    },
    post: () => ({ bloom: 0.34, vignette: 0.42, paper: 0.34 }),
  });
})();
