/* Ep 27 · line "blind" · "He filled their eyes with dust, and cut them down." · A cloud of dust from his wings; their eyes grey out (beats[0]); a flash of talons and they sink back into shadow (beats[1]); no gore. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP27 = window.EP27;
  const { clamp, E, hash } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'blind',
    fadeIn: 0.1,
    draw(ctx, t, env) {
      const T = env.T;
      const b0 = env.beats[0] ?? 1, b1 = env.beats[1] ?? 2.2;
      const dust = E.inOutSine(clamp((t - b0 + 0.6) / 0.6)) * (1 - 0.6 * clamp((t - b1) / 0.8)), down = E.inOutSine(clamp((t - b1 + 0.1) / 0.6));
      EP27.vault(ctx, T, { pot: 0.6, cam: { zoom: 1.25, dy: -120 }, after: (g) => {
        EP27.guards(g, T, 2, { blind: clamp((t - b0 + 0.2) / 0.4), down });
        CH.garuda.draw(g, { x: 540, y: 1720, scale: 0.18, facing: 'left', pose: { name: 'spread', k: 1, blaze: 0.5 }, light: EP27.steel(540, 1720, 1.3), t: T, key: 'b27-ga' });
        for (let i = 0; i < 26; i++) { g.globalAlpha = 0.5 * dust; g.fillStyle = '#b8a888'; g.beginPath(); g.ellipse(540 + (hash(i, 1) - 0.5) * 900, 1500 + (hash(i, 2) - 0.5) * 500 + Math.sin(T * 2 + i) * 30, 120, 40, hash(i, 3), 0, R.TAU); g.fill(); }
        g.globalAlpha = 1;
        const fl = Math.exp(-Math.max(0, t - b1) * 6) * (t > b1 ? 1 : 0);
        if (fl > 0.02) { g.strokeStyle = `rgba(255,240,200,${fl})`; g.lineWidth = 10; for (const x of [300, 780]) { g.beginPath(); g.moveTo(x - 120, 1300); g.lineTo(x + 120, 1600); g.stroke(); } }
      } });
    },
    post: () => ({ bloom: 0.44, vignette: 0.48, paper: 0.3 }),
  });
})();
