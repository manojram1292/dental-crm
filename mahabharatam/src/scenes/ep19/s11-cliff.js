/* Ep 19 · line "cliff" · NEXT (cliffhanger image) · "And his first task as a slave's son: to carry the serpents." · Kadru points; a heap of her serpent sons rears before Garuda, whose eye burns. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP11 = window.EP11;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'cliff',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b1 = env.beats[1] ?? 2.5;
      const rise = E.outCubic(clamp((t - b1 + 0.8) / 1.0));
      EP11.shore(ctx, T, { cam: { zoom: 1.08 + 0.05 * p, dy: -40 }, after: (g) => {
        const L = { dir: Math.atan2(1080 - 1400, 820 - 540), intensity: 1.05, front: 0.45 };
        CH.garuda.draw(g, { x: 840, y: 2000, scale: 0.75, facing: 'left', pose: { name: 'stand' }, expression: { mood: 'wrath' }, light: L, t: T, key: 'x19-ga' });
        for (let i = 0; i < 6; i++) { const x = 300 + (i % 3) * 120, y = 1880 + Math.floor(i / 3) * 100; CH.naga.draw(g, { x, y: y + (1 - rise) * 300, scale: 0.42, facing: 'right', index: i, pose: { name: 'rise', k: rise }, light: L, t: T + i, alpha: clamp(rise * 1.5), key: 'x19-n' + i }); }
        CH.kadru.draw(g, { x: 120, y: 2000, scale: 1.0, facing: 'right', pose: { name: 'point', k: 1 }, expression: { mood: 'wrath' }, light: L, t: T, key: 'x19-kd' });
      } });
    },
    post: () => ({ bloom: 0.42, vignette: 0.45, paper: 0.32 }),
  });
})();
