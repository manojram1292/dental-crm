/*
 * Ep 11 · line "frame" · FRAME (Sauti at the Naimisha fire) · "He rose from the ocean, when it was churned."
 *
 * The anchor: the Naimisha clearing at night, Sauti seated left, speaking; the elder and
 * the sages leaning in. Above the fire a SOLID vision opens (EP11.roundel: a painted
 * medallion in a gold ring, not a faint ghost) on "ocean" (beats[0]): a mountain wound
 * with a serpent turning in a white sea; on "churned" (beats[1]) it spins faster.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP11 = window.EP11;
  const { clamp, E } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'frame',
    fadeIn: 0.35,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b0 = env.beats[0] ?? 1.5, b1 = env.beats[1] ?? 3;
      const v = E.outBack ? E.outBack(clamp((t - b0 + 0.5) / 0.7)) : E.outCubic(clamp((t - b0 + 0.5) / 0.7));
      const spin = T * 0.6 + 3 * E.inOutSine(clamp((t - b1 + 0.3) / 1.2));
      const fl = KIT.flicker(T, 0), F = KIT.ashram.FIRE;
      const k = E.inOutCubic(clamp((t - 0.1) / 0.8));
      KIT.ashram.draw(ctx, T, {
        cycle: 0.75, speed: 0, hide: [5, 6], turn: (i) => (i < 2 ? -0.5 : i > 2 ? 0.4 : -0.3),
        smoke: { alpha: 0.3, lean: 6 }, fireH: 250,
        cam: { zoom: 1.18 + 0.05 * E.inOutSine(p), dx: 20, dy: -40 },
        after: (g) => {
          CH.sauti.draw(g, { x: 190, y: 1580, scale: 0.9, facing: 'right', pose: { name: 'speak', base: 'sit', k }, expression: { look: -0.12, speak: EP11.mouth(env, t) }, light: { dir: Math.atan2(F.y - 1250, F.x - 190), intensity: fl * 1.1, front: 0.45 }, t: T, key: 'f11-sauti' });
          CH.elder.draw(g, { x: 900, y: 1590, scale: 0.86, facing: 'left', pose: 'sit', expression: { look: -0.18 * clamp(v) }, light: { dir: Math.atan2(F.y - 1250, F.x - 900), intensity: fl * 1.1, front: 0.4 }, t: T, key: 'f11-elder' });
        },
      });
      EP11.roundel(ctx, 540, 640, 250, clamp(v), (g, TT) => {
        EP11.sea(g, TT, { milk: 0.75, jewels: 0, hz: 760, after: (q) => {
          CH.mandara.draw(q, { x: 540, y: 1180, scale: 0.36, facing: 'front', pose: { name: 'churn', k: 1, spin }, light: { dir: -Math.PI / 2, intensity: 1, front: 0.4 }, t: TT, key: 'f11-mand' });
          const pts = []; for (let i = 0; i <= 30; i++) { const a = i / 30 * Math.PI * 5 + spin; pts.push([Math.cos(a) * 150, -120 - i * 9 + Math.sin(a) * 18]); }
          CH.vasuki.draw(q, { x: 540, y: 1180, scale: 1, pose: { name: 'rope', path: pts, w: 26 }, light: { dir: -Math.PI / 2, intensity: 1, front: 0.4 }, t: TT, key: 'f11-vas' });
          EP11.surf(q, 1110, TT, 1, { color: '#ffffff', deep: '#e8e8f8', deep2: '#a0a0c8' });
        } });
      }, T, { focus: [540, 940], zoom: 0.62, key: 'f11-roundel' });
    },
    post: () => ({ bloom: 0.4, vignette: 0.5, paper: 0.32 }),
  });
})();
