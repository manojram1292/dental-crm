/*
 * Ep 13 · line "next" · the short, silent Next card: a glimpse of episode 14, "The Blue Throat"
 * (as tradition tells it): Shiva, ash-pale, drinking, his throat glowing blue over a dark sea.
 */
(function () {
  'use strict';
  const KIT = window.KIT, EP13 = window.EP13;
  const CH = KIT.characters;
  function glimpse(g, T) {
    EP13.whiteSea(g, T, { hz: 1300, dark: 0.85, after: (q) => {
      EP13.poison(q, 540, 1400, T, 0.6);
      CH.shiva.draw(q, { x: 540, y: 1750, scale: 0.9, facing: 'front', pose: { name: 'drink', k: 1, throat: 1 }, light: { dir: -Math.PI / 2, intensity: 1.05, front: 0.5 }, t: T, key: 'nx13-sh' });
    } });
  }
  KIT.series.loopNextScene({ id: 'next', picture: glimpse, focus: [540, 1050], zoom: 0.55 });
})();
