/*
 * Ep 5 · line "afraid" · "Afraid, Janamejaya searched for a priest to protect him."
 *
 * NEW PLACE, NEW LIGHT: the palace at Hastinapura at night (EP5.palace), a colonnade of
 * carved pillars with oil lamps; amber pools on a dark polished floor. The king walks
 * past seated priests (the colonnade scrolls), looking from face to face; on "Afraid" he
 * glances back over his shoulder; on "priest" (beats[1]) one priest ahead is touched by
 * a warmer light. "Hastinapura" in gold at the start.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP5 = window.EP5;
  const { clamp, E } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'afraid',
    fadeIn: 0.6,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const b1 = env.beats[1] ?? dur * 0.6;
      const scroll = t * 110;
      const one = E.outCubic(clamp((t - (b1 - 0.2)) / 0.8));
      const glance = Math.sin(Math.PI * clamp((t - 0.1) / 1.4));
      EP5.palace(ctx, T, {
        scroll,
        after: (g) => {
          for (let i = 0; i < 6; i++) {
            const x = 520 + i * 300 - scroll, fl = KIT.flicker(T, 30 + i);
            if (x < -200 || x > 1300) continue;
            const chosen = i === 2;
            if (chosen && one > 0) KIT.glow(g, x, 1200, 300, '#ffd090', 0.45 * one);
            CH.sage.draw(g, { x, y: 1440, scale: 0.52, index: (i * 3) % 8, facing: 'front', pose: 'sit', expression: { look: -0.3 }, light: { dir: -Math.PI / 2 - 0.5, intensity: fl * (chosen ? 0.8 + 0.4 * one : 0.8), front: 0.45 + (chosen ? 0.25 * one : 0) }, t: T, key: 'a5-s' + i });
          }
          CH.janamejaya.draw(g, { x: 330, y: 1500, scale: 0.64, facing: 'right', pose: { name: 'walk', phase: T * 4.2, stride: 0.6 }, expression: { look: -0.25 * glance + 0.08 * one, mood: 'sorrow' }, light: { dir: -Math.PI / 2 - 0.4, intensity: 0.85 * KIT.flicker(T, 22), front: 0.15 }, t: T, key: 'a5-king' });
        },
      });
      const la = clamp((t - 0.2) / 0.6) * (1 - clamp((t - 2.6) / 0.6));
      EP5.label(ctx, (env.strings.placeHastinapura || 'Hastinapura').toUpperCase(), KIT.CX, 380, la, { size: 62, key: 'a5-place' });
    },
    post: () => ({ bloom: 0.38, vignette: 0.6, paper: 0.32 }),
  });
})();
