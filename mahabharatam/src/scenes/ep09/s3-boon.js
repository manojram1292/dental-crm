/*
 * Ep 9 · line "boon" · "Pleased with them, he offered each a boon."
 *
 * Kashyapa, large, raises his hand in blessing on "Pleased" (beats[0]); two small lights
 * kindle in the air and float to the sisters, one to each, on "boon" (beats[1]).
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP9 = window.EP9;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'boon',
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b0 = env.beats[0] ?? 0.1, b1 = env.beats[1] ?? 2.7;
      const bl = E.inOutCubic(clamp((t - b0) / 0.7));
      const fly = E.inOutSine(clamp((t - (b1 - 1.4)) / 1.6));
      EP9.hermitage(ctx, T, {
        glow: 0.55, cam: { zoom: 1.18 + 0.04 * p, dy: 30 },
        after: (g) => {
          CH.kadru.draw(g, { x: 180, y: 1640, scale: 0.86, facing: 'right', pose: 'stand', light: EP9.light(180, 1640), t: T, key: 'b9-kd' });
          CH.vinata.draw(g, { x: 910, y: 1640, scale: 0.84, facing: 'left', pose: 'stand', light: EP9.light(910, 1640), t: T, key: 'b9-vn' });
          CH.kashyapa.draw(g, { x: 560, y: 1540, scale: 0.9, facing: 'left', pose: { name: 'bless', base: 'sit', k: bl }, light: EP9.light(560, 1540), t: T, key: 'b9-ks' });
          if (bl > 0.3) {
            const a = clamp((bl - 0.3) / 0.4);
            for (const [tx, col] of [[260, '#ece084'], [830, '#ffc0d8']]) {
              const x = lerp(470, tx, fly), y = lerp(930, 1000, fly) - Math.sin(Math.PI * fly) * 120;
              KIT.glow(g, x, y, 120, col, 0.7 * a);
              g.save(); g.globalAlpha = a; g.fillStyle = '#fffbe8'; g.beginPath(); g.arc(x, y, 10, 0, Math.PI * 2); g.fill(); g.restore();
            }
          }
        },
      });
    },
    post: () => ({ bloom: 0.42, vignette: 0.42, paper: 0.34 }),
  });
})();
