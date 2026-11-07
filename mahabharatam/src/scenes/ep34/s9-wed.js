/* Ep 34 · line "wed" · "They were married in the hall of the serpents." · NEW LIGHT, the hall in wedding gold: lamps on the floor, a small sacred fire; the couple circle it (a slow orbit), serpents in rows. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP34 = window.EP34, EP33 = window.EP33;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'wed',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur), a = p * Math.PI * 0.8 + 0.6;
      EPA.hall(ctx, T, { mood: 'gold', cam: { zoom: 1.4, dy: -440 }, after: (g) => {
        const F = { x: 540, y: 1520 };
        KIT.glow(g, F.x, F.y - 60, 400, '#ffb050', 0.6 * KIT.flicker(T, 2));
        g.fillStyle = '#ffc060'; g.beginPath(); g.moveTo(F.x - 50, F.y); g.quadraticCurveTo(F.x, F.y - 160 - 20 * Math.sin(T * 6), F.x + 50, F.y); g.fill();
        g.fillStyle = '#4a2a10'; g.fillRect(F.x - 70, F.y, 140, 30);
        for (let i = 0; i < 8; i++) { const x = 100 + i * 125; if (x > 380 && x < 700) continue; CH.naga.draw(g, { x, y: 1360, scale: 0.22, facing: x < 540 ? 'right' : 'left', index: [0, 2, 3, 5][i % 4], pose: { name: 'rise', k: 0.5 }, light: EP34.lamp(x, 1360, 540, 1500, 0.9), t: T + i, key: 'w34-n' + i }); }
        const pos = (o) => [F.x + Math.cos(a + o) * 260, F.y + 120 + Math.sin(a + o) * 70];
        const [jx, jy] = pos(0), [nx, ny] = pos(0.5);
        const L = (x, y) => EP34.lamp(x, y, F.x, F.y, 1.15);
        const draws = [[jy, () => CH.jaratkaru.draw(g, { x: jx, y: jy, scale: 0.55, facing: Math.sin(a) > 0 ? 'left' : 'right', pose: { name: 'walk', phase: T * 2 }, light: L(jx, jy), t: T, key: 'w34-jk' })], [ny, () => CH.nagini.draw(g, { x: nx, y: ny, scale: 0.5, facing: Math.sin(a + 0.5) > 0 ? 'left' : 'right', pose: { name: 'walk', phase: T * 2 + 1 }, light: L(nx, ny), t: T, key: 'w34-ng' })]];
        draws.sort((u, v) => u[0] - v[0]).forEach((d) => d[1]());
      } });
    },
    post: () => ({ bloom: 0.44, vignette: 0.44, paper: 0.3 }),
  });
})();
