/*
 * S6 · 03 RENEW · film 21.0–30.0 (frames 630–899) · s6-renew.js   (storyboard REVISION 2)
 * Authored in film-local time tf = env.tf ∈ [0, 9): beats every 0.75 s, bars at 0 / 3 / 6.
 *
 *   IN  tf 0     S5's last frame, exactly: only the ember at palmSpark (960, 500), r 13, on
 *                backdrop({ gx 960, gy 540, gr 900, lift 0.7 }). No light on anything yet.
 *   0.0 – 1.5    The slender robot arm (RB.hand, slimmed in section here) is revealed in the light
 *                *under* the ember: it glides in along its own forearm from the upper right and the
 *                ember comes to rest in the cradle of its fingertips, lighting them (setGlow)
 *                before the key and rim come up. The camera begins a slow glide into a two-shot.
 *   0.4          Kicker "03 ── RENEW".   1.2  "Renew the people, / not just the tools." (→ 7.4)
 *   0.5 – 3.0    A real human hand — a LEFT hand, Adam's to the robot's right — reaches in along
 *                its forearm from the lower left and rises out of the dark into the light, relaxed →
 *                opening, palm up, the thumb easing toward the robot's fingertips across a small gap.
 *   3.0 – 6.0    Slow motion, with the camera all but still, so the seed is the only thing moving:
 *                the robot fingers tilt (palmUp → offer), the seed rolls to their tips, lifts off and
 *                floats down into the open palm below — an even pace along the curve's length
 *                (sine ramps, ≤ ~190 px/s on screen), a few embers hanging in its wake, its light
 *                over both hands. The human hand eases the last few centimetres in to receive it.
 *   6.0          The downbeat: the seed touches the palm. The skin glows warm from within around it
 *                and bleeds red through the thin parts, a soft puff of sparks; the fingers close
 *                softly round it, index first (a cradle, not a fist). The arm withdraws slowly.
 *   7.5 – 9.0    The fingers ease open; the seed rises out of the hand in screen space, straight up
 *                to riseSpark. The hands sink into darkness by 8.6; the rail fades 8.4 → 9.0.
 *   OUT tf → 9   Only the ember at riseSpark (960, 430), r 12, intensity 1, rising at 100 px per film
 *                second (S7 expects 120 px per story second, played 1.2× slower), on the backdrop.
 *
 * The human hand is the MIT WebXR generic hand (assets/left.glb: 1,360 vertices, 25 joints, all
 * parented flat to the armature). Here it is rebuilt as a posable, CPU-skinned, Loop-subdivided
 * surface: an FK chain is made over the joints (plus a 'forearm' bone; the capped wrist is
 * stretched into a forearm that falls away into the dark), the control cage is skinned with
 * linear blend skinning each draw, and two Loop levels + limit projection (precomputed stencils)
 * give a smooth 18.5k-vertex / 37k-triangle surface (~2.5 ms on the CPU). Every joint is set
 * absolutely from a pose each draw (pure). The skin is a MeshPhysicalMaterial (fairly matte, a soft
 * sheen, low IOR specular) with baked per-vertex maps (palmar/dorsal colour, flushed pads and tips,
 * darker knuckles, thickness from ray casts, crease and nail coordinates) and a shader that adds:
 * wrapped, reddened light at the terminator and red light through thin parts (subsurface-style),
 * per-vertex capsule occlusion from the other digits and the palm, soft flexion creases and palm
 * lines (read mostly as grooves), blotchy blood-under-skin colour, fine skin relief and roughness
 * breakup, a slight neutralising of the lit diffuse (warm light on warm skin otherwise reads as
 * orange rubber), and the seed's light and inner glow.
 *
 * One draw3D per frame (both hands), composited through a soft pool-of-light mask so the forearms
 * fall into darkness; 2D backdrop with out-of-focus motes behind; the seed, its sparks and the
 * type on top. ~220 ms per draw at scale 1.
 */
