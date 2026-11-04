/*
 * Ep 15 · line "sun" · the Sun: "He is no god. He is Rahu!"
 * Above the row, the Sun in his disc (frontal, LARGE) and the Moon beside him; from each a beam of
 * light points down at Rahu (beats[0] Sun's beam, beats[1] the Moon's), who looks up, caught.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP15 = window.EP15;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'sun',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T;
      const b0 = env.beats[0] ?? 1, b1 = env.beats[1] ?? 2.4;
      const s = E.outCubic(clamp((t - b0 + 0.6) / 0.6)), m = E.outCubic(clamp((t - b1 + 0.6) / 0.6));
      EP15.dusk(ctx, T, {
        hz: 1600,
        after: (g) => {
          const beam = (x0, y0, a, col) => { if (a <= 0.01) return; g.save(); g.globalAlpha = a * 0.55; g.globalCompositeOperation = 'lighter'; const gr = g.createLinearGradient(x0, y0, 560, 1700); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(x0 - 40, y0); g.lineTo(560 - 90, 1760); g.lineTo(560 + 90, 1760); g.lineTo(x0 + 40, y0); g.closePath(); g.fill(); g.restore(); };
          beam(330, 700, s, '#ffd060'); beam(820, 640, m, '#dfe8ff');
          CH.surya.draw(g, { x: 330, y: 1050, scale: 0.42, facing: 'front', pose: 'stand', light: { dir: -Math.PI / 2, intensity: 1.1, front: 0.6 }, t: T, key: 's15-su' });
          CH.chandra.draw(g, { x: 820, y: 1000, scale: 0.4, facing: 'front', pose: 'stand', light: { dir: -Math.PI / 2, intensity: 1.1, front: 0.6 }, t: T, key: 's15-ch' });
          CH.rahu.draw(g, { x: 560, y: 2000, scale: 0.85, facing: 'right', pose: { name: 'disguise', base: 'sit', k: 1 }, expression: { look: -0.35 * lerp(0, 1, s) }, light: { dir: -Math.PI / 2, intensity: 1.15, front: 0.55 }, t: T, key: 's15-ra' });
        },
      });
    },
    post: () => ({ bloom: 0.5, vignette: 0.42, paper: 0.3 }),
  });
})();
