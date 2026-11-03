/*
 * Ep 7 · line "hunt" · "King Parikshit, weary from the hunt, lost a wounded deer."
 *
 * NEW PLACE, NEW LIGHT: the forest at noon (EP7.noon), white-gold glare from straight above.
 * The deer, an arrow in its flank, bounds away to the left into the dark trees; the king
 * follows on foot, large in frame, bow in hand, and slows (weary) on "hunt" (beats[1]).
 * On "Parikshit" (beats[0]) his name and epithet; on "deer" (beats[2]) the deer is gone.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP7 = window.EP7;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'hunt',
    fadeIn: 0.6,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b0 = env.beats[0] ?? 0.4, b1 = env.beats[1] ?? 2.3, b2 = env.beats[2] ?? 4;
      const tired = E.inOutSine(clamp((t - (b1 - 0.6)) / 1.4));
      const dx = clamp(t / (b2 + 0.2));
      const deerX = lerp(640, -260, E.inSine(dx)), deerY = 1330 + 20 * Math.sin(T * 9);
      const kx = lerp(860, 700, E.outSine(clamp(t / dur)));
      EP7.noon(ctx, T, {
        cam: { zoom: 1.04 + 0.05 * p, dy: -20 },
        after: (g) => {
          if (deerX > -250) EP7.deer(g, deerX, deerY, 0.75, T, { phase: T * 10 });
          const pose = tired < 0.05 ? { name: 'walk', phase: T * 6, stride: 0.95 } : { name: 'weary', phase: T * lerp(6, 3.2, tired), k: tired, stride: lerp(0.9, 0.4, tired) };
          CH.parikshit.draw(g, { x: kx, y: 1620, scale: 0.98, facing: 'left', pose, expression: { look: 0.05 }, light: EP7.noonLight(kx, 1620), t: T, key: 'u7-pk' });
        },
      });
      const la = clamp((t - (b0 - 0.1)) / 0.5) * (1 - clamp((t - dur + 0.5) / 0.4));
      EP7.label(ctx, (env.strings.parikshitName || 'Parikshit').toUpperCase(), KIT.CX, 330, la, { size: 62, key: 'u7-name' });
      if (la > 0.01) {
        ctx.save(); ctx.globalAlpha = la; ctx.font = R.font(38, 'caption', 600, 'italic'); ctx.textAlign = 'center';
        ctx.fillStyle = '#f4e4c4'; ctx.shadowColor = 'rgba(10,6,4,0.95)'; ctx.shadowBlur = R.px(10);
        ctx.fillText(env.strings.parikshitEpithet || '', KIT.CX, 400); ctx.restore();
      }
    },
    post: () => ({ bloom: 0.4, vignette: 0.32, paper: 0.36 }),
  });
})();
