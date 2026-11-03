/*
 * Line "name" · "His name was Ugrashravas, son of Lomaharshana."
 *
 * Close on the storyteller: a shadow-puppet profile (topknot, beard, staff,
 * gold kasavu borders), rim-lit gold from the left by the fire he is walking
 * toward. Out-of-focus fireflies drift behind; the forest is a few soft dark
 * trunks. The camera pushes in slowly. On the name (env.beats[0] = the word
 * index set in the script) the name is written in gold above him, with a
 * sheen and a breath of embers; the epithet follows in italic.
 * Name and epithet come from the script's `display` keys (strings).
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT;
  const { TAU, clamp, lerp, E, PAL, hash, noise } = R;

  R.scene({
    id: 'name',
    fadeIn: 0,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur, 0, 1.3);
      const fl = KIT.flicker(T, 0);
      // background: warm dark, the fire off-frame left
      KIT.vgrad(ctx, 0, R.H, [[0, '#120b16'], [0.5, '#22121a'], [1, '#170c0b']]);
      KIT.glow(ctx, -120, 1080, 1500, PAL.saffron, 0.42 * fl);
      KIT.glow(ctx, -60, 1150, 700, '#ffb653', 0.35 * fl);
      // soft forest behind: blurred dark trunks
      ctx.save();
      for (let i = 0; i < 6; i++) {
        const x = 120 + i * 190 + Math.sin(i * 2.3) * 60 - p * 30 * (1 + (i % 3));
        const w = 60 + hash(i, 4) * 80;
        const g = ctx.createLinearGradient(x - w, 0, x + w, 0);
        g.addColorStop(0, 'rgba(10,6,10,0)'); g.addColorStop(0.5, 'rgba(10,6,10,0.55)'); g.addColorStop(1, 'rgba(10,6,10,0)');
        ctx.fillStyle = g; ctx.fillRect(x - w, 0, w * 2, R.H);
      }
      ctx.restore();
      // bokeh: out-of-focus fireflies
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 16; i++) {
        const x = (hash(i, 7) * 1200 - 60 - p * 60 * (0.5 + hash(i, 8))) , y = 200 + hash(i, 9) * 1300 + Math.sin(T * 0.5 + i) * 20;
        const r = 18 + hash(i, 10) * 40;
        const a = (0.06 + 0.1 * hash(i, 11)) * (0.6 + 0.4 * Math.sin(T * (0.8 + hash(i, 12)) + i));
        ctx.globalAlpha = a;
        ctx.fillStyle = hash(i, 13) < 0.5 ? '#ffd780' : '#f3a35a';
        ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
      }
      ctx.restore();

      // the storyteller, rim-lit
      const zoom = 1 + 0.06 * E.inOutSine(clamp(p));
      ctx.save();
      KIT.camera(ctx, { x: 520, y: 1100, zoom, dx: -18 * p });
      KIT.characters.sauti.draw(ctx, {
        x: 640, y: 2860, scale: 2.02, pose: { name: 'walk', phase: 0.9 + t * 1.6, stride: 0.22, wind: 0.7 },
        expression: { look: -0.03 + 0.02 * Math.sin(t * 0.8) }, light: { dir: Math.atan2(-3, -9), intensity: fl, front: 0 }, t: T, key: 'teller',
      });
      ctx.restore();
      // light on the near edge: a warm wash from the left
      KIT.glow(ctx, 0, 1000, 900, '#ff9a40', 0.12 * fl, 'screen');

      // the name, in gold
      const S = env.strings, keys = env.line.display || ['storytellerName', 'storytellerEpithet'];
      const nb = env.beats[0] ?? env.dur * 0.3;
      const k = clamp((t - (nb - 0.12)) / 0.75);
      if (k > 0) {
        const name = (S[keys[0]] || '').toUpperCase();
        ctx.save();
        ctx.font = R.font(100, 'display', 600); ctx.letterSpacing = '7px';
        const w = ctx.measureText(name).width;
        ctx.restore();
        const size = Math.min(104, (100 * 800) / w);
        const y = 330;
        KIT.glow(ctx, KIT.CX, y - size * 0.35, 520, PAL.saffron, 0.22 * E.outCubic(k) * fl, 'lighter', 0.35);
        KIT.goldText(ctx, name, KIT.CX, y, { size, spacing: 7, weight: 600, reveal: E.inOutSine(k), sheen: lerp(-0.3, 1.3, clamp((t - nb - 0.35) / 1.1)), glow: 0.35, key: 'name' });
        const ka = E.outCubic(clamp((t - nb - 0.35) / 0.6));
        KIT.ornament(ctx, KIT.CX, y + 52, 380, ka * 0.9, ka);
        if (keys[1] && S[keys[1]]) {
          ctx.save();
          ctx.globalAlpha = ka;
          ctx.font = R.font(54, 'caption', 500, 'italic');
          ctx.textAlign = 'center';
          ctx.fillStyle = PAL.cream;
          ctx.shadowColor = 'rgba(0,0,0,0.85)'; ctx.shadowBlur = R.px(12);
          ctx.fillText(S[keys[1]], KIT.CX, y + 128 + (1 - ka) * 12);
          ctx.restore();
        }
        // a breath of embers from the lettering
        KIT.embers(ctx, T, { x: KIT.CX, y: y - 10, spread: 700, rate: 14 * clamp(1.4 - (t - nb)), life: 1.6, rise: 90, sway: 30, size: 2.2, alpha: 0.8 * clamp(k * 3), seed: 71 });
      }
    },
    post: () => ({ bloom: 0.38, vignette: 0.55, paper: 0.3 }),
  });
})();
