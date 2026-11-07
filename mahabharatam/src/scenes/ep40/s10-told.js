/* Ep 40 · line "told" · "And in the pauses of that sacrifice, the Mahabharata was told." · The enclosure at night, embers low; beside them Vaishampayana (episode 4's disciple) speaks to the seated king, palm leaves open. EP40.told is reused by the arc-end card. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP8 = window.EP8, EP34 = window.EP34, EP37 = window.EP37, EP38 = window.EP38, EP39 = window.EP39, EP40 = window.EP40;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  EP40.told = (ctx, T, t) => {
    const p = clamp(t / 5);
    EP40.embers(ctx, T, { k: 1, night: 1, cam: { zoom: 1.35 + 0.06 * p, dy: -360 }, after: (g) => {
      CH.janamejaya.draw(g, { x: 820, y: 1700, scale: 0.7, facing: 'left', pose: { name: 'sit' }, light: EP8.fireLight(820, 1500, 1.15, 0.75), t: T, key: 't40-jj' });
      CH.vaishampayana.draw(g, { x: 260, y: 1700, scale: 0.72, facing: 'right', pose: { name: 'speak', base: 'sit', k: 0.6 + 0.3 * Math.sin(t * 1.6) }, light: EP8.fireLight(260, 1500, 1.15, 0.75), t: T, key: 't40-va' });
    } });
  };
  R.scene({
    id: 'told',
    fadeIn: 0.3,
    draw(ctx, t, env) { EP40.told(ctx, env.T, t); },
    post: () => ({ bloom: 0.44, vignette: 0.5, paper: 0.3 }),
  });
})();
