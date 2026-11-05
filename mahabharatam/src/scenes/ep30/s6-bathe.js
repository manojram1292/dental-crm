/* Ep 30 · line "bathe" · "While the serpents went to bathe, Indra took the amrita, and went back to heaven." · The serpents slide into the misty lagoon (beats[0]); Indra, appearing out of the air, lifts the pot from the kusha (beats[1]) and rises away into the pink sky (beats[2]). */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP30 = window.EP30, EP15 = window.EP15;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'bathe',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T;
      const b0 = env.beats[0] ?? 1, b1 = env.beats[1] ?? 2.2, b2 = env.beats[2] ?? 3.6;
      const go = E.inOutSine(clamp((t - b0 + 0.6) / 1.2)), app = E.outCubic(clamp((t - b1 + 0.5) / 0.5)), up = E.inOutSine(clamp((t - b2 + 0.4) / 1.2));
      EP30.dawnIsle(ctx, T, { cam: { zoom: 1.1, dy: -160 }, after: (g) => {
        EP30.kusha(g, 520, 1700, 0.8, T, {});
        for (let i = 0; i < 4; i++) { const x = lerp(380 + i * 90, 120 + i * 140, go), y = lerp(1720, 1420, go); CH.naga.draw(g, { x, y, scale: 0.2, facing: 'left', index: i, pose: { name: 'rise', k: lerp(0.8, 0.2, go) }, alpha: 1 - 0.6 * go, light: EP30.dawn(x, y), t: T + i, key: 'b30-n' + i }); }
        const iy = lerp(1720, 900, up);
        if (app > 0) CH.indra.draw(g, { x: 640, y: iy, scale: 0.5, facing: 'left', pose: { name: 'carry', k: 1 }, alpha: app, light: EP30.dawn(640, iy, 1.1), t: T, key: 'b30-in' });
        EP15.potGlow(g, app > 0.5 ? 600 : 520, app > 0.5 ? iy - 420 : 1640, 0.8, 1);
      } });
    },
    post: () => ({ bloom: 0.4, vignette: 0.4, paper: 0.3 }),
  });
})();
