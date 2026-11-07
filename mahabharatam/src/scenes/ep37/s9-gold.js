/* Ep 37 · line "gold" · "Takshaka gave the healer gold, and he turned back." · A heap of gold in the dust between them; the healer, eyes closed (he has seen the king's time is over), takes it and walks away; the serpent watches him go. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP36 = window.EP36, EP37 = window.EP37, EP8 = window.EP8;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'gold',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, go = E.inOutSine(clamp((t - env.beats[1] + 0.8) / 1.4));
      EP37.road(ctx, T, { cam: { zoom: 1.15, dy: -200 }, after: (g) => {
        EP37.banyan(g, 860, 1380, 0.55, T, {});
        const gx = 520, gy = 1690;
        KIT.glow(g, gx, gy - 20, 160 * (1 - go), '#ffd860', 0.6);
        g.fillStyle = '#e8b840'; g.globalAlpha = 1 - go; for (let i = 0; i < 14; i++) { g.beginPath(); g.ellipse(gx + (i % 5 - 2) * 26, gy - Math.floor(i / 5) * 18, 20, 9, 0, 0, Math.PI * 2); g.fill(); } g.globalAlpha = 1;
        EP37.shadow(g, lerp(330, 120, go), 1700, 90);
        CH.healer.draw(g, { x: lerp(330, 120, go), y: 1700, scale: 0.62, facing: go > 0.05 ? 'left' : 'right', pose: { name: go > 0.05 ? 'walk' : 'receive', k: 1, phase: T * 3 }, light: EP37.noonLit(330, 1700), t: T, key: 'g37-he' });
        CH.takshaka.draw(g, { x: 760, y: 1740, scale: 0.75, facing: 'left', pose: { name: 'give', k: 1 - go }, light: EP37.noonLit(760, 1740), t: T, key: 'g37-tk' });
      } });
    },
    post: () => ({ bloom: 0.42, vignette: 0.44, paper: 0.3 }),
  });
})();
