/* Ep 14 · line "next" · the short, silent Next card: a glimpse of episode 15, the enchantress with the pot of amrita. */
(function () {
  'use strict';
  const KIT = window.KIT, EP13 = window.EP13;
  const CH = KIT.characters;
  function glimpse(g, T) {
    EP13.whiteSea(g, T, { hz: 1400, after: (q) => {
      CH.enchantress.draw(q, { x: 480, y: 1880, scale: 1.0, facing: 'left', pose: { name: 'carry', k: 1 }, light: EP13.seaGlow(480, 1700, 1.1), t: T, key: 'nx14-en' });
    } });
  }
  KIT.series.loopNextScene({ id: 'next', picture: glimpse, focus: [600, 1300], zoom: 0.55 });
})();
