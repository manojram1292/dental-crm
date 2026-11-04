/*
 * Ep 17 · line "kashyapa" · "And to Kashyapa he gave the knowledge that cures all poison."
 * Kashyapa's hermitage before sunrise (EP9.hermitage): Kashyapa seated, LARGE, cups his hands; a small
 * pearl of light descends from above into his palms (beats[1]) and glows there; name card.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP9 = window.EP9, EP17 = window.EP17;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'kashyapa',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const b1 = env.beats[1] ?? 1.9;
      const d = E.inOutSine(clamp((t - 0.2) / (b1 - 0.1)));
      EP9.hermitage(ctx, T, { glow: 0.6, cam: { zoom: 1.2, dy: -60 }, after: (g) => {
        CH.kashyapa.draw(g, { x: 560, y: 1800, scale: 1.1, facing: 'left', pose: { name: 'bless', k: 0.6 }, light: EP9.light(560, 1800, 1.05, 0.45), t: T, key: 'k17-ka' });
        const x = lerp(520, 330, d), y = lerp(200, 1250, d);
        KIT.glow(g, x, y, 220, '#e0fff0', 0.8); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(x, y, 18, 0, R.TAU); g.fill();
      } });
      const la = clamp((t - b1) / 0.4) * (1 - clamp((t - dur + 0.3) / 0.3));
      EP17.plaque(ctx, env.strings.kashyapaName, env.strings.kashyapaEpithet, KIT.CX, 300, la, { size: 52, key: 'k17-name' });
    },
    post: () => ({ bloom: 0.42, vignette: 0.42, paper: 0.32 }),
  });
})();
