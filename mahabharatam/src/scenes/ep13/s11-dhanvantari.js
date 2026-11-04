/*
 * Ep 13 · line "dhanvantari" · THE REVEAL · "And last came Dhanvantari, holding the white pot of amrita."
 * After a 350 ms rest: Dhanvantari rises, LARGE, from the white sea, the pot of amrita glowing
 * at his chest (beats[1], a bell); on "amrita" (beats[3]) the pot flares and the two hosts, small
 * in the lower corners, turn toward it. Caption lifted.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP13 = window.EP13;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'dhanvantari',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const b1 = env.beats[1] ?? 1.0, b3 = env.beats[3] ?? 5;
      const rise = E.outCubic(clamp((t - b1 + 0.8) / 1.6)), fl = E.inOutSine(clamp((t - b3 + 0.3) / 0.6));
      EP13.whiteSea(ctx, T, {
        hz: 1250, cam: { zoom: 1.0 + 0.05 * clamp(t / dur) },
        after: (g) => {
          KIT.glow(g, 540, 1150, 1000, '#ffffff', 0.4 + 0.4 * fl);
          CH.dhanvantari.draw(g, { x: 540, y: lerp(2300, 1820, rise), scale: 1.2, facing: 'front', pose: { name: 'offer', k: fl }, light: EP13.seaGlow(540, 1700, 1.1), t: T, key: 'd13-dh' });
          window.EP11.surf(g, 1780, T, 1, { color: '#ffffff', deep: '#ecebf8', deep2: '#b8b8d8' });
          CH.deva.draw(g, { x: 90, y: 2060, scale: 0.62, facing: 'right', index: 2, pose: 'stand', expression: { look: -0.25 * fl }, light: EP13.seaGlow(90, 2000), t: T, key: 'd13-d' });
          CH.asura.draw(g, { x: 990, y: 2060, scale: 0.64, facing: 'left', index: 4, pose: { name: 'point', k: fl }, expression: { look: -0.25 * fl }, light: EP13.seaGlow(990, 2000), t: T, key: 'd13-a' });
        },
      });
      const la = clamp((t - b1) / 0.4) * (1 - clamp((t - b3 + 0.4) / 0.4));
      EP13.plaque(ctx, env.strings.dhanvantariName, env.strings.dhanvantariEpithet, KIT.CX, 300, la, { size: 56, key: 'd13-name' });
    },
    post: () => ({ bloom: 0.5, vignette: 0.32, paper: 0.28 }),
  });
})();
