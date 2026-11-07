/* Ep 39 · line "chant" · "The priests chanted Takshaka's name, louder and louder." · The four priests pour into the fire; gold chant syllables rise up the smoke in spirals, thicker on each beat. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP8 = window.EP8, EP37 = window.EP37, EP38 = window.EP38, EP39 = window.EP39;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'chant',
    fadeIn: 0.15,
    draw(ctx, t, env) {
      const T = env.T, B = env.beats, rp = clamp((t - B[0] + 0.3) / 1.0) * 0.5 + 0.5 * clamp((t - B[2] + 0.3) / 0.6);
      EP39.storm(ctx, T, { ropes: rp, cam: { zoom: 1.0 + 0.06 * clamp(t / env.dur), dy: -100 }, after: (g) => {
        for (let i = 0; i < 4; i++) CH.priest.draw(g, { x: 140 + i * 270, y: 1560, scale: 0.62, facing: i < 2 ? 'right' : 'left', index: i, pose: { name: 'offer', k: 0.5 + 0.5 * Math.sin(T * 3 + i) }, light: EP39.fireLit(140 + i * 270, 1700), t: T + i, key: 'ch39-p' + i });
      } });
    },
    post: () => ({ bloom: 0.46, vignette: 0.48, paper: 0.3 }),
  });
})();
