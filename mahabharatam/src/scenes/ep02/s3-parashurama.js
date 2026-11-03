/*
 * Ep 2 · line "parashurama" · "Long before, the warrior-sage Parashurama, axe in hand…"
 *
 * Long before: a storm. Banks of mural cloud lit red from below, rain. On a
 * rock outcrop, Parashurama in silhouette, low angle, his blood-red rim
 * burning. Lightning on his name (beats[0]) shows him whole against a white
 * sky; he raises the axe through the line and it reaches the top on "axe"
 * (beats[1]) with a second strike and an ember in his eye (mood: wrath).
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP2 = window.EP2;
  const { clamp, lerp, E } = R;
  const CH = KIT.characters;

  function rock(ctx, fl) {
    // a stepped rock outcrop, mural-flat, its top edge lit red
    const pts = [[-40, 1920], [-40, 1700], [120, 1660], [260, 1690], [380, 1640], [520, 1612], [700, 1630], [820, 1700], [960, 1680], [1120, 1720], [1120, 1920]];
    ctx.save();
    ctx.beginPath(); R.polyPath(ctx, pts); ctx.fillStyle = '#0c0405'; ctx.fill();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = R.mix('#7a1010', '#e8e0ff', fl); ctx.globalAlpha = 0.5 + 0.4 * fl; ctx.lineWidth = 3;
    ctx.beginPath(); R.polyPath(ctx, pts.slice(1, -1), false); ctx.stroke();
    ctx.restore();
  }

  R.scene({
    id: 'parashurama',
    fadeIn: 0.45,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const b0 = env.beats[0] ?? dur * 0.5, b1 = env.beats[1] ?? dur * 0.75;
      const fl = EP2.flash(t, [0.15, b0, b1]);
      const p = clamp(t / dur, 0, 1.3);
      ctx.save();
      // camera: slow rise (low angle) and push
      KIT.camera(ctx, { x: 540, y: 1300, zoom: 1.02 + 0.06 * E.inOutSine(p), dy: -30 * p });
      EP2.storm(ctx, T, { flash: fl, red: 1, horizon: 1560 });
      EP2.bolt(ctx, 820, 120, 1100, 7, EP2.flash(t, [b0]) * 1.0);
      EP2.bolt(ctx, 230, 80, 900, 13, EP2.flash(t, [b1]) * 0.9);
      EP2.bolt(ctx, 640, 60, 700, 21, EP2.flash(t, [0.15]) * 0.5);
      // far ridge
      ctx.save(); ctx.fillStyle = R.mix('#14070a', '#3a3050', fl * 0.6);
      ctx.beginPath(); ctx.moveTo(0, 1600); for (let i = 0; i <= 12; i++) ctx.lineTo(i * 90, 1560 - 50 * Math.abs(Math.sin(i * 1.7)) - (i % 3) * 18); ctx.lineTo(1080, 1920); ctx.lineTo(0, 1920); ctx.fill(); ctx.restore();
      rock(ctx, fl);
      // Parashurama raises the axe
      const k = E.inOutCubic(clamp((t - 0.6) / Math.max(0.8, b1 - 0.6)));
      CH.parashurama.draw(ctx, {
        x: 590, y: 1622, scale: 0.84, facing: 'left', pose: { name: 'raise-axe', k },
        expression: { mood: t > b0 - 0.2 ? 'wrath' : 'calm' },
        light: { dir: -Math.PI / 2 - 0.5, intensity: 0.85 + 0.45 * fl, front: 0 }, t: T, key: 'storm-p',
      });
      // spray of rain lit by the flash in front of him
      ctx.restore();
      if (fl > 0.02) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = fl * 0.12; ctx.fillStyle = '#c8c0ff'; ctx.fillRect(0, 0, R.W, R.H); ctx.restore(); }
      void lerp;
    },
    post: () => ({ bloom: 0.42, vignette: 0.6, paper: 0.26 }),
  });
})();
