/*
 * Ep 5 · line "rite" · "At Kurukshetra, Janamejaya and his brothers were performing a long ritual."
 *
 * NEW PLACE, NEW LIGHT: the sacrificial enclosure at Kurukshetra by day (EP5.enclosure):
 * a high teal-and-ochre sky, the sun to the right, the pavilion, three sacrificial posts,
 * the altar fire pale in daylight. Janamejaya (left, facing the fire) pours ghee from the
 * ladle; his three brothers sit across the fire. On "Kurukshetra" the place name rises in
 * gold; on "brothers" each brother's name appears under him; the camera drifts in slowly.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP5 = window.EP5;
  const { clamp, E } = R;
  const CH = KIT.characters;
  const G = 1500;

  R.scene({
    id: 'rite',
    fadeIn: 0.6,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b0 = env.beats[0] ?? 0.4, b1 = env.beats[1] ?? dur * 0.5;
      const offer = 0.6 + 0.4 * Math.sin(T * 1.4);
      const names = (env.strings.brothers || '').split(' · ');
      const z = 1.12 + 0.07 * E.inOutSine(p);
      EP5.enclosure(ctx, T, {
        cam: { zoom: z, dy: -70 - 10 * p }, fireH: 170,
        after: (g) => {
          CH.janamejaya.draw(g, { x: 290, y: G, scale: 0.6, facing: 'right', pose: { name: 'offer', k: offer }, light: EP5.sunLight(300, 1100), t: T, key: 'r5-king' });
          [0, 1, 2].forEach((i) => {
            const x = 690 + i * 135;
            CH.prince.draw(g, { x, y: G + 10 - i * 4, scale: 0.5, index: i, facing: 'left', pose: 'sit', expression: { look: Math.sin(T * 0.7 + i) * 0.04 }, light: EP5.sunLight(x, 1150), t: T, key: 'r5-p' + i });
          });
        },
      });
      // the place name, then the brothers' names
      const la = clamp((t - (b0 - 0.1)) / 0.6) * (1 - clamp((t - (b0 + 2.6)) / 0.6));
      EP5.label(ctx, (env.strings.placeKurukshetra || 'Kurukshetra').toUpperCase(), KIT.CX, 380, la, { size: 66, key: 'r5-place', sheen: (t - b0) / 2 });
      const na = clamp((t - (b1 - 0.1)) / 0.5) * (1 - clamp((t - dur + 0.4) / 0.4));
      if (na > 0) {
        ctx.save(); ctx.globalAlpha = na; ctx.font = R.font(30, 'caption', 600, 'italic'); ctx.textAlign = 'center';
        ctx.fillStyle = R.PAL.goldPale; ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = R.px(8);
        names.forEach((n, i) => ctx.fillText(n, 668 + i * 148, 905 + i * 4));
        ctx.restore();
      }
    },
    post: () => ({ bloom: 0.28, vignette: 0.4, paper: 0.34 }),
  });
})();
