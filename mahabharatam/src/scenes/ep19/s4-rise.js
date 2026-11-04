/*
 * Ep 19 · line "rise" · REVEAL · "Out came Garuda: huge, blazing like a heap of fire, rising into the sky."
 * Garuda rises LARGE out of the fire, wings opening (beats[0], name card); the frame burns gold (blaze);
 * on "sky" (beats[3]) he lifts up, the hermitage far below.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP10 = window.EP10;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'rise',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const b0 = env.beats[0] ?? 0.6, b3 = env.beats[3] ?? 4.6;
      const open = E.outCubic(clamp((t - b0 + 0.3) / 1.0)), up = E.inOutSine(clamp((t - b3 + 1.2) / 1.6));
      EP10.sky(ctx, T, { red: 1, cam: { zoom: 1.0, dy: lerp(0, 300, up) }, after: (g) => {
        KIT.glow(g, 540, 1300, 1500, '#ff7a20', 0.8);
        CH.garuda.draw(g, { x: 560, y: lerp(2050, 1700, up), scale: lerp(0.85, 0.75, up), facing: 'left', pose: up > 0.3 ? { name: 'fly', phase: T * 4, blaze: 1 } : { name: 'spread', k: open, blaze: 1 }, light: { dir: -Math.PI / 2, intensity: 1.2, front: 0.6 }, t: T, key: 'r19-ga' });
      } });
      const la = clamp((t - b0) / 0.4) * (1 - clamp((t - b3 + 0.4) / 0.4));
      window.EP17.plaque(ctx, env.strings.garudaName, env.strings.garudaEpithet, KIT.CX, 250, la, { size: 60, key: 'r19-name' });
      void dur;
    },
    post: () => ({ bloom: 0.5, vignette: 0.42, paper: 0.3 }),
  });
})();
