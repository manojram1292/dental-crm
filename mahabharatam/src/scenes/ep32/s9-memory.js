/* Ep 32 · line "memory" · "The gods had asked Brahma why he let the curse stand." · NEW LIGHT, the memory in silver-blue: Brahma high on his lotus in a cold moonlit court; gods below as small luminous figures; in the corner, a mother with a serpent child in her lap. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP32 = window.EP32;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'memory',
    fadeIn: 0.35,
    draw(ctx, t, env) {
      const T = env.T, p = E.inOutSine(clamp(t / env.dur));
      EP32.memory(ctx, T, { cam: { zoom: lerp(0.95, 1.08, p), dy: lerp(80, -40, p) }, after: (g) => {
        CH.brahma.draw(g, { x: 540, y: 1150, scale: 0.6, facing: 'front', pose: { name: 'sit' }, light: { dir: Math.PI / 2, intensity: 1.1, front: 0.8, fill: 0.5 }, t: T, key: 'm32-br' });
        for (let i = 0; i < 4; i++) { const x = 170 + i * 250 - (i > 1 ? 0 : 0); CH.deva.draw(g, { x, y: 1820, scale: 0.3, facing: x < 540 ? 'right' : 'left', index: i, pose: { name: 'stand' }, light: { dir: -Math.PI / 2, intensity: 1, front: 0.7, fill: 0.5 }, t: T + i, key: 'm32-d' + i }); }
      } });
    },
    post: () => ({ bloom: 0.46, vignette: 0.46, paper: 0.34 }),
  });
})();
