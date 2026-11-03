/*
 * KIT.ashram · the clearing in the Naimisha forest: the sacred fire in its
 * altar at the centre, sages seated in a circle, smoke rising, the treeline,
 * and a sky that can run through days and nights (time passing).
 * The frame story of the whole epic happens here, so every episode can reuse it.
 *
 *   KIT.ashram.draw(ctx, T, o)
 *   o = {
 *     cycle: c          days elapsed as a float (frac 0 = sunrise, .25 noon, .5 sunset, .75 midnight)
 *     speed: v          days per second at this moment (long-exposure trails + averaged sky)
 *     fireLean, fireH   flame lean (-1..1) and height (px)
 *     turn(i, s)        head turn of sage i (−1 = toward −x … 1), s = its pose
 *     smoke: { lean, alpha, h }
 *     cam: { zoom, dx, dy }
 *     before(ctx), after(ctx)   hooks drawn in camera space behind / in front of the sages
 *     teller: opts      Sauti (KIT.characters.sauti.draw opts, light is set here: the fire) or null
 *     hide: [i, …]      sage indices left out (their place taken by a character drawn in a hook)
 *     middle(ctx)       hook drawn after the fire, before the front (back-facing) row
 *   }
 *   Sages are KIT.characters.sage (index i = his fixed variation), lit by the fire.
 *   KIT.ashram.FIRE → { x, y } screen position of the flame base (for effects).
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT;
  const { TAU, clamp, lerp, E, PAL, hash, fract } = R;

  const HY = 900;                 // treeline / horizon
  const FX = 540, FY = 1132;      // altar front-top centre
  const CX0 = 540, CY0 = 1140, RX = 372, RY = 108;
  const POLE = [720, 210];        // Dhruva, the pole star
  const SAGES = [200, 236, 270, 304, 340, 26, 142].map((deg, i) => ({ a: (deg * Math.PI) / 180, i }));
  let TREES = null, STARS = null;

  function init() {
    if (TREES) return;
    const r = R.rng(4040);
    TREES = [];
    // framing trees: tall on both edges, shorter toward the middle of the treeline
    const xs = [-60, 40, 150, 250, 330, 760, 840, 930, 1030, 1120];
    xs.forEach((x, i) => {
      const edge = Math.min(Math.abs(x - 540) / 540, 1);
      TREES.push({ tree: KIT.forest.makeTree(900 + i, { kind: i === 3 || i === 7 ? 'palm' : 'tall' }), x: x + r.range(-20, 20), h: lerp(380, 1250, Math.pow(edge, 1.6)) * r.range(0.85, 1.1), y: HY + 40 + edge * 60 });
    });
    STARS = [];
    for (let k = 0; k < 170; k++) {
      const x = r() * 1080, y = r() * (HY - 40);
      STARS.push({ d: Math.hypot(x - POLE[0], y - POLE[1]), a: Math.atan2(y - POLE[1], x - POLE[0]), m: Math.pow(r(), 2.2), tw: r() * TAU });
    }
  }

  const DAY = ['#6a6a98', '#c8a174', '#f3d39c'];
  const NIGHT = ['#06071a', '#151a44', '#2c2654'];
  const MEAN = ['#2a2b55', '#6c5670', '#9a7a86'];
  function skyColors(c, speed) {
    const ph = fract(c);
    // dayness: 1 at noon, 0 at midnight, steep around sunrise/sunset
    const d = clamp(0.5 + 0.5 * Math.sin((ph) * TAU) * 1.6);
    const amp = 1 / (1 + speed / 1.1);
    const dusk = Math.exp(-Math.pow(Math.sin(ph * TAU), 2) * 6);   // near sunrise/sunset
    return [0, 1, 2].map((k) => {
      const [a, b, cc] = R.mixRgb(NIGHT[k], DAY[k], d);
      const du = R.hexToRgb(k === 2 ? '#f08a4a' : k === 1 ? '#b0585a' : '#3a2a5a');
      const inst = [lerp(a, du[0], dusk * 0.6), lerp(b, du[1], dusk * 0.6), lerp(cc, du[2], dusk * 0.6)];
      const m = R.hexToRgb(MEAN[k]);
      return `rgb(${lerp(m[0], inst[0], amp) | 0},${lerp(m[1], inst[1], amp) | 0},${lerp(m[2], inst[2], amp) | 0})`;
    }).concat([d, amp]);
  }

  function arcPos(u) {
    // u 0..1 across the sky from the left horizon to the right
    const a = Math.PI * (1 - u);
    return [540 + Math.cos(a) * 560, HY - Math.sin(a) * 640];
  }

  function sky(ctx, T, c, speed) {
    const [top, mid, hor, d, amp] = skyColors(c, speed);
    KIT.vgrad(ctx, 0, HY + 60, [[0, top], [0.55, mid], [1, hor]]);
    const night = 1 - (amp * d + (1 - amp) * 0.5);
    // star trails around Dhruva
    const trail = Math.min(TAU * 0.9, speed * 0.05 * TAU);
    const rot = c * TAU;
    ctx.save();
    ctx.lineCap = 'round';
    for (const s of STARS) {
      const a = (night * (0.25 + 0.75 * s.m)) * (0.75 + 0.25 * Math.sin(T * 3 + s.tw));
      if (a < 0.03) continue;
      const ang = s.a + rot * 0.15;
      ctx.strokeStyle = `rgba(255,240,210,${(a * (trail > 0.05 ? 0.55 : 1)).toFixed(3)})`;
      ctx.lineWidth = 1 + s.m * 2.2;
      ctx.beginPath();
      if (trail > 0.05) ctx.arc(POLE[0], POLE[1], s.d, ang - trail * 0.15, ang);
      else { ctx.arc(POLE[0] + Math.cos(ang) * s.d, POLE[1] + Math.sin(ang) * s.d, 0.6 + s.m * 1.6, 0, TAU); }
      if (trail > 0.05) ctx.stroke(); else { ctx.fillStyle = ctx.strokeStyle; ctx.fill(); }
    }
    // Dhruva itself, steady
    KIT.glow(ctx, POLE[0], POLE[1], 26, '#fff2d0', night * 0.9);
    ctx.fillStyle = `rgba(255,248,230,${night})`;
    ctx.beginPath(); ctx.arc(POLE[0], POLE[1], 3, 0, TAU); ctx.fill();
    ctx.restore();
    // sun and moon: discs, or long-exposure arcs when time runs fast
    const win = Math.min(0.5, speed * 0.045);
    for (const body of ['sun', 'moon']) {
      const off = body === 'sun' ? 0 : 0.5;
      const ph = fract(c - off);           // 0..0.5 while it is up
      const segs = 24;
      ctx.save();
      ctx.lineCap = 'round';
      const col = body === 'sun' ? [255, 214, 120] : [240, 232, 210];
      if (win > 0.01) {
        for (let k = 0; k < segs; k++) {
          const u0 = ph - win * (k / segs), u1 = ph - win * ((k + 1) / segs);
          if (u0 < 0 || u0 > 0.5 || u1 < 0 || u1 > 0.5) continue;
          const p0 = arcPos(u0 / 0.5), p1 = arcPos(u1 / 0.5);
          ctx.strokeStyle = `rgba(${col},${(0.8 * (1 - k / segs)).toFixed(3)})`;
          ctx.lineWidth = body === 'sun' ? 14 : 9;
          ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.stroke();
        }
      }
      if (ph >= 0 && ph <= 0.5) {
        const p = arcPos(ph / 0.5), alpha = clamp(1.2 - win * 4);
        if (body === 'sun') {
          KIT.glow(ctx, p[0], p[1], 260, '#ffc070', 0.6 * alpha);
          ctx.fillStyle = `rgba(255,226,150,${alpha})`;
          ctx.beginPath(); ctx.arc(p[0], p[1], 44, 0, TAU); ctx.fill();
        } else {
          KIT.glow(ctx, p[0], p[1], 140, '#e8e0ff', 0.35 * alpha);
          const mb = R.buffer('moon', 80, 80);
          mb.clear();
          mb.ctx.fillStyle = '#f4ecd6';
          mb.ctx.beginPath(); mb.ctx.arc(40, 40, 34, 0, TAU); mb.ctx.fill();
          mb.ctx.globalCompositeOperation = 'destination-out';
          mb.ctx.beginPath(); mb.ctx.arc(54, 32, 30, 0, TAU); mb.ctx.fill();
          ctx.globalAlpha = alpha;
          ctx.drawImage(mb.canvas, p[0] - 40, p[1] - 40, 80, 80);
        }
      }
      ctx.restore();
    }
    return { d, amp, night };
  }

  function sagePose(sg, T, o) {
    const x = CX0 + Math.cos(sg.a) * RX, y = CY0 + Math.sin(sg.a) * RY;
    const front = Math.sin(sg.a) > 0;
    const s = 0.33 + 0.16 * (Math.sin(sg.a) + 1) / 2 + (front ? 0.08 : 0);
    const pose = { x, y: y + (front ? 150 : 0), s: s * (0.94 + 0.12 * hash(sg.i, 5)), T, back: front };
    pose.turn = o.turn ? o.turn(sg.i, pose) : 0;
    return pose;
  }

  function draw(ctx, T, o = {}) {
    init();
    const c = o.cycle ?? 0.75, speed = o.speed || 0;
    const fl = KIT.flicker(T, 0);
    ctx.save();
    const cam = o.cam || {};
    KIT.camera(ctx, { x: 540, y: 1100, zoom: (cam.zoom || 1) * 1.1, dx: cam.dx || 0, dy: cam.dy || 0 });
    const sk = sky(ctx, T, c, speed);
    if (o.before) o.before(ctx, sk);
    // ground
    KIT.vgrad(ctx, HY, R.H + 200, [[0, R.mix('#2a1c22', '#6a4a3a', sk.d * sk.amp + (1 - sk.amp) * 0.4)], [0.18, '#2b1a14'], [1, '#0e0806']]);
    // treeline
    ctx.save();
    ctx.fillStyle = '#0d0a12';
    ctx.beginPath();
    for (let i = 0; i < 26; i++) KIT.scallopPath(ctx, -40 + i * 46, HY + 18 - hash(i, 3) * 26, 46, 30 + hash(i, 4) * 26, 8, i, 0.25);
    ctx.fill();
    ctx.fillRect(0, HY + 20, R.W, 30);
    ctx.restore();
    for (const tr of TREES) {
      KIT.forest.drawTree(ctx, tr.tree, tr.x, tr.y, tr.h, '#0b0910', R.mix('#3a2a40', '#f0b070', 0.25 + 0.4 * fl), [tr.x < 540 ? 3 : -3, 2]);
    }
    // the fire's light on the clearing
    KIT.fire.pool(ctx, FX, FY + 20, 700, 230, T, 1);
    // smoke behind everything near
    const lean = o.fireLean || 0;
    const sm = o.smoke || {};
    const fh = o.fireH || 230;
    KIT.smoke.draw(ctx, FX + lean * 40, FY - fh * 0.75, T, { h: sm.h || 880, w: 46, strands: 4, alpha: sm.alpha ?? 0.38, color: '#a89ab4', lean: sm.lean || 0, speed: 0.9, seed: 3, curls: 0.8, spread: 0.7 });
    if (o.vision) o.vision(ctx);
    // sages behind the fire (they face us: their fronts lit warm by the flames)
    const hide = o.hide || [];
    const poses = SAGES.filter((sg) => !hide.includes(sg.i)).map((sg) => ({ sg, pose: sagePose(sg, T, o) }));
    poses.sort((a, b) => a.pose.y - b.pose.y);
    const drawSage = ({ sg, pose }) => {
      const dxs = Math.sign(pose.x - FX) || 1;
      const near = 1 - clamp(Math.abs(pose.x - FX) / 420);
      KIT.characters.sage.draw(ctx, {
        x: pose.x, y: pose.y, scale: pose.s, index: sg.i, facing: pose.back ? 'back' : 'front',
        pose: { name: 'sit' }, expression: { look: pose.turn }, t: T, key: 'sage' + sg.i,
        light: { dir: Math.atan2(-3, -dxs * 4.5), intensity: fl, front: pose.back ? 0 : 0.35 + 0.3 * (0.6 + 0.4 * near) },
      });
    };
    poses.filter((q) => !q.pose.back).forEach(drawSage);
    // altar + fire
    const base = KIT.fire.altar(ctx, FX, FY, 230, T, { light: 1 });
    KIT.fire.draw(ctx, FX, base + 2, fh, T, { lean, intensity: o.fireIntensity ?? 1, seed: 0 });
    if (o.middle) o.middle(ctx);
    const drawTeller = () => {
      const p = o.teller, toFire = Math.sign(FX - p.x) || 1;
      KIT.characters.sauti.draw(ctx, { light: { dir: Math.atan2(-2, toFire * 6), intensity: fl, front: 0 }, t: T, key: 'teller-ashram', ...p });
    };
    if (o.teller && !o.tellerFront) drawTeller();
    poses.filter((q) => q.pose.back).forEach(drawSage);
    if (o.teller && o.tellerFront) drawTeller();
    if (o.after) o.after(ctx);
    ctx.restore();
  }

  KIT.ashram = { draw, FIRE: { x: FX, y: FY }, HY, POLE, arcPos };
})();
