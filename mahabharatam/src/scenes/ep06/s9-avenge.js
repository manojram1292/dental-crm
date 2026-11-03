/*
 * Ep 6 · line "avenge" · NEXT · Uttanka: "Takshaka killed your father. Avenge him."
 *
 * Uttanka speaks, burning; on "killed" (beats[0]) a cold green hood rises in the lamp
 * smoke between them, over a fallen crown (Parikshit's); on "father" the king leans
 * forward on his throne; on "Avenge" (beats[2]) Uttanka points at him.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP6 = window.EP6;
  const { clamp, E } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'avenge',
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b0 = env.beats[0] ?? 0.5, b1 = env.beats[1] ?? 1.2, b2 = env.beats[2] ?? 1.9;
      const vis = E.inOutSine(clamp((t - (b0 - 0.2)) / 0.8)) * (1 - 0.5 * clamp((t - b2) / 0.8));
      const point = E.inOutCubic(clamp((t - (b2 - 0.3)) / 0.5));
      EP6.court(ctx, T, {
        cam: { zoom: 1.15 + 0.06 * p, dx: 10, dy: -80 },
        after: (g) => {
          const fl = KIT.flicker(T, 240);
          if (vis > 0.01) {
            EP6.fallenCrown(g, 560, 1450, 0.7, vis);
            KIT.glow(g, 560, 1050, 420, '#20c880', 0.35 * vis);
            EP6.ghost(g, 0.6 * vis, (v) => CH.takshaka.draw(v, { x: 590, y: 1520, scale: 0.55, facing: 'left', pose: { name: 'strike', k: 0.3 }, expression: { mood: 'wrath' }, light: { dir: -Math.PI / 2, intensity: 1, front: 0 }, t: T, key: 'v6-tk' }), 'v6-g', 'screen');
          }
          CH.janamejaya.draw(g, { x: 270, y: 1480, scale: 0.62, facing: 'right', pose: 'sit', expression: { look: -0.04 + 0.08 * clamp((t - b1) / 0.6), mood: t > b1 ? 'wrath' : 'calm' }, light: EP6.light(270, 1100, 240, 980, fl, 0.3), t: T, key: 'k6-king' });
          CH.uttanka.draw(g, { x: 840, y: 1500, scale: 0.62, facing: 'left', pose: point > 0 ? { name: 'point', k: point } : { name: 'speak', k: 0.7 }, expression: { mood: 'wrath', speak: EP6.mouth(env, t) }, light: EP6.light(840, 1100, 860, 980, KIT.flicker(T, 860), 0.25), t: T, key: 'k6-u' });
        },
      });
    },
    post: () => ({ bloom: 0.4, vignette: 0.55, paper: 0.32 }),
  });
})();
