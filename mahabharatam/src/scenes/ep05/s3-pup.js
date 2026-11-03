/*
 * Ep 5 · line "pup" · "A small dog came near: the son of Sarama, the divine dog."
 *
 * The same enclosure, the camera drifted right. Sarama's son trots in from the right
 * edge, curious, tail up, and stops by the offerings to sniff the air (he touches
 * nothing). On "Sarama" (beats[1]) his mother's luminous profile glows faint and vast
 * in the sky above him, her name in gold.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP5 = window.EP5;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  const G = 1500;

  R.scene({
    id: 'pup',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b1 = env.beats[1] ?? dur * 0.5;
      const arrive = E.outSine(clamp(t / 2.4));
      const px = lerp(1180, 640, arrive);
      const walking = arrive < 0.98;
      const ghost = E.inOutSine(clamp((t - (b1 - 0.3)) / 1.0));
      EP5.enclosure(ctx, T, {
        cam: { zoom: 1.18, dx: -70 - 30 * p, dy: -80 },
        after: (g) => {
          EP5.ghost(g, 0.7 * ghost, (v) => CH.sarama.draw(v, { x: 760, y: 980, scale: 1.0, facing: 'left', pose: 'stand', light: { dir: -Math.PI / 2, intensity: 1, front: 0.1 }, t: T, key: 'p5-ghost' }), 'p5-g', 'screen');
          CH.janamejaya.draw(g, { x: 290, y: G, scale: 0.6, facing: 'right', pose: { name: 'offer', k: 0.6 + 0.4 * Math.sin(T * 1.4) }, light: EP5.sunLight(300, 1100), t: T, key: 'r5-king' });
          [0, 1, 2].forEach((i) => CH.prince.draw(g, { x: 690 + i * 135, y: G + 10 - i * 4, scale: 0.5, index: i, facing: 'left', pose: 'sit', expression: { look: i === 2 ? 0.1 * arrive : 0 }, light: EP5.sunLight(690 + i * 135, 1150), t: T, key: 'r5-p' + i }));
          EP5.offerings(g, 520, 1530, 0.8, 0);
          const sn = clamp((t - 2.5) / 0.6) * (1 - clamp((t - 3.8) / 0.5));
          CH.pup.draw(g, { x: px, y: 1560, scale: 0.62, facing: 'left', pose: walking ? { name: 'walk', phase: T * 9, stride: 0.9 } : { name: 'sniff', k: sn }, light: EP5.sunLight(px, 1300), t: T, key: 'p5-pup' });
        },
      });
      EP5.label(ctx, (env.strings.saramaName || 'Sarama').toUpperCase(), KIT.CX, 330, ghost * (1 - clamp((t - dur + 0.3) / 0.3)), { size: 64, key: 'p5-name', sheen: (t - b1) / 1.5 });
      if (ghost > 0) {
        ctx.save(); ctx.globalAlpha = ghost; ctx.font = R.font(38, 'caption', 600, 'italic'); ctx.textAlign = 'center';
        ctx.fillStyle = R.PAL.cream; ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = R.px(8);
        ctx.fillText(env.strings.saramaEpithet || '', KIT.CX, 420); ctx.restore();
      }
      void p;
    },
    post: () => ({ bloom: 0.3, vignette: 0.4, paper: 0.34 }),
  });
})();
