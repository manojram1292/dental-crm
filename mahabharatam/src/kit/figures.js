/*
 * KIT.figures · shadow-puppet (tholu bommalata) silhouettes. No faces: a
 * graceful profile, a beard, a topknot, and gold borders on the cloth.
 *
 *   KIT.storyteller.draw(g, color, pose)       fill the silhouette with `color`
 *   KIT.storyteller.ornaments(g, pose, a)      kasavu-gold borders, mala, kundala
 *        pose = { x, y, s (1 ≈ 1040 px tall), walk (phase, rad), stride (0..1),
 *                 T (for cloth flutter), wind (0..1), look (head pitch, rad) }
 *        Faces LEFT (forward = −x). Feet on (x, y).
 *   KIT.sage.draw(g, color, pose)             seated, frontal (or back) silhouette
 *   KIT.sage.ornaments(g, pose, a)
 *        pose = { x, y, s (1 ≈ 560 px tall), turn (−1..1: head toward −x/+x),
 *                 lean (−1..1 torso), T, back (bool: seen from behind) }
 *
 * Coordinates: local units, y up is negative (canvas). Every function is pure.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT;
  const { TAU, clamp, lerp, PAL, noise } = R;

  /** Next sub-shape: fill what is built so far and start a new path (avoids nonzero-winding holes). */
  const cut = (g) => { g.fill(); g.beginPath(); };
  /** Filled tapered limb through points pts with widths ws (round joints). Fills as it goes. */
  function limb(g, pts, ws) {
    const n = pts.length, L = [], Rr = [];
    for (let i = 0; i < n; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
      let dx = b[0] - a[0], dy = b[1] - a[1];
      const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
      const w = ws[i] / 2;
      L.push([pts[i][0] - dy * w, pts[i][1] + dx * w]);
      Rr.push([pts[i][0] + dy * w, pts[i][1] - dx * w]);
    }
    cut(g);
    g.moveTo(L[0][0], L[0][1]);
    for (let i = 1; i < n; i++) g.lineTo(L[i][0], L[i][1]);
    for (let i = n - 1; i >= 0; i--) g.lineTo(Rr[i][0], Rr[i][1]);
    g.closePath();
    cut(g);
    for (let i = 0; i < n; i++) { g.moveTo(pts[i][0] + ws[i] / 2, pts[i][1]); g.arc(pts[i][0], pts[i][1], ws[i] / 2, 0, TAU); cut(g); }
  }
  /** Ribbon outline only (no joint discs): a smooth tapered band. */
  function limbOutline(g, pts, ws) {
    const n = pts.length, L = [], Rr = [];
    for (let i = 0; i < n; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
      let dx = b[0] - a[0], dy = b[1] - a[1];
      const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
      const w = ws[i] / 2;
      L.push([pts[i][0] - dy * w, pts[i][1] + dx * w]);
      Rr.push([pts[i][0] + dy * w, pts[i][1] - dx * w]);
    }
    g.moveTo(L[0][0], L[0][1]);
    for (let i = 1; i < n; i++) g.lineTo(L[i][0], L[i][1]);
    for (let i = n - 1; i >= 0; i--) g.lineTo(Rr[i][0], Rr[i][1]);
    g.closePath();
  }
  /** Two-bone IK: shoulder s, target t, bone lengths a, b; bend sign ±1. Returns elbow. */
  function ik(s, t, a, b, bend) {
    const dx = t[0] - s[0], dy = t[1] - s[1];
    const d = clamp(Math.hypot(dx, dy), Math.abs(a - b) + 1e-3, a + b - 1e-3);
    const ang = Math.atan2(dy, dx);
    const c = Math.acos(clamp((a * a + d * d - b * b) / (2 * a * d), -1, 1));
    const e = ang + bend * c;
    return [s[0] + Math.cos(e) * a, s[1] + Math.sin(e) * a];
  }
  const P = (p, dx = 0, dy = 0) => [p[0] + dx, p[1] + dy];
  /** Points along a ribbon from p0 heading `dir` (rad), waving in the wind. */
  function ribbon(p0, dir, len, T, amp, seed, n = 14) {
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const s = i / n;
      const wv = Math.sin(s * 4.2 - T * 5.2 + seed) * amp * s + noise.n2(s * 2 + seed, T * 1.4) * amp * 0.6 * s;
      const a = dir + wv * 0.012;
      pts.push([p0[0] + Math.cos(dir) * len * s - Math.sin(a) * wv, p0[1] + Math.sin(dir) * len * s + Math.cos(a) * wv * 0.6 + s * s * 40]);
    }
    return pts;
  }

  // ─── The storyteller ────────────────────────────────────────────────────────
  function rig(pose) {
    const ph = pose.walk || 0, st = pose.stride || 0, T = pose.T || 0;
    const hip = [0, -500];
    const legs = [0, Math.PI].map((off) => {
      const p = ph + off;
      const th = st * 0.36 * Math.sin(p);                          // thigh swing (+ = forward)
      const flex = st * (0.12 + 0.55 * clamp(Math.sin(p + 1.25)));  // knee bends in the swing phase
      const knee = [hip[0] - Math.sin(th) * 252, hip[1] + Math.cos(th) * 252];
      const sa = th - flex;
      const ankle = [knee[0] - Math.sin(sa) * 238, knee[1] + Math.cos(sa) * 238];
      const fa = clamp(-sa * 0.6 + st * 0.25 * clamp(Math.sin(p + 2.4)), -0.5, 0.6);
      const toe = [ankle[0] - Math.cos(fa) * 74, ankle[1] + 10 + Math.sin(fa) * 74];
      const heel = [ankle[0] + 16, ankle[1] + 12];
      return { knee, ankle, toe, heel, th };
    });
    // keep the lowest foot on the ground
    const low = Math.max(...legs.map((l) => Math.max(l.toe[1], l.heel[1], l.ankle[1] + 22)));
    const bob = -low;
    const lean = st * 0.05 + (pose.bow || 0);
    // staff: planted ahead, swinging with the stride
    const sw = st * Math.sin(ph) * 30;
    const staffB = [-150 + sw, 0 - bob];
    const staffT = [staffB[0] + 70 + st * 10, -1150 - bob];
    const handY = -650;
    const k = (handY - staffB[1]) / (staffT[1] - staffB[1]);
    const hand = [lerp(staffB[0], staffT[0], k) + 10, handY];
    const farHand = [44 + st * 22 * Math.sin(ph + Math.PI), -560];
    return { legs, bob, lean, staffB, staffT, hand, farHand, T, wind: pose.wind ?? 0.6, look: pose.look || 0, st };
  }

  function bodyPath(g, r) {
    // torso (waist → neck), leaning forward slightly
    g.moveTo(-36, -560);
    g.bezierCurveTo(-44, -620, -50, -660, -48, -705);
    g.bezierCurveTo(-46, -760, -30, -800, -4, -822);
    g.lineTo(34, -824);
    g.bezierCurveTo(54, -800, 66, -760, 64, -720);
    g.bezierCurveTo(62, -660, 50, -615, 56, -565);
    g.closePath(); cut(g);
    // dhoti (veshti), knee length, flaring over the moving knees
    const [a, b] = r.legs;
    const front = a.knee[0] < b.knee[0] ? a : b, back = front === a ? b : a;
    const hemY = Math.max(a.knee[1], b.knee[1]) + 34;
    g.moveTo(-40, -575);
    g.bezierCurveTo(-58, -500, front.knee[0] - 40, front.knee[1] - 120, front.knee[0] - 34, hemY - 6);
    g.quadraticCurveTo(lerp(front.knee[0], back.knee[0], 0.5), hemY + 14, back.knee[0] + 40, hemY - 4);
    g.bezierCurveTo(back.knee[0] + 52, back.knee[1] - 120, 84, -440, 70, -515);
    g.lineTo(58, -585);
    g.closePath(); cut(g);
    // front pleats (the tucked kaccha), swaying
    const sway = Math.sin(r.T * 3.1) * 6 * r.wind + r.st * 10;
    g.moveTo(-44, -560);
    g.quadraticCurveTo(-70 - sway, -440, -64 - sway, -330);
    g.lineTo(-30 - sway * 0.5, -345);
    g.quadraticCurveTo(-34, -450, -16, -555);
    g.closePath(); cut(g);
  }

  function headPath(g, r) {
    g.save();
    g.translate(8, -830);
    g.rotate(r.look);
    g.moveTo(34, 10);
    g.bezierCurveTo(40, -20, 52, -60, 50, -95);
    g.bezierCurveTo(48, -130, 25, -155, -8, -156);
    g.bezierCurveTo(-35, -156, -50, -140, -54, -116);
    g.lineTo(-56, -102);
    g.lineTo(-50, -95);
    g.bezierCurveTo(-56, -88, -67, -78, -76, -68);
    g.lineTo(-62, -64);
    g.lineTo(-68, -58);
    g.lineTo(-58, -55);
    g.lineTo(-61, -50);
    // the beard: a long pointed wedge flowing down and forward
    g.bezierCurveTo(-63, -36, -64, -12, -60, 8);
    g.bezierCurveTo(-58, 22, -56, 34, -50, 50);
    g.bezierCurveTo(-42, 30, -30, 8, -12, -12);
    g.lineTo(-10, 12);
    g.closePath(); cut(g);
    // jata: topknot with a small crown knot, and shoulder-length locks
    g.moveTo(38, -162);
    g.ellipse(14, -164, 24, 17, -0.3, 0, TAU); cut(g);
    g.moveTo(15, -184);
    g.ellipse(6, -184, 9, 8, 0, 0, TAU); cut(g);
    g.moveTo(44, -100);
    g.bezierCurveTo(64, -70, 62, -18, 54, 22);
    g.lineTo(40, 14);
    g.bezierCurveTo(44, -30, 42, -60, 34, -92);
    g.closePath(); cut(g);
    g.restore();
  }

  function armsPath(g, r, near) {
    if (near) {
      const sh = [6, -778];
      const el = ik(sh, r.hand, 172, 158, -1);
      limb(g, [sh, el, r.hand], [62, 40, 32]);
      g.moveTo(r.hand[0] + 24, r.hand[1]);
      g.ellipse(r.hand[0], r.hand[1] + 2, 24, 20, 0.3, 0, TAU); cut(g);
    } else {
      const sh = [30, -782];
      const el = ik(sh, r.farHand, 172, 150, 1);
      limb(g, [sh, el, r.farHand], [56, 38, 30]);
      // kamandalu (water pot) hanging from the hand
      const h = r.farHand, swing = Math.sin(r.T * 2.4) * 0.05 + r.st * 0.08 * Math.sin((r.T || 0) * 4);
      g.save();
      g.translate(h[0], h[1]);
      g.rotate(swing);
      g.moveTo(-26, 8); g.quadraticCurveTo(0, -30, 26, 8); g.lineTo(20, 10); g.quadraticCurveTo(0, -20, -20, 10); g.closePath(); cut(g);
      g.moveTo(40, 66);
      g.ellipse(0, 66, 42, 38, 0, 0, TAU); cut(g);
      g.moveTo(-30, 40); g.lineTo(-74, 22); g.lineTo(-76, 30); g.lineTo(-34, 54); g.closePath(); cut(g);
      g.moveTo(20, 30); g.ellipse(0, 30, 20, 9, 0, 0, TAU); cut(g);
      g.restore();
    }
  }

  function legsPath(g, r) {
    for (const l of r.legs) {
      limb(g, [[0, -500], l.knee, l.ankle], [74, 46, 24]);
      g.moveTo(l.heel[0], l.heel[1]);
      g.quadraticCurveTo(l.ankle[0] + 10, l.ankle[1] - 6, l.ankle[0] - 16, l.ankle[1] + 2);
      g.lineTo(l.toe[0], l.toe[1] - 8);
      g.quadraticCurveTo(l.toe[0] - 8, l.toe[1], l.toe[0], l.toe[1] + 2);
      g.lineTo(l.heel[0], l.heel[1] + 2);
      g.closePath(); cut(g);
    }
  }

  function shawlPath(g, r) {
    // uttariya over the shoulder, its end streaming behind in the wind
    g.moveTo(-30, -800);
    g.bezierCurveTo(10, -826, 56, -818, 72, -770);
    g.bezierCurveTo(78, -720, 66, -640, 70, -600);
    g.lineTo(40, -604);
    g.bezierCurveTo(30, -680, 20, -740, -38, -760);
    g.closePath(); cut(g);
    const pts = ribbon([62, -760], 1.4 - 0.22 * r.wind, 210, r.T, 12 * r.wind, 1.3);
    limbOutline(g, pts, pts.map((_, i) => lerp(36, 12, i / (pts.length - 1))));
  }

  function staffPath(g, r) {
    limb(g, [r.staffB, r.staffT], [12, 15]);
    // a small finial at the top
    g.moveTo(r.staffT[0] + 12, r.staffT[1] - 6);
    g.ellipse(r.staffT[0], r.staffT[1] - 8, 12, 16, 0, 0, TAU); cut(g);
  }

  const storyteller = {
    rig,
    draw(g, color, pose) {
      const r = rig(pose);
      g.save();
      g.translate(pose.x, pose.y);
      g.scale(pose.s, pose.s);
      if (pose.flip) g.scale(-1, 1);
      g.translate(0, r.bob);
      g.fillStyle = color;
      g.beginPath(); armsPath(g, r, false); g.fill();
      g.beginPath(); legsPath(g, r); g.fill();
      g.save(); g.translate(0, -500); g.rotate(-r.lean); g.translate(0, 500);
      g.beginPath(); bodyPath(g, r); g.fill();
      g.beginPath(); shawlPath(g, r); g.fill();
      g.beginPath(); headPath(g, r); g.fill();
      g.restore();
      g.beginPath(); staffPath(g, r); g.fill();
      g.beginPath(); armsPath(g, r, true); g.fill();
      g.restore();
    },
    /** Gold cloth borders, rudraksha mala, kundala: lit by the fire. */
    ornaments(g, pose, a = 1, color = PAL.gold) {
      if (a <= 0.01) return;
      const r = rig(pose);
      g.save();
      g.translate(pose.x, pose.y);
      g.scale(pose.s, pose.s);
      if (pose.flip) g.scale(-1, 1);
      g.translate(0, r.bob);
      g.globalAlpha *= a;
      g.strokeStyle = color; g.fillStyle = color; g.lineCap = 'round';
      g.save(); g.translate(0, -500); g.rotate(-r.lean); g.translate(0, 500);
      // dhoti hem border (kasavu): two parallel lines
      const [l0, l1] = r.legs;
      const front = l0.knee[0] < l1.knee[0] ? l0 : l1, back = front === l0 ? l1 : l0;
      const hemY = Math.max(l0.knee[1], l1.knee[1]) + 34;
      for (const off of [-12, -22]) {
        g.beginPath();
        g.moveTo(front.knee[0] - 30, hemY - 6 + off);
        g.quadraticCurveTo(lerp(front.knee[0], back.knee[0], 0.5), hemY + 14 + off, back.knee[0] + 38, hemY - 4 + off);
        g.lineWidth = off === -12 ? 7 : 2.5; g.stroke();
      }
      // waist band
      g.beginPath(); g.moveTo(-44, -572); g.quadraticCurveTo(10, -560, 60, -580); g.lineWidth = 5; g.stroke();
      // shawl border
      g.beginPath(); g.moveTo(-30, -764); g.bezierCurveTo(14, -748, 26, -690, 36, -610); g.lineWidth = 4; g.stroke();
      // rudraksha mala: beads hanging down the chest
      for (let i = 0; i <= 10; i++) {
        const u = i / 10, v = 1 - u;
        const x = v * v * -4 + 2 * v * u * -46 + u * u * -30, y = v * v * -815 + 2 * v * u * -755 + u * u * -688;
        g.beginPath(); g.arc(x, y, 4.2, 0, TAU); g.fill();
      }
      // kundala earring
      g.save(); g.translate(8, -830); g.rotate(r.look);
      g.beginPath(); g.arc(12, -62, 7, 0, TAU); g.lineWidth = 3; g.stroke();
      // hair tie
      g.beginPath(); g.ellipse(14, -164, 24, 17, -0.3, Math.PI * 1.05, Math.PI * 1.55); g.lineWidth = 3.5; g.stroke();
      g.restore();
      g.restore();
      // armband on the near (staff) arm: a short band across the arm
      const sh = [6, -778], el = ik(sh, r.hand, 172, 158, -1);
      const am = [lerp(sh[0], el[0], 0.5), lerp(sh[1], el[1], 0.5)];
      const ax = el[0] - sh[0], ay = el[1] - sh[1], al = Math.hypot(ax, ay);
      const nx = -ay / al, ny = ax / al;
      for (const off of [-6, 6]) {
        g.beginPath(); g.moveTo(am[0] - nx * 26 + (ax / al) * off, am[1] - ny * 26 + (ay / al) * off); g.lineTo(am[0] + nx * 26 + (ax / al) * off, am[1] + ny * 26 + (ay / al) * off);
        g.lineWidth = 3.5; g.stroke();
      }
      // staff bands
      for (const u of [0.42, 0.45, 0.93]) {
        const p = [lerp(r.staffB[0], r.staffT[0], u), lerp(r.staffB[1], r.staffT[1], u)];
        g.beginPath(); g.moveTo(p[0] - 9, p[1]); g.lineTo(p[0] + 9, p[1]); g.lineWidth = 4; g.stroke();
      }
      g.restore();
    },
    /** Approximate bounds in local units (for buffers). */
    bounds: [-220, -1200, 480, 1215],
  };

  // ─── A seated sage (frontal / back), for the circle around the fire ─────────
  function sagePath(g, pose) {
    const turn = clamp(pose.turn || 0, -1, 1), T = pose.T || 0;
    const breath = Math.sin(T * 1.3 + (pose.seed || 0)) * 2;
    // crossed legs
    g.moveTo(-178, -4);
    g.bezierCurveTo(-205, -40, -170, -88, -82, -100);
    g.lineTo(82, -100);
    g.bezierCurveTo(170, -88, 205, -40, 178, -4);
    g.quadraticCurveTo(0, 8, -178, -4);
    g.closePath(); cut(g);
    g.save();
    g.translate(0, -90);
    g.rotate((pose.lean || 0) * 0.16);
    g.translate(0, 90);
    // torso
    g.moveTo(-64, -90);
    g.bezierCurveTo(-74, -170, -96, -250, -104, -300 + breath);
    g.quadraticCurveTo(-100, -332, -52, -340);
    g.lineTo(52, -340);
    g.quadraticCurveTo(100, -332, 104, -300 + breath);
    g.bezierCurveTo(96, -250, 74, -170, 64, -90);
    g.closePath(); cut(g);
    // arms resting on the knees (jnana mudra)
    for (const s of [-1, 1]) {
      limb(g, [[s * 96, -306], [s * 128, -200], [s * 150, -86]], [44, 32, 26]);
    }
    // neck + head (oval), turning: a profile nose appears on the turned side
    g.moveTo(-18, -330); g.lineTo(-18, -362); g.lineTo(18, -362); g.lineTo(18, -330); g.closePath(); cut(g);
    const hx = turn * 10;
    g.moveTo(hx + 36, -405);
    g.ellipse(hx, -405, 37 - Math.abs(turn) * 2, 50, 0, 0, TAU); cut(g);
    if (Math.abs(turn) > 0.02 && !pose.back) {
      const sd = Math.sign(turn), k = Math.abs(turn);
      g.moveTo(hx + sd * 30, -428);
      g.lineTo(hx + sd * (30 + 34 * k), -396);
      g.lineTo(hx + sd * 30, -390);
      g.closePath(); cut(g);
    }
    // beard: a point under the chin, following the turn
    if (!pose.back) {
      g.moveTo(hx - 30, -392);
      g.quadraticCurveTo(hx - 26 + turn * 10, -340, hx + turn * 26, -318);
      g.quadraticCurveTo(hx + 26 + turn * 10, -340, hx + 30, -392);
      g.closePath(); cut(g);
    }
    // jata bun
    g.moveTo(hx - turn * 8 + 28, -466);
    g.ellipse(hx - turn * 8, -466, 28, 24, 0, 0, TAU); cut(g);
    g.moveTo(hx - turn * 8 + 12, -492);
    g.ellipse(hx - turn * 8, -494, 12, 11, 0, 0, TAU); cut(g);
    g.restore();
  }
  const sage = {
    draw(g, color, pose) {
      g.save();
      g.translate(pose.x, pose.y);
      g.scale(pose.s, pose.s);
      g.fillStyle = color;
      g.beginPath(); sagePath(g, pose); g.fill();
      g.restore();
    },
    ornaments(g, pose, a = 1, color = PAL.gold) {
      if (a <= 0.01) return;
      g.save();
      g.translate(pose.x, pose.y);
      g.scale(pose.s, pose.s);
      g.globalAlpha *= a;
      g.strokeStyle = color; g.fillStyle = color; g.lineCap = 'round';
      // cloth border along the crossed legs
      g.beginPath(); g.moveTo(-170, -16); g.quadraticCurveTo(0, -4, 170, -16); g.lineWidth = 6; g.stroke();
      g.beginPath(); g.moveTo(-150, -70); g.quadraticCurveTo(-80, -96, 0, -92); g.lineWidth = 3; g.stroke();
      if (!pose.back) {
        // mala and the shawl's diagonal border
        g.save(); g.translate(0, -90); g.rotate((pose.lean || 0) * 0.16); g.translate(0, 90);
        for (let i = 0; i <= 12; i++) {
          const s = i / 12, x = lerp(-40, 40, s), y = -318 + Math.sin(s * Math.PI) * 70;
          g.beginPath(); g.arc(x, y, 4.5, 0, TAU); g.fill();
        }
        g.beginPath(); g.moveTo(-92, -300); g.lineTo(70, -110); g.lineWidth = 5; g.stroke();
        g.restore();
      }
      g.restore();
    },
  };

  KIT.storyteller = storyteller;
  KIT.sage = sage;
  KIT.limb = limb;
  KIT.limbOutline = limbOutline;
  KIT.ik = ik;
})();
