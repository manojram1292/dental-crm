/*
 * Ep 4 · line "next" · "Next: The Curse of Sarama." (not captioned: the card shows it)
 * The series teaser card with a glimpse of episode 5: Sarama, the dog of the gods, at the
 * sacrificial fire, cursing (Team B's character: KIT.characters.sarama, 'curse' pose).
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT;
  const CH = KIT.characters;
  KIT.series.nextScene({
    id: 'next', fadeIn: 0.55, focus: [540, 1300], zoom: 0.72,
    picture(g, T) {
      KIT.vgrad(g, 0, R.H, [[0, '#0a0818'], [0.5, '#24142a'], [0.8, '#4a2018'], [1, '#1a0a06']]);
      const fl = KIT.flicker(T, 2);
      KIT.glow(g, 820, 1500, 700, R.PAL.saffron, 0.4 * fl, 'lighter', 0.8);
      const base = KIT.fire.altar(g, 820, 1560, 220, T, { light: 1 });
      KIT.fire.draw(g, 820, base + 2, 240, T, { seed: 2 });
      if (CH.sarama) {
        CH.sarama.draw(g, { x: 430, y: 1640, scale: 0.62, facing: 'right', pose: { name: 'curse', k: 1 }, light: { dir: 0, intensity: fl, front: 0.2 }, t: T, key: 'next-sarama' });
      } else {
        g.fillStyle = '#191428'; g.beginPath(); g.ellipse(430, 1500, 180, 90, 0, 0, R.TAU); g.fill();
      }
    },
  });
})();
