/*
 * Ep 10 · line "shame" · "Ashamed before her sister, Vinata broke one of her eggs."
 *
 * The hermitage in a cold grey before-dawn (EP9.hermitage, low glow). Kadru passes in the
 * background with her serpent sons around her feet (beats[0], "Ashamed"); Vinata, large,
 * kneels at her jar, lifts the rose-red egg out (cradle) and on "broke" (beats[2]) it cracks
 * open in her hands, red light pouring out.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP8 = window.EP8, EP9 = window.EP9;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'shame',
    fadeIn: 0.6,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b2 = env.beats[2] ?? 3.4;
      const walk = clamp(t / (dur * 0.9));
      const lift = E.inOutSine(clamp((t - 0.6) / 1.6));
      const crack = clamp((t - (b2 - 0.3)) / 0.5);
      const VN = { x: 720, y: 1640, scale: 0.95, facing: 'left', t: T };
      EP9.hermitage(ctx, T, {
        glow: 0.2, cam: { zoom: 1.12 + 0.05 * p, dy: -20 },
        after: (g) => {
          const kx = lerp(-150, 330, walk);
          CH.kadru.draw(g, { x: kx, y: 1400, scale: 0.55, facing: 'right', pose: { name: 'walk', phase: T * 4, stride: 0.6 }, light: EP9.light(kx, 1400, 0.8), t: T, key: 's10-kd' });
          for (let i = 0; i < 6; i++) EP8.serpent(g, kx - 80 + i * 40, 1395 + (i % 2) * 8, 60, -Math.PI / 2 - 0.3 + i * 0.12, T, i, { kind: i, w: 7, hood: i % 2 === 0 });
          EP9.jar(g, 900, 1660, 0.8, T, { kind: 'gold', glow: 0.5 });
          CH.vinata.draw(g, { ...VN, pose: { name: 'cradle', k: lift }, expression: { look: 0.05 }, light: { ...EP9.light(720, 1640, 0.8), ...(crack > 0 ? { dir: -Math.PI / 2 - 0.6, intensity: 1 + 0.4 * crack } : {}) }, t: T, key: 's10-vn' });
          const ex = lerp(640, 600, lift), ey = lerp(1480, 1040, lift);
          EP9.egg(g, ex, ey, 46, 'rose', T, { glow: 0.4 + 0.8 * crack, crack: crack });
          if (crack > 0.5) KIT.glow(g, ex, ey, 400, '#ff5a3a', 0.6 * (crack - 0.5) * 2);
        },
      });
    },
    post: () => ({ bloom: 0.42, vignette: 0.48, paper: 0.34 }),
  });
})();
