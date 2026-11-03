/*
 * Ep 7 · line "curse" · Shringin: "In seven days, Takshaka will burn this king!"
 *
 * He flings the water up and forward (curse). The drops hang in the red air and on "seven"
 * (beats[0]) become seven gold sun-discs, the days, in an arc over him; on "Takshaka"
 * (beats[1]) a cold green hood rises against the red sky behind; on "burn" (beats[2]) the
 * last disc flares red.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP7 = window.EP7;
  const { clamp, E, lerp, hash } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'curse',
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b0 = env.beats[0] ?? 0.3, b1 = env.beats[1] ?? 2.1, b2 = env.beats[2] ?? 2.8;
      const fling = E.outCubic(clamp((t - (b0 - 0.35)) / 0.5));
      const days = clamp((t - b0) / 0.9) * 6 + clamp((t - (b2 - 0.1)) / 0.4);
      const hood = E.outCubic(clamp((t - (b1 - 0.3)) / 0.8));
      const O = { x: 620, y: 1640, scale: 1.02, facing: 'left', t: T };
      EP7.river(ctx, T, {
        red: 0.9, cam: { zoom: 1.12 - 0.04 * p, dy: -40 },
        after: (g) => {
          if (hood > 0.01) {
            KIT.glow(g, 330, 760, 520, '#20c880', 0.35 * hood);
            EP7.ghost(g, 0.6 * hood, (q) => CH.takshaka.draw(q, { x: 300, y: 1360, scale: 0.62, facing: 'right', pose: { name: 'strike', k: 0.4 * hood }, expression: { mood: 'wrath' }, light: { dir: 0, intensity: 1, front: 0 }, t: T, key: 'c7-tk' }), 'c7-g', 'screen');
          }
          CH.shringin.draw(g, { ...O, pose: { name: 'curse', k: fling }, expression: { mood: 'wrath', speak: EP7.mouth(env, t) }, light: { ...EP7.riverLight(620, 1640), intensity: 1.3 }, t: T, key: 'c7-sh' });
          // the flung water: drops rising from his hand, then becoming the seven days
          const hand = CH.shringin.anchor({ ...O, pose: { name: 'curse', k: fling } }, 'hand');
          const dropA = clamp((t - (b0 - 0.3)) / 0.4) * (1 - clamp((t - b0 - 0.4) / 0.5));
          g.save();
          for (let i = 0; i < 7; i++) {
            const u = clamp((t - (b0 - 0.3)) / 0.8), x = lerp(hand[0], 160 + i * 120, u) + Math.sin(i * 2) * 10, y = lerp(hand[1], 520 - Math.sin((i / 6) * Math.PI) * 90, E.outCubic(u));
            g.globalAlpha = dropA; g.fillStyle = '#e8f4ff'; g.beginPath(); g.ellipse(x, y, 7, 10, 0, 0, Math.PI * 2); g.fill();
          }
          g.restore();
        },
      });
      // the seven days, in an arc
      const a = clamp((t - b0) / 0.3);
      if (a > 0) {
        for (let i = 0; i < 7; i++) {
          const x = 160 + i * 120, y = 520 - Math.sin((i / 6) * Math.PI) * 90;
          const k = clamp(days - i);
          const last = i === 6;
          const lit = last ? clamp((t - (b2 - 0.1)) / 0.4) : k;
          KIT.glow(ctx, x, y, last ? 200 : 110, last ? '#ff4a1a' : '#ffb040', (last ? 0.6 : 0.4) * lit * a);
          ctx.save(); ctx.globalAlpha = a;
          ctx.strokeStyle = '#e7b54a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, last ? 36 : 28, 0, Math.PI * 2); ctx.stroke();
          ctx.globalAlpha = a * lit; ctx.fillStyle = last ? '#ff6a2a' : '#ffd070'; ctx.beginPath(); ctx.arc(x, y, last ? 30 : 22, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        }
      }
    },
    post: () => ({ bloom: 0.46, vignette: 0.52, paper: 0.3 }),
  });
})();
