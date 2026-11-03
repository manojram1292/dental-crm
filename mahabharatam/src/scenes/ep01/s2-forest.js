/*
 * Line "forest" · "…a storyteller walked into the Naimisha forest."
 *
 * Dawn. The camera flies forward between tall mural trees (vector, layered by
 * depth: near ones soot-black with a rose rim of dawn, far ones melting into
 * rose mist). Fireflies drift close to camera. Ahead, where the path meets a
 * cross-path, a lone figure with a staff walks left in profile, small against
 * the bright mist: toward a thin column of smoke and a warm point of fire on
 * the horizon, the ashram he is heading for.
 * Dissolves in from the hook's black (fadeIn).
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT;
  const { clamp, lerp, E, PAL } = R;
  const F = KIT.forest;

  const ZF = 12.2;                       // the cross-path where he walks
  let TREES = null;

  function cam(p) {
    const k = 0.72 * p + 0.28 * E.inOutSine(p);
    return { x: 0.1 * Math.sin(p * 2.2), y: 1.05, z: lerp(0, 6.8, k), f: 1000, cx: 540, cy: 1130 };
  }
  const pathX = (z) => 0.35 * Math.sin(z * 0.28);

  R.scene({
    id: 'forest',
    fadeIn: 0.75,
    init() {
      TREES = F.build(77, { count: 64, z0: 1.2, z1: 40, gapMin: 1.15, gapMax: 5.5, pathX, hMin: 13, hMax: 21, palms: 0.18 })
        .filter((t) => !(t.z > ZF - 1.6 && t.z < ZF + 2.2 && Math.abs(t.x) < 4.2) && !(t.z >= ZF + 2.2 && t.z < ZF + 14 && Math.abs(t.x) < 2.6));
    },
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur, 0, 1.3);
      const c = cam(p);
      const hy = c.cy - (c.y - 0) * 0 ;
      // sky: dawn, deep indigo to rose to saffron at the horizon
      KIT.vgrad(ctx, 0, hy + 10, [[0, '#0d0f2a'], [0.3, '#252858'], [0.58, '#6a4a74'], [0.8, '#c47862'], [0.94, '#eaa66a'], [1, '#f6c784']]);
      KIT.glow(ctx, 600, hy, 900, '#ffb070', 0.45, 'lighter', 0.42);
      // the ashram's fire on the far horizon, and its smoke column
      const fx = 300, fl = KIT.flicker(T, 1);
      KIT.smoke.draw(ctx, fx, hy - 6, T, { h: 760, w: 26, strands: 2, alpha: 0.35, color: '#9b7f93', speed: 0.6, seed: 5, curls: 0.5 });
      // ground
      KIT.vgrad(ctx, hy, R.H, [[0, '#4a3036'], [0.12, '#2b1c22'], [1, '#0b0709']]);

      // draw list, far → near: trees, mist bands, path pieces, the walker
      const items = [];
      for (const tr of TREES) if (tr.z - c.z > 0.35) items.push({ z: tr.z, kind: 'tree', tr });
      for (const z of [7, 10.5, 15, 21, 28, 36]) if (z - c.z > 0.6) items.push({ z, kind: 'mist' });
      items.push({ z: ZF, kind: 'walker' });
      items.sort((a, b) => b.z - a.z);

      // the path: a pale earthen strip into the cross-path, then the cross-path itself
      ctx.save();
      const segs = 26, Lp = [], Rp = [];
      for (let i = 0; i <= segs; i++) {
        const z = lerp(c.z + 0.4, ZF, i / segs), x = pathX(z), w = 0.75;
        Lp.push(F.project([x - w, 0, z], c)); Rp.push(F.project([x + w, 0, z], c));
      }
      ctx.beginPath(); ctx.moveTo(Lp[0][0], Lp[0][1]);
      for (const q of Lp) ctx.lineTo(q[0], q[1]);
      for (let i = Rp.length - 1; i >= 0; i--) ctx.lineTo(Rp[i][0], Rp[i][1]);
      ctx.closePath();
      const pg = ctx.createLinearGradient(0, R.H, 0, hy);
      pg.addColorStop(0, '#24160f'); pg.addColorStop(0.75, '#7a5244'); pg.addColorStop(1, '#c48a6c');
      ctx.fillStyle = pg; ctx.fill();
      ctx.restore();

      for (const it of items) {
        if (it.kind === 'tree') {
          const tr = it.tr, dz = tr.z - c.z;
          const [sx, sy, s] = F.project([tr.x, 0, tr.z], c);
          const hpx = tr.h * s;
          if (sx < -hpx * 0.6 || sx > R.W + hpx * 0.6) continue;
          const d = clamp((dz - 1) / 26);
          const col = F.depthColor(d, '#0b090e', '#5a4a68', '#e0a684', Math.pow(d, 1.1) * 0.78);
          const rim = F.depthColor(d, '#d27c5a', '#e8a07a', '#f0b08a', d * 0.5);
          const side = tr.x < c.x ? 1 : -1;
          // trees closer than ~2 units fade so the camera passes cleanly through
          const a = clamp((dz - 0.35) / 0.9);
          ctx.globalAlpha = a;
          const rw = lerp(5, 2, d);
          F.drawTree(ctx, tr.tree, sx, sy + 4, hpx, col, rim, [side * rw, -rw * 0.5], d < 0.5 ? F.depthColor(d, '#2a1f2a', '#5a4a66', '#d49a80', 0.1) : null);
          ctx.globalAlpha = 1;
        } else if (it.kind === 'mist') {
          const [, sy, s] = F.project([0, 0, it.z], c);
          const hh = 1.3 * s;
          const g = ctx.createLinearGradient(0, sy - hh * 1.4, 0, sy + hh * 0.3);
          const a = 0.32 * clamp((it.z - c.z - 0.6) / 3);
          g.addColorStop(0, 'rgba(214,150,132,0)'); g.addColorStop(0.65, `rgba(214,150,132,${a})`); g.addColorStop(1, 'rgba(214,150,132,0)');
          ctx.fillStyle = g; ctx.fillRect(0, sy - hh * 1.4, R.W, hh * 1.7);
        } else if (it.kind === 'walker') {
          const dist = 0.48 * (t + 0.6);
          const wx = 1.25 - dist;
          const [sx, sy, s] = F.project([wx, 0, ZF], c);
          const sc = (1.78 * s) / 1040;
          KIT.characters.sauti.draw(ctx, {
            x: sx, y: sy, scale: sc, pose: { name: 'walk', phase: (dist / 0.72) * Math.PI, stride: 1, wind: 0.9 },
            light: { dir: Math.atan2(-1.2, -2.2), intensity: 0.78, front: 0 }, t: T, key: 'walker',
          });
        }
      }
      // the ashram's fire: its light reaches through the trees
      KIT.glow(ctx, fx, hy - 8, 200, PAL.saffron, 0.5 * fl);
      KIT.glow(ctx, fx, hy - 8, 46, '#ffd27a', 0.9 * fl);
      KIT.glow(ctx, fx, hy - 8, 10, '#fff4d0', 1);
      // fireflies: near ones swell outward as we fly forward
      ctx.save();
      const z = 1 + 0.55 * p;
      ctx.translate(540, 1150); ctx.scale(z, z); ctx.translate(-540, -1150);
      KIT.fireflies(ctx, T, { box: [40, 700, 1000, 900], count: 30, seed: 21, size: 2.6, alpha: 0.9 });
      ctx.restore();
      KIT.fireflies(ctx, T, { box: [100, 950, 880, 250], count: 14, seed: 33, size: 1.6, alpha: 0.7 });
      // a breath of warm light from the dawn
      KIT.glow(ctx, 540, hy, 1200, '#f0a070', 0.12, 'screen', 0.6);
    },
    post: () => ({ bloom: 0.35, vignette: 0.5, paper: 0.3 }),
  });
})();
