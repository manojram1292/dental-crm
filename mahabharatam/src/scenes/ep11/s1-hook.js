/*
 * Ep 11 · line "hook" · COLD OPEN (Sauti) · "Where did this horse come from?"
 *
 * Frame 1 is already moving: the white horse Uchchaihshravas surges out of breaking surf
 * under a night sky, mane and tail streaming, the camera pushing in; the Naimisha fire
 * licks up from the bottom edge (KIT.series.fireEdge: the last frame returns here, a loop).
 * The question is on screen from frame 1 in big text (KIT.series.hookCard; the caption is
 * off for this line). On "horse" (beats[0]) he breaks the surface; the title follows in
 * the post.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP11 = window.EP11;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'hook',
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const b0 = env.beats[0] ?? 1.3;
      const rise = E.outCubic(clamp(0.45 + t / (b0 + 0.6) * 0.55));
      const hx = lerp(700, 580, E.inOutSine(clamp(t / dur))), hy = lerp(1720, 1590, rise);
      EP11.sea(ctx, T, {
        cam: { zoom: 1.08 + 0.1 * E.inOutSine(clamp(t / dur)), dy: 30 }, jewels: 0.3, hz: 1020,
        after: (g) => {
          KIT.glow(g, hx, hy - 420, 700, '#dfe8ff', 0.2);
          CH.horse.draw(g, { x: hx, y: hy, scale: 0.8, facing: 'left', pose: { name: 'gallop', phase: T * 5.2, wind: 1 }, light: { dir: -Math.PI / 2 + 0.6, intensity: 1.0, front: 0.35 }, t: T, key: 'h11-horse' });
          EP11.surf(g, 1560 + 20 * Math.sin(T * 1.3), T, 1, { color: '#f4f6ff', deep: '#2a3a7a', deep2: '#0a1030' });
        },
      });
      const sp = env.speech[1];
      const out = clamp((t - sp - 0.05) / 0.3);
      KIT.series.hookCard(ctx, T, 1, env.line && env.script.lines[0].text, { y: 210, size: 88, gold: env.script.lines[0].hookGold, out });
      KIT.series.fireEdge(ctx, T, 1 - 0.75 * E.inOutSine(clamp(t / 1.4)), { h: 300 });
      const tk = clamp((t - sp - 0.05) / 0.9);
      if (tk > 0) KIT.series.episodeTitle(ctx, T, tk, env.strings, { y: 360, key: 'ep11-title' });
    },
    post: () => ({ bloom: 0.3, vignette: 0.45, paper: 0.3 }),
  });
})();
