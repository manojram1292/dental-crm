/*
 * Ep 14 · line "brahma" · THE TURN · Brahma: "Mahadeva, save the worlds. Take this poison."
 * After a 350–450 ms rest: Brahma on his lotus in the gloom, LARGE, his ivory light the only
 * light; he speaks; on "Take" (beats[2]) he turns his open hand to the right, where a pale
 * light arrives: Shiva, small and approaching through the smoke. Tagged.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP13 = window.EP13, EP14 = window.EP14;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'brahma',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b2 = env.beats[2] ?? 3.8;
      const turn = E.inOutCubic(clamp((t - b2 + 0.3) / 0.6)), arrive = E.outCubic(clamp((t - b2 + 0.8) / 1.4));
      EP13.whiteSea(ctx, T, {
        hz: 1500, dark: 0.92,
        after: (g) => {
          EP13.poison(g, 540, 1000, T, 0.8);
          KIT.glow(g, 360, 1300, 800, '#fff0d0', 0.35);
          CH.brahma.draw(g, { x: 380, y: 1880, scale: lerp(1.05, 1.1, p), facing: 'front', pose: { name: 'speak', k: 0.4 + 0.6 * turn }, expression: { speak: EP14.mouth(env, t) }, light: { dir: -Math.PI / 2, intensity: 1.1, front: 0.6 }, t: T, key: 'b14-br' });
          if (arrive > 0.01) CH.shiva.draw(g, { x: lerp(1150, 900, arrive), y: 1700, scale: 0.5, facing: 'front', pose: { name: 'bless', k: 1 }, light: { dir: -Math.PI / 2, intensity: 1, front: 0.5 }, t: T, alpha: arrive, key: 'b14-sh' });
        },
      });
      EP14.tag(ctx, T, 1, env.strings);
    },
    post: () => ({ bloom: 0.44, vignette: 0.55, paper: 0.3 }),
  });
})();
