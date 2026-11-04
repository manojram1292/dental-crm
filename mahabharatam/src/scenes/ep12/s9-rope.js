/*
 * Ep 12 · line "rope" · "And Vasuki, king of the serpents, was wound round it for a rope."
 *
 * The rig assembles: Mandara on the tortoise in the sea; Vasuki, violet and gold, winds
 * round the mountain turn by turn (EP12.churn wrap 0 → 1 from "Vasuki" to "rope"); name card.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP11 = window.EP11, EP12 = window.EP12;
  const { clamp, E } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'rope',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b0 = env.beats[0] ?? 0.5, b2 = env.beats[2] ?? 4.6;
      const wrap = E.inOutSine(clamp((t - b0 + 0.2) / (b2 - b0 + 0.2)));
      EP11.sea(ctx, T, {
        cam: { zoom: 1.12 - 0.06 * p, dy: 60 }, hz: 1000, jewels: 0.5,
        after: (g) => {
          EP12.churn(g, T, { cx: 540, y: 1620, s: 0.6, spin: 0, wrap, hosts: 0 });
          if (wrap > 0.02 && wrap < 0.99) {
            // the head leads the winding: a hood rising at the growing end
            CH.vasuki.draw(g, { x: 540 + Math.cos(wrap * 3.2 * Math.PI * 2) * 300, y: 1450 - wrap * 520, scale: 0.4, facing: Math.sin(wrap * 3.2 * Math.PI * 2) > 0 ? 'right' : 'left', pose: { name: 'rise', k: 0.3 }, light: { dir: -Math.PI / 2, intensity: 1, front: 0.4 }, t: T, key: 'r12-head' });
          }
          window.EP11.surf(g, 1560, T, 1, { color: '#dfe6ff', deep: '#1e2a6a', deep2: '#060a24' });
        },
      });
      const la = clamp((t - b0) / 0.5) * (1 - clamp((t - dur + 0.4) / 0.4));
      EP12.plaque(ctx, env.strings.vasukiName, env.strings.vasukiEpithet, KIT.CX, 300, la, { size: 60, key: 'r12-name' });
    },
    post: () => ({ bloom: 0.38, vignette: 0.45, paper: 0.3 }),
  });
})();
