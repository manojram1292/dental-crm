/*
 * Ep 3 · line "units" · "As many elephants. Sixty-five thousand horses. A hundred and
 * nine thousand soldiers on foot."
 *
 * The akshauhini as a temple wall of four friezes, one per arm of the army, each
 * marching slowly to the right in the fire's light, each with its figure in gold
 * numerals (the exact counts, though the narration rounds them): the chariots,
 * already counted, at the top; then the elephants, the horses and the foot soldiers
 * slide in on their beats and their counters roll up and hold.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP3 = window.EP3;
  const { clamp, E, PAL } = R;

  const ROWS = [
    { kind: 'chariot', key: 'chariots', y: 250, beat: -1 },
    { kind: 'elephant', key: 'elephants', y: 488, beat: 0 },
    { kind: 'horse', key: 'horses', y: 726, beat: 1 },
    { kind: 'soldier', key: 'foot', y: 964, beat: 2 },
  ];
  const BAND_H = 222;

  R.scene({
    id: 'units',
    fadeIn: 0.5,
    draw(ctx, t, env) {
      const T = env.T;
      const fl = KIT.flicker(T, 0);
      KIT.vgrad(ctx, 0, R.H, [[0, '#08081a'], [0.45, '#151328'], [0.8, '#24130f'], [1, '#160a06']]);
      KIT.glow(ctx, 540, 1700, 1200, PAL.saffron, 0.22 * fl, 'lighter', 0.5);
      ROWS.forEach((row, i) => {
        const b = row.beat < 0 ? -1 : (env.beats[row.beat] ?? 0.5 + row.beat * 2);
        const a = row.beat < 0 ? 1 : E.outCubic(clamp((t - (b - 0.25)) / 0.55));
        if (a <= 0.003) return;
        const y0 = row.y, y1 = y0 + BAND_H;
        // the band: dark plaster with gold rules
        ctx.save();
        ctx.globalAlpha = a;
        const slide = (1 - a) * 120;
        ctx.translate(slide, 0);
        ctx.fillStyle = '#1c0f0a'; ctx.fillRect(-20, y0, R.W + 40, BAND_H);
        ctx.fillStyle = 'rgba(231,181,74,0.7)'; ctx.fillRect(-20, y0 + 4, R.W + 40, 3); ctx.fillRect(-20, y1 - 7, R.W + 40, 3);
        KIT.glow(ctx, 540, y1, 700, '#ff9a40', 0.1 * fl, 'lighter', 0.3);
        ctx.restore();
        ctx.save(); ctx.translate(slide, 0);
        ctx.beginPath(); ctx.rect(-20, y0 + 8, R.W + 40, BAND_H - 16); ctx.clip();
        EP3.frieze(ctx, T, row.kind, y1 - 14, { alpha: a, speed: 22 + 4 * i });
        ctx.restore();
        // a dark wash on the left, under the figure, so the numerals read
        ctx.save(); ctx.globalAlpha = a;
        const g = ctx.createLinearGradient(0, 0, 760, 0);
        g.addColorStop(0, 'rgba(12,7,5,0.82)'); g.addColorStop(0.6, 'rgba(12,7,5,0.6)'); g.addColorStop(1, 'rgba(12,7,5,0)');
        ctx.fillStyle = g; ctx.fillRect(0, y0 + 10, 760, 96);
        ctx.restore();
        // the figure: rolls up over 1.2 s on its beat (the chariots are already counted)
        const N = EP3.fig(env, row.key);
        const roll = row.beat < 0 ? 1 : E.outCubic(clamp((t - b) / 1.2));
        const done = row.beat < 0 ? 0 : clamp((t - b - 1.2) / 0.4);
        EP3.counter(ctx, N * roll, 92, y0 + 84, {
          env, size: 72, alpha: a, align: 'left', inline: true, key: 'units-' + row.key,
          sheen: row.beat < 0 ? -1 : -0.3 + 1.6 * clamp((t - b - 1.0) / 0.9), glow: 0.25 + 0.25 * done,
          label: env.strings[row.key], labelSize: 44, gap: 22,
        });
      });
    },
    post: () => ({ bloom: 0.36, vignette: 0.5, paper: 0.34 }),
  });
})();
