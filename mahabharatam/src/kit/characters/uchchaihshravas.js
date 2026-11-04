/*
 * CHARACTER · UCHCHAIHSHRAVAS, king of horses · `horse`
 *
 * Episodes 10–18 (CE 1.15–20): the white horse that rose from the churned ocean, honoured
 * by the gods. Kadru and Vinata see him and wager on the colour of his tail.
 *
 * A noble horse in profile (faces LEFT), drawn as a living mural animal, not a toy: a
 * deep chest, an arched neck, a fine wedge head with a dished face, small pricked ears,
 * a long mane falling on the far side of the neck and a tail that sweeps to the ground.
 * As a divine horse he wears a gold headstall with a forehead jewel and a short white
 * plume, and gold bands above the hooves. o.pose.tail (0..1) streaks the tail with black
 * (episode 18: the serpents hanging in it as black hairs).
 *
 * SIGNATURE LIGHT: moon-white. The only figure in the bible filled PALE: fill #c4cbe4
 * (shadow side), lit #ffffff, rim #b8ccff → #ffffff (a silver-blue edge), inner #eef2ff,
 * glow 0.9, gold ornaments. He is the brightest thing on any shore, never golden
 * (that is the Sun) and never green or blue (the serpents, Indra).
 *
 * Poses: stand · walk (phase) · gallop (phase) · rear (k) · bow (k: head down, grazing
 * or honouring). Feet on (x, y). scale 1 ≈ 1000 px to the poll, ≈ 1250 px nose to tail.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, CH = KIT.characters;
  const { TAU, lerp, clamp } = R;
  const { cut, limb, ribbon, limbOutline } = CH;

  const HIP = [300, -560], SHO = [-300, -560];

  function rig(P) {
    const po = P.po, k = po.k, T = P.T;
    const r = { T, k, name: po.name, tail: clamp(po.tail ?? 0), wind: po.wind ?? 0.6 };
    // body pitch about the hind hip (rear lifts the forehand)
    r.pitch = po.name === 'rear' ? 0.5 * k : 0;
    r.head = po.name === 'bow' ? -0.75 * k : po.name === 'rear' ? 0.2 * k : 0;
    r.head += P.ex.look || 0;
    const gait = po.name === 'walk' ? 1 : po.name === 'gallop' ? 2 : 0;
    const ph = po.phase || 0;
    r.bob = gait === 2 ? -18 * Math.abs(Math.sin(ph)) : gait === 1 ? -5 * Math.abs(Math.sin(ph)) : 0;
    // legs: [hip/shoulder, knee, fetlock, hoof] angles in a simple 3-segment chain
    const leg = (root, off, fore) => {
      let a1 = 0, a2 = 0;   // swing of the upper segment, bend of the lower (rad)
      if (gait) {
        const p = ph + off, amp = gait === 2 ? 0.62 : 0.32;
        a1 = amp * Math.sin(p);
        a2 = (fore ? -1 : 1) * Math.max(0, Math.sin(p + 1.4)) * (gait === 2 ? 1.3 : 0.8);
      }
      if (!fore) { a1 += 0.28; a2 -= 0.5; }      // the hind leg: stifle forward, hock back
      if (po.name === 'rear' && fore) { a1 = 0.95 * k + off * 0.1; a2 = -1.7 * k; }
      if (po.name === 'rear' && !fore) { a1 = 0.55 * k + 0.28 * (1 - k); a2 = -0.35 - 0.3 * k; }
      const L1 = fore ? 230 : 250, L2 = fore ? 200 : 190, L3 = 70;
      const r0 = root;
      const k1 = [r0[0] - Math.sin(a1) * L1, r0[1] + Math.cos(a1) * L1];
      const a12 = a1 + a2;
      const k2 = [k1[0] - Math.sin(a12) * L2, k1[1] + Math.cos(a12) * L2];
      const a3 = a12 * 0.4 + (fore ? -0.35 : -0.3);
      const k3 = [k2[0] - Math.sin(a3) * L3, k2[1] + Math.cos(a3) * L3];
      return [r0, k1, k2, k3];
    };
    r.legs = [leg([SHO[0] + 30, SHO[1] + 20], Math.PI, true), leg([HIP[0] + 30, HIP[1] + 20], 0, false), leg(SHO, 0, true), leg(HIP, Math.PI, false)];
    r.far = [0, 1]; r.near = [2, 3];
    return r;
  }

  // rotate a point about the hind hip by the body pitch
  const pt = (r, p) => {
    if (!r.pitch) return p;
    const c = Math.cos(r.pitch), s = Math.sin(r.pitch);
    return [HIP[0] + (p[0] - HIP[0]) * c - (p[1] - HIP[1]) * s, HIP[1] + (p[0] - HIP[0]) * s + (p[1] - HIP[1]) * c];
  };

  function legPath(g, r, i) {
    const L = r.legs[i].map((p, j) => (j === 0 || i % 2 === 0 ? pt(r, p) : p));
    const fore = i % 2 === 0;
    limb(g, [L[0], L[1], L[2]], fore ? [64, 34, 26] : [78, 36, 26]);
    limb(g, [L[2], L[3]], [26, 22]);
    // hoof: a neat wedge at the end of the pastern
    const d = [L[3][0] - L[2][0], L[3][1] - L[2][1]], n = Math.hypot(d[0], d[1]) || 1;
    const u = [d[0] / n, d[1] / n], v = [-u[1], u[0]];
    const h = L[3];
    g.moveTo(h[0] + v[0] * 22, h[1] + v[1] * 22);
    g.lineTo(h[0] + v[0] * 26 + u[0] * 40, h[1] + v[1] * 26 + u[1] * 40);
    g.lineTo(h[0] - v[0] * 30 + u[0] * 40, h[1] - v[1] * 30 + u[1] * 40);
    g.lineTo(h[0] - v[0] * 22, h[1] - v[1] * 22); g.closePath(); cut(g);
    // the gaskin/forearm muscle where the leg meets the body
    if (!fore) { const m = L[0]; g.moveTo(m[0] + 90, m[1] - 40); g.quadraticCurveTo(m[0] + 120, m[1] + 140, L[1][0] + 20, L[1][1] - 20); g.lineTo(L[1][0] - 40, L[1][1]); g.quadraticCurveTo(m[0] - 60, m[1] + 80, m[0] - 70, m[1] - 40); g.closePath(); cut(g); }
  }

  function bodyPath(g, r) {
    const P = (x, y) => pt(r, [x, y]);
    const m = (p) => g.moveTo(p[0], p[1]), l = (p) => g.lineTo(p[0], p[1]);
    const q = (c, p) => g.quadraticCurveTo(c[0], c[1], p[0], p[1]);
    const b = (c1, c2, p) => g.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], p[0], p[1]);
    // barrel, chest, haunch, back
    m(P(-420, -640));
    b(P(-440, -560), P(-410, -480), P(-330, -450));        // chest to the elbow
    b(P(-200, -380), P(100, -390), P(250, -450));          // belly, tucked up toward the flank
    b(P(330, -460), P(420, -500), P(450, -580));           // stifle to the buttock
    b(P(470, -660), P(440, -730), P(360, -760));           // the rump
    b(P(240, -790), P(60, -700), P(-100, -720));           // croup and the dip of the back
    b(P(-180, -740), P(-230, -780), P(-260, -790));        // withers
    l(P(-300, -740)); l(P(-420, -640)); g.closePath(); cut(g);
    // the neck, arched, and the head
    g.save();
    const base = P(-300, -720);
    g.translate(base[0], base[1]); g.rotate(r.pitch + r.head * 0.5); g.translate(-base[0], -base[1]);
    const N = (x, y) => [x, y];
    m(N(-250, -800));
    b(N(-280, -900), N(-350, -1000), N(-420, -1030));      // crest of the neck up to the poll
    g.save(); g.translate(-420, -1030); g.rotate(r.head * 0.6); g.translate(420, 1030);
    // head: poll → forehead → dished face → muzzle → chin → jaw → throat
    l(N(-440, -1036)); b(N(-480, -1030), N(-520, -1000), N(-560, -930));
    b(N(-585, -885), N(-610, -840), N(-612, -812));
    b(N(-612, -792), N(-596, -780), N(-570, -786));        // muzzle and lip
    l(N(-560, -800)); b(N(-540, -800), N(-520, -810), N(-500, -836));
    b(N(-470, -850), N(-440, -880), N(-430, -905));        // the round jaw
    // ears
    g.lineTo(-436, -930);
    g.restore();
    b(N(-450, -880), N(-460, -760), N(-430, -650));        // throat down to the chest
    l(N(-300, -700)); g.closePath(); cut(g);
    g.save(); g.translate(-420, -1030); g.rotate(r.head * 0.6); g.translate(420, 1030);
    for (const [ex, ey, w] of [[-430, -1032, 1], [-412, -1026, 0.9]]) { g.moveTo(ex - 14 * w, ey); g.quadraticCurveTo(ex - 10, ey - 60 * w, ex + 6, ey - 74 * w); g.quadraticCurveTo(ex + 14, ey - 40 * w, ex + 12 * w, ey + 4); g.closePath(); cut(g); }
    g.restore();
    g.restore();
  }

  function manePath(g, r) {
    const base = pt(r, [-300, -720]);
    g.save(); g.translate(base[0], base[1]); g.rotate(r.pitch + r.head * 0.5); g.translate(-base[0], -base[1]);
    // a long mane along the crest, falling back and down
    for (let i = 0; i < 7; i++) {
      const u = i / 6;
      const p0 = [lerp(-410, -250, u), lerp(-1030, -790, u) + 6];
      const pts = ribbon(p0, 0.35 + 0.6 * u + 0.15 * Math.sin(r.T * 1.4 + i), lerp(170, 260, u), r.T, 14 * r.wind, i * 1.7, 10, 60);
      limbOutline(g, pts, pts.map((_, j) => lerp(44, 4, j / (pts.length - 1)))); cut(g);
    }
    // forelock
    const fl = ribbon([-436, -1030], 2.4, 70, r.T, 6, 3.3, 6, 10);
    limbOutline(g, fl, fl.map((_, j) => lerp(14, 3, j / (fl.length - 1)))); cut(g);
    g.restore();
  }

  function tailPts(r) {
    const root = pt(r, [430, -700]);
    return ribbon(root, 0.55 - 0.15 * r.wind + (r.name === 'gallop' ? -0.5 : 0), 560, r.T, 26 * r.wind, 5.1, 16, r.name === 'gallop' ? 40 : 260);
  }
  function tailPath(g, r) {
    // a full tail: a thick dock, then strands that fan and fall
    const root = pt(r, [430, -700]);
    const dock = ribbon(root, 0.9, 120, r.T, 4, 5.1, 6, 10);
    limbOutline(g, dock, dock.map((_, j) => lerp(56, 46, j / (dock.length - 1)))); cut(g);
    for (let i = 0; i < 5; i++) {
      const st = ribbon(dock[3], 1.0 + i * 0.05 - 0.25 * r.wind + (r.name === 'gallop' ? -0.75 : 0), 400 + i * 24, r.T, 18 * r.wind, 5.1 + i * 0.5, 14, r.name === 'gallop' ? 40 : 120);
      limbOutline(g, st, st.map((_, j) => lerp(46, 8, Math.pow(j / (st.length - 1), 1.5)))); cut(g);
    }
  }

  function shape(g, color, P, r) {
    g.translate(0, r.bob);
    g.fillStyle = color;
    g.beginPath(); for (const i of r.far) legPath(g, r, i); g.fill();
    g.beginPath(); tailPath(g, r); g.fill();
    g.beginPath(); bodyPath(g, r); g.fill();
    g.beginPath(); manePath(g, r); g.fill();
    g.beginPath(); for (const i of r.near) legPath(g, r, i); g.fill();
  }

  function ornaments(g, P, r, a, color) {
    if (a <= 0.01) return;
    g.translate(0, r.bob);
    g.globalAlpha *= a;
    g.strokeStyle = color; g.fillStyle = color; g.lineCap = 'round'; g.lineJoin = 'round';
    const base = pt(r, [-300, -720]);
    g.save(); g.translate(base[0], base[1]); g.rotate(r.pitch + r.head * 0.5); g.translate(-base[0], -base[1]);
    g.save(); g.translate(-420, -1030); g.rotate(r.head * 0.6); g.translate(420, 1030);
    // headstall: brow band, noseband, cheek strap, a forehead jewel and a white plume
    g.lineWidth = 7;
    g.beginPath(); g.moveTo(-446, -1010); g.lineTo(-492, -1004); g.stroke();
    g.beginPath(); g.moveTo(-430, -990); g.quadraticCurveTo(-470, -900, -520, -840); g.stroke();
    g.beginPath(); g.moveTo(-500, -852); g.lineTo(-596, -880); g.stroke();
    g.beginPath(); g.arc(-506, -990, 11, 0, TAU); g.fill();
    g.restore();
    // a jewelled collar at the throat
    g.lineWidth = 9; g.beginPath(); g.moveTo(-320, -820); g.quadraticCurveTo(-380, -760, -440, -730); g.stroke();
    for (let i = 0; i < 5; i++) { const u = i / 4; g.beginPath(); g.arc(lerp(-330, -436, u), lerp(-806, -738, u) + 12, 7, 0, TAU); g.fill(); }
    g.restore();
    // gold bands above the hooves
    g.lineWidth = 9;
    for (const i of r.near) {
      const L = r.legs[i].map((p, j) => (j === 0 || i % 2 === 0 ? pt(r, p) : p));
      const c = L[2], d = [L[3][0] - c[0], L[3][1] - c[1]], n = Math.hypot(d[0], d[1]) || 1, v = [-d[1] / n * 24, d[0] / n * 24];
      g.beginPath(); g.moveTo(c[0] + v[0], c[1] + v[1]); g.lineTo(c[0] - v[0], c[1] - v[1]); g.stroke();
    }
  }

  function before(ctx, P, r, k) {
    // a faint moon-halo on the ground he stands on
    const s = P.s;
    KIT.glow(ctx, P.x, P.y - 520 * s, 900 * s, '#dfe8ff', 0.22 * k);
  }

  function after(ctx, P, r) {
    if (r.tail <= 0.01) return;
    // black hairs in the tail: dark strands combed through it (serpents hanging as hairs)
    const sx = P.flip ? -P.s : P.s;
    ctx.save(); ctx.translate(P.x, P.y + r.bob * P.s); ctx.scale(sx, P.s);
    const pts = tailPts(r);
    ctx.strokeStyle = '#08060a'; ctx.lineCap = 'round';
    for (let s = 0; s < 9; s++) {
      const off = (s - 4) * 9, a = clamp(r.tail * 1.4 - s * 0.06);
      if (a <= 0) continue;
      ctx.globalAlpha = a; ctx.lineWidth = 7 - Math.abs(s - 4) * 0.6;
      ctx.beginPath();
      pts.forEach((p, j) => { const u = j / (pts.length - 1); const x = p[0] + off * (0.4 + u) + Math.sin(u * 9 + s + r.T * 2) * 4; if (j) ctx.lineTo(x, p[1]); else ctx.moveTo(x, p[1]); });
      ctx.stroke();
    }
    ctx.restore();
  }

  const bible = {
    name: 'Uchchaihshravas, king of horses',
    role: 'The white horse that rose from the churned ocean, honoured by the gods; the subject of Kadru and Vinata\'s wager (CE 1.15–20).',
    palette: { fill: '#c4cbe4', lit: '#ffffff', inner: '#eef2ff', rimDim: '#b8ccff', rimBright: '#ffffff', ornamentDim: '#c8a040', ornament: '#ffe9a0' },
    proportions: '≈ 1000 units to the poll, ≈ 1250 nose to tail; withers ≈ 790. Deep chest, fine wedge head, long mane and a tail to the ground.',
    props: ['gold headstall with a forehead jewel', 'jewelled collar', 'gold bands above the hooves', 'pose.tail: black hairs in the tail (episode 18)'],
    light: 'Moon-white: the only PALE-filled figure (fill #c4cbe4 → lit #ffffff), silver-blue rim #b8ccff → #ffffff, inner #eef2ff, glow 0.9, gold ornaments.',
    poses: [{ name: 'stand' }, { name: 'walk', note: 'phase' }, { name: 'gallop', note: 'phase' }, { name: 'rear', note: 'k' }, { name: 'bow', note: 'k: head lowered' }],
    voice: null,
  };

  CH.define({
    id: 'horse', bible, rig, shape, ornaments, before, after, defaultPose: 'stand',
    rule: {
      fill: '#c4cbe4', lit: '#ffffff', litGain: 0.9,
      rim: ['#b8ccff', '#ffffff'], inner: '#eef2ff', innerA: [0.55, 0.3], glow: 0.9,
      ornament: ['#c8a040', '#ffe9a0'], ornamentA: [0.75, 1.0],
    },
    bounds: () => [-700, -1220, 1100, 40],
  });
  CH.ROSTER.push('horse');
})();
