/* Ep 26 · line "fight" · "With wings, beak and talons, he tore through them." · Three quick cuts on the beats: a wing-blow scatters spears, the beak lunges, the talons strike; weapons fly from the gods' hands (no blood). */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP26 = window.EP26;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'fight',
    fadeIn: 0,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const bs = [0, (env.beats[1] ?? 1.2) - 0.1, (env.beats[2] ?? 2) - 0.1];
      let i = 0; for (let k = 1; k < 3; k++) if (t >= bs[k]) i = k;
      const u = clamp((t - bs[i]) / Math.max(0.4, (i < 2 ? bs[i + 1] : dur) - bs[i])), hit = E.outCubic(clamp(u * 2));
      const cams = [{ zoom: 1.6, dx: -200, dy: -380 }, { zoom: 2.4, dx: 300, dy: -700 }, { zoom: 1.9, dx: 0, dy: -880 }];
      EP26.court(ctx, T, { storm: 0.9, cam: cams[i], after: (g) => {
        g.save(); g.translate(560, 1300); g.rotate([0.25, -0.15, 0.1][i] * Math.sin(Math.PI * hit)); g.translate(-560, -1300);
        CH.garuda.draw(g, { x: 560 + [0, -40 * hit, 0][i], y: 1480, scale: 0.5, facing: 'left', pose: [{ name: 'spread', k: 1 }, { name: 'bow', k: 0.6 * hit }, { name: 'carry', k: hit }][i], expression: { mood: 'wrath' }, light: EP26.storm(560, 1480, 1.2), t: T, key: 'f26-ga' });
        g.restore();
        for (let k = 0; k < 2; k++) { const x = 330 - k * 120; CH.deva.draw(g, { x: x - 60 * hit, y: 1500, scale: 0.4, facing: 'right', index: (i * 2 + k) % 6, pose: { name: 'cower', k: hit }, light: EP26.storm(x, 1500), t: T, key: 'f26-d' + k }); }
        for (let k = 0; k < 4; k++) { g.save(); g.translate(lerp(360, 120 + k * 60, hit), lerp(1200, 700 + k * 80, hit)); g.rotate(T * 8 + k); g.fillStyle = '#d8d8e8'; g.fillRect(-60, -3, 120, 6); g.restore(); }
      } });
    },
    post: () => ({ bloom: 0.42, vignette: 0.46, paper: 0.3 }),
  });
})();
