/* Ep 0 · line "voices" · "The voices are synthetic: a text-to-speech model, not actors." · Sauti close at the fire, from the far side of the flames (a new angle); a gold waveform follows the words; the plaque names the model. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP0 = window.EP0;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'voices',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur), S = env.strings;
      const fl = KIT.flicker(T, 0), F = KIT.ashram.FIRE;
      KIT.ashram.draw(ctx, T, {
        cycle: 0.78, speed: 0, hide: [0, 1, 2, 3], fireH: 200, smoke: { alpha: 0.25, lean: -6 },
        cam: { zoom: 1.7 + 0.06 * p, dx: -60, dy: -420 },
        after: (g) => CH.sauti.draw(g, { x: 420, y: 1330, scale: 0.55, facing: 'right', pose: { name: 'speak', base: 'sit', k: 1 }, expression: { look: 0.1, speak: 0.2 + 0.3 * Math.sin(T * 6) }, light: { dir: Math.atan2(F.y - 1050, F.x - 420), intensity: fl * 1.25, front: 0.6 }, t: T, key: 'vc0-sauti' }),
      });
      EP0.wave(ctx, T, 140, 1600, 800, 70, clamp(t / 0.4), env, t);
      const la = clamp((t - 0.3) / 0.4) * (1 - clamp((t - dur + 0.3) / 0.3));
      EP0.plaque(ctx, S.voiceTitle, S.voiceSub, KIT.CX, 300, la, { size: 58, key: 'vc0-name' });
      void E;
    },
    post: () => ({ bloom: 0.4, vignette: 0.5, paper: 0.32 }),
  });
})();
