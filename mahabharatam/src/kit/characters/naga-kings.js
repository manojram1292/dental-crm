/*
 * CHARACTERS · THE SERPENT KINGS: VASUKI `vasuki` and ANANTA (Shesha) `ananta`
 *
 * VASUKI (episodes 11–16; again in the Astika parva): king of the serpents, the churning
 * ROPE wound round Mount Mandara (CE 1.16); fire and smoke pour from his mouths as he is
 * hauled. ANANTA (Shesha) (episode 12): the eldest serpent, who at Brahma's and Narayana's
 * word uproots Mount Mandara (CE 1.16).
 *
 * Not a plain painted snake (episodes 7–10's weakness): each is built as a mural naga king,
 * a heavy body of real thickness tapering to a long tail, with a BANDED BELLY (pale cross-
 * plates on the underside), a DIAMOND CHAIN pattern down the back, a broad spread HOOD
 * with spectacle marks and a crown-jewel; Ananta has seven hoods in a fan.
 *
 * The body follows a PATH (any list of points, head first), so the same module draws a
 * serpent rearing (`rise`, the default S-curve), lying (`coil`), or wound round a mountain
 * as a rope (`rope`: pose.path from the scene, with pose.head / pose.tail saying whether
 * this stretch ends in the head or the tail; the churning draws the back and front of each
 * turn as separate stretches).
 *
 * SIGNATURE LIGHT
 *   Vasuki: lapis-violet with gold scales. Fill #0a0820, lit #1c1848, inner #2c2470,
 *   rim #8a7aff → #ece8ff, glow 0.8, ornaments #e8b84a → #fff0b8, a ruby crown-jewel.
 *   Ananta: the white serpent. Fill #d8d0c0 (PALE, like the horse but warm), lit #fffaf0,
 *   inner #f4ecd8, rim #ffd890 → #fffbe8 (gold), glow 0.9, ornaments #c89830 → #fff0b8.
 *
 * (x, y) = the origin of the path (screen px); scale multiplies the path and the widths.
 * The default `rise` pose: the head ≈ 900 units above the coils, faces LEFT.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, CH = KIT.characters;
  const { TAU, lerp, clamp } = R;
  const { cut, limbOutline } = CH;

  function defaultPath(name, T, k) {
    const pts = [];
    if (name === 'coil') {
      for (let i = 0; i <= 40; i++) { const u = i / 40, a = u * TAU * 1.6 + 0.4; pts.push([Math.cos(a) * (360 - u * 140), -60 - Math.sin(a) * (120 - u * 40) - (1 - u) * 260]); }
      return pts;
    }
    // rise: the head high and to the left, an S down to a heavy coil on the ground
    const sw = Math.sin(T * 1.3) * 18;
    for (let i = 0; i <= 44; i++) {
      const u = i / 44;
      if (u < 0.55) { const v = u / 0.55; pts.push([-120 + Math.sin(v * 3.4) * 150 * v + sw * (1 - v), lerp(-900 * (0.6 + 0.4 * k), -80, v)]); }
      else { const v = (u - 0.55) / 0.45, a = v * TAU * 1.1; pts.push([Math.cos(a) * 320 * (1 - 0.35 * v) + 40, -70 - Math.sin(a) * 70]); }
    }
    return pts;
  }

  function makeRig(kind) {
    return function rig(P) {
      const po = P.po;
      const r = { T: P.T, kind, name: po.name, k: po.k };
      r.path = po.name === 'rope' && po.path ? po.path : defaultPath(po.name, P.T, po.k);
      r.head = po.name === 'rope' ? !!po.head : true;
      r.tail = po.name === 'rope' ? !!po.tail : true;
      r.hoods = [1, 3, 1, 5, 1, 3][((P.index % 6) + 6) % 6];
      r.w = po.w || (kind === 'ananta' ? 130 : kind === 'naga' ? [70, 80, 60, 90, 66, 76][((P.index % 6) + 6) % 6] : 110);
      r.w0 = po.w0 ?? r.w;   // width at the start of a rope stretch
      r.w1 = po.w1 ?? (r.tail ? 8 : r.w);
      r.fire = clamp(po.fire || 0);
      r.look = P.ex.look || 0;
      r.wrath = P.ex.mood === 'wrath';
      r.hoodA = r.head ? Math.atan2(r.path[0][1] - r.path[Math.min(3, r.path.length - 1)][1], r.path[0][0] - r.path[Math.min(3, r.path.length - 1)][0]) : 0;
      return r;
    };
  }

  const widths = (r) => r.path.map((_, i) => { const u = i / (r.path.length - 1); return r.tail ? lerp(r.w0, r.w1, Math.pow(u, 1.6)) : lerp(r.w0, r.w1, u); });

  function hoodPath(g, r) {
    const h = r.path[0], a = r.hoodA + r.look;
    const n = r.kind === 'ananta' ? 7 : r.kind === 'naga' ? r.hoods : 1;
    g.save(); g.translate(h[0], h[1]); g.rotate(a + Math.PI / 2);
    // (local: up = −y is the direction the head points)
    for (let i = 0; i < n; i++) {
      const off = n === 1 ? 0 : (i - (n - 1) / 2) * 0.4;
      g.save(); g.rotate(off); g.translate(0, n === 1 ? 0 : -90);
      const W = r.w * (n === 1 ? 1.6 : 0.55), H = r.w * (n === 1 ? 2.3 : 1.9);
      g.moveTo(0, 40); g.bezierCurveTo(-W, 10, -W * 0.9, -H * 0.7, -W * 0.3, -H); g.quadraticCurveTo(0, -H * 1.12, W * 0.3, -H); g.bezierCurveTo(W * 0.9, -H * 0.7, W, 10, 0, 40); cut(g);
      // the head at the top of the hood, turned forward (local −x): a broad wedge, snout out
      if (n > 1) { g.moveTo(W * 0.55, -H * 0.9); g.ellipse(0, -H * 0.95, W * 0.55, W * 0.7, 0, 0, TAU); cut(g); g.restore(); continue; }
      g.moveTo(W * 0.3, -H * 0.86); g.bezierCurveTo(W * 0.2, -H * 1.18, -W * 0.5, -H * 1.16, -W * 0.95, -H * 0.98);
      g.quadraticCurveTo(-W * 1.02, -H * 0.9, -W * 0.9, -H * 0.84); g.bezierCurveTo(-W * 0.5, -H * 0.78, 0, -H * 0.76, W * 0.3, -H * 0.86); g.closePath(); cut(g);
      g.restore();
    }
    g.restore();
  }

  function shape(g, color, P, r) {
    g.fillStyle = color;
    g.beginPath(); limbOutline(g, r.path, widths(r)); cut(g);
    if (r.head) { g.beginPath(); hoodPath(g, r); g.fill(); }
  }

  function ornaments(g, P, r, a, color) {
    if (a <= 0.01) return;
    g.globalAlpha *= a;
    const ws = widths(r), pts = r.path, n = pts.length;
    // belly plates (pale cross-bands on the near side) and the diamond chain on the back
    for (let i = 1; i < n - 1; i++) {
      const p = pts[i], q = pts[i + 1], dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy) || 1;
      const nx = -dy / l, ny = dx / l, w = ws[i] / 2;
      if (w < 6) continue;
      const steps = Math.max(1, Math.round(l / (w * 0.55)));
      for (let s = 0; s < steps; s++) {
        const u = s / steps, x = p[0] + dx * u, y = p[1] + dy * u;
        g.strokeStyle = r.kind === 'ananta' ? 'rgba(200,150,60,0.5)' : 'rgba(255,240,200,0.32)'; g.lineWidth = Math.max(1.5, w * 0.08);
        g.beginPath(); g.moveTo(x + nx * w * 0.35, y + ny * w * 0.35); g.lineTo(x + nx * w * 0.92, y + ny * w * 0.92); g.stroke();
        if ((i * 7 + s) % 2 === 0) {
          g.fillStyle = color; const c = [x - nx * w * 0.3, y - ny * w * 0.3], d = w * 0.3;
          g.beginPath(); g.moveTo(c[0] + dx / l * d, c[1] + dy / l * d); g.lineTo(c[0] + nx * d * 0.6, c[1] + ny * d * 0.6); g.lineTo(c[0] - dx / l * d, c[1] - dy / l * d); g.lineTo(c[0] - nx * d * 0.6, c[1] - ny * d * 0.6); g.closePath(); g.fill();
        }
      }
    }
    if (r.head) {
      const h = pts[0], an = r.hoodA + r.look;
      g.save(); g.translate(h[0], h[1]); g.rotate(an + Math.PI / 2);
      const hn = r.kind === 'ananta' ? 7 : r.kind === 'naga' ? r.hoods : 1;
      for (let i = 0; i < hn; i++) {
        const off = hn === 1 ? 0 : (i - (hn - 1) / 2) * 0.4;
        g.save(); g.rotate(off); g.translate(0, hn === 1 ? 0 : -90);
        const W = r.w * (hn === 1 ? 1.6 : 0.55), H = r.w * (hn === 1 ? 2.3 : 1.9);
        // spectacle marks on the hood, eyes, the crown-jewel
        // the hood's inner scales (concentric arcs) and its rim band
        g.strokeStyle = color; g.globalAlpha *= 0.55; g.lineWidth = Math.max(2, W * 0.035);
        for (const k of [0.45, 0.65, 0.85]) { g.beginPath(); g.moveTo(-W * k * 0.9, -H * 0.15); g.bezierCurveTo(-W * k, -H * 0.75, W * k, -H * 0.75, W * k * 0.9, -H * 0.15); g.stroke(); }
        g.globalAlpha /= 0.55;
        // eye on the head, and the crown-jewel on its brow
        g.fillStyle = r.wrath ? '#ff6040' : (r.kind === 'ananta' ? '#c87a20' : '#fff0b8');
        if (hn > 1) { for (const e of [-1, 1]) { g.beginPath(); g.arc(e * W * 0.22, -H * 1.0, W * 0.08, 0, TAU); g.fill(); } } else { g.beginPath(); g.ellipse(-W * 0.48, -H * 0.97, W * 0.07, W * 0.045, 0, 0, TAU); g.fill(); }
        if (i === (hn - 1) >> 1) {
          g.save(); g.fillStyle = r.kind === 'ananta' ? '#ffe9a0' : '#ff2a5a'; g.shadowColor = g.fillStyle; g.shadowBlur = R.px(W * 0.3);
          const jx = -W * 0.1, jy = -H * 1.12;
          g.beginPath(); g.moveTo(jx, jy - W * 0.14); g.lineTo(jx + W * 0.09, jy); g.lineTo(jx, jy + W * 0.06); g.lineTo(jx - W * 0.09, jy); g.closePath(); g.fill(); g.restore();
        }
        g.restore();
      }
      g.restore();
    }
  }

  function after(ctx, P, r) {
    if (r.fire <= 0.01 || !r.head) return;
    // fire and smoke from the mouth (stylised: tongues of flame and rolling smoke curls)
    const s = P.s, h = r.path[0], an = r.hoodA + r.look;
    const W = r.w * 1.6, H = r.w * 2.3;
    const mx = P.x + (h[0] + Math.cos(an) * H * 1.3) * s * (P.flip ? -1 : 1), my = P.y + (h[1] + Math.sin(an) * H * 1.3) * s;
    ctx.save(); ctx.globalAlpha = r.fire;
    KIT.glow(ctx, mx, my, 360 * s, '#ff8a30', 0.6);
    for (let i = 0; i < 9; i++) {
      const life = (r.T * 1.4 + i / 9) % 1, d = life * 520 * s, sp = (i % 3 - 1) * 0.35 + Math.sin(r.T * 3 + i) * 0.1;
      const x = mx + Math.cos(an + sp) * d, y = my + Math.sin(an + sp) * d - life * life * 160 * s;
      if (i % 2) { ctx.fillStyle = `rgba(${lerp(255, 120, life) | 0},${lerp(200, 60, life) | 0},40,${(1 - life) * 0.9})`; ctx.beginPath(); ctx.ellipse(x, y, (30 + 30 * life) * s, (16 + 10 * life) * s, an + sp, 0, TAU); ctx.fill(); }
      else { ctx.strokeStyle = `rgba(60,50,60,${(1 - life) * 0.7})`; ctx.lineWidth = 10 * s; ctx.beginPath(); ctx.arc(x, y, (24 + 70 * life) * s, 0, Math.PI * 1.5); ctx.stroke(); }
    }
    ctx.restore();
    void W;
  }

  function bounds(P, r) {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const p of r.path) { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); }
    const m = r.w * (r.head ? 3.4 : 1.2);
    return [x0 - m, y0 - m, x1 + m, y1 + m];
  }

  const poses = [{ name: 'rise', note: 'k: rearing, hood spread (default)' }, { name: 'coil' }, { name: 'rope', note: 'pose.path (screen-relative points), head/tail flags, w, fire (0..1)' }];
  CH.define({
    id: 'vasuki', rig: makeRig('vasuki'), shape, ornaments, after, bounds, defaultPose: 'rise',
    bible: {
      name: 'Vasuki, king of the serpents',
      role: 'The churning rope wound round Mandara; fire and smoke pour from his mouths as gods and asuras haul him (CE 1.16).',
      palette: { fill: '#0a0820', lit: '#1c1848', inner: '#2c2470', rimDim: '#8a7aff', rimBright: '#ece8ff', ornamentDim: '#e8b84a', ornament: '#fff0b8', jewel: '#ff2a5a' },
      proportions: 'A heavy body ≈ 110 units thick tapering to the tail; a broad single hood ≈ 350 wide. Any length (it follows a path).',
      props: ['banded pale belly plates', 'a diamond chain down the back', 'spectacle marks on the hood', 'a ruby crown-jewel', 'fire and smoke from the mouth (pose.fire)'],
      light: 'Lapis-violet with gold scales: rim #8a7aff → #ece8ff, glow 0.8; never Takshaka\'s green, Indra\'s electric blue or Kadru\'s olive.',
      poses, voice: null,
    },
    rule: { fill: '#0a0820', lit: '#1c1848', litGain: 0.8, rim: ['#8a7aff', '#ece8ff'], inner: '#2c2470', innerA: [0.85, 0.45], glow: 0.8, ornament: ['#e8b84a', '#fff0b8'], ornamentA: [0.55, 0.9] },
  });
  CH.define({
    id: 'ananta', rig: makeRig('ananta'), shape, ornaments, after, bounds, defaultPose: 'rise',
    bible: {
      name: 'Ananta (Shesha), the eldest serpent',
      role: 'At Brahma\'s and Narayana\'s word he uproots Mount Mandara with its forests (CE 1.16).',
      palette: { fill: '#d8d0c0', lit: '#fffaf0', inner: '#f4ecd8', rimDim: '#ffd890', rimBright: '#fffbe8', ornamentDim: '#c89830', ornament: '#fff0b8' },
      proportions: 'Thicker than Vasuki (≈ 130 units); seven hoods in a fan.',
      props: ['seven hoods', 'gold belly plates and back chain', 'a pale gold crown-jewel'],
      light: 'The white serpent: pale fill (#d8d0c0 → #fffaf0), gold rim #ffd890 → #fffbe8, glow 0.9.',
      poses, voice: null,
    },
    rule: { fill: '#d8d0c0', lit: '#fffaf0', litGain: 0.9, rim: ['#ffd890', '#fffbe8'], inner: '#f4ecd8', innerA: [0.5, 0.3], glow: 0.9, ornament: ['#c89830', '#fff0b8'], ornamentA: [0.6, 0.9] },
  });
  CH.ROSTER.push('vasuki', 'ananta');
  CH.define({
    id: 'naga', rig: makeRig('naga'), shape, ornaments, after, bounds, defaultPose: 'rise',
    bible: {
      name: 'The nagas, Kadru\'s serpent sons',
      role: 'Kadru\'s thousand sons: some hang from the horse\'s tail as black hairs at her order; those who refuse she curses (CE 1.18–20); Garuda carries them to Ramaniyaka (1.21–23). Six fixed variants by index (one, three or five hoods; thickness).',
      palette: { fill: '#0c1006', lit: '#24301a', inner: '#2e3a14', rimDim: '#9ad070', rimBright: '#eaffc8', ornamentDim: '#d8c060', ornament: '#fff4b8' },
      proportions: 'The serpent-king body at 60–90 units thick; one, three or five hoods by index.',
      props: ['banded belly plates and back chain (as the serpent kings)', 'one, three or five hoods'],
      light: 'Kadru\'s olive-green: rim #9ad070 → #eaffc8, glow 0.7, gold-olive scales; kin to their mother, never Takshaka\'s cold green.',
      poses, voice: 'nagas',
    },
    rule: { fill: '#0c1006', lit: '#24301a', litGain: 0.8, rim: ['#9ad070', '#eaffc8'], inner: '#2e3a14', innerA: [0.85, 0.45], glow: 0.7, ornament: ['#d8c060', '#fff4b8'], ornamentA: [0.5, 0.85] },
  });
  CH.ROSTER.push('naga');
})();
