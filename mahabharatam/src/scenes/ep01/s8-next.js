/*
 * Line "next" · "Next: The Field of Five Lakes." (not captioned: the card shows it)
 *
 * The series' teaser card (KIT.series.nextScene) with a glimpse of episode 2's key image:
 * Parashurama on his rock in the red storm, axe raised.
 */
(function () {
  'use strict';
  const KIT = window.KIT, EP2 = window.EP2;

  KIT.series.nextScene({
    id: 'next',
    fadeIn: 0.55,
    focus: [560, 1130], zoom: 0.62,
    picture(g, T) {
      const fl = 0.25 + 0.75 * Math.pow(Math.max(0, Math.sin(T * 1.7)), 30);
      EP2.storm(g, T, { flash: fl * 0.5, horizon: 1500 });
      g.fillStyle = '#0c0405';
      g.beginPath(); g.moveTo(-40, 1920); g.lineTo(-40, 1560); g.lineTo(300, 1520); g.lineTo(520, 1470); g.lineTo(760, 1500); g.lineTo(1120, 1560); g.lineTo(1120, 1920); g.fill();
      KIT.characters.parashurama.draw(g, {
        x: 560, y: 1490, scale: 0.6, facing: 'left', pose: { name: 'raise-axe', k: 1 }, expression: { mood: 'wrath' },
        light: { dir: -Math.PI / 2 - 0.4, intensity: 1.1, front: 0 }, t: T, key: 'next-parashurama',
      });
    },
  });
})();
