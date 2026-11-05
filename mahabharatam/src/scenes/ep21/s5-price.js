/* Ep 21 · line "price" · THE TURN (≈ 45 %) · the serpents: "Bring us the amrita, by force. Then you are free." · After a 0.7 s rest the serpents answer as one, rearing tall on the sand at dusk; on "amrita" the white pot appears high in a ring of light; a drum on "force"; the plaque 'Amrita'. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP21 = window.EP21, EP15 = window.EP15;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'price',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b0 = env.beats[0] ?? 1.4, b1 = env.beats[1] ?? 2;
      const pot = E.outCubic(clamp((t - b0 + 0.15) / 0.5)), shake = Math.exp(-Math.max(0, t - b1) * 6) * (t > b1 ? 10 : 0);
      ctx.save(); ctx.translate(Math.sin(T * 60) * shake, 0);
      EP21.grove(ctx, T, { near: false, cam: { zoom: 1.0 + 0.06 * p, dy: -60 }, after: (g) => {
        g.save(); g.fillStyle = 'rgba(30,10,40,0.35)'; g.fillRect(-400, -500, R.W + 800, R.H + 1000); g.restore();
        if (pot > 0) { g.save(); g.strokeStyle = `rgba(255,250,230,${0.8 * pot})`; g.lineWidth = 6; g.beginPath(); g.arc(540, 640, 150 + 30 * pot, 0, R.TAU); g.stroke(); g.restore(); EP15.potGlow(g, 540, 640, 1.1, pot); }
        for (let i = 0; i < 5; i++) { const x = 160 + i * 190, sc = [0.5, 0.42, 0.58, 0.42, 0.5][i]; CH.naga.draw(g, { x, y: 1880 + Math.abs(i - 2) * 30, scale: sc, facing: x < 540 ? 'right' : 'left', index: i, pose: { name: 'rise', k: lerp(0.7, 1, E.outCubic(clamp(t / 0.6))) }, expression: { speak: EP21.mouth(env, t) }, light: EP21.amber(x, 1880, 1.1), t: T + i, key: 'p21-n' + i }); }
      } });
      ctx.restore();
      const la = clamp((t - b0) / 0.4) * (1 - clamp((t - dur + 0.3) / 0.3));
      EP21.plaque(ctx, env.strings.priceName, env.strings.priceEpithet, KIT.CX, 300, la, { size: 58, key: 'p21-name' });
    },
    post: () => ({ bloom: 0.42, vignette: 0.45, paper: 0.32 }),
  });
})();
