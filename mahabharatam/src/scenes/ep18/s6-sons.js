/*
 * Ep 18 · line "sons" · THE TURN · "In the night, her sons had done as she asked."
 * A flashback in cold blue night on the shore: dark serpents slip up into the sleeping horse's white
 * tail and hang there (pose.tail rising with beats[1]).
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP17 = window.EP17;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'sons',
    fadeIn: 0.35,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const b1 = env.beats[1] ?? 1.8;
      const k = E.inOutSine(clamp((t - 0.2) / (b1 + 0.6)));
      EP17.sunset(ctx, T, { night: 1, cam: { zoom: 1.35, dx: -140, dy: -240 }, after: (g) => {
        CH.horse.draw(g, { x: 420, y: 1880, scale: 0.85, facing: 'left', pose: { name: 'bow', k: 0.5, tail: k, wind: 0.3 }, light: { dir: -Math.PI / 2 - 0.4, intensity: 0.8, front: 0.3 }, t: T, key: 's18-ho' });
        for (let i = 0; i < 5; i++) { const u = clamp(k * 1.6 - i * 0.15); if (u <= 0 || u >= 1) continue; const x = lerp(1100, 820, u) + i * 20, y = lerp(1900, 1450 + i * 30, u); CH.naga.draw(g, { x, y, scale: 0.22, facing: 'left', index: i, pose: { name: 'coil' }, light: { dir: -Math.PI / 2, intensity: 0.8, front: 0.3 }, t: T + i, key: 's18-n' + i }); }
      } });
      ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = 'rgba(150,175,235,0.3)'; ctx.fillRect(0, 0, R.W, R.H); ctx.restore();
      void dur;
    },
    post: () => ({ bloom: 0.36, vignette: 0.58, paper: 0.34 }),
  });
})();
