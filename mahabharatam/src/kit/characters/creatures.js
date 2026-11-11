/*
 * CREATURES · EPISODES 41–50. Lit by the same rig rule as the figures (rim on the lit side, a lit fill, colour blocks).
 *
 *   boar        PULOMAN AS A BOAR (CE 1.6): huge, storm-slate like the rakshasa, a ridge of bristles, tusks, a red eye.
 *               pose { name: 'run', phase } | 'stand'
 *   dundubha    THE OLD HARMLESS SNAKE (CE 1.9–11): thick, drab olive with a pale belly, a blunt head, a mild eye
 *               that blinks. pose { name: 'rise', k } (0 = lying stretched out, 1 = head raised to speak)
 *   viper       THE SNAKE THAT BIT PRAMADVARA (CE 1.8): small, dark, banded. pose { name: 'strike', k } (0 = asleep, coiled)
 *   hawk        THE KING'S HAWK (CE 1.57): pose { name: 'fly', phase }, opts.pose.packet = true (the leaf it carries)
 *   fish        THE FISH OF THE YAMUNA, the cursed apsara Adrika (CE 1.57): silver, a pearl glow. pose { name: 'swim', phase }
 *   hearthfire  AGNI AS THE WITNESS: the household fire with a face (CE 1.5–7). Not a rim-lit figure: it IS the light.
 *               CH.hearthfire.draw(ctx, { x, y, scale, t, k (size, 0 = withdrawn … 1.4), pure (0..1: the flames turn
 *               clear gold-white: "whatever you burn is made pure"), expression { emo, gaze, speak } })
 * Face LEFT. (x, y) = the ground under the creature. scale 1 ≈ 1000 px long (boar, fish), 900 px (dundubha).
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, CH = KIT.characters;
  const { TAU, clamp, lerp, hash } = R;
  const { cut, limb } = CH;
  const bib = (name, role, light) => ({ name, role, palette: light, proportions: '', props: [], light, poses: [], voice: null });
  const la = (r, rule) => clamp(r.L.front * r.k * (rule.litGain ?? 1) + r.L.fill * 0.6);
  const blocks = (g, P, r, rule, f) => { const w = CH.rimWidth(P.s, r.k, rule); g.save(); g.globalCompositeOperation = 'source-atop'; g.translate((-Math.cos(r.L.dir) * w) / (P.flip ? -P.s : P.s), (-Math.sin(r.L.dir) * w) / P.s); f((c) => KIT.hex(rule.fill, c, la(r, rule))); g.restore(); };
  const base = (P) => ({ T: P.T, L: P.L, k: P.k, ph: P.po.phase || 0, pk: P.po.k ?? 1, name: P.po.name, po: P.po });

  // ── the boar: built from masses (shoulder hump, rump, a wedge head carried low), near-black with the scene's rim; a
  //    four-pose gallop (gather · push · stretch · land) with the body pitching and rising ──
  const BOAR = { fill: '#0c0a0e', lit: '#4a4650', litGain: 0.9, rim: ['#c890c8', '#ffe8f8'], inner: null, innerA: 0, glow: 0, rimW: 0.7, ornament: ['#e8e0c8', '#fffbe8'], ornamentA: [0.85, 1] };
  function boarRig(P) {
    const r = base(P), run = r.name === 'run' ? 1 : 0, ph = r.ph;
    r.run = run; r.pitch = run * 0.07 * Math.sin(ph); r.rise = run * (12 + 16 * Math.max(0, Math.sin(ph - 0.6)));
    // legs: [hip x, phase offset, hind]; each swings from the shoulder / haunch with a hock that folds on the recovery
    r.legs = [[-250, 0.0, 0], [-170, 0.5, 0], [250, Math.PI - 0.2, 1], [330, Math.PI + 0.3, 1]].map(([x, off, hind]) => {
      const a = run ? Math.sin(ph + off) * (hind ? 0.75 : 0.85) : (hind ? 0.08 : -0.05), fold = run ? Math.max(0, Math.cos(ph + off)) : 0;
      const top = [x, -300], L1 = 150, L2 = 150 - 50 * fold;
      const knee = [top[0] - Math.sin(a) * L1 + (hind ? 26 : -8), top[1] + Math.cos(a) * L1];
      const b2 = a * 0.6 + (hind ? -0.5 : 0.35) * (0.4 + fold);
      const hoof = [knee[0] - Math.sin(b2) * L2, Math.min(-2 + r.rise, knee[1] + Math.cos(b2) * L2)];
      return { top, knee, hoof, hind };
    });
    return r;
  }
  function boarShape(g, color, P, r) {
    g.fillStyle = color;
    g.translate(0, -r.rise); g.rotate(r.pitch);
    for (const l of r.legs) { g.beginPath(); limb(g, [l.top, l.knee, l.hoof], [150, 74, 40]); g.fill(); g.beginPath(); g.moveTo(l.hoof[0] - 34, l.hoof[1] + 6); g.lineTo(l.hoof[0] - 20, l.hoof[1] - 30); g.lineTo(l.hoof[0] + 22, l.hoof[1] - 30); g.lineTo(l.hoof[0] + 26, l.hoof[1] + 6); g.closePath(); g.fill(); }
    // the body: a great shoulder hump, a lower rump, the belly line
    g.beginPath(); g.moveTo(430, -330);
    g.bezierCurveTo(450, -470, 330, -560, 170, -560); g.bezierCurveTo(60, -560, -40, -690, -200, -680);
    g.bezierCurveTo(-320, -672, -390, -590, -420, -500); g.bezierCurveTo(-470, -470, -560, -400, -640, -300);
    g.bezierCurveTo(-670, -262, -664, -226, -628, -220); g.bezierCurveTo(-560, -210, -480, -200, -400, -214);
    g.bezierCurveTo(-300, -150, 220, -140, 380, -220); g.bezierCurveTo(420, -250, 430, -290, 430, -330); g.closePath(); g.fill();
    g.beginPath(); g.ellipse(-646, -262, 30, 44, 0.3, 0, TAU); g.fill();                                                   // the snout disc
    g.beginPath(); g.moveTo(-372, -560); g.quadraticCurveTo(-330, -700, -290, -690); g.quadraticCurveTo(-300, -620, -300, -560); g.closePath(); g.fill();   // the ear
    // bristles: a ragged ridge along the spine only (short, irregular, leaning back)
    g.beginPath(); for (let i = 0; i < 26; i++) { const u = i / 25, x = lerp(-400, 300, u), y = -600 - 86 * Math.sin(Math.PI * Math.min(1, u * 1.5)) * (u < 0.66 ? 1 : 0.4) + 60 * u * u, h = 26 + 34 * hash(i, 3), ln = 18 + 22 * hash(i, 5) + r.run * 10; g.moveTo(x - 10, y + 16); g.lineTo(x + ln, y - h); g.lineTo(x + 16, y + 18); g.closePath(); } g.fill();
    g.beginPath(); limb(g, [[420, -380], [470, -420 + r.run * 24 * Math.sin(r.ph * 2)], [500, -380]], [18, 10, 6]); g.fill();        // the tail
  }
  CH.define({ id: 'boar', rule: BOAR, rig: boarRig, bounds: () => [-780, -820, 620, 80], defaultPose: 'run', shape: boarShape,
    ornaments: (g, P, r, a, color) => {
      g.translate(0, -r.rise); g.rotate(r.pitch);
      blocks(g, P, r, BOAR, (tone) => { g.fillStyle = tone('#6a6470'); g.beginPath(); g.ellipse(-520, -330, 90, 40, -0.5, 0, TAU); g.fill(); });   // the jowl catches a little light
      g.globalAlpha *= a; g.fillStyle = color;
      g.beginPath(); g.moveTo(-590, -236); g.quadraticCurveTo(-622, -280, -596, -330); g.quadraticCurveTo(-588, -280, -560, -250); g.closePath(); g.fill();   // a small tusk curving up from the lower jaw
      g.strokeStyle = color; g.lineWidth = 3; g.globalAlpha *= 0.5; for (let i = 0; i < 7; i++) { const x = -330 + i * 86; g.beginPath(); g.moveTo(x, -520 + 20 * (i % 2)); g.lineTo(x + 40, -470 + 20 * (i % 2)); g.stroke(); }   // coarse hair
      g.globalAlpha = a; g.fillStyle = '#ff3a20'; g.beginPath(); g.ellipse(-470, -452, 12, 8, 0.4, 0, TAU); g.fill();
    },
    after: (ctx, P, r, k) => {
      if (!r.run) return;   // dust at each landing
      const land = Math.max(0, Math.sin(r.ph * 2 + 1.2)); ctx.save(); ctx.globalAlpha = 0.35 * land;
      for (let i = 0; i < 5; i++) { ctx.fillStyle = '#d8c8d8'; ctx.beginPath(); ctx.ellipse(P.x + (P.flip ? -1 : 1) * (200 - i * 110) * P.s, P.y - 8 * P.s - land * 20 * P.s * (i % 2), (40 + 30 * land) * P.s, (14 + 10 * land) * P.s, 0, 0, TAU); ctx.fill(); }
      ctx.restore(); void k;
    },
    bible: bib('Puloman as a boar', 'The rakshasa takes a boar\'s form and carries Puloma off with the speed of mind and wind (CE 1.6).', 'Near-black masses with the scene\'s rim, a ragged ridge of bristles, a small ivory tusk, a red eye.') });

  // ── serpents: ONE spline body for all (a centreline sampled from a travelling curve, drawn as a variable-width ribbon;
  //    a belly ribbon; diamonds stamped along the arc length; a flattened spade head with an almond eye and a tongue) ──
  function ribbonPath(g, pts, wf) {
    const n = pts.length, Lf = [], Rt = [];
    for (let i = 0; i < n; i++) { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)]; let dx = b[0] - a[0], dy = b[1] - a[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l; const w = wf(i / (n - 1)) / 2; Lf.push([pts[i][0] - dy * w, pts[i][1] + dx * w]); Rt.push([pts[i][0] + dy * w, pts[i][1] - dx * w]); }
    g.moveTo(Lf[0][0], Lf[0][1]); for (let i = 1; i < n; i++) g.lineTo(Lf[i][0], Lf[i][1]); for (let i = n - 1; i >= 0; i--) g.lineTo(Rt[i][0], Rt[i][1]); g.closePath();
  }
  const headAng = (pts) => Math.atan2(pts[0][1] - pts[2][1], pts[0][0] - pts[2][0]);
  function snakeHead(g, pts, hs) { const [hx, hy] = pts[0]; g.save(); g.translate(hx, hy); g.rotate(headAng(pts)); g.moveTo(-hs * 0.9, -hs * 0.5); g.bezierCurveTo(-hs * 0.2, -hs * 0.86, hs * 0.7, -hs * 0.6, hs * 1.25, 0); g.bezierCurveTo(hs * 0.7, hs * 0.5, -hs * 0.2, hs * 0.62, -hs * 0.9, hs * 0.44); g.closePath(); g.restore(); }
  function snakeMarks(g, pts, P, r, rule, o) {
    blocks(g, P, r, rule, (tone) => {
      g.fillStyle = tone(o.belly); g.beginPath(); ribbonPath(g, pts.map(([x, y], i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, w = o.w(i / (pts.length - 1)) * 0.3; return [x - (b[1] - a[1]) / l * w * (P.flip ? -1 : 1) * 0 + (b[1] - a[1]) / l * -w, y + (b[0] - a[0]) / l * w]; }), (u) => o.w(u) * 0.36); g.fill();
      g.fillStyle = tone(o.mark);
      for (let i = 3; i < pts.length - 2; i += o.step || 2) { const a = pts[i - 1], b = pts[i + 1], an = Math.atan2(b[1] - a[1], b[0] - a[0]), w = o.w(i / (pts.length - 1)); g.save(); g.translate(pts[i][0] + Math.sin(an) * w * 0.14, pts[i][1] - Math.cos(an) * w * 0.14); g.rotate(an); g.beginPath(); if (o.zig) { g.moveTo(-w * 0.5, 0); g.lineTo(0, -w * 0.3); g.lineTo(w * 0.5, 0); g.lineTo(0, w * 0.12); } else { g.moveTo(-w * 0.34, 0); g.lineTo(0, -w * 0.24); g.lineTo(w * 0.34, 0); g.lineTo(0, w * 0.24); } g.closePath(); g.fill(); g.restore(); }
    });
  }
  function snakeFace(g, pts, hs, r, a, o) {
    const [hx, hy] = pts[0]; g.save(); g.translate(hx, hy); g.rotate(headAng(pts)); g.globalAlpha *= a;
    const lid = 1 - (r.blink || 0) * 0.9;
    g.fillStyle = o.eye || '#ffe9a8'; g.beginPath(); g.moveTo(hs * 0.1, -hs * 0.3); g.quadraticCurveTo(hs * 0.42, -hs * (0.3 + 0.26 * lid), hs * 0.74, -hs * 0.26); g.quadraticCurveTo(hs * 0.42, -hs * (0.3 - 0.14 * lid), hs * 0.1, -hs * 0.3); g.fill();
    g.fillStyle = '#140a04'; g.beginPath(); g.ellipse(hs * 0.44, -hs * 0.3, hs * 0.05, hs * 0.11 * lid, 0, 0, TAU); g.fill();
    g.strokeStyle = '#140a04'; g.lineWidth = Math.max(2, hs * 0.05); g.lineCap = 'round'; g.beginPath(); g.moveTo(hs * 1.2, hs * 0.02); g.quadraticCurveTo(hs * 0.6, hs * (0.16 + 0.16 * (r.speak || 0)), hs * 0.05, hs * 0.14); g.stroke();
    const fl = Math.max(0, Math.sin(r.T * 5.5 + (o.seed || 0))) ** 6 + (o.tongue || 0);
    if (fl > 0.05) { g.strokeStyle = '#d83a3a'; g.lineWidth = Math.max(2, hs * 0.06); g.beginPath(); g.moveTo(hs * 1.2, hs * 0.04); g.lineTo(hs * (1.2 + 0.5 * fl), hs * 0.06); g.lineTo(hs * (1.2 + 0.8 * fl), -hs * 0.06); g.moveTo(hs * (1.2 + 0.5 * fl), hs * 0.06); g.lineTo(hs * (1.2 + 0.8 * fl), hs * 0.2); g.stroke(); }
    g.restore();
  }
  const DUN = { fill: '#16140a', lit: '#a89a5a', litGain: 0.95, rim: ['#e0d890', '#fffbe0'], inner: null, innerA: 0, glow: 0, rimW: 0.7, ornament: ['#e8e0b0', '#ffffff'], ornamentA: [0.85, 1] };
  /** The old snake: lying in loose curves (k = 0) or REARED on an S-curve, the head high and turned to look up (k = 1). */
  function dunPts(r) {
    const k = clamp(r.pk * (r.name === 'rise' ? 1 : 0)), T = r.T, pts = [], N = 30;
    for (let i = 0; i <= N; i++) {
      const u = i / N;                                              // 0 = head … 1 = tail
      const gx = -430 + u * 900, gy = -52 + Math.sin(u * 9 + T * 0.7) * 16 * (0.3 + u), sway = Math.sin(u * 9 - T * 0.9) * 34 * u;
      // reared: the front third climbs in an S (out, back over itself, forward again at the top)
      const q = clamp(1 - u / 0.46), e = q * q * (3 - 2 * q);
      const rx = -150 + 170 * Math.sin(q * Math.PI * 1.25) + Math.sin(T * 1.1) * 14 * q, ry = -52 - 560 * e - 40 * Math.sin(q * Math.PI);
      pts.push([lerp(gx + sway * 0.3, lerp(gx, rx, clamp(q * 3)) , k * (q > 0 ? 1 : 0)), lerp(gy, ry, k * (q > 0 ? 1 : 0))]);
    }
    if (k > 0.05) { pts[0] = [pts[1][0] - 46 * k, pts[1][1] - 20 * k]; }   // the head turned forward and a little up, toward the man's face
    return pts;
  }
  const dunW = (u) => lerp(118, 26, Math.pow(u, 1.5)) * (u < 0.08 ? 0.72 + u * 3.5 : 1);
  CH.define({ id: 'dundubha', rule: DUN, rig: (P) => { const r = base(P); r.speak = P.ex.speak || 0; r.blink = KIT.act ? KIT.act.blink(P.T, 0.31) : 0; return r; }, bounds: () => [-560, -760, 540, 50], defaultPose: 'rise',
    shape: (g, color, P, r) => { const pts = dunPts(r); g.fillStyle = color; g.beginPath(); ribbonPath(g, pts, dunW); g.fill(); g.beginPath(); snakeHead(g, pts, 78); g.fill(); },
    ornaments: (g, P, r, a) => { const pts = dunPts(r); snakeMarks(g, pts, P, r, DUN, { belly: '#e8e0b0', mark: '#5a4a22', w: dunW, step: 2 }); snakeFace(g, pts, 78, r, a, { seed: 1 }); },
    face: (P, r) => { const p = dunPts(r)[0]; return [p[0], p[1], 90]; },
    bible: bib('The old dundubha', 'A harmless old snake lying in Ruru\'s path; he speaks, and is the sage Sahasrapat under a curse (CE 1.9–11).', 'Drab straw-brown with a pale belly and dull diamonds; a mild almond eye; never Takshaka\'s green or jewels (he is no naga king).') });

  const VIP = { fill: '#0a0610', lit: '#5a4a70', litGain: 0.9, rim: ['#b0ffa0', '#f0fff0'], inner: null, innerA: 0, glow: 0, rimW: 0.7, ornament: ['#b0ffa0', '#ffffff'], ornamentA: [0.85, 1] };
  function vipPts(r) {
    const k = clamp(r.name === 'strike' ? r.pk : 0), pts = [], N = 22;
    for (let i = 0; i <= N; i++) { const u = i / N, x = -300 + u * 620, y = -40 + Math.sin(u * 10 + 0.6) * 22 * (0.4 + 0.6 * u); const sx = -430 + u * 520, sy = -40 - 190 * Math.sin(Math.PI * clamp(1 - u * 1.6)) ; pts.push([lerp(x, sx, clamp(k * 1.5 - u * 0.5)), lerp(y, sy, clamp(k * 1.5 - u * 0.5))]); }
    return pts;
  }
  const vipW = (u) => lerp(74, 16, Math.pow(u, 1.3)) * (u < 0.1 ? 0.7 + u * 3 : 1);
  CH.define({ id: 'viper', rule: VIP, rig: base, bounds: () => [-520, -330, 360, 50], defaultPose: 'strike',
    shape: (g, color, P, r) => { const pts = vipPts(r); g.fillStyle = color; g.beginPath(); ribbonPath(g, pts, vipW); g.fill(); g.beginPath(); snakeHead(g, pts, 62); g.fill(); },
    ornaments: (g, P, r, a) => { const pts = vipPts(r); snakeMarks(g, pts, P, r, VIP, { belly: '#8a80a0', mark: '#b0ffa0', w: vipW, step: 2, zig: true }); snakeFace(g, pts, 62, r, a, { eye: '#c8ff5a', seed: 3, tongue: r.name === 'strike' ? r.pk * 0.6 : 0 }); },
    bible: bib('The snake in the grass', 'Asleep, stretched across the path; Pramadvara steps on it and it bites her (CE 1.8).', 'Night-violet with a venom-green zig-zag and a green eye; a thick spade head.') });

  // ── the hawk ──
  const HAWK = { fill: '#140c06', lit: '#a8743a', litGain: 0.95, rim: ['#ffe0a0', '#ffffff'], inner: null, innerA: 0, glow: 0, rimW: 0.7, ornament: ['#fff0c0', '#ffffff'], ornamentA: [0.7, 1] };
  CH.define({ id: 'hawk', rule: HAWK, rig: base, bounds: () => [-620, -620, 620, 420], defaultPose: 'fly',
    shape: (g, color, P, r) => {
      const f = Math.sin(r.ph), up = -f * 300; g.fillStyle = color;
      g.beginPath(); g.ellipse(0, -100, 210, 74, -0.08, 0, TAU); g.fill();
      g.beginPath(); g.moveTo(-170, -130); g.quadraticCurveTo(-260, -170, -300, -120); g.lineTo(-340, -104); g.lineTo(-296, -92); g.quadraticCurveTo(-240, -70, -170, -80); g.closePath(); g.fill();   // head and beak
      for (const s of [1, 0.82]) { g.beginPath(); g.moveTo(-90, -130); g.bezierCurveTo(-20 * s, -260 + up * 0.6, 180 * s, -260 + up * s, 420 * s, -200 + up * s); g.lineTo(380 * s, -150 + up * 0.85 * s); g.lineTo(320 * s, -120 + up * 0.7 * s); g.lineTo(240 * s, -100 + up * 0.5 * s); g.lineTo(120, -80); g.closePath(); g.fill(); }
      g.beginPath(); g.moveTo(170, -120); g.lineTo(420, -60); g.lineTo(400, -20); g.lineTo(360, -50); g.lineTo(340, 0); g.lineTo(170, -70); g.closePath(); g.fill();                                 // tail
      g.beginPath(); limb(g, [[-20, -40], [-40, 30], [-70, 60]], [26, 16, 10]); g.fill();
      if (r.po.packet) { g.beginPath(); g.ellipse(-80, 92, 56, 30, 0.3, 0, TAU); g.fill(); }
    },
    ornaments: (g, P, r, a, color) => {
      blocks(g, P, r, HAWK, (tone) => { g.fillStyle = tone('#f0e0c0'); g.beginPath(); g.ellipse(-20, -70, 170, 36, -0.08, 0, TAU); g.fill(); if (r.po.packet) { g.fillStyle = tone('#5ab04a'); g.beginPath(); g.ellipse(-80, 92, 56, 30, 0.3, 0, TAU); g.fill(); } });
      g.globalAlpha *= a; g.fillStyle = '#ffd040'; g.beginPath(); g.arc(-246, -128, 12, 0, TAU); g.fill(); g.fillStyle = '#1a0a04'; g.beginPath(); g.arc(-248, -128, 6, 0, TAU); g.fill();
      g.fillStyle = color; g.beginPath(); g.moveTo(-300, -120); g.lineTo(-340, -104); g.lineTo(-296, -92); g.closePath(); g.fill();
    },
    bible: bib('The king\'s hawk', 'It carries the king\'s seed in a leaf toward the queen; another hawk attacks it over the Yamuna (CE 1.57).', 'Tawny with a cream breast; a gold eye.') });

  // ── the fish ──
  const FISH = { fill: '#0a1620', lit: '#b8ccd8', litGain: 0.95, rim: ['#d8f4ff', '#ffffff'], inner: null, innerA: 0, glow: 0.2, rimW: 0.7, ornament: ['#ffffff', '#ffffff'], ornamentA: [0.6, 1] };
  CH.define({ id: 'fish', rule: FISH, rig: base, bounds: () => [-620, -420, 640, 120], defaultPose: 'swim',
    before: (ctx, P, r, k) => KIT.glow(ctx, P.x, P.y - 160 * P.s, 520 * P.s, '#d8f0ff', 0.3 * k),
    shape: (g, color, P, r) => {
      const wag = Math.sin(r.ph) * 60; g.fillStyle = color;
      g.beginPath(); g.moveTo(-520, -170); g.bezierCurveTo(-400, -340, 60, -360, 300, -200 + wag * 0.3); g.bezierCurveTo(60, -20, -400, -20, -520, -170); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(270, -196 + wag * 0.3); g.quadraticCurveTo(420, -300 + wag, 520, -330 + wag); g.quadraticCurveTo(460, -190 + wag, 530, -50 + wag); g.quadraticCurveTo(410, -100 + wag, 270, -196 + wag * 0.3); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(-200, -320); g.quadraticCurveTo(-60, -430, 100, -300); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(-160, -60); g.quadraticCurveTo(-100, 40 + wag * 0.3, -20, -50); g.closePath(); g.fill();
    },
    ornaments: (g, P, r, a, color) => {
      blocks(g, P, r, FISH, (tone) => { g.fillStyle = tone('#f4fbff'); g.beginPath(); g.ellipse(-140, -120, 300, 60, 0.02, 0, TAU); g.fill(); });
      g.globalAlpha *= a * 0.7; g.strokeStyle = color; g.lineWidth = 3;
      for (let i = 0; i < 22; i++) { const x = -330 + (i % 8) * 70 + (Math.floor(i / 8) % 2) * 35, y = -250 + Math.floor(i / 8) * 54; g.beginPath(); g.arc(x, y, 30, 0.3, 1.9); g.stroke(); }
      g.globalAlpha = a; g.fillStyle = '#fff8e0'; g.beginPath(); g.arc(-420, -196, 20, 0, TAU); g.fill(); g.fillStyle = '#0a0a14'; g.beginPath(); g.arc(-424, -196, 10, 0, TAU); g.fill();
      g.strokeStyle = '#0a0a14'; g.lineWidth = 4; g.beginPath(); g.arc(-380, -180, 60, -0.9, 0.9); g.stroke();
    },
    bible: bib('The fish of the Yamuna', 'The apsara Adrika, turned into a fish by a curse; she swallows the king\'s seed and bears twins, and is freed (CE 1.57).', 'Silver with a pearl glow.') });

  // ── Agni as the witness: the household fire. NO FACE (visual review of kit 41): as in episodes 1–40 the fire acts through
  //    its shape, height and colour: it leans toward who speaks, sinks and darkens when cursed, and burns clear gold-white
  //    once Brahma has spoken. The flame is the series' own (KIT.fire: five nested crowns of S-curved tongues, a cream core). ──
  function hearthfire(ctx, o = {}) {
    const x = o.x ?? 540, y = o.y ?? 1500, s = o.scale ?? 1, T = o.t || 0, k = clamp(o.k ?? 1, 0, 1.6), pure = clamp(o.pure || 0), dark = clamp(o.dark || 0);
    KIT.fire.altar(ctx, x, y - 96 * s, 470 * s, T, { light: 0.5 + 0.5 * Math.min(1, k) });
    if (k > 0.03) {
      const h = 640 * s * k, b = R.buffer('hearthfire' + (o.key || ''), 1100, 1300), g = b.ctx;
      b.clear(); g.translate(550 - x, 1250 - (y - 100 * s));
      KIT.fire.draw(g, x, y - 100 * s, h, T, { lean: o.lean || 0, intensity: 1, width: 360 * s * (0.6 + 0.4 * Math.min(1, k)), seed: 41, glow: 0 });
      R.resetCtx(g);
      if (pure > 0.01) { g.globalCompositeOperation = 'source-atop'; g.globalAlpha = 0.62 * pure; g.fillStyle = '#fff6d8'; g.fillRect(0, 0, 1100, 1300); }
      if (dark > 0.01) { g.globalCompositeOperation = 'source-atop'; g.globalAlpha = 0.6 * dark; g.fillStyle = '#3a0a0a'; g.fillRect(0, 0, 1100, 1300); }
      KIT.glow(ctx, x, y - 100 * s - h * 0.4, h * 1.7, pure > 0.5 ? '#fff0c0' : '#f08a24', 0.4 * Math.min(1, k) * (1 - 0.6 * dark) * KIT.flicker(T, 5));
      ctx.drawImage(b.canvas, x - 550, y - 100 * s - 1250, 1100, 1300);
      KIT.embers(ctx, T, { x, y: y - 100 * s - h * 0.5, spread: 220 * s, rate: 9 * k * (1 - dark * 0.7), life: 2.2, rise: 240 * s, sway: 40, size: 3 * s, alpha: 0.8 * Math.min(1, k), seed: 4141 });
    } else {
      ctx.save(); for (let i = 0; i < 9; i++) { ctx.globalAlpha = 0.3 + 0.25 * Math.sin(T * 2 + i); ctx.fillStyle = i % 2 ? '#7a2a10' : '#3a2018'; ctx.beginPath(); ctx.arc(x + (-160 + i * 40) * s, y - 104 * s, 13 * s, 0, TAU); ctx.fill(); } ctx.restore();
      for (let i = 0; i < 3; i++) { const u = (T * 0.12 + i / 3) % 1; ctx.save(); ctx.globalAlpha = 0.22 * (1 - u); ctx.fillStyle = '#9a9aa8'; ctx.beginPath(); ctx.ellipse(x + Math.sin(T * 0.5 + i) * 40 * u * s, y - (140 + u * 620) * s, (40 + 110 * u) * s, (30 + 60 * u) * s, 0, 0, TAU); ctx.fill(); ctx.restore(); }
    }
  }
  CH.hearthfire = { id: 'hearthfire', draw: hearthfire, poses: [], bible: bib('Agni, the witness', 'The household fire, witness of every rite: asked whose wife Puloma is, he will not lie; cursed for it, he withdraws from every sacrifice until Brahma makes whatever he burns pure (CE 1.5–7).', 'He IS the light, and has no face: the series\' layered flame on its brick altar; it leans, sinks, darkens, and burns clear gold-white once purified.') };
  CH.ROSTER.push('boar', 'dundubha', 'viper', 'hawk', 'fish');
})();
