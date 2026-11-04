/*
 * Ep 13 · line "shri" · "Then Shri, goddess of fortune, in white."
 * A quick cut, a new framing: low, looking up. Shri rises on her pink lotus, ivory and rose-
 * gold, lotuses in her raised hands (beats[0], a bell); petals drift. Name card.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP13 = window.EP13;
  const { clamp, E, lerp, hash, TAU } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'shri',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const b0 = env.beats[0] ?? 0.4;
      const rise = E.outCubic(clamp((t - b0 + 0.6) / 1.4));
      EP13.whiteSea(ctx, T, {
        hz: 1500, cam: { zoom: 1.0 + 0.04 * clamp(t / dur) },
        after: (g) => {
          KIT.glow(g, 540, 1100, 900, '#ffd0d8', 0.5 * rise);
          CH.lakshmi.draw(g, { x: 540, y: lerp(2250, 1780, rise), scale: 1.12, facing: 'front', pose: { name: 'rise', k: rise }, light: EP13.seaGlow(540, 1700, 1.1), t: T, key: 's13-la' });
          window.EP11.surf(g, 1760, T, 1, { color: '#ffffff', deep: '#ecebf8', deep2: '#b8b8d8' });
          for (let i = 0; i < 24; i++) { const life = (T * 0.25 + hash(i, 31)) % 1; g.save(); g.globalAlpha = 0.8 * rise * (1 - life); g.fillStyle = i % 2 ? '#ffb0c4' : '#fff0f4'; g.translate(100 + hash(i, 32) * 880, 300 + life * 1300); g.rotate(T + i); g.beginPath(); g.ellipse(0, 0, 14, 7, 0, 0, TAU); g.fill(); g.restore(); }
        },
      });
      const la = clamp((t - b0) / 0.4) * (1 - clamp((t - dur + 0.3) / 0.3));
      EP13.plaque(ctx, env.strings.shriName, env.strings.shriEpithet, KIT.CX, 300, la, { size: 60, key: 's13-name' });
    },
    post: () => ({ bloom: 0.46, vignette: 0.32, paper: 0.28 }),
  });
})();
