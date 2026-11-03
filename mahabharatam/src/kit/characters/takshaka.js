/*
 * CHARACTER · TAKSHAKA (king of the Nagas) · `takshaka`
 *
 * Episode 6 (Adi Parva 3): he covets the earrings of King Paushya's queen. In
 * the guise of a beggar he snatches them from Uttanka on the road, takes his own
 * form and vanishes down a cleft into the Naga world; there, overwhelmed by fire
 * and smoke, he gives them back. He killed King Parikshit, Janamejaya's father.
 *
 * NAGA FORM (every pose but 'guise…'): a crowned king from the waist up (broad
 * chest, armlets, layered necklaces, a jewelled band where the man becomes the
 * serpent) rising from a great serpent body that falls in an S to the ground,
 * loops once into a coil and runs out into a long tail. Behind his head a
 * CANOPY OF FIVE COBRA HOODS fans up like a halo, each with its spectacle mark;
 * the front-most arches over his brow. A tall crown with a serpent-jewel (mani).
 *
 * DISGUISE ('guise', 'guise-walk', 'guise-run', 'guise-grab'): a thin, stooped
 * beggar with a shaven head, a sparse beard, a loincloth and a begging bowl, who
 * SHIMMERS: a cold green double-image wavers about him (he "appeared and
 * disappeared"), and the same cold rim betrays him.
 *
 * SIGNATURE LIGHT: cold green. Fill #06100c, inner #0c3a28, rim #1f9a64 →
 * #a8ffd0 (rim ×1.1, glow 1.1), ornaments #3aa878 → #d8ffe8; his eyes, the
 * cobras' eyes and the mani burn green-white; a cold aura behind the hoods.
 *
 * Faces LEFT natively. (x, y) = where the serpent body meets the ground under
 * his chest. scale 1 ≈ 1430 px to the top of the hoods (×1.15 Janamejaya's
 * crown), ≈ 1450 long with the tail. Disguised: ≈ 940 px.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, CH = KIT.characters;
  const { TAU, clamp, lerp } = R;
  const { cut, limb, ik, hand, along } = CH;

  const W0 = [0, -560];        // waist: man above, serpent below
  const NECK = [20, -930];
  const HOODS = [[277, -1123], [201, -1245], [74, -1313], [-70, -1308], [-189, -1237]];   // a fan on a 300-unit arc round the head
  const SPINE = [[0, -560], [16, -450], [60, -320], [140, -190], [250, -100], [390, -56], [540, -70], [650, -150], [640, -260], [540, -296], [440, -236], [452, -130], [570, -90], [710, -104], [820, -64], [930, -44], [1010, -60]];
  const SPW = [120, 126, 130, 132, 128, 122, 116, 108, 100, 92, 86, 80, 70, 56, 40, 24, 10];

  /** Catmull-Rom resample of a polyline (n points per segment). */
  function smooth(pts, n = 4) {
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      for (let j = 0; j < n; j++) {
        const t = j / n, t2 = t * t, t3 = t2 * t;
        out.push([0, 1].map((c) => 0.5 * (2 * p1[c] + (-p0[c] + p2[c]) * t + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * t3)));
      }
    }
    out.push(pts[pts.length - 1]);
    return out;
  }

  function rig(P) {
    const po = P.po, k = po.k, T = P.T, name = po.name;
    const guise = name.startsWith('guise');
    const r = { T, guise, name, k, look: P.ex.look || 0, speak: P.ex.speak || 0, wrath: P.ex.mood === 'wrath' };
    if (guise) return guiseRig(P, r);
    // the man's lean about the waist (+ forward), the hoods' flare
    let lean = 0.02 * Math.sin(T * 0.9), flare = 0, canopyTilt = 0;
    let nh = [-60, -650], nk = 'open', na = Math.PI / 2 + 0.5, fh = [76, -660], fk = 'fist', fa = Math.PI / 2;
    if (name === 'speak') { nh = along(nh, [-290, -880], k); na = Math.PI + 0.4; }
    if (name === 'strike') { lean += 0.36 * k; flare = k; canopyTilt = 0.25 * k; nh = along(nh, [-380, -800], k); na = Math.PI + 0.1; fh = along(fh, [-220, -740], k); fk = 'open'; fa = Math.PI + 0.2; }
    if (name === 'recoil') { lean -= 0.32 * k; flare = 0.4 * k; canopyTilt = -0.2 * k; nh = along(nh, [-170, -1040], k); na = -Math.PI / 2 - 0.4; fh = along(fh, [-90, -990], k); fk = 'open'; fa = -Math.PI / 2 - 0.2; }
    if (name === 'give') { lean += 0.14 * k; nh = along(nh, [-290, -720], k); nk = 'cup'; na = 0; }
    if (name === 'dive') { lean += 1.25 * E3(k); canopyTilt = 0.35 * k; flare = -0.3 * k; nh = along(nh, [-150, -1160], k); fh = along(fh, [-90, -1130], k); fk = 'open'; na = lerp(na, -Math.PI / 2 - 0.3, k); fa = -Math.PI / 2 - 0.2; }
    function E3(x) { return x * x * (3 - 2 * x); }
    r.lean = lean; r.flare = flare; r.canopyTilt = canopyTilt;
    r.hand = nh; r.nearKind = nk; r.nearA = na; r.farHand = fh; r.farKind = fk; r.farA = fa;
    // the serpent body: a slow wave runs down the tail; the first segments bend with the lean
    const sp = SPINE.map((p, i) => {
      const u = i / (SPINE.length - 1);
      const wv = Math.sin(T * 1.6 - i * 0.7) * 14 * u * u;
      return [p[0] + (i < 3 ? -Math.sin(lean) * (3 - i) * 30 : 0), p[1] + wv];
    });
    r.spine = smooth(sp, 4);
    r.spineW = smooth(SPW.map((w) => [w, 0]), 4).map((p) => p[0]);
    const c = Math.cos(-lean), s = Math.sin(-lean);
    r.rot = (p) => [W0[0] + (p[0] - W0[0]) * c - (p[1] - W0[1]) * s, W0[1] + (p[0] - W0[0]) * s + (p[1] - W0[1]) * c];
    r.shN = r.rot([6, -890]); r.shF = r.rot([34, -894]);
    // hand targets are in world space, except the dive (they ride the lean)
    if (name === 'dive') { r.hand = r.rot(nh); r.farHand = r.rot(fh); }
    r.bob = 0;
    return r;
  }

  // ─── the naga form ─────────────────────────────────────────────────────────
  function serpentPath(g, r) {
    const pts = r.spine, ws = r.spineW;
    // drawn tail-first so the coil reads front-to-back; each piece a filled capsule
    for (let i = pts.length - 2; i >= 0; i--) { limb(g, [pts[i], pts[i + 1]], [ws[i], ws[i + 1]]); }
  }

  function headPath(g, r) {
    g.save(); g.translate(10, -952); g.rotate(r.look);
    // a fierce royal face: high brow, long nose, a narrow pointed beard
    g.moveTo(34, 8);
    g.bezierCurveTo(46, -26, 56, -66, 52, -100);
    g.bezierCurveTo(48, -128, 30, -142, 0, -144);
    g.lineTo(-50, -136); g.lineTo(-54, -110); g.lineTo(-48, -96);
    g.bezierCurveTo(-58, -86, -70, -74, -74, -62);
    g.lineTo(-60, -60); g.lineTo(-66, -54); g.lineTo(-58, -50); g.lineTo(-60, -40);
    g.bezierCurveTo(-64, -20, -66, 6, -74, 34);
    g.bezierCurveTo(-46, 22, -20, 14, 4, 14);
    g.closePath(); cut(g);
    // long hair down the back
    g.moveTo(44, -120); g.bezierCurveTo(96, -60, 104, 40, 92, 130); g.lineTo(60, 120); g.bezierCurveTo(70, 40, 60, -40, 36, -100); g.closePath(); cut(g);
    // crown: band, two tiers, a serpent-jewel finial
    g.moveTo(-56, -128); g.lineTo(54, -128); g.lineTo(56, -154); g.lineTo(-52, -156); g.closePath(); cut(g);
    g.moveTo(-46, -154); g.lineTo(-30, -214); g.lineTo(32, -214); g.lineTo(46, -154); g.closePath(); cut(g);
    g.moveTo(-28, -214); g.lineTo(-12, -256); g.lineTo(14, -256); g.lineTo(30, -214); g.closePath(); cut(g);
    g.moveTo(14, -268); g.arc(0, -268, 14, 0, TAU); cut(g);
    // earring: a coiled serpent ring
    g.moveTo(32, -46); g.ellipse(18, -40, 14, 20, 0.2, 0, TAU); cut(g);
    if (r.speak > 0.02) {
      g.save(); g.globalCompositeOperation = 'destination-out';
      const o = 4.5 * r.speak;
      g.moveTo(-36, -34); g.lineTo(-62, -36 - o); g.lineTo(-62, -30 + o * 0.6); g.closePath(); cut(g);
      g.restore();
    }
    g.restore();
  }

  /** One cobra hood at c, rising along angle a (rad), width w, length l; its head bends toward −x. */
  function hood(g, base, c, w, l, T, i) {
    // the neck from behind the shoulders to the hood
    limb(g, [base, [lerp(base[0], c[0], 0.6) + 40, Math.min(lerp(base[1], c[1], 0.7), c[1] + 40)], c], [50, 40, 36]);
    const a = Math.atan2(c[1] - base[1], c[0] - base[0]);
    g.save(); g.translate(c[0], c[1]); g.rotate(a + Math.PI / 2);
    // the spade of the hood (local: up = −y)
    g.moveTo(0, l * 0.32);
    g.bezierCurveTo(-w * 0.62, l * 0.1, -w * 0.62, -l * 0.42, -w * 0.12, -l * 0.62);
    g.lineTo(w * 0.12, -l * 0.62);
    g.bezierCurveTo(w * 0.62, -l * 0.42, w * 0.62, l * 0.1, 0, l * 0.32);
    g.closePath(); cut(g);
    g.restore();
    // the head at the top, bent forward (toward −x), tongue flickering
    const top = [c[0] + Math.cos(a) * l * 0.55, c[1] + Math.sin(a) * l * 0.55];
    g.save(); g.translate(top[0], top[1]);
    g.moveTo(16, 0); g.ellipse(-14, 4, 34, 20, 0.12, 0, TAU); cut(g);
    g.moveTo(-40, -6); g.lineTo(-72, 4); g.lineTo(-40, 16); g.closePath(); cut(g);
    const tf = Math.sin(T * 11 + i * 2) > 0.55 ? 1 : 0;
    if (tf) { g.moveTo(-70, 6); g.lineTo(-104, 2); g.lineTo(-96, 8); g.lineTo(-106, 14); g.lineTo(-70, 10); g.closePath(); cut(g); }
    g.restore();
  }
  function hoodLayout(r) {
    const base = r.rot([90, -900]);
    const ct = r.canopyTilt, s = 1 + 0.18 * r.flare;
    const piv = r.rot(NECK);
    return HOODS.map((p, i) => {
      const q = r.rot(p);
      const v = [q[0] - piv[0], q[1] - piv[1]], c = Math.cos(-ct), sn = Math.sin(-ct);
      const sway = Math.sin(r.T * 1.3 + i * 0.9) * 8;
      return { base, c: [piv[0] + (v[0] * c - v[1] * sn) * s + sway, piv[1] + (v[0] * sn + v[1] * c) * s], w: 128 * (1 + 0.25 * r.flare), l: 190 };
    });
  }
  function canopyPath(g, r) {
    hoodLayout(r).forEach((h, i) => hood(g, h.base, h.c, h.w, h.l, r.T, i));
  }

  function nagaArms(g, r, near) {
    const sh = near ? r.shN : r.shF, tgt = near ? r.hand : r.farHand;
    const el = ik(sh, tgt, 186, 172, near ? -1 : 1);
    limb(g, [sh, el, tgt], near ? [66, 44, 32] : [62, 42, 30]);
    hand(g, tgt, near ? r.nearA : r.farA, 40, near ? r.nearKind : r.farKind);
  }

  function nagaShape(g, color, P, r) {
    g.fillStyle = color;
    g.beginPath(); serpentPath(g, r); g.fill();
    g.beginPath(); nagaArms(g, r, false); g.fill();
    g.beginPath(); canopyPath(g, r); g.fill();
    g.save(); g.translate(W0[0], W0[1]); g.rotate(-r.lean); g.translate(-W0[0], -W0[1]);
    g.beginPath();
    CH.torso(g, { waistY: -560, neckY: -930, chestY: -790, front: -84, back: 86, waistF: -56, waistB: 64, neckF: -6, neckB: 38, pec: 22, lat: 20 });
    g.fill();
    g.beginPath(); headPath(g, r); g.fill();
    g.restore();
    g.beginPath(); nagaArms(g, r, true); g.fill();
  }

  function nagaOrnaments(g, P, r, a, color) {
    g.globalAlpha *= a;
    g.strokeStyle = color; g.fillStyle = color; g.lineCap = 'round';
    // ventral scales: short bars across the belly side of the body
    const pts = r.spine, ws = r.spineW;
    for (let i = 2; i < pts.length - 3; i += 2) {
      const p = pts[i], q = pts[i + 1], dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
      const w = ws[i] / 2;
      g.beginPath(); g.moveTo(p[0] + nx * w * 0.35, p[1] + ny * w * 0.35); g.lineTo(p[0] + nx * w * 0.92, p[1] + ny * w * 0.92); g.lineWidth = 3; g.stroke();
      if (i % 4 === 0) { g.beginPath(); g.arc(p[0] - nx * w * 0.35, p[1] - ny * w * 0.35, 5, 0, TAU); g.fill(); }
    }
    // hood marks (the spectacle) and the cobras' eyes
    hoodLayout(r).forEach((h, i) => {
      const a2 = Math.atan2(h.c[1] - h.base[1], h.c[0] - h.base[0]);
      g.save(); g.translate(h.c[0], h.c[1]); g.rotate(a2 + Math.PI / 2);
      // the spectacle mark: two loops joined by a bridge, high on the hood
      g.beginPath(); g.moveTo(-26, -h.l * 0.36); g.quadraticCurveTo(-20, -h.l * 0.16, 0, -h.l * 0.2); g.quadraticCurveTo(20, -h.l * 0.16, 26, -h.l * 0.36); g.lineWidth = 3; g.stroke();
      g.beginPath(); g.moveTo(0, -h.l * 0.1); g.lineTo(0, h.l * 0.2); g.lineWidth = 2; g.stroke();
      g.restore();
      const top = [h.c[0] + Math.cos(a2) * h.l * 0.55, h.c[1] + Math.sin(a2) * h.l * 0.55];
      g.beginPath(); g.arc(top[0] - 22, top[1] - 2, 5, 0, TAU); g.fill();
      void i;
    });
    g.save(); g.translate(W0[0], W0[1]); g.rotate(-r.lean); g.translate(-W0[0], -W0[1]);
    // the jewelled band at the waist, necklaces, crown tiers
    g.beginPath(); g.moveTo(-54, -566); g.quadraticCurveTo(6, -548, 66, -572); g.lineWidth = 10; g.stroke();
    for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(-40 + i * 20, -560 + Math.sin(i) * 3, 5, 0, TAU); g.fill(); }
    CH.beads(g, [-8, -918], [-62, -860], [-44, -820], 9, 4.6);
    CH.beads(g, [-6, -916], [-74, -800], [-54, -740], 12, 4.2);
    g.save(); g.translate(10, -952); g.rotate(r.look);
    for (const [y, w] of [[-154, 50], [-214, 32]]) { g.beginPath(); g.moveTo(-w, y); g.lineTo(w + 4, y); g.lineWidth = 5; g.stroke(); }
    g.beginPath(); g.arc(0, -184, 6, 0, TAU); g.fill();
    g.beginPath(); g.ellipse(-36, -86, 9, 3.4, 0.15, 0, TAU); g.fill();
    g.restore();
    g.restore();
    // armlets
    for (const near of [true, false]) {
      const sh = near ? r.shN : r.shF, tgt = near ? r.hand : r.farHand, el = ik(sh, tgt, 186, 172, near ? -1 : 1);
      const m = along(sh, el, 0.55), dx = el[0] - sh[0], dy = el[1] - sh[1], l = Math.hypot(dx, dy) || 1;
      g.beginPath(); g.moveTo(m[0] - dy / l * 30, m[1] + dx / l * 30); g.lineTo(m[0] + dy / l * 30, m[1] - dx / l * 30); g.lineWidth = 6; g.stroke();
    }
  }

  // ─── the disguise: a thin beggar ───────────────────────────────────────────
  const GD = { hip: 470, thigh: 236, shin: 224, foot: 70, sitHip: 140 };
  function guiseRig(P, r) {
    const po = P.po, k = po.k;
    const run = po.name === 'guise-run', walk = po.name === 'guise-walk';
    const pr = CH.profileRig({ name: walk || run ? 'walk' : 'stand', phase: po.phase || 0, stride: run ? 1.45 : walk ? 1 : 0, k: 1, base: 'stand' }, GD);
    Object.assign(r, pr);
    r.lean = 0.12 + (run ? 0.2 : walk ? 0.05 : 0) + (po.name === 'guise-grab' ? 0.75 * k : 0);
    r.wind = run ? 1 : 0.5;
    let nh = [-90, -560], fh = [30, -540];
    if (run) { nh = [-160 + 80 * Math.sin(po.phase || 0), -640]; fh = [60 - 80 * Math.sin(po.phase || 0), -600]; }
    if (po.name === 'guise-grab') { nh = along(nh, [-340, -150], k); fh = along(fh, [-260, -200], k); }
    const c = Math.cos(-r.lean), s = Math.sin(-r.lean), pv = -470;
    r.rot = (p) => [p[0] * c - (p[1] - pv) * s, p[0] * s + (p[1] - pv) * c + pv];
    r.pv = pv;
    r.shN = r.rot([4, -760]); r.shF = r.rot([26, -764]);
    r.hand = nh; r.farHand = fh;
    return r;
  }
  function guiseShape(g, color, P, r) {
    g.translate(0, r.bob);
    g.fillStyle = color;
    const arm = (near) => {
      const sh = near ? r.shN : r.shF, tgt = near ? r.hand : r.farHand, el = ik(sh, tgt, 160, 150, near ? -1 : 1);
      limb(g, [sh, el, tgt], [38, 26, 20]); hand(g, tgt, Math.PI / 2 + 0.3, 28, near ? 'cup' : 'open');
    };
    g.beginPath(); arm(false); g.fill();
    g.beginPath(); CH.legs(g, r, [50, 32, 18]); g.fill();
    g.save(); g.translate(0, r.pv); g.rotate(-r.lean); g.translate(0, -r.pv);
    g.beginPath();
    // a thin, ribbed torso; a loincloth
    CH.torso(g, { waistY: -470, neckY: -780, chestY: -680, front: -38, back: 46, waistF: -24, waistB: 40, neckF: -2, neckB: 22, pec: 2, lat: 2 });
    g.moveTo(-28, -480); g.lineTo(44, -486); g.lineTo(40, -400); g.lineTo(-30, -410); g.closePath(); cut(g);
    g.fill();
    g.beginPath();
    g.save(); g.translate(4, -790); g.rotate(r.look);
    // shaven head, gaunt face, sparse straggling beard
    g.moveTo(28, 6); g.bezierCurveTo(38, -26, 46, -60, 42, -94); g.bezierCurveTo(38, -128, 10, -140, -14, -138); g.bezierCurveTo(-40, -136, -48, -116, -46, -98);
    g.bezierCurveTo(-52, -86, -62, -72, -62, -62); g.lineTo(-50, -58); g.lineTo(-54, -50); g.lineTo(-50, -44);
    g.bezierCurveTo(-56, -20, -52, 8, -46, 34); g.lineTo(-36, 10); g.lineTo(-30, 30); g.lineTo(-20, 6); g.bezierCurveTo(-10, 6, 0, 8, 4, 12);
    g.closePath(); cut(g);
    g.restore();
    g.fill();
    g.restore();
    g.beginPath(); arm(true);
    // the begging bowl in the near hand
    if (r.name !== 'guise-grab') { const h = r.hand; g.moveTo(h[0] - 50, h[1] - 18); g.quadraticCurveTo(h[0] - 6, h[1] + 34, h[0] + 40, h[1] - 18); g.closePath(); cut(g); }
    g.fill();
  }

  // ─── the module ────────────────────────────────────────────────────────────
  function shape(g, color, P, r) { if (r.guise) guiseShape(g, color, P, r); else nagaShape(g, color, P, r); }
  function ornaments(g, P, r, a, color) {
    if (a <= 0.01) return;
    if (r.guise) {
      g.translate(0, r.bob); g.globalAlpha *= a * 0.6; g.fillStyle = color;
      g.save(); g.translate(0, r.pv); g.rotate(-r.lean); g.translate(0, -r.pv); g.translate(4, -790); g.rotate(r.look);
      g.beginPath(); g.ellipse(-32, -84, 7, 2.6, 0.1, 0, TAU); g.fill();
      g.restore();
      return;
    }
    nagaOrnaments(g, P, r, a, color);
  }
  function scr(P, r, p) { const sx = P.flip ? -P.s : P.s; return [P.x + p[0] * sx, P.y + (p[1] + (r.bob || 0)) * P.s]; }
  function eyeLocal(r) {
    if (r.guise) return r.rot([4 - 32, -790 - 84]);
    const c = Math.cos(r.look), s = Math.sin(r.look), lx = -36, ly = -86;
    return r.rot([10 + lx * c - ly * s, -952 + lx * s + ly * c]);
  }
  function before(ctx, P, r, k) {
    if (r.guise) return;
    const h = scr(P, r, r.rot([40, -1180]));
    KIT.glow(ctx, h[0], h[1], 620 * P.s, '#20c880', 0.16 * k * (1 + 0.6 * r.flare));
  }
  function after(ctx, P, r, k) {
    const e = scr(P, r, eyeLocal(r));
    const wr = r.wrath ? 1 : 0;
    if (r.guise) {
      // the shimmer: a cold green double image wavering about him
      const sx = P.flip ? -P.s : P.s;
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 3; i++) {
        const dx = Math.sin(P.T * 5.1 + i * 2.1) * 14 * P.s + (i - 1) * 12 * P.s, dy = Math.cos(P.T * 3.7 + i) * 5 * P.s;
        ctx.globalAlpha = 0.07 + 0.05 * Math.sin(P.T * 7 + i * 1.7);
        CH.flat(ctx, (b) => { b.translate(P.x + dx, P.y + dy); b.scale(sx, P.s); guiseShape(b, i === 1 ? '#7affc0' : '#2ad890', P, r); });
      }
      ctx.restore();
      KIT.glow(ctx, e[0], e[1], 26 * P.s, '#9affd0', 0.6 * k);
      return;
    }
    KIT.glow(ctx, e[0], e[1], (36 + 30 * wr) * P.s, '#b8ffe0', (0.7 + 0.3 * wr) * k);
    const m = scr(P, r, r.rot([10, -952 - 268]));
    KIT.glow(ctx, m[0], m[1], 90 * P.s, '#9affd0', 0.55 * k);
    hoodLayout(r).forEach((h) => {
      const a2 = Math.atan2(h.c[1] - h.base[1], h.c[0] - h.base[0]);
      const top = [h.c[0] + Math.cos(a2) * h.l * 0.55 - 22, h.c[1] + Math.sin(a2) * h.l * 0.55 - 2];
      const q = scr(P, r, top);
      KIT.glow(ctx, q[0], q[1], 22 * P.s, '#c8ffe8', 0.6 * k);
    });
  }

  const bible = {
    name: 'Takshaka (king of the Nagas)',
    role: 'The serpent king: covets the earrings, steals them from Uttanka in a beggar\'s guise, vanishes into the Naga world, yields them; the slayer of King Parikshit (Adi Parva 3).',
    palette: { fill: '#06100c', inner: '#0c3a28', rimDim: '#1f9a64', rimBright: '#a8ffd0', ornamentDim: '#3aa878', ornament: '#d8ffe8', aura: '#20c880', eyes: '#b8ffe0' },
    proportions: 'Naga form ≈ 1430 units to the hood tops (×1.15 Janamejaya\'s crown), ≈ 1450 long: a man\'s torso from the waist (560 up) to the neck (930), head and crown to ≈ 1220, a canopy of five hoods (210 long, 130 wide) up to ≈ 1430; the serpent body 170 thick at the belly, tapering to a 12-unit tail tip. Disguised: ≈ 940 units, thin and stooped.',
    props: ['canopy of five cobra hoods with spectacle marks, flickering tongues', 'tall crown with a serpent-jewel (mani) finial', 'serpent-ring earring', 'layered necklaces, armlets', 'jewelled band where man becomes serpent', 'ventral scale bars', 'disguise: begging bowl, loincloth, the green shimmer'],
    light: 'Cold green: fill #06100c, inner #0c3a28, rim #1f9a64 → #a8ffd0 (×1.1), glow 1.1; ornaments #3aa878 → #d8ffe8; eyes, cobra eyes and the mani burn green-white; a cold aura behind the hoods (flares with them). Disguised: the same cold rim and a wavering green double image.',
    poses: [
      { name: 'stand', note: 'risen from his coils' }, { name: 'speak', note: 'k' }, { name: 'strike', note: 'k: lunges, hoods flare forward' },
      { name: 'recoil', note: 'k: shrinks back from fire and smoke, arms up' }, { name: 'give', note: 'k: yields (near hand forward, cupped)' },
      { name: 'dive', note: 'k: pours forward and down into the earth' },
      { name: 'guise', note: 'the beggar, stooped, bowl in hand' }, { name: 'guise-walk', note: 'phase' }, { name: 'guise-run', note: 'phase' }, { name: 'guise-grab', note: 'k: snatches from the ground' },
    ],
    voice: 'takshaka',
  };

  const mod = CH.define({
    id: 'takshaka', bible, rig, shape, ornaments, before, after, defaultPose: 'stand',
    rule: {
      fill: '#06100c', lit: '#10281e', litGain: 0.9,
      rim: ['#1f9a64', '#a8ffd0'], inner: '#0c3a28', innerA: [0.9, 0.5], glow: 1.1, rimW: 1.1,
      ornament: ['#3aa878', '#d8ffe8'], ornamentA: [0.5, 0.95],
    },
    bounds: (P, r) => (r.guise ? [-560, -1000, 420, 30] : [r.name === 'dive' ? -1500 : -640, -1460, 1120, 60]),
  });
  /** Screen position: 'hand' (near hand), 'eye', 'head', 'crown'. */
  mod.anchor = (opts, name) => {
    const P = CH.resolve(opts, mod._def), r = rig(P);
    if (name === 'eye') return scr(P, r, eyeLocal(r));
    if (name === 'head') return scr(P, r, r.guise ? r.rot([0, -860]) : r.rot([10, -1020]));
    if (name === 'crown') return scr(P, r, r.rot([10, -1220]));
    return scr(P, r, r.hand);
  };
  CH.ROSTER.push('takshaka');
  void clamp;
})();
