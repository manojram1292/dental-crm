/*
 * Ep 5 · line "hook" · HOOK (Sauti) · "But before that… this king was cursed. By a dog."
 *
 * Back at the Naimisha fire at night, the frame of the series: Sauti seated on the left,
 * speaking; the elder on the right; the circle of sages. In the smoke above the fire the
 * king's figure glows saffron (pouring ghee); on "cursed" (beats[0]) it darkens to violet
 * and a low drum lands; on "dog" (beats[1]) the smoke draws the luminous profile of a great
 * dog, head high: Sarama. The episode title follows the question (KIT.series.episodeTitle).
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP5 = window.EP5;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'hook',
    fadeIn: 0.5,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur, 0, 1.3);
      const fl = KIT.flicker(T, 0);
      const b0 = env.beats[0] ?? dur * 0.4, b1 = env.beats[1] ?? dur * 0.7;
      const king = E.outCubic(clamp((t - 0.3) / 1.0));
      const curse = E.inOutSine(clamp((t - (b0 - 0.1)) / 0.8));
      const dog = E.outCubic(clamp((t - (b1 - 0.25)) / 0.9));
      const k = E.inOutCubic(clamp((t - 0.2) / 0.9));
      const F = KIT.ashram.FIRE;
      KIT.ashram.draw(ctx, T, {
        cycle: 0.75, speed: 0, hide: [5, 6], turn: (i) => (i < 2 ? -0.5 : i > 2 ? 0.4 : -0.3) * (1 - dog) + dog * 0.1,
        smoke: { alpha: 0.38, lean: 10 }, fireH: 230 - 40 * curse + 50 * dog,
        cam: { zoom: 1.0 + 0.06 * E.inOutSine(p), dy: -10 * E.inOutSine(p) },
        vision: (g) => {
          // the king in the smoke, then his figure darkens under the curse
          const ka = king * (1 - 0.75 * dog);
          if (ka > 0.01) {
            KIT.glow(g, 520, 700, 320, curse > 0.5 ? '#6a4aa0' : '#f08a24', 0.25 * ka);
            EP5.ghost(g, ka * 0.85, (v) => {
              CH.janamejaya.draw(v, { x: 460, y: 960, scale: 0.4, facing: 'right', pose: { name: 'offer', k: 1 }, light: { dir: Math.PI / 2, intensity: lerp(1, 0.4, curse), front: lerp(0.4, 0, curse) }, t: T, key: 'h5-vk' });
              if (curse > 0.01) { v.save(); v.globalCompositeOperation = 'source-atop'; v.globalAlpha = 0.7 * curse; v.fillStyle = '#2a1a4a'; v.fillRect(250, 400, 460, 600); v.restore(); }
            }, 'h5-g1');
          }
          // Sarama in the smoke
          EP5.ghost(g, dog * 0.85, (v) => CH.sarama.draw(v, { x: 600, y: 920, scale: 0.42, facing: 'left', pose: { name: 'curse', k: 0.6 }, light: { dir: Math.PI / 2, intensity: 0.9, front: 0.1 }, t: T, key: 'h5-vs' }), 'h5-g2', 'screen');
        },
        after: (g) => {
          CH.sauti.draw(g, {
            x: 190, y: 1530, scale: 0.7, facing: 'right', pose: { name: 'speak', base: 'sit', k }, expression: { look: -0.04 * k, speak: EP5.mouth(env, t) },
            light: { dir: Math.atan2(F.y - 1250, F.x - 190), intensity: fl, front: 0.2 }, t: T, key: 'h5-sauti',
          });
          CH.elder.draw(g, {
            x: 880, y: 1540, scale: 0.74, facing: 'left', pose: 'sit', expression: { look: -0.08 * dog },
            light: { dir: Math.atan2(F.y - 1250, F.x - 880), intensity: fl, front: 0.2 }, t: T, key: 'h5-elder',
          });
        },
      });
      const tk = clamp((t - (env.speech[1] + 0.05)) / 1.1);
      if (tk > 0) KIT.series.episodeTitle(ctx, T, tk, env.strings, { y: 340, key: 'ep5-title' });
    },
    post: () => ({ bloom: 0.36, vignette: 0.5, paper: 0.32 }),
  });
})();
