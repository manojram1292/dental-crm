/*
 * Ep 17 · line "order" · Kadru: "My sons, hang from his tail, like black hairs."
 * NEW PLACE AND LIGHT: the serpents' grove at night (EP17.grove), deep green moonlight among roots.
 * Kadru LARGE at the left, speaking; her sons rear round her, six varied hoods (one, three, five).
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP17 = window.EP17;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'order',
    fadeIn: 0.35,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const sp = E.inOutCubic(clamp(t / 0.8));
      EP17.grove(ctx, T, { cam: { zoom: 1.0 + 0.05 * p }, after: (g) => {
        for (let i = 0; i < 6; i++) { const x = 520 + (i % 3) * 190 + (i > 2 ? 90 : 0), y = 1720 + (i > 2 ? 220 : 0); CH.naga.draw(g, { x, y, scale: lerp(0.5, 0.62, i / 5), facing: 'left', index: i, pose: { name: 'rise', k: 0.75 + 0.25 * Math.sin(T + i) }, light: EP17.moonLight(x, y), t: T + i, key: 'o17-n' + i }); }
        CH.kadru.draw(g, { x: 260, y: 2000, scale: 1.12, facing: 'right', pose: { name: 'speak', k: sp }, expression: { mood: 'wrath', speak: EP17.mouth(env, t) }, light: { ...EP17.moonLight(260, 2000, 1.1), front: 0.45 }, t: T, key: 'o17-kd' });
      } });
    },
    post: () => ({ bloom: 0.42, vignette: 0.55, paper: 0.32 }),
  });
})();
