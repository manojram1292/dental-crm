/*
 * Ep 9 · line "recap" · RECAP · "Janamejaya's fire drew the serpents down from the sky."
 * The series recap card: episode 8's key image as a memory: the great fire of the
 * sacrifice, priests in black on either side, serpents spiralling down into it.
 */
(function () {
  'use strict';
  const KIT = window.KIT, EP8 = window.EP8;
  const CH = KIT.characters;
  function picture(g, T) {
    EP8.satra(g, T, {
      fire: 1.2, sky: (q) => EP8.fallers(q, T, 540, 1260, 20, 1, { top: -200 }),
      after: (q) => {
        for (const [x, i, f] of [[150, 0, 'right'], [930, 1, 'left']]) CH.priest.draw(q, { x, y: 1660, scale: 0.85, facing: f, index: i, pose: { name: 'chant', base: 'sit', k: 1 }, light: EP8.fireLight(x, 1660, 1, 0.4), t: T, key: 'r9-p' + i });
      },
    });
  }
  KIT.series.recapScene({ id: 'recap', focus: [540, 1000], zoom: 0.62, picture });
})();
