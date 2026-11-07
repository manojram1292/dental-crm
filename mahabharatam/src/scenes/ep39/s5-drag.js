/* Ep 39 · line "drag" · "Indra's chariot was dragged down from the sky, Takshaka hidden in his robe." · NEW LIGHT, the sky over the sacrifice (storm-black smoke, gold chant-ropes): the car plunges; Indra grips the rail; a green tail shows under his upper cloth (beats[2]). */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP8 = window.EP8, EP37 = window.EP37, EP38 = window.EP38, EP39 = window.EP39;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'drag',
    fadeIn: 0.15,
    draw(ctx, t, env) {
      const T = env.T, u = E.inOutSine(clamp(t / env.dur)), tail = clamp((t - env.beats[2] + 0.4) / 0.5);
      EP39.storm(ctx, T, { cam: { zoom: 1.35, dy: lerp(-300, 0, u) }, after: (g) => {
        const y = lerp(700, 1150, u);
        EP39.car(g, 540, y, 1.0, T, { tilt: 0.25 * Math.sin(T * 3) * 0.3 - 0.2 });
        CH.indra.draw(g, { x: 540, y: y - 40, scale: 0.55, facing: 'left', pose: { name: 'protect', k: 1 }, light: EP39.fireLit(540, y, 1.25), t: T, key: 'd39-in' });
        if (tail > 0) { g.save(); g.globalAlpha = tail; g.strokeStyle = '#1f9a64'; g.lineWidth = 16; g.lineCap = 'round'; g.beginPath(); g.moveTo(600, y - 260); g.quadraticCurveTo(660, y - 180, 630 + 20 * Math.sin(T * 4), y - 110); g.stroke(); g.restore(); }
      } });
    },
    post: () => ({ bloom: 0.46, vignette: 0.48, paper: 0.3 }),
  });
})();
