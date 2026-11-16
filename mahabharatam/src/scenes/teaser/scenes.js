/* THE WAR TEASER · "Mahabharatam: As Vyasa Told It" (script/teaser.en.json; pipeline number 96, never a numbered episode).
 * ONE SCENE PER LINE, built to the plan in script/TEASER-PLAN.md; every beat read in the Critical Edition first (script/TEASER-CHECK.md).
 *
 * THE HYBRID: the war's world is a stylised 3D layer (src/scenes/teaser/war3d.js, Three.js): the plain of Kurukshetra and its sky,
 * the massed hosts (drawn soldier cards on 3D cards), banners, chariots with white horses and turning wheels, volleys of arrows with
 * streaks, dust, embers, the conches' shockwaves, the divine light. The principal figures stay the series' own drawn Canvas2D
 * figures (src/kit/characters/epic-cast.js), laid over the 3D layer; where a figure stands on a 3D chariot its place and size come
 * from the 3D camera (W3D.project). The 3D layer is drawn as a pure function of time, so motion blur (the render's sub-frames),
 * the gate and the 30 fps checks work as for any other film. Integration: the 3D layer gets the scene's haze (lifted blacks, about
 * 7 %), the drawn dust over the seam, the series' grain and plaster finish over everything.
 *
 * Rules carried from the trailer: told once, in order; a camera move with a job on every shot; nothing ever still; Krishna in colour
 * with his face in shadow until the universal form; captions drawn here, one phrase at a time; a plaque's box and letters together.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, ST = KIT.stage, CAM = KIT.cam, ACT = KIT.act, CH = KIT.characters, EP41 = window.EP41, W3D = window.W3D;
  const { TAU, clamp, lerp, E, hash, PAL } = R;
  const W = R.W, H = R.H, GY = EP41.GY;
  const scene = (d) => R.scene(d);
  const load3d = async () => { await W3D.load(); };
  const fin = (ctx, T) => ST.finish(ctx, T, {});
  const tint = (ctx, col, a) => { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'color'; ctx.globalAlpha = a; ctx.fillStyle = col; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.restore(); };   // a colour grade (the hue only), per shot
  const ss = (a, b, x) => { const u = clamp((x - a) / (b - a)); return u * u * (3 - 2 * u); };
  const lit = (p, from, x, front = 0.8, k = 1.15, o = {}) => ({ ...ST.light(p, { from, at: [x, GY], front, k }), fill: 0.3, ...o });
  const ev = (f) => (u) => 0.55 * f(u) + 0.45 * u;   // an eased move that never comes to rest

  // ── DRONA (CE 1.122.39–40: the brahmin teacher of the Kuru and Pandu princes; a warrior with the bow). Not in the kit before this
  //    film: an old man, grey top-knot and beard, saffron and earth-red, the sacred thread, the bow. ──
  const bowProp = (col, len) => (g, P, r) => { if (P.po && P.po.bare) return; const sx = P.flip ? -1 : 1, s = P.s, hx = P.x + sx * r.nh[0] * s, hy = P.y + r.nh[1] * s, h = len * s;
    g.save(); g.translate(hx, hy); g.scale(sx, 1); g.lineCap = 'round'; g.strokeStyle = '#1a1008'; g.lineWidth = 26 * s; g.beginPath(); g.moveTo(40 * s, -h / 2); g.quadraticCurveTo(-150 * s, 0, 40 * s, h / 2); g.stroke();
    g.strokeStyle = col; g.lineWidth = 15 * s; g.stroke(); g.strokeStyle = '#fff4d0'; g.lineWidth = 3.5 * s; g.beginPath(); g.moveTo(40 * s, -h / 2); g.lineTo(40 * s, h / 2); g.stroke(); g.restore(); };
  if (!CH.teaserDrona) CH.actor({ id: 'teaserDrona', build: { h: 1.04, w: 0.96 }, skin: ['#1a0e08', '#b88458'], hair: { style: 'topknot', color: '#a8a4a0', lit: '#f0ece4' }, beard: { len: 0.7, color: '#d8d4cc', lit: '#ffffff' },
    lower: { kind: 'dhoti', color: '#e08a24', border: true }, upper: { kind: 'shawl', color: '#9a3a1a' }, rim: ['#ffd090', '#fff4e0'], ornament: ['#e7b54a', '#fff4c0'], jewels: { thread: true, mala: true, tilak: true }, tall: 200,
    after: bowProp('#c89040', 860),
    bible: { name: 'Drona', role: 'The brahmin who taught the Kuru and Pandu princes (CE 1.122.39–40); he fights for the Kauravas and guards their host five days (1.2.26).', palette: 'Saffron and earth-red, grey hair and beard, the sacred thread, the bow.', proportions: 'CH.actor', props: [], light: '', voice: null } });

  // A figure painted at its own scale (the trailer's method: q times larger under a zoomed camera, laid in at 1/q)
  const fig = (id, g, T, x, y, s, facing, pose, L, ex, key) => { const m = g.getTransform(), eff = Math.hypot(m.a, m.b) / R.scale; let q = eff > 1.25 ? Math.pow(2, Math.round(Math.log2(eff) * 2) / 2) : 1; q = Math.max(1, Math.min(q, 2.8 / s));
    if (q === 1) return CH[id].draw(g, { x, y, scale: s, facing, pose, light: L, expression: ex || { emo: 'calm' }, t: T, key: key || id });
    g.save(); g.scale(1 / q, 1 / q); CH[id].draw(g, { x: x * q, y: y * q, scale: s * q, facing, pose, light: L, expression: ex || { emo: 'calm' }, t: T, key: key || id }); g.restore(); };
  // Krishna before the form: in colour, darkened, the face in a soft shadow (the trailer's `shape`, with its probe handling)
  const shape = (g, a, col, draw, head) => { const b = R.buffer('tz-shape', W, H); b.clear(); const q = b.ctx, pr = R.probe;
    if (pr && pr.figures) { const n0 = pr.figures.length, c = [parseInt(col.slice(1, 3), 16), parseInt(col.slice(3, 5), 16), parseInt(col.slice(5, 7), 16)];
      q.save(); q.setTransform(1, 0, 0, 1, 0, 0); q.drawImage(g.canvas, 0, 0); q.restore(); q.save(); q.setTransform(g.getTransform()); draw(q); q.restore(); R.resetCtx(q);
      for (let k = n0; k < pr.figures.length; k++) pr.figures[k].fig = pr.figures[k].fig.map((v, i) => v * (1 - a) + c[i] * a);
      b.clear(); }
    R.probe = null; q.save(); q.setTransform(g.getTransform()); draw(q); q.restore(); R.resetCtx(q); R.probe = pr;
    q.save(); q.setTransform(1, 0, 0, 1, 0, 0); q.globalCompositeOperation = 'source-atop'; q.globalAlpha = a; q.fillStyle = col; q.fillRect(0, 0, b.canvas.width, b.canvas.height); q.restore();
    if (head) { const m = g.getTransform(), hx = m.a * head[0] + m.c * head[1] + m.e, hy = m.b * head[0] + m.d * head[1] + m.f, hr = head[2] * Math.hypot(m.a, m.b);
      const sh = q.createRadialGradient(hx, hy, hr * 0.3, hx, hy, hr); sh.addColorStop(0, col); sh.addColorStop(0.55, col); sh.addColorStop(1, 'rgba(0,0,0,0)');
      q.save(); q.setTransform(1, 0, 0, 1, 0, 0); q.globalCompositeOperation = 'source-atop'; q.globalAlpha = head[3] ?? 0.88; q.fillStyle = sh; q.fillRect(0, 0, b.canvas.width, b.canvas.height); q.restore(); }
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(b.canvas, 0, 0); g.restore(); };
  const headOf = (x, y, s, k = 1) => [x, y - 985 * s, 300 * s * k];
  const krishna = (g, T, x, y, s, facing, pose, L, key, ex, dark = 0.18) => shape(g, dark, '#080a1c', (q) => fig('epicKrishna', q, T, x, y, s, facing, pose, L, ex || { emo: 'calm', gaze: [0.8, 0.1] }, key), headOf(x, y, s));

  // ── the camera of the drawn layers: { z, f: [world x, y], s: [screen x, y] } framings (the trailer's grammar) ──
  const frame = (type, u, a, b, ease = E.inOutSine) => { const c = CAM[type](0, {}), e = ease(clamp(u));
    const z = Math.exp(lerp(Math.log(a.z), Math.log(b.z), e)), fx = lerp(a.f[0], b.f[0], e), fy = lerp(a.f[1], b.f[1], e), sx = lerp((a.s || [540, 960])[0], (b.s || [540, 960])[0], e), sy = lerp((a.s || [540, 960])[1], (b.s || [540, 960])[1], e);
    return { ...c, zoom: z, px: fx - W / 2 - (sx - W / 2) / z, py: fy - H / 2 - (sy - H / 2) / z, rot: 0 }; };

  // ── THE 3D LAYER as a stage layer: drawn full frame (the 3D camera owns its own move), then the integration: the scene's haze
  //    mixed in (7 % by default: the blacks lifted toward the air), optional depth-of-field blur (`soft`) ──
  const L3 = (T, o3, k = {}) => ({ z: k.z ?? 0.05, haze: false, soft: k.soft || 0, key: '3d', draw: (g) => {
    const c = W3D.render(T, o3); g.save(); g.setTransform(R.scale, 0, 0, R.scale, 0, 0); g.imageSmoothingQuality = 'high'; g.drawImage(c, 0, 0, W, H);
    g.globalCompositeOperation = 'screen'; g.globalAlpha = k.haze ?? 0.07; g.fillStyle = o3.haze || '#a8846e'; g.fillRect(0, 0, W, H); g.restore(); } });
  // looks for the 3D world, one per palette of the script
  const LOOK = {
    dawn: { sky: ['#241c40', '#e07a4e', '#5a3a34'], sun: { dir: [0.04, 0.035, -1], col: '#ff8a4a', size: 0.0018, glow: 1.3 }, haze: '#a87060', fog: [500, 3800], light: 0.92, keyCol: '#ffb080' },
    noon: { sky: ['#6a7a98', '#e8d0a0', '#a08060'], sun: { dir: [0.5, 0.45, -1], col: '#fff0c8', size: 0.0012, glow: 0.5 }, haze: '#d4bc94', fog: [600, 4200], light: 1.12, keyCol: '#fff0d0' },
    slate: { groundTint: '#8c9cc8', hillTint: '#a0b0d8', sky: ['#2c3a58', '#a0a8bc', '#5a5a68'], sun: { dir: [-0.4, 0.12, -1], col: '#e0e4f0', size: 0.0012, glow: 0.45 }, haze: '#8e94a8', fog: [300, 3000], light: 0.86, keyCol: '#e0e8ff' },
    copper: { groundTint: '#a07060', sky: ['#200e14', '#9a4a2c', '#3a1c16'], sun: { dir: [0.6, 0.1, -1], col: '#ff9a50', size: 0.0015, glow: 0.8 }, haze: '#6a3a2c', fog: [300, 3200], light: 0.62, keyCol: '#ffb070' },
    gold: { groundTint: '#b07070', sky: ['#140810', '#8a3424', '#2a1218'], sun: { dir: [0.0, 0.07, -1], col: '#ffb050', size: 0.004, glow: 0.9 }, haze: '#5a2a28', fog: [300, 3200], light: 0.5, keyCol: '#ffd090' },
    emerald: { groundTint: '#6a9068', hillTint: '#709a70', sky: ['#14301e', '#6e9a78', '#2a4430'], sun: { dir: [-0.5, 0.25, -1], col: '#f8f0c8', size: 0.0012, glow: 0.5 }, haze: '#4e6a52', fog: [400, 3600], light: 0.72 },
    crystal: { groundTint: '#90a8c8', hillTint: '#9ab4e0', sky: ['#2c5a98', '#c4d8e4', '#6a7a8a'], sun: { dir: [0.6, 0.5, -0.6], col: '#ffffff', size: 0.0012, glow: 0.4 }, haze: '#b4c0c4', fog: [500, 4200], light: 1.1, keyCol: '#fff8e8' },
    crimson: { groundTint: '#b06060', sky: ['#20080e', '#c0402a', '#401812'], sun: { dir: [0.2, 0.04, -1], col: '#ff5a2a', size: 0.002, glow: 1.2 }, haze: '#8a4434', fog: [250, 2600], light: 0.72, keyCol: '#ff9070' },
    iron: { groundTint: '#7880a8', hillTint: '#8890c0', sky: ['#14142a', '#6e6278', '#322a3a'], sun: { dir: [0.0, 0.1, -1], col: '#d8a080', size: 0.0, glow: 0.25 }, haze: '#5e5668', fog: [400, 3600], light: 0.82, keyCol: '#e0c0a0' },
    umber: { groundTint: '#c09070', sky: ['#4a2a2a', '#f0a868', '#7a4a30'], sun: { dir: [0.3, 0.12, -1], col: '#ffc070', size: 0.0016, glow: 0.9 }, haze: '#c89068', fog: [700, 3600], light: 1.0, keyCol: '#ffd0a0' },
    lavender: { groundTint: '#9a88c0', hillTint: '#a898d0', sky: ['#2e2a4c', '#b09ab8', '#4e4252'], sun: { dir: [0.0, 0.08, -1], col: '#ffd8c0', size: 0.0012, glow: 0.6 }, haze: '#8e80a0', fog: [200, 2400], light: 0.85 },
  };
  const HOSTS = { hosts: true, banners: true };
  const dustFar = (seed = 1, n = 160) => ({ n, box: [-1600, 1600, 0, 140, -800, 900], size: 120, drift: [14, 1, 0], seed });

  // ── THE CAPTION: one phrase at a time, large, in the fixed band; it appears with its first word and is gone with its shot ──
  const phrasesOf = (L) => { if (L._ph) return L._ph; const out = []; let cur = [];
    L.words.forEach((w, i) => { cur.push(i); if (/[.!?]["”’)]?$/.test(w.w) || i === L.words.length - 1) { out.push(cur); cur = []; } });
    return (L._ph = out.map((ix) => ({ ix, t0: L.words[ix[0]].t0, t1: L.words[ix[ix.length - 1]].t1 }))); };
  const capCore = (w) => w.replace(/[^\p{L}\p{N}]/gu, '').toLowerCase();
  R.overlay = (ctx, T) => {
    const i = R.lineIndexAt(T), L = R.lines[i];
    if (!L || L.caption === false || !L.text) return;
    const ph = phrasesOf(L); let k = -1;
    for (let q = 0; q < ph.length; q++) if (T >= Math.max(L.start, ph[q].t0 - 0.06)) k = q;
    if (k < 0) return;
    const P = ph[k], tIn = Math.max(L.start, P.t0 - 0.06), last = k === ph.length - 1;
    const vis = clamp((T - tIn) / 0.09) * (last ? 1 - clamp((T - (P.t1 + 0.55)) / 0.2) : 1) * (1 - clamp((T - (L.end - 0.1)) / 0.1));
    if (vis <= 0.004) return;
    const big = !!L.fast || P.ix.length <= 4, emph = (L.emphasis || []).map(capCore);
    let size = big ? 82 : 70, rows, space;
    for (;;) { ctx.save(); ctx.font = R.font(size, 'caption', 700); space = ctx.measureText(' ').width; rows = [[]]; let x = 0;
      for (const wi of P.ix) { const w = L.words[wi].w, ww = ctx.measureText(w).width; if (x > 0 && x + ww > 820) { rows.push([]); x = 0; } rows[rows.length - 1].push({ wi, w, x, ww }); x += ww + space; }
      ctx.restore(); if (rows.length <= 2 || size <= 50) break; size -= 4; }
    const lineH = size * 1.2, bottom = 1400, top = bottom - (rows.length - 1) * lineH, CX = KIT.CX;
    if (R.probe) R.probe.cap = { line: L.id, alpha: vis, rows: rows.length };
    ctx.save(); ctx.globalAlpha = vis * 0.95; const g = ctx.createLinearGradient(0, top - 190, 0, bottom + 120);
    g.addColorStop(0, 'rgba(10,7,6,0)'); g.addColorStop(0.45, 'rgba(10,7,6,0.8)'); g.addColorStop(0.8, 'rgba(10,7,6,0.8)'); g.addColorStop(1, 'rgba(10,7,6,0)');
    ctx.fillStyle = g; ctx.fillRect(0, top - 190, W, bottom + 120 - (top - 190)); ctx.restore();
    ctx.save(); ctx.font = R.font(size, 'caption', 700); ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round';
    const pop = 1 + 0.04 * (1 - E.outCubic(clamp((T - tIn) / 0.16)));
    ctx.translate(CX, top - size * 0.3); ctx.scale(pop, pop); ctx.translate(-CX, -(top - size * 0.3));
    rows.forEach((row, r) => { const lastW = row[row.length - 1], x0 = CX - (lastW.x + lastW.ww) / 2, y = top + r * lineH;
      for (const w of row) { const wt = L.words[w.wi], sp = clamp((T - wt.t0) / 0.07) * (1 - clamp((T - wt.t1) / 0.3)), gold = emph.some((e) => e && capCore(w.w).startsWith(e));
        ctx.globalAlpha = vis; ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(12,8,6,0.9)'; ctx.strokeText(w.w, x0 + w.x, y);
        ctx.fillStyle = gold ? R.mix(PAL.gold, '#ffe6a6', 0.25 + 0.6 * sp) : R.mix(PAL.cream, '#fff2c8', sp * 0.9); ctx.fillText(w.w, x0 + w.x, y); } });
    ctx.restore();
  };

  // ── THE PLAQUE: the name, one line of who, and the verse it rests on (small). Box and letters arrive together, in four frames ──
  const plq = (ctx, env, t, name, x, y, at = 0.35) => { const k = clamp((t - at) / 0.13); if (k <= 0) return;
    const [ep, ref] = (env.script.plaques || {})[name] || [env.script.names[name] || '', ''], e = E.outCubic(k);
    ctx.save(); ctx.font = R.font(58, 'display', 700); ctx.letterSpacing = '6px'; const tw = ctx.measureText(name.toUpperCase()).width;
    ctx.font = R.font(34, 'caption', 600); ctx.letterSpacing = '0px'; const ew = ctx.measureText(ep).width, w = Math.max(tw, ew) + 80, h = ref ? 178 : 140;
    x = clamp(x, 30 + w / 2, W - 30 - w / 2);
    ctx.translate(x, y); ctx.scale(lerp(1.08, 1, e), lerp(1.08, 1, e)); ctx.globalAlpha = e;
    ctx.fillStyle = 'rgba(14,8,6,0.88)'; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.fillStyle = PAL.gold; ctx.fillRect(-w / 2, -h / 2, w, 4); ctx.fillRect(-w / 2, h / 2 - 4, w, 4);
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = R.px(6);
    const y0 = -h / 2 + 66;
    ctx.font = R.font(58, 'display', 700); ctx.letterSpacing = '6px'; ctx.fillStyle = PAL.goldPale; ctx.fillText(name.toUpperCase(), 3, y0);
    ctx.font = R.font(34, 'caption', 600); ctx.letterSpacing = '0px'; ctx.fillStyle = PAL.cream; ctx.fillText(ep, 0, y0 + 46);
    if (ref) { ctx.font = R.font(25, 'caption', 500, 'italic'); ctx.fillStyle = '#d8b878'; ctx.fillText(`${ref} · Critical Edition`, 0, y0 + 84); }
    ctx.restore();
    if (R.probe) { R.probe.type = R.probe.type || {}; R.probe.type.plaque = (R.probe.type.plaque || 0) + 1; } };

  // ── INTRODUCTION SHOT: the 3D world behind, one drawn figure, a slow move, the plaque. o = { look, cam3(u), pal, id, x, s, facing, pose(t), emo, name, plaqueXY, extra3, fg } ──
  const intro = (o) => ({ id: o.line, init: load3d,
    draw(ctx, t, env) {
      const T = env.T, u = t / env.dur, FY = o.feet ?? 1890, c30 = o.cam3(u), c3 = { ...c30, pos: [c30.pos[0] + 16 * Math.sin(T * 1.1), c30.pos[1] + 5 * Math.sin(T * 1.5), c30.pos[2] + 10 * Math.sin(T * 0.7)] }, cam = CAM.drift(o.cam2 ? o.cam2(u) : frame('push', u, { z: 1.0, f: [540, 1000] }, { z: 1.1, f: [540, 960] }, ev(E.inOutSine)), T, 3.6, 3);
      const o3 = { ...LOOK[o.look], cam: c3, show: { ...HOSTS, dust: true, ...(o.show || {}) }, dust: { ...dustFar(o.seed || 1, 220), drift: [60, 4, 0], size: 90 }, ...(o.extra3 ? o.extra3(T, t, u, env) : {}) };
      ST.shot(ctx, T, { pal: o.pal, cam, grade: 0.25, layers: [
        L3(T, o3, { soft: o.soft ? o.soft(u) : 0.12 }),
        { z: 0.6, haze: false, draw: (g) => { const sh = g.createLinearGradient(0, GY - 300, 0, H + 400); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(10,6,4,0.55)'); g.fillStyle = sh; g.fillRect(-900, GY - 300, 2880, 1600); } },
        { z: 1, haze: false, draw: (g, p) => { g.save(); g.globalAlpha = 0.45; g.fillStyle = '#100806'; g.beginPath(); g.ellipse(o.x, FY + 4, 260 * o.s, 40 * o.s, 0, 0, TAU); g.fill(); g.restore();
          if (o.krishna) krishna(g, T, o.x, FY, o.s, o.facing, o.pose(t, env), lit(p, o.from || [300, 400], o.x, 0.55, 1.1), 'tz-' + o.line);
          else fig(o.id, g, T, o.x, FY, o.s, o.facing, o.pose(t, env), lit(p, o.from || [300, 400], o.x, o.front ?? 0.82, 1.2, o.tint ? { tint: o.tint } : {}), { emo: o.emo || 'resolve', gaze: o.gaze || [0.7, 0.05] }, 'tz-' + o.line);
          if (o.fg) o.fg(g, T, t, u, env); } },
        { z: 1.35, haze: false, draw: (g) => ST.particles(g, T * 2.4, { kind: o.particles || 'dust', count: 110, cam }) },
      ] });
      plq(ctx, env, t, o.name, o.plaqueXY[0], o.plaqueXY[1], 0.3);
      fin(ctx, T);
    },
    post: () => ({ bloom: o.bloom ?? 0.32, vignette: 0.48, paper: 0.26 }) });

  // ══ 0 · TITLE (no voice): low over the Pandava ranks at dawn, pushing in toward the red sun; the name arrives large ══
  scene({ id: 'title', init: load3d,
    draw(ctx, t, env) {
      const T = env.T, S = env.strings, u = t / env.dur, e = ev(E.outCubic)(u);
      const o3 = { ...LOOK.dawn, cam: { pos: [lerp(-30, 10, e), lerp(150, 126, e), lerp(1080, 960, e)], look: [0, lerp(118, 112, e), -900], fov: 40 }, show: { ...HOSTS, bannersP: false, dust: true, embers: true },
        dust: { n: 220, box: [-500, 500, 30, 160, 500, 980], size: 90, drift: [18, 2, 0], seed: 2 }, embers: { n: 90, box: [-300, 300, 40, 220, 650, 940], size: 3, drift: [10, 22, 0], seed: 5, flicker: true } };
      ST.shot(ctx, T, { pal: 'war-iron', cam: CAM.still(), grade: 0.2, layers: [L3(T, o3), { z: 1.3, haze: false, draw: (g) => ST.particles(g, T * 1.4, { kind: 'dust', count: 50 }) }] });
      // the name: struck in on the first drum, fully there by 1.2 s
      const a = clamp((t - 0.22) / 0.45), y = 640, sc = lerp(1.12, 0.97, E.outCubic(clamp((t - 0.22) / 1.0))) * (1 + 0.03 * u);
      ctx.save(); ctx.globalAlpha = a; const gr = ctx.createLinearGradient(0, y - 300, 0, y + 260); gr.addColorStop(0, 'rgba(6,5,12,0)'); gr.addColorStop(0.35, 'rgba(6,5,12,0.72)'); gr.addColorStop(0.72, 'rgba(6,5,12,0.72)'); gr.addColorStop(1, 'rgba(6,5,12,0)'); ctx.fillStyle = gr; ctx.fillRect(0, y - 300, W, 560); ctx.restore();
      ctx.save(); ctx.translate(540, y - 30); ctx.scale(sc, sc); ctx.translate(-540, -(y - 30));
      KIT.goldText(ctx, (S.seriesTitle || '').toUpperCase(), 540, y, { size: 104, spacing: 5, weight: 700, alpha: a, glow: 0.45, sheen: ((t * 0.55) % 1.6) * 1.4 - 0.4, key: 'tz-title' });
      const k2 = E.outCubic(clamp((t - 1.4) / 0.4));
      if (k2 > 0) { ctx.globalAlpha = k2; ctx.fillStyle = PAL.gold; ctx.fillRect(540 - 250 * k2, y + 40, 500 * k2, 3); KIT.goldText(ctx, (S.seriesSubtitle || '').toUpperCase(), 540, y + 108, { size: 44, spacing: 12, weight: 600, alpha: k2, glow: 0.25, key: 'tz-sub' }); }
      ctx.restore();
      if (R.probe) R.probe.title = { alpha: a, box: [70, y - 100, 1010, y + 24] };
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.44, vignette: 0.5, paper: 0.26 }) });

  // ══ 1 · COUSINS (CE 1.107.1): the hall; the hundred, the five, the empty throne; the focus racks on the words ══
  const crowd = (g, x0, x1, y, n, rows, col, rim, T, s = 1) => { for (let r = rows - 1; r >= 0; r--) for (let i = 0; i < n; i++) { const x = lerp(x0, x1, (i + 0.5 * (r % 2)) / n), yy = y - r * 26 * s, sc = s * (1 - r * 0.06), bob = 6 * Math.sin(T * 2.4 + i * 1.7 + r);
      g.fillStyle = col; g.beginPath(); g.ellipse(x, yy - 62 * sc + bob, 24 * sc, 58 * sc, 0, 0, TAU); g.fill(); g.beginPath(); g.arc(x, yy - 136 * sc + bob, 17 * sc, 0, TAU); g.fill();
      g.strokeStyle = rim; g.lineWidth = 2.4 * sc; g.beginPath(); g.arc(x, yy - 136 * sc + bob, 17 * sc, -2.5, -0.6); g.stroke(); g.fillStyle = '#e7b54a'; g.fillRect(x - 12 * sc, yy - 160 * sc + bob, 24 * sc, 6 * sc); } };
  scene({ id: 'cousins', transition: { type: 'lamp', dur: 0.4, from: [540, 300], to: [540, 700] },
    draw(ctx, t, env) {
      const T = env.T, b1 = env.beats[0] ?? 1.2, b2 = env.beats[1] ?? 2.2, k1 = E.inOutSine(clamp((t - b1 + 0.3) / 0.45)), k2 = E.inOutSine(clamp((t - b2 + 0.25) / 0.45)), u = t / env.dur;
      const fr = frame('push', u, { z: 1.4, f: [450, 1080], s: [540, 1000] }, { z: 1.95, f: [630, 960], s: [540, 960] }, (x) => x), cam = { ...CAM.drift(fr, T, 9, 5), types: ['rack'], focus: lerp(lerp(0.55, 0.8, k1), 0.68, k2), soft: 0.55 };
      ST.shot(ctx, T, { pal: 'seat-ivory', cam, layers: [
        { z: 0, haze: false, draw: (g) => { const gr = g.createLinearGradient(0, -400, 0, 1700); gr.addColorStop(0, '#3a2410'); gr.addColorStop(0.6, '#a07a40'); gr.addColorStop(1, '#e8d0a0'); g.fillStyle = gr; g.fillRect(-900, -900, 2880, 3720); } },
        { z: 0.3, draw: (g, p) => ST.pillars(g, p, { y: 1380, n: 5 }) },
        { z: 0.55, draw: (g) => crowd(g, -160, 470, 1240, 14, 6, '#2a1040', 'rgba(220,180,255,0.8)', T, 0.8) },
        { z: 0.68, haze: false, draw: (g) => { KIT.glow(g, 540, 820, 560, '#fff4d0', (0.55 + 0.35 * k2) * (0.6 + 0.4 * Math.sin(T * 9.1))); ST.shafts(g, T, {}); const L = 540;   // the lion-throne, empty, lit from above
          g.fillStyle = '#6a4010'; g.fillRect(L - 150, 980, 300, 260); g.fillStyle = '#c8902a'; g.beginPath(); g.moveTo(L - 170, 1000); g.quadraticCurveTo(L - 190, 760, L, 700); g.quadraticCurveTo(L + 190, 760, L + 170, 1000); g.fill(); g.fillStyle = '#8a2a14'; g.fillRect(L - 110, 820, 220, 170);
          g.fillStyle = '#ffe08a'; g.fillRect(L - 180, 976, 360, 22); for (const sx of [-1, 1]) { g.fillStyle = '#c8902a'; g.beginPath(); g.arc(L + sx * 170, 1040, 34, 0, TAU); g.fill(); g.fillStyle = '#ffe08a'; g.beginPath(); g.arc(L + sx * 170, 1040, 16, 0, TAU); g.fill(); } } },
        { z: 0.8, draw: (g) => crowd(g, 720, 1040, 1290, 5, 1, '#efe6d0', 'rgba(255,240,200,0.95)', T, 1.25) },
        { z: 1.3, haze: false, draw: (g) => ST.particles(g, T * 2.4, { kind: 'dust', count: 120, cam }) },
      ] });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.3, vignette: 0.42, paper: 0.3 }) });

  // ══ 2 · NEEDLE (CE 5.125.26): the closest face of the film; a needle glints; plaque DURYODHANA ══
  scene({ id: 'needle',
    draw(ctx, t, env) {
      const T = env.T, u = t / env.dur, cam = CAM.drift(frame('push', u, { z: 1.0, f: [560, 960], s: [540, 880] }, { z: 1.25, f: [560, 960], s: [540, 760] }, (x) => x), T, 2.2, 7), b0 = env.speech[1] - 0.6;
      ST.shot(ctx, T, { pal: 'venom-violet', cam, layers: [
        { z: 0, haze: false, draw: (g) => { const gr = g.createLinearGradient(0, -400, 0, 1920); gr.addColorStop(0, '#08040e'); gr.addColorStop(1, '#3a1a3a'); g.fillStyle = gr; g.fillRect(-900, -900, 2880, 3720); } },
        { z: 0.3, soft: 0.5, draw: (g, p) => { ST.pillars(g, p, { y: 1700, n: 4 }); KIT.glow(g, 140, 760, 640, '#ffb070', 0.55 * KIT.flicker(T, 4)); } },
        { z: 1, haze: false, draw: (g, p) => fig('epicDuryodhana', g, T, 640, 3200, 2.3, 'left', { w: { stand: 1 }, bare: true }, { ...lit(p, [140, 760], 660, 0.86, 1.2 * KIT.flicker(T, 4)), tint: ['#ffb070', 0.45], minLum: 0.25 },
          { emo: ACT.emo(t, [[0, 'resolve'], [b0, 'wrath', { dur: 0.5 }]]), speak: 0, ...ACT.lead(t, [[0, [0.6, 0.1]], [b0, [0.95, 0]]], 0.4, 0.2) }, 'tz-nd') },
        { z: 1.2, haze: false, draw: (g) => { const k = ss(0.35, 0.9, u), x = 210, y = 1150 - 60 * u;   // the needle's point, catching the lamp
          g.save(); g.translate(x, y); g.rotate(-0.9 + 0.25 * u); g.globalAlpha = k; g.strokeStyle = '#d8dce8'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(-90, 0); g.lineTo(90, 0); g.stroke(); g.restore(); KIT.glow(g, x + 60, y - 70, 70, '#ffffff', 0.6 * k * (0.6 + 0.4 * Math.sin(T * 6))); } },
        { z: 1.5, haze: false, draw: (g) => ST.particles(g, T * 2.6, { kind: 'ember', count: 120, cam }) },
      ] });
      plq(ctx, env, t, 'Duryodhana', 540, 250, 0.35);
      tint(ctx, '#6a2a9a', 0.3);   // venom-violet: the refusal
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.3, vignette: 0.56, paper: 0.3 }) });

  // ══ 3 · GATHER (CE 1.2.234, 6.23.1): the first 3D wide; the camera cranes up and back over the plain; chariots roll into line ══
  scene({ id: 'gather', init: load3d, transition: { type: 'smoke', dur: 0.36, dir: -Math.PI / 2, color: '#6a5030' },
    draw(ctx, t, env) {
      const T = env.T, u = t / env.dur, e = ev(E.inOutCubic)(u);
      const ey = E.outCubic(u), ez = ev(E.inCubic)(u); const o3 = { ...LOOK.noon, cam: { pos: [lerp(160, 40, e), lerp(26, 560, ey), lerp(140, 1500, ez)], look: [0, lerp(30, 0, e), lerp(-500, -120, e)], fov: lerp(46, 40, e) }, show: { ...HOSTS, bannersP: false, dust: true },
        dust: { n: 260, box: [-1400, 1400, 0, 160, -500, 800], size: 160, drift: [22, 2, 0], seed: 4 }, dustOpacity: 0.28,
        chariots: [1, 2, 3, 4, 5, 6].map((i, k) => { const dir = k % 2 ? -1 : 1, x = dir * (520 - 150 * t) + (k - 3) * 90, z = k % 2 ? -190 : -40; return { i, pos: [x, z + 30 * (k % 3)], heading: dir > 0 ? Math.PI : 0, dist: 150 * t, gallop: true }; }) };
      ST.shot(ctx, T, { pal: 'noon-ochre', cam: CAM.still(), grade: 0.2, layers: [L3(T, o3), { z: 1.3, haze: false, draw: (g) => ST.particles(g, T * 1.6, { kind: 'dust', count: 70 }) }] });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.28, vignette: 0.44, paper: 0.24 }) });

  // ══ 4–9 · THE INTRODUCTIONS: one at a time, held, a plaque each ══
  scene(intro({ line: 'bhishma', look: 'slate', pal: 'cold-slate', id: 'epicBhishma', x: 580, s: 1.3, facing: 'left', name: 'Bhishma', plaqueXY: [540, 200], emo: 'calm', gaze: [0.6, 0],
    cam3: (u) => ({ pos: [lerp(-110, 10, u), 48, lerp(-60, -150, u)], look: [lerp(-30, 30, u), 52, -700], fov: lerp(37, 30, u) }), cam2: (u) => frame('push', u, { z: 1.0, f: [560, 1000] }, { z: 1.24, f: [560, 880] }, (x) => x),
    pose: (t) => ({ ...ACT.pose(t, [[0, 'stand'], [1.0, 'attend', { act: 0.4 }]]), bare: true }), from: [200, 300], tint: ['#dce8ff', 0.4] }));   // bare: the great bow's string crossed his face
  scene(intro({ line: 'drona', look: 'copper', pal: 'dharma-copper', id: 'teaserDrona', x: 470, s: 1.36, facing: 'right', name: 'Drona', plaqueXY: [600, 200], emo: 'calm', gaze: [0.6, 0.1],
    cam3: (u) => ({ pos: [lerp(-90, 90, u), 40, -60], look: [lerp(-60, 60, u), 44, -420], fov: 40 }), cam2: (u) => ({ ...frame('slide', u, { z: 1.06, f: [430, 980] }, { z: 1.06, f: [560, 980] }, (x) => x) }),
    extra3: (T) => ({ chariots: [1, 2, 3, 4].map((i, k) => ({ i, pos: [-330 + k * 220, -300 - 40 * (k % 2)], heading: 0.35, dist: 0, gallop: false })) }),
    pose: (t) => ({ ...ACT.pose(t, [[0, 'stand'], [1.4, 'attend', { act: 0.5 }]]), bare: true }), from: [900, 300] }));
  scene(intro({ line: 'karna', look: 'gold', pal: 'sun-white', id: 'epicKarna', x: 560, s: 1.4, facing: 'left', name: 'Karna', plaqueXY: [540, 200], emo: 'resolve', gaze: [0.7, -0.05], bloom: 0.42,
    cam3: (u) => ({ pos: [0, lerp(30, 40, u), -140], look: [0, lerp(60, 80, u), -900], fov: lerp(38, 33, u) }), cam2: (u) => frame('push', u, { z: 1.0, f: [540, 1050] }, { z: 1.12, f: [540, 940] }, ev(E.inOutSine)),
    pose: (t, env) => ACT.pose(t, [[0, 'stand'], [env.dur * 0.55, 'offer', { act: 0.5 }]]), from: [540, 600], front: 1.0, tint: ['#fff0d0', 0.3] }));   // lit full against a darkened sky
  scene(intro({ line: 'arjuna', look: 'emerald', pal: 'hunt-emerald', id: 'epicArjuna', x: 420, s: 1.4, facing: 'right', name: 'Arjuna', plaqueXY: [640, 200], emo: 'resolve', gaze: [0.8, 0],
    cam3: (u) => ({ pos: [lerp(20, 220, u), 40, lerp(170, 90, u)], look: [lerp(-120, 100, u), 40, -700], fov: lerp(42, 30, u) }), soft: (u) => lerp(0.6, 0.06, ss(0.3, 0.8, u)),   // RACK: the army comes into focus on "over an army"
    cam2: (u) => ({ ...frame('push', u, { z: 1.0, f: [420, 1010] }, { z: 1.3, f: [490, 930] }, (x) => x), types: ['rack'] }),
    pose: (t) => ACT.pose(t, [[0, 'stand']]), from: [100, 300] }));   // stand: in 'attend' the bow crossed his face (seen on the render; spliced)
  scene(intro({ line: 'krishna', look: 'crystal', pal: 'crystal-sky', krishna: true, x: -999, s: 0.6, facing: 'right', name: 'Krishna', plaqueXY: [540, 200],
    cam3: (u) => { const cx = lerp(-300, 140, u); return { pos: [cx + 44, 44, 220], look: [cx + 40, 22, -110], fov: 38 }; },
    cam2: () => ({ ...CAM.still(), types: ['slide'] }),
    extra3: (T, t, u) => ({ chariots: [{ i: 0, pos: [lerp(-300, 140, u), -110], heading: 0, dist: 440 * u * 1.0 + 60 * T, gallop: true }] }),
    pose: () => ({ w: { stand: 0.7, offer: 0.3 } }),
    fg: (g, T, t, u) => { const cx = lerp(-300, 140, u), y0 = W3D.groundY(cx, -110); const [sx, sy, f] = W3D.project([cx + 4, y0 + 33, -110]); const s = (47 * f) / 1000;
      const L = { dir: -2.2, intensity: 1.4, front: 0.9, fill: 0.5, tint: ['#fff4d8', 0.3], minLum: 0.3 };
      krishna(g, T, sx, sy, s, 'right', { w: { stand: 0.55, offer: 0.45 } }, L, 'tz-kr', undefined, 0.04);
      const [hx, hy] = W3D.project([cx + 62, y0 + 34, -116]); g.strokeStyle = '#3a2410'; g.lineWidth = 3; g.beginPath(); g.moveTo(sx + 120 * s, sy - 560 * s); g.quadraticCurveTo((sx + hx) / 2, Math.max(sy - 300 * s, hy) + 30, hx, hy); g.stroke(); } }));

  // ══ 10 · CONCH, THE TURN (CE 6.23.12–20): both hosts; Bhishma's conch, then the conches of both sides as rings across the plain;
  //    on "The first arrows fly" the volleys rise; non-principal archers in the foreground draw and loose ══
  const archer = (g, x, y, s, T, draw, dir = 1) => { g.save(); g.translate(x, y); g.scale(dir * s, s); g.lineCap = 'round'; g.lineJoin = 'round';
    const col = '#1a0e10', rim = 'rgba(255,190,140,0.9)', pull = 60 * draw;
    g.fillStyle = col; g.beginPath(); g.ellipse(0, -300, 70, 170, 0.08, 0, TAU); g.fill(); g.beginPath(); g.arc(18, -520, 54, 0, TAU); g.fill(); g.fillRect(-40, -150, 34, 160); g.fillRect(14, -150, 34, 160);
    g.strokeStyle = col; g.lineWidth = 34; g.beginPath(); g.moveTo(20, -400); g.lineTo(190, -430); g.stroke(); g.beginPath(); g.moveTo(10, -400); g.lineTo(80 - pull, -420); g.stroke();
    g.strokeStyle = '#3a2410'; g.lineWidth = 16; g.beginPath(); g.moveTo(200, -700); g.quadraticCurveTo(260 - 30 * draw, -430, 200, -160); g.stroke(); g.strokeStyle = '#f0e0c0'; g.lineWidth = 3; g.beginPath(); g.moveTo(200, -700); g.lineTo(80 - pull, -420); g.lineTo(200, -160); g.stroke();
    if (draw > 0.05) { g.strokeStyle = '#e8d8b8'; g.lineWidth = 6; g.beginPath(); g.moveTo(80 - pull, -420); g.lineTo(300, -430); g.stroke(); }
    g.strokeStyle = rim; g.lineWidth = 5; g.beginPath(); g.arc(18, -520, 54, -2.6, -0.4); g.stroke(); g.beginPath(); g.ellipse(0, -300, 70, 170, 0.08, -2.4, -0.7); g.stroke();
    g.restore(); };
  scene({ id: 'conch', init: load3d,
    draw(ctx, t, env) {
      const T = env.T, u = t / env.dur, e = ev(E.inOutSine)(u), w = env.words, tFly = w[4] ? w[4].t0 : env.dur * 0.55, T0 = T - t;
      const o3 = { ...LOOK.iron, cam: { pos: [lerp(0, 60, e), lerp(420, 120, e), lerp(1300, 900, e)], look: [0, lerp(0, 90, e), lerp(-200, -500, e)], fov: lerp(44, 40, e) },
        show: { ...HOSTS, dust: true, rings: true, arrows: true }, dust: dustFar(6, 200),
        rings: [{ at: [0, -460], t0: T0 - 0.35, dur: 2.6, r1: 2200, h: 90, col: '#ffd8a0' }, { at: [-200, 420], t0: T0 + 0.45, dur: 2.4, r1: 2000, h: 80, col: '#fff0c8' }, { at: [300, 400], t0: T0 + 0.75, dur: 2.2, r1: 1800, h: 70, col: '#ffe0b0' }],
        volleys: [{ t0: T0 + tFly - 0.25, from: [0, 50, -480], to: [0, 30, 520], n: 420, spread: 1800, height: 420, dur: 2.2, seed: 7, stagger: 0.6, size: 1.8, trailW: 2 },
          { t0: T0 + tFly - 0.05, from: [0, 50, 460], to: [0, 30, -560], n: 360, spread: 1700, height: 380, dur: 2.0, seed: 8, stagger: 0.5, size: 1.8, trailW: 2 }] };
      const dr = ss(tFly - 1.0, tFly - 0.25, t) * (1 - ss(tFly - 0.2, tFly - 0.12, t));
      ST.shot(ctx, T, { pal: 'war-iron', cam: CAM.crane(u, { from: 1.0, to: 1.0, y0: 0, y1: 0 }), grade: 0.75, layers: [L3(T, o3),
        { z: 1, haze: false, draw: (g) => { const k = ss(tFly - 1.5, tFly - 0.9, t); if (k <= 0) return; g.save(); g.globalAlpha = k; for (const [x, s, d] of [[-60, 1.05, 1], [190, 0.9, 1], [940, 1.0, -1], [1150, 1.15, -1]]) archer(g, x, 2020 + 30 * s, s, T, dr, d); g.restore(); } },
        { z: 1.3, haze: false, draw: (g) => ST.particles(g, T * 1.8, { kind: 'dust', count: 70 }) }] });
      tint(ctx, '#3c4c9c', 0.42);   // iron-blue: the war's cold light
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.4, vignette: 0.5, paper: 0.24 }) });

  // ══ 11 · BETWEEN (CE 6.23.20–24): the white horses at the gallop, the monkey banner, the chariot runs out between the two hosts ══
  const chariotFigs = (g, T, cx, cz, heading, o = {}) => { const y0 = W3D.groundY(cx, cz), fwd = [Math.cos(heading), -Math.sin(heading)];
    const at = (d) => [cx + fwd[0] * d, y0 + 33, cz + fwd[1] * d];
    const [ax, ay, af] = W3D.project(at(-6)), [kx, ky, kf] = W3D.project(at(8)), sa = (47 * af) / 1000, sk = (47 * kf) / 1000, facing = o.facing || 'right';
    const L = { dir: -2.0, intensity: 1.15, front: 0.2, fill: 0.08, tint: ['#ffc080', 0.5], minLum: 0 };   // against the bright dust they stand dark, rimmed by the sun
    krishna(g, T, kx, ky, sk, facing, { w: { stand: 0.5, offer: 0.5 } }, L, 'tz-bk');
    fig('epicArjuna', g, T, ax, ay, sa, facing, o.apose || { w: { stand: 1, raise: 0.3 } }, { ...L, front: 0.05, fill: 0.02 }, { emo: o.emo || 'resolve', gaze: [0.8, 0] }, 'tz-ba');
    // the chariot's near side over their legs (the 3D box is behind them): projected from the box's own corners, so it moves with it
    const lz = Math.cos(heading) * 0 + 1, sd = [Math.sin(heading), Math.cos(heading)], P3 = (lx, ly, lzz) => W3D.project([cx + fwd[0] * lx + sd[0] * lzz, y0 + ly, cz + fwd[1] * lx + sd[1] * lzz]); void lz;
    const q = [P3(-14, 21, 11.6), P3(14, 21, 11.6), P3(14, 39, 11.6), P3(-14, 39, 11.6)];
    g.save(); g.fillStyle = '#7a2c14'; g.strokeStyle = '#1a0e0a'; g.lineWidth = Math.max(2, 6 * sa); g.beginPath(); q.forEach((v, i) => (i ? g.lineTo(v[0], v[1]) : g.moveTo(v[0], v[1]))); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = '#e7b54a'; g.lineWidth = Math.max(2, 12 * sa); g.beginPath(); g.moveTo(q[3][0], q[3][1]); g.lineTo(q[2][0], q[2][1]); g.stroke(); g.restore(); };
  scene({ id: 'between', init: load3d,
    draw(ctx, t, env) {
      const T = env.T, u = t / env.dur, cz = lerp(200, -80, u), cx = 0, heading = Math.PI / 2;
      const o3 = { ...LOOK.umber, cam: { pos: [cx + 300, 56, cz + lerp(60, -40, u)], look: [cx, 26, cz - 40], fov: 42 }, show: { ...HOSTS, dust: true, arrows: true },
        chariots: [{ i: 0, pos: [cx, cz], heading, dist: 1100 * u + 50 * T, gallop: true }], dust: { n: 200, box: [-700, -60, 0, 90, -500, 600], size: 90, drift: [0, 2, -60], seed: 11 }, dustOpacity: 0.22,
        volleys: [{ t0: T - t - 0.4, from: [-200, 60, -520], to: [200, 30, 520], n: 260, spread: 1400, height: 520, dur: 2.6, seed: 12, stagger: 1.4, size: 1.8, trailW: 2 }] };
      ST.shot(ctx, T, { pal: 'arrival-umber-gold', cam: { ...CAM.slide(u, { zoom: 1, from: 0, to: 0 }) }, grade: 0.2, layers: [L3(T, o3),
        { z: 1, haze: false, draw: (g) => chariotFigs(g, T, cx, cz, heading, { facing: 'right' }) },
        { z: 1.3, haze: false, draw: (g) => ST.particles(g, T * 2, { kind: 'dust', count: 80 }) }] });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.32, vignette: 0.46, paper: 0.24 }) });

  // ══ 12 · LOWERS (CE 6.23.25–26, 47): before Bhishma and Drona he sees his teachers and kin; the bow leaves his hand ══
  scene({ id: 'lowers', init: load3d,
    draw(ctx, t, env) {
      const T = env.T, u = t / env.dur, w = env.words, tB = w[5] ? w[5].t0 : env.dur * 0.5, bow = E.inQuad(ss(tB - 0.2, tB + 0.9, t)), sit = ss(tB, tB + 1.2, t);
      const o3 = { ...LOOK.lavender, cam: { pos: [10 * Math.sin(T * 0.8), 70 + 4 * Math.sin(T * 1.1), -60], look: [lerp(-60, 30, u), 56, -800], fov: lerp(36, 31, u) }, show: { ...HOSTS, dust: true }, dust: dustFar(13, 180) };
      const cam = CAM.drift(frame('push', u, { z: 1.0, f: [600, 960], s: [540, 900] }, { z: 1.36, f: [640, 820], s: [540, 860] }, (x) => x), T, 2.4, 9);
      ST.shot(ctx, T, { pal: 'mist-lavender', cam, grade: 0.7, layers: [L3(T, o3, { soft: 0.75 }),
        { z: 1, haze: false, draw: (g, p) => { g.fillStyle = '#e8e0d0'; g.beginPath(); g.moveTo(-200, GY + 40); g.lineTo(1300, GY + 40); g.lineTo(1300, GY + 120); g.lineTo(-200, GY + 120); g.fill(); g.fillStyle = '#c8a040'; g.fillRect(-200, GY + 40, 1500, 14);   // the chariot's rail
          if (bow > 0) { g.save(); g.translate(760, lerp(GY - 660, GY - 40, bow * bow)); g.rotate(1.25 * bow + 0.2); g.strokeStyle = '#1a1008'; g.lineWidth = 22; g.lineCap = 'round'; g.beginPath(); g.moveTo(30, -300); g.quadraticCurveTo(-120, 0, 30, 300); g.stroke(); g.strokeStyle = '#e7b54a'; g.lineWidth = 12; g.stroke(); g.restore(); }
          fig('epicArjuna', g, T, 680, GY + 50, 0.86, 'left', { w: { stand: 1 - sit, sit: 0.9 * sit, grieve: 0.55 * sit + 0.25 * bow * (1 - sit) }, bare: bow > 0 }, lit(p, [300, 500], 680, 0.7, 1.2, { tint: ['#ffd8c0', 0.35] }), { emo: sit > 0.4 ? 'sorrow' : 'fear', gaze: [0.5, 0.2 + 0.5 * sit] }, 'tz-lw');
          krishna(g, T, 240, GY + 50, 0.84, 'left', { w: { stand: 1 } }, lit(p, [300, 500], 240, 0.95, 1.5, { minLum: 0.35 }), 'tz-lk'); } },
        { z: 1.3, haze: false, draw: (g) => ST.particles(g, T * 2.4, { kind: 'dust', count: 110, cam }) }] });
      tint(ctx, '#6a4ca8', 0.42);   // lavender: grief
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.3, vignette: 0.52, paper: 0.26 }) });

  // ══ 13 · TIME, THE SIGNATURE SHOT (CE 6.33.9–32): the light of a thousand suns; the form; both hosts streaming in; "I am Time" ══
  const FACE_COLS = [['#1a3a9a', '#3a6ae0'], ['#8a1a14', '#e0503a'], ['#a8741a', '#f0c050'], ['#1a6a4a', '#4ac08a'], ['#c8c8d8', '#ffffff'], ['#5a2a8a', '#a070e0'], ['#0e2a6a', '#3a7ae0']];
  const vFace = (g, x, y, s, T, i, o = {}) => {   // the trailer's face (TRAILER-CHECK.md: 6.33.10, 17, 19, 23–25)
    const [c0, c1] = FACE_COLS[i % FACE_COLS.length], open = 0.55 + 0.45 * Math.sin(T * 1.7 + i * 1.3);
    g.save(); g.translate(x, y); g.scale(s, s);
    g.fillStyle = '#e7b54a'; g.beginPath(); g.moveTo(-150, -150); g.lineTo(-120, -330); g.lineTo(-60, -250); g.lineTo(0, -420); g.lineTo(60, -250); g.lineTo(120, -330); g.lineTo(150, -150); g.closePath(); g.fill(); g.fillStyle = '#fff0b0'; g.fillRect(-152, -176, 304, 34); g.fillStyle = '#c8401a'; g.beginPath(); g.arc(0, -282, 22, 0, TAU); g.fill();
    const gr = g.createLinearGradient(0, -170, 0, 230); gr.addColorStop(0, c1); gr.addColorStop(1, c0); g.fillStyle = gr; g.beginPath(); g.moveTo(-158, -150); g.quadraticCurveTo(-190, 60, -90, 190); g.quadraticCurveTo(0, 250, 90, 190); g.quadraticCurveTo(190, 60, 158, -150); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(255,240,190,0.85)'; g.lineWidth = 7; g.stroke();
    for (const sx of [-1, 1]) { g.fillStyle = '#fffbe8'; g.beginPath(); g.ellipse(sx * 72, -40, 46, 26, sx * -0.12, 0, TAU); g.fill();
      if (o.sunMoon) { if (sx < 0) { g.fillStyle = '#ffb020'; g.beginPath(); g.arc(sx * 72, -40, 22, 0, TAU); g.fill(); } else { g.fillStyle = '#c8d8ff'; g.beginPath(); g.arc(sx * 72, -40, 22, 0, TAU); g.fill(); g.fillStyle = '#fffbe8'; g.beginPath(); g.arc(sx * 72 + 9, -44, 18, 0, TAU); g.fill(); } }
      else { g.fillStyle = '#ff7a10'; g.beginPath(); g.arc(sx * 72, -40, 17, 0, TAU); g.fill(); g.fillStyle = '#1a0806'; g.beginPath(); g.arc(sx * 72, -40, 8, 0, TAU); g.fill(); }
      g.strokeStyle = '#0a0612'; g.lineWidth = 9; g.beginPath(); g.moveTo(sx * 24, -86); g.quadraticCurveTo(sx * 76, -112, sx * 128, -80); g.stroke(); }
    g.fillStyle = '#ffe890'; g.beginPath(); g.ellipse(0, -112, 9, 26, 0, 0, TAU); g.fill();
    g.fillStyle = c0; g.beginPath(); g.moveTo(-14, -20); g.lineTo(0, 46); g.lineTo(14, -20); g.fill();
    const mh = 30 + 46 * open; g.fillStyle = '#1a0406'; g.beginPath(); g.ellipse(0, 112, 70, mh, 0, 0, TAU); g.fill();
    g.save(); g.beginPath(); g.ellipse(0, 112, 66, mh - 4, 0, 0, TAU); g.clip(); for (const [c, q] of [['#e8401c', 1], ['#ffa030', 0.7], ['#fff0a0', 0.4]]) { g.fillStyle = c; g.beginPath(); g.moveTo(-64 * q, 112 + mh); for (let k = 0; k <= 6; k++) g.lineTo(-64 * q + (128 * q * k) / 6, 112 + mh - (k % 2 ? 1.7 : 0.9) * mh * q * (0.8 + 0.3 * Math.sin(T * 9 + k + i))); g.lineTo(64 * q, 112 + mh); g.fill(); } g.restore();
    if (o.tusks) { g.fillStyle = '#fffbe8'; for (const sx of [-1, 1]) { g.beginPath(); g.moveTo(sx * 58, 104); g.quadraticCurveTo(sx * 84, 60, sx * 62, 36); g.quadraticCurveTo(sx * 60, 72, sx * 40, 100); g.fill(); } }
    g.restore(); };
  const vArm = (g, sx, sy, a, len, T, i, what) => {
    const a2 = a + 0.1 * Math.sin(T * 0.8 + i), ex = sx + Math.cos(a2) * len * 0.52, ey = sy + Math.sin(a2) * len * 0.52, a3 = a2 - Math.sign(Math.cos(a)) * 0.35 + 0.08 * Math.sin(T * 1.1 + i * 2), hx = ex + Math.cos(a3) * len * 0.5, hy = ey + Math.sin(a3) * len * 0.5;
    g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = '#fff0c0'; g.lineWidth = 54; g.beginPath(); g.moveTo(sx, sy); g.lineTo(ex, ey); g.lineTo(hx, hy); g.stroke(); g.strokeStyle = i % 2 ? '#1c3aa0' : '#122a80'; g.lineWidth = 42; g.stroke();
    g.strokeStyle = '#e7b54a'; g.lineWidth = 12; g.beginPath(); g.arc(ex, ey, 30, 0, TAU); g.stroke();
    g.save(); g.translate(hx, hy); g.rotate(a3);
    if (what === 0) { g.rotate(-a3 + T * 4); g.strokeStyle = '#ffe890'; g.lineWidth = 16; g.beginPath(); g.arc(0, 0, 56, 0, TAU); g.stroke(); g.fillStyle = '#ff9a1e'; for (let k = 0; k < 12; k++) { g.rotate(TAU / 12); g.beginPath(); g.moveTo(58, -9); g.lineTo(82, 0); g.lineTo(58, 9); g.fill(); } }   // the discus (6.33.17)
    else if (what === 1) { g.fillStyle = '#7a4a10'; g.fillRect(-20, -9, 150, 18); g.fillStyle = '#e7b54a'; g.beginPath(); g.ellipse(160, 0, 54, 38, 0, 0, TAU); g.fill(); }   // the mace (6.33.17)
    else if (what === 2) { g.fillStyle = '#e8f0ff'; g.beginPath(); g.moveTo(0, -11); g.lineTo(200, -5); g.lineTo(236, 0); g.lineTo(200, 5); g.lineTo(0, 11); g.fill(); }
    else { g.fillStyle = '#e8b890'; g.beginPath(); g.ellipse(26, 0, 34, 24, 0, 0, TAU); g.fill(); }
    g.restore(); };
  const vForm = (g, T) => {   // the form, drawn about (540, 560) at scale 1, to be placed by the 3D core's projection
    { const bg = g.createLinearGradient(0, 760, 0, 1500); bg.addColorStop(0, '#1a3a9a'); bg.addColorStop(1, 'rgba(10,22,72,0)'); g.fillStyle = bg; g.beginPath(); g.moveTo(330, 1500); g.quadraticCurveTo(390, 1060, 250, 850); g.quadraticCurveTo(540, 700, 830, 850); g.quadraticCurveTo(690, 1060, 750, 1500); g.fill(); }
    g.strokeStyle = '#e7b54a'; g.lineWidth = 16; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(330 - i * 34, 800 + i * 20); g.quadraticCurveTo(540, 990 + i * 120, 750 + i * 34, 800 + i * 20); g.stroke(); }
    const WHAT = [0, 1, 2, 3, 2, 1, 0, 3, 2];
    for (let i = 8; i >= 0; i--) for (const sd of [-1, 1]) { const a = lerp(-1.42, 0.62, i / 8), ang = sd > 0 ? a : Math.PI - a; vArm(g, 540 + sd * 215, 850 + i * 5, ang, 400 + 45 * ((i * 3) % 4), T, i + (sd > 0 ? 0 : 9), sd > 0 ? WHAT[i] : WHAT[(i + 4) % 9]); }
    const row = (y, s, xs, seed) => xs.forEach((x, j) => vFace(g, x, y + 10 * Math.sin(T * 0.7 + j + seed), s, T, j + seed, { tusks: true }));
    row(-150, 0.5, [-140, 40, 220, 400, 580, 760, 940, 1120], 23); row(40, 0.62, [-80, 150, 380, 700, 930, 1160], 11); row(250, 0.78, [20, 270, 810, 1060], 5); row(540, 0.95, [-60, 180, 900, 1140], 1);
    vFace(g, 540, 470 + 6 * Math.sin(T * 0.6), 1.5, T, 0, { sunMoon: true }); };
  scene({ id: 'time', init: load3d,
    draw(ctx, t, env) {
      const T = env.T, w = env.words, tTime = w[5] ? w[5].t0 : 2.4, lightK = ss(0.05, 0.75, t), pull = E.inOutCubic(clamp((t - 0.2) / 2.6)), creep = clamp((t - 2.8) / Math.max(0.5, env.dur - 2.8));
      const CORE = [0, 640, -420];
      const o3 = { ...LOOK.dawn, sky: ['#3a1030', '#ffb050', '#5a2a20'], haze: '#c87850', light: lerp(0.8, 1.35, lightK), sun: { dir: [0, 0.4, -1], col: '#fff0c0', size: 0.0, glow: 0.0 },
        cam: { pos: [lerp(40, 0, pull), lerp(70, 210, pull) + 20 * creep, lerp(120, 1250, pull) + 60 * creep], look: [0, lerp(140, 330, pull), lerp(-400, -420, pull)], fov: lerp(38, 46, pull) },
        show: { hosts: true, banners: false, dust: true, rings: true, divine: true }, dust: dustFar(15, 160), dustCol: '#ffd8a0',
        divine: { at: CORE, coreR: lerp(20, 170, lightK), tubeS: lerp(0.3, 1.2, lightK), k: lightK },
        rings: [{ at: [0, -380], t0: T - t + 0.35, dur: 2.8, r1: 2600, h: 160, col: '#fff0c0' }, { at: [0, -380], t0: T - t + tTime - 0.1, dur: 2.4, r1: 2400, h: 120, col: '#ffd890' }],
        chariots: [{ i: 0, pos: [0, 40], heading: Math.PI / 2, dist: 0, gallop: false }] };
      ST.shot(ctx, T, { pal: 'release-gold', cam: { ...CAM.pull(0), zoom: 1 }, grade: 0.15, layers: [L3(T, o3, { haze: 0.05 }),
        { z: 0.5, haze: false, draw: (g) => { const [cx, cy, f] = W3D.project(CORE); const s = clamp((f * 300) / 1000 / 1.0, 0.15, 2.2) * lightK;   // the form, centred on the light
          if (s < 0.02) return; g.save(); g.globalAlpha = clamp(lightK * 1.2); g.translate(cx, cy + 40 * s); g.scale(s, s); g.translate(-540, -560); vForm(g, T); g.restore(); } },
        { z: 1, haze: false, draw: (g) => { const cz = 40, y0 = W3D.groundY(0, cz); const [ax, ay, af] = W3D.project([0, y0 + 33, cz]); const sa = (47 * af) / 1000; const tr = 0.5 * Math.sin(T * 41) * lightK;
          KIT.glow(g, ax, ay - 400 * sa, 600 * sa, '#fff4c0', 0.5 * lightK);
          fig('epicArjuna', g, T, ax + tr * sa * 10, ay, sa, 'left', { w: { stand: 1 - 0.75 * lightK, anjali: 0.9 * lightK, kneel: 0.25 * lightK }, bare: true }, { dir: -Math.PI / 2 - 0.5, intensity: lerp(0.9, 1.7, lightK), front: lerp(0.5, 0.96, lightK), fill: 0.4, tint: ['#fff0b0', 0.6], minLum: 0.2 }, { emo: ACT.emo(t, [[0, 'fear'], [0.8, 'wonder', { dur: 0.5 }]]), gaze: [0.6, -0.9 * lightK] }, 'tz-ta'); } },
        { z: 1.3, haze: false, draw: (g) => ST.particles(g, T * 1.6, { kind: 'ember', count: 80 }) }] });
      const fl = Math.max(0, 1 - Math.abs(t - 0.55) / 0.35); if (fl > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(255,244,200,${0.5 * fl})`; ctx.fillRect(0, 0, W, H); ctx.restore(); }
      const sh = ctx.createLinearGradient(0, 1150, 0, 1600); sh.addColorStop(0, 'rgba(10,4,14,0)'); sh.addColorStop(1, 'rgba(10,4,14,0.35)'); ctx.fillStyle = sh; ctx.fillRect(0, 1150, W, 800);
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.55, vignette: 0.42, paper: 0.22 }) });

  // ══ 14 · PROMISE: palm leaves, and on them the references this film rests on, as the camera tilts down the stack ══
  const REFS = ['Adi 1.107.1', 'Udyoga 5.125.26', 'Adi 1.2.234', 'Udyoga 5.153.26', 'Adi 1.122.40', 'Udyoga 5.165.27', 'Udyoga 5.7.19', 'Udyoga 5.7.35', 'Bhishma 6.23.20', 'Bhishma 6.23.47', 'Bhishma 6.33.32'];
  scene({ id: 'promise', transition: { type: 'brush', dur: 0.4 },
    draw(ctx, t, env) {
      const T = env.T, u = t / env.dur, cam = CAM.drift({ ...CAM.tilt(u, { zoom: lerp(1.04, 1.14, u), from: -80, to: 80 }) }, T, 2.4, 11);
      ST.shot(ctx, T, { pal: 'naimisha-bluehour', cam, grade: 0.85, layers: [
        { z: 0, haze: false, draw: (g) => { const gr = g.createLinearGradient(0, -400, 0, 2200); gr.addColorStop(0, '#06081c'); gr.addColorStop(1, '#141a3a'); g.fillStyle = gr; g.fillRect(-900, -900, 2880, 3720); KIT.glow(g, 540, 1500, 900, '#ff9a3a', 0.2 * KIT.flicker(T, 3)); } },
        { z: 1, haze: false, draw: (g) => { for (let i = 0; i < REFS.length; i++) { const k = E.outCubic(clamp((t - 0.05 - i * 0.2) / 0.4)); if (k <= 0) continue; const y = 120 + i * 98, x = lerp(1700, 540 + (i % 2 ? 22 : -22), k);
            g.save(); g.translate(x, y); g.rotate((i % 2 ? 1 : -1) * 0.012 + 0.2 * (1 - k)); g.fillStyle = 'rgba(0,0,0,0.4)'; g.beginPath(); g.roundRect(-392, -40, 800, 104, 14); g.fill();
            g.fillStyle = '#dcbc7c'; g.strokeStyle = '#7a5626'; g.lineWidth = 4; g.beginPath(); g.roundRect(-400, -50, 800, 100, 14); g.fill(); g.stroke();
            g.fillStyle = '#3a2410'; for (const hx of [-300, 300]) { g.beginPath(); g.arc(hx, 0, 10, 0, TAU); g.fill(); }
            g.strokeStyle = '#4a2e14'; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); for (let c = 0; c < 9; c++) { const xx = -270 + c * 26; const hh = 8 + 8 * hash(i * 31 + c, 5); g.moveTo(xx, -hh * 0.5); g.quadraticCurveTo(xx + 8, -hh, xx + 16, hh * 0.4); } g.stroke();   // strokes like writing, not letters
            g.font = R.font(40, 'caption', 600, 'italic'); g.fillStyle = '#3a1c08'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(REFS[i], -20, 2);
            g.restore(); } } },
        { z: 1.4, haze: false, draw: (g) => ST.particles(g, T * 2.6, { kind: 'ember', count: 110, cam }) },
      ] });
      tint(ctx, '#3456b8', 0.55);   // blue hour: the night reading
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.34, vignette: 0.5, paper: 0.32 }) });

  // ══ 16 · THE END CARD: MAHABHARATAM, FOLLOW in a ring that beats, Episode 1 · its name, the source line ONLY. Always moving. ══
  scene({ id: 'endcard',
    draw(ctx, t, env) {
      const T = env.T, S = env.strings, u = t / env.dur, cam = frame('push', u, { z: 1.0, f: [540, 960] }, { z: 1.1, f: [540, 1000] }, (x) => x), z = lerp(1, 1.04, u), CXT = 500;
      ST.shot(ctx, T, { pal: 'arrival-umber-gold', cam, layers: [
        { z: 0, haze: false, draw: (g) => { const gr = g.createRadialGradient(540, 1300, 80, 540, 1300, 1500); gr.addColorStop(0, '#6a3c0c'); gr.addColorStop(0.5, '#1c1006'); gr.addColorStop(1, '#060302'); g.fillStyle = gr; g.fillRect(-900, -900, 2880, 3720); } },
        { z: 0.5, haze: false, draw: (g) => { KIT.glow(g, 540, 1300, 900, '#ffb040', 0.3 + 0.05 * Math.sin(T * 3)); g.save(); g.translate(540, 1300); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 14; i++) { const a = (i / 14) * TAU - T * 0.25; g.fillStyle = 'rgba(255,170,60,0.07)'; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a - 0.06) * 1900, Math.sin(a - 0.06) * 1900); g.lineTo(Math.cos(a + 0.06) * 1900, Math.sin(a + 0.06) * 1900); g.fill(); } g.restore(); } },
        { z: 0.8, haze: false, draw: (g) => CH.hearthfire.draw(g, { x: 540, y: 1960, scale: 0.8, t: T, k: 1.1, key: 'tz-ef' }) },
        { z: 1.2, haze: false, draw: (g) => ST.particles(g, T * 1.6, { kind: 'ember', count: 90, cam }) },
      ] });
      const inn = (d) => E.outCubic(clamp((t - d) / 0.22)), fit = (txt, size, fam, wt, st, maxW) => { let fs = size; ctx.font = R.font(fs, fam, wt, st); while (ctx.measureText(txt).width > maxW && fs > 20) { fs -= 1; ctx.font = R.font(fs, fam, wt, st); } return fs; };
      ctx.save(); ctx.translate(CXT, 760); ctx.scale(z, z); ctx.translate(-CXT, -760);
      const k0 = inn(0.0); if (k0 > 0) KIT.goldText(ctx, (S.seriesTitle || '').toUpperCase(), CXT, 330, { size: 92, spacing: 5, weight: 700, alpha: k0, glow: 0.45, sheen: ((t * 0.5) % 1.6) * 1.4 - 0.4, key: 'tz-ectitle' });
      const k1 = inn(0.15), FY = 640, pu = (T * 0.9) % 1;
      if (k1 > 0) { ctx.save(); ctx.globalAlpha = k1; ctx.fillStyle = 'rgba(14,8,6,0.78)'; ctx.beginPath(); ctx.roundRect(CXT - 400, FY - 170, 800, 250, 40); ctx.fill(); ctx.strokeStyle = PAL.gold; ctx.lineWidth = 6; ctx.stroke();
        for (const ph of [pu, (pu + 0.5) % 1]) { ctx.globalAlpha = k1 * 0.8 * (1 - ph); ctx.strokeStyle = '#ffe0a0'; ctx.lineWidth = 7 * (1 - ph) + 1; ctx.beginPath(); ctx.roundRect(CXT - 400 - 34 * ph, FY - 170 - 34 * ph, 800 + 68 * ph, 250 + 68 * ph, 40 + 20 * ph); ctx.stroke(); } ctx.restore();
        KIT.goldText(ctx, (S.followWord || '').toUpperCase(), CXT, FY, { size: 150, spacing: 10, weight: 700, alpha: k1, glow: 0.5, sheen: ((t * 0.7) % 1.5) * 1.5 - 0.4, key: 'tz-follow' }); }
      const k2 = inn(0.4); if (k2 > 0) { ctx.save(); ctx.globalAlpha = k2; ctx.textAlign = 'center'; ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = R.px(8);
        ctx.letterSpacing = '6px'; fit((S.nextEpisodeLabel || '').toUpperCase(), 76, 'display', 700, 'normal', 800); ctx.fillStyle = PAL.goldPale; ctx.fillText((S.nextEpisodeLabel || '').toUpperCase(), CXT, 900);
        ctx.letterSpacing = '0px'; fit(S.nextTitle || '', 66, 'caption', 600, 'italic', 800); ctx.fillStyle = PAL.cream; ctx.fillText(S.nextTitle || '', CXT, 990); ctx.fillStyle = PAL.gold; ctx.fillRect(CXT - 220 * k2, 1026, 440 * k2, 4); ctx.restore(); }
      const k4 = inn(0.75); if (k4 > 0) { ctx.save(); ctx.globalAlpha = 0.92 * k4; ctx.textAlign = 'center'; ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = R.px(6); ctx.fillStyle = '#e8d8b8'; fit(S.sourceLine || '', 36, 'caption', 500, 'normal', 800); ctx.fillText(S.sourceLine || '', CXT, 1130); ctx.restore(); if (R.probe) { R.probe.type = R.probe.type || {}; R.probe.type.source = 1; } }
      ctx.restore();
      const k5 = inn(0.9); if (k5 > 0) { ctx.save(); ctx.strokeStyle = '#ffd070'; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 12; for (let i = 0; i < 3; i++) { const ph = (T * 1.4 - i * 0.22) % 1, a = Math.sin(Math.PI * clamp(ph)); ctx.globalAlpha = k5 * (0.25 + 0.75 * a); const x = 190, y = 1300 + i * 58 + 10 * a; ctx.beginPath(); ctx.moveTo(x - 46, y); ctx.lineTo(x, y + 40); ctx.lineTo(x + 46, y); ctx.stroke(); } ctx.restore(); }
      if (R.probe) R.probe.card = { follow: [CXT - 400, FY - 170, CXT + 400, FY + 80], lowestText: 1130 + 150, rightmostText: CXT + 400 * z };
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.42, vignette: 0.5, paper: 0.3 }) });
})();
