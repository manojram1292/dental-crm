/* Ep 28 · line "cliff" · NEXT 1 (the catalog line) · "Then Indra hurled his thunderbolt." · Indra's storm rolls over the dawn: Indra on his cloud behind them, the vajra blazing as it leaves his hand (beats[1]). EP28.hurl is reused by the Next overlay. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP28 = window.EP28, EP13 = window.EP13;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  EP28.hurl = (ctx, T, t, b1) => {
    const throwK = E.outCubic(clamp((t - b1 + 0.3) / 0.4)), flash = Math.exp(-Math.max(0, t - b1) * 5) * (t > b1 ? 1 : 0);
    EP13.storm(ctx, T, { flash, rain: 0.2, after: (g) => {
      CH.indra.draw(g, { x: 620, y: 1250, scale: 0.85, facing: 'left', pose: { name: 'raise', k: 1 - 0.6 * throwK }, expression: { mood: 'wrath' }, light: { dir: -Math.PI / 2 - 0.3, intensity: 1.15, front: 0.55 }, t: T, key: 'hu28-in' });
      window.EP5.cloud(g, 620, 1260, 560, 3, '#4a5470', '#c8d4f0', 1);
      if (throwK > 0) { const x = lerp(560, 200, throwK), y = lerp(500, 1500, throwK); KIT.glow(g, x, y, 260, '#e8f0ff', 0.9); g.strokeStyle = '#ffffff'; g.lineWidth = 12; g.beginPath(); g.moveTo(x - 40, y - 80); g.lineTo(x + 20, y - 10); g.lineTo(x - 20, y + 10); g.lineTo(x + 40, y + 80); g.stroke(); }
    } });
  };
  R.scene({
    id: 'cliff',
    fadeIn: 0.2,
    draw(ctx, t, env) { EP28.hurl(ctx, env.T, t, env.beats[1] ?? 1.4); },
    post: () => ({ bloom: 0.44, vignette: 0.48, paper: 0.3 }),
  });
})();
