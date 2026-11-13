/*
 * CH.actor · THE ACTING FIGURE (episode 41 on). One profile body built to PERFORM: every pose is a blend of key
 * poses (KIT.act.pose gives the weights, with anticipation and follow-through), so nothing ever snaps; it blinks and
 * breathes; its eye looks where the scene says; its hair, beard and cloth arrive late (they hang on the pose of a
 * moment ago); and its face is drawn to be read in a CLOSE-UP (draw it at scale 2.5–3.5 and pass `expression.emo`).
 *
 * It is also PAINTED, not only cut out: skin, hair and cloth are separate colours inside the silhouette (as real leather
 * puppets are), each mixed from the dark toward its lit colour by the light, so a lit figure is rich and an unlit one is
 * still a clean silhouette. The rim of light is kept on the lit side.
 *
 *   CH.actor(config) → registers a character (CH.define) and returns the module. config:
 *     id, bible { name, role, palette, proportions, props, light, poses?, voice }
 *     build { h (overall), w (torso width), head, leg, arm, bust, belly, hipW, neck }   proportions (1 = a grown man)
 *     skin [dark, lit] · hair { style: 'jata' | 'topknot' | 'bun' | 'flow' | 'crown' | 'wild' | 'curls' | 'shaven',
 *       color, lit } · beard { len (0..1), color } · lower { kind: 'dhoti' | 'sari' | 'short' | 'bark', color, border } ·
 *     upper { kind: 'none' | 'shawl' | 'pallu' | 'pelt', color } · rim [dim, bright] · glow · aura { color, r, a } ·
 *     jewels { thread, mala, armlets, earring, necklace, tilak, crownGems, anklets, tusks, horns } · prop (default prop)
 *   opts.pose: 'stand' | { name, k } | KIT.act.pose(...) = { w: { pose: weight }, lag, lag2, phase, prop, wind }
 *   opts.expression: { emo (KIT.act.emo(...) or a name), gaze [x, y], speak (0..1), look (extra head pitch) }
 *
 * THE LOOK (visual review of kit 41, adopted): SILHOUETTE FIRST. Unlit, a figure is a dark, rich shape (each local colour at
 * about a third of its value) with a thin warm rim on the light side and its ornaments in gold line: the fire-lit mural of
 * episodes 1–40. Local colour opens only as the light comes round to the front (`light.front`: close-ups, front-lit scenes).
 * No outer glow. The whole figure is composited opaque in one buffer and blitted once (rig.js), so nothing shows through.
 * Arms blend on ARCS about the shoulder (a hand never cuts across the face on its way up); every pose has a MOVING HOLD
 * (breath, a slow weight shift, the head and hands alive, cloth and hair settling); a fast hand leaves a tapered SMEAR.
 *
 * KEY POSES (blend freely): stand · attend · anjali · speak · point · bless · recoil · reach · grieve · kneel · sit ·
 *   carry · curse · raise · strike · collapse · bow · embrace · row · walk · run · shield · offer
 * Faces LEFT. (x, y) = the feet. scale 1 ≈ 1000 px to the crown of a grown man.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, CH = KIT.characters;
  const { TAU, clamp, lerp, hash, noise } = R;
  const { cut, limb, ik, hand } = CH;
  const PI = Math.PI;

  // key poses: lean (forward +), look (head pitch, down +), drop (hips sink), hx (hips shift, back +), near/far hand
  // [x, y] with finger angle and kind, near/far ankle [x, y], pa (prop angle: the way a staff points, −π/2 = up)
  const Pz = (o) => ({ lean: 0.03, look: 0, drop: 0, hx: 0, nh: [-34, -462], na: 1.75, nk: 'open', fh: [30, -466], fa: 1.7, fk: 'open', an: [-52, -22], af: [34, -22], pa: -PI / 2, st: 0, ...o });
  const POSES = {
    stand: Pz({}),
    attend: Pz({ lean: 0.05, look: 0.04, nh: [-88, -474], na: 2.3, fh: [-78, -480], fa: 2.2 }),
    anjali: Pz({ lean: 0.07, look: 0.08, nh: [-112, -690], na: -1.9, fh: [-104, -696], fa: -1.85 }),
    speak: Pz({ lean: 0.05, look: -0.05, nh: [-236, -640], na: 2.9, fh: [24, -468], fa: 1.7 }),
    point: Pz({ lean: 0.08, look: -0.04, nh: [-330, -742], na: 3.05, nk: 'point', fh: [30, -470], fa: 1.6 }),
    bless: Pz({ lean: 0.04, look: 0.06, nh: [-196, -858], na: -1.62, nk: 'abhaya', fh: [26, -468], fa: 1.7 }),
    recoil: Pz({ lean: -0.17, look: -0.14, hx: 34, nh: [-150, -838], na: -2.0, nk: 'abhaya', fh: [-84, -706], fa: -2.2, an: [-6, -22], af: [96, -22] }),
    shield: Pz({ lean: -0.07, look: 0.06, hx: 14, nh: [-176, -700], na: -2.3, nk: 'abhaya', fh: [-96, -560], fa: 2.7, an: [-10, -22], af: [70, -22] }),
    reach: Pz({ lean: 0.24, look: -0.1, nh: [-372, -706], na: 3.1, fh: [-300, -660], fa: 3.0, an: [-90, -22], af: [70, -22] }),
    offer: Pz({ lean: 0.14, look: 0.06, nh: [-250, -600], na: 2.95, nk: 'cup', fh: [-240, -590], fa: 2.9, fk: 'cup' }),
    grieve: Pz({ lean: 0.2, look: 0.36, nh: [-150, -850], na: -1.0, fh: [20, -470], fa: 1.6 }),
    kneel: Pz({ lean: 0.1, look: 0.05, drop: 230, nh: [-90, -500], na: 2.4, fh: [-70, -510], fa: 2.3, an: [-130, -22], af: [236, -30] }),
    sit: Pz({ lean: 0.04, look: 0.02, drop: 335, nh: [-150, -470], na: 2.6, nk: 'cup', fh: [-110, -476], fa: 2.5, fk: 'cup', an: [-78, -34], af: [-120, -40] }),
    carry: Pz({ lean: -0.03, look: 0.2, nh: [-96, -640], na: -2.7, nk: 'cup', fh: [-74, -610], fa: 2.9, fk: 'cup' }),
    curse: Pz({ lean: 0.15, look: -0.06, hx: -10, nh: [-312, -640], na: 2.85, nk: 'point', fh: [70, -500], fa: 1.2, an: [-84, -22], af: [70, -22] }),
    raise: Pz({ lean: -0.12, look: -0.12, hx: 16, nh: [-14, -1046], na: -1.5, nk: 'fist', fh: [-110, -640], fa: 2.6, pa: -0.9, an: [-50, -22], af: [80, -22] }),
    strike: Pz({ lean: 0.3, look: 0.12, nh: [-320, -520], na: 2.6, nk: 'fist', fh: [60, -560], fa: 1.2, pa: -2.75, an: [-110, -22], af: [90, -22] }),
    collapse: Pz({ lean: 0.62, look: 0.5, drop: 250, nh: [-240, -330], na: 2.2, fh: [-200, -320], fa: 2.0, an: [-110, -22], af: [220, -30] }),
    bow: Pz({ lean: 0.55, look: 0.28, nh: [-150, -640], na: -2.4, fh: [-142, -648], fa: -2.35 }),
    embrace: Pz({ lean: 0.16, look: 0.14, nh: [-216, -700], na: 2.9, fh: [-200, -640], fa: 3.0 }),
    row: Pz({ lean: 0.2, look: 0.05, nh: [-210, -560], na: 2.2, nk: 'fist', fh: [-150, -640], fa: 2.2, fk: 'fist', pa: -1.25 }),
    walk: Pz({ lean: 0.07, st: 1, nh: [-40, -470], fh: [50, -470] }),
    run: Pz({ lean: 0.24, look: -0.04, st: 1.75, nh: [-130, -560], na: 2.6, nk: 'fist', fh: [110, -520], fa: 0.9, fk: 'fist' }),
  };
  const NUM = ['lean', 'look', 'drop', 'hx', 'na', 'fa', 'pa', 'st'], VEC = ['an', 'af'];
  // hands travel on ARCS about the shoulder: each pose's hand as (angle from straight down, forward positive; reach)
  const SHO = [6, -770];
  for (const p of Object.values(POSES)) for (const k of ['nh', 'fh']) p[k + 'P'] = [Math.atan2(-(p[k][0] - SHO[0]), p[k][1] - SHO[1]), Math.hypot(p[k][0] - SHO[0], p[k][1] - SHO[1])];
  function state(w) {
    const S = { nh: [0, 0], fh: [0, 0], an: [0, 0], af: [0, 0] }; for (const k of NUM) S[k] = 0;
    let sum = 0, best = -1, bn = 'stand';
    const ws = { ...w };
    for (const n in ws) { if (!POSES[n]) { ws.stand = (ws.stand || 0) + ws[n]; delete ws[n]; } }
    for (const n in ws) sum += ws[n];
    ws.stand = (ws.stand || 0) + (1 - sum);
    for (const n in ws) {
      const p = POSES[n], k = ws[n];
      for (const f of NUM) S[f] += p[f] * k;
      for (const f of VEC) { S[f][0] += p[f][0] * k; S[f][1] += p[f][1] * k; }
      for (const f of ['nh', 'fh']) { S[f][0] += p[f + 'P'][0] * k; S[f][1] += p[f + 'P'][1] * k; }
      if (k > best && n !== 'stand' || best < 0) { if (k > 0.5 || best < 0) { best = k; bn = n; } }
    }
    const top = Object.entries(ws).sort((a, b) => b[1] - a[1])[0][0];
    for (const f of ['nh', 'fh']) { const [a, r] = S[f]; S[f] = [SHO[0] - Math.sin(a) * r, SHO[1] + Math.cos(a) * r]; }
    S.nk = POSES[top].nk; S.fk = POSES[top].fk; S.top = top;
    return S;
  }
  const weightsOf = (po) => po.w || (po.name === 'stand' ? { stand: 1 } : { [po.name]: po.k ?? 1 });

  function makeRig(B) {
    const b = { h: 1, w: 1, head: 1, leg: 1, arm: 1, bust: 0, belly: 0, hipW: 1, limb: 1, ...B.build };
    const HIP = 480 * b.leg, TH = 238 * b.leg, SHN = 228 * b.leg, UP = 166 * b.arm, FO = 152 * b.arm;
    const seed = [...B.id].reduce((n, c) => n + c.charCodeAt(0), 0) % 97;
    return function rig(P) {
      const po = P.po, T = P.T;
      const S = state(weightsOf(po)), SL = po.lag ? state(po.lag) : S, SL2 = po.lag2 ? state(po.lag2) : SL;
      // THE MOVING HOLD: no pose is ever still: breath, a slow shift of weight, the head and the hands alive
      const hold = po.still ? 0 : 1, sw = (f, q) => Math.sin(T * f + seed * q) * hold;
      S.hx += 5 * sw(0.47, 1.3); S.lean += 0.012 * sw(0.61, 2.1) + 0.006 * sw(1.9, 0.7); S.look += 0.022 * sw(0.83, 3.3);
      S.nh = [S.nh[0] + 6 * sw(0.9, 4.1), S.nh[1] + 5 * sw(1.3, 5.2)]; S.fh = [S.fh[0] + 5 * sw(0.8, 6.3), S.fh[1] + 4 * sw(1.1, 7.4)];
      const r = { S, T, b, HIP, seed };
      const ph = po.phase || 0, st = S.st * (po.stride ?? 1);
      // legs: ankles from the pose, plus the walk cycle; knees by IK (always forward)
      const hip = [S.hx, -HIP + S.drop];
      const bobW = st * 12 * Math.abs(Math.sin(ph));
      hip[1] += bobW;
      r.legs = [[S.an, 0], [S.af, PI]].map(([a, off]) => {
        const p = ph + off, sw = st * 118 * b.leg;
        // PLANTED FEET: the lifted foot swings from behind to in front on a cosine; the foot on the ground then travels back in a
        // straight line at constant speed, so a body that advances 2·sw per half cycle (KIT.act.stride) does not slide
        const u = ((p % TAU) + TAU) % TAU, fx = u < PI ? sw * Math.cos(u) : -sw + (2 * sw * (u - PI)) / PI;
        const ankle = [a[0] * b.leg + fx * (st ? 1 : 0) + (st ? 20 * b.leg : 0), a[1] - st * 46 * Math.max(0, Math.sin(p))];
        const reachMax = TH + SHN - 2, d = Math.hypot(ankle[0] - hip[0], ankle[1] - hip[1]);
        if (d > reachMax) { ankle[0] = hip[0] + (ankle[0] - hip[0]) * reachMax / d; ankle[1] = hip[1] + (ankle[1] - hip[1]) * reachMax / d; }
        const knee = ik(hip, ankle, TH, SHN, 1);
        const fa = clamp(st * 0.35 * Math.sin(p + 2.2), -0.4, 0.5), ft = 104 * (0.5 + 0.5 * b.leg);
        return { hip, knee, ankle, toe: [ankle[0] - Math.cos(fa) * ft, ankle[1] + 14 + Math.sin(fa) * ft], heel: [ankle[0] + 22, ankle[1] + 16] };
      });
      r.hip = hip;
      r.breath = (KIT.act ? KIT.act.breath(T, seed) : 0) * 1.6;
      r.lean = S.lean + st * 0.02 * Math.sin(ph * 2);
      r.look = S.look + (P.ex.look || 0);
      const c = Math.cos(-r.lean), s = Math.sin(-r.lean), PIV = -HIP;
      // torso space → figure space (the upper body turns about the hips, and rides on them)
      r.rot = (p) => [p[0] * c - (p[1] - PIV) * s + hip[0], p[0] * s + (p[1] - PIV) * c + PIV + (hip[1] + HIP)];
      const SHY = -HIP - 290 * b.h, NKY = -HIP - 318 * b.h;
      r.SHY = SHY; r.NKY = NKY;
      r.shN = r.rot([6, SHY - 2 * r.breath]); r.shF = r.rot([30 * b.w, SHY - 4 - 2 * r.breath]);
      const dy = hip[1] + HIP;   // how far the body has sunk: the hands sink with it
      const scaleH = (v) => [6 + (v[0] - 6) * b.arm + hip[0] * 0.6, SHY + (v[1] + 770) * b.arm + dy];   // poses are drawn for a grown man: hands keep their place relative to the shoulder
      r.nh = scaleH(S.nh); r.fh = scaleH(S.fh);
      for (const [sh, key] of [[r.shN, 'nh'], [r.shF, 'fh']]) { const d = Math.hypot(r[key][0] - sh[0], r[key][1] - sh[1]), m = UP + FO - 3; if (d > m) r[key] = [sh[0] + (r[key][0] - sh[0]) * m / d, sh[1] + (r[key][1] - sh[1]) * m / d]; }
      r.elN = ik(r.shN, r.nh, UP, FO, -1); r.elF = ik(r.shF, r.fh, UP, FO, r.fh[0] < r.shF[0] - 40 ? -1 : 1);
      if (po.sm) { const Q = state(po.sm), q = scaleH(Q.nh); if (Math.hypot(q[0] - r.nh[0], q[1] - r.nh[1]) > 70) r.smear = q; }   // a fast hand: a tapered blade from where it was 1½ frames ago
      r.head = r.rot([-6, NKY - 84 * b.head]);
      // follow-through: where the head and hips were a moment ago
      const headOf = (Q) => { const cc = Math.cos(-Q.lean), ss = Math.sin(-Q.lean); return [-6 * cc - (NKY - 84 - PIV) * ss + Q.hx, Q.drop + (-6 * ss + (NKY - 84 - PIV) * cc)]; };
      const h0 = headOf(S), h1 = headOf(SL), h2 = headOf(SL2);
      const wind = (po.wind ?? 0.45), gust = Math.sin(T * 1.7 + seed) * 12 * wind + noise.n2(T * 0.8, seed) * 16 * wind;
      r.drag = [-(h0[0] - h1[0]) * 1.5 + (h1[0] - h2[0]) * 0.7 + gust + st * 26, -(h0[1] - h1[1]) * 0.9 + (h1[1] - h2[1]) * 0.4];
      r.dragLow = [-(S.hx - SL.hx) * 1.2 + gust * 0.7 + st * (18 + 14 * Math.sin(ph * 2)), 0];
      r.speak = P.ex.speak || 0;
      r.emo = KIT.act ? (typeof P.ex.emo === 'object' && P.ex.emo ? P.ex.emo : KIT.act.EMO[P.ex.emo || P.ex.mood] || KIT.act.EMO.calm) : null;
      r.blink = KIT.act ? KIT.act.blink(T, seed / 97) : 0;
      r.gaze = P.ex.gaze || [0, 0];
      r.prop = po.prop === false ? null : (po.prop ?? B.prop ?? null);   // pose.prop: false = empty hands
      r.hold = po.hold;
      r.L = P.L; r.k = P.k; r.s = P.s; r.flip = P.flip;
      return r;
    };
  }

  // ── the parts (each ADDS sub-paths and fills them through CH.cut; the caller sets fillStyle and begins the path) ──
  function headPath(g, r, B) {
    const o = (r.emo ? r.emo.open : 0) * 7 + r.speak * 6;
    g.moveTo(8, -80);
    g.bezierCurveTo(-30, -84, -58, -64, -62, -34);
    g.lineTo(-66, -20); g.bezierCurveTo(-66, -14, -63, -10, -65, -4);
    g.lineTo(-90, 22); g.bezierCurveTo(-92, 28, -84, 32, -72, 30);
    g.lineTo(-76, 40); g.lineTo(-67, 45); g.lineTo(-74, 54 + o);
    g.bezierCurveTo(-76, 62 + o, -70, 66 + o, -66, 68 + o);
    g.bezierCurveTo(-66, 80 + o, -52, 90 + o, -36, 88 + o);
    g.bezierCurveTo(-16, 86 + o * 0.5, 6, 76, 22, 62);
    g.bezierCurveTo(60, 50, 80, 10, 74, -24);
    g.bezierCurveTo(70, -62, 44, -80, 8, -80);
    g.closePath(); cut(g);
    // the neck
    g.moveTo(-28, 70); g.lineTo(-30, 150); g.lineTo(42, 150); g.lineTo(38, 40); g.closePath(); cut(g);
    if (B.jewels && B.jewels.tusks) { g.moveTo(-70, 44); g.quadraticCurveTo(-96, 30, -92, 2); g.quadraticCurveTo(-82, 26, -62, 40); g.closePath(); cut(g); }
  }
  function hairPath(g, r, B) {
    const st = (B.hair && B.hair.style) || 'jata', [dx, dy] = r.drag;
    const cap = () => { g.moveTo(-56, -52); g.bezierCurveTo(-44, -100, 62, -104, 80, -30); g.bezierCurveTo(86, 10, 72, 44, 46, 62); g.bezierCurveTo(42, 30, 32, 6, 22, -12); g.bezierCurveTo(8, -42, -22, -58, -56, -52); g.closePath(); cut(g); };
    const lock = (x0, y0, len, w0, k = 1) => { const tx = x0 + 26 + dx * k, ty = y0 + len + dy * k; g.moveTo(x0 - w0 / 2, y0); g.bezierCurveTo(x0 - w0 * 0.2 + dx * 0.2, y0 + len * 0.4, tx - w0 * 0.5, ty - len * 0.3, tx, ty); g.bezierCurveTo(tx + w0 * 0.4, ty - len * 0.35, x0 + w0 * 0.9 + dx * 0.2, y0 + len * 0.4, x0 + w0 / 2, y0); g.closePath(); cut(g); };
    if (st === 'shaven') { g.moveTo(-40, -74); g.bezierCurveTo(0, -92, 56, -86, 76, -36); g.bezierCurveTo(50, -66, 6, -76, -40, -74); g.closePath(); cut(g); lock(60, -60, 90, 18, 1); return; }
    cap();
    if (st === 'jata') { g.moveTo(58, -112); g.ellipse(14, -112, 46, 36, -0.15, 0, TAU); cut(g); g.moveTo(34, -146); g.ellipse(8, -148, 26, 18, -0.2, 0, TAU); cut(g); lock(62, 10, 190, 44, 1); lock(44, 30, 130, 30, 0.7); }
    else if (st === 'topknot') { g.moveTo(58, -104); g.ellipse(30, -104, 28, 26, 0, 0, TAU); cut(g); }
    else if (st === 'bun') { g.moveTo(118, 22); g.ellipse(76, 22, 44, 40, 0, 0, TAU); cut(g); }
    else if (st === 'flow') { lock(60, 0, 330, 66, 1); lock(40, 30, 250, 44, 0.75); }
    else if (st === 'curls') { for (let i = 0; i < 9; i++) { const a = -2.7 + i * 0.42; g.moveTo(14 + Math.cos(a) * 70 + 24, -14 + Math.sin(a) * 72); g.arc(14 + Math.cos(a) * 70, -14 + Math.sin(a) * 72, 24, 0, TAU); cut(g); } }
    else if (st === 'wild') { for (let i = 0; i < 11; i++) { const a = -2.9 + i * 0.36, rr = 96 + 44 * hash(i, r.seed) + (i > 5 ? Math.abs(dx) * 0.4 : 0); g.moveTo(14 + Math.cos(a - 0.2) * 62, -14 + Math.sin(a - 0.2) * 62); g.lineTo(14 + Math.cos(a) * rr + dx * 0.3, -14 + Math.sin(a) * rr); g.lineTo(14 + Math.cos(a + 0.2) * 62, -14 + Math.sin(a + 0.2) * 62); g.closePath(); cut(g); } lock(60, 10, 200, 70, 1); }
    else if (st === 'crown') {   // the kirita of the series' kings (janamejaya.js): a band, three narrowing tiers, a finial, a wing at the back
      g.moveTo(-58, -58); g.lineTo(-54, -92); g.lineTo(74, -100); g.lineTo(80, -62); g.closePath(); cut(g);
      // hair.crown (optional; the epic cast of the trailer): 'low' = a band and one tier with a small point (Yudhishthira); 'broad' = two wide
      // tiers with a flat top and three studs (Duryodhana); 'dome' = a rounded cap with a knob (Bhishma). Without it: the tall kirita, as before.
      const cv = B.hair && B.hair.crown;
      if (cv === 'low') { g.moveTo(-44, -92); g.lineTo(-30, -138); g.lineTo(52, -142); g.lineTo(64, -96); g.closePath(); cut(g); g.moveTo(-2, -138); g.lineTo(10, -176); g.lineTo(24, -140); g.closePath(); cut(g); }
      else if (cv === 'broad') { for (const [y0, y1, w0, w1] of [[-92, -150, 58, 62], [-150, -196, 62, 50]]) { g.moveTo(10 - w0, y0); g.lineTo(10 - w1, y1); g.lineTo(10 + w1, y1 - 4); g.lineTo(10 + w0, y0 - 4); g.closePath(); cut(g); } for (const dx2 of [-30, 10, 50]) { g.moveTo(dx2 + 12, -206); g.arc(dx2, -206, 12, 0, TAU); cut(g); } }
      else if (cv === 'dome') { g.moveTo(-46, -92); g.quadraticCurveTo(-50, -200, 10, -206); g.quadraticCurveTo(72, -204, 66, -96); g.closePath(); cut(g); g.moveTo(22, -220); g.arc(10, -220, 13, 0, TAU); cut(g); }
      else {
      for (const [y0, y1, w0, w1] of [[-92, -140, 54, 44], [-140, -186, 44, 33], [-186, -230, 33, 22]]) { g.moveTo(10 - w0, y0); g.lineTo(10 - w1, y1); g.lineTo(10 + w1, y1 - 4); g.lineTo(10 + w0, y0 - 4); g.closePath(); cut(g); }
      g.moveTo(-6, -230); g.lineTo(10, -290); g.lineTo(26, -234); g.closePath(); cut(g); g.moveTo(18, -296); g.arc(10, -296, 9, 0, TAU); cut(g);
      }
      g.moveTo(70, -96); g.quadraticCurveTo(118, -120, 124, -170); g.quadraticCurveTo(100, -130, 72, -70); g.closePath(); cut(g);
      for (let i = 0; i < 4; i++) { g.moveTo(74, -30 + i * 22); g.arc(62, -30 + i * 22, 14, 0, TAU); cut(g); }   // the curls at the nape
    }
    else if (st === 'longjata') {   // Vyasa (vyasa.js): a small knot on the crown and the matted hair falling down the back to the waist
      g.moveTo(46, -104); g.ellipse(14, -104, 34, 26, -0.1, 0, TAU); cut(g); g.moveTo(30, -134); g.ellipse(12, -136, 20, 13, 0, 0, TAU); cut(g);
      lock(58, -20, 420, 96, 0.9); lock(34, 20, 330, 60, 0.6);
    }
  }
  function beardPath(g, r, B) {
    const len = B.beard ? B.beard.len : 0; if (!len) return;
    const o = (r.emo ? r.emo.open : 0) * 7 + r.speak * 6, [dx] = r.drag, L = 60 + 210 * len, tx = -44 + dx * 0.5, ty = 70 + L + o;
    g.moveTo(-70, 50 + o); g.bezierCurveTo(-84, 90 + o, -70, 70 + L * 0.6, tx, ty); g.bezierCurveTo(tx + 30, 60 + L * 0.55, 24, 110, 26, 52); g.bezierCurveTo(0, 74, -40, 70 + o, -70, 50 + o); g.closePath(); cut(g);
    g.moveTo(-78, 36); g.quadraticCurveTo(-60, 30, -44, 44); g.quadraticCurveTo(-62, 46, -80, 50); g.closePath(); cut(g);   // the moustache
  }
  function torsoPath(g, r, B) {
    const b = r.b, HIP = r.HIP, br = r.breath * 2.5;
    CH.torso(g, { waistY: -HIP + 8, neckY: r.NKY, chestY: lerp(-HIP, r.NKY, 0.64), front: -46 * b.w - br, back: 58 * b.w, waistF: -34 * b.w * (b.bust ? 0.86 : 1), waistB: 46 * b.w * (b.bust ? 0.9 : 1), neckF: -6, neckB: 30, pec: 4 + 22 * b.bust + br, lat: 8 * b.w });
    if (b.belly) { g.moveTo(-30 * b.w, -HIP - 150); g.bezierCurveTo(-60 * b.w - 120 * b.belly, -HIP - 150, -60 * b.w - 120 * b.belly, -HIP + 30, -24 * b.w, -HIP + 30); g.closePath(); cut(g); }
    // the hips
    g.moveTo(-40 * b.w * b.hipW, -HIP + 4); g.bezierCurveTo(-52 * b.w * b.hipW, -HIP + 40, -44 * b.hipW, -HIP + 70, -20, -HIP + 80); g.lineTo(40, -HIP + 80); g.bezierCurveTo(60 * b.hipW, -HIP + 60, 56 * b.w * b.hipW, -HIP + 30, 48 * b.w, -HIP + 4); g.closePath(); cut(g);
  }
  function lowerPath(g, r, B) {
    const kind = (B.lower && B.lower.kind) || 'dhoti'; if (kind === 'none') return;
    const b = r.b, [a, c] = r.legs, front = a.knee[0] < c.knee[0] ? a : c, back = front === a ? c : a, hip = r.hip;
    const hemT = kind === 'sari' ? 0.93 : kind === 'short' || kind === 'bark' ? -0.25 : 0.74, fl = kind === 'sari' ? 1.25 : 1, [dx] = r.dragLow;
    const pt = (leg, t) => (t >= 0 ? [lerp(leg.knee[0], leg.ankle[0], t), lerp(leg.knee[1], leg.ankle[1], t)] : [lerp(leg.knee[0], leg.hip[0], -t), lerp(leg.knee[1], leg.hip[1], -t)]);
    const hf = pt(front, hemT), hb = pt(back, hemT), wy = hip[1] + 6, wf = hip[0] - 40 * b.w * b.hipW, wb = hip[0] + 50 * b.w;
    g.moveTo(wf, wy);
    g.bezierCurveTo(wf - 16, wy + 60, front.knee[0] - 50 * fl, front.knee[1] - 90, front.knee[0] - 42 * fl, front.knee[1] - (hemT < 0 ? 60 : 0));
    g.lineTo(hf[0] - 36 * fl + dx, hf[1]);
    { const x0 = hf[0] - 36 * fl + dx, x1 = hb[0] + 44 * fl + dx * 1.6, y0 = hf[1], y1 = hb[1] - 4, n = 4;   // a scalloped hem: four waves that sway
      for (let i = 1; i <= n; i++) { const u0 = (i - 1) / n, u1 = i / n; g.quadraticCurveTo(lerp(x0, x1, (u0 + u1) / 2) + dx * 0.3, lerp(y0, y1, (u0 + u1) / 2) + 20 + 5 * Math.sin(r.T * 2.1 + i * 1.7), lerp(x0, x1, u1), lerp(y0, y1, u1)); } }
    g.bezierCurveTo(back.knee[0] + 56 * fl, back.knee[1] - 60, wb + 30, wy + 80, wb, wy);
    g.closePath(); cut(g);
    if (kind === 'dhoti') { const sw = dx * 1.4; g.moveTo(wf - 2, wy + 6); g.quadraticCurveTo(wf - 30 + sw * 0.5, wy + 130, wf - 26 + sw, wy + 250 * b.leg); g.lineTo(wf + 14 + sw * 0.6, wy + 232 * b.leg); g.quadraticCurveTo(wf + 8, wy + 110, wf + 26, wy + 4); g.closePath(); cut(g); }
    if (kind === 'bark') for (let i = 0; i < 5; i++) { const x = lerp(wf, wb, i / 4); g.moveTo(x - 16, wy + 60); g.lineTo(x + dx * 0.6, wy + 150 + 30 * hash(i, 7)); g.lineTo(x + 18, wy + 60); g.closePath(); cut(g); }
  }
  function upperPath(g, r, B) {
    const kind = (B.upper && B.upper.kind) || 'none'; if (kind === 'none') return;
    const b = r.b, HIP = r.HIP, [dx, dy] = r.drag, SH = r.SHY;
    if (kind === 'shawl' || kind === 'pelt') {
      g.moveTo(-18, SH - 10); g.bezierCurveTo(30, SH - 34, 74 * b.w, SH - 18, 82 * b.w, SH + 26);
      const tx = 96 * b.w + dx * 0.9, ty = -HIP + 30 + dy;
      g.lineTo(tx, ty); g.lineTo(tx - 16, ty + 22); g.lineTo(tx - 30, ty - 4); g.lineTo(tx - 46, ty + 20); g.lineTo(42 * b.w, -HIP - 20);
      g.bezierCurveTo(36, SH + 110, 16, SH + 50, -26, SH + 22); g.closePath(); cut(g);
      g.moveTo(-26, SH + 20); g.bezierCurveTo(-40 * b.w, SH + 120, -30 * b.w, -HIP - 60, 30 * b.w, -HIP - 10); g.lineTo(46 * b.w, -HIP - 50); g.bezierCurveTo(0, -HIP - 90, -10, SH + 100, 0, SH + 6); g.closePath(); cut(g);
    } else if (kind === 'pallu') {
      // the sari's end: up across the chest, over the far shoulder, a tail down the back that arrives late
      g.moveTo(-40 * b.w, -HIP + 10); g.bezierCurveTo(-64 * b.w - 20 * b.bust, -HIP - 150, -50 * b.w, SH + 70, 10, SH - 8); g.lineTo(54 * b.w, SH - 2);
      g.bezierCurveTo(30, SH + 120, 30, -HIP - 80, 50 * b.w, -HIP + 10); g.closePath(); cut(g);
      const tx = 104 * b.w + dx, ty = -HIP + 150 + dy;
      g.moveTo(24, SH - 8); g.bezierCurveTo(70 * b.w, SH - 4, 86 * b.w, SH + 60, tx, ty); g.lineTo(tx - 50, ty + 18); g.bezierCurveTo(60 * b.w + dx * 0.3, SH + 150, 50, SH + 60, 30, SH + 30); g.closePath(); cut(g);
    }
  }
  /** Three real hands (local: fingers along +x): 'open' / 'abhaya' = the flat mudra hand (palm wedge, fingers as one tapered
   *  block, the thumb apart); 'fist' / 'cup' = the grip (a rounded fist, the thumb across); 'point' = index out, the rest folded. */
  function hnd(g, p, a, sz, kind) {
    g.save(); g.translate(p[0], p[1]); g.rotate(a);
    if (kind === 'fist' || kind === 'cup') {
      g.moveTo(-sz * 0.2, -sz * 0.36); g.bezierCurveTo(sz * 0.5, -sz * 0.5, sz * 0.82, -sz * 0.3, sz * 0.8, 0); g.bezierCurveTo(sz * 0.8, sz * 0.36, sz * 0.4, sz * 0.46, -sz * 0.2, sz * 0.34); g.closePath(); cut(g);
      g.moveTo(sz * 0.1, -sz * 0.4); g.quadraticCurveTo(sz * 0.52, -sz * 0.66, sz * 0.74, -sz * 0.34); g.quadraticCurveTo(sz * 0.44, -sz * 0.3, sz * 0.14, -sz * 0.22); g.closePath(); cut(g);
    } else if (kind === 'point') {
      g.moveTo(-sz * 0.2, -sz * 0.34); g.bezierCurveTo(sz * 0.4, -sz * 0.44, sz * 0.66, -sz * 0.2, sz * 0.64, sz * 0.1); g.bezierCurveTo(sz * 0.6, sz * 0.4, sz * 0.2, sz * 0.42, -sz * 0.2, sz * 0.32); g.closePath(); cut(g);
      g.moveTo(sz * 0.4, -sz * 0.36); g.lineTo(sz * 1.5, -sz * 0.2); g.quadraticCurveTo(sz * 1.6, -sz * 0.1, sz * 1.5, -sz * 0.02); g.lineTo(sz * 0.5, -sz * 0.02); g.closePath(); cut(g);
    } else {
      g.moveTo(-sz * 0.2, -sz * 0.3); g.lineTo(sz * 0.55, -sz * 0.36); g.bezierCurveTo(sz * 1.0, -sz * 0.36, sz * 1.34, -sz * 0.2, sz * 1.42, -sz * 0.04); g.bezierCurveTo(sz * 1.36, sz * 0.14, sz * 1.0, sz * 0.26, sz * 0.55, sz * 0.3); g.lineTo(-sz * 0.2, sz * 0.28); g.closePath(); cut(g);
      g.moveTo(sz * 0.08, -sz * 0.3); g.bezierCurveTo(sz * 0.3, -sz * 0.72, sz * 0.66, -sz * 0.86, sz * 0.8, -sz * 0.72); g.bezierCurveTo(sz * 0.66, -sz * 0.52, sz * 0.5, -sz * 0.4, sz * 0.44, -sz * 0.3); g.closePath(); cut(g);
    }
    g.restore();
  }
  function armPath(g, r, near) {
    const b = r.b, sh = near ? r.shN : r.shF, el = near ? r.elN : r.elF, h = near ? r.nh : r.fh, t = (0.8 + 0.2 * b.w) * b.limb;
    limb(g, [sh, el, h], near ? [52 * t, 37 * t, 27 * t] : [48 * t, 34 * t, 25 * t]);
    hnd(g, h, near ? r.S.na : r.S.fa, 56 * (0.7 + 0.3 * b.arm) * (b.w > 1.25 ? 1.3 : 1) * (b.head < 0.8 ? 0.7 : 1), near ? r.S.nk : r.S.fk);
    if (near && r.smear) { const q = [lerp(r.smear[0], h[0], 0.5), lerp(r.smear[1], h[1], 0.5)]; g.moveTo(q[0], q[1]); g.lineTo(h[0] - (h[1] - q[1]) * 0.09, h[1] + (h[0] - q[0]) * 0.09); g.lineTo(h[0] + (h[1] - q[1]) * 0.09, h[1] - (h[0] - q[0]) * 0.09); g.closePath(); cut(g); }
  }
  function propPath(g, r) {
    const p = r.prop; if (!p) return;
    const [hx, hy] = r.nh, a = r.S.pa, cx = Math.cos(a), sy = Math.sin(a);
    if (p === 'staff') limb(g, [[hx - cx * 430, hy - sy * 430], [hx + cx * 560, hy + sy * 560]], [14, 18]);
    else if (p === 'club') { limb(g, [[hx - cx * 60, hy - sy * 60], [hx + cx * 250, hy + sy * 250], [hx + cx * 420, hy + sy * 420]], [20, 44, 70]); }
    else if (p === 'oar') { limb(g, [[hx - cx * 260, hy - sy * 260], [hx + cx * 520, hy + sy * 520]], [14, 14]); g.moveTo(hx + cx * 520, hy + sy * 520); g.ellipse(hx + cx * 600, hy + sy * 600, 90, 26, a, 0, TAU); cut(g); }
    else if (p === 'pot') { g.moveTo(hx + 30, hy + 44); g.lineTo(hx + 74, hy + 22); g.lineTo(hx + 78, hy + 34); g.lineTo(hx + 34, hy + 62); g.closePath(); cut(g); g.moveTo(hx + 34, hy + 64); g.ellipse(hx, hy + 64, 36, 42, 0, 0, TAU); cut(g); g.moveTo(hx - 12, hy + 16); g.rect(hx - 12, hy + 6, 24, 22); cut(g); g.moveTo(hx - 34, hy + 50); g.quadraticCurveTo(hx - 74, hy + 30, hx - 66, hy + 4); g.lineTo(hx - 56, hy + 6); g.quadraticCurveTo(hx - 58, hy + 30, hx - 30, hy + 60); g.closePath(); cut(g); }
    else if (p === 'leaves') { g.save(); g.translate(hx - 20, hy - 8); g.rotate(-0.12); g.moveTo(-90, -14); g.rect(-90, -14, 170, 30); cut(g); g.restore(); }
    else if (p === 'bundle') { g.moveTo(hx + 60, hy - 30); g.ellipse(hx - 10, hy - 30, 84, 46, -0.2, 0, TAU); cut(g); g.moveTo(hx - 50, hy - 78); g.arc(hx - 78, hy - 70, 32, 0, TAU); cut(g); }
  }

  function legsPath(g, r) {
    const b = r.b, k = b.limb;
    for (const l of r.legs) {
      const calf = [lerp(l.knee[0], l.ankle[0], 0.36) + 9, lerp(l.knee[1], l.ankle[1], 0.36)];
      limb(g, [l.hip, l.knee, calf, l.ankle], [74 * b.w * b.hipW, 50 * k, 46 * k, 26 * k]);
      g.moveTo(l.heel[0], l.heel[1]); g.quadraticCurveTo(l.ankle[0] + 16, l.ankle[1] - 10, l.ankle[0] - 16, l.ankle[1] - 4);
      g.quadraticCurveTo(lerp(l.ankle[0], l.toe[0], 0.6), l.toe[1] - 22, l.toe[0], l.toe[1] - 10); g.quadraticCurveTo(l.toe[0] - 12, l.toe[1], l.toe[0] - 2, l.toe[1] + 4); g.lineTo(l.heel[0], l.heel[1] + 4); g.closePath(); cut(g);
    }
  }
  function upper(g, r) { const PIV = -r.HIP; g.translate(r.hip[0], r.hip[1] + r.HIP); g.translate(0, PIV); g.rotate(-r.lean); g.translate(0, -PIV); }
  function headT(g, r) { g.translate(-6, r.NKY - 84 * r.b.head); g.rotate(r.look); g.scale(r.b.head, r.b.head); }

  function makeShape(B) {
    return function shape(g, color, P, r) {
      g.fillStyle = color;
      g.beginPath(); armPath(g, r, false); g.fill();
      g.beginPath(); legsPath(g, r); g.fill();
      g.beginPath(); lowerPath(g, r, B); g.fill();
      g.beginPath(); propPath(g, r); g.fill();   // a staff or an oar passes behind the body and the head; the near hand closes over it
      g.save(); upper(g, r);
      g.beginPath(); torsoPath(g, r, B); g.fill();
      g.beginPath(); upperPath(g, r, B); g.fill();
      g.save(); headT(g, r); g.beginPath(); headPath(g, r, B); g.fill(); g.beginPath(); hairPath(g, r, B); g.fill(); g.beginPath(); beardPath(g, r, B); g.fill();
      if (B.jewels && B.jewels.horns) { /* two long horns swept back from the brow (a buffalo's sweep, not spikes): the near one full, the far one behind it */ for (const [ox, oy, k] of [[18, -6, 0.86], [0, 0, 1]]) { g.beginPath(); g.moveTo(-34 + ox, -66 + oy); g.bezierCurveTo(-60 + ox, -150 * k + oy, 20 + ox, -230 * k + oy, 150 * k + ox, -214 * k + oy); g.bezierCurveTo(60 + ox, -196 * k + oy, 10 + ox, -150 * k + oy, 6 + ox, -78 + oy); g.closePath(); g.fill(); } }
      g.restore();
      g.restore();
      g.beginPath(); armPath(g, r, true); g.fill();
    };
  }

  function makeOrnaments(B, rule) {
    return function ornaments(g, P, r, a, color) {
      const L = r.L, la = clamp(L.front * r.k * (rule.litGain ?? 1) + L.fill * 0.6);
      const tone = (c, lit) => { const col = lit || c; let o = KIT.hex(KIT.hex(col, '#070403', 0.66), col, la); if (L.bounce) o = KIT.hex(o, L.bounce[0], clamp(L.bounce[1] ?? 0.25) * 0.35 * (0.4 + la)); return o; };
      const fv = clamp(0.35 + la * 1.3);   // the face's drawing: faint on a silhouette, full in the light   // how much of the face's drawing shows (none on a pure silhouette)
      // the colour blocks sit inside the silhouette, shifted away from the light so the rim stays on the lit side
      const w = CH.rimWidth(P.s, r.k, rule), lx = (-Math.cos(L.dir) * w) / (P.flip ? -P.s : P.s), ly = (-Math.sin(L.dir) * w) / P.s;
      g.save(); g.globalCompositeOperation = 'source-atop'; g.translate(lx, ly);
      if (B.propColor && r.prop) { g.fillStyle = tone(B.propColor); g.beginPath(); propPath(g, r); g.fill(); g.fillStyle = tone(rule.lit); g.beginPath(); legsPath(g, r); g.fill(); g.save(); upper(g, r); g.beginPath(); torsoPath(g, r, B); g.fill(); g.save(); headT(g, r); g.beginPath(); headPath(g, r, B); g.fill(); g.restore(); g.restore(); }
      if (B.lower && B.lower.color) { g.fillStyle = tone(B.lower.color); g.beginPath(); lowerPath(g, r, B); g.fill(); }
      g.save(); upper(g, r);
      if (B.upper && B.upper.color) { g.fillStyle = tone(B.upper.color); g.beginPath(); upperPath(g, r, B); g.fill(); }
      g.save(); headT(g, r);
      if (B.hair) { g.fillStyle = tone(B.hair.color, B.hair.lit); g.beginPath(); hairPath(g, r, B); g.fill(); }
      if (B.beard && B.beard.len) { g.fillStyle = tone(B.beard.color || (B.hair && B.hair.color), B.beard.lit); g.beginPath(); beardPath(g, r, B); g.fill(); }
      g.restore(); g.restore();
      // the near arm again in skin, over the cloth
      g.fillStyle = tone(rule.lit);
      g.beginPath(); armPath(g, r, true); g.fill();
      g.restore();
      // ── the face (drawn for the close-up; fades out on a silhouette) ──
      const e = r.emo;
      if (e && fv > 0.03) {
        g.save(); g.globalCompositeOperation = 'source-atop'; upper(g, r); headT(g, r);
        const lid = clamp(e.lid * (1 - r.blink)), eh = 2 + 9.5 * lid, ex = -44, ey = -8;
        g.globalAlpha = fv;
        if (lid > 0.08) {
          g.save(); g.beginPath(); g.moveTo(ex - 17, ey + 1); g.quadraticCurveTo(ex - 2, ey - eh * 1.25, ex + 16, ey); g.quadraticCurveTo(ex, ey + eh * 0.9, ex - 17, ey + 1); g.closePath();
          g.fillStyle = B.eyeWhite || '#fff8ea'; g.fill(); g.clip();
          g.fillStyle = B.iris || '#1a0c06'; g.beginPath(); g.arc(ex - 3 + r.gaze[0] * 6, ey + r.gaze[1] * 3.5, 7.2, 0, TAU); g.fill();
          g.fillStyle = '#fffbe8'; g.beginPath(); g.arc(ex - 5.5 + r.gaze[0] * 6, ey - 2.4 + r.gaze[1] * 3.5, 1.9, 0, TAU); g.fill(); g.restore();
        }
        g.strokeStyle = B.line || '#160a06'; g.lineCap = 'round'; g.lineWidth = 3.4;
        g.beginPath(); g.moveTo(ex - 18, ey + 1); g.quadraticCurveTo(ex - 2, ey - eh * 1.3, ex + 18, ey - 1); g.stroke();
        // the brow: raised, lowered at the inner end (anger), or pinched up at the inner end (grief)
        const bi = ey - 19 - e.brow * 5 + (e.brow < 0 ? -e.brow * 12 : 0) - e.pinch * 9, bo = ey - 23 - e.brow * 8 + e.pinch * 4 + (e.brow < 0 ? e.brow * 3 : 0);
        g.lineWidth = 6.5; g.beginPath(); g.moveTo(ex - 21, bi); g.quadraticCurveTo(ex - 2, Math.min(bi, bo) - 5 - e.brow * 3, ex + 22, bo); g.stroke();
        // the mouth: the corner rises or falls; the jaw opens
        const o = e.open * 7 + r.speak * 6, mc = 46 - e.mouth * 8;
        if (o > 1.2) { g.fillStyle = '#2a0808'; g.beginPath(); g.moveTo(-72, 44); g.quadraticCurveTo(-58, 42, -48, mc); g.quadraticCurveTo(-60, 46 + o * 1.5, -73, 50 + o); g.closePath(); g.fill(); }
        g.lineWidth = 3; g.beginPath(); g.moveTo(-70, 45); g.quadraticCurveTo(-60, 45 + e.mouth * 2, -47, mc); g.stroke();
        g.lineWidth = 2; g.beginPath(); g.moveTo(-80, 25); g.quadraticCurveTo(-74, 29, -69, 24); g.stroke();    // the nostril
        g.beginPath(); g.moveTo(22, -12); g.bezierCurveTo(44, -18, 44, 22, 24, 26); g.stroke();                  // the ear
        if (e.tear > 0.03) { const ty = ((r.T * 0.45 + r.seed) % 1) * 62; g.globalAlpha = fv * e.tear * (1 - ty / 70); g.fillStyle = '#d8f0ff'; g.beginPath(); g.moveTo(ex - 6, ey + 8 + ty); g.quadraticCurveTo(ex - 13, ey + 22 + ty, ex - 6, ey + 26 + ty); g.quadraticCurveTo(ex + 1, ey + 22 + ty, ex - 6, ey + 8 + ty); g.fill(); }
        g.restore();
      }
      // ── jewels and marks, in the ornament colour ──
      if (a <= 0.01) return;
      const J = B.jewels || {};
      g.save(); g.globalAlpha *= a; g.strokeStyle = color; g.fillStyle = color; g.lineCap = 'round';
      g.save(); upper(g, r);
      const HIP = r.HIP, SH = r.SHY, b = r.b;
      if (J.thread) { g.lineWidth = 3.5; g.beginPath(); g.moveTo(24, SH - 6); g.quadraticCurveTo(-44 * b.w, SH + 150, -30 * b.w, -HIP - 6); g.stroke(); }
      if (J.mala) { CH.beads(g, [-20, SH + 6], [-56 * b.w - 16 * b.bust, SH + 96], [-10, SH + 150], 11, 5.5); }
      if (J.necklace) { CH.beads(g, [-16, SH + 2], [-52 * b.w, SH + 44], [6, SH + 60], 9, 4.6); CH.beads(g, [-20, SH + 8], [-60 * b.w - 14 * b.bust, SH + 110], [10, SH + 132], 13, 3.6); g.beginPath(); g.arc(-36 * b.w - 8 * b.bust, SH + 112, 9, 0, TAU); g.fill(); }
      if (B.upper && B.upper.kind === 'pallu') { g.save(); g.globalCompositeOperation = 'source-atop'; g.globalAlpha *= 0.6; g.lineWidth = 2.6; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(-40 * b.w + i * 14, -HIP + 4); g.bezierCurveTo(-58 * b.w + i * 10, -HIP - 140, -40 * b.w + i * 12, SH + 80, 14 + i * 10, SH - 4); g.stroke(); } g.restore(); }
      if (B.upper && (B.upper.kind === 'shawl' || B.upper.kind === 'pelt')) { g.save(); g.globalCompositeOperation = 'source-atop'; g.globalAlpha *= 0.55; g.lineWidth = 2.6; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(20 + i * 16, SH - 14); g.quadraticCurveTo(60 * b.w + i * 8 + r.drag[0] * 0.4, lerp(SH, -HIP, 0.5), 60 * b.w + i * 12 + r.drag[0] * 0.8, -HIP + 10); g.stroke(); } g.restore(); }
      if (J.sash) { g.lineWidth = 9; g.beginPath(); g.moveTo(-40 * b.w, -HIP + 6); g.lineTo(50 * b.w, -HIP + 2); g.stroke(); }
      if (B.lower && B.lower.border) { /* drawn below, in figure space */ }
      g.save(); headT(g, r);
      if (J.tilak) { g.beginPath(); g.ellipse(-58, -40, 3.5, 9, 0.2, 0, TAU); g.fill(); }
      if (J.earring) { g.beginPath(); g.arc(30, 36, 9, 0, TAU); g.fill(); g.lineWidth = 2.5; g.beginPath(); g.arc(30, 50, 9, 0, TAU); g.stroke(); }
      if (J.crownGems) { const cr = B.hair && B.hair.style === 'crown'; for (const [x, y] of (cr ? [[10, -116], [10, -163], [10, -208]] : [[8, -88], [-20, -84], [36, -90]])) { g.beginPath(); g.arc(x, y, 6, 0, TAU); g.fill(); } g.lineWidth = 4; for (const [y, w] of (cr ? [[-60, 66], [-94, 62], [-140, 46], [-186, 35]] : [[-70, 60]])) { g.beginPath(); g.moveTo(10 - w, y); g.lineTo(10 + w, y - 4); g.stroke(); } }
      if (J.flower) { for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(70 + Math.cos(i * 1.26) * 12, 0 + Math.sin(i * 1.26) * 12, 7, 0, TAU); g.fill(); } }
      g.restore(); g.restore();
      // ── textile: the pleat fan, tension folds, a patterned border, small woven motifs (mural cloth is never plain) ──
      if (B.lower && B.lower.kind !== 'none') {
        const [l0, l1] = r.legs, f = l0.knee[0] < l1.knee[0] ? l0 : l1, bk = f === l0 ? l1 : l0, kind = B.lower.kind, hemT = kind === 'sari' ? 0.93 : kind === 'short' || kind === 'bark' ? -0.25 : 0.74, fl = kind === 'sari' ? 1.25 : 1, dx = r.dragLow[0];
        const pt = (leg, t) => (t >= 0 ? CH.along(leg.knee, leg.ankle, t) : CH.along(leg.knee, leg.hip, -t));
        const hf = pt(f, hemT), hb = pt(bk, hemT), wf = r.hip[0] - 40 * b.w * b.hipW, wb = r.hip[0] + 50 * b.w, wy = r.hip[1] + 6, x0 = hf[0] - 36 * fl + dx, x1 = hb[0] + 44 * fl + dx * 1.6;
        g.save(); g.globalCompositeOperation = 'source-atop'; g.lineWidth = 2.6; g.globalAlpha *= 0.55;
        if (kind === 'sari' || kind === 'dhoti') for (let i = 0; i < 6; i++) { const u = i / 5; g.beginPath(); g.moveTo(lerp(wf + 4, wf + 40, u * 0.6), wy + 8); g.quadraticCurveTo(lerp(wf - 26, f.knee[0] + 10, u) + dx * 0.4, lerp(wy, hf[1], 0.5), lerp(x0 + 8, lerp(x0, x1, 0.55), u), hf[1] + 6); g.stroke(); }
        if (kind === 'dhoti') for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(wb - 6, wy + 14 + i * 34); g.quadraticCurveTo(lerp(wb, wf, 0.5), wy + 70 + i * 50, bk.knee[0] + 30 + dx, bk.knee[1] - 60 + i * 60); g.stroke(); }
        g.globalAlpha = a; g.lineWidth = 5;
        if (kind !== 'bark' && kind !== 'short') for (const off of [-12, -26]) { g.beginPath(); g.moveTo(x0, hf[1] + off); for (let i = 1; i <= 4; i++) { const u0 = (i - 1) / 4, u1 = i / 4; g.quadraticCurveTo(lerp(x0, x1, (u0 + u1) / 2) + dx * 0.3, lerp(hf[1], hb[1] - 4, (u0 + u1) / 2) + 20 + off, lerp(x0, x1, u1), lerp(hf[1], hb[1] - 4, u1) + off); } g.lineWidth = off === -12 ? 5 : 2.2; g.stroke(); }
        if (kind === 'sari') { g.globalAlpha = a * 0.7; for (let i = 0; i < 14; i++) { const u = hash(i, r.seed + 3), v = 0.12 + 0.7 * hash(i, r.seed + 4); g.beginPath(); g.arc(lerp(lerp(wf, wb, u), lerp(x0, x1, u), v), lerp(wy, hf[1], v), 4.2, 0, TAU); g.fill(); } }
        if (kind === 'short' || kind === 'bark') { g.globalAlpha = a * 0.6; g.lineWidth = 3; for (let i = 0; i < 5; i++) { const x = lerp(wf + 6, wb - 6, i / 4); g.beginPath(); g.moveTo(x, wy + 14); g.lineTo(x + dx * 0.4, wy + 96); g.stroke(); } }
        g.restore();
        g.lineWidth = 8; g.beginPath(); g.moveTo(wf - 2, wy + 4); g.quadraticCurveTo(lerp(wf, wb, 0.5), wy + 14, wb + 2, wy); g.stroke();   // the waist band
        g.beginPath(); g.arc(wf + 8, wy + 8, 8, 0, TAU); g.fill(); g.lineWidth = 3; g.beginPath(); g.moveTo(wf + 8, wy + 14); g.lineTo(wf + 2 + dx * 0.5, wy + 54); g.moveTo(wf + 12, wy + 14); g.lineTo(wf + 14 + dx * 0.5, wy + 50); g.stroke();   // its knot and tassels
      }
      if (J.armlets) for (const [s0, e0, t] of [[r.shN, r.elN, 0.55]]) { const p = CH.along(s0, e0, t), ang = Math.atan2(e0[1] - s0[1], e0[0] - s0[0]); g.save(); g.translate(p[0], p[1]); g.rotate(ang + PI / 2); g.fillRect(-24, -5, 48, 10); g.restore(); }
      if (J.bangles) { const p = CH.along(r.elN, r.nh, 0.82), ang = Math.atan2(r.nh[1] - r.elN[1], r.nh[0] - r.elN[0]); g.save(); g.translate(p[0], p[1]); g.rotate(ang + PI / 2); g.fillRect(-16, -9, 32, 5); g.fillRect(-16, 1, 32, 5); g.restore(); }
      if (B.lower && B.lower.border) { const [l0, l1] = r.legs, f = l0.knee[0] < l1.knee[0] ? l0 : l1, bk = f === l0 ? l1 : l0, t = B.lower.kind === 'sari' ? 0.86 : 0.5, pf = CH.along(f.knee, f.ankle, t), pb = CH.along(bk.knee, bk.ankle, t); g.lineWidth = 7; g.beginPath(); g.moveTo(pf[0] - 34 + r.dragLow[0], pf[1]); g.quadraticCurveTo((pf[0] + pb[0]) / 2 + r.dragLow[0] * 1.3, Math.max(pf[1], pb[1]) + 10, pb[0] + 40 + r.dragLow[0] * 1.6, pb[1] - 6); g.stroke(); }
      if (J.anklets) for (const l of r.legs) { g.fillRect(l.ankle[0] - 18, l.ankle[1] - 4, 36, 7); }
      g.restore();
    };
  }

  /** Register an acting character. */
  CH.actor = (B) => {
    // SILHOUETTE FIRST: the unlit fill is the lit skin at about a third of its value; a thin warm rim; no outer glow, no inner pass
    const rule = { fill: KIT.hex(B.skin[1], '#070403', 0.66), lit: B.skin[1], litGain: 0.95, rim: B.rim || ['#d8903e', '#ffe2a0'], inner: null, innerA: 0, glow: Math.min(B.glow ?? 0, 0.35), rimW: 0.62,
      ornament: B.ornament || ['#c8902a', '#ffe08a'], ornamentA: [0.75, 1], ...(B.rule || {}) };
    const b = { h: 1, leg: 1, head: 1, ...B.build }, top = -(480 * b.leg + 318 * b.h + 84 * b.head + 230 * b.head);
    const def = {
      id: B.id, rule, rig: makeRig(B), shape: makeShape(B), ornaments: makeOrnaments(B, rule), defaultPose: B.defaultPose || 'stand',
      bounds: () => [-640, Math.min(top, -1120) - (B.tall || 0), 600, 70],
      bible: { poses: Object.keys(POSES).map((name) => ({ name })), ...B.bible },
    };
    def.face = (P, r) => [r.head[0], r.head[1], 100 * (r.b.head || 1)];   // the face box (text must never cross it)
    if (B.aura) def.before = (ctx, P, r, k) => {
      const sx = P.flip ? -1 : 1, hx = P.x + sx * r.head[0] * P.s, hy = P.y + r.head[1] * P.s, cx = B.aura.ring ? hx : P.x + sx * r.hip[0] * P.s, cy = B.aura.ring ? hy : P.y + (r.hip[1] - 200) * P.s;
      KIT.glow(ctx, cx, cy, (B.aura.r || 500) * P.s, B.aura.color, (B.aura.a ?? 0.3) * 0.6 * (0.5 + 0.5 * k));
      if (B.aura.ring) { ctx.save(); ctx.strokeStyle = B.aura.color; ctx.globalAlpha = 0.7; ctx.lineWidth = 3 * P.s + 1; ctx.beginPath(); ctx.arc(hx, hy, 190 * P.s, 0, TAU); ctx.stroke(); ctx.globalAlpha = 0.3; ctx.beginPath(); ctx.arc(hx, hy, 214 * P.s, 0, TAU); ctx.stroke(); ctx.restore(); }   // the prabhavali ring of vyasa.js
    };
    if (B.after) def.after = B.after;
    return CH.define(def);
  };
  CH.actor.POSES = POSES;
})();
