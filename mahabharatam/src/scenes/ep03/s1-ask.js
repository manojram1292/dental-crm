/*
 * Ep 3 · line "ask" · elder_sage: "And what is an akshauhini, the army you speak of?"
 *
 * The same framing as episode 2's question, for continuity: the Naimisha fire
 * circle at night, Sauti seated on the left facing the fire, the elder sage
 * (Shaunaka) on the right. On "akshauhini" (env.beats[0]) the elder leans in and
 * his hand opens toward Sauti; his lips move with his words; the sages turn to
 * Sauti. Here the camera eases toward Sauti instead (he answers next), and the
 * fire burns a little higher.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP2 = window.EP2;   // EP2.mouth: episode 2's helper
  const { clamp, E } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'ask',
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur, 0, 1.3);
      const fl = KIT.flicker(T, 0);
      const wb = env.beats[0] ?? dur * 0.5;
      const lean = E.inOutCubic(clamp((t - (wb - 1.4)) / 1.5));
      const order = [0, 1, 2, 3, 4];
      const turn = (i) => E.inOutCubic(clamp((t - 0.4 - order.indexOf(i) * 0.15) / 0.8)) * (i < 2 ? -0.7 : i > 2 ? 0.5 : -0.4) * 0.8;
      const F = KIT.ashram.FIRE;
      KIT.ashram.draw(ctx, T, {
        cycle: 0.75, speed: 0, hide: [5, 6], turn,
        smoke: { alpha: 0.36, lean: 20 },
        cam: { zoom: 1.0 + 0.08 * E.inOutSine(p), dx: 50 * E.inOutSine(p), dy: -20 * E.inOutSine(p) }, fireH: 230 + 30 * E.inOutSine(clamp((t - wb) / 1.5)),
        after: (g) => {
          // Sauti: left, facing the fire and the elder
          CH.sauti.draw(g, {
            x: 190, y: 1530, scale: 0.7, facing: 'right', pose: 'sit', expression: { look: 0.03 },
            light: { dir: Math.atan2(F.y - 1250, F.x - 190), intensity: fl, front: 0.2 }, t: T, key: 'ask3-sauti',
          });
          // the elder: right, leaning in to ask
          CH.elder.draw(g, {
            x: 880, y: 1540, scale: 0.74, facing: 'left', pose: { name: 'speak', base: 'sit', k: lean },
            expression: { speak: EP2.mouth(env, t) },
            light: { dir: Math.atan2(F.y - 1250, F.x - 880), intensity: fl, front: 0.2 }, t: T, key: 'ask3-elder',
          });
        },
      });
    },
    post: () => ({ bloom: 0.34, vignette: 0.5, paper: 0.32 }),
  });
})();