(function () {
  'use strict';
  const R = window.REEL, { PAL, E, seg, lerp, clamp } = R, RB = window.RB, THREE = window.THREE;
  const V3 = THREE.Vector3, M4 = THREE.Matrix4;
  const SCRIPT = document.currentScript && document.currentScript.src;
  const ASSETS = SCRIPT ? new URL('../../assets/', SCRIPT).href : 'assets/';

  // ═══ The human hand ═══════════════════════════════════════════════════════════════════════
  const FINGERS = ['index-finger', 'middle-finger', 'ring-finger', 'pinky-finger'];
  const CHAIN_F = ['metacarpal', 'phalanx-proximal', 'phalanx-intermediate', 'phalanx-distal', 'tip'];
  const CHAIN_T = ['metacarpal', 'phalanx-proximal', 'phalanx-distal', 'tip'];

  function parentName(n) {
    if (n === 'wrist') return 'forearm';
    if (n === 'forearm') return null;
    const d = n.startsWith('thumb-') ? 'thumb' : FINGERS.find((f) => n.startsWith(f + '-'));
    const chain = d === 'thumb' ? CHAIN_T : CHAIN_F;
    const k = chain.indexOf(n.slice(d.length + 1));
    return k === 0 ? 'wrist' : d + '-' + chain[k - 1];
  }

  /** Loop subdivision stencils over the level-0 vertices (closed manifold triangle mesh). */
  function loopStencils(n0, tris0, levels, limit) {
    let rows = new Array(n0);
    for (let i = 0; i < n0; i++) rows[i] = new Map([[i, 1]]);
    let F = tris0, n = n0;
    const oneRing = (F, n) => {
      const nb = Array.from({ length: n }, () => new Set());
      for (let t = 0; t < F.length; t += 3) for (let e = 0; e < 3; e++) { const a = F[t + e], b = F[t + (e + 1) % 3]; nb[a].add(b); nb[b].add(a); }
      return nb;
    };
    const compose = (idx, w) => {
      const m = new Map();
      for (let k = 0; k < idx.length; k++) for (const [j, v] of rows[idx[k]]) m.set(j, (m.get(j) || 0) + v * w[k]);
      return m;
    };
    for (let L = 0; L < levels; L++) {
      const emap = new Map(), edges = [];
      const key = (a, b) => (a < b ? a * 1048576 + b : b * 1048576 + a);
      for (let t = 0; t < F.length; t += 3) for (let e = 0; e < 3; e++) {
        const a = F[t + e], b = F[t + (e + 1) % 3], c = F[t + (e + 2) % 3], k = key(a, b);
        const id = emap.get(k);
        if (id === undefined) { emap.set(k, edges.length); edges.push([a, b, c, -1]); } else edges[id][3] = c;
      }
      const nb = oneRing(F, n);
      const next = [];
      for (let v = 0; v < n; v++) {
        const N = [...nb[v]], k = N.length, beta = k === 3 ? 3 / 16 : 3 / (8 * k);
        next.push(compose([v, ...N], [1 - k * beta, ...N.map(() => beta)]));
      }
      for (const [a, b, c, d] of edges) next.push(d < 0 ? compose([a, b], [0.5, 0.5]) : compose([a, b, c, d], [3 / 8, 3 / 8, 1 / 8, 1 / 8]));
      const NF = [];
      for (let t = 0; t < F.length; t += 3) {
        const a = F[t], b = F[t + 1], c = F[t + 2];
        const ab = n + emap.get(key(a, b)), bc = n + emap.get(key(b, c)), ca = n + emap.get(key(c, a));
        NF.push(a, ab, ca, ab, b, bc, ca, bc, c, ab, bc, ca);
      }
      rows = next; F = NF; n = next.length;
    }
    if (limit) {
      const nb = oneRing(F, n), out = [];
      for (let v = 0; v < n; v++) {
        const N = [...nb[v]], k = N.length, beta = k === 3 ? 3 / 16 : 3 / (8 * k), om = 3 / (8 * beta);
        out.push(compose([v, ...N], [om / (om + k), ...N.map(() => 1 / (om + k))]));
      }
      rows = out;
    }
    // flatten to CSR
    let nnz = 0; for (const m of rows) for (const [, v] of m) if (Math.abs(v) > 1e-6) nnz++;
    const offs = new Int32Array(n + 1), idx = new Int32Array(nnz), w = new Float32Array(nnz);
    let p = 0;
    rows.forEach((m, i) => { offs[i] = p; for (const [j, v] of m) if (Math.abs(v) > 1e-6) { idx[p] = j; w[p] = v; p++; } });
    offs[n] = p;
    return { n, tris: Uint32Array.from(F), offs, idx, w };
  }
  function applyStencil(S, src, dst, dim = 3) {
    const { n, offs, idx, w } = S;
    if (dim === 3) {
      for (let i = 0; i < n; i++) {
        let x = 0, y = 0, z = 0;
        for (let k = offs[i]; k < offs[i + 1]; k++) { const j = idx[k] * 3, q = w[k]; x += q * src[j]; y += q * src[j + 1]; z += q * src[j + 2]; }
        dst[i * 3] = x; dst[i * 3 + 1] = y; dst[i * 3 + 2] = z;
      }
    } else {
      for (let i = 0; i < n; i++) for (let d = 0; d < dim; d++) {
        let x = 0;
        for (let k = offs[i]; k < offs[i + 1]; k++) x += w[k] * src[idx[k] * dim + d];
        dst[i * dim + d] = x;
      }
    }
  }
  function vertexNormals(P, T, N) {
    N.fill(0);
    for (let t = 0; t < T.length; t += 3) {
      const a = T[t] * 3, b = T[t + 1] * 3, c = T[t + 2] * 3;
      const ux = P[b] - P[a], uy = P[b + 1] - P[a + 1], uz = P[b + 2] - P[a + 2];
      const vx = P[c] - P[a], vy = P[c + 1] - P[a + 1], vz = P[c + 2] - P[a + 2];
      const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      N[a] += nx; N[a + 1] += ny; N[a + 2] += nz; N[b] += nx; N[b + 1] += ny; N[b + 2] += nz; N[c] += nx; N[c + 1] += ny; N[c + 2] += nz;
    }
    for (let i = 0; i < N.length; i += 3) { const l = Math.hypot(N[i], N[i + 1], N[i + 2]) || 1; N[i] /= l; N[i + 1] /= l; N[i + 2] /= l; }
  }



  // Occluders for the skin's ambient occlusion: [digit, joint A, joint B, radius (model m)].
  // A vertex is not occluded by its own digit. Palm capsules lerp between joints: [a, b, t].
  const CAPS = [
    [0, 'thumb-phalanx-proximal', 'thumb-phalanx-distal', 0.0098], [0, 'thumb-phalanx-distal', 'thumb-tip', 0.0088],
    ...FINGERS.flatMap((f, i) => {
      const r = i === 3 ? 0.9 : 1;
      return [[i + 1, f + '-phalanx-proximal', f + '-phalanx-intermediate', 0.0088 * r], [i + 1, f + '-phalanx-intermediate', f + '-phalanx-distal', 0.008 * r], [i + 1, f + '-phalanx-distal', f + '-tip', 0.0072 * r]];
    }),
    [5, ['index-finger-phalanx-proximal', 'wrist', 0.12], ['pinky-finger-phalanx-proximal', 'wrist', 0.12], 0.013],
    [5, ['index-finger-phalanx-proximal', 'wrist', 0.55], ['pinky-finger-phalanx-proximal', 'wrist', 0.55], 0.015],
  ];

  // ─── Skin maps, baked per vertex in init (rest pose, model units = metres) ──────────────────
  const SKIN = {
    dorsal: '#7a5b4b',   // back of the hand: a warm medium brown
    palmar: '#ab8a7d',   // palms are lighter, pinker and a little yellow
    flush: '#a8706b',    // blood close under the pads and fingertips
    knuckle: '#654434',  // darker, drier skin over the knuckles
    nail: '#c29788',     // nail plate: pinker and paler over the nail bed
  };
  function rayTri(o, d, a, b, c) {
    const e1x = b[0] - a[0], e1y = b[1] - a[1], e1z = b[2] - a[2], e2x = c[0] - a[0], e2y = c[1] - a[1], e2z = c[2] - a[2];
    const px = d[1] * e2z - d[2] * e2y, py = d[2] * e2x - d[0] * e2z, pz = d[0] * e2y - d[1] * e2x;
    const det = e1x * px + e1y * py + e1z * pz;
    if (Math.abs(det) < 1e-12) return -1;
    const inv = 1 / det, tx = o[0] - a[0], ty = o[1] - a[1], tz = o[2] - a[2];
    const u = (tx * px + ty * py + tz * pz) * inv; if (u < 0 || u > 1) return -1;
    const qx = ty * e1z - tz * e1y, qy = tz * e1x - tx * e1z, qz = tx * e1y - ty * e1x;
    const vv = (d[0] * qx + d[1] * qy + d[2] * qz) * inv; if (vv < 0 || u + vv > 1) return -1;
    return (e2x * qx + e2y * qy + e2z * qz) * inv;
  }
  function skinAttributes({ P0, tris0, n0, S, restArr, restNor, restW, BI, foreDir, J0, W0, names }) {
    const n = S.n;
    // a smooth 'out of the palm' direction field: each bone's palmar axis (−Y), blended by the skin
    // weights. The thenar (thumb metacarpal) is palm skin, so its axis leans to the palm's.
    const wyW = new V3(), tmp = new V3();
    restW[BI.wrist].extractBasis(tmp, wyW, new V3());
    const palAxis = names.map((nm, i) => {
      const y = new V3(); restW[i].extractBasis(new V3(), y, new V3());
      const a = y.clone().negate();
      if (nm === 'thumb-metacarpal') a.addScaledVector(wyW, -1.6).normalize();
      if (nm === 'forearm' || nm === 'wrist' || nm.endsWith('-metacarpal') && !nm.startsWith('thumb')) a.copy(wyW).negate();
      return a;
    });
    const pal0 = new Float32Array(n0 * 3);
    for (let i = 0; i < n0; i++) {
      tmp.set(0, 0, 0);
      for (let k = 0; k < 4; k++) tmp.addScaledVector(palAxis[J0[i * 4 + k]], W0[i * 4 + k]);
      tmp.normalize(); pal0[i * 3] = tmp.x; pal0[i * 3 + 1] = tmp.y; pal0[i * 3 + 2] = tmp.z;
    }
    const palF = new Float32Array(n * 3); applyStencil(S, pal0, palF);
    // how much each vertex belongs to the digits' phalanges (smooth, from the skin weights)
    const phal0 = new Float32Array(n0);
    for (let i = 0; i < n0; i++) for (let k = 0; k < 4; k++) if (/phalanx|tip/.test(names[J0[i * 4 + k]])) phal0[i] += W0[i * 4 + k];
    const phal = new Float32Array(n); applyStencil(S, phal0, phal, 1);
    // thickness at each cage vertex: the distance straight in to the opposite wall of skin
    const N0 = new Float32Array(n0 * 3); vertexNormals(P0, tris0, N0);
    const thick0 = new Float32Array(n0), P = (i) => [P0[i * 3], P0[i * 3 + 1], P0[i * 3 + 2]];
    const TP = []; for (let t = 0; t < tris0.length; t += 3) TP.push([tris0[t], tris0[t + 1], tris0[t + 2], P(tris0[t]), P(tris0[t + 1]), P(tris0[t + 2])]);
    for (let i = 0; i < n0; i++) {
      const d = [-N0[i * 3], -N0[i * 3 + 1], -N0[i * 3 + 2]], o = [P0[i * 3] + d[0] * 1e-4, P0[i * 3 + 1] + d[1] * 1e-4, P0[i * 3 + 2] + d[2] * 1e-4];
      let best = 0.06;
      for (const [a, b, c, pa, pb, pc] of TP) {
        if (a === i || b === i || c === i) continue;
        const h = rayTri(o, d, pa, pb, pc);
        if (h > 2e-4 && h < best) best = h;
      }
      thick0[i] = best;
    }
    const thick = new Float32Array(n); applyStencil(S, thick0, thick, 1);

    // bone segments of each digit, in rest model space
    const DIG = [['thumb', CHAIN_T], ...FINGERS.map((f) => [f, CHAIN_F])];
    const segs = [];
    DIG.forEach(([d, chain], di) => {
      let s0 = 0;
      for (let k = 0; k < chain.length - 1; k++) {
        const ja = restW[BI[d + '-' + chain[k]]], jb = restW[BI[d + '-' + chain[k + 1]]];
        const a = new V3().setFromMatrixPosition(ja), b = new V3().setFromMatrixPosition(jb);
        const x = new V3(), y = new V3(), z = new V3(); ja.extractBasis(x, y, z);
        const len = a.distanceTo(b);
        // s: distance along the digit from its knuckle (MCP) — the metacarpal runs negative
        segs.push({ di, k, a, b, dorsal: y, side: x, len, last: k === chain.length - 2, s0: k === 0 ? -len : s0 });
        if (k > 0) s0 += len;
      }
    });
    // flexion creases per digit, as distances (m) from the MCP along the digit
    const creases = DIG.map(([d], di) => {
      const L = segs.filter((q) => q.di === di && q.k > 0).map((q) => q.len);
      return di === 0 ? [-0.004, L[0] - 0.001, 9] : [0.30 * L[0], L[0] - 0.0005, L[0] + L[1] - 0.0015];
    });
    const wristP = new V3().setFromMatrixPosition(restW[BI.wrist]);
    const wx = new V3(), wy = new V3(), wz = new V3(); restW[BI.wrist].extractBasis(wx, wy, wz);
    const palmar = wy.clone().negate();            // out of the palm
    const radial = new V3();                        // toward the thumb, across the palm
    const mcps = FINGERS.map((f) => new V3().setFromMatrixPosition(restW[BI[f + '-phalanx-proximal']]));
    radial.subVectors(mcps[0], mcps[3]).addScaledVector(palmar, -radial.clone().dot(palmar)).normalize();
    const distal = new V3().crossVectors(palmar, radial).normalize();
    if (distal.dot(new V3().subVectors(mcps[1], wristP)) < 0) distal.negate();
    const span = new V3().subVectors(mcps[0], mcps[3]).dot(radial), palmL = new V3().subVectors(mcps[1], wristP).dot(distal);
    const pr0 = new V3().subVectors(mcps[0], wristP).dot(radial) + 0.14 * span, pr1 = new V3().subVectors(mcps[3], wristP).dot(radial) - 0.14 * span;

    const color = new Float32Array(n * 3), skin = new Float32Array(n * 4), crease = new Float32Array(n * 4), palm = new Float32Array(n * 4), nailA = new Float32Array(n * 4), digit = new Float32Array(n);
    const cD = new THREE.Color(SKIN.dorsal), cP = new THREE.Color(SKIN.palmar), cF = new THREE.Color(SKIN.flush), cK = new THREE.Color(SKIN.knuckle);
    const c = new THREE.Color(), p = new V3(), nr = new V3(), q = new V3(), ab = new V3();
    let palmIdx = 0, palmBest = 1e9;
    // the hollow of the palm: a little toward the knuckles and the little finger from the palm's
    // centroid, clear of the thumb's pad, where a small thing dropped into an open hand comes to rest
    const palmC = wristP.clone().multiplyScalar(0.3).add(mcps.reduce((a, m) => a.add(m), new V3()).multiplyScalar(0.7 / 4)).addScaledVector(radial, -0.2 * span);
    const digSegs = DIG.map((_, di) => segs.filter((g) => g.di === di));
    for (let i = 0; i < n; i++) {
      p.fromArray(restArr, i * 3); nr.fromArray(restNor, i * 3);
      // the nearest digit (its segment and position along it), and how clearly it is the nearest:
      // fields that are continuous along one digit jump between digits, so the details that use
      // them fade out where two digits meet
      let d1 = 1e9, d2 = 1e9, g = null, bt = 0;
      for (const list of digSegs) {
        let bd = 1e9, bg = null, bbt = 0;
        for (const s of list) {
          ab.subVectors(s.b, s.a);
          const t = clamp(q.subVectors(p, s.a).dot(ab) / ab.lengthSq(), -0.3, 1.3);
          const dd = q.copy(s.a).addScaledVector(ab, clamp(t)).distanceTo(p);
          if (dd < bd) { bd = dd; bg = s; bbt = t; }
        }
        if (bd < d1) { d2 = d1; d1 = bd; g = bg; bt = bbt; } else if (bd < d2) d2 = bd;
      }
      const conf = R.smoothstep(0.1, 0.32, (d2 - d1) / Math.max(d2, 1e-4));
      const fore = clamp(q.subVectors(p, wristP).dot(foreDir) / 0.02);
      tmp.fromArray(palF, i * 3).normalize();
      const pal = R.smoothstep(-0.05, 0.6, nr.dot(tmp));
      const tip = g.last ? R.smoothstep(0.45, 1.0, bt) : 0;
      const dn = nr.dot(g.dorsal);
      const sAx = g.s0 + bt * g.len;
      const joint = g.k > 0 ? Math.min(Math.abs(sAx - g.s0), Math.abs(sAx - (g.s0 + g.len))) : Math.abs(bt - 1) * g.len;
      const knuckle = (1 - pal) * Math.exp(-((joint / 0.006) ** 2)) * (g.last && bt > 0.5 ? 0 : 1) * conf;
      // thinness: fingers are thin everywhere; the palm only at its edges and webs
      const thin = Math.max(1 - R.smoothstep(0.009, 0.03, thick[i]), clamp(phal[i]) * (0.6 + 0.3 * tip)) * (1 - fore);
      // palm-plane coordinates (0..1 radial→ulnar, 0..1 wrist→knuckles) for the palm lines and pads
      q.subVectors(p, wristP);
      const pu = (pr0 - q.dot(radial)) / (pr0 - pr1), pv = q.dot(distal) / palmL;
      const inPalm = pal * R.smoothstep(-0.14, 0.04, pv) * (1 - R.smoothstep(0.98, 1.1, pv));
      // colour: dorsal → palmar, flushed pads and tips, darker knuckles, redder thenar/hypothenar pads
      c.copy(cD).lerp(cP, pal);
      const pads = inPalm * clamp(Math.exp(-(((pu - 0.1) / 0.3) ** 2 + ((pv - 0.3) / 0.3) ** 2)) + 0.8 * Math.exp(-(((pu - 0.95) / 0.25) ** 2 + ((pv - 0.4) / 0.35) ** 2)));
      c.lerp(cF, clamp(tip * (0.35 + 0.45 * pal) + 0.35 * pads));
      c.lerp(cK, knuckle * 0.55 * (1 - pal));
      const mot = R.noise.fbm3(p.x * 160, p.y * 160, p.z * 160, 3), hue = R.noise.n3(p.x * 55 + 7, p.y * 55, p.z * 55);
      c.r *= 1 + 0.07 * mot + 0.03 * hue; c.g *= 1 + 0.07 * mot - 0.015 * hue; c.b *= 1 + 0.06 * mot - 0.03 * hue;
      color[i * 3] = c.r; color[i * 3 + 1] = c.g; color[i * 3 + 2] = c.b;
      skin.set([thin, conf, pal, tip], i * 4);
      digit[i] = fore > 0.5 || (g.k === 0 && g.di > 0) ? 5 : g.di;
      // crease coordinates: mm from each flexion crease along the digit
      const cr = creases[g.di];
      crease.set([(sAx - cr[0]) * 1000, (sAx - cr[1]) * 1000, (sAx - cr[2]) * 1000, conf * pal], i * 4);
      palm.set([pu, pv, inPalm, R.smoothstep(0.25, 0.75, dn) * (1 - pal) * conf * (g.k > 0 ? 1 : 0)], i * 4);
      // nail coordinates in the frame of the digit's last segment: across (u), along (v), up (h)
      const L = digSegs[g.di][digSegs[g.di].length - 1], rr = g.di === 0 ? 0.0105 : 0.0082;
      q.subVectors(p, L.a);
      nailA.set([q.dot(L.side) / rr, q.dot(ab.subVectors(L.b, L.a).normalize()) / L.len, q.dot(L.dorsal) / rr, conf], i * 4);
      // the palm point: the palm-side vertex closest to the line out of the palm's centre
      if (nr.dot(palmar) > 0.6) {
        const off = q.subVectors(p, palmC), along = off.dot(palmar), perp = off.addScaledVector(palmar, -along).length();
        if (along > 0 && perp < palmBest) { palmBest = perp; palmIdx = i; }
      }
    }
    return { color, skin, crease, palm, nail: nailA, digit, palmIdx, thick };
  }

  // ─── Skin shader: physical base + sheen, scattering at the terminator, light through thin
  // parts, the seed's light and its inner glow, nails, flexion creases, palm lines, fine texture ─
  const SKIN_GLSL = /* glsl */`
    uniform vec3 uSeedPos; uniform vec3 uSeedCol; uniform float uSeedRange; uniform float uGlow; uniform float uGlowFall; uniform float uDebug; uniform float uReveal;
    varying vec3 vRest; varying vec4 vSkin; varying vec4 vCrease; varying vec4 vPalm; varying vec4 vNail; varying vec3 vWPos; varying float vAO;
    float rbHash(vec3 p) { p = fract(p * 0.1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }
    float rbNoise(vec3 x) {
      vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
      return mix(mix(mix(rbHash(i), rbHash(i + vec3(1,0,0)), f.x), mix(rbHash(i + vec3(0,1,0)), rbHash(i + vec3(1,1,0)), f.x), f.y),
                 mix(mix(rbHash(i + vec3(0,0,1)), rbHash(i + vec3(1,0,1)), f.x), mix(rbHash(i + vec3(0,1,1)), rbHash(i + vec3(1,1,1)), f.x), f.y), f.z);
    }
    // a palm line v = a + b u + c u² (palm units; ~90 mm across), tapering off at both ends
    float rbLine(vec2 uv, vec3 k, vec2 range, float w, float wob) {
      float f = uv.y - (k.x + k.y * uv.x + k.z * uv.x * uv.x);
      float g = k.y + 2.0 * k.z * uv.x;
      float d = abs(f) / sqrt(1.0 + g * g) * 90.0 + wob;
      float x = clamp((uv.x - range.x) / (range.y - range.x), 0.0, 1.0);
      float taper = smoothstep(0.0, 0.18, x) * (1.0 - smoothstep(0.7, 1.0, x));
      float ww = w * (0.45 + 0.55 * taper);
      return exp(-d * d / (ww * ww)) * taper;
    }
    vec3 rbScatter(IncidentLight L, vec3 N, vec3 V, float thin, vec3 albedo) {
      float ndl = dot(N, L.direction);
      float wrap = max(0.0, (ndl + 0.5) / 1.5);
      float extra = max(0.0, wrap * wrap * 1.2 - max(ndl, 0.0));
      vec3 H = normalize(L.direction + N * 0.4);
      float tr = pow(clamp(dot(V, -H), 0.0, 1.0), 3.0) * thin;
      return L.color * RECIPROCAL_PI * (extra * albedo * vec3(1.0, 0.55, 0.45) * 0.7 + tr * vec3(1.0, 0.42, 0.28) * 0.3);
    }
  `;
  const SKIN_COLOR = /* glsl */`
    #include <color_fragment>
    float wob = rbNoise(vRest * 260.0) - 0.5, wob2 = rbNoise(vRest * 90.0 + 5.0) - 0.5;
    // ── nail: a rounded plate on the back of the last segment, crisp at its folds
    float nu = abs(vNail.x), nv = vNail.y;
    float cut = 0.47 + 0.12 * nu * nu;                 // the cuticle arcs back at the sides
    float ex = pow(nu / 0.62, 2.6) + pow(abs(nv - 0.77) / 0.31, 2.6);
    float edge = (1.0 - ex) * 0.22;
    float aaN = max(fwidth(edge), 0.004);
    float nailM = smoothstep(-aaN, aaN, edge) * step(0.25, vNail.z) * smoothstep(0.6, 0.9, vNail.w);
    float fold = (1.0 - smoothstep(0.0, 0.07, abs(edge))) * step(0.25, vNail.z) * smoothstep(0.6, 0.9, vNail.w) * step(-0.05, edge + 0.08);
    vec3 nailC = mix(vec3(0.62, 0.39, 0.33), vec3(0.74, 0.55, 0.47), smoothstep(0.5, 0.62, nv));   // bed → plate
    nailC = mix(nailC, vec3(0.8, 0.7, 0.62), smoothstep(0.98, 1.03, nv));                             // free edge
    nailC = mix(nailC, vec3(0.78, 0.62, 0.55), (1.0 - smoothstep(cut, cut + 0.09, nv)) * 0.6);      // lunula
    vec3 nailT = mix(nailC, vec3(dot(nailC, vec3(0.33))), 0.3) * dot(diffuseColor.rgb, vec3(0.33)) / 0.33 * 1.12;
    diffuseColor.rgb = mix(diffuseColor.rgb, nailT, nailM * 0.45);
    diffuseColor.rgb *= 1.0 - fold * 0.16;
    // ── flexion creases on the palm side of the digits (two lines at the base and middle joints)
    vec3 cc = vCrease.xyz + wob * 0.9;
    float cr = exp(-cc.x * cc.x / 0.24) + 0.45 * exp(-pow(cc.x - 1.6 - wob2, 2.0) / 0.2)
             + exp(-cc.y * cc.y / 0.2) + 0.55 * exp(-pow(cc.y + 1.3 + wob2, 2.0) / 0.2)
             + 0.8 * exp(-cc.z * cc.z / 0.18);
    cr *= smoothstep(0.45, 0.9, vCrease.w) * (0.6 + 0.6 * wob2) * 0.8;
    // ── the three major palm lines
    vec2 puv = vPalm.xy;
    float lw = wob * 0.7;
    float pl = rbLine(puv, vec3(1.064, -0.721, 0.357), vec2(0.28, 1.06), 1.1, lw)
             + 0.85 * rbLine(puv, vec3(0.62, -0.05, -0.125), vec2(-0.05, 0.82), 1.0, lw)
             + 0.9 * rbLine(puv.yx, vec3(0.461, -0.164, -1.006), vec2(0.06, 0.62), 1.15, lw);
    pl *= smoothstep(0.35, 0.8, vPalm.z) * (0.8 + 0.4 * wob2);
    // ── fine wrinkles across the backs of the knuckles
    float kw = pow(0.5 + 0.5 * sin(vCrease.y * 4.2 + wob * 2.5), 6.0) * vPalm.w * exp(-vCrease.y * vCrease.y / 10.0);
    float creaseAll = clamp(cr + pl, 0.0, 1.0);
    // creases read by their groove (the normal below) more than by colour: only a soft darkening
    diffuseColor.rgb *= mix(vec3(1.0), vec3(0.8, 0.67, 0.63), clamp(creaseAll * 0.6 + kw * 0.3, 0.0, 1.0));
    float mott = rbNoise(vRest * 700.0);
    diffuseColor.rgb *= 0.95 + 0.1 * mott;
    // blotchiness: the uneven blood under living skin — redder and paler patches, a few mm to cm
    float blot = rbNoise(vRest * 48.0 + 11.0) - 0.5, blot2 = rbNoise(vRest * 140.0 + 3.0) - 0.5;
    diffuseColor.rgb *= vec3(1.0 + 0.1 * blot + 0.05 * blot2, 1.0 - 0.015 * blot + 0.035 * blot2, 1.0 - 0.05 * blot + 0.035 * blot2);
  `;
  function skinMaterial(U) {
    const m = new THREE.MeshPhysicalMaterial({
      color: '#ffffff', vertexColors: true, metalness: 0,
      sheen: 0.3, sheenColor: new THREE.Color('#e9d3c6'), sheenRoughness: 0.6,
      specularIntensity: 0.65, ior: 1.4, roughness: 0.48,
      envMap: RB.workshopEnv(), envMapIntensity: 0.22,
    });
    m.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, U);
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', `#include <common>
          attribute vec3 aRest; attribute vec4 aSkin; attribute vec4 aCrease; attribute vec4 aPalm; attribute vec4 aNail; attribute float aDigit;
          varying vec3 vRest; varying vec4 vSkin; varying vec4 vCrease; varying vec4 vPalm; varying vec4 vNail; varying vec3 vWPos; varying float vAO;
          uniform vec3 uCapA[${CAPS.length}]; uniform vec3 uCapB[${CAPS.length}]; uniform float uCapR[${CAPS.length}]; uniform float uCapD[${CAPS.length}];`)
        .replace('#include <begin_vertex>', `#include <begin_vertex>
          vRest = aRest; vSkin = aSkin; vCrease = aCrease; vPalm = aPalm; vNail = aNail;
          {
            // capsule occlusion from the other digits and the palm (analytic, per vertex)
            float occ = 0.0;
            for (int k = 0; k < ${CAPS.length}; k++) {
              if (abs(uCapD[k] - aDigit) < 0.5) continue;
              vec3 pa = transformed - uCapA[k], ba = uCapB[k] - uCapA[k];
              float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
              vec3 d = pa - ba * h; float dist = max(length(d), uCapR[k] * 1.02);
              float nl = dot(objectNormal, -d / dist);
              float rr = uCapR[k] / dist;
              occ += clamp((nl + 0.35) / 1.35, 0.0, 1.0) * rr * rr;
            }
            vAO = 1.0 - clamp(occ * 0.9, 0.0, 0.78);
          }`)
        .replace('#include <project_vertex>', '#include <project_vertex>\n\tvWPos = (modelMatrix * vec4(transformed, 1.0)).xyz;');
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', '#include <common>\n' + SKIN_GLSL)
        .replace('#include <color_fragment>', SKIN_COLOR)
        .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
          float rn = rbNoise(vRest * 380.0 + 17.0);
          float rn2 = rbNoise(vRest * 1500.0 + 3.0);
          roughnessFactor = clamp(roughnessFactor * (0.78 + 0.3 * rn + 0.22 * rn2) * mix(1.0, 1.1, vSkin.z) + creaseAll * 0.14, 0.22, 0.92);
          roughnessFactor = mix(roughnessFactor, 0.2 + 0.08 * rn, nailM);`)
        .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
          {
            // micro relief: skin texture, the creases as shallow grooves, the nail's raised plate
            float gr = rbNoise(vRest * 2100.0);
            float h = ((gr - 0.5) * 0.00011 + (rbNoise(vRest * 900.0) - 0.5) * 0.00016 + (rbNoise(vRest * 380.0) - 0.5) * 0.0002) * (1.0 - nailM)
                    - creaseAll * 0.00034 - kw * 0.00014 + nailM * 0.00022;
            vec3 sp = -vViewPosition;
            vec3 dpx = dFdx(sp), dpy = dFdy(sp);
            float dhx = dFdx(h), dhy = dFdy(h);
            vec3 r1 = cross(dpy, normal), r2 = cross(normal, dpx);
            float det = dot(dpx, r1);
            vec3 grad = sign(det) * (dhx * r1 + dhy * r2);
            normal = normalize(abs(det) * normal - grad);
          }`)
        .replace('#include <lights_fragment_begin>', `#include <lights_fragment_begin>
          {
            // the seed: a warm point of light near (or in) the palm
            vec3 sL = (viewMatrix * vec4(uSeedPos, 1.0)).xyz - geometryPosition;
            float sD = max(length(sL), 1e-4);
            IncidentLight seedL;
            seedL.direction = sL / sD;
            seedL.color = uSeedCol / (1.0 + sD * sD / (uSeedRange * uSeedRange));
            seedL.visible = true;
            RE_Direct(seedL, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight);
            reflectedLight.directDiffuse += rbScatter(seedL, geometryNormal, geometryViewDir, vSkin.x, diffuseColor.rgb);
          }`)
        .replace('#include <lights_fragment_end>', `#include <lights_fragment_end>
          {
            vec3 sss = vec3(0.0);
            IncidentLight L;
            #if NUM_DIR_LIGHTS > 0
              for (int i = 0; i < NUM_DIR_LIGHTS; i++) { getDirectionalLightInfo(directionalLights[i], L); sss += rbScatter(L, geometryNormal, geometryViewDir, vSkin.x, diffuseColor.rgb); }
            #endif
            #if NUM_SPOT_LIGHTS > 0
              for (int i = 0; i < NUM_SPOT_LIGHTS; i++) { getSpotLightInfo(spotLights[i], geometryPosition, L); sss += rbScatter(L, geometryNormal, geometryViewDir, vSkin.x, diffuseColor.rgb); }
            #endif
            // the warm, strongly coloured lights over a warm albedo push skin toward orange rubber;
            // pull the diffuse a little back toward neutral (the scattering keeps its red)
            float dl = dot(reflectedLight.directDiffuse, vec3(0.2126, 0.7152, 0.0722));
            reflectedLight.directDiffuse = mix(vec3(dl), reflectedLight.directDiffuse, 0.84);
            float il = dot(reflectedLight.indirectDiffuse, vec3(0.2126, 0.7152, 0.0722));
            reflectedLight.indirectDiffuse = mix(vec3(il), reflectedLight.indirectDiffuse, 0.84);
            reflectedLight.directDiffuse += sss * (1.0 - 0.15 * nailM);
            float ao = vAO * (1.0 - 0.25 * creaseAll);
            reflectedLight.indirectDiffuse *= ao; reflectedLight.indirectSpecular *= ao;
            reflectedLight.directDiffuse *= mix(1.0, ao, 0.7); reflectedLight.directSpecular *= mix(1.0, ao, 0.8);
            // the seed's light diffusing through the flesh: the hand glows from within around it
            float gd = length(vWPos - uSeedPos);
            totalEmissiveRadiance += uSeedCol * vec3(1.0, 0.38, 0.2) * uGlow * exp(-gd / uGlowFall) * (0.25 + 0.75 * vSkin.x) * (1.0 - 0.3 * nailM);
            // … and a fainter, wider red bleed through the thin parts — the fingers' edges, the web
            totalEmissiveRadiance += uSeedCol * vec3(1.0, 0.3, 0.14) * uGlow * 0.22 * exp(-gd / (uGlowFall * 3.0)) * vSkin.x * vSkin.x;
          }`)
        .replace('#include <dithering_fragment>', `#include <dithering_fragment>
          gl_FragColor.rgb *= uReveal;   // out of the dark: the hand rises into the light
          if (uDebug > 0.5) {
            vec3 dc = uDebug < 1.5 ? vColor.rgb : uDebug < 2.5 ? vec3(vSkin.x, vSkin.z, vSkin.y) : uDebug < 3.5 ? vec3(creaseAll, nailM, kw) : vec3(fract(vNail.xy), vNail.w);
            gl_FragColor = vec4(pow(dc, vec3(1.0 / 2.2)), 1.0);
          }`);
    };
    m.customProgramCacheKey = () => 'rb-renew-skin-7';
    return m;
  }

  /**
   * Build a posable, CPU-skinned, Loop-subdivided human hand from the WebXR generic hand.
   * Returns { mesh, setPose(pose), palmPoint(), ... } — all absolute, pure per draw.
   */
  async function createHuman(side = 'right', { levels = 2, forearm = 0.42 } = {}) {
    const gltf = await new window.THREE_ADDONS.GLTFLoader().loadAsync(ASSETS + side + '.glb');
    let sm = null;
    gltf.scene.traverse((o) => { if (o.isSkinnedMesh) sm = o; });
    gltf.scene.updateMatrixWorld(true);
    const g = sm.geometry, bones = sm.skeleton.bones;
    const names = bones.map((b) => b.name.replace(/_/g, '-'));
    names.push('forearm');
    const NB = names.length, BI = Object.fromEntries(names.map((n, i) => [n, i]));
    const restW = bones.map((b) => b.matrixWorld.clone());
    restW.push(restW[BI.wrist].clone());
    const ibm = sm.skeleton.boneInverses.map((m) => m.clone());
    ibm.push(restW[BI.wrist].clone().invert());
    const parent = names.map((n) => (parentName(n) == null ? -1 : BI[parentName(n)]));
    const restL = names.map((n, i) => (parent[i] < 0 ? restW[i].clone() : restW[parent[i]].clone().invert().multiply(restW[i])));

    // ── weld the UV seams: one vertex per position
    const pos = g.attributes.position, si = g.attributes.skinIndex, sw = g.attributes.skinWeight, gi = g.index.array;
    const map = new Map(), rep = new Int32Array(pos.count), P0 = [], J0 = [], W0 = [];
    for (let i = 0; i < pos.count; i++) {
      const k = `${pos.getX(i).toFixed(5)},${pos.getY(i).toFixed(5)},${pos.getZ(i).toFixed(5)}`;
      let r = map.get(k);
      if (r === undefined) {
        r = P0.length / 3; map.set(k, r);
        P0.push(pos.getX(i), pos.getY(i), pos.getZ(i));
        J0.push(si.getX(i), si.getY(i), si.getZ(i), si.getW(i));
        W0.push(sw.getX(i), sw.getY(i), sw.getZ(i), sw.getW(i));
      }
      rep[i] = r;
    }
    const n0 = P0.length / 3, tris0 = Array.from(gi, (i) => rep[i]);

    // ── the forearm: stretch the capped wrist end out along the forearm, bound to a 'forearm' bone
    const wInv = restW[BI.wrist].clone().invert();
    const tipL = new V3().setFromMatrixPosition(restW[BI['middle-finger-tip']]).applyMatrix4(wInv);
    const foreDir = tipL.clone().negate().normalize(); // wrist-local direction toward the elbow
    const wristW = new M4().copy(restW[BI.wrist]);
    const v = new V3();
    let zmax = 0;
    for (let i = 0; i < n0; i++) { v.fromArray(P0, i * 3).applyMatrix4(wInv); zmax = Math.max(zmax, v.dot(foreDir)); }
    const F0 = BI.forearm;
    for (let i = 0; i < n0; i++) {
      v.fromArray(P0, i * 3).applyMatrix4(wInv);
      const z = v.dot(foreDir);
      // skin to the forearm past the wrist crease
      const wf = R.smoothstep(-0.004, 0.014, z);
      if (wf > 0) {
        const ws = W0.slice(i * 4, i * 4 + 4).map((x) => x * (1 - wf));
        // put the forearm weight in the smallest slot
        let m = 0; for (let k = 1; k < 4; k++) if (ws[k] < ws[m]) m = k;
        const rest = ws.reduce((s, x, k) => s + (k === m ? 0 : x), 0);
        for (let k = 0; k < 4; k++) W0[i * 4 + k] = k === m ? wf : ws[k] * ((1 - wf) / (rest || 1));
        J0[i * 4 + m] = F0;
      }
      // stretch: vertices past the wrist slide out along the forearm (the cap goes furthest), widening a little
      const s = clamp((z - 0.008) / (zmax - 0.008));
      if (s > 0) {
        const along = forearm * Math.pow(s, 1.6);
        const radial = v.clone().addScaledVector(foreDir, -z);
        v.copy(radial.multiplyScalar(1 + 0.62 * Math.pow(s, 0.8))).addScaledVector(foreDir, z + along);
        v.applyMatrix4(wristW);
        P0[i * 3] = v.x; P0[i * 3 + 1] = v.y; P0[i * 3 + 2] = v.z;
      }
    }

    // ── subdivision stencils + static attributes
    const S = loopStencils(n0, tris0, levels, true);
    const n = S.n;
    const posArr = new Float32Array(n * 3), norArr = new Float32Array(n * 3);
    const restArr = new Float32Array(n * 3), restNor = new Float32Array(n * 3);
    applyStencil(S, P0, restArr);
    vertexNormals(restArr, S.tris, restNor);
    const skin = skinAttributes({ P0, tris0, n0, S, restArr, restNor, restW, BI, foreDir: foreDir.clone().transformDirection(wristW), J0, W0, names });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3).setUsage(THREE.DynamicDrawUsage));
    geo.setAttribute('normal', new THREE.BufferAttribute(norArr, 3).setUsage(THREE.DynamicDrawUsage));
    geo.setAttribute('aRest', new THREE.BufferAttribute(restArr, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(skin.color, 3));
    geo.setAttribute('aSkin', new THREE.BufferAttribute(skin.skin, 4));
    geo.setAttribute('aCrease', new THREE.BufferAttribute(skin.crease, 4));
    geo.setAttribute('aPalm', new THREE.BufferAttribute(skin.palm, 4));
    geo.setAttribute('aNail', new THREE.BufferAttribute(skin.nail, 4));
    geo.setAttribute('aDigit', new THREE.BufferAttribute(skin.digit, 1));
    geo.setIndex(new THREE.BufferAttribute(S.tris, 1));

    const U = {
      uSeedPos: { value: new V3() }, uSeedCol: { value: new THREE.Color(0, 0, 0) }, uSeedRange: { value: 2 },
      uGlow: { value: 0 }, uGlowFall: { value: 0.35 }, uDebug: { value: 0 }, uReveal: { value: 1 },
      uCapA: { value: CAPS.map(() => new V3()) }, uCapB: { value: CAPS.map(() => new V3()) },
      uCapR: { value: CAPS.map((c) => c[3]) }, uCapD: { value: CAPS.map((c) => c[0]) },
    };
    const mat = skinMaterial(U);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.frustumCulled = false;
    const palmIdx = skin.palmIdx;

    // ── pose
    const posed = names.map(() => new M4()), skinM = new Float32Array(NB * 16);
    const _p = new V3(), _n = new V3();
    const eul = new THREE.Euler(), rq = new THREE.Quaternion(), rm = new M4(), tm = new M4();
    const order = names.map((_, i) => i).sort((a, b) => depth(a) - depth(b));
    function depth(i) { let d = 0; while (parent[i] >= 0) { i = parent[i]; d++; } return d; }
    const Pk = new Float32Array(n0 * 3);
    function setPose(rot) {
      for (const i of order) {
        const r = rot[names[i]];
        const base = parent[i] < 0 ? tm.identity().multiply(restL[i]) : tm.multiplyMatrices(posed[parent[i]], restL[i]);
        posed[i].copy(base);
        if (r) { eul.set(r[0] || 0, r[1] || 0, r[2] || 0, 'XYZ'); rm.makeRotationFromEuler(eul); posed[i].multiply(rm); }
      }
      for (let i = 0; i < NB; i++) tm.multiplyMatrices(posed[i], ibm[i]).toArray(skinM, i * 16);
      // linear blend skinning of the control cage
      for (let i = 0; i < n0; i++) {
        const x = P0[i * 3], y = P0[i * 3 + 1], z = P0[i * 3 + 2];
        let ox = 0, oy = 0, oz = 0;
        for (let k = 0; k < 4; k++) {
          const wgt = W0[i * 4 + k]; if (wgt <= 0) continue;
          const m = J0[i * 4 + k] * 16;
          ox += wgt * (skinM[m] * x + skinM[m + 4] * y + skinM[m + 8] * z + skinM[m + 12]);
          oy += wgt * (skinM[m + 1] * x + skinM[m + 5] * y + skinM[m + 9] * z + skinM[m + 13]);
          oz += wgt * (skinM[m + 2] * x + skinM[m + 6] * y + skinM[m + 10] * z + skinM[m + 14]);
        }
        Pk[i * 3] = ox; Pk[i * 3 + 1] = oy; Pk[i * 3 + 2] = oz;
      }
      applyStencil(S, Pk, posArr);
      vertexNormals(posArr, S.tris, norArr);
      // the occluding capsules (digit bones, the palm) in their posed places, for the skin's AO
      const jp = (nm, out) => out.setFromMatrixPosition(posed[BI[nm]]);
      CAPS.forEach(([, a, b], k) => {
        const A = U.uCapA.value[k], B = U.uCapB.value[k];
        if (Array.isArray(a)) { jp(a[0], A).lerp(jp(a[1], _p), a[2]); jp(b[0], B).lerp(jp(b[1], _p), b[2]); }
        else { jp(a, A); jp(b, B); }
      });
      geo.attributes.position.needsUpdate = true;
      geo.attributes.normal.needsUpdate = true;
      return api;
    }
    /** World point on the palm skin (in the hollow) and its outward normal, for the current pose. */
    function palmSurface(outP = new V3(), outN = new V3()) {
      mesh.updateMatrixWorld(true);
      outP.fromArray(posArr, palmIdx * 3).applyMatrix4(mesh.matrixWorld);
      outN.fromArray(norArr, palmIdx * 3).transformDirection(mesh.matrixWorld);
      return [outP, outN];
    }
    /** World position of a joint (by name) for the current pose. */
    function joint(name, out = new V3()) { mesh.updateMatrixWorld(true); return out.setFromMatrixPosition(posed[BI[name]]).applyMatrix4(mesh.matrixWorld); }
    /** Seed light / inner glow: { at: V3, color, intensity, range, glow, fall } (absolute; call every draw). */
    function setSeed(g) {
      if (!g || !(g.intensity > 0)) { U.uSeedCol.value.setRGB(0, 0, 0); U.uGlow.value = 0; return api; }
      U.uSeedPos.value.copy(g.at);
      U.uSeedCol.value.set(g.color || '#ffb48e').multiplyScalar(g.intensity);
      U.uSeedRange.value = g.range == null ? 2 : g.range;
      U.uGlow.value = g.glow || 0; U.uGlowFall.value = g.fall || 0.35;
      return api;
    }
    const wrist0 = new V3().setFromMatrixPosition(restW[BI.wrist]);
    const _bx = new V3(), _by = new V3(), _bz = new V3(), _bm = new M4();
    /**
     * Place the hand (absolute): the palm faces `palm`, the fingers point along `fingers` (at zero
     * wrist bend), the wrist joint sits at `wrist`, uniformly scaled by `scale`.
     */
    function place({ palm, fingers, wrist, scale = 6 }) {
      const Pn = _bx.set(palm[0], palm[1], palm[2]).normalize();
      const Fd = _by.set(fingers[0], fingers[1], fingers[2]);
      Fd.addScaledVector(Pn, -Fd.dot(Pn)).normalize();
      const Uz = _bz.crossVectors(Pn, Fd);
      // the right hand's palm faces −X in model space, the left hand's +X (it is the mirror image)
      if (side === 'left') _bm.makeBasis(Pn.clone(), Fd.clone().negate(), Uz.negate());
      else _bm.makeBasis(Pn.clone().negate(), Fd.clone().negate(), Uz);
      mesh.quaternion.setFromRotationMatrix(_bm);
      mesh.scale.setScalar(scale);
      const w = wrist0.clone().multiplyScalar(scale).applyQuaternion(mesh.quaternion);
      mesh.position.set(wrist[0] - w.x, wrist[1] - w.y, wrist[2] - w.z);
      mesh.updateMatrixWorld(true);
      return api;
    }
    const api = { mesh, geo, mat, U, side, names, BI, posed, restW, setPose, setSeed, place, palmSurface, joint, n0, n, triangles: S.tris.length / 3 };
    setPose({});
    return api;
  }


  // ─── Human hand poses ───────────────────────────────────────────────────────────────────────
  // f: per finger (index … pinky) [MCP, PIP, DIP flexion, abduction (+ toward the thumb), twist]
  // t: thumb [in-plane (− toward the index), palmar abduction, pronation twist, MCP, IP flexion]
  // w: wrist [extension (+), radial deviation, twist];  cup: the palm's hollowing, 0..1
  // (abduction: + moves a finger toward the thumb, so a natural fan is index +, ring and pinky −)
  const HP = {
    // a hand at rest, palm up: the natural cascade, index least curled, pinky most, the thumb lying
    // easy beside the palm
    relaxed: { f: [[0.26, 0.42, 0.22, 0.03, 0], [0.32, 0.5, 0.26, 0, 0], [0.38, 0.56, 0.28, -0.04, -0.03], [0.45, 0.6, 0.3, -0.1, -0.06]], t: [-0.36, -0.42, 0.4, 0.26, 0.36], w: [0.08, 0, 0], cup: 0.55 },
    // reaching to receive: fingers opened out and fanning a little, never flat — still the cascade
    open: { f: [[0.16, 0.27, 0.15, 0.04, 0], [0.2, 0.32, 0.17, 0, 0], [0.25, 0.37, 0.19, -0.05, -0.03], [0.31, 0.42, 0.21, -0.13, -0.06]], t: [-0.3, -0.52, 0.38, 0.2, 0.3], w: [0.28, 0, 0], cup: 0.35 },
    // receiving: a breath more open, the palm offered
    wide: { f: [[0.12, 0.22, 0.12, 0.05, 0], [0.16, 0.27, 0.15, 0, 0], [0.21, 0.32, 0.17, -0.06, -0.03], [0.27, 0.37, 0.19, -0.15, -0.07]], t: [-0.28, -0.58, 0.38, 0.18, 0.27], w: [0.34, 0, 0], cup: 0.3 },
    // closing softly around the seed — a cradle, not a fist: the middle and end joints curl in over
    // the palm more than the knuckles lift, so the fingertips come round the light
    hold: { f: [[0.3, 0.7, 0.45, 0.02, 0], [0.36, 0.78, 0.48, 0, 0], [0.42, 0.82, 0.5, -0.03, -0.03], [0.48, 0.85, 0.5, -0.08, -0.06]], t: [-0.3, -0.2, 0.42, 0.32, 0.42], w: [0.24, 0, 0], cup: 1 },
  };
  const lerpArr = (a, b, k) => a.map((x, i) => (Array.isArray(x) ? lerpArr(x, b[i], k) : x + (b[i] - x) * k));
  function blendHP(a, b, k) { return { f: lerpArr(a.f, b.f, k), t: lerpArr(a.t, b.t, k), w: lerpArr(a.w, b.w, k), cup: lerp(a.cup, b.cup, k) }; }
  /**
   * Pose → absolute joint rotations (Euler XYZ, radians). The left hand's joint frames are the
   * right's mirrored (X runs radial instead of ulnar), so its Y and Z rotations change sign.
   */
  function humanRot(p, side = 'right') {
    const r = {}, m = side === 'left' ? -1 : 1;
    FINGERS.forEach((d, i) => {
      const [mcp, pip, dip, abd, tw] = p.f[i];
      r[d + '-phalanx-proximal'] = [-mcp, m * abd, m * tw];
      r[d + '-phalanx-intermediate'] = [-pip, 0, 0];
      r[d + '-phalanx-distal'] = [-dip, 0, 0];
    });
    const c = p.cup;
    r['index-finger-metacarpal'] = [0, 0, 0];
    r['middle-finger-metacarpal'] = [-0.02 * c, 0, 0];
    r['ring-finger-metacarpal'] = [-0.07 * c, m * 0.02 * c, m * 0.03 * c];
    r['pinky-finger-metacarpal'] = [-0.15 * c, m * 0.05 * c, m * 0.07 * c];
    const [tin, tout, ttw, tm, ti] = p.t;
    r['thumb-metacarpal'] = [tin, m * tout, m * ttw];
    r['thumb-phalanx-proximal'] = [-tm, 0, 0];
    r['thumb-phalanx-distal'] = [-ti, 0, 0];
    r.wrist = [p.w[0], m * p.w[1], m * p.w[2]];
    return r;
  }

  // for the lab page (lab/renew-lab.html); window.__S6_DEV.cam(tf) there swaps in a close-up camera
  window.__S6 = { createHuman, HP, blendHP, humanRot };

  // ═══ The shot ═════════════════════════════════════════════════════════════════════════════
  // Film-local seconds (env.tf ∈ [0, 9)); beats every 0.75 s, bars at 0 / 3 / 6.
  const K = {
    arrive: [0, 1.35],            // the arm glides in under the ember
    reach: [0.5, 3.0],            // the human hand reaches up out of the dark
    kicker: 0.4, lineIn: 1.2, lineOut: 7.4,
    tilt: [3.0, 4.8],             // the robot fingers tilt, the seed rolls to their tips, lifts off …
    drift: [3.0, 6.0],            // … and floats down across the gap into the palm, in slow motion
    approach: [2.4, 5.7],         // the human hand's last, slow approach under the fingertips
    touch: 6.0,                   // the downbeat: the seed touches the palm
    close: [6.0, 7.2],            // the fingers close softly around it (index first … pinky last)
    open: [7.15, 8.0],            // … and ease open to let it rise
    withdraw: [6.3, 8.9],         // the arm withdraws: a hand-off, not a takeover
    rise: [7.5, 9.0],             // the seed rises out of the hand to riseSpark
    sink: [7.55, 8.6],            // both hands sink into darkness
  };
  const SPARK0 = RB.shots.palmSpark, SPARK1 = RB.shots.riseSpark;
  const RISE_V = 100;            // px per film second at tf → 9 (S7: 120 px per story second, 1.2× slower)
  const BACK = { gx: 960, gy: 540, gr: 900, lift: 0.7 };   // the contract backdrop, both ends
  const F0 = 21;                 // film time of tf 0 (for RB.type, which takes film seconds here)

  // Layout, world units (the robot hand is 1.17 long). The seed's first rest point, on the pads of
  // the robot's fingers, is the origin E0. The seed lands in the human palm at LAND, which is placed
  // (in init) a short drop below and in front of the robot's fingertips as they pour: the robot's
  // hand above, the human's open palm beneath, the way one person tips a seed into another's hand.
  // The human is a LEFT hand reaching up from the lower left — Adam's hand to the robot's right —
  // so the palm opens toward the camera with the thumb beyond it.
  const ROBOT = { palm: [-0.08, 1, 0.3], forearm: [0.82, 0.42, -0.4], slim: [0.8, 0.84] };
  const HUMAN = { side: 'left', palm: [-0.3, 1, 0.45], fingers: [1, 0.25, -0.1], scale: 5.6 };
  const DROP = [-0.1, -0.27, 0.14];            // the robot's fingertip lip → the landing point
  const CAM_DIR = [0.13, -0.2, -1];          // a fixed gaze: from the front left, a little above
  // The camera holds a two-shot and only glides and pushes in slowly: it looks at a point between
  // the seed's rest point and the palm (weight w: 0 = E0, 1 = LAND), held at a screen position, at a
  // slowly closing distance — a Hermite through these keys, at rest at both ends. While the seed
  // floats (tf 3–6) the camera barely moves, so the float is the only motion: [tf, w, px, py, dist].
  const CAM_KEYS = [
    [0, 0, SPARK0.x, SPARK0.y, 3.0],
    [3, 0.5, 1010, 520, 3.15],
    [6, 0.64, 1000, 545, 2.95],
    [9, 1, 940, 600, 2.55],
  ];
  const SEED_LIFT = 0.052;       // the seed rides this far off the skin (it is a little sphere of light)

  let S = null, A = null, H = null, L = null, E0 = null, CR = null, DR = null, LAND = null, HW = null, RISE_A = null, SPARKS = null;
  const v3 = (a) => new V3(a[0], a[1], a[2]);
  const _a = new V3(), _b = new V3(), _c = new V3();

  // ─── Robot: pose and placement at tf ────────────────────────────────────────────────────────
  function robotAt(tf) {
    const P = RB.hand.poses;
    const arrive = E.outCubic(seg(tf, K.arrive[0], K.arrive[1]));
    const wd = E.inOutSine(seg(tf, K.withdraw[0], K.withdraw[1]));
    const fa = v3(ROBOT.forearm).normalize();
    // gliding in along its own forearm, from a little below; withdrawing back up it
    const off = fa.clone().multiplyScalar(0.34 * (1 - arrive) + 0.3 * wd).add(new V3(0, -0.07 * (1 - arrive) + 0.03 * wd, 0));
    // the slightest servo breath while it holds the ember
    off.y += 0.004 * Math.sin((tf - 1.35) * 1.7) * seg(tf, 1.2, 2.2) * (1 - seg(tf, 2.6, 3.0));
    A.setPose(P.palmUp).place({ palm: ROBOT.palm, forearm: ROBOT.forearm, palmAt: [CR.palmAt.x + off.x, CR.palmAt.y + off.y, CR.palmAt.z + off.z] });
    const tilt = E.inOutSine(seg(tf, K.tilt[0], K.tilt[1])) * (1 - 0.45 * E.inOutSine(seg(tf, 6.4, 8.4)));
    A.setPose(RB.hand.blend(P.palmUp, P.offer, 0.42 * tilt));
  }
  /** The cradle of the robot fingers and the lip at their tips (after robotAt). */
  function robotCradle(out = new V3()) {
    const pp = A.palmPoint(), pn = A.palmNormal(), tips = A.fingertips();
    return out.copy(tips[1]).add(tips[2]).add(tips[3]).multiplyScalar(1 / 3).lerp(pp, 0.28).addScaledVector(pn, 0.038);
  }
  function robotLip(out = new V3()) {
    const pn = A.palmNormal(), tips = A.fingertips();
    return out.copy(tips[1]).add(tips[2]).multiplyScalar(0.5).addScaledVector(pn, 0.042);
  }

  // ─── Human: pose and placement at tf ────────────────────────────────────────────────────────
  const REACH_FROM = new V3(-0.78, -0.56, 0.24);   // it reaches in out of the dark along its own forearm
  const APPROACH = new V3(-0.13, -0.05, 0.02);     // … then eases the last few centimetres in
  const SINK = new V3(-0.06, -0.22, 0.04);
  /** Blend two hand poses with a separate weight per digit (fingers never move in unison). */
  function blendDigits(a, b, kf, kt, kw) {
    return { f: a.f.map((q, i) => lerpArr(q, b.f[i], kf[i])), t: lerpArr(a.t, b.t, kt), w: lerpArr(a.w, b.w, kw), cup: lerp(a.cup, b.cup, kw) };
  }
  function humanAt(tf) {
    const rq = seg(tf, K.reach[0], K.reach[1]), reach = 0.7 * E.inOutSine(rq) + 0.3 * E.outCubic(rq);   // slow and even, settling
    const near = E.inOutSine(seg(tf, K.approach[0], K.approach[1]));
    const sink = E.inOutSine(seg(tf, K.sink[0], K.sink[1]));
    const w = HW.clone().addScaledVector(REACH_FROM, 1 - reach).addScaledVector(APPROACH, 1 - near).addScaledVector(SINK, sink);
    // the wrist leads the rise and the fingers trail a little below, lifting level as it arrives
    const trail = 0.22 * (1 - reach) * (1 - reach);
    H.place({ palm: HUMAN.palm, fingers: [HUMAN.fingers[0], HUMAN.fingers[1] - trail, HUMAN.fingers[2]], wrist: [w.x, w.y, w.z], scale: HUMAN.scale });
    // relaxed → open as it reaches, a breath more open as the seed nears
    let pose = blendHP(HP.relaxed, HP.open, E.inOutSine(seg(tf, 0.9, 3.2)));
    pose = blendHP(pose, HP.wide, E.inOutSine(seg(tf, 3.4, 5.7)));
    // the touch: the fingers close softly round it, index first, the thumb last; then ease open
    const cl = (d) => 0.5 * E.inOutSine(seg(tf, K.close[0] + d, K.close[1] + d)) * (1 - 0.65 * E.inOutSine(seg(tf, K.open[0] + d * 0.5, K.open[1] + d * 0.5)));
    return blendDigits(pose, HP.hold, [cl(0), cl(0.06), cl(0.12), cl(0.18)], cl(0.1), cl(0));
  }

  function poseHuman(tf) { return H.setPose(humanRot(humanAt(tf), H.side)); }

  // ─── The seed ───────────────────────────────────────────────────────────────────────────────
  /** Drift: a Bézier from the robot's fingertips, over the human fingers, down into the palm. */
  function driftPoint(u, out = new V3()) {
    const [p0, p1, p2, p3] = DR;
    const v = 1 - u;
    return out.set(0, 0, 0).addScaledVector(p0, v * v * v).addScaledVector(p1, 3 * v * v * u).addScaledVector(p2, 3 * v * u * u).addScaledVector(p3, u * u * u);
  }
  // slow motion: it lifts from rest, floats at an even, unhurried pace, and settles into the palm.
  // A trapezoid of speed with sine ramps (0.6 s up, 1.0 s down to a soft touch), integrated once
  // into the fraction of the path's LENGTH covered by time (so the pace is even along the curve).
  const DRIFT_S = (() => {
    const n = 600, v = [], T = K.drift[1] - K.drift[0], up = 0.6 / T, dn = 1.0 / T, vEnd = 0.12;
    for (let i = 0; i <= n; i++) {
      const x = i / n;
      v.push(x < up ? 0.5 - 0.5 * Math.cos(Math.PI * x / up) : x > 1 - dn ? lerp(1, vEnd, 0.5 - 0.5 * Math.cos(Math.PI * (x - 1 + dn) / dn)) : 1);
    }
    const u = [0];
    for (let i = 1; i <= n; i++) u.push(u[i - 1] + (v[i - 1] + v[i]) / 2);
    return u.map((q) => q / u[n]);
  })();
  let ARC = null;   // the drift curve's normalised arc length at u = i / (n − 1), built in init
  function buildArc(n = 400) {
    const a = [0], p = new V3(), q = driftPoint(0, new V3());
    for (let i = 1; i < n; i++) { driftPoint(i / (n - 1), p); a.push(a[i - 1] + p.distanceTo(q)); q.copy(p); }
    return a.map((x) => x / a[n - 1]);
  }
  function driftU(tf) {
    const f = seg(tf, K.drift[0], K.drift[1]) * (DRIFT_S.length - 1), i = Math.min(DRIFT_S.length - 2, Math.floor(f));
    const sN = lerp(DRIFT_S[i], DRIFT_S[i + 1], f - i);
    let lo = 0, hi = ARC.length - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (ARC[m] < sN) lo = m; else hi = m; }
    const k = ARC[hi] > ARC[lo] ? (sN - ARC[lo]) / (ARC[hi] - ARC[lo]) : 0;
    return (lo + clamp(k)) / (ARC.length - 1);
  }


  /** The seed resting in the human palm (after H.setPose for tf): a touch deeper as the fingers close. */
  function seedInPalm(tf, out) {
    const [pp, pn] = H.palmSurface();
    return out.copy(pp).addScaledVector(pn, SEED_LIFT - 0.012 * E.inOutSine(seg(tf, 6.0, 6.8)) * (1 - E.inOutSine(seg(tf, 7.2, 7.6))));
  }
  /** The rise, in screen space: from the palm to riseSpark, arriving at −100 px/s. */
  function risePoint(tf) {
    const u = seg(tf, K.rise[0], K.rise[1]), T = K.rise[1] - K.rise[0];
    const h00 = 2 * u * u * u - 3 * u * u + 1, h10 = u * u * u - 2 * u * u + u, h01 = -2 * u * u * u + 3 * u * u, h11 = u * u * u - u * u;
    return [h00 * RISE_A[0] + h10 * T * 8 + h01 * SPARK1.x, h00 * RISE_A[1] + h10 * T * -55 + h01 * SPARK1.y + h11 * T * -RISE_V];
  }

  // ─── Sparks: fine embers shed in the seed's wake (world space), a soft puff at the touch, and a
  // few from the rising seed (screen space) that are all gone before the cut ─────────────────────
  function makeSparks() {
    const out = [], rng = R.rng(606);
    // the wake: born along the drift, drifting slowly up and back, like embers in slow motion
    // (few and loose, hanging in the air the way embers do in high-speed footage — not a tracer line)
    for (let i = 0; i < 64; i++) {
      const tb = K.drift[0] + 0.35 + (i + rng()) / 64 * (K.drift[1] - K.drift[0] - 0.5);
      const p0 = driftPoint(driftU(tb), new V3());
      const v = new V3(rng() - 0.5, rng() - 0.5, rng() - 0.5).normalize().multiplyScalar(0.05 + 0.1 * rng());
      out.push({ kind: 'w', tb, life: 0.9 + 1.3 * rng(), p0, v, up: 0.01 + 0.025 * rng(), size: 0.7 + 1.4 * rng() * rng(), hue: rng() });
    }
    // the touch: a quiet puff off the palm
    for (let i = 0; i < 30; i++) {
      const a = rng() * Math.PI * 2;
      const v = new V3(Math.cos(a), 0.3 + 0.8 * rng(), Math.sin(a)).normalize().multiplyScalar(0.05 + 0.1 * rng());
      out.push({ kind: 'w', tb: K.touch + 0.02 * rng(), life: 0.5 + 0.9 * rng(), p0: LAND.clone(), v, up: 0.02 + 0.03 * rng(), size: 0.7 + 1.3 * rng() * rng(), hue: rng() });
    }
    // the rise: short-lived flecks from the rising seed, born before 8.35 so they die by 8.8
    for (let i = 0; i < 18; i++) {
      const tb = K.rise[0] + 0.1 + (i + rng()) / 18 * 0.75, life = 0.3 + 0.2 * rng();
      out.push({ kind: 's', tb, life, p0: risePoint(tb), v: [(rng() - 0.5) * 30, 10 + 25 * rng()], size: 0.6 + 1.1 * rng(), hue: rng() });
    }
    return out;
  }
  function drawSparks(ctx, tf, cam) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const s of SPARKS) {
      const age = tf - s.tb;
      if (age < 0 || age > s.life) continue;
      const k = age / s.life, a = Math.sin(Math.PI * Math.min(1, k * 3)) ** 0.5 * (1 - k) ** 1.5;
      let x, y;
      if (s.kind === 'w') {
        const d = (1 - Math.exp(-1.6 * age)) / 1.6;   // drag: they slow to a hang
        const px = s.p0.x + s.v.x * d, py = s.p0.y + s.v.y * d + s.up * age * age, pz = s.p0.z + s.v.z * d;
        [x, y] = RB.toScreen(cam, px, py, pz);
      } else {
        const d = (1 - Math.exp(-2.5 * age)) / 2.5;
        x = s.p0[0] + s.v[0] * d; y = s.p0[1] + s.v[1] * d;
      }
      const r = s.size;
      ctx.globalAlpha = 0.85 * a;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r * 3.2);
      g.addColorStop(0, s.hue > 0.6 ? '#fff0de' : '#ffc79e'); g.addColorStop(0.35, R.rgba(PAL.ember, 0.55)); g.addColorStop(1, R.rgba(PAL.copperHot, 0));
      ctx.fillStyle = g; ctx.fillRect(x - r * 3.2, y - r * 3.2, r * 6.4, r * 6.4);
    }
    ctx.restore();
  }
  /** A faint streak along the last stretch of the drift: the eye's persistence in slow motion. */
  function drawTrail(ctx, tf, cam) {
    if (tf < K.drift[0] || tf > K.touch + 0.3) return;
    const pts = [];
    for (let k = 0; k <= 8; k++) {
      const tt = Math.max(K.drift[0], Math.min(K.touch, tf) - k * 0.03);
      const q = driftPoint(driftU(tt), _c);
      pts.push(RB.toScreen(cam, q.x, q.y, q.z));
    }
    const fade = 1 - seg(tf, K.touch, K.touch + 0.3);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    for (let k = 1; k < pts.length; k++) {
      const w = 1 - k / pts.length;
      ctx.strokeStyle = R.rgba(PAL.ember, 0.13 * w * fade);
      ctx.lineWidth = 6 * w + 1;
      ctx.beginPath(); ctx.moveTo(pts[k - 1][0], pts[k - 1][1]); ctx.lineTo(pts[k][0], pts[k][1]); ctx.stroke();
    }
    ctx.restore();
  }

  // ─── Camera: a slow push that follows the seed, at rest at both ends ─────────────────────────
  let RAY = null;
  /** World direction through pixel (px, py) for the fixed gaze. */
  function rayDir(px, py, out = new V3()) {
    return out.set((px / R.W) * 2 - 1, 1 - (py / R.H) * 2, 0.5).unproject(RAY).normalize();
  }
  function hermiteKeys(keys, tf, j) {
    const n = keys.length;
    let i = 0; while (i < n - 2 && tf > keys[i + 1][0]) i++;
    const t0 = keys[i][0], t1 = keys[i + 1][0], T = t1 - t0, u = clamp((tf - t0) / T);
    const h00 = 2 * u * u * u - 3 * u * u + 1, h10 = u * u * u - 2 * u * u + u, h01 = -2 * u * u * u + 3 * u * u, h11 = u * u * u - u * u;
    const tan = (k) => (k === 0 || k === n - 1 ? 0 : ((keys[k + 1][j] - keys[k - 1][j]) / (keys[k + 1][0] - keys[k - 1][0])) * T);
    return h00 * keys[i][j] + h10 * tan(i) + h01 * keys[i + 1][j] + h11 * tan(i + 1);
  }
  const _ca = new V3(), _cr = new V3();
  function camAt(tf) {
    const w = hermiteKeys(CAM_KEYS, tf, 1), px = hermiteKeys(CAM_KEYS, tf, 2), py = hermiteKeys(CAM_KEYS, tf, 3), dist = hermiteKeys(CAM_KEYS, tf, 4);
    const pos = _ca.copy(E0).lerp(LAND, w).addScaledVector(rayDir(px, py, _cr), -dist);
    const D = CAM_DIR;
    return { pos: [pos.x, pos.y, pos.z], look: [pos.x + D[0], pos.y + D[1], pos.z + D[2]], fov: 30 };
  }

  /** Dev probe (study pages / measurements): key screen points of the shot at tf. Not used by the film. */
  function probe(tf) {
    const cam = RB.camera(30); RB.setCam(cam, camAt(tf));
    robotAt(tf); poseHuman(tf);
    const sc = (p) => RB.toScreen(cam, p.x, p.y, p.z).slice(0, 2).map((v) => Math.round(v));
    const seed = tf < K.drift[0] ? robotCradle() : tf < K.touch ? driftPoint(driftU(tf)) : seedInPalm(tf, new V3());
    return {
      seed: sc(seed), E0: sc(E0), LAND: sc(LAND), robotPalm: sc(A.palmPoint()), robotTips: A.fingertips().map(sc),
      humanTips: ['thumb-tip', ...FINGERS.map((f) => f + '-tip')].map((n) => sc(H.joint(n))), humanWrist: sc(H.joint('wrist')),
    };
  }
  Object.assign(window.__S6, { camAt, HUMAN, probe });   // for study pages

  // ─── Lights ─────────────────────────────────────────────────────────────────────────────────
  function makeLights(scene) {
    const spot = (color, angle) => { const l = new THREE.SpotLight(color, 0, 0, angle, 1, 0); scene.add(l, l.target); return l; };
    return { key: spot('#ffe7d2', 0.55), rim: spot('#ffb584', 0.45), back: spot('#ffc99c', 0.5), fill: spot('#b98a6a', 0.8) };
  }

  // ─── 2D atmosphere: out-of-focus motes (a shallow depth of field), sparks ────────────────────
  function bokeh(ctx, tf, a) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 26; i++) {
      const h1 = R.hash(i, 61), h2 = R.hash(i, 62), h3 = R.hash(i, 63), h4 = R.hash(i, 64);
      const x = 200 + h1 * 1600 + 18 * Math.sin(tf * 0.23 + h3 * 6.3) - tf * (4 + 6 * h4);
      const y = 120 + h2 * 820 - tf * (5 + 9 * h3) + 10 * Math.sin(tf * 0.31 + h4 * 6.3);
      const r = 10 + 38 * h3 * h3;
      const tw = 0.55 + 0.45 * Math.sin(tf * (0.5 + h4) + h1 * 6.3);
      const g = ctx.createRadialGradient(x, y, r * 0.55, x, y, r);
      const al = a * tw * (0.05 + 0.08 * h4);
      g.addColorStop(0, R.rgba(h1 > 0.7 ? PAL.ember : '#f3d9bb', al)); g.addColorStop(1, R.rgba('#f3d9bb', 0));
      ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    ctx.restore();
  }

  R.scene({
    id: 'renew', index: 6, label: 'Renew', start: 17.5, end: 22.5,
    async init() {
      S = RB.stage();
      S.scene.remove(S.key, S.rim);
      L = makeLights(S.scene);
      A = RB.hand.create({ side: 'right', forearm: 4 });
      // slimmer in section than the workshop hand of S3 (length unchanged): a fine instrument
      A.parts.mirror.scale.set(ROBOT.slim[0], 1, ROBOT.slim[1]);
      H = await createHuman(HUMAN.side);
      S.scene.add(A.group, H.mesh);
      // the robot's resting placement puts its cradle exactly on the origin, E0
      E0 = new V3(0, 0, 0);
      A.setPose(RB.hand.poses.palmUp).place({ palm: ROBOT.palm, forearm: ROBOT.forearm, palmAt: [0, 0, 0] });
      CR = { palmAt: E0.clone().sub(robotCradle()) };
      // the landing point: a short drop below and in front of the fingertips as they pour
      robotAt(4.4);
      const lip = robotLip(), LAND0 = lip.clone().add(v3(DROP));
      // the human's wrist is solved so that, at the touch, the seed's landing point is LAND0
      HW = LAND0.clone().add(new V3(-0.55, -0.2, 0.1));
      for (let k = 0; k < 2; k++) {
        poseHuman(K.touch);
        const [pp, pn] = H.palmSurface();
        HW.add(LAND0.clone().sub(pp.addScaledVector(pn, SEED_LIFT)));
      }
      poseHuman(K.touch);
      const [pp, pn] = H.palmSurface();
      LAND = pp.clone().addScaledVector(pn, SEED_LIFT);
      // the drift: the seed rolls to the fingertips as they tilt, lifts off them, and floats down
      // across the gap into the palm
      robotAt(K.drift[0]);
      const cradle = robotCradle(), rn = A.palmNormal();
      DR = [cradle, lip.clone().addScaledVector(rn, 0.06), LAND.clone().addScaledVector(pn, 0.3), LAND];
      ARC = buildArc();
      RAY = RB.camera(30);
      RB.setCam(RAY, { pos: [0, 0, 0], look: CAM_DIR, fov: 30 });
      // where the rise begins on screen: the seed in the palm at tf 7.5, seen by that frame's camera
      RB.setCam(S.camera, camAt(K.rise[0]));
      poseHuman(K.rise[0]);
      RISE_A = RB.toScreen(S.camera, ...seedInPalm(K.rise[0], new V3()).toArray()).slice(0, 2);
      SPARKS = makeSparks();
      // compile (and JIT, with a scissored 2×2 draw) every program the shot will use — the skin, and
      // the robot with its palm glow on and off under these lights — so no frame pays for it
      try {
        const r = RB.gl.renderer();
        RB.setCam(S.camera, camAt(4.5)); robotAt(4.5); poseHuman(4.5);
        for (const l of Object.values(L)) l.intensity = 1;
        for (const on of [true, false]) {
          A.setGlow(on ? { at: E0, intensity: 1, range: 1 } : null);
          r.compile(S.scene, S.camera);
          r.setScissorTest(true); r.setScissor(0, 0, 2, 2); r.render(S.scene, S.camera); r.setScissorTest(false);
        }
      } catch (e) { /* compiles on first use instead */ }
      window.__S6.state = { S, A, H, L, E0, LAND, DR, HW };
    },

    draw(ctx, t, env) {
      const tf = env.tf, dev = window.__S6_DEV;
      // ── time envelopes
      const up = E.inOutSine(seg(tf, 0.05, 1.6));                   // the light comes up
      const down = E.inOutSine(seg(tf, K.sink[0], K.sink[1]));      // … and goes down
      const vis = up * (1 - down);
      const warm = E.inOutSine(seg(tf, 0.2, 2.5)) * (1 - E.inOutSine(seg(tf, 7.4, 8.9)));

      // ── backdrop: the contract ground at both ends, a warm pool behind the hands between
      const camS = dev && dev.cam ? dev.cam(tf) : camAt(tf);
      RB.setCam(S.camera, camS);
      const [lx, ly] = RB.toScreen(S.camera, LAND.x, LAND.y, LAND.z);
      RB.atmos.backdrop(ctx, { gx: lerp(BACK.gx, lerp(960, lx, 0.5), warm), gy: lerp(BACK.gy, lerp(540, ly, 0.5) - 40, warm), gr: lerp(BACK.gr, 1050, warm), lift: lerp(BACK.lift, 0.95, warm) });
      bokeh(ctx, tf, warm);

      // ── the seed's world position (for its light) and screen position
      const seed = new V3();
      let seedScreen = null, seedR = SPARK0.r, seedI = 1;
      robotAt(tf);
      const pose = humanAt(tf);
      H.setPose(humanRot(pose, H.side));
      if (tf < K.arrive[1]) {
        seed.copy(E0);
      } else if (tf < K.drift[0]) {
        robotCradle(seed);
      } else if (tf < K.touch) {
        driftPoint(driftU(tf), seed);
      } else {
        seedInPalm(tf, seed);
      }
      if (tf >= K.rise[0]) {
        seedScreen = risePoint(tf);
        // its world position, for the light it still throws on the hand below
        const depth = _a.copy(seed).applyMatrix4(S.camera.matrixWorldInverse).z;
        const nd = new V3((seedScreen[0] / R.W) * 2 - 1, 1 - (seedScreen[1] / R.H) * 2, 0.5).unproject(S.camera).sub(S.camera.position).normalize();
        nd.multiplyScalar(depth / nd.clone().transformDirection(S.camera.matrixWorldInverse).z);
        seed.copy(S.camera.position).add(nd);
        seedR = lerp(SPARK0.r, SPARK1.r, E.inOutSine(seg(tf, K.rise[0], K.rise[1])));
      }
      if (!seedScreen) seedScreen = RB.toScreen(S.camera, seed.x, seed.y, seed.z);
      if (tf < K.rise[0]) seedR = SPARK0.r;

      // ── 3D: both hands in one render
      if (vis > 0.001) {
        H.mesh.visible = tf >= K.reach[0] - 0.05 && tf < K.sink[1] + 0.05;
        // it reaches up out of the dark: unlit as it enters, lit as it rises into the pool of light
        H.U.uReveal.value = 0.08 + 0.92 * E.inOutSine(seg(tf, K.reach[0] + 0.2, K.reach[0] + 1.9));
        A.group.visible = true;
        // lights hang off the hands' midpoint
        const M = _b.copy(E0).lerp(LAND, 0.5);
        const L1 = L.key, L2 = L.rim, L3 = L.back, L4 = L.fill;
        L1.position.set(M.x - 1.8, M.y + 4.8, M.z + 2.4); L1.target.position.copy(M);
        L2.position.set(M.x + 3.2, M.y + 2.4, M.z - 4.2); L2.target.position.copy(M);
        L3.position.set(M.x - 3.6, M.y + 1.2, M.z - 3.2); L3.target.position.copy(LAND);
        L4.position.set(M.x + 1.0, M.y - 3.5, M.z + 3.0); L4.target.position.copy(M);
        L1.intensity = 1.25 * vis; L2.intensity = 5.0 * vis; L3.intensity = 2.4 * vis; L4.intensity = 0.3 * vis;
        S.scene.environmentIntensity = 0.7 * vis;
        H.mat.envMapIntensity = 0.2 * vis;
        L1.target.updateMatrixWorld(); L2.target.updateMatrixWorld(); L3.target.updateMatrixWorld(); L4.target.updateMatrixWorld();
        // the seed's light on both hands: the robot's palm-side glow, the human's skin light + inner glow
        const nearR = 1 - E.inOutSine(seg(tf, K.drift[0] + 0.2, 5.0));
        A.setGlow({ at: seed.clone().addScaledVector(A.palmNormal(), 0.03), intensity: 1.9 * nearR * (tf < 1.5 ? E.inOutSine(seg(tf, 0, 1.2)) : 1), range: 1.7 });
        const glow = 0.85 * E.inOutSine(seg(tf, 5.85, 6.4)) * (1 - 0.45 * E.inOutSine(seg(tf, 7.0, 7.7))) * (1 - E.inOutSine(seg(tf, 7.7, 8.5)));
        H.setSeed({ at: seed, intensity: 2.1 * seedI * (1 - down), range: 0.12, glow: 1.0 * glow, fall: 0.11 });
        const c = RB.gl.render3D(S.scene, S.camera, { exposure: 1 });
        // a pool of light: the arms fall away into darkness toward the frame's corners
        const [mx, my] = RB.toScreen(S.camera, M.x, M.y, M.z);
        const b = R.buffer('s6-3d', R.W, R.H);
        b.clear();
        b.ctx.setTransform(1, 0, 0, 1, 0, 0);
        b.ctx.drawImage(c, 0, 0, b.canvas.width, b.canvas.height);
        b.ctx.setTransform(R.scale, 0, 0, R.scale, 0, 0);
        b.ctx.globalCompositeOperation = 'destination-in';
        const pool = b.ctx.createRadialGradient(mx, my - 40, 300, mx, my - 40, 1000);
        pool.addColorStop(0, 'rgba(0,0,0,1)'); pool.addColorStop(0.4, 'rgba(0,0,0,0.66)'); pool.addColorStop(1, 'rgba(0,0,0,0.02)');
        b.ctx.fillStyle = pool; b.ctx.fillRect(0, 0, R.W, R.H);
        ctx.save();
        ctx.globalAlpha = clamp(vis * 1.6);
        ctx.drawImage(b.canvas, 0, 0, R.W, R.H);
        ctx.restore();
      } else {
        A.setGlow(null); H.setSeed(null);
      }

      // ── the seed itself (2D, on top): trail and sparks in its wake, halo + core
      drawTrail(ctx, tf, S.camera);
      drawSparks(ctx, tf, S.camera);
      RB.fx.ember(ctx, seedScreen[0], seedScreen[1], seedR, { intensity: seedI });

      // ── type
      const T = env.F;
      RB.type.kicker(ctx, T, { index: '03', label: 'RENEW', x: 150, y: 232, tIn: F0 + K.kicker, tOut: F0 + K.lineOut });
      RB.type.line(ctx, T, { text: 'Renew the people,\nnot just the tools.', x: 150, y: 318, size: 58, tIn: F0 + K.lineIn, tOut: F0 + K.lineOut, stagger: 0.06, dur: 0.8 });
    },
    rail: (t, env) => ({ alpha: 1 - E.inOutCubic(seg(env.tf, 8.4, 9)), active: 3, progress: env.tf / 9 }),
  });
})();
