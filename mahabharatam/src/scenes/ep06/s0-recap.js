/*
 * Ep 6 · line "recap" · RECAP · "A curse fell on King Janamejaya."
 * The series recap card: episode 5's key image as a memory (EP5.curseTableau): Sarama
 * towering over the king in the darkened enclosure at Kurukshetra.
 */
(function () {
  'use strict';
  const KIT = window.KIT, EP5 = window.EP5;
  KIT.series.recapScene({ id: 'recap', focus: [560, 1180], zoom: 0.72, picture: (g, T) => EP5.curseTableau(g, T, { dark: 0.8 }) });
})();
