/* Ep 40 · line "cliff" · NEXT 1 · "But Sauti had another family to speak of: Shaunaka's own." · Back at the Naimisha fire: Sauti turns to the elder (the elder large and lit, foreground right); in the fire's smoke, the faint shape of a woman and a boar (the next arc). EP40.next is reused by the Next overlay. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP8 = window.EP8, EP34 = window.EP34, EP37 = window.EP37, EP38 = window.EP38, EP39 = window.EP39, EP40 = window.EP40;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  EP40.next = (ctx, T, t) => {
    const u = clamp(t / 4), sh = E.inOutSine(clamp((t - 1.8) / 1.4));
    const fl = KIT.flicker(T, 0), F = KIT.ashram.FIRE;
    KIT.ashram.draw(ctx, T, {
      cycle: 0.95, speed: 0, hide: [0, 1, 2, 3, 4, 5, 6], fireH: 260, smoke: { alpha: 0.4, lean: 0 },
      cam: { zoom: 1.45 + 0.05 * u, dx: 0, dy: -260 },
      after: (g) => {
        g.save(); g.globalAlpha = 0.35 * sh; g.fillStyle = '#ffd8b0';
        g.beginPath(); g.ellipse(F.x - 60, F.y - 520, 50, 140, 0, 0, Math.PI * 2); g.fill(); g.beginPath(); g.arc(F.x - 60, F.y - 690, 36, 0, Math.PI * 2); g.fill();
        g.beginPath(); g.ellipse(F.x + 120, F.y - 470, 110, 60, 0, 0, Math.PI * 2); g.fill(); g.beginPath(); g.moveTo(F.x + 200, F.y - 490); g.lineTo(F.x + 270, F.y - 470); g.lineTo(F.x + 200, F.y - 450); g.fill();
        g.restore();
        CH.sauti.draw(g, { x: 300, y: 1260, scale: 0.55, facing: 'right', pose: { name: 'speak', base: 'sit', k: 1 }, light: { dir: Math.atan2(F.y - 1000, F.x - 300), intensity: fl * 1.2, front: 0.75, fill: 0.3 }, t: T, key: 'n40-sauti' });
        CH.elder.draw(g, { x: 900, y: 1640, scale: 0.85, facing: 'left', pose: { name: 'sit' }, expression: { look: -0.1 }, light: { dir: Math.atan2(F.y - 1100, F.x - 900), intensity: fl * 1.2, front: 0.8, fill: 0.35 }, t: T, key: 'n40-elder' });
      },
    });
  };
  R.scene({
    id: 'cliff',
    fadeIn: 0.25,
    draw(ctx, t, env) { EP40.next(ctx, env.T, t); },
    post: () => ({ bloom: 0.44, vignette: 0.52, paper: 0.32 }),
  });
})();
