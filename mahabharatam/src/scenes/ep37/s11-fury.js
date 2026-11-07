/* Ep 37 · line "fury" · "And his grief became fury." · He stands (beats[0]); the torches flare red; his shadow climbs the panel; a low angle. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP36 = window.EP36, EP37 = window.EP37, EP8 = window.EP8;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'fury',
    fadeIn: 0.1,
    draw(ctx, t, env) {
      const T = env.T, up = E.outCubic(clamp((t - env.beats[0] + 0.5) / 0.6));
      EP36.court(ctx, T, { cam: { zoom: 1.35, dy: -260 }, after: (g) => {
        KIT.glow(g, 540, 900, 900, '#ff3010', 0.35 * up);
        g.save(); g.globalAlpha = 0.5 * up; g.fillStyle = '#000'; g.beginPath(); g.ellipse(560, 700, 160, 380, 0, 0, Math.PI * 2); g.fill(); g.restore();
        CH.janamejaya.draw(g, { x: 560, y: lerp(1600, 1750, up), scale: lerp(0.85, 1.05, up), facing: 'left', pose: { name: up > 0.5 ? 'speak' : 'sit', k: up }, expression: { mood: 'wrath' }, light: { ...EP36.torch(560, 1300, 1.3), front: 0.7 }, t: T, key: 'u37-jj' });
      } });
    },
    post: () => ({ bloom: 0.46, vignette: 0.54, paper: 0.3 }),
  });
})();
