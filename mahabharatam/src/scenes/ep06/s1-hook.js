/*
 * Ep 6 · line "hook" · HOOK (Sauti) · "Meanwhile, a student named Uttanka set out on a quest."
 *
 * The Naimisha fire at night: Sauti speaking on the left, the elder on the right. The
 * smoke above the fire becomes a road and a young student walks it, staff in hand
 * (Uttanka, in his dawn-coral light). On "Uttanka" (beats[0]) his name in gold; the
 * episode title follows the question.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP6 = window.EP6;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'hook',
    fadeIn: 0.5,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur, 0, 1.3);
      const fl = KIT.flicker(T, 0);
      const b0 = env.beats[0] ?? dur * 0.5;
      const v = E.outCubic(clamp((t - 0.6) / 1.2));
      const k = E.inOutCubic(clamp((t - 0.2) / 0.9));
      const F = KIT.ashram.FIRE;
      KIT.ashram.draw(ctx, T, {
        cycle: 0.75, speed: 0, hide: [5, 6], turn: (i) => (i < 2 ? -0.5 : i > 2 ? 0.4 : -0.3),
        smoke: { alpha: 0.38, lean: 10 }, fireH: 230 + 20 * v,
        cam: { zoom: 1.0 + 0.06 * E.inOutSine(p), dy: -10 * E.inOutSine(p) },
        vision: (g) => {
          if (v <= 0.01) return;
          // a road of smoke, and the student walking it
          KIT.glow(g, 540, 820, 380, '#e07a5a', 0.25 * v, 'lighter', 0.6);
          g.save(); g.globalAlpha = 0.35 * v; g.fillStyle = '#d8c8c0';
          g.beginPath(); g.moveTo(330, 940); g.quadraticCurveTo(540, 900, 760, 920); g.lineTo(760, 936); g.quadraticCurveTo(540, 918, 330, 956); g.fill(); g.restore();
          EP6.ghost(g, 0.85 * v, (q) => CH.uttanka.draw(q, { x: lerp(680, 470, clamp(t / dur)), y: 940, scale: 0.32, facing: 'left', pose: { name: 'walk', phase: T * 5, stride: 0.8 }, light: { dir: Math.PI / 2, intensity: 1, front: 0.3 }, t: T, key: 'h6-vu' }), 'h6-g', 'screen');
        },
        after: (g) => {
          CH.sauti.draw(g, { x: 190, y: 1530, scale: 0.7, facing: 'right', pose: { name: 'speak', base: 'sit', k }, expression: { look: -0.04 * k, speak: EP6.mouth(env, t) }, light: { dir: Math.atan2(F.y - 1250, F.x - 190), intensity: fl, front: 0.2 }, t: T, key: 'h6-sauti' });
          CH.elder.draw(g, { x: 880, y: 1540, scale: 0.74, facing: 'left', pose: 'sit', expression: { look: -0.06 * v }, light: { dir: Math.atan2(F.y - 1250, F.x - 880), intensity: fl, front: 0.2 }, t: T, key: 'h6-elder' });
        },
      });
      const na = clamp((t - (b0 - 0.1)) / 0.5) * (1 - clamp((t - env.speech[1] + 0.1) / 0.4));
      EP6.label(ctx, (env.strings.uttankaName || 'Uttanka').toUpperCase(), KIT.CX, 470, na, { size: 60, key: 'h6-name' });
      const tk = clamp((t - (env.speech[1] + 0.05)) / 1.1);
      if (tk > 0) KIT.series.episodeTitle(ctx, T, tk, env.strings, { y: 340, key: 'ep6-title' });
    },
    post: () => ({ bloom: 0.36, vignette: 0.5, paper: 0.32 }),
  });
})();
