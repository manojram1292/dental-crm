/*
 * Ep 8 · line "safe" · Indra: "Stay with me, Takshaka. You are safe."
 *
 * Close on Indra, large: he raises his hand in protection (protect) on "Stay"
 * (beats[0]); the vajra glows; Takshaka, smaller, coils and bows his hoods at the foot of
 * the throne; on "safe" (beats[2]) a gold dome of light closes over him.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP8 = window.EP8;
  const { clamp, E, TAU } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'safe',
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b0 = env.beats[0] ?? 0.2, b2 = env.beats[2] ?? 3;
      const prot = E.inOutCubic(clamp((t - (b0 - 0.2)) / 0.6));
      const dome = E.outCubic(clamp((t - (b2 - 0.3)) / 0.8));
      const L = { dir: -Math.PI / 2 + 0.2, intensity: 1.15, front: 0.35 };
      EP8.svarga(ctx, T, {
        cam: { zoom: 1.35 + 0.05 * p, dx: -60, dy: 60 },
        after: (g) => {
          CH.indra.draw(g, { x: 760, y: 1560, scale: 0.86, facing: 'left', pose: { name: 'protect', base: 'throne', k: prot }, expression: { speak: EP8.mouth(env, t) }, light: L, t: T, key: 's8-in' });
          CH.takshaka.draw(g, { x: 330, y: 1640, scale: 0.5, facing: 'right', pose: { name: 'give', k: 0.6 }, expression: { look: 0.15 }, light: L, t: T, key: 's8-tk' });
          if (dome > 0.01) {
            KIT.glow(g, 330, 1300, 420, '#ffe9a8', 0.3 * dome);
            g.save(); g.globalAlpha = 0.6 * dome; g.strokeStyle = '#ffe9a8'; g.lineWidth = 4;
            g.beginPath(); g.ellipse(330, 1640, 330 * dome, 520 * dome, 0, Math.PI, TAU); g.stroke(); g.restore();
          }
        },
      });
    },
    post: () => ({ bloom: 0.45, vignette: 0.34, paper: 0.34 }),
  });
})();
