/*
 * Ep 8 · line "learn" · "His ministers told young Janamejaya how his father died."
 *
 * The court at Hastinapura (EP6.court), saffron lamplight. The young king sits large on
 * his throne; the ministers, seen from behind, kneel before him. On "Janamejaya"
 * (beats[1]) the place label; in the lamp smoke between them a memory forms: the pillar,
 * the pavilion, a cold green hood (beats[2], "died"); the king's face hardens (wrath).
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP6 = window.EP6, EP7 = window.EP7, EP8 = window.EP8;
  const { clamp, E } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'learn',
    fadeIn: 0.6,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b0 = env.beats[0] ?? 0.4, b2 = env.beats[2] ?? 4.2;
      const mem = E.inOutSine(clamp((t - (b0 + 0.4)) / 1.6));
      const died = clamp((t - (b2 - 0.3)) / 0.6);
      EP6.court(ctx, T, {
        throneX: 620, cam: { zoom: 1.12 + 0.05 * p, dx: -40, dy: -40 },
        after: (g) => {
          if (mem > 0.01) {
            EP8.ghost(g, 0.8 * mem, (q) => {
              q.save(); q.translate(340, 260); q.scale(0.42, 0.42);
              EP7.tower(q, T, { sky: 0, guards: false });
              q.restore();
              KIT.glow(q, 470, 470, 180, '#30ff9a', 0.5 * died);
            }, 'l8-mem', 'screen');
          }
          const fl = KIT.flicker(T, 240);
          CH.janamejaya.draw(g, { x: 640, y: 1500, scale: 0.92, facing: 'left', pose: 'sit', expression: { look: 0.06 - 0.1 * died, mood: died > 0.4 ? 'wrath' : 'calm' }, light: EP6.light(640, 1100, 860, 980, fl, 0.32), t: T, key: 'l8-king' });
          for (const [x, i, s] of [[180, 1, 0.5], [340, 3, 0.56], [80, 6, 0.44]]) CH.sage.draw(g, { x, y: 1640, scale: s, facing: 'back', index: i, pose: 'sit', light: { dir: -0.3, intensity: fl, front: 0 }, t: T, key: 'l8-m' + i });
        },
      });
      const la = clamp((t - 0.3) / 0.5) * (1 - clamp((t - dur + 0.4) / 0.35));
      EP8.label(ctx, (env.strings.placeHastinapura || 'Hastinapura').toUpperCase(), KIT.CX, 300, la, { size: 56, key: 'l8-place' });
    },
    post: () => ({ bloom: 0.38, vignette: 0.5, paper: 0.32 }),
  });
})();
