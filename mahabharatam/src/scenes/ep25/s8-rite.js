/* Ep 25 · line "rite" · "In their anger, they began a rite, to bring forth another Indra, who would terrify him." · NEW LIGHT: night, the Valakhilyas' blue-white fire (the hook's image, wider); the flame rises into the shape of a great wing (beats[1..2]). */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP25 = window.EP25;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'rite',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      const b1 = env.beats[1] ?? 2;
      const w = E.inOutSine(clamp((t - b1 + 0.5) / 1.6));
      ctx.save(); KIT.camera(ctx, { x: 540, y: 1300, zoom: lerp(0.85, 0.95, p) });
      EP25.rite(ctx, T, { h: 1000, wing: w, after: (g) => { for (let i = 0; i < 16; i++) { const a = Math.PI + (i / 15) * Math.PI, x = 540 + Math.cos(a) * 420, y = 1640 + Math.sin(a) * -60 + 30; CH.valakhilya.draw(g, { x, y, scale: 0.09, facing: 'front', index: i % 8, pose: { name: 'bless', k: 1 }, light: { dir: Math.atan2(1100 - y, 540 - x), intensity: 1.1, front: 0.6 }, t: T, key: 'vk' + (i % 8) }); } } });
      ctx.restore();
    },
    post: () => ({ bloom: 0.46, vignette: 0.46, paper: 0.3 }),
  });
})();
