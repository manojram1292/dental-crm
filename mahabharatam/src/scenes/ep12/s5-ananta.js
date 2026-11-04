/*
 * Ep 12 · line "ananta" · "At Brahma's word and Narayana's, the serpent Ananta tore it from the ground."
 *
 * Brahma and Narayana small and high in the sky's light (beats[0], their word); a 250 ms
 * rest; Ananta, the white serpent of seven hoods, rises beside the mountain (beats[2], name
 * card) and on "tore" (beats[3]: drum and boom) Mandara rips from the earth, roots
 * streaming, rock and soil falling, the camera shaking once.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP12 = window.EP12;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'ananta',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const b0 = env.beats[0] ?? 0.4, b2 = env.beats[2] ?? 3.6, b3 = env.beats[3] ?? 4.4;
      const gods = clamp((t - b0 + 0.2) / 0.5) * (1 - clamp((t - b2 + 0.6) / 0.5));
      const an = E.outCubic(clamp((t - b2 + 1.2) / 1.0)), lift = E.outCubic(clamp((t - b3 + 0.1) / 1.2));
      const shake = Math.exp(-Math.max(0, t - b3) * 5) * (t > b3 ? 1 : 0) * 14 * Math.sin(t * 70);
      EP12.earth(ctx, T, {
        lift, gy: 1300, ms: 0.48, cam: { zoom: 1.0, dy: 60 + shake, dx: shake * 0.6 },
        after: (g, my) => { if (an > 0.01) CH.ananta.draw(g, { x: 850, y: lerp(2000, my + 330, an), scale: 0.85, facing: 'left', pose: { name: 'rise', k: an }, light: EP12.dayLight(830, my), t: T, key: 'a12-an' }); },
      });
      if (gods > 0.01) {
        ctx.save(); ctx.globalAlpha = gods;
        KIT.glow(ctx, 540, 380, 520, '#fff4d0', 0.6);
        CH.brahma.draw(ctx, { x: 380, y: 560, scale: 0.3, facing: 'front', pose: { name: 'bless', k: 1 }, light: { dir: 0, intensity: 1, front: 0.55 }, t: T, alpha: gods, key: 'a12-br' });
        CH.vishnu.draw(ctx, { x: 700, y: 640, scale: 0.36, facing: 'front', pose: { name: 'bless', k: 1 }, light: { dir: -Math.PI / 2, intensity: 1, front: 0.5 }, t: T, alpha: gods, key: 'a12-vi' });
        ctx.restore();
      }
      const la = clamp((t - b2) / 0.4) * (1 - clamp((t - dur + 0.4) / 0.4));
      EP12.plaque(ctx, env.strings.anantaName, env.strings.anantaEpithet, KIT.CX, 820, la, { size: 60, key: 'a12-name' });
    },
    post: () => ({ bloom: 0.34, vignette: 0.34, paper: 0.34 }),
  });
})();
