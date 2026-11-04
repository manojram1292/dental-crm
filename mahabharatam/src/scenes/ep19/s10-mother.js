/* Ep 19 · line "mother" · "He found Vinata, and learned that she was a slave." · The shore: Garuda alights and bows before Vinata, who kneels with her head covered; on "slave" (beats[1]) Kadru's shadow falls over them both. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP11 = window.EP11;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'mother',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const b1 = env.beats[1] ?? 2.8;
      const land = E.outCubic(clamp(t / 1.2)), sh = E.inOutSine(clamp((t - b1 + 0.6) / 0.8));
      EP11.shore(ctx, T, { cam: { zoom: 1.12, dy: -80 }, after: (g) => {
        const L = { dir: Math.atan2(1080 - 1400, 820 - 540), intensity: 1.05, front: 0.45 };
        CH.vinata.draw(g, { x: 330, y: 2000, scale: 1.0, facing: 'right', pose: { name: 'bow', k: 0.6, slave: true }, light: L, t: T, key: 'm19-vn' });
        CH.garuda.draw(g, { x: 800, y: lerp(1700, 2000, land), scale: 0.7, facing: 'left', pose: land < 0.95 ? { name: 'fly', phase: T * 3 } : { name: 'bow', k: 0.6 }, light: L, t: T, key: 'm19-ga' });
        if (sh > 0.01) { g.save(); g.globalAlpha = 0.55 * sh; g.translate(-120, 2000); g.transform(1, 0, 1.2, 0.35, 0, 0); CH.kadru.shape(g, '#06040a', { x: 0, y: 0, scale: 1.1, facing: 'right', pose: { name: 'point', k: 1 }, t: T }); g.restore(); }
      } });
      void dur;
    },
    post: () => ({ bloom: 0.42, vignette: 0.45, paper: 0.32 }),
  });
})();
