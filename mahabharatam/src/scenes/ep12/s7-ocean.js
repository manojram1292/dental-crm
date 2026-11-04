/*
 * Ep 12 · line "ocean" · THE TURN · the Ocean: "Churn me, then. But I too must have my share of the amrita."
 *
 * After a 350 ms rest: the Ocean himself (Samudra) rises from the waves, LARGE and frontal,
 * a crowned king of the waters, a wave breaking behind him (aquamarine light); on "share"
 * (beats[1]) he lifts a pearl and a branch of coral. The hosts, small on the shore at the
 * bottom corners, look up. Caption lifted.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP11 = window.EP11, EP12 = window.EP12;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'ocean',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b1 = env.beats[1] ?? 2.5;
      const rise = E.outCubic(clamp(t / 1.2)), offer = E.inOutCubic(clamp((t - b1 + 0.3) / 0.8));
      EP11.sea(ctx, T, {
        cam: { zoom: 1.0 + 0.04 * p }, hz: 1000, jewels: 0.6,
        after: (g) => {
          CH.samudra.draw(g, { x: 540, y: lerp(1900, 1480, rise), scale: 1.25, facing: 'front', pose: { name: 'offer', k: offer }, expression: { speak: EP12.mouth(env, t) }, light: { dir: -Math.PI / 2, intensity: 1.05, front: 0.45 }, t: T, key: 'o12-sa' });
          window.EP11.surf(g, 1480, T, 1, { color: '#eaffff', deep: '#1e4a6a', deep2: '#061424' });
          for (const [x, kind, f, i] of [[80, 'deva', 'right', 0], [190, 'deva', 'right', 3], [1000, 'asura', 'left', 0], [890, 'asura', 'left', 2]]) CH[kind].draw(g, { x, y: 2020, scale: 0.6, facing: f, index: i, pose: 'stand', expression: { look: -0.3 }, light: { dir: -Math.PI / 2, intensity: 0.9, front: 0.3 }, t: T + i, key: 'o12-' + kind + i });
        },
      });
    },
    post: () => ({ bloom: 0.42, vignette: 0.42, paper: 0.3 }),
  });
})();
