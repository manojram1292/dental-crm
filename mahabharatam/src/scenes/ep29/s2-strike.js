/* Ep 29 · line "strike" · "Indra struck him with the thunderbolt." · Indra's storm: the vajra leaves Indra's hand and strikes Garuda in a burst of white (beats[1]). Unvoiced recap band first 2.4 s. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP13 = window.EP13, EP29 = window.EP29;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'strike',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T;
      const b1 = env.beats[1] ?? 1.6;
      const go = E.inCubic(clamp((t - 0.3) / Math.max(0.3, b1 - 0.3))), fl = Math.exp(-Math.max(0, t - b1) * 5) * (t > b1 ? 1 : 0);
      EP13.storm(ctx, T, { flash: fl, rain: 0.3, after: (g) => {
        CH.indra.draw(g, { x: 280, y: 1100, scale: 0.6, facing: 'right', pose: { name: 'raise', k: 1 - go }, expression: { mood: 'wrath' }, light: { dir: -Math.PI / 2, intensity: 1.1, front: 0.5 }, t: T, key: 's29-in' });
        window.EP5.cloud(g, 280, 1110, 460, 3, '#4a5470', '#c8d4f0', 1);
        CH.garuda.draw(g, { x: 800, y: 1800, scale: 0.6, facing: 'left', pose: { name: 'fly', phase: T * 4 }, light: { dir: -Math.PI / 2 - 0.6, intensity: 1.15, front: 0.6 }, t: T, key: 's29-ga' });
        if (go > 0 && go < 1) { const x = lerp(320, 760, go), y = lerp(560, 1200, go); KIT.glow(g, x, y, 220, '#e8f0ff', 0.9); g.strokeStyle = '#fff'; g.lineWidth = 10; g.beginPath(); g.moveTo(x - 40, y - 60); g.lineTo(x + 10, y); g.lineTo(x - 10, y + 10); g.lineTo(x + 40, y + 60); g.stroke(); }
      } });
      if (fl > 0.02) KIT.glow(ctx, 760, 1250, 600, '#ffffff', 0.9 * fl);
      KIT.series.recapBand(ctx, T, clamp(t / 0.3) * (1 - clamp((t - 2.3) / 0.3)), env.strings, { y: 1600 });
    },
    post: () => ({ bloom: 0.44, vignette: 0.46, paper: 0.3 }),
  });
})();
