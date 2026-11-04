/*
 * Ep 17 · line "curse" · Kadru: "Then burn in the fire of Janamejaya's snake sacrifice!"
 * Kadru's finger high (curse), her eye green fire, the moonlit grove gone cold; above her a gold-
 * ringed medallion opens on the snake sacrifice of episode 8 (serpents falling into the fire): a
 * callback, with its label.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP8 = window.EP8, EP11 = window.EP11, EP17 = window.EP17;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'curse',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b0 = env.beats[0] ?? 0.5, b2 = env.beats[2] ?? 2.8;
      const cu = E.inOutCubic(clamp((t - b0 + 0.3) / 0.5)), v = E.outCubic(clamp((t - b0) / 0.8));
      EP17.grove(ctx, T, { cam: { zoom: 1.05 + 0.05 * p }, after: (g) => {
        KIT.glow(g, 400, 1200, 700, '#7aff9a', 0.2 * cu);
        CH.kadru.draw(g, { x: 400, y: 2020, scale: 1.2, facing: 'right', pose: { name: 'curse', k: cu }, expression: { mood: 'wrath', speak: EP17.mouth(env, t) }, light: { ...EP17.moonLight(400, 2020, 1.15), front: 0.45 }, t: T, key: 'c17-kd' });
      } });
      EP11.roundel(ctx, 700, 760, 230, v, (g, TT) => { EP8.satra(g, TT, {}); EP8.fallers(g, TT, 540, 900, 14, 1); }, T, { focus: [540, 1000], zoom: 0.55, key: 'c17-satra', glow: '#ff8a40' });
      const la = clamp((t - b2 + 0.2) / 0.4) * (1 - clamp((t - dur + 0.3) / 0.3));
      EP17.plaque(ctx, env.strings.curseLabel, null, 700, 1060, la, { size: 32, key: 'c17-lab' });
    },
    post: () => ({ bloom: 0.44, vignette: 0.55, paper: 0.32 }),
  });
})();
