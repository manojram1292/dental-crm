/*
 * Ep 5 · line "curse" · Sarama: "My son did no wrong. So an unseen danger will fall upon you."
 *
 * The turn. Sarama towers on the right, head high, near forepaw lifted (curse k rises
 * through "wrong"), her jaw moving with her words, her aura flaring; the king, small on
 * the left, steps back. The day darkens: on "unseen" (beats[1]) the sun is eclipsed,
 * the fire gutters and a shadow ripples across the ground toward him; on "you"
 * (beats[2]) a darkness passes over the king. Ominous low drums (tools/score.py).
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP5 = window.EP5;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'curse',
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b0 = env.beats[0] ?? 1, b1 = env.beats[1] ?? 2.5, b2 = env.beats[2] ?? 4.5;
      const k = E.inOutCubic(clamp((t - 0.1) / Math.max(0.5, b0 - 0.1)));
      const dark = lerp(0.35, 0.95, E.inOutSine(clamp((t - (b1 - 0.4)) / 1.4)));
      const sweep = E.inOutSine(clamp((t - (b1 - 0.1)) / (b2 - b1 + 0.3)));
      const fall = E.outCubic(clamp((t - (b2 - 0.2)) / 0.6));
      const back = E.inOutCubic(clamp((t - b1) / 1.2));
      EP5.enclosure(ctx, T, {
        dark, fireH: lerp(160, 70, dark), fire: lerp(1, 0.6, dark), wind: 1 + dark,
        cam: { zoom: 1.04 + 0.08 * E.inOutSine(p), dx: 30 * p, dy: -30 * p },
        after: (g) => {
          // the shadow rippling across the ground toward the king
          if (sweep > 0.001 && sweep < 1) {
            const sx = lerp(1000, 260, sweep);
            g.save(); g.globalCompositeOperation = 'multiply';
            const gr = g.createRadialGradient(sx, 1480, 10, sx, 1480, 380);
            gr.addColorStop(0, 'rgba(20,10,30,0.85)'); gr.addColorStop(1, 'rgba(20,10,30,0)');
            g.fillStyle = gr; g.fillRect(sx - 400, 1320, 800, 320); g.restore();
          }
          [0, 1, 2].forEach((i) => CH.prince.draw(g, { x: 470 + i * 60, y: 1430 - i * 20, scale: 0.38, index: i, facing: 'right', pose: 'stand', light: EP5.sunLight(470, 1100, dark), t: T, key: 'c5-p' + i }));
          CH.janamejaya.draw(g, { x: 300 - 40 * back, y: 1470, scale: 0.5, facing: 'right', pose: 'stand', expression: { look: -0.1 - 0.08 * back }, light: EP5.sunLight(300, 1100, dark), t: T, key: 'c5-king' });
          CH.sarama.draw(g, { x: 790, y: 1500, scale: 0.86, facing: 'left', pose: { name: 'curse', k }, expression: { mood: t > b1 - 0.3 ? 'wrath' : 'calm', speak: EP5.mouth(env, t) }, light: { dir: -Math.PI / 2 - 0.4, intensity: 1.05 + 0.2 * dark, front: 0.15 }, t: T, key: 'c5-sarama' });
          // the darkness that falls upon him
          if (fall > 0) {
            g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = 0.75 * fall;
            const gr = g.createRadialGradient(290, 1150, 30, 290, 1150, 520);
            gr.addColorStop(0, 'rgba(10,5,20,1)'); gr.addColorStop(1, 'rgba(10,5,20,0)');
            g.fillStyle = gr; g.fillRect(-200, 600, 1000, 1100); g.restore();
          }
        },
      });
    },
    post: () => ({ bloom: 0.36, vignette: 0.62, paper: 0.34 }),
  });
})();
