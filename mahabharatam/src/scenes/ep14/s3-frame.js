/*
 * Ep 14 · line "frame" · FRAME (Sauti, close) · "Here many tellers add a story that many manuscripts leave out."
 * The Naimisha fire, close on Sauti's face and hands (a fourth angle): he says it plainly. The
 * tag and a small source line ("Southern manuscripts and the Puranas · not in the Critical
 * Edition") at the top: honest, unhurried, no sneer at the beloved version.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP14 = window.EP14;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'frame',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const fl = KIT.flicker(T, 0), F = KIT.ashram.FIRE;
      const k = E.inOutCubic(clamp(t / 1.0));
      KIT.ashram.draw(ctx, T, {
        cycle: 0.76, speed: 0, hide: [5, 6, 0], turn: () => -0.3,
        smoke: { alpha: 0.35, lean: 5 }, fireH: 240,
        cam: { zoom: 1.75 + 0.06 * p, dx: 330, dy: -330 },
        after: (g) => {
          CH.sauti.draw(g, { x: 230, y: 1560, scale: 0.92, facing: 'right', pose: { name: 'speak', base: 'sit', k }, expression: { look: -0.05, speak: EP14.mouth(env, t) }, light: { dir: Math.atan2(F.y - 1250, F.x - 230), intensity: fl * 1.15, front: 0.5 }, t: T, key: 'f14-sauti' });
        },
      });
      EP14.tag(ctx, T, clamp(t / 0.5), env.strings);
      EP14.source(ctx, clamp((t - 0.6) / 0.5), env.strings.sourceNote);
    },
    post: () => ({ bloom: 0.42, vignette: 0.55, paper: 0.32 }),
  });
})();
