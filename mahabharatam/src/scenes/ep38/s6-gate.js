/* Ep 38 · line "gate" · "At the gate, the guards would not let him in." · Low angle from behind the boy: two tall guards cross their spears under the gate's lintel (beats[0]); the fire's glow beyond. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP8 = window.EP8, EP34 = window.EP34, EP37 = window.EP37, EP38 = window.EP38;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  EP38.gateShot = (g, T, t, cross, lift) => {
    EP38.gate(g, 540, 1600, 1.0, T);
    const a = 0.5 * cross * (1 - lift);
    for (const [x, f, i] of [[330, 'right', 0], [750, 'left', 1]]) CH.prince.draw(g, { x, y: 1620, scale: 0.85, facing: f, index: i + 1, pose: { name: 'stand' }, light: EP8.fireLight(x, 1500, 1.1, 0.6), t: T, key: 'gt38-g' + i });
    g.strokeStyle = '#1a0a04'; g.lineWidth = 12; g.lineCap = 'round';
    g.beginPath(); g.moveTo(380, 1500); g.lineTo(380 + Math.cos(-Math.PI / 2 + 0.9 * (1 - a * 2) + 0.2) * 520, 1500 + Math.sin(-Math.PI / 2 + 0.9 * (1 - a * 2) + 0.2) * 520); g.stroke();
    g.beginPath(); g.moveTo(700, 1500); g.lineTo(700 - Math.cos(-Math.PI / 2 + 0.9 * (1 - a * 2) + 0.2) * 520, 1500 + Math.sin(-Math.PI / 2 + 0.9 * (1 - a * 2) + 0.2) * 520); g.stroke();
  };
  R.scene({
    id: 'gate',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, cross = E.outCubic(clamp((t - env.beats[0] + 0.3) / 0.4));
      EP38.noonSatra(ctx, T, { cam: { zoom: 1.2, dy: -260 }, after: (g) => {
        EP38.gateShot(g, T, t, cross, 0);
        CH.astika.draw(g, { x: 540, y: 2250, scale: 0.9, facing: 'right', pose: { name: 'stand' }, light: { dir: -Math.PI / 2, intensity: 0.8, front: 0.2, fill: 0.15 }, t: T, key: 'gt38-as' });
      } });
    },
    post: () => ({ bloom: 0.42, vignette: 0.48, paper: 0.3 }),
  });
})();
