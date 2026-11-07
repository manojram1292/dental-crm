/*
 * CHARACTER · INDRA (Shakra), king of the gods · `indra`
 *
 * Episode 8 (CE 1.48): terrified by the snake sacrifice, Takshaka flees to Indra, who
 * promises to protect him. Recurs later (the churning of the ocean, Garuda and the
 * amrita, the Khandava forest).
 *
 * A king of heaven in profile: tall and broad, beardless, a long moustache; a towering
 * jewelled KIRITA with a sunburst crest and a round PRABHA (a disc-halo of rays) behind
 * the head; great earrings, a broad jewelled collar, a sacred thread of pearls, armlets,
 * an ankle-length silk dhoti with a flying sash; the VAJRA (thunderbolt: a short grip with
 * a three-pronged head at each end) always in the NEAR hand; the far hand gives (abhaya)
 * or rests on the throne. 'sit' seats him on a cloud-throne (lion legs, a cushion).
 *
 * SIGNATURE LIGHT: storm and lightning. Fill #0a0c18, inner #1a2a6a, rim #4a8cff →
 * #e8f4ff (rim ×1.1, glow 1.0), ornaments #e0b040 → #fff4c0 (0.6–1.0: gold on the blue);
 * a pale-gold prabha behind the head; the vajra crackles white-blue. Never the Pitrs'
 * translucent silver, never Takshaka's green.
 *
 * Faces LEFT natively. Feet (or seat) on (x, y). scale 1 ≈ 1100 px without the crown
 * (≈ 1230 with it): a head taller than Janamejaya.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, CH = KIT.characters;
  const { TAU, lerp } = R;
  const { cut, limb, limbOutline, ik, hand, along, ribbon } = CH;

  const D = { hip: 520, thigh: 262, shin: 246, foot: 76, sitHip: 150, throneHip: 320 };
  const PIV = -520, UP = 182, FO = 168;

  function rig(P) {
    const raw = P.po, k = raw.k;
    const po = raw.name === 'sit' || raw.base === 'throne' ? { ...raw, base: 'throne' } : raw;
    const r = CH.profileRig(po, D);
    r.T = P.T; r.wind = raw.wind ?? 0.7;
    r.lean = r.st * 0.04;
    r.look = P.ex.look || 0; r.speak = P.ex.speak || 0; r.wrath = P.ex.mood === 'wrath';
    // near hand: the vajra, held upright at the chest; far hand: rests or gives
    let nh = r.throne ? [-160, -720] : [-40, -600], va = -Math.PI / 2 + 0.15;
    let fh = r.throne ? [-60, -660] : [44, -580], fk = 'fist', fa = Math.PI / 2;
    if (raw.name === 'protect') { fh = along(fh, [-280, -860], k); fk = 'abhaya'; fa = -Math.PI / 2 - 0.25; }
    if (raw.name === 'speak') { fh = along(fh, [-260, -760], k); fk = 'open'; fa = Math.PI + 0.4; }
    if (raw.name === 'raise') { nh = along(nh, [-120, -1160], k); va = lerp(va, -Math.PI / 2, k); }
    r.hand = nh; r.vajraA = va; r.farHand = fh; r.farKind = fk; r.farA = fa;
    const c = Math.cos(-r.lean), s = Math.sin(-r.lean);
    r.rot = (p) => [p[0] * c - (p[1] - PIV) * s, p[0] * s + (p[1] - PIV) * c + PIV];
    r.shN = r.rot([4, -820]); r.shF = r.rot([32, -824]);
    return r;
  }

  function headPath(g, r) {
    g.save();
    g.translate(8, -852);
    g.rotate(r.look);
    g.moveTo(34, 8);
    g.bezierCurveTo(44, -26, 54, -66, 50, -102);
    g.bezierCurveTo(46, -130, 30, -144, 0, -146);
    g.lineTo(-50, -140); g.lineTo(-54, -112); g.lineTo(-50, -96);
    g.bezierCurveTo(-58, -86, -66, -76, -72, -66);
    g.lineTo(-60, -62);
    // a long moustache sweeping back
    g.lineTo(-70, -56); g.quadraticCurveTo(-40, -50, -20, -64); g.lineTo(-58, -50);
    g.lineTo(-60, -44);
    g.bezierCurveTo(-62, -30, -56, -14, -38, -6);
    g.bezierCurveTo(-20, 0, -4, 6, 6, 14);
    g.closePath(); cut(g);
    // hair at the nape
    for (let i = 0; i < 4; i++) { const y = -100 + i * 32; g.moveTo(66, y); g.ellipse(50 + i * 3, y, 17, 16, 0, 0, TAU); cut(g); }
    // the towering kirita: band, four tiers, a sunburst crest
    g.moveTo(-56, -132); g.lineTo(54, -132); g.lineTo(56, -156); g.lineTo(-52, -158); g.closePath(); cut(g);
    const tiers = [[-156, 48, 14], [-190, 42, 12], [-222, 34, 10], [-252, 26, 8]];
    for (const [y, w, h] of tiers) { g.moveTo(-w, y); g.lineTo(-w + 8, y - h - 20); g.lineTo(w - 6, y - h - 20); g.lineTo(w + 2, y); g.closePath(); cut(g); }
    for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * 0.28; g.moveTo(0, -276); g.lineTo(Math.cos(a - 0.07) * 70, -276 + Math.sin(a - 0.07) * 70); g.lineTo(Math.cos(a + 0.07) * 70, -276 + Math.sin(a + 0.07) * 70); g.closePath(); cut(g); }
    g.moveTo(40, -150); g.quadraticCurveTo(80, -150, 96, -186); g.quadraticCurveTo(84, -140, 48, -124); g.closePath(); cut(g);
    // great earring
    g.moveTo(36, -50); g.ellipse(20, -40, 18, 26, 0.2, 0, TAU); cut(g);
    if (r.speak > 0.02) {
      g.save(); g.globalCompositeOperation = 'destination-out';
      const o = 4 * r.speak;
      g.moveTo(-38, -36); g.lineTo(-62, -38 - o); g.lineTo(-62, -32 + o * 0.6); g.closePath(); cut(g);
      g.restore();
    }
    g.restore();
  }

  function torsoPath(g) {
    CH.torso(g, { waistY: -510, neckY: -846, chestY: -730, front: -62, back: 70, waistF: -42, waistB: 58, neckF: -6, neckB: 34, pec: 12, lat: 12 });
  }

  function sashPath(g, r) {
    const pts = ribbon([56, -520], 1.2 - 0.3 * r.wind, 280, r.T, 16 * r.wind, 4.2);
    limbOutline(g, pts, pts.map((_, i) => lerp(34, 10, i / (pts.length - 1)))); cut(g);
    const p2 = ribbon([40, -800], 1.0 - 0.2 * r.wind, 260, r.T, 18 * r.wind, 1.3, 14, 60);
    limbOutline(g, p2, p2.map((_, i) => lerp(26, 8, i / (p2.length - 1)))); cut(g);
  }

  function vajraPath(g, r) {
    const d = [Math.cos(r.vajraA), Math.sin(r.vajraA)], n = [-d[1], d[0]];
    const c = r.hand;
    limb(g, [[c[0] - d[0] * 70, c[1] - d[1] * 70], [c[0] + d[0] * 70, c[1] + d[1] * 70]], [22, 22]);
    for (const s of [-1, 1]) {
      const b = [c[0] + d[0] * 80 * s, c[1] + d[1] * 80 * s];
      g.moveTo(b[0] + 22, b[1]); g.arc(b[0], b[1], 22, 0, TAU); cut(g);
      for (const side of [-1, 0, 1]) {
        const tip = [b[0] + d[0] * 120 * s + n[0] * 40 * side, b[1] + d[1] * 120 * s + n[1] * 40 * side];
        const mid = [b[0] + d[0] * 50 * s + n[0] * 36 * side, b[1] + d[1] * 50 * s + n[1] * 36 * side];
        g.moveTo(b[0] + n[0] * 8, b[1] + n[1] * 8); g.quadraticCurveTo(mid[0], mid[1], tip[0], tip[1]); g.quadraticCurveTo(mid[0] - n[0] * 12 * (side || 1), mid[1] - n[1] * 12 * (side || 1), b[0] - n[0] * 8, b[1] - n[1] * 8); g.closePath(); cut(g);
      }
    }
  }

  function throne(g) {
    // a cloud-throne: a cushioned seat on lion legs, a cloud-scalloped back
    g.moveTo(-180, -320); g.lineTo(170, -320); g.lineTo(170, -280); g.lineTo(-180, -280); g.closePath(); cut(g);
    for (const x of [-160, 130]) { g.moveTo(x, -280); g.lineTo(x + 34, -280); g.lineTo(x + 30, -30); g.lineTo(x + 50, 0); g.lineTo(x - 14, 0); g.lineTo(x + 4, -30); g.closePath(); cut(g); }
    g.moveTo(130, -320); g.lineTo(170, -320); g.lineTo(170, -880); g.closePath(); cut(g);
    for (let i = 0; i < 5; i++) { g.moveTo(190, -880 + i * 120); g.arc(160, -880 + i * 120, 40, 0, TAU); cut(g); }
  }

  function armsPath(g, r, near) {
    const sh = near ? r.shN : r.shF, tgt = near ? r.hand : r.farHand;
    const el = ik(sh, tgt, UP, FO, near ? -1 : 1);
    limb(g, [sh, el, tgt], near ? [66, 44, 32] : [62, 42, 30]);
    const am = along(sh, el, 0.45), ax = el[0] - sh[0], ay = el[1] - sh[1], al = Math.hypot(ax, ay) || 1;
    g.moveTo(am[0] - (ay / al) * 34, am[1] + (ax / al) * 34); g.lineTo(am[0] - (ay / al) * 54 - (ax / al) * 12, am[1] + (ax / al) * 54 - (ay / al) * 12); g.lineTo(am[0] - (ay / al) * 34 - (ax / al) * 20, am[1] + (ax / al) * 34 - (ay / al) * 20); g.closePath(); cut(g);
    hand(g, tgt, near ? r.vajraA + Math.PI / 2 : r.farA, 40, near ? 'fist' : r.farKind);
  }

  function upperT(g, r) { g.translate(0, PIV); g.rotate(-r.lean); g.translate(0, -PIV); }

  function shape(g, color, P, r) {
    g.translate(0, r.bob);
    g.fillStyle = color;
    if (r.throne) { g.beginPath(); throne(g); g.fill(); }
    g.save(); g.translate(0, r.drop);
    g.beginPath(); armsPath(g, r, false); g.fill();
    g.beginPath(); sashPath(g, r); g.fill();
    g.restore();
    g.beginPath(); CH.legs(g, r, [78, 48, 26]); g.fill();
    g.beginPath();
    if (r.throne) {
      const kn = r.legs[0].knee;
      g.moveTo(-40, -360); g.lineTo(64, -360); g.lineTo(64, -290); g.lineTo(kn[0] - 30, kn[1] + 30); g.lineTo(kn[0] - 36, kn[1] - 40); g.closePath(); cut(g);
      g.moveTo(kn[0] - 30, kn[1]); g.quadraticCurveTo(kn[0] - 50, -150, kn[0] - 20, -60); g.lineTo(kn[0] + 30, -70); g.quadraticCurveTo(kn[0] + 20, -180, kn[0] + 30, kn[1]); g.closePath(); cut(g);
    } else CH.lowerCloth(g, r, { waistY: -520, waistF: -42, waistB: 58, len: 'ankle', flare: 1.15, pleats: true, T: r.T, wind: r.wind });
    g.fill();
    g.save(); g.translate(0, r.drop);
    g.save(); upperT(g, r);
    g.beginPath(); torsoPath(g); g.fill();
    g.beginPath(); headPath(g, r); g.fill();
    g.restore();
    g.beginPath(); vajraPath(g, r); g.fill();
    g.beginPath(); armsPath(g, r, true); g.fill();
    g.restore();
  }

  function ornaments(g, P, r, a, color) {
    if (a <= 0.01) return;
    g.translate(0, r.bob);
    g.globalAlpha *= a;
    g.strokeStyle = color; g.fillStyle = color; g.lineCap = 'round';
    if (!r.sitting) {
      const hemY = Math.max(r.legs[0].ankle[1], r.legs[1].ankle[1]) - 36;
      const xs = r.legs.map((l) => l.ankle[0]);
      g.beginPath(); g.moveTo(Math.min(...xs) - 34, hemY); g.quadraticCurveTo(lerp(xs[0], xs[1], 0.5), hemY + 14, Math.max(...xs) + 40, hemY - 4); g.lineWidth = 6; g.stroke();
    }
    g.save(); g.translate(0, r.drop);
    g.save(); upperT(g, r);
    g.beginPath(); g.moveTo(-44, -518); g.quadraticCurveTo(8, -504, 60, -524); g.lineWidth = 9; g.stroke();
    // broad collar and a pearl thread
    g.beginPath(); g.moveTo(-6, -844); g.quadraticCurveTo(-60, -800, -60, -770); g.lineWidth = 12; g.stroke();
    CH.beads(g, [30, -836], [-60, -700], [-44, -530], 18, 4);
    g.save(); g.translate(8, -852); g.rotate(r.look);
    for (const [y, w] of [[-156, 48], [-190, 42], [-222, 34], [-252, 26]]) { g.beginPath(); g.moveTo(-w - 2, y); g.lineTo(w + 4, y); g.lineWidth = 5; g.stroke(); }
    for (const [x, y] of [[0, -174], [0, -206], [0, -238], [0, -276]]) { g.beginPath(); g.arc(x, y, 6, 0, TAU); g.fill(); }
    g.beginPath(); g.ellipse(20, -40, 18, 26, 0.2, 0, TAU); g.lineWidth = 3.5; g.stroke();
    g.beginPath(); g.ellipse(-32, -94, 8, 3.4, 0.1, 0, TAU); g.fill();   // eye
    g.restore();
    g.restore();
    g.restore();
  }

  function scr(P, r, p) { const sx = P.flip ? -P.s : P.s; return [P.x + p[0] * sx, P.y + (p[1] + r.bob + r.drop) * P.s]; }

  function before(ctx, P, r, k) {
    // the prabha: a disc of pale-gold rays behind the head
    const h = scr(P, r, r.rot([14, -960]));
    const rad = 260 * P.s;
    KIT.glow(ctx, h[0], h[1], rad * 2.2, '#ffe9a8', 0.35 * (0.6 + 0.4 * k));
    ctx.save(); ctx.globalAlpha = 0.5 + 0.3 * k; ctx.strokeStyle = '#ffe9a8'; ctx.lineWidth = 3 * Math.max(0.5, P.s);
    ctx.beginPath(); ctx.arc(h[0], h[1], rad, 0, TAU); ctx.stroke();
    ctx.globalAlpha *= 0.5;
    for (let i = 0; i < 32; i++) { const a = (i / 32) * TAU + P.T * 0.05; ctx.beginPath(); ctx.moveTo(h[0] + Math.cos(a) * rad * 0.55, h[1] + Math.sin(a) * rad * 0.55); ctx.lineTo(h[0] + Math.cos(a) * rad * 0.95, h[1] + Math.sin(a) * rad * 0.95); ctx.stroke(); }
    ctx.restore();
  }

  function after(ctx, P, r, k) {
    // the vajra crackles
    const v = scr(P, r, r.hand);
    KIT.glow(ctx, v[0], v[1], 180 * P.s, '#9ad0ff', (0.45 + 0.25 * Math.sin(P.T * 13)) * k);
    if (r.wrath) KIT.glow(ctx, v[0], v[1], 360 * P.s, '#ffffff', 0.3 * k);
  }

  const bible = {
    name: 'Indra (Shakra), king of the gods',
    role: 'King of the devas. Takshaka flees to him from the snake sacrifice and he promises protection (CE 1.48). Recurs: the churning of the ocean, Garuda and the amrita.',
    palette: { fill: '#0a0c18', inner: '#1a2a6a', rimDim: '#4a8cff', rimBright: '#e8f4ff', ornamentDim: '#e0b040', ornament: '#fff4c0', prabha: '#ffe9a8' },
    proportions: '≈ 1100 units without the crown (≈ 1230 with it): hip 520, thigh 262, shin 246; broad (chest 132). Cloud-throne seat at 320.',
    props: ['towering kirita with a sunburst crest, a prabha disc-halo of rays', 'long moustache, beardless', 'great earrings, broad collar, pearl thread', 'armlets, belt', 'ankle-length silk dhoti, two flying sashes', 'vajra, always in the NEAR hand', 'cloud-throne (sit)'],
    light: 'Storm and lightning: fill #0a0c18, inner #1a2a6a, rim #4a8cff → #e8f4ff (×1.1, glow 1.0); ornaments #e0b040 → #fff4c0 (0.6–1.0); a pale-gold prabha behind the head; the vajra crackles white-blue.',
    poses: [{ name: 'stand' }, { name: 'walk' }, { name: 'sit', note: 'on the cloud-throne' }, { name: 'speak', note: 'k: far hand opens' }, { name: 'protect', note: 'k: far hand raised in abhaya' }, { name: 'raise', note: 'k: the vajra lifted high' }],
    voice: 'indra',
  };

  CH.define({
    id: 'indra', bible, rig, shape, ornaments, before, after, defaultPose: 'stand',
    rule: {
      fill: '#0a0c18', lit: '#56689a', litGain: 0.8, rimW: 1.1,
      rim: ['#4a8cff', '#e8f4ff'], inner: '#1a2a6a', innerA: [0.9, 0.45], glow: 1.0,
      ornament: ['#e0b040', '#fff4c0'], ornamentA: [0.6, 1.0],
    },
    bounds: () => [-560, -1420, 520, 30],
  });
  CH.ROSTER.push('indra');
})();
