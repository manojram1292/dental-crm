/*
 * Ep 7 · line "snake" · "Angry, the king draped a dead snake on him."
 *
 * The two of them, large. On "Angry" (beats[0]) an ember lights in the king's eye; he lowers
 * his bow's tip into the grass and lifts a dead snake on it (beats[1], "snake"); on "draped"
 * (beats[2]) he lays it across the sage's shoulders. The sage does not move.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP7 = window.EP7;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;

  const SM = { x: 330, y: 1580, scale: 0.98, facing: 'right', pose: 'sit' };
  R.scene({
    id: 'snake',
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b0 = env.beats[0] ?? 0.1, b1 = env.beats[1] ?? 1.9, b2 = env.beats[2] ?? 2.5;
      // drape k: 0 → 0.25 (tip down) → 0.5 (lifted) → 1 (laid)
      const k = clamp(0.25 * E.inOutSine(clamp((t - 0.15) / (b1 - 0.6))) + 0.25 * E.inOutSine(clamp((t - (b1 - 0.45)) / 0.6)) + 0.5 * E.inOutSine(clamp((t - (b2 - 0.2)) / 0.9)));
      const PK = { x: 900, y: 1600, scale: 0.98, facing: 'left', pose: { name: 'drape', k }, expression: { mood: t > b0 ? 'wrath' : 'calm' }, t: T };
      EP7.pen(ctx, T, {
        cam: { zoom: 1.08 + 0.05 * p, dx: -10, dy: -40 },
        after: (g) => {
          CH.shamika.draw(g, { ...SM, light: EP7.penLight(330, 1580), t: T, key: 'n7-sm' });
          // the snake: on the grass → hanging from the bow tip → over the sage's shoulders
          const tip = CH.parikshit.anchor(PK, 'bowTip');
          const hooked = clamp((k - 0.2) / 0.06), laid = clamp((k - 0.55) / 0.4);
          const sw = Math.sin(T * 3) * 10;
          const ground = [[560, 1590], [610, 1580], [660, 1596], [720, 1586], [770, 1594]];
          const hang = [[tip[0] - 30, tip[1] + 120 + sw], [tip[0] - 14, tip[1] + 50], tip.slice(), [tip[0] + 16, tip[1] + 60], [tip[0] + 30 + sw, tip[1] + 150]];
          const sF = CH.shamika.anchor({ ...SM, t: T }, 'shoulderF'), sN = CH.shamika.anchor({ ...SM, t: T }, 'shoulderN'), nk = CH.shamika.anchor({ ...SM, t: T }, 'neck');
          const drape = [[sN[0] + 40, sN[1] + 120], [sN[0] + 18, sN[1] + 14], [nk[0], nk[1] - 6], [sF[0] - 20, sF[1] + 14], [sF[0] - 40, sF[1] + 130]];
          const mixP = (A, B, u) => A.map((a, i) => [lerp(a[0], B[i][0], u), lerp(a[1], B[i][1], u)]);
          const pts = mixP(mixP(ground, hang, hooked), drape, E.inOutSine(laid));
          EP7.deadSnake(g, pts, 1.15, 1);
          CH.parikshit.draw(g, { ...PK, light: EP7.penLight(900, 1600), key: 'n7-pk' });
        },
      });
    },
    post: () => ({ bloom: 0.34, vignette: 0.42, paper: 0.34 }),
  });
})();
