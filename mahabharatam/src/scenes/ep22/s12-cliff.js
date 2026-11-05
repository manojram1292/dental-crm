/* Ep 22 · line "cliff" · NEXT 1 (the catalog line) · "Two brothers, cursed into an elephant and a tortoise, were fighting in a lake." · Over Kashyapa's raised hand a gold-ringed vision opens on the lake: the elephant and the tortoise locked in a fight, spray thrown up. EP22.vision is reused by the Next overlay. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP22 = window.EP22, EP11 = window.EP11;
  const { clamp, E } = R;
  const CH = KIT.characters;
  EP22.fight = (g, TT, k = 1) => {
    EP22.lake(g, TT, { spray: k, after: (q) => {
      CH.vibhavasu.draw(q, { x: 760, y: 1330, scale: 0.42, facing: 'right', pose: { name: 'swim', phase: TT * 2, fight: 0.6 + 0.4 * Math.sin(TT * 3) }, light: { dir: -2.2, intensity: 1.05, front: 0.45 }, t: TT, key: 'v-vib' });
      CH.supratika.draw(q, { x: 470, y: 1330, scale: 0.5, facing: 'right', pose: { name: 'stand', fight: 0.5 + 0.5 * Math.sin(TT * 3 + 1), trunk: Math.sin(TT * 2) }, light: { dir: -2.2, intensity: 1.05, front: 0.45 }, t: TT, key: 'v-sup' });
    } });
  };
  EP22.vision = (ctx, T, t, b1) => {
    EP22.peak(ctx, T, { cam: { zoom: 1.6, dx: 160, dy: -380 }, after: (g) => {
      CH.kashyapa.draw(g, { x: 330, y: 1430, scale: 0.55, facing: 'right', pose: { name: 'bless', base: 'sit', k: 1 }, light: EP22.dawn(330, 1430, 1.0), t: T, key: 'cv22-ka' });
    } });
    const v = E.outCubic(clamp((t - b1 + 0.6) / 0.6));
    EP11.roundel(ctx, 600, 820, 330, v, (g, TT) => EP22.fight(g, TT, v), T, { focus: [600, 1150], zoom: 0.62, key: 'cv22-v', glow: '#e8e0a0' });
  };
  R.scene({
    id: 'cliff',
    fadeIn: 0.2,
    draw(ctx, t, env) { EP22.vision(ctx, env.T, t, env.beats[1] ?? 1.5); },
    post: () => ({ bloom: 0.4, vignette: 0.46, paper: 0.32 }),
  });
})();
