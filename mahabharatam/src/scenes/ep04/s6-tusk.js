/*
 * Ep 4 · line "tusk" · "When his pen broke, Ganesha broke his own tusk… and kept writing."
 *
 * Closer on Ganesha, writing fast. On the first "broke" (beats[0]) the iron stylus snaps:
 * a spark, the two halves fall. His hand rises to his right tusk; on the second "broke"
 * (beats[1]) he breaks it off (a white-gold flash), and brings it down to the leaf; on
 * "kept" (beats[2]) he writes on with it: Ekadanta, the one-tusked, from now on.
 * The tradition tag stays up to the end of this line.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP4 = window.EP4;
  const { clamp, lerp, E } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'tusk',
    fadeIn: 0.4,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur, 0, 1.3);
      const [b0, b1, b2] = env.beats.length >= 3 ? env.beats : [dur * 0.2, dur * 0.45, dur * 0.8];
      let pose;
      if (t < b0) pose = { name: 'write', k: 1, phase: T * 8 };
      else if (t < b1 + 0.05) pose = { name: 'break-tusk', k: lerp(0, 0.5, E.inOutSine(clamp((t - b0 - 0.15) / Math.max(0.3, b1 - b0 - 0.15)))) };
      else if (t < b2) pose = { name: 'break-tusk', k: lerp(0.5, 1, E.inOutSine(clamp((t - b1 - 0.05) / Math.max(0.3, b2 - b1 - 0.1)))) };
      else pose = { name: 'write', k: 1, phase: T * 8, tusk: 'broken' };
      const X = 640, Y = 1470, S = 1.0;
      EP4.hermitage(ctx, T, { cam: { zoom: 1.25 + 0.05 * p, dx: -160, dy: 40 } });
      // the pile of written leaves beside him
      EP4.stack(ctx, 930, 1500, 9, { w: 220 });
      CH.ganesha.draw(ctx, { x: X, y: Y, scale: S, facing: 'left', pose, expression: {}, light: EP4.sunLight(X, Y - 500, 1.0), t: T, key: 't4-ganesha' });
      // the stylus snapping: a spark and two falling halves
      const ds = t - b0;
      if (ds > -0.02 && ds < 1.4) {
        const hx = X - 262 * S, hy = Y + (-508 + 265) * S;   // the writing hand (rig: x ≈ −262, seated)
        const sp = Math.exp(-Math.max(0, ds) / 0.12);
        KIT.glow(ctx, hx, hy, 120, '#fff2c8', 0.8 * sp);
        ctx.save(); ctx.strokeStyle = '#2a2420'; ctx.lineWidth = 4; ctx.lineCap = 'round';
        for (const s of [-1, 1]) {
          const fx = hx + s * (20 + 60 * ds), fy = hy + 380 * ds * ds + 10, a = s * (1 + 6 * ds);
          ctx.globalAlpha = clamp(1.4 - ds);
          ctx.beginPath(); ctx.moveTo(fx - Math.cos(a) * 26, fy - Math.sin(a) * 26); ctx.lineTo(fx + Math.cos(a) * 26, fy + Math.sin(a) * 26); ctx.stroke();
        }
        ctx.restore();
      }
      // the tusk breaking: a white-gold flash and a ring of light
      const dt = t - b1;
      if (dt > -0.05 && dt < 1.2) {
        const f = Math.exp(-Math.max(0, dt) / 0.18) * clamp((dt + 0.05) / 0.05);
        const hx = X - 86 * S, hy = Y + (-790 + 265 + 30) * S;
        KIT.glow(ctx, hx, hy, 260, '#ffe2a0', 0.9 * f);
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = '#ffd890'; ctx.lineWidth = 4; ctx.globalAlpha = clamp(1 - dt);
        ctx.beginPath(); ctx.arc(hx, hy, 40 + 260 * E.outCubic(clamp(dt / 0.9)), 0, R.TAU); ctx.stroke(); ctx.restore();
      }
      EP4.grass(ctx, T, 1760, 0.9);
      KIT.series.traditionTag(ctx, T, 1 - clamp((t - (dur - 0.45)) / 0.4), env.strings);
    },
    post: () => ({ bloom: 0.34, vignette: 0.46, paper: 0.3 }),
  });
})();
