/* Ep 0 · line "know" · "Most of us know it through retellings, and through television." · Three sepia memory niches fan in on the dark ground: Ganesha the scribe (a beloved later tale), the churning, Garuda; their label line (Retold · Remembered · Televised). The epic as it is remembered. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP0 = window.EP0, EP4 = window.EP4, EP11 = window.EP11, EP12 = window.EP12, EP17 = window.EP17, EP20 = window.EP20;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  const PICS = [
    (g, T) => { EP4.hermitage(g, T, {}); CH.ganesha.draw(g, { x: 560, y: 1500, scale: 0.8, facing: 'left', pose: { name: 'write', k: 1, phase: T * 3 }, light: EP4.sunLight(560, 1500, 1), t: T, key: 'k0-ga' }); },
    (g, T) => EP11.sea(g, T, { hz: 1000, cam: { zoom: 1 }, after: (q) => EP12.churn(q, T, { cx: 540, y: 1550, s: 0.55, spin: T * 0.6, wrap: 1, hosts: 0 }) }),
    (g, T) => EP17.ocean(g, T, { hz: 900, after: (q) => EP20.carrier(q, 560, 1700, 0.55, T, { key: 'k0-car' }) }),
  ];
  const BOX = [{ x: 30, y: 640, w: 330, h: 560, rise: 90 }, { x: 375, y: 560, w: 330, h: 640, rise: 100 }, { x: 720, y: 640, w: 330, h: 560, rise: 90 }];
  R.scene({
    id: 'know',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      EP0.ground(ctx, T, 0.8);
      for (let i = 0; i < 3; i++) {
        const k = E.outCubic(clamp((t - 0.1 - i * 0.45) / 0.6));
        if (k <= 0) continue;
        const b = { ...BOX[i], y: BOX[i].y + (1 - k) * 120 };
        KIT.series.memory(ctx, PICS[i], b, T, { alpha: k, tone: 'memory', focus: [540, 1200], zoom: 0.42, push: clamp(t / dur), key: 'k0-' + i });
        ctx.save(); ctx.globalAlpha = k; ctx.strokeStyle = '#c89a50'; ctx.lineWidth = 5; ctx.beginPath(); KIT.series.archPath(ctx, b.x, b.y, b.w, b.h, b.rise); ctx.stroke(); ctx.restore();
      }
      const words = String(env.strings.retellLabels || '').split(' · ');
      for (let i = 0; i < 3; i++) {
        const a = clamp((t - 0.6 - i * 0.45) / 0.5);
        ctx.save(); ctx.globalAlpha = a; ctx.font = R.font(40, 'caption', 500, 'italic'); ctx.textAlign = 'center';
        ctx.fillStyle = R.PAL.cream; ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = R.px(8);
        ctx.fillText(words[i] || '', BOX[i].x + BOX[i].w / 2, BOX[i].y - 30); ctx.restore();
      }
      void lerp;
    },
    post: () => ({ bloom: 0.32, vignette: 0.5, paper: 0.36 }),
  });
})();
