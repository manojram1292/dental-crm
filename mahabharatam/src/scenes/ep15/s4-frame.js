/*
 * Ep 15 · line "frame" · FRAME (Sauti) · "So Narayana wove an illusion."
 * A fifth angle on the Naimisha fire: low, behind the flames, Sauti seen through the heat; on
 * "illusion" (beats[1]) the smoke twists into a violet veil and shimmering motes.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP15 = window.EP15;
  const { clamp, E, hash } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'frame',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b1 = env.beats[1] ?? 1.8;
      const v = E.inOutSine(clamp((t - b1 + 0.6) / 1.0));
      const fl = KIT.flicker(T, 0), F = KIT.ashram.FIRE;
      KIT.ashram.draw(ctx, T, {
        cycle: 0.77, speed: 0, hide: [0, 1, 2, 5, 6], turn: () => 0.2,
        smoke: { alpha: 0.35, lean: 3 }, fireH: 330,
        cam: { zoom: 1.6 + 0.06 * p, dx: 60, dy: -420 },
        after: (g) => {
          CH.sauti.draw(g, { x: 760, y: 1440, scale: 0.72, facing: 'left', pose: { name: 'speak', base: 'sit', k: 1 }, expression: { look: 0.05, speak: EP15.mouth(env, t) }, light: { dir: Math.atan2(F.y - 1150, F.x - 760), intensity: fl * 1.2, front: 0.55 }, t: T, key: 'f15-sauti' });
        },
      });
      if (v > 0.01) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 30; i++) { const life = (T * 0.3 + hash(i, 21)) % 1; KIT.glow(ctx, 540 + Math.sin(life * 6 + i) * 180, 1100 - life * 900, 60, i % 2 ? '#c8a0ff' : '#ffd0f0', 0.5 * v * Math.sin(Math.PI * life)); }
        ctx.restore();
      }
    },
    post: () => ({ bloom: 0.46, vignette: 0.55, paper: 0.32 }),
  });
})();
