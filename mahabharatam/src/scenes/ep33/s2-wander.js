/* Ep 33 · line "wander" · "Jaratkaru wandered the earth, and slept wherever night found him." · NEW LIGHT, the wilderness at ochre dusk: the gaunt ascetic walking large in a low angle; a lamp, a hut and a cradle he refuses drift past as faint gold signs; plaque; the recap band at the top. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP33 = window.EP33;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'wander',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      EP33.wild(ctx, T, { cam: { zoom: 1.1, dx: lerp(-60, 60, p) }, after: (g) => {
        CH.jaratkaru.draw(g, { x: lerp(780, 520, p), y: 1900, scale: 1.0, facing: 'left', pose: { name: 'walk', phase: T * 2.4 }, light: EP33.duskLight(650, 1900, 1.15), t: T, key: 'w33-jk' });
      } });
      const B = env.beats;
      ['lamp', 'hut', 'cradle'].forEach((w, i) => {
        const a = clamp((t - B[1] - i * 0.5) / 0.3) * (1 - clamp((t - B[1] - i * 0.5 - 0.9) / 0.4));
        if (a <= 0) return;
        ctx.save(); ctx.globalAlpha = 0.7 * a; ctx.strokeStyle = '#ffd890'; ctx.lineWidth = 6; const x = 200 + i * 340, y = 860;
        ctx.beginPath();
        if (i === 0) { ctx.ellipse(x, y + 30, 60, 22, 0, 0, Math.PI); ctx.moveTo(x, y + 10); ctx.quadraticCurveTo(x - 14, y - 20, x, y - 50); ctx.quadraticCurveTo(x + 14, y - 20, x, y + 10); }
        else if (i === 1) { ctx.moveTo(x - 80, y + 50); ctx.lineTo(x - 80, y - 10); ctx.lineTo(x, y - 70); ctx.lineTo(x + 80, y - 10); ctx.lineTo(x + 80, y + 50); ctx.closePath(); }
        else { ctx.ellipse(x, y + 10, 80, 40, 0, 0, Math.PI); ctx.moveTo(x - 80, y + 10); ctx.lineTo(x + 80, y + 10); ctx.moveTo(x - 90, y - 60); ctx.quadraticCurveTo(x, y - 90, x + 90, y - 60); }
        ctx.stroke();
        ctx.strokeStyle = '#ff7050'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(x - 90, y - 90); ctx.lineTo(x + 90, y + 70); ctx.stroke(); ctx.restore();
      });
      EPA.plaque(ctx, env.strings.jaratName, env.strings.jaratEpithet, KIT.CX, 560, clamp((t - 2.4) / 0.3) * (1 - clamp((t - B[1] + 0.3) / 0.3)), { size: 52, key: 'w33-pl' });
      KIT.series.recapBand(ctx, T, clamp(t / 0.3) * (1 - clamp((t - 2.3) / 0.3)), env.strings, { y: 300 });
    },
    post: () => ({ bloom: 0.38, vignette: 0.46, paper: 0.32 }),
  });
})();
