/*
 * Ep 2 · line "recap" · RECAP · "In the forest, the sages asked Sauti for the great story."
 *
 * The series recap card (KIT.series.recapScene): episode 1's last image at the fire, as a
 * sepia memory in the niche: night in the Naimisha clearing, Sauti standing at the edge of
 * the circle, every sage turned to him, the king's court shimmering in the smoke.
 */
(function () {
  'use strict';
  const KIT = window.KIT;
  KIT.series.recapScene({
    id: 'recap',
    focus: [470, 1180], zoom: 0.92,
    picture(g, T) {
      KIT.ashram.draw(g, T, {
        cycle: 0.75, speed: 0, tellerFront: true, fireLean: -0.3,
        turn: (i) => (i === 0 || i === 6 ? -0.6 : -0.95),
        smoke: { alpha: 0.42, lean: -120, h: 980 },
        teller: { x: 225, y: 1660, scale: 0.62, facing: 'right', pose: 'stand', expression: { look: 0.04 } },
      });
    },
  });
})();
