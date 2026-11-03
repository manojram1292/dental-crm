/*
 * Ep 4 · line "recap" · RECAP · "Eighteen armies fought for eighteen days."
 * The series recap card: episode 3's eighteen army blocks on the field of five lakes, as a memory.
 */
(function () {
  'use strict';
  const KIT = window.KIT, EP2 = window.EP2;
  KIT.series.recapScene({ id: 'recap', focus: [540, 905], zoom: 0.62, picture: (g, T) => EP2.armiesField(g, T) });
})();
