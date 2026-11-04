/* Ep 18 · line "recap" · RECAP · episode 17's image as a memory: Kadru in the serpents' grove, her sons round her. */
(function () {
  'use strict';
  const KIT = window.KIT, EP17 = window.EP17;
  const CH = KIT.characters;
  function picture(g, T) {
    EP17.grove(g, T, { after: (q) => {
      for (let i = 0; i < 6; i++) { const x = 520 + (i % 3) * 190 + (i > 2 ? 90 : 0), y = 1720 + (i > 2 ? 220 : 0); CH.naga.draw(q, { x, y, scale: 0.56, facing: 'left', index: i, pose: { name: 'rise', k: 0.9 }, light: EP17.moonLight(x, y), t: T + i, key: 'r18-n' + i }); }
      CH.kadru.draw(q, { x: 260, y: 2000, scale: 1.12, facing: 'right', pose: { name: 'speak', k: 1 }, expression: { mood: 'wrath' }, light: { ...EP17.moonLight(260, 2000, 1.1), front: 0.45 }, t: T, key: 'r18-kd' });
    } });
  }
  KIT.series.recapScene({ id: 'recap', focus: [540, 1500], zoom: 0.6, picture, fadeIn: 0.3 });
})();
