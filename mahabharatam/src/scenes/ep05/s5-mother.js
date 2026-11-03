/*
 * Ep 5 · line "mother" · "He ran crying to his mother. And Sarama came to the king."
 *
 * Two shots in one line.
 *  1. NEW PLACE: Sarama's ridge above the clouds at a rose-pearl dawn (EP5.heaven). The pup
 *     runs in from the left, crying, and sits back on his haunches before her; she lowers
 *     her head to him.
 *  2. On "Sarama" (beats[1]) back to the enclosure: she walks in from the right, tall and
 *     luminous, and the day begins to dim around her (dark 0 → 0.35); on "king" she stops.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP5 = window.EP5;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;

  function heavenShot(ctx, t, T, ts) {
    const run = E.outSine(clamp(t / (ts - 0.6)));
    const px = lerp(-120, 380, run), arrived = run > 0.97;
    const cry = clamp((t - (ts - 0.9)) / 0.4);
    EP5.heaven(ctx, T, {
      cam: { zoom: 1.05, dx: -20 * run },
      after: (g) => {
        CH.sarama.draw(g, { x: 680, y: 1500, scale: 0.72, facing: 'left', pose: { name: 'comfort', k: E.inOutSine(clamp((t - (ts - 1.3)) / 0.9)) }, light: { dir: -Math.PI / 2 - 0.6, intensity: 1, front: 0.2 }, t: T, key: 'm5-sarama' });
        CH.pup.draw(g, { x: px, y: 1500, scale: 0.7, facing: 'right', pose: arrived ? { name: 'cry', k: cry } : { name: 'run', phase: T * 14 }, light: { dir: -Math.PI / 2 - 0.6, intensity: 0.9, front: 0.2 }, t: T, key: 'm5-pup' });
      },
    });
  }

  function walkIn(ctx, t, T, ts, tk) {
    const w = E.outSine(clamp((t - ts + 0.2) / Math.max(0.6, tk - ts + 0.2)));
    const x = lerp(1250, 800, w), walking = w < 0.98;
    const dark = 0.35 * E.inOutSine(clamp((t - ts) / 1.6));
    EP5.enclosure(ctx, T, {
      dark, cam: { zoom: 1.0 }, fireH: 160 - 30 * dark, wind: 0.8 + dark,
      after: (g) => {
        CH.janamejaya.draw(g, { x: 300, y: 1460, scale: 0.5, facing: 'right', pose: 'stand', expression: { look: -0.06 * w }, light: EP5.sunLight(300, 1100, dark), t: T, key: 'm5-king' });
        [0, 1, 2].forEach((i) => CH.prince.draw(g, { x: 440 + i * 60, y: 1440 - i * 20, scale: 0.4, index: i, facing: 'right', pose: 'stand', light: EP5.sunLight(440, 1100, dark), t: T, key: 'm5-p' + i }));
        CH.sarama.draw(g, { x, y: 1490, scale: 0.72, facing: 'left', pose: walking ? { name: 'walk', phase: T * 5, stride: 0.8 } : 'stand', light: { dir: -Math.PI / 2 - 0.3, intensity: 1.05, front: 0.2 }, t: T, key: 'm5-sw' });
      },
    });
  }

  R.scene({
    id: 'mother',
    fadeIn: 0.4,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const ts = (env.beats[1] ?? dur * 0.5) - 0.5, tk = env.beats[2] ?? dur * 0.9;
      const x = clamp((t - ts) / 0.45);
      if (x < 1) heavenShot(ctx, t, T, ts);
      if (x > 0) {
        if (x >= 1) walkIn(ctx, t, T, ts, tk);
        else EP5.ghost(ctx, E.inOutSine(x), (g) => walkIn(g, t, T, ts, tk), 'm5-x');
      }
    },
    post: () => ({ bloom: 0.34, vignette: 0.45, paper: 0.34 }),
  });
})();
