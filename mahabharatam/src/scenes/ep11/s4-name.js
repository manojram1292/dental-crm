/*
 * Ep 11 · line "name" · "Uchchaihshravas, king of horses, honoured by the gods."
 *
 * Close and LARGE: the horse walks left through the surf at sunrise, the camera tracking
 * him; his name card in gold (beats[0], after a 300 ms rest; a bell). On "gods" (beats[2])
 * the gods' honour falls on him as a slow rain of flowers and petals of light from above
 * (pushpa-vrishti, the mural way of showing heaven's praise).
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP11 = window.EP11;
  const { clamp, E, lerp, hash, TAU } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'name',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b0 = env.beats[0] ?? 0.3, b2 = env.beats[2] ?? 4.3;
      const la = clamp((t - b0 + 0.1) / 0.5) * (1 - clamp((t - dur + 0.4) / 0.4));
      const fl = clamp((t - b2 + 0.8) / 1.0);
      window.EP10.shore(ctx, T, {
        cam: { zoom: 1.12, dx: lerp(40, -40, p), dy: 60 },
        after: (g) => {
          CH.horse.draw(g, { x: lerp(700, 520, p), y: 1360, scale: 0.66, facing: 'left', pose: { name: 'walk', phase: T * 3.6, wind: 0.9 }, light: { dir: Math.atan2(1080 - 760, 820 - 600), intensity: 1.0, front: 0.35 }, t: T, key: 'n11-horse' });
          EP11.surf(g, 1330, T, 1, { color: '#fff4ec', deep: '#d8b0b8', deep2: '#7a6a90' });
        },
      });
      if (fl > 0.01) {
        ctx.save();
        for (let i = 0; i < 46; i++) {
          const life = ((t - b2 + 0.8) * 0.28 + hash(i, 61)) % 1.2, x = 80 + hash(i, 62) * 920 + Math.sin(T * 1.5 + i) * 30, y = -40 + life * 1500;
          ctx.globalAlpha = fl * 0.9 * clamp(1.2 - life);
          ctx.fillStyle = ['#ffd27a', '#ffb0c8', '#fff4dc'][i % 3];
          ctx.save(); ctx.translate(x, y); ctx.rotate(T * 1.2 + i);
          ctx.beginPath(); ctx.ellipse(0, 0, 11, 6, 0, 0, TAU); ctx.fill(); ctx.restore();
        }
        ctx.restore();
      }
      EP11.plaque(ctx, env.strings.horseName, env.strings.horseEpithet, KIT.CX, 360, la, { size: 58, key: 'n11-name' });
    },
    post: () => ({ bloom: 0.32, vignette: 0.36, paper: 0.32 }),
  });
})();
