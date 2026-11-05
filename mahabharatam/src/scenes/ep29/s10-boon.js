/* Ep 29 · line "boon" · "Indra granted him a boon, and Garuda chose: let the serpents be my food." · Indra's hand in blessing; on "serpents" (beats[2]) a medallion: serpents rearing below, Garuda's shadow falling over them. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP29 = window.EP29, EP11 = window.EP11, EP20 = window.EP20;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'boon',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T;
      const b2 = env.beats[2] ?? 2.8;
      EP29.rainbow(ctx, T, { cam: { zoom: 1.6, dx: 320, dy: -380 }, after: (g) => {
        CH.indra.draw(g, { x: 330, y: 1600, scale: 0.75, facing: 'right', pose: { name: 'protect', k: E.inOutSine(clamp(t / 0.7)) }, light: EP29.clear(330, 1600), t: T, key: 'bo29-in' });
      } });
      const v = E.outCubic(clamp((t - b2 + 0.4) / 0.5));
      EP11.roundel(ctx, 700, 640, 230, v, (g, TT) => EP20.island(g, TT, { after: (q) => { for (let i = 0; i < 5; i++) CH.naga.draw(q, { x: 300 + i * 120, y: 1290, scale: 0.28, facing: i < 2 ? 'right' : 'left', index: i, pose: { name: 'rise', k: 1 }, light: { dir: -Math.PI / 2, intensity: 1, front: 0.5 }, t: TT + i, key: 'bo29-n' + i }); q.save(); q.globalAlpha = 0.45; q.fillStyle = '#000'; q.beginPath(); q.ellipse(540, 1280, 420, 60, 0, 0, R.TAU); q.fill(); q.restore(); } }), T, { focus: [540, 1150], zoom: 0.55, key: 'bo29-v', glow: '#a0ffc0' });
    },
    post: () => ({ bloom: 0.4, vignette: 0.42, paper: 0.3 }),
  });
})();
