/* Ep 25 · line "peace" · Kashyapa: "Brahma made this Indra. Let yours be Indra of the birds." · By the blue fire Kashyapa kneels to the tiny sages, palms joined; Indra behind him, head bowed. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP25 = window.EP25;
  const { clamp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'peace',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      ctx.save(); KIT.camera(ctx, { x: 540, y: 1500, zoom: 1.05 + 0.04 * p, dx: 0 });
      EP25.rite(ctx, T, { x: 260, h: 600, wing: 0.3, after: (g) => {
        for (let i = 0; i < 6; i++) CH.valakhilya.draw(g, { x: 180 + i * 50, y: 1640, scale: 0.1, facing: 'front', index: i, pose: 'sit', light: { dir: Math.PI, intensity: 1.05, front: 0.6 }, t: T, key: 'vk' + i });
        CH.indra.draw(g, { x: 900, y: 1640, scale: 0.6, facing: 'left', pose: { name: 'bow', k: 0.5 }, light: { dir: Math.PI + 0.3, intensity: 1.0, front: 0.45 }, t: T, key: 'p25-in' });
        CH.kashyapa.draw(g, { x: 640, y: 1640, scale: 0.6, facing: 'left', pose: { name: 'bless', k: 0.5 }, expression: { speak: EP25.mouth(env, t) }, light: { dir: Math.PI + 0.2, intensity: 1.15, front: 0.6 }, t: T, key: 'p25-ka' });
      } });
      ctx.restore();
    },
    post: () => ({ bloom: 0.42, vignette: 0.46, paper: 0.3 }),
  });
})();
