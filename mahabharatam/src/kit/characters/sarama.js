/*
 * CHARACTER · SARAMA (devashuni, the dog of the gods) · and CH.canine, the shared
 * dog rig (her son, `pup`, is built on it too: src/kit/characters/pup.js).
 *
 * Episode 5 (Adi Parva 3): her son is beaten at Janamejaya's sacrifice at
 * Kurukshetra though he did no wrong; she comes to the king and curses him:
 * "an unseen danger will fall upon you".
 *
 * A great, dignified hound, not a pet: a sighthound's deep chest and tucked
 * waist, long legs, a long arched neck, a wedge head with tall pointed ears,
 * a mane of flame-like tufts down the back of the neck, a sickle plume of a
 * tail. A collar of pearls with a pendant jewel, a four-point STAR on her
 * brow, mural swirl lines on shoulder and haunch.
 *
 * SIGNATURE LIGHT: dawn-pearl. She is luminous, so her rim runs all the way
 * round (halo), rose-pearl #d9a88c → #fff4e8, on a deep violet-indigo fill
 * #191428; a soft rose aura behind her (#ffd2b8) that flares when she curses;
 * her eye and brow-star glint. Never gold, never silver-blue: she is neither
 * Vyasa nor the Pitrs.
 *
 * Faces LEFT natively. Paws on (x, y). scale 1 ≈ 1000 px to the ear tips when
 * standing (shoulder ≈ 560), ≈ 1140 long from nose to tail.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, CH = KIT.characters;
  const { TAU, clamp, lerp } = R;
  const { cut, limb, limbOutline } = CH;

  /** rotate p about o by a (canvas sense: a > 0 lifts a point that lies to the −x side). */
  const rot = (p, a, o = [0, 0]) => { const c = Math.cos(a), s = Math.sin(a), x = p[0] - o[0], y = p[1] - o[1]; return [o[0] + x * c - y * s, o[1] + x * s + y * c]; };
  const add = (a, b) => [a[0] + b[0], a[1] + b[1]];

  // ─── the canine rig (shared) ───────────────────────────────────────────────
  /**
   * D = { bx, by (body scale), leg (leg scale), neck, head (scales), ears: 'prick'|'soft',
   *       tail: 'plume'|'thin', mane, swirls }
   * Pose names: stand · walk (phase, stride) · run (phase) · sit · speak (base stand|sit) ·
   *             curse (k) · comfort (k) · sniff (k) · cower (k) · cry (k, seated)
   */
  function canineRig(P, D) {
    const po = P.po, k = po.k, T = P.T;
    const name = po.name;
    const sitting = po.base === 'sit' || name === 'sit' || name === 'cry';
    const run = name === 'run';
    const st = sitting ? 0 : name === 'walk' ? (po.stride || 1) : run ? 1.45 : 0;
    const ph = po.phase || 0;
    const cower = name === 'cower' ? k * 1.4 : 0;
    const S0 = [-215 * D.bx, -440 * D.by], H0 = [235 * D.bx, -450 * D.by];
    // body transform: sitting lowers the hip and tilts the body up; cowering crouches
    let Hn = H0.slice(), tilt = 0;
    if (sitting) { Hn = [H0[0] - 60 * D.bx, -150 * D.by]; tilt = 0.8; }
    else {
      Hn = [H0[0], H0[1] * (1 - 0.32 * cower)];
      tilt = (run ? 0.06 * Math.sin(ph * 2) : 0) - 0.08 * cower + (name === 'sniff' ? -0.05 * k : 0);
    }
    const bodyT = (p) => rot([p[0] - H0[0] + Hn[0], p[1] - H0[1] + Hn[1]], tilt, Hn);
    const S = bodyT(S0);
    const legs = [];
    // front legs (near = 0, far = 1); hind legs (near = 2, far = 3)
    const offs = run ? [0, 0.5, Math.PI, Math.PI + 0.5] : [0, Math.PI, Math.PI, 0];
    const L = D.leg;
    for (let i = 0; i < 2; i++) {
      const p = ph + offs[i];
      let th = st * 0.36 * Math.sin(p), flex = st * 0.7 * Math.max(0, Math.cos(p));
      let Sx = add(S, [i ? 18 * D.bx : 0, 0]);
      let E, W, F;
      if (sitting) {
        const paw = [Sx[0] - 30 * D.bx, 0];
        E = [lerp(Sx[0], paw[0], 0.4) + 14 * L, lerp(Sx[1], paw[1], 0.4)];
        W = [paw[0] + 10 * L, -80 * L]; F = [paw[0], -20 * L];
      } else {
        const bend = cower * 0.55;
        E = add(Sx, rot([-5 * L, 150 * L], th + bend * 0.5));
        W = add(E, rot([0, 200 * L], th - flex - bend));
        F = add(W, rot([-14 * L, 72 * L], th - flex * 1.5));
      }
      // curse: the near forepaw lifts (k); comfort / sniff: nothing
      if (i === 0 && name === 'curse' && !sitting) {
        const lift = E_out(k);
        W = [lerp(W[0], Sx[0] - 150 * L, lift), lerp(W[1], Sx[1] + 220 * L, lift)];
        E = [lerp(E[0], Sx[0] - 120 * L, lift), lerp(E[1], Sx[1] + 110 * L, lift)];
        F = [lerp(F[0], W[0] - 40 * L, lift), lerp(F[1], W[1] + 50 * L, lift)];
      }
      legs.push({ kind: 'front', S: Sx, E, W, F, far: i === 1 });
    }
    for (let i = 0; i < 2; i++) {
      const p = ph + offs[2 + i];
      const th = st * 0.32 * Math.sin(p), flex = st * 0.5 * Math.max(0, Math.cos(p));
      const Hx = add(bodyT(H0), [i ? 18 * D.bx : 0, 0]);
      let K, Hk, F;
      if (sitting) {
        K = [Hx[0] - 150 * L, -120 * L];
        Hk = [Hx[0] + 50 * L, -36 * L];
        F = [Hx[0] - 110 * L, -10 * L];
      } else {
        const bend = cower * 0.5;
        K = add(Hx, rot([-50 * L, 175 * L], th - bend * 0.6));
        Hk = add(K, rot([95 * L, 150 * L], th + flex + bend * 0.8));
        F = add(Hk, rot([-18 * L, 120 * L], th + flex * 0.3 - bend * 0.3));
      }
      legs.push({ kind: 'hind', H: Hx, K, Hk, F, far: i === 1 });
    }
    function E_out(x) { return 1 - Math.pow(1 - clamp(x), 3); }
    // ground contact: the lowest planted paw sits on y = 0
    let bob = 0;
    if (!sitting) {
      const low = Math.max(...legs.filter((l) => !(l.kind === 'front' && !l.far && name === 'curse')).map((l) => l.F[1] + 16 * L));
      bob = -low;
    }
    // neck + head
    const Nb = bodyT([-255 * D.bx, -500 * D.by]);
    let hv = [-100, -240], ha = 0.05;
    if (name === 'walk') { hv = [-140, -205]; ha = -0.05 + 0.03 * Math.sin(ph * 2); }
    if (run) { hv = [-190, -140]; ha = -0.18; }
    if (sitting) { hv = [-70, -220]; ha = 0.08; }
    if (name === 'speak') ha += 0.15 * k;
    if (name === 'curse') { hv = [lerp(-100, -170, k), lerp(-240, -300, k)]; ha = lerp(0.05, 0.3, k); }
    if (name === 'comfort') { hv = [lerp(hv[0], -330, k), lerp(hv[1], 30, k)]; ha = lerp(ha, -0.55, k); }
    if (name === 'sniff') { hv = [lerp(hv[0], -200, k), lerp(hv[1], 40, k)]; ha = lerp(ha, -0.55, k); }
    if (cower) { hv = [lerp(hv[0], -150, cower), lerp(hv[1], -60, cower)]; ha = lerp(ha, -0.35, cower); }
    if (name === 'cry') { hv = [-40, -230]; ha = lerp(0.08, 0.7, k); }
    const look = P.ex.look || 0;
    ha += look;
    const Hd = add(Nb, [hv[0] * D.neck, hv[1] * D.neck]);
    const jaw = clamp(P.ex.speak || 0) * 0.32 + (name === 'cry' ? 0.3 * k : 0) + (name === 'curse' ? 0.1 * k : 0);
    // tail
    const T0 = bodyT([318 * D.bx, -505 * D.by]);
    const wag = Math.sin(T * (name === 'walk' || run ? 7 : 1.3)) * (D.tail === 'thin' ? 0.25 : 0.08);
    let tail;
    if (sitting) tail = [T0, [Hn[0] + 190 * D.bx, -30], [Hn[0] - 40 * D.bx, -12]];
    else if (cower) tail = [T0, add(T0, [lerp(120, 30, cower) * D.bx, lerp(-150, 120, cower) * D.by]), add(T0, [lerp(220, -70, cower) * D.bx, lerp(-60, 190, cower) * D.by])];
    else tail = [T0, add(T0, rot([130 * D.bx, -170 * D.by], wag)), add(T0, rot([(run ? 260 : 210) * D.bx, (run ? -110 : -40) * D.by], wag * 1.6))];
    return { D, legs, bob, tilt, Hn, H0, Nb, Hd, ha, jaw, tail, sitting, cower, name, T, k, earsBack: cower || (name === 'run' ? 0.6 : 0) };
  }

  /** The body (in body frame, then placed by tilt about the hip). */
  function bodyPath(g, r) {
    const { D } = r, bx = D.bx, by = D.by;
    g.save();
    g.translate(r.Hn[0], r.Hn[1]); g.rotate(r.tilt); g.translate(-r.H0[0], -r.H0[1]);
    const p = (x, y) => [x * bx, y * by];
    const m = (x, y) => g.moveTo(...p(x, y)), b = (a, c, d, e, f, h) => g.bezierCurveTo(...p(a, c), ...p(d, e), ...p(f, h));
    m(-240, -575);
    b(-285, -560, -322, -490, -316, -420);
    b(-310, -360, -292, -312, -240, -296);
    b(-120, -286, 0, -350, 80, -366);
    b(150, -372, 200, -330, 252, -326);
    b(312, -336, 338, -420, 328, -482);
    b(318, -532, 282, -552, 240, -552);
    b(100, -562, -100, -562, -240, -575);
    g.closePath(); cut(g);
    // the haunch: a full thigh over the hip
    g.moveTo(...p(330, -420)); g.ellipse(...p(240, -410), 96 * bx, 92 * by, 0.3, 0, TAU); cut(g);
    g.restore();
  }

  function legPaths(g, r, far) {
    const L = r.D.leg * (r.D.legW || 1);
    for (const l of r.legs) {
      if (!!l.far !== far) continue;
      if (l.kind === 'front') {
        limb(g, [l.S, l.E, l.W], [92 * L, 46 * L, 32 * L]);
        limb(g, [l.W, l.F], [32 * L, 28 * L]);
        g.moveTo(l.F[0] + 30 * L, l.F[1]); g.ellipse(l.F[0] - 14 * L, l.F[1] + 2 * L, 38 * L, 16 * L, -0.08, 0, TAU); cut(g);
      } else {
        limb(g, [l.H, l.K], [120 * L, 60 * L]);
        limb(g, [l.K, l.Hk], [58 * L, 30 * L]);
        limb(g, [l.Hk, l.F], [30 * L, 26 * L]);
        g.moveTo(l.F[0] + 28 * L, l.F[1]); g.ellipse(l.F[0] - 14 * L, l.F[1] + 2 * L, 36 * L, 15 * L, -0.06, 0, TAU); cut(g);
      }
    }
  }

  function neckPath(g, r) {
    const { D } = r, mid = [lerp(r.Nb[0], r.Hd[0], 0.5) - 20 * D.neck, lerp(r.Nb[1], r.Hd[1], 0.5)];
    limb(g, [r.Nb, mid, r.Hd], [170 * D.by, 116 * D.head, 92 * D.head]);
    if (D.mane) {
      // flame-tufts down the back of the neck
      for (let i = 0; i < 5; i++) {
        const u = 0.15 + i * 0.17, a = [lerp(r.Nb[0], r.Hd[0], u), lerp(r.Nb[1], r.Hd[1], u)];
        const dx = r.Hd[0] - r.Nb[0], dy = r.Hd[1] - r.Nb[1], l = Math.hypot(dx, dy);
        const nx = dy / l, ny = -dx / l;   // back side of the neck (+x side)
        const w = (72 - i * 6) * D.by, len = (70 - i * 6) * D.by, sw = Math.sin(r.T * 2.2 + i) * 8;
        const base = [a[0] + nx * w * 0.7, a[1] + ny * w * 0.7];
        g.moveTo(base[0] - dx / l * 26, base[1] - dy / l * 26);
        g.quadraticCurveTo(base[0] + nx * len * 0.7 + sw, base[1] + ny * len * 0.7, base[0] + nx * len + dx / l * 20 + sw, base[1] + ny * len + dy / l * 20 - 10);
        g.quadraticCurveTo(base[0] + nx * len * 0.3, base[1] + ny * len * 0.3 + 10, base[0] + dx / l * 30, base[1] + dy / l * 30);
        g.closePath(); cut(g);
      }
    }
  }

  function headPath(g, r) {
    const s = r.D.head;
    g.save();
    g.translate(r.Hd[0], r.Hd[1]); g.rotate(r.ha); g.scale(s, s);
    // skull
    g.moveTo(42, -10); g.ellipse(-20, -10, 64, 52, 0, 0, TAU); cut(g);
    // upper muzzle (a long wedge)
    g.moveTo(-30, -52); g.quadraticCurveTo(-110, -40, -168, -10); g.quadraticCurveTo(-178, 2, -166, 10); g.lineTo(-60, 22); g.lineTo(-20, 30); g.closePath(); cut(g);
    // lower jaw, hinged under the ear
    g.save(); g.translate(-30, 18); g.rotate(-r.jaw);
    g.moveTo(0, -6); g.lineTo(-122, -2); g.quadraticCurveTo(-130, 12, -112, 16); g.lineTo(0, 22); g.closePath(); cut(g);
    g.restore();
    // ears
    const back = r.earsBack;
    if (r.D.ears === 'prick') {
      g.save(); g.translate(10, -48); g.rotate(back * 1.1);
      g.moveTo(-26, 4); g.quadraticCurveTo(-10, -70, 8, -118); g.quadraticCurveTo(30, -60, 36, 4); g.closePath(); cut(g);
      g.restore();
      g.save(); g.translate(-18, -50); g.rotate(back * 1.1 - 0.08);
      g.moveTo(-20, 4); g.quadraticCurveTo(-8, -60, 4, -100); g.quadraticCurveTo(22, -50, 26, 4); g.closePath(); cut(g);
      g.restore();
    } else {
      // soft ears: up, then the tips fold forward (a pup's)
      g.save(); g.translate(8, -46); g.rotate(back * 1.2);
      g.moveTo(-26, 6); g.quadraticCurveTo(-18, -60, 4, -84); g.quadraticCurveTo(-30, -84, -52, -52); g.quadraticCurveTo(-20, -60, 30, 6); g.closePath(); cut(g);
      g.restore();
    }
    g.restore();
  }

  function tailPath(g, r) {
    const [p0, p1, p2] = r.tail, pts = [];
    for (let i = 0; i <= 12; i++) {
      const u = i / 12, v = 1 - u;
      pts.push([v * v * p0[0] + 2 * v * u * p1[0] + u * u * p2[0], v * v * p0[1] + 2 * v * u * p1[1] + u * u * p2[1]]);
    }
    const plume = r.D.tail === 'plume';
    const ws = pts.map((_, i) => { const u = i / 12; return (plume ? 36 + 48 * Math.sin(Math.PI * Math.min(1, u * 1.15)) * (1 - u * 0.4) : lerp(34, 10, u)) * r.D.by; });
    limbOutline(g, pts, ws); cut(g);
  }

  /**
   * Draw a many-piece silhouette as ONE bitmap, so a composite op (the halo's destination-in)
   * applies to the whole shape once instead of to each piece. Pure: the scratch canvas is
   * cleared before every use.
   */
  const flatBufs = new Map();
  function flat(g, draw) {
    const cv = g.canvas, key = cv.width + 'x' + cv.height;
    let b = flatBufs.get(key);
    if (!b) { const c = document.createElement('canvas'); c.width = cv.width; c.height = cv.height; b = c.getContext('2d'); flatBufs.set(key, b); }
    b.setTransform(1, 0, 0, 1, 0, 0); b.globalCompositeOperation = 'source-over'; b.globalAlpha = 1;
    b.clearRect(0, 0, cv.width, cv.height);
    b.setTransform(g.getTransform());
    draw(b);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(b.canvas, 0, 0); g.restore();
  }
  CH.flat = CH.flat || flat;

  function canineShape(g, color, P, r) {
    if (g.globalCompositeOperation !== 'source-over' && g.canvas) { flat(g, (b) => canineShape0(b, color, P, r)); return; }
    canineShape0(g, color, P, r);
  }
  function canineShape0(g, color, P, r) {
    g.translate(0, r.bob);
    g.fillStyle = color;
    g.beginPath(); legPaths(g, r, true); g.fill();
    g.beginPath(); tailPath(g, r); g.fill();
    g.beginPath(); bodyPath(g, r); g.fill();
    g.beginPath(); neckPath(g, r); g.fill();
    g.beginPath(); headPath(g, r); g.fill();
    g.beginPath(); legPaths(g, r, false); g.fill();
  }

  /** Head-frame point → local (pre-bob) coordinates. */
  function headPt(r, x, y) {
    const s = r.D.head, c = Math.cos(r.ha), sn = Math.sin(r.ha);
    return [r.Hd[0] + (x * c - y * sn) * s, r.Hd[1] + (x * sn + y * c) * s];
  }

  function canineOrnaments(g, P, r, a, color, o = {}) {
    if (a <= 0.01) return;
    g.translate(0, r.bob);
    g.globalAlpha *= a;
    g.strokeStyle = color; g.fillStyle = color; g.lineCap = 'round';
    const D = r.D;
    // eye: an almond glint
    const e = headPt(r, -62, -22);
    g.save(); g.translate(e[0], e[1]); g.rotate(r.ha - 0.15);
    g.beginPath(); g.ellipse(0, 0, 13 * D.head, 5.5 * D.head, 0, 0, TAU); g.fill();
    g.restore();
    if (o.collar) {
      // collar of pearls around the neck, a pendant jewel
      const u = 0.22, c0 = [lerp(r.Nb[0], r.Hd[0], u), lerp(r.Nb[1], r.Hd[1], u)];
      const dx = r.Hd[0] - r.Nb[0], dy = r.Hd[1] - r.Nb[1], l = Math.hypot(dx, dy), nx = dy / l, ny = -dx / l;
      const w = 66 * D.by;
      CH.beads(g, [c0[0] + nx * w, c0[1] + ny * w], [c0[0] - dx / l * 18, c0[1] - dy / l * 18], [c0[0] - nx * w, c0[1] - ny * w], 9, 6 * D.by);
      const pd = [c0[0] - nx * w * 0.9, c0[1] - ny * w * 0.9 + 22 * D.by];
      g.beginPath(); g.moveTo(pd[0], pd[1] - 14 * D.by); g.lineTo(pd[0] + 10 * D.by, pd[1]); g.lineTo(pd[0], pd[1] + 18 * D.by); g.lineTo(pd[0] - 10 * D.by, pd[1]); g.closePath(); g.fill();
    }
    if (o.star) {
      // the four-point star on her brow
      const st = headPt(r, -44, -46), R0 = 16 * D.head;
      g.beginPath();
      for (let i = 0; i < 8; i++) { const ang = (i / 8) * TAU - Math.PI / 2, rr = i % 2 ? R0 * 0.32 : R0; g.lineTo(st[0] + Math.cos(ang) * rr, st[1] + Math.sin(ang) * rr); }
      g.closePath(); g.fill();
    }
    if (D.swirls) {
      // mural swirl lines on the shoulder and the haunch
      g.save();
      g.translate(r.Hn[0], r.Hn[1]); g.rotate(r.tilt); g.translate(-r.H0[0], -r.H0[1]);
      g.lineWidth = 3;
      for (const [cx, cy, rr, a0] of [[-200, -430, 60, 3.6], [-200, -430, 38, 3.8], [230, -420, 70, 4.2], [230, -420, 46, 4.4]]) {
        g.beginPath(); g.arc(cx * D.bx, cy * D.by, rr * D.by, a0, a0 + 2.4); g.stroke();
      }
      // the line of the belly and the back
      g.beginPath(); g.moveTo(-230 * D.bx, -540 * D.by); g.bezierCurveTo(-100 * D.bx, -530 * D.by, 100 * D.bx, -530 * D.by, 230 * D.bx, -525 * D.by); g.lineWidth = 2; g.stroke();
      g.restore();
    }
    if (o.anklets) {
      g.lineWidth = 5 * D.leg;
      for (const l of r.legs) {
        if (l.kind !== 'front') continue;
        const p = [lerp(l.E[0], l.W[0], 0.85), lerp(l.E[1], l.W[1], 0.85)];
        g.beginPath(); g.moveTo(p[0] - 20 * D.leg, p[1]); g.lineTo(p[0] + 20 * D.leg, p[1]); g.stroke();
      }
    }
  }

  /** The shared dog rig (CH.canine.rig(P, D), .shape, .ornaments, .headPt). */
  CH.canine = { rig: canineRig, shape: canineShape, ornaments: canineOrnaments, headPt };

  // ─── SARAMA ────────────────────────────────────────────────────────────────
  const D = { bx: 1, by: 1, leg: 1, neck: 1, head: 1.05, ears: 'prick', tail: 'plume', mane: true, swirls: true };

  const rig = (P) => canineRig(P, D);

  function before(ctx, P, r, k) {
    // her dawn-pearl aura: wider and brighter when she curses
    const flare = (r.name === 'curse' ? r.k : 0) + (P.ex.mood === 'wrath' ? 0.4 : 0);
    const sx = P.flip ? -P.s : P.s;
    const cx = P.x + lerp(r.Nb[0], r.Hn[0], 0.4) * sx, cy = P.y + (lerp(r.Nb[1], r.Hn[1], 0.5) + r.bob) * P.s;
    KIT.glow(ctx, cx, cy, (760 + 340 * flare) * P.s, '#ffd2b8', (0.22 + 0.18 * flare) * k);
    const h = headPt(r, -20, -10);
    KIT.glow(ctx, P.x + h[0] * sx, P.y + (h[1] + r.bob) * P.s, 260 * P.s, '#fff0e0', (0.18 + 0.12 * flare) * k);
  }
  function after(ctx, P, r, k) {
    const sx = P.flip ? -P.s : P.s;
    const wrath = P.ex.mood === 'wrath' ? 1 : 0;
    const e = headPt(r, -62, -22), s = headPt(r, -44, -46);
    KIT.glow(ctx, P.x + s[0] * sx, P.y + (s[1] + r.bob) * P.s, 60 * P.s, '#fff6e8', 0.5 * k);
    KIT.glow(ctx, P.x + e[0] * sx, P.y + (e[1] + r.bob) * P.s, (40 + 40 * wrath) * P.s, wrath ? '#ffb090' : '#ffe8d8', (0.35 + 0.4 * wrath) * k);
  }

  const bible = {
    name: 'Sarama (devashuni, the dog of the gods)',
    role: 'Mother of the pup beaten at Janamejaya\'s sacrifice at Kurukshetra; she curses the king: "an unseen danger will fall upon you" (Adi Parva 3).',
    palette: { fill: '#191428', inner: '#9a6a7c', rimDim: '#d9a88c', rimBright: '#fff4e8', aura: '#ffd2b8', ornament: '#fff6dc' },
    proportions: 'A great sighthound: ≈ 560 units at the shoulder, ≈ 1000 to the ear tips standing (Janamejaya stands 1230 with his crown), ≈ 1140 from nose to tail. Seated: head ≈ 760, ears ≈ 900. Deep chest, tucked waist, long arched neck.',
    props: ['four-point star on her brow', 'collar of pearls with a pendant jewel', 'flame-tufted mane down the neck', 'sickle plume of a tail', 'gold anklets on the forelegs', 'mural swirl lines on shoulder and haunch'],
    light: 'Dawn-pearl, luminous: fill #191428 with a halo rim all round, rose-pearl #d9a88c → #fff4e8; inner #9a6a7c; a rose aura (#ffd2b8) behind, flaring when she curses; eye and brow-star glint (mood wrath: the eye burns rose).',
    poses: [
      { name: 'stand', note: 'four-square, head high' }, { name: 'walk', note: 'a stately trot (phase, stride)' }, { name: 'run', note: 'gallop (phase)' },
      { name: 'sit', note: 'upright on her haunches, like a temple guardian' }, { name: 'speak', note: 'jaw moves with expression.speak; base stand|sit' },
      { name: 'curse', note: 'k: head high and forward, near forepaw lifted, the aura flares' }, { name: 'comfort', note: 'k: head lowered to her son' },
    ],
    voice: 'sarama',   // the speaker key in script/cast.json
  };

  const mod = CH.define({
    id: 'sarama', bible, rig, before, after, defaultPose: 'stand',
    shape: canineShape,
    ornaments: (g, P, r, a, c) => canineOrnaments(g, P, r, a, c, { collar: true, star: true, anklets: true }),
    rule: {
      fill: '#221a36', lit: '#3a2e52', litGain: 0.9,
      rim: ['#d9a88c', '#fff4e8'], inner: '#9a6a7c', innerA: [0.3, 0.4], glow: 0.9, halo: 0.7, rimW: 1.15,
      ornament: ['#e8c48c', '#fff6dc'], ornamentA: [0.5, 0.95],
    },
    bounds: (P, r) => [-760, -1060, 620, 40],
  });
  /** Screen position of a named point: 'head', 'eye', 'nose', 'chest'. */
  mod.anchor = (opts, name) => {
    const P = CH.resolve(opts, mod._def), r = rig(P), sx = P.flip ? -P.s : P.s;
    const lp = name === 'eye' ? headPt(r, -62, -22) : name === 'nose' ? headPt(r, -170, 0) : name === 'chest' ? [-300, -420] : headPt(r, -20, -10);
    return [P.x + lp[0] * sx, P.y + (lp[1] + r.bob) * P.s];
  };
  CH.ROSTER.push('sarama');
})();
