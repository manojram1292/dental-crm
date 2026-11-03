/*
 * Ep 3 · line "next" · "Next: The Story Is Born." (not captioned: the card shows it)
 * The series teaser card with a glimpse of episode 4: Ganesha writing in Vyasa's hermitage.
 */
(function () {
  'use strict';
  const KIT = window.KIT, EP4 = window.EP4;
  KIT.series.nextScene({
    id: 'next', fadeIn: 0.55, focus: [620, 1060], zoom: 0.82,
    picture(g, T) {
      EP4.hermitage(g, T, {});
      KIT.characters.ganesha.draw(g, { x: 640, y: 1300, scale: 0.62, facing: 'left', pose: { name: 'write', k: 1, phase: T * 7 }, light: EP4.sunLight(640, 900, 1), t: T, key: 'next-ganesha' });
      EP4.stack(g, 850, 1320, 5, { w: 160 });
    },
  });
})();
