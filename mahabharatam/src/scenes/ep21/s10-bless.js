/* Ep 21 · line "bless" · "She blessed him: may the Wind guard your wings, the Moon your back, Fire your head, and the Sun all of you." · Garuda rises into the night-blue sky over the sea; the four guardians appear round him as painted signs on the beats. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP21 = window.EP21;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'bless',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = E.inOutSine(clamp(t / dur));
      const bs = [0, 1, 2, 3].map((i) => env.beats[i] ?? 1 + i);
      const sun = E.outCubic(clamp((t - bs[3] + 0.2) / 0.6));
      EP21.night(ctx, T, {});
      const gx = 540, gy = lerp(1650, 1500, p);
      EP21.sign(ctx, 'sun', gx, gy - 520, 1.2, T, sun);
      CH.garuda.draw(ctx, { x: gx, y: gy, scale: 0.6, facing: 'left', pose: { name: 'fly', phase: T * 3.4 }, light: { dir: -Math.PI / 2 - 0.2, intensity: lerp(1.0, 1.25, sun), front: lerp(0.5, 0.7, sun) }, t: T, key: 'b21-ga' });
      const S = env.strings;
      const signs = [['wind', 200, gy - 760, 0.75, S.windSign], ['moon', 880, gy - 280, 0.62, S.moonSign], ['fire', 540, gy - 1120, 0.6, S.fireSign]];
      signs.forEach(([k, x, y, s, label], i) => {
        const a = E.outCubic(clamp((t - bs[i] + 0.2) / 0.5));
        EP21.sign(ctx, k, x, y, s, T, a);
        ctx.save(); ctx.globalAlpha = a; ctx.font = R.font(44, 'display', 600); ctx.textAlign = 'center'; ctx.fillStyle = '#f6e2a8'; ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = R.px(8); ctx.fillText(label.toUpperCase(), x, y + 200 * s); ctx.restore();
      });
      ctx.save(); ctx.globalAlpha = sun; ctx.font = R.font(44, 'display', 600); ctx.textAlign = 'center'; ctx.fillStyle = '#fff2c0'; ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = R.px(8); ctx.fillText(S.sunSign.toUpperCase(), 820, gy - 520); ctx.restore();
    },
    post: () => ({ bloom: 0.44, vignette: 0.45, paper: 0.3 }),
  });
})();
