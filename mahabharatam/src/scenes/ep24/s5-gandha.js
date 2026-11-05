/* Ep 24 · line "gandha" · THE TURN (≈ 42 %) · "At last he came to Gandhamadana, where his father sat in austerity." · After a 0.85 s rest: NEW LIGHT, Gandhamadana, the fragrant mountain, warm green-gold, petals drifting; Kashyapa seated below; Garuda descends with his load; the plaque. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP24 = window.EP24;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'gandha',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = E.inOutSine(clamp(t / dur));
      const b0 = env.beats[0] ?? 1.5;
      EP24.gandha(ctx, T, { cam: { zoom: 1.0 }, after: (g) => {
        CH.kashyapa.draw(g, { x: 300, y: 1560, scale: 0.6, facing: 'right', pose: 'sit', light: EP24.warm(300, 1560), t: T, key: 'g24-ka' });
        EP24.loaded(g, lerp(1000, 760, p), lerp(500, 980, p), 0.45, T, { key: 'g24', light: EP24.warm(800, 900, 1.15) });
      } });
      const la = clamp((t - b0 + 0.2) / 0.4) * (1 - clamp((t - dur + 0.3) / 0.3));
      EP24.plaque(ctx, env.strings.gandhaName, env.strings.gandhaEpithet, KIT.CX, 300, la, { size: 56, key: 'g24-name' });
    },
    post: () => ({ bloom: 0.36, vignette: 0.4, paper: 0.32 }),
  });
})();
