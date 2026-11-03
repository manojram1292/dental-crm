/*
 * Ep 2 · line "next" · "Next: Eighteen Armies." (not captioned: the card shows it)
 * The series teaser card with a glimpse of episode 3: the eighteen army blocks on the field.
 */
(function () {
  'use strict';
  const KIT = window.KIT, EP2 = window.EP2;
  KIT.series.nextScene({ id: 'next', fadeIn: 0.55, focus: [540, 905], zoom: 0.55, picture: (g, T) => EP2.armiesField(g, T) });
})();
