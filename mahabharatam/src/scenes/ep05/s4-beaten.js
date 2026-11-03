/*
 * Ep 5 · line "beaten" · "The king's brothers beat him, though he had done nothing wrong."
 *
 * Closer and lower, the same daylight. The three brothers rise with their staffs; on
 * each tick (line.ticks: three, from "beat" to "though") one brother brings his staff
 * down. The blows are never shown landing: each lands as a jolt of the frame and a
 * flash on the pup's rim as he cringes lower. On "nothing" (beats[1]) the offerings
 * beside him glow: untouched.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP5 = window.EP5;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  const G = 1480;

  R.scene({
    id: 'beaten',
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const ticks = (env.line.ticks || []).map((x) => x - env.line.start);
      const tk = (i) => ticks[i] ?? (1 + i * 0.5);
      const b1 = env.beats[1] ?? dur * 0.7;
      let jolt = 0;
      for (const x of ticks) { const d = t - x; if (d >= 0 && d < 0.35) jolt = Math.max(jolt, Math.exp(-d / 0.08)); }
      const rise = E.outCubic(clamp(t / 0.6));
      const glow = E.outCubic(clamp((t - (b1 - 0.2)) / 0.6));
      EP5.enclosure(ctx, T, {
        cam: { zoom: 1.32, dx: -40 + Math.sin(T * 41) * 10 * jolt, dy: -150 + jolt * 10 }, fireH: 160, wind: 0.9,
        after: (g) => {
          EP5.offerings(g, 300, 1520, 0.75, glow);
          // the pup cringes lower with every blow
          const cw = clamp(0.35 + ticks.filter((x) => t >= x).length * 0.25);
          CH.pup.draw(g, { x: 470 + jolt * 8, y: 1540, scale: 0.6, facing: 'right', pose: { name: 'cower', k: cw }, light: { ...EP5.sunLight(470, 1300), intensity: 1 + jolt * 0.4 }, t: T, key: 'b5-pup' });
          [0, 1, 2].forEach((i) => {
            const x = 640 + i * 130, k0 = tk(i);
            const up = E.inOutCubic(clamp((t - 0.25 - i * 0.12) / Math.max(0.3, k0 - 0.4 - i * 0.12)));
            const down = E.inQuad(clamp((t - (k0 - 0.14)) / 0.14));
            const pose = down > 0 ? { name: 'strike', k: down } : { name: 'raise', k: up * rise };
            CH.prince.draw(g, { x, y: G + i * 6, scale: 0.5, index: i, facing: 'left', pose, expression: { mood: 'wrath' }, light: EP5.sunLight(x, 1100), t: T, key: 'b5-p' + i });
          });
          if (jolt > 0.02) KIT.glow(g, 470, 1470, 160, '#fff0e0', 0.5 * jolt);
        },
      });
    },
    post: () => ({ bloom: 0.3, vignette: 0.48, paper: 0.34 }),
  });
})();
