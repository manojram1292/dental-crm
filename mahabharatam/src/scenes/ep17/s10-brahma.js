/*
 * Ep 17 · line "brahma" · "Brahma let the curse stand: the serpents had grown too many, and too venomous."
 * Brahma on his lotus at Meru's summit (EP11.meru, zoomed to the peak, gold), grave, his hand lowered
 * (beats[1]); below the lotus the serpents' shadows multiply across the gold (beats[2]).
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP11 = window.EP11;
  const { clamp, E, hash } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'brahma',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b2 = env.beats[2] ?? 3.6;
      const many = E.inOutSine(clamp((t - b2 + 1.0) / 1.5));
      EP11.meru(ctx, T, { cam: { zoom: 2.0, dy: 650 } });
      ctx.save(); ctx.fillStyle = 'rgba(30,14,4,0.3)'; ctx.fillRect(0, 0, R.W, R.H); ctx.restore();
      CH.brahma.draw(ctx, { x: 540, y: 1520, scale: 1.0, facing: 'front', pose: { name: 'bless', k: 1 - 0.6 * E.inOutSine(clamp(t / 2)) }, light: { dir: -Math.PI / 2, intensity: 1.1, front: 0.6 }, t: T, key: 'b17-br' });
      // serpents' shadows multiplying across the gold below
      ctx.save(); ctx.globalAlpha = 0.6 * many; ctx.strokeStyle = '#1a1006'; ctx.lineCap = 'round';
      for (let i = 0; i < Math.floor(40 * many); i++) { const x = hash(i, 1) * R.W, y = 1600 + hash(i, 2) * 300, w = 10 + 10 * hash(i, 3); ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x, y); for (let k = 1; k < 8; k++) ctx.lineTo(x + k * 18, y + Math.sin(k * 1.2 + T * 2 + i) * 14); ctx.stroke(); }
      ctx.restore();
    },
    post: () => ({ bloom: 0.44, vignette: 0.4, paper: 0.3 }),
  });
})();
