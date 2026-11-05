/* Ep 25 · line "born" · "That Indra of birds was born to Vinata: Garuda." · Kashyapa's hermitage before sunrise (episode 9's place): Vinata with the golden egg; on "Garuda" a medallion opens on the blazing bird rising (episode 19's image). */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP9 = window.EP9, EP11 = window.EP11;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'born',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      const b1 = env.beats[1] ?? 2.4;
      EP9.hermitage(ctx, T, { cam: { zoom: 1.2 + 0.04 * p, dy: -120 }, after: (g) => {
        CH.vinata.draw(g, { x: 520, y: 1700, scale: 0.85, facing: 'right', pose: { name: 'cradle', k: 1 }, light: { dir: -0.4, intensity: 1.05, front: 0.55 }, t: T, key: 'b25-vn' });
      } });
      const v = E.outCubic(clamp((t - b1 + 0.4) / 0.6));
      EP11.roundel(ctx, 600, 640, 260, v, (g, TT) => { KIT.vgrad(g, 0, R.H, [[0, '#3a0a10'], [0.5, '#c0401a'], [1, '#ffd080']]); CH.garuda.draw(g, { x: 540, y: 1500, scale: 0.6, facing: 'left', pose: { name: 'spread', k: 1, blaze: 0.8 }, light: { dir: -Math.PI / 2, intensity: 1.2, front: 0.65 }, t: TT, key: 'b25-ga' }); }, T, { focus: [540, 1100], zoom: 0.5, key: 'b25-v', glow: '#ffc060' });
    },
    post: () => ({ bloom: 0.4, vignette: 0.44, paper: 0.32 }),
  });
})();
