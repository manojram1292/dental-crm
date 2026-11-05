/* Ep 27 · line "serpents" · "Two great serpents, their eyes like fire, their very gaze poison." · Beneath the wheel in the blue vault, the two guardian serpents rear, ember eyes unblinking; Garuda small between them. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP27 = window.EP27;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  EP27.guards = (g, T, t, o = {}) => {
    const rise = E.outCubic(clamp(t / 0.8)), blind = clamp(o.blind || 0), down = clamp(o.down || 0);
    for (const [x, f, i] of [[250, 'right', 0], [830, 'left', 1]]) CH.guardsnake.draw(g, { x, y: lerp(1720, 1900, down), scale: lerp(0.68, 0.45, down), facing: f, index: i, pose: { name: 'rise', k: lerp(0.4, 1, rise) * (1 - down), blind }, alpha: 1 - 0.6 * down, light: EP27.steel(x, 1700, 1.1), t: T + i, key: 'gs27-' + i });
  };
  R.scene({
    id: 'serpents',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      EP27.vault(ctx, T, { pot: 0.6, cam: { zoom: 1.0 + 0.05 * p, dy: 100 }, after: (g) => {
        EP27.guards(g, T, t);
        KIT.glow(g, 540, 1660, 110, '#ffd060', 0.5);
        CH.garuda.draw(g, { x: 540, y: 1720, scale: 0.16, facing: 'left', pose: { name: 'stand', blaze: 0.5 }, light: EP27.steel(540, 1720, 1.3), t: T, key: 'se27-ga' });
      } });
    },
    post: () => ({ bloom: 0.44, vignette: 0.48, paper: 0.3 }),
  });
})();
