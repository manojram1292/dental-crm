/* Ep 32 · line "brahma" · Brahma speaks, in the memory · "A sage named Jaratkaru will marry a girl of his own name." · Brahma large and frontal, his hand raised (text kept off his face: captions in the band); two medallions appear on the beats: the gaunt sage, the girl with a serpent diadem; plaque. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP32 = window.EP32;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'brahma',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, B = env.beats;
      EP32.memory(ctx, T, { cam: { zoom: 1.3, dy: -120 }, after: (g) => {
        CH.brahma.draw(g, { x: 540, y: 1420, scale: 0.78, facing: 'front', pose: { name: 'speak', k: E.inOutSine(clamp(t / 0.5)) }, expression: { speak: EPA.mouth(env, t) }, light: { dir: Math.PI / 2, intensity: 1.15, front: 0.85, fill: 0.5 }, t: T, key: 'b32-br' });
      } });
      EP32.medal(ctx, 230, 1120, 150, E.outBack ? E.outCubic(clamp((t - B[0] + 0.2) / 0.4)) : 1, 'sage', T, 'b32-m1');
      EP32.medal(ctx, 860, 1120, 150, E.outCubic(clamp((t - B[2] + 0.2) / 0.4)), 'bride', T, 'b32-m2');
      EPA.plaque(ctx, env.strings.jaratName, env.strings.jaratEpithet, KIT.CX, 260, clamp((t - B[0]) / 0.3) * (1 - clamp((t - env.dur + 0.4) / 0.3)), { size: 52, key: 'b32-pl' });
    },
    post: () => ({ bloom: 0.46, vignette: 0.44, paper: 0.34 }),
  });
})();
