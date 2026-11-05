/* Ep 22 · line "blessed" · "They blessed him, and went where they wished." · Along the shore under the moon the couple turn, the brahmin's hand raised in blessing toward Garuda (a dark wing at the frame's edge), then walk on. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP21 = window.EP21;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'blessed',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      const b1 = env.beats[1] ?? 2;
      const walk = clamp((t - b1 + 0.6) / 1.2);
      EP21.bay(ctx, T, { village: 1, cam: { zoom: 1.7, dx: -60, dy: -520 }, after: (g) => {
        const x = lerp(520, 400, E.inOutSine(walk));
        CH.brahmin.draw(g, { x, y: 1490, scale: 0.42, facing: walk > 0.05 ? 'left' : 'right', pose: walk > 0.05 ? { name: 'walk', phase: T * 4 } : { name: 'bless', k: E.outCubic(clamp(t / 0.5)) }, light: EP21.moon(x, 1490, 1.05), t: T, key: 'bl22-br' });
        CH.nishadi.draw(g, { x: x - 90, y: 1490, scale: 0.39, facing: walk > 0.05 ? 'left' : 'right', pose: walk > 0.05 ? { name: 'walk', phase: T * 4 + 1 } : { name: 'bless', k: E.outCubic(clamp((t - 0.2) / 0.5)) }, light: EP21.moon(x - 90, 1490, 1.05), t: T, key: 'bl22-ni' });
      } });
      // Garuda's wing-tip at the right edge, close
      CH.garuda.draw(ctx, { x: 1400, y: 2600, scale: 1.4, facing: 'left', pose: { name: 'stand' }, light: EP21.moon(1400, 2600, 0.8), t: T, key: 'bl22-ga' });
      void p;
    },
    post: () => ({ bloom: 0.4, vignette: 0.46, paper: 0.32 }),
  });
})();
