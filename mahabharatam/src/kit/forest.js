/*
 * KIT.forest · mural trees and a layered forest you can fly through.
 *
 *   KIT.forest.makeTree(seed, o)         → tree geometry (local units: base (0,0), top (0,-1))
 *   KIT.forest.drawTree(g, tree, x, y, h, col, rimCol, rimDx)
 *        flat two-tone painting: a lit edge on the side facing the light
 *   KIT.forest.build(seed, o)            → a field of trees [{ tree, x, z }] for fly-throughs
 *   KIT.forest.project(p, cam)           world (x, y, z) → screen [sx, sy, scale]
 *   KIT.forest.depthColor(t, nearCol, farCol, fogCol) color by depth 0 (near)..1 (far)
 *
 * Trees are vectors (crisp at any distance): a tapering trunk, a few
 * branches, and tiers of scalloped leaf clumps, the way Kerala murals paint
 * foliage. Pure: geometry is built once from seeds.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT;
  const { clamp, lerp, rng } = R;

  function makeTree(seed, o = {}) {
    const r = rng(seed * 7919 + 13);
    const kind = o.kind || (r() < 0.25 ? 'palm' : 'tall');
    const bend = (r() - 0.5) * 0.12;
    const trunkW = o.trunkW || r.range(0.035, 0.055);
    const clusters = [], branches = [];
    if (kind === 'palm') {
      // a toddy-palm silhouette: thin trunk, a crown of fronds
      for (let i = 0; i < 11; i++) {
        const a = -Math.PI / 2 + (i / 10 - 0.5) * 3.1 + (r() - 0.5) * 0.15;
        clusters.push({ frond: true, a, len: r.range(0.14, 0.2), dx: bend, dy: -1 });
      }
    } else {
      const tiers = o.tiers || 4 + Math.floor(r() * 3);
      for (let k = 0; k < tiers; k++) {
        const u = k / (tiers - 1);
        const y = lerp(-0.62, -0.99, u);
        const spread = lerp(0.2, 0.06, u) * (0.8 + 0.4 * r());
        const n = u > 0.8 ? 1 : 2;
        for (let j = 0; j < n; j++) {
          const side = n === 1 ? 0 : (j / (n - 1) - 0.5) * 2;
          const cx = side * spread + bend * (1 + y) * -1 + (r() - 0.5) * 0.03;
          const cy = y + (r() - 0.5) * 0.03 + Math.abs(side) * 0.03;
          const rx = lerp(0.085, 0.05, u) * (0.8 + 0.45 * r()), ry = rx * r.range(0.5, 0.7);
          clusters.push({ cx, cy, rx, ry, bumps: 7 + Math.floor(r() * 5), seed: Math.floor(r() * 1e6) });
          if (Math.abs(side) > 0.2) branches.push([[bend * (1 + y) * -1, cy + 0.07], [cx * 0.8, cy + 0.01]]);
        }
      }
    }
    return { kind, bend, trunkW, clusters, branches };
  }

  function trunkPath(g, t) {
    const N = 10;
    const L = [], Rr = [];
    for (let i = 0; i <= N; i++) {
      const s = i / N, y = -s * (t.kind === 'palm' ? 1 : 0.95);
      const x = -t.bend * s * s * (t.kind === 'palm' ? -3 : 1);
      const w = t.trunkW * lerp(1, t.kind === 'palm' ? 0.55 : 0.3, s) * (1 + (s < 0.06 ? (0.06 - s) * 9 : 0));
      L.push([x - w / 2, y]); Rr.push([x + w / 2, y]);
    }
    g.moveTo(L[0][0], L[0][1]);
    for (const p of L) g.lineTo(p[0], p[1]);
    for (let i = N; i >= 0; i--) g.lineTo(Rr[i][0], Rr[i][1]);
    g.closePath();
    for (const b of t.branches) {
      const [a, c] = b, w = t.trunkW * 0.12;
      g.fill(); g.beginPath();
      g.moveTo(a[0], a[1] - w); g.quadraticCurveTo((a[0] + c[0]) / 2, a[1] - 0.05, c[0], c[1] - w * 0.5);
      g.lineTo(c[0], c[1] + w * 0.5); g.quadraticCurveTo((a[0] + c[0]) / 2, a[1] - 0.03, a[0], a[1] + w); g.closePath();
    }
  }
  function foliagePath(g, t, ox = 0, oy = 0) {
    for (const c of t.clusters) {
      if (c.frond) {
        const bx = -t.bend * -3 + ox, by = -1 + oy;
        const ex = bx + Math.cos(c.a) * c.len, ey = by + Math.sin(c.a) * c.len * 0.8 + c.len * 0.25;
        const mx = (bx + ex) / 2 + Math.cos(c.a - Math.PI / 2) * 0.012, my = (by + ey) / 2 - 0.03;
        g.moveTo(bx, by);
        g.quadraticCurveTo(mx, my - 0.012, ex, ey + 0.03);
        g.quadraticCurveTo(mx, my + 0.018, bx, by + 0.008);
        g.closePath();
      } else KIT.scallopPath(g, c.cx + ox, c.cy + oy, c.rx, c.ry, c.bumps, c.seed, 0.24);
    }
  }

  /**
   * Draw a tree whose base is at screen (x, y) and height h px.
   * col = body colour; rimCol = lit-edge colour (or null); rimPx = [dx, dy] of the
   * lit edge in SCREEN px (constant width at any distance); detail = colour of the
   * mural leaf-scale strokes inside each clump (or null).
   */
  function drawTree(g, t, x, y, h, col, rimCol, rimPx = [-3, -2], detail = null) {
    g.save();
    g.translate(x, y);
    g.scale(h, h);
    const rx = rimPx[0] / h, ry = rimPx[1] / h;
    if (rimCol) {
      g.fillStyle = rimCol;
      g.beginPath(); foliagePath(g, t, rx, ry); g.fill();
      g.beginPath(); g.save(); g.translate(rx, 0); trunkPath(g, t); g.restore(); g.fill();
    }
    g.fillStyle = col;
    g.beginPath(); trunkPath(g, t); g.fill();
    g.beginPath(); foliagePath(g, t); g.fill();
    if (detail && h > 300) {
      // leaf scales: nested arcs inside each clump, like a mural painter's brush
      g.strokeStyle = detail;
      g.lineWidth = 2.2 / h;
      g.beginPath();
      for (const c of t.clusters) {
        if (c.frond) continue;
        for (let k = 0; k < 5; k++) {
          const u = (k + 0.5) / 5;
          const cx = c.cx + (u - 0.5) * c.rx * 1.3, cy = c.cy + c.ry * (0.15 + 0.25 * Math.sin(u * 7 + c.seed));
          const r = c.rx * 0.28;
          g.moveTo(cx - r, cy); g.quadraticCurveTo(cx, cy - r * 0.9, cx + r, cy);
        }
      }
      g.stroke();
    }
    g.restore();
  }

  /** A forest of trees on both sides of a path along +z. */
  function build(seed, o = {}) {
    const r = rng(seed);
    const out = [];
    const n = o.count || 46, z0 = o.z0 ?? 1.5, z1 = o.z1 ?? 34;
    for (let i = 0; i < n; i++) {
      const z = lerp(z0, z1, Math.pow(i / (n - 1), 1.1)) + r.range(-0.4, 0.4);
      const side = i % 2 ? 1 : -1;
      const x = side * r.range(o.gapMin || 0.9, o.gapMax || 3.6) + (o.pathX ? o.pathX(z) : 0);
      out.push({ tree: makeTree(seed * 100 + i, { kind: r() < (o.palms ?? 0.18) ? 'palm' : 'tall' }), x, z, h: r.range(o.hMin || 5.5, o.hMax || 9), id: i });
    }
    out.sort((a, b) => b.z - a.z);
    return out;
  }

  function project([x, y, z], cam) {
    const dz = z - cam.z;
    const s = cam.f / Math.max(0.05, dz);
    return [cam.cx + (x - cam.x) * s, cam.cy + (cam.y - y) * s, s];
  }

  function depthColor(t, nearCol, farCol, fogCol, fog = 0) {
    const [a, b, c] = R.mixRgb(nearCol, farCol, clamp(t));
    const F = R.hexToRgb(fogCol);
    const k = clamp(fog);
    return `rgb(${lerp(a, F[0], k) | 0},${lerp(b, F[1], k) | 0},${lerp(c, F[2], k) | 0})`;
  }

  KIT.forest = { makeTree, drawTree, build, project, depthColor, trunkPath, foliagePath };
})();
