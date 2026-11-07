/* Ep 36 · line "born" · THE TURN · "And in time a boy was born, bright as a child of the gods." · After the 0.9 s silence, NEW LIGHT, the birth: the hall floods white-gold from the newborn in his mother's arms (beats[0]); the serpents' heads bow in rings. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP34 = window.EP34, EP35 = window.EP35, EP36 = window.EP36;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'born',
    fadeIn: 0.1,
    draw(ctx, t, env) {
      const T = env.T, k = E.outCubic(clamp((t - env.beats[0] + 0.6) / 1.0)), bow = E.inOutSine(clamp((t - env.beats[1]) / 0.8)), p = clamp(t / env.dur);
      EP36.birth(ctx, T, { k, center: [540, 1060], cam: { zoom: 1.15 + 0.06 * p, dy: -380 }, after: (g) => {
        for (let i = 0; i < 6; i++) { const x = [110, 230, 350, 730, 850, 970][i]; CH.naga.draw(g, { x, y: 1720 + (i % 2) * 30, scale: 0.3, facing: x < 540 ? 'right' : 'left', index: [0, 2, 3, 0, 5, 2][i], pose: { name: 'rise', k: lerp(0.7, 0.35, bow) }, light: { dir: Math.atan2(1060 - 1220, 540 - x), intensity: 1.1, front: 0.7, fill: 0.45 }, t: T + i, key: 'b36-n' + i }); }
        CH.nagini.draw(g, { x: 540, y: 1560, scale: 0.6, facing: 'left', pose: { name: 'cradle', k: 1 }, light: { dir: -Math.PI / 2, intensity: 1.2, front: 0.9, fill: 0.6 }, t: T, key: 'b36-ng' });
        KIT.glow(g, 488, 1170, 120 * (0.4 + k), '#ffffff', 0.9 * k);
      } });
    },
    post: () => ({ bloom: 0.52, vignette: 0.44, paper: 0.3 }),
  });
})();
