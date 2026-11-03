/*
 * Ep 3 · line "recap" · RECAP · "Sauti named the battlefield: the field of five lakes."
 * The series recap card: episode 2's field seen from above, its five lakes holy and clear,
 * lotuses open, as a memory.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP2 = window.EP2;
  KIT.series.recapScene({
    id: 'recap', focus: [540, 960], zoom: 0.8,
    picture(g, T) {
      g.fillStyle = '#1e120a'; g.fillRect(0, 0, R.W, R.H);
      g.save(); g.translate(540, 960); g.rotate(-0.05); g.scale(1.0, 1.0); g.translate(-500, -500);
      EP2.mandala(g, T, [1, 1, 1, 1, 1], { red: 0, clear: 1 });
      EP2.LAKES.forEach(([x, y, r], i) => { EP2.lotus(g, x - r * 0.3, y + r * 0.2, 0.5, 1, 1, i); EP2.lotus(g, x + r * 0.35, y - r * 0.25, 0.4, 1, 1, i + 9); });
      g.restore();
    },
  });
})();
