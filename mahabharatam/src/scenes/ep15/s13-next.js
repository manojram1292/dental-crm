/* Ep 15 · line "next" · the short, silent Next card: a glimpse of episode 16: Nara drawing his bow, Narayana's discus over the shore. */
(function () {
  'use strict';
  const KIT = window.KIT, EP15 = window.EP15;
  const CH = KIT.characters;
  function glimpse(g, T) {
    EP15.dusk(g, T, { after: (q) => {
      CH.nara.draw(q, { x: 640, y: 1900, scale: 0.95, facing: 'left', pose: { name: 'draw', k: 1 }, light: EP15.duskLight(640, 1900, 1.1), t: T, key: 'nx15-na' });
      CH.vishnu.discus(q, 300, 800, 90, T, 1, T * 10);
    } });
  }
  KIT.series.loopNextScene({ id: 'next', picture: glimpse, focus: [520, 1300], zoom: 0.55 });
})();
