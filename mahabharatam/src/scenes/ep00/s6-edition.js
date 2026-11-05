/* Ep 0 · line "edition" · TITLE MOMENT 2 · "We follow the Critical Edition. And where a beloved tale comes from later tradition, we say so." · A palm-leaf manuscript unrolls under the edition's name (gold, with BORI · Pune); on "beloved tale" (beats[1]) cut to Shiva with the blue throat, "As tradition tells it" on screen and the small source line (as episode 14 marks it). */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP0 = window.EP0, EP13 = window.EP13, EP14 = window.EP14;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'edition',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, S = env.strings;
      const b1 = env.beats[1] ?? 3.6;
      const cut = b1 - 0.5;
      if (t < cut) {
        EP0.ground(ctx, T, 1);
        const op = E.inOutCubic(clamp((t - 0.1) / 1.0));
        for (let i = 0; i < 5; i++) KIT.manuscript.leaf(ctx, 540, 860 + i * 100, 860, 78, op, { seed: 31 + i, light: 0.6, tilt: (i - 2) * 0.01, ink: 1 });
        const k = clamp((t - 0.2) / 0.7);
        KIT.goldText(ctx, S.ceTitle.toUpperCase(), KIT.CX, 470, { size: 74, spacing: 6, weight: 600, alpha: k, reveal: k, sheen: lerp(-0.3, 1.3, clamp((t - 0.8) / 1.2)), glow: 0.35, key: 'e0-ce' });
        ctx.save(); ctx.globalAlpha = clamp((t - 0.6) / 0.5); ctx.font = R.font(38, 'caption', 500, 'italic'); ctx.textAlign = 'center';
        ctx.fillStyle = R.PAL.cream; ctx.shadowColor = 'rgba(0,0,0,0.85)'; ctx.shadowBlur = R.px(10);
        ctx.fillText(S.ceSub, KIT.CX, 545); ctx.restore();
        return;
      }
      const u = t - cut, p = clamp(u / (dur - cut));
      EP13.whiteSea(ctx, T, {
        hz: 1500, dark: 0.45, cam: { zoom: 1.05 + 0.05 * p },
        after: (g) => {
          KIT.glow(g, 820, 520, 260, '#f4f8ff', 0.8); g.fillStyle = '#f8faff'; g.beginPath(); g.arc(820, 520, 70, 0, R.TAU); g.fill(); g.fillStyle = '#28264f'; g.beginPath(); g.arc(846, 506, 64, 0, R.TAU); g.fill();
          CH.shiva.draw(g, { x: 480, y: 1960, scale: 1.0, facing: 'front', pose: { name: 'bless', k: 1, throat: 1 }, light: { dir: -Math.PI / 2, intensity: 1.1, front: 0.55 }, t: T, key: 'e0-sh' });
          window.EP11.surf(g, 1850, T, 1, { color: '#ffffff', deep: '#ecebf8', deep2: '#b8b8d8' });
        },
      });
      EP14.tag(ctx, T, clamp(u / 0.35), S);
      EP14.source(ctx, clamp((u - 0.4) / 0.4), S.sourceNote);
    },
    post: () => ({ bloom: 0.4, vignette: 0.44, paper: 0.32 }),
  });
})();
