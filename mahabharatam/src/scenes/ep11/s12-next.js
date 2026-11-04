/*
 * Ep 11 · line "next" · the short, silent Next card (KIT.series.loopNextScene): a glimpse of
 * episode 12, "A Mountain for a Churning Stick": Ananta's seven hoods lifting Mount Mandara
 * from the earth; then the fire rises and the episode's first frame returns (the loop).
 */
(function () {
  'use strict';
  const KIT = window.KIT, EP11 = window.EP11;
  const CH = KIT.characters;
  function glimpse(g, T) {
    EP11.meru(g, T, { cam: { zoom: 1.0 }, after: (q) => {
      q.fillStyle = 'rgba(20,10,30,0.45)'; q.fillRect(-400, -400, 2000, 2800);
      CH.mandara.draw(q, { x: 540, y: 1250, scale: 0.55, facing: 'front', pose: { name: 'uprooted', k: 1 }, light: { dir: -Math.PI / 2, intensity: 1, front: 0.4 }, t: T, key: 'nx11-m' });
      CH.ananta.draw(q, { x: 760, y: 1700, scale: 0.6, facing: 'left', pose: { name: 'rise', k: 1 }, light: { dir: -Math.PI / 2 - 0.5, intensity: 1, front: 0.4 }, t: T, key: 'nx11-a' });
    } });
  }
  KIT.series.loopNextScene({ id: 'next', picture: glimpse, focus: [560, 1050], zoom: 0.5 });
})();
