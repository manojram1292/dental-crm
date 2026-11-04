/*
 * Ep 14 · line "name" · "And his throat turned blue: Nilakantha, the blue-throated."
 * Shiva in blessing, the blue throat glowing; the smoke gone, the sea white again under a clear
 * night; name card "Nilakantha · the blue-throated" (beats[1]). Tagged.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP13 = window.EP13, EP14 = window.EP14;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'name',
    fadeIn: 0.35,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b1 = env.beats[1] ?? 1.9;
      const bl = E.inOutCubic(clamp(t / 1.0));
      EP13.whiteSea(ctx, T, {
        hz: 1500, dark: 0.5 - 0.15 * p, cam: { zoom: 0.96 + 0.04 * p },
        after: (g) => {
          KIT.glow(g, 820, 520, 260, '#f4f8ff', 0.8); g.fillStyle = '#f8faff'; g.beginPath(); g.arc(820, 520, 70, 0, R.TAU); g.fill(); g.fillStyle = '#28264f'; g.beginPath(); g.arc(846, 506, 64, 0, R.TAU); g.fill();
          CH.shiva.draw(g, { x: 500, y: 1960, scale: 1.0, facing: 'front', pose: { name: 'bless', k: bl, throat: 1 }, light: { dir: -Math.PI / 2, intensity: 1.1, front: 0.55 }, t: T, key: 'n14-sh' });
          window.EP11.surf(g, 1850, T, 1, { color: '#ffffff', deep: '#ecebf8', deep2: '#b8b8d8' });
        },
      });
      EP14.tag(ctx, T, 1, env.strings);
      const la = clamp((t - b1) / 0.4) * (1 - clamp((t - dur + 0.3) / 0.3));
      EP14.plaque(ctx, env.strings.nilakanthaName, env.strings.nilakanthaEpithet, KIT.CX, 340, la, { size: 58, key: 'n14-name' });
    },
    post: () => ({ bloom: 0.44, vignette: 0.4, paper: 0.3 }),
  });
})();
