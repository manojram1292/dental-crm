/*
 * Ep 2 · line "lakes" · "With their blood, he filled five great lakes."
 *
 * Seen from above, the land laid out like a temple mandala: an outer square
 * with four T-shaped gates (bhupura), a ring of lotus petals, and the five
 * lakes in a quincunx. They fill one after another with a deep, glowing red
 * (from "filled", beats[0], to "lakes", beats[2]), ripples spreading. The
 * camera turns slowly and rises. Restrained: colour and light, nothing more.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP2 = window.EP2;
  const { TAU, clamp, lerp, E, PAL } = R;

  R.scene({
    id: 'lakes',
    fadeIn: 0.4,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur, 0, 1.3);
      const [b0, b1, b2] = env.beats.length >= 3 ? env.beats : [dur * 0.4, dur * 0.55, dur * 0.75];
      // the lakes fill in turn: centre first on "filled", the four quarters by "lakes"
      const order = [0, 1, 2, 3, 4];
      const fills = order.map((i) => {
        const s = i === 0 ? b0 - 0.25 : lerp(b0, b2, (i - 1) / 4) - 0.1;
        return E.inOutSine(clamp((t - s) / 0.9));
      });
      ctx.save();
      ctx.fillStyle = '#1e120a'; ctx.fillRect(0, 0, R.W, R.H);
      ctx.translate(540, 860);
      ctx.rotate(-0.12 + 0.1 * E.inOutSine(p));
      const sc = lerp(1.25, 1.0, E.inOutSine(p)) * 0.96;
      ctx.scale(sc, sc);
      ctx.translate(-500, -500);
      EP2.mandala(ctx, T, fills, { red: 1 });
      ctx.restore();
      // the whole field breathes red on "lakes"
      const k = clamp((t - b2) / 0.4) * (1 - 0.5 * clamp((t - b2 - 0.6) / 1.5));
      KIT.glow(ctx, 540, 860, 900, '#c0141c', 0.25 * k);
      void b1;
    },
    post: () => ({ bloom: 0.45, vignette: 0.62, paper: 0.36 }),
  });
})();
