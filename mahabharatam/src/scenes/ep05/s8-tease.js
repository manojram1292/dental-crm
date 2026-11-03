/*
 * Ep 5 · line "tease" · NEXT (cliffhanger) · "Far away, a young student was about to face the serpent king."
 *
 * NEW PLACE, NEW LIGHT: a forest road at dusk, far from the court. A young student
 * (Uttanka) walks it, his coral rim warm against the cold coming dark. Behind the hills
 * something vast rises: a canopy of cobra hoods, cold green; on "king" (beats[1]) its
 * hoods flare and its eyes open.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP5 = window.EP5;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'tease',
    fadeIn: 0.6,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b0 = env.beats[0] ?? 1.5, b1 = env.beats[1] ?? dur * 0.8;
      const rise = E.inOutSine(clamp((t - (b0 - 0.4)) / (b1 - b0 + 0.6)));
      const flare = E.outCubic(clamp((t - (b1 - 0.15)) / 0.5));
      EP5.duskRoad(ctx, T, {
        cam: { zoom: 1.0 + 0.1 * E.inOutSine(p), dy: -40 * p },
        behind: (g) => {
          KIT.glow(g, 560, 900, 700, '#20c880', 0.22 * rise + 0.15 * flare);
          EP5.ghost(g, 0.25 + 0.6 * rise, (v) => CH.takshaka.draw(v, { x: 560, y: lerp(2300, 1640, rise), scale: 1.05, facing: 'left', pose: { name: 'strike', k: 0.4 * flare }, expression: { mood: flare > 0.5 ? 'wrath' : 'calm' }, light: { dir: -Math.PI / 2 + 0.6, intensity: 0.5 + 0.6 * flare, front: 0 }, t: T, key: 't5-tk' }), 't5-g');
        },
        after: (g) => {
          const w = lerp(760, 560, p);
          CH.uttanka.draw(g, { x: w, y: 1540, scale: 0.5, facing: 'left', pose: { name: 'walk', phase: T * 5, stride: 0.7 }, expression: { look: flare * 0.12 }, light: { dir: Math.atan2(-400, 600), intensity: 0.9, front: 0.15 }, t: T, key: 't5-u' });
        },
      });
    },
    post: () => ({ bloom: 0.4, vignette: 0.55, paper: 0.32 }),
  });
})();
