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

  // ── the boar ──
  const BOAR = { fill: '#0a1014', lit: '#56727e', litGain: 0.95, rim: ['#8ad0d8', '#eaffff'], inner: '#22343c', innerA: [0.8, 0.4], glow: 0.7, ornament: ['#e8e0c0', '#ffffff'], ornamentA: [0.7, 1] };
  function boarShape(g, color, P, r) {
    const run = r.name === 'run' ? 1 : 0, ph = r.ph, bob = run * 16 * Math.sin(ph * 2);
    g.fillStyle = color; g.translate(0, -bob);
    for (const [x, off, back] of [[-250, 0, 0], [-170, 2.4, 0], [230, 3.1, 1], [320, 0.9, 1]]) {
      const sw = run * 0.7 * Math.sin(ph + off), kx = x + Math.sin(sw) * 120, ky = -170 + (back ? 10 : 0), fx = kx + Math.sin(sw * 1.5 - 0.2) * 150, fy = -4 - run * 50 * Math.max(0, Math.cos(ph + off));
      g.beginPath(); limb(g, [[x, -300], [kx, ky], [fx, fy + bob]], [140, 86, 48]); g.fill();
    }
    g.beginPath(); g.moveTo(430, -360);
    g.bezierCurveTo(440, -560, 150, -640, -110, -600); g.bezierCurveTo(-250, -590, -330, -520, -400, -430);
    g.bezierCurveTo(-470, -400, -560, -330, -600, -270); g.lineTo(-596, -214); g.bezierCurveTo(-540, -200, -470, -190, -400, -210);
    g.bezierCurveTo(-300, -150, 200, -130, 380, -210); g.bezierCurveTo(430, -250, 440, -310, 430, -360); g.closePath(); g.fill();
    // the ridge of bristles, the ear, the tail
    g.beginPath(); for (let i = 0; i < 13; i++) { const u = i / 12, x = lerp(-300, 330, u), y = -598 + 60 * u * u - 26 * Math.sin(u * Math.PI); const h = 70 + 40 * hash(i, 3) + run * 16 * Math.sin(ph * 2 + i); g.moveTo(x - 30, y + 20); g.lineTo(x + 22 + run * 30, y - h); g.lineTo(x + 34, y + 22); g.closePath(); } g.fill();
    g.beginPath(); g.moveTo(-350, -500); g.lineTo(-300, -620); g.lineTo(-262, -500); g.closePath(); g.fill();
    g.beginPath(); limb(g, [[420, -400], [480, -470 + run * 30 * Math.sin(ph * 3)], [520, -420]], [20, 12, 6]); g.fill();
    g.beginPath(); g.moveTo(-560, -240); g.quadraticCurveTo(-640, -300, -600, -380); g.quadraticCurveTo(-590, -300, -520, -262); g.closePath(); g.fill();   // the tusk
  }
  CH.define({ id: 'boar', rule: BOAR, rig: base, bounds: () => [-720, -760, 600, 60], defaultPose: 'run', shape: boarShape,
    ornaments: (g, P, r, a, color) => {
      const run = r.name === 'run' ? 1 : 0, bob = run * 16 * Math.sin(r.ph * 2);
      g.translate(0, -bob);
      blocks(g, P, r, BOAR, (tone) => { g.fillStyle = tone('#8aa0aa'); g.beginPath(); g.ellipse(-20, -190, 360, 44, 0, 0, TAU); g.fill(); });
      g.globalAlpha *= a; g.fillStyle = color;
      g.beginPath(); g.moveTo(-560, -240); g.quadraticCurveTo(-640, -300, -600, -380); g.quadraticCurveTo(-590, -300, -520, -262); g.closePath(); g.fill();
      g.fillStyle = '#ff2a1a'; g.beginPath(); g.ellipse(-420, -420, 16, 11, 0.3, 0, TAU); g.fill();
      g.fillStyle = '#ffe0a0'; g.beginPath(); g.arc(-424, -423, 4, 0, TAU); g.fill();
    },
    after: (ctx, P, r, k) => KIT.glow(ctx, P.x + (P.flip ? 1 : -1) * 420 * P.s, P.y - 420 * P.s, 70 * P.s, '#ff3a20', 0.5 * k),
    bible: bib('Puloman as a boar', 'The rakshasa takes a boar\'s form and carries Puloma off with the speed of mind and wind (CE 1.6).', 'Storm-slate with a teal rim, a red eye, ivory tusks.') });

  // ── snakes: a body along a curve ──
  function snakeBody(g, pts, w0, w1, head) {
    const ws = pts.map((_, i) => { const u = i / (pts.length - 1); return lerp(w0, w1, Math.pow(u, 1.6)) * (u < 0.12 ? 0.8 + u * 1.7 : 1); });
    g.beginPath(); limb(g, pts, ws); g.fill();
    const [hx, hy] = pts[0], [nx, ny] = pts[1], a = Math.atan2(hy - ny, hx - nx);
    g.save(); g.translate(hx, hy); g.rotate(a); g.beginPath(); g.ellipse(head * 0.45, 0, head, head * 0.62, 0, 0, TAU); g.fill(); g.restore();
    return a;
  }
  const DUN = { fill: '#14120a', lit: '#c8b878', litGain: 0.95, rim: ['#e0e8a0', '#fbfff0'], inner: '#3a3c20', innerA: [0.8, 0.4], glow: 0.6, ornament: ['#e8e0b0', '#ffffff'], ornamentA: [0.7, 1] };
  function dunPts(r) {
    const k = clamp(r.pk * (r.name === 'rise' ? 1 : 0)), T = r.T, pts = [];
    for (let i = 0; i <= 16; i++) {
      const u = i / 16, x = -360 + u * 820, wave = Math.sin(u * 7 + T * 0.6) * 26 * (0.3 + u);
      const lift = k * 330 * Math.pow(clamp(1 - u * 3.2), 1.5), fwd = k * 70 * Math.sin(Math.PI * clamp(1 - u * 3.2));
      pts.push([x + fwd - k * 90 * clamp(1 - u * 3), -46 - lift + wave * 0.35 * (1 - k * clamp(1 - u * 3))]);
    }
    return pts;
  }
  CH.define({ id: 'dundubha', rule: DUN, rig: (P) => { const r = base(P); r.speak = P.ex.speak || 0; r.blink = KIT.act ? KIT.act.blink(P.T, 0.31) : 0; return r; }, bounds: () => [-520, -560, 520, 40], defaultPose: 'rise',
    shape: (g, color, P, r) => { g.fillStyle = color; snakeBody(g, dunPts(r), 128, 40, 84); },
    ornaments: (g, P, r, a, color) => {
      const pts = dunPts(r);
      blocks(g, P, r, DUN, (tone) => { g.fillStyle = tone('#d8d4a0'); g.beginPath(); limb(g, pts.map(([x, y]) => [x, y + 34]), pts.map((_, i) => lerp(58, 18, i / 16))); g.fill();
        g.fillStyle = tone('#5a5a2e'); for (let i = 2; i < 15; i += 2) { g.beginPath(); g.ellipse(pts[i][0], pts[i][1] - 22, 34, 14, 0, 0, TAU); g.fill(); } });
      const [hx, hy] = pts[0], an = Math.atan2(hy - pts[1][1], hx - pts[1][0]);
      g.save(); g.translate(hx, hy); g.rotate(an); g.globalAlpha *= a;
      const lid = 1 - r.blink * 0.9;
      g.fillStyle = '#fff8e0'; g.beginPath(); g.ellipse(34, -16, 15, 11 * lid, 0, 0, TAU); g.fill();
      g.fillStyle = '#1a1206'; g.beginPath(); g.arc(37, -16, 6.5 * Math.min(1, lid + 0.2), 0, TAU); g.fill();
      g.strokeStyle = '#1a1206'; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.moveTo(14, -30); g.quadraticCurveTo(34, -40, 54, -28); g.stroke();   // an old, mild brow
      g.beginPath(); g.moveTo(92, 8); g.quadraticCurveTo(60, 16 + r.speak * 12, 30, 10); g.stroke();
      g.restore();
    },
    bible: bib('The old dundubha', 'A harmless old snake lying in Ruru\'s path; he speaks, and is the sage Sahasrapat under a curse (CE 1.9–11).', 'Drab olive with a pale belly: rim #e0e8a0 → #fbfff0; never Takshaka\'s green.') });

  const VIP = { fill: '#08060c', lit: '#4a3a5a', litGain: 0.9, rim: ['#b0ffa0', '#f0fff0'], inner: '#201830', innerA: [0.8, 0.4], glow: 0.7, ornament: ['#b0ffa0', '#ffffff'], ornamentA: [0.7, 1] };
  function vipPts(r) {
    const k = clamp(r.name === 'strike' ? r.pk : 0), pts = [];
    for (let i = 0; i <= 14; i++) { const u = i / 14, a = u * 7.2 + 0.4, rad = 150 - u * 70; const cx = Math.cos(a) * rad, cy = -40 - Math.abs(Math.sin(a)) * 30 - u * 16; const sx = -360 * (1 - u) + 60, sy = -150 * Math.sin(Math.PI * (1 - u)) - 40; const kk = clamp(k * 1.5 - u * 0.5); pts.push([lerp(cx, sx, kk), lerp(cy, sy, kk)]); }
    return pts;
  }
  CH.define({ id: 'viper', rule: VIP, rig: base, bounds: () => [-460, -330, 260, 40], defaultPose: 'strike',
    shape: (g, color, P, r) => { g.fillStyle = color; snakeBody(g, vipPts(r), 46, 16, 36); },
    ornaments: (g, P, r, a, color) => { const pts = vipPts(r); g.globalAlpha *= a; g.fillStyle = color; for (let i = 2; i < 14; i += 2) { g.beginPath(); g.ellipse(pts[i][0], pts[i][1], 9, 16, 0, 0, TAU); g.fill(); } g.fillStyle = '#c8ff5a'; g.beginPath(); g.arc(pts[0][0] + 8, pts[0][1] - 8, 6, 0, TAU); g.fill(); },
    bible: bib('The snake in the grass', 'Asleep across the path; Pramadvara steps on it and it bites her (CE 1.8).', 'Night-violet with a venom-green rim.') });

  // ── the hawk ──
  const HAWK = { fill: '#140c06', lit: '#a8743a', litGain: 0.95, rim: ['#ffe0a0', '#ffffff'], inner: '#4a2a12', innerA: [0.8, 0.4], glow: 0.7, ornament: ['#fff0c0', '#ffffff'], ornamentA: [0.7, 1] };
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
  const FISH = { fill: '#081018', lit: '#b8ccd8', litGain: 0.95, rim: ['#d8f4ff', '#ffffff'], inner: '#3a5a70', innerA: [0.8, 0.4], glow: 0.9, ornament: ['#ffffff', '#ffffff'], ornamentA: [0.6, 1] };
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

  // ── Agni as the witness: the household fire with a face ──
  function hearthfire(ctx, o = {}) {
    const x = o.x ?? 540, y = o.y ?? 1500, s = o.scale ?? 1, T = o.t || 0, k = clamp(o.k ?? 1, 0, 1.6), pure = clamp(o.pure || 0);
    const ex = o.expression || {}, e = KIT.act ? (typeof ex.emo === 'object' && ex.emo ? ex.emo : KIT.act.EMO[ex.emo || 'calm']) : null, gz = ex.gaze || [0, 0];
    const cols = [KIT.hex('#a82408', '#e8a020', pure), KIT.hex('#f0761c', '#ffe070', pure), KIT.hex('#ffd060', '#fffbe0', pure)];
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    // the altar: three stepped courses of brick
    for (let i = 0; i < 3; i++) { ctx.fillStyle = ['#5a2a14', '#7a3a1c', '#9a4a24'][i]; ctx.fillRect(-250 + i * 34, -40 - i * 40, 500 - i * 68, 42); ctx.fillStyle = 'rgba(255,220,160,0.25)'; ctx.fillRect(-250 + i * 34, -40 - i * 40, 500 - i * 68, 5); }
    if (k > 0.02) {
      KIT.glow(ctx, 0, -360, 900 * k, cols[1], 0.5 * Math.min(1, k) * KIT.flicker(T, 5));
      const H = 620 * k;
      for (let layer = 0; layer < 3; layer++) {
        ctx.fillStyle = cols[layer];
        for (let i = 0; i < 7; i++) {
          const u = (i - 3) / 3, ph = T * (2.4 + (i % 3) * 0.5) + i * 1.7 + layer, h = H * (1 - Math.abs(u) * 0.46) * (0.86 + 0.14 * Math.sin(ph)) * (1 - layer * 0.24), w = 92 * (1 - layer * 0.26) * (0.6 + 0.4 * Math.min(1, k)), bx = u * 150, lean = 22 * Math.sin(ph * 0.7) + u * 40;
          ctx.beginPath(); ctx.moveTo(bx - w, -116); ctx.bezierCurveTo(bx - w * 1.1, -116 - h * 0.45, bx - w * 0.2 + lean, -116 - h * 0.6, bx + lean * 1.5, -116 - h); ctx.bezierCurveTo(bx + w * 0.4 + lean, -116 - h * 0.55, bx + w * 1.1, -116 - h * 0.4, bx + w, -116); ctx.closePath(); ctx.fill();
        }
      }
      // the face in the fire: an eye, a brow, a mouth, drawn in ember on the bright core
      if (e && k > 0.35) {
        ctx.save(); ctx.translate(-6, -116 - H * 0.26); const fs = 1.0 * Math.min(1.2, k); ctx.scale(fs, fs); ctx.globalAlpha = clamp((k - 0.35) * 2.5);
        const lid = clamp(e.lid * (1 - (KIT.act ? KIT.act.blink(T, 0.77) : 0))), eh = 3 + 12 * lid, col = KIT.hex('#6a1404', '#8a4a08', pure);
        for (const sx of [-1, 1]) {
          const cx = sx * 44; ctx.fillStyle = '#fffbe8'; ctx.beginPath(); ctx.moveTo(cx - 26, 0); ctx.quadraticCurveTo(cx, -eh * 1.3, cx + 26, 0); ctx.quadraticCurveTo(cx, eh, cx - 26, 0); ctx.fill();
          ctx.fillStyle = col; ctx.beginPath(); ctx.arc(cx + gz[0] * 10, gz[1] * 5, Math.min(9, eh * 0.9), 0, TAU); ctx.fill();
          ctx.strokeStyle = col; ctx.lineWidth = 6; ctx.lineCap = 'round'; const bi = -26 - e.brow * 6 - e.pinch * 12 + (e.brow < 0 ? -e.brow * 14 : 0), bo = -30 - e.brow * 9 + e.pinch * 5;
          ctx.beginPath(); ctx.moveTo(cx - sx * 26, bi); ctx.quadraticCurveTo(cx, Math.min(bi, bo) - 6, cx + sx * 28, bo); ctx.stroke();
        }
        const op = e.open * 14 + (ex.speak || 0) * 14; ctx.strokeStyle = col; ctx.lineWidth = 7; ctx.fillStyle = col;
        ctx.beginPath(); ctx.moveTo(-34, 58 - e.mouth * 8); ctx.quadraticCurveTo(0, 58 + e.mouth * 12 + op, 34, 58 - e.mouth * 8); if (op > 3) { ctx.quadraticCurveTo(0, 58 - op * 0.3, -34, 58 - e.mouth * 8); ctx.fill(); } ctx.stroke();
        ctx.restore();
      }
    } else { for (let i = 0; i < 9; i++) { ctx.globalAlpha = 0.35 + 0.3 * Math.sin(T * 2 + i); ctx.fillStyle = i % 2 ? '#7a2a10' : '#3a2018'; ctx.beginPath(); ctx.arc(-160 + i * 40, -128, 14, 0, TAU); ctx.fill(); } }
    ctx.restore();
    if (k > 0.05) KIT.embers(ctx, T, { x, y: y - 300 * s, spread: 260 * s, rate: 8 * k, life: 2.2, rise: 240 * s, sway: 40, size: 3 * s, alpha: 0.8 * Math.min(1, k), seed: 4141 });
  }
  CH.hearthfire = { id: 'hearthfire', draw: hearthfire, poses: [], bible: bib('Agni, the witness', 'The household fire, witness of every rite: asked whose wife Puloma is, he will not lie; cursed for it, he withdraws from every sacrifice until Brahma makes whatever he burns pure (CE 1.5–7).', 'He IS the light: seven tongues, a face in the bright core; clear gold-white once purified.') };
  CH.ROSTER.push('boar', 'dundubha', 'viper', 'hawk', 'fish');
})();
