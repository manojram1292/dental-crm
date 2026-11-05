/* Ep 25 · line "leaf" · "The Valakhilyas, all together, carried one leaf-stalk, and sank in a puddle in a cow's hoofprint." · Macro, at ground level: grass blades tower like trees; the tiny sages strain under one palasha stalk at the edge of a hoofprint full of sky; on "sank" (beats[2]) they slip and flounder in it. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP25 = window.EP25;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  EP25.stalk = (g, T, t, sink, o = {}) => {
    const x0 = o.x ?? 330, y0 = o.y ?? 1480;
    g.save(); g.translate(x0, y0 + 30 * sink); g.rotate(-0.08 + 0.2 * sink);
    g.fillStyle = '#5a8a30'; g.fillRect(-20, -150, 520, 16);
    g.fillStyle = '#7ab048'; g.beginPath(); g.ellipse(560, -150, 110, 60, 0.3, 0, R.TAU); g.fill();
    g.restore();
    for (let i = 0; i < 8; i++) {
      const x = x0 + 20 + i * 60, y = y0 + (i > 3 ? 40 * sink : 10 * sink) + Math.sin(T * 6 + i) * 3 * (1 - sink);
      CH.valakhilya.draw(g, { x, y, scale: 0.14, facing: 'front', index: i, pose: { name: 'bless', k: 1 }, light: { dir: -Math.PI / 2 - 0.4, intensity: 1.05, front: 0.6 }, t: T, alpha: 1 - 0.3 * sink * (i > 3 ? 1 : 0), key: 'vk' + i });
    }
  };
  R.scene({
    id: 'leaf',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      const b2 = env.beats[2] ?? 3;
      const sink = E.inOutSine(clamp((t - b2 + 0.3) / 0.8));
      ctx.save(); KIT.camera(ctx, { x: 540, y: 1500, zoom: lerp(1.0, 1.15, p) });
      EP25.macro(ctx, T, { splash: sink, after: (g) => EP25.stalk(g, T, t, sink) });
      ctx.restore();
    },
    post: () => ({ bloom: 0.34, vignette: 0.4, paper: 0.32 }),
  });
})();
