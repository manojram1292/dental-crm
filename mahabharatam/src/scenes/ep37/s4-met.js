/* Ep 37 · line "met" · "On the road he met an old brahmin. It was Takshaka." · A stooped beggar in the road (Takshaka's guise, shimmering); on "Takshaka" (beats[1]) the guise slips and the serpent king rears behind it. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP36 = window.EP36, EP37 = window.EP37, EP8 = window.EP8;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'met',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, rev = E.outCubic(clamp((t - env.beats[1] + 0.3) / 0.6));
      EP37.road(ctx, T, { cam: { zoom: 1.3, dy: -260, dx: 40 }, after: (g) => {
        EP37.shadow(g, 300, 1640, 90); EP37.shadow(g, 720, 1640, 110);
        CH.healer.draw(g, { x: 300, y: 1640, scale: 0.62, facing: 'right', pose: { name: 'stand' }, light: EP37.noonLit(300, 1640), t: T, key: 'm37-he' });
        if (rev > 0) CH.takshaka.draw(g, { x: 760, y: 1660, scale: 0.85, facing: 'left', pose: { name: 'stand' }, alpha: rev, light: EP37.noonLit(760, 1660), t: T, key: 'm37-tk' });
        CH.takshaka.draw(g, { x: 720, y: 1640, scale: 0.6, facing: 'left', pose: { name: 'guise' }, alpha: 1 - rev, light: EP37.noonLit(720, 1640), t: T, key: 'm37-tg' });
      } });
    },
    post: () => ({ bloom: 0.42, vignette: 0.44, paper: 0.3 }),
  });
})();
