/*
 * Ep 6 · line "next" · the series "Next" card (KIT.series.nextScene) with a glimpse of
 * episode 7, "The Seven-Day Curse": the palace on one pillar under the crimson sunset of
 * the seventh day, a cold green hood rising behind it (EP7.tower, from ep07/_common).
 */
(function () {
  'use strict';
  const KIT = window.KIT, EP7 = window.EP7;
  const CH = KIT.characters;

  function glimpse(g, T) {
    EP7.tower(g, T, {
      sky: 1, guards: false,
      after: (q) => {
        KIT.glow(q, 700, 700, 520, '#20c880', 0.35);
        q.save(); q.globalAlpha = 0.55; q.globalCompositeOperation = 'screen';
        CH.takshaka.draw(q, { x: 760, y: 1250, scale: 0.6, facing: 'left', pose: { name: 'strike', k: 0.3 }, expression: { mood: 'wrath' }, light: { dir: Math.PI, intensity: 1, front: 0 }, t: T, key: 'n6-tk' });
        q.restore();
      },
    });
  }

  KIT.series.nextScene({ id: 'next', picture: glimpse, focus: [560, 820], zoom: 0.52 });
})();
