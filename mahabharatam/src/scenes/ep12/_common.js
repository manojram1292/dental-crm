/*
 * Episode 12 · shared pieces (not a scene). Loads after ep11/_common. Episodes 13–14 reuse the
 * churning rig.
 *
 *   EP12.churn(ctx, T, o)    THE CHURNING RIG, in camera space (draw it inside a location's
 *                            after()): the tortoise Akupara in the sea, Mount Mandara on his
 *                            back, Vasuki wound round it in a helix (the turns behind the
 *                            mountain drawn before it, the turns in front after it), his tail
 *                            running out to the gods on the left and his head to the asuras on
 *                            the right, the two hosts hauling.
 *                            o = { cx, y (the waterline under the mountain), s (scale), spin
 *                                  (radians, the mountain's turn), pull (−1..1: which side hauls),
 *                                  fire (Vasuki's mouth), burn (the forests), hosts (0..1),
 *                                  tortoise (0..1), wrap (0..1: how much of the rope is wound),
 *                                  seaY (where the surf hides the tortoise) }
 *   EP12.earth(ctx, T, o)    the plain of the world in daylight with Mandara standing in it,
 *                            the ground cut away to show its roots going as deep as it is tall
 *                            (o.lift 0..1 tears it out). LIGHT: clear high daylight, EP12.dayLight.
 *   EP12.procession(ctx, T, o)   gods and asuras carrying the mountain on their raised arms
 *                            across a shore at evening (o.p 0..1 progress).
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP11 = window.EP11;
  const { TAU, clamp, lerp, hash } = R;
  const CH = KIT.characters;
  const EP12 = (window.EP12 = {});
  EP12.mouth = EP11.mouth; EP12.label = EP11.label; EP12.plaque = EP11.plaque;
  EP12.dayLight = (x, y, k = 1.05) => ({ dir: -Math.PI / 2 - 0.35, intensity: k, front: 0.45 });

  /** Half-width of Mandara at local height y (mirrors mandara.js). */
  const MH = 1500, MW = 680;
  const mHalf = (y) => { const u = clamp(-y / MH); return MW * Math.sqrt(Math.max(0, 1 - Math.pow(u, 1.25))) * (0.9 + 0.1 * Math.sin(u * 7.0)) * (1 - 0.25 * u); };

  EP12.churn = (ctx, T, o = {}) => {
    const cx = o.cx ?? 540, y0 = o.y ?? 1500, s = o.s ?? 0.55, spin = o.spin || 0, wrap = clamp(o.wrap ?? 1);
    const L = o.light || { dir: -Math.PI / 2 - 0.2, intensity: 1.05, front: 0.4 };
    // the tortoise, half under the water
    if ((o.tortoise ?? 1) > 0.01) CH.akupara.draw(ctx, { x: cx + 60 * s, y: y0 + 230 * s, scale: s * 1.05, facing: 'left', pose: { name: 'bear', k: 1, phase: T * 0.8 }, light: L, t: T, alpha: clamp(o.tortoise ?? 1), key: 'churn-tort' });
    // the helix: points around the mountain from low to high
    const n = 3.2, lo = 0.12, hi = 0.62, pts = [];
    const steps = 120;
    for (let i = 0; i <= steps * wrap; i++) {
      const u = i / steps, th = u * n * TAU + spin, yl = -lerp(lo, hi, u) * MH;
      const hw = mHalf(yl) * 1.04 + 30;
      pts.push({ p: [cx + Math.cos(th) * hw * s, y0 - 140 * s + yl * s + Math.sin(th) * 46 * s], z: Math.sin(th) });
    }
    const runs = [];
    for (const q of pts) { const last = runs[runs.length - 1]; const front = q.z > 0; if (!last || last.front !== front) runs.push({ front, pts: last ? [last.pts[last.pts.length - 1]] : [] }); runs[runs.length - 1].pts.push(q.p); }
    const W = 70 * s;
    const rope = (path, key, extra = {}) => { if (path.length > 1) CH.vasuki.draw(ctx, { x: 0, y: 0, scale: 1, facing: 'left', pose: { name: 'rope', path, w: W, ...extra }, light: L, t: T, key }); };
    runs.forEach((rn, i) => { if (!rn.front) rope(rn.pts, 'churn-b' + i); });
    CH.mandara.draw(ctx, { x: cx, y: y0 - 140 * s, scale: s, facing: 'front', pose: { name: 'churn', k: 1, spin, burn: o.burn || 0 }, light: L, t: T, key: 'churn-m' });
    runs.forEach((rn, i) => { if (rn.front) rope(rn.pts, 'churn-f' + i); });
    if (wrap >= 0.999 && pts.length) {
      // the free ends: the tail out to the left (the gods), the head out to the right (the asuras)
      const a = pts[0].p, b = pts[pts.length - 1].p, pl = o.pull || 0;
      const tail = [], head = [];
      for (let i = 0; i <= 16; i++) { const u = i / 16; tail.push([lerp(a[0], -120, u), lerp(a[1], y0 - 60 * s, u) + Math.sin(u * Math.PI) * (30 - 20 * pl) * s]); }
      for (let i = 0; i <= 18; i++) { const u = i / 18; head.push([lerp(1210, b[0], u), lerp(y0 - 300 * s, b[1], u) - Math.sin(u * Math.PI) * (40 + 20 * pl) * s]); }
      rope(tail, 'churn-tail', { tail: true, w0: W, w1: 10 * s });
      rope(head, 'churn-head', { head: false, w0: W, w1: W });
    }
    // the hosts hauling on either side
    const hk = clamp(o.hosts ?? 1);
    if (hk > 0.01) {
      const pl = o.pull || 0;
      for (let i = 0; i < 3; i++) {
        const xg = lerp(-60, 260, i / 2) - 30 * pl, yg = y0 + (80 + i * 30) * s;
        CH.deva.draw(ctx, { x: xg, y: yg + 380 * s, scale: s * 1.25, facing: 'left', index: i * 2, pose: { name: 'pull', k: 1, phase: T * 2 + i + Math.PI * (pl > 0 ? 0 : 1) }, light: L, t: T + i, alpha: hk, key: 'churn-d' + i });
        const xa = lerp(1140, 820, i / 2) + 30 * pl;
        CH.asura.draw(ctx, { x: xa, y: yg + 380 * s, scale: s * 1.3, facing: 'right', index: i * 2 + 1, pose: { name: 'pull', k: 1, phase: T * 2 + i + Math.PI * (pl > 0 ? 1 : 0) }, light: L, t: T + i, alpha: hk, key: 'churn-a' + i });
      }
    }
    if (o.fire) {
      // fire and smoke from Vasuki's mouths: the head is off to the right, so the plume rolls in from there
      ctx.save(); ctx.globalAlpha = clamp(o.fire);
      for (let i = 0; i < 10; i++) {
        const life = (T * 0.5 + i / 10) % 1, x = lerp(1180, 700, life) + Math.sin(T + i) * 30, y = y0 - (300 + 600 * life) * s - 120 * Math.sin(i);
        KIT.glow(ctx, x, y, (90 + 200 * life) * s * 2, i % 2 ? '#ff7a2a' : '#5a4a5a', (1 - life) * 0.45, i % 2 ? 'lighter' : 'source-over');
      }
      ctx.restore();
    }
  };

  EP12.earth = (ctx, T, o = {}) => {
    ctx.save();
    const cam = o.cam || {};
    KIT.camera(ctx, { x: 540, y: 1000, zoom: cam.zoom || 1, dx: cam.dx || 0, dy: cam.dy || 0 });
    const gy = o.gy ?? 1180, lift = clamp(o.lift || 0);
    // clear high daylight: a deep blue zenith to a pale horizon
    KIT.vgrad(ctx, -600, gy, [[0, '#2a5aa8'], [0.6, '#7ab0e0'], [1, '#e8f0f0']], -400, R.W + 400);
    for (let i = 0; i < 5; i++) window.EP5.cloud(ctx, ((i * 260 + T * 8) % 1500) - 200, 150 + i * 110, 300, i * 7, '#f4f8ff', '#b8c8e0', 0.85);
    // the ground in section: soil strata, the roots of the mountain going deep
    KIT.vgrad(ctx, gy, R.H + 600, [[0, '#6a8a3a'], [0.04, '#5a4a2a'], [0.4, '#3a2a18'], [1, '#140c06']], -400, R.W + 400);
    ctx.strokeStyle = 'rgba(255,220,160,0.12)'; ctx.lineWidth = 3;
    for (let i = 1; i < 9; i++) { const y = gy + i * 90; ctx.beginPath(); ctx.moveTo(-400, y); for (let x = -400; x <= 1500; x += 60) ctx.lineTo(x, y + Math.sin(x * 0.01 + i) * 10); ctx.stroke(); }
    // the root mass (a dark mirror of the mountain, as deep as it is tall), tearing as it lifts
    const my = gy - lift * 700;
    ctx.save(); ctx.globalAlpha = 1 - 0.6 * lift;
    ctx.fillStyle = '#1a120a'; ctx.strokeStyle = '#a07a40'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(540 - 300, gy); ctx.quadraticCurveTo(540 - 220, gy + 500, 540, gy + 760); ctx.quadraticCurveTo(540 + 220, gy + 500, 540 + 300, gy); ctx.closePath(); ctx.fill(); ctx.stroke();
    for (let i = 0; i < 14; i++) { const x = 540 + (hash(i, 3) - 0.5) * 520, l = 150 + 300 * hash(i, 4); ctx.beginPath(); ctx.moveTo(x, gy + 40); ctx.quadraticCurveTo(x + (hash(i, 5) - 0.5) * 200, gy + l * 0.6, x + (hash(i, 6) - 0.5) * 260, gy + l); ctx.stroke(); }
    ctx.restore();
    // grass line with a torn edge where the mountain leaves
    ctx.fillStyle = '#7a9a40'; ctx.fillRect(-400, gy - 6, 1880, 14);
    if (o.before) o.before(ctx, my);
    CH.mandara.draw(ctx, { x: 540, y: my, scale: o.ms ?? 0.42, facing: 'front', pose: lift > 0.01 ? { name: 'uprooted', k: clamp(lift * 2) } : 'stand', light: EP12.dayLight(540, my), t: T, key: 'earth-m' });
    // falling rocks and soil as it tears free
    if (lift > 0.02 && lift < 0.98) for (let i = 0; i < 26; i++) { const life = (T * 0.9 + hash(i, 8)) % 1; const x = 540 + (hash(i, 9) - 0.5) * 520, y = my + 60 + life * 600; ctx.fillStyle = i % 3 ? '#3a2a18' : '#6a5030'; ctx.globalAlpha = 1 - life; ctx.beginPath(); ctx.arc(x, y, 6 + 10 * hash(i, 10), 0, TAU); ctx.fill(); }
    ctx.globalAlpha = 1;
    if (o.after) o.after(ctx, my);
    ctx.restore();
  };

  EP12.procession = (ctx, T, o = {}) => {
    const p = clamp(o.p || 0);
    EP11.sea(ctx, T, {
      cam: o.cam, hz: 1080, jewels: 0.3,
      after: (g) => {
        // evening: a warm band on the horizon over the night-blue sea
        KIT.glow(g, 900, 1080, 900, '#ff9a5a', 0.35);
        KIT.vgrad(g, 1500, 2400, [[0, '#4a3a3a'], [0.2, '#2a2028'], [1, '#0a080c']], -400, 1480);
        const mx = lerp(-80, 560, p), my = 1180;
        const L = { dir: -0.15, intensity: 1.15, front: 0.55 };
        CH.mandara.draw(g, { x: mx, y: my - 40, scale: 0.4, facing: 'front', pose: { name: 'uprooted', k: 1 }, light: L, t: T, key: 'pr-m' });
        for (let i = 0; i < 7; i++) {
          const x = mx - 260 + i * 90, kind = i % 2 ? 'asura' : 'deva';
          CH[kind].draw(g, { x, y: 1760 + (i % 3) * 18, scale: 0.72, facing: 'right', index: i, pose: { name: 'carry', k: 1, phase: T * 5 + i, stride: 0.6 }, light: L, t: T + i, key: 'pr-h' + i });
        }
      },
    });
  };

  void TAU;
})();
