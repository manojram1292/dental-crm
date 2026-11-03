/*
 * Ep 6 · line "stolen" · "On the way back, Takshaka stole them… and vanished underground."
 *
 * NEW PLACE, NEW LIGHT: the forest road at dusk, a stream on the right (EP6.road).
 * Uttanka kneels to wash at the stream; the earrings lie on a cloth by the road. A beggar
 * comes walking out of the dusk, wavering with a cold green shimmer (on "Takshaka",
 * beats[0]); on "stole" (beats[1]) he snatches them and runs; the disguise falls away
 * and the serpent king rears up; on "vanished" (beats[2]) the earth cleaves and he pours
 * down into it, the green light going with him. Uttanka gives chase.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP6 = window.EP6;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  const G = 1560;

  R.scene({
    id: 'stolen',
    fadeIn: 0.6,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const bT = env.beats[0] ?? 1.4, bS = env.beats[1] ?? 2.0, bV = env.beats[2] ?? 3.6;
      const walk = clamp((t - 0.2) / (bS - 0.45));
      const grab = E.inOutSine(clamp((t - (bS - 0.35)) / 0.35)) * (1 - clamp((t - bS - 0.1) / 0.2));
      const flee = E.inOutSine(clamp((t - bS - 0.1) / (bV - bS - 0.6)));
      const reveal = E.inOutSine(clamp((t - (bV - 0.75)) / 0.55));
      const dive = E.inQuad(clamp((t - (bV - 0.15)) / 1.0));
      const cleft = E.outBack(clamp((t - (bV - 0.35)) / 0.5));
      const ux = t < bS + 0.3 ? 840 : lerp(840, 380, E.inOutSine(clamp((t - bS - 0.3) / (dur - bS - 0.3))));
      const crouch = 1 - E.inOutCubic(clamp((t - bS - 0.05) / 0.4));
      const tx = t < bS ? lerp(-140, 420, E.outSine(walk)) : lerp(420, EP6.CLEFT.x + 40, flee);
      const shimmer = clamp((t - 0.2) / 0.6);
      const cl = (env.T % 1);
      EP6.road(ctx, T, {
        cleft: cleft * (1 - 0.3 * clamp((t - bV - 1.2) / 0.6)), cam: { zoom: 1.05, dy: -40 },
        after: (g) => {
          const lt = EP6.light(0, 0, 1200, 1100, 0.9, 0.12);
          // the earrings on their cloth, until he takes them
          if (t < bS) {
            g.fillStyle = '#e8dcc0'; g.beginPath(); g.ellipse(440, 1540, 70, 16, 0, 0, R.TAU); g.fill();
            KIT.kundala.pair(g, 440, 1520, 30, T, { glow: 1 });
          }
          // the thief: beggar, then serpent king
          if (reveal < 1) {
            const pose = t < bS - 0.35 ? { name: 'guise-walk', phase: T * 6 } : t < bS + 0.1 ? { name: 'guise-grab', k: grab } : { name: 'guise-run', phase: T * 11 };
            const o = { x: tx, y: G, scale: 0.55, facing: t < bS + 0.1 ? 'right' : 'left', pose, light: { ...lt, intensity: 0.6 + 0.4 * shimmer }, t: T, key: 's6-guise' };
            EP6.ghost(g, (1 - reveal) * (0.75 + 0.25 * Math.sin(T * 9)) , (v) => CH.takshaka.draw(v, o), 's6-g1');
            if (t >= bS) { const h = CH.takshaka.anchor(o, 'hand'); KIT.kundala.pair(g, h[0], h[1] - 10, 22, T, { glow: 0.8, a: 1 - reveal }); }
          }
          if (reveal > 0) {
            const no = { x: tx - 40, y: G + 4 + 900 * 0.6 * dive, scale: 0.6, facing: 'left', pose: dive > 0 ? { name: 'dive', k: dive } : { name: 'strike', k: 0.5 * reveal }, expression: { mood: 'wrath' }, light: { ...lt, intensity: 1 }, t: T, key: 's6-naga' };
            EP6.ghost(g, reveal, (v) => {
              v.save(); v.beginPath(); v.rect(-400, -400, 2000, G + 400 - 6 * dive); v.clip();
              CH.takshaka.draw(v, no);
              v.restore();
            }, 's6-g2');
            if (dive < 0.6) { const h = CH.takshaka.anchor({ ...no, pose: { name: 'strike', k: 0.5 } }, 'hand'); KIT.kundala.pair(g, h[0], h[1], 24, T, { glow: 1, a: reveal * (1 - dive / 0.6), cold: 1 }); }
          }
          // Uttanka: kneeling at the stream, then up and running
          const run = t > bS + 0.35;
          CH.uttanka.draw(g, { x: ux, y: G + 10, scale: 0.6, facing: 'left', pose: run ? { name: 'run', phase: T * 10 } : { name: 'crouch', k: crouch }, expression: { look: t > bT ? -0.05 : 0.15 }, light: EP6.light(ux, 1200, 1200, 1100, 0.95, 0.1), t: T, key: 's6-u' });
        },
      });
      void cl;
    },
    post: () => ({ bloom: 0.4, vignette: 0.5, paper: 0.32 }),
  });
})();
