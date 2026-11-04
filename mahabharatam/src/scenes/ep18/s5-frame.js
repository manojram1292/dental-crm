/* Ep 18 · line "frame" · FRAME (Sauti) · "One flew in hope. The other already knew." · A seventh angle: close on Sauti's hands in the firelight; one hand rises (hope), the other turns down (knew). */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP17 = window.EP17;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'frame',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      const b1 = env.beats[1] ?? 2.6;
      const fl = KIT.flicker(T, 0), F = KIT.ashram.FIRE;
      KIT.ashram.draw(ctx, T, {
        cycle: 0.76, speed: 0, hide: [5, 6, 0, 1], turn: () => -0.2,
        smoke: { alpha: 0.3, lean: 5 }, fireH: 230,
        cam: { zoom: 2.1 + 0.06 * p, dx: 650, dy: -540 },
        after: (g) => {
          CH.sauti.draw(g, { x: 260, y: 1560, scale: 0.92, facing: 'right', pose: { name: t < b1 - 0.4 ? 'speak' : 'bless', base: 'sit', k: E.inOutSine(clamp(t / 0.8)) }, expression: { look: -0.05, speak: EP17.mouth(env, t) }, light: { dir: Math.atan2(F.y - 1250, F.x - 260), intensity: fl * 1.2, front: 0.55 }, t: T, key: 'f18-sauti' });
        },
      });
    },
    post: () => ({ bloom: 0.44, vignette: 0.56, paper: 0.32 }),
  });
})();
