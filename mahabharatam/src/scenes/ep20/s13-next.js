/* Ep 20 · line "next" · the short, silent Next card: a glimpse of episode 21, "The Price of Freedom": the serpents rearing on the island, the white pot of amrita glowing far above them. */
(function () {
  'use strict';
  const KIT = window.KIT, EP20 = window.EP20, EP15 = window.EP15;
  const CH = KIT.characters;
  function glimpse(g, T) {
    EP20.island(g, T, { after: (q) => {
      EP15.potGlow(q, 540, 620, 1.0, 1);
      for (let i = 0; i < 5; i++) CH.naga.draw(q, { x: 260 + i * 140, y: 1300, scale: 0.3, facing: i < 2 ? 'right' : 'left', index: i, pose: { name: 'rise', k: 1 }, light: EP20.noon(260 + i * 140, 1300), t: T + i, key: 'nx20-n' + i });
    } });
  }
  KIT.series.loopNextScene({ id: 'next', picture: glimpse, focus: [540, 1000], zoom: 0.55 });
})();
