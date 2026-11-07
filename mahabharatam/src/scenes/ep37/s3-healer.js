/* Ep 37 · line "healer" · "A healer named Kashyapa was hurrying to save the king." · NEW LIGHT, the road at blazing noon: the young healer striding large toward us, pouch of herbs, short black shadow; plaque. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP36 = window.EP36, EP37 = window.EP37, EP8 = window.EP8;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'healer',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      EP37.road(ctx, T, { cam: { zoom: 1.1, dy: -120 }, after: (g) => {
        const s = lerp(0.6, 0.95, p), y = lerp(1500, 1820, p);
        EP37.shadow(g, 560, y, 140 * s);
        CH.healer.draw(g, { x: 560, y, scale: s, facing: 'right', pose: { name: 'walk', phase: T * 3.2 }, light: EP37.noonLit(560, y), t: T, key: 'k37-he' });
      } });
      EPA.plaque(ctx, env.strings.healerName, env.strings.healerEpithet, KIT.CX, 320, clamp((t - env.beats[1] + 0.2) / 0.3) * (1 - clamp((t - env.dur + 0.4) / 0.3)), { size: 52, key: 'k37-pl' });
      const dv = 1 - clamp(t / 0.4);
      if (dv > 0) { ctx.save(); ctx.globalAlpha = dv; ctx.fillStyle = '#fff4d8'; ctx.fillRect(0, 0, R.W, R.H); ctx.restore(); }
    },
    post: () => ({ bloom: 0.4, vignette: 0.42, paper: 0.3 }),
  });
})();
