/*
 * Ep 11 · line "amrita" · "They longed for the amrita, the drink that frees from death."
 *
 * Closer: three devas LARGE in the foreground, faces lifted, Meru's gold behind. On
 * "amrita" (beats[0]) a solid medallion opens above them (EP11.roundel): a white pot
 * brimming with light; its name card. On "death" (beats[1]) the light from the pot flares.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP11 = window.EP11;
  const { clamp, E, TAU } = R;
  const CH = KIT.characters;

  function pot(g, T, flare) {
    KIT.vgrad(g, 0, 1920, [[0, '#7a4a18'], [0.5, '#c8883a'], [1, '#6a3a10']]);
    KIT.glow(g, 540, 860, 800, '#fff6d8', 0.8 + 0.3 * flare);
    g.save(); g.translate(540, 1000); g.scale(1.25, 1.25);
    // a white kalasha with a lid, light spilling from its mouth
    g.fillStyle = '#fbf6ee'; g.strokeStyle = '#e8b84a'; g.lineWidth = 8;
    g.beginPath(); g.ellipse(0, 60, 210, 190, 0, 0, TAU); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(-90, -110); g.lineTo(90, -110); g.lineTo(70, -50); g.lineTo(-70, -50); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.ellipse(0, -120, 120, 26, 0, 0, TAU); g.fill(); g.stroke();
    for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * 0.22; g.globalAlpha = 0.5 + 0.3 * Math.sin(T * 3 + i); g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(-14, -130); g.lineTo(Math.cos(a) * 520 - 30, -130 + Math.sin(a) * 520); g.lineTo(Math.cos(a) * 520 + 30, -130 + Math.sin(a) * 520); g.lineTo(14, -130); g.closePath(); g.fill(); }
    g.restore();
  }

  R.scene({
    id: 'amrita',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b0 = env.beats[0] ?? 1, b1 = env.beats[1] ?? 3.4;
      const v = E.outCubic(clamp((t - b0 + 0.4) / 0.7)), flare = E.inOutSine(clamp((t - b1 + 0.2) / 0.6));
      EP11.meru(ctx, T, {
        cam: { zoom: 1.5 + 0.05 * p, dy: 300 },
        after: (g) => {
          for (const [x, y, s, f, i] of [[200, 2060, 1.0, 'right', 1], [880, 2080, 1.02, 'left', 4], [540, 2160, 1.12, 'left', 0]]) CH.deva.draw(g, { x, y, scale: s, facing: f, index: i, pose: 'stand', expression: { look: -0.28 * v }, light: { dir: -Math.PI / 2 + (x < 540 ? 0.35 : -0.35), intensity: 1.1 + 0.2 * flare, front: 0.45 }, t: T + i, key: 'a11-d' + i });
        },
      });
      EP11.roundel(ctx, 540, 590, 240, v, (g, TT) => pot(g, TT, flare), T, { focus: [540, 960], zoom: 0.55, key: 'a11-pot', glow: '#fff4d0' });
      const la = clamp((t - b0) / 0.5) * (1 - clamp((t - dur + 0.4) / 0.4));
      EP11.plaque(ctx, env.strings.amritaName, env.strings.amritaEpithet, KIT.CX, 935, la, { size: 56, key: 'a11-name' });
    },
    post: () => ({ bloom: 0.5, vignette: 0.32, paper: 0.3 }),
  });
})();
