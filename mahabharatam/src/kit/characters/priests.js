/*
 * CHARACTER · THE PRIESTS OF THE SNAKE SACRIFICE (ritvij) · `priest`
 *
 * Episode 8 (CE 1.47–48): Janamejaya's sarpa-satra is performed by priests wearing
 * BLACK garments, their eyes red from the smoke, who pour the oblations and call the
 * serpents by name. The epic names them (CE 1.48): Chandabhargava (hotr), Kautsa
 * (udgatr), Jaimini (brahman), Sharngarava and Pingala (adhvaryus).
 *
 * Brahmins of the rite in profile: a shaven head with a knotted SHIKHA, a BLACK upper
 * cloth over both shoulders and a black ankle-length lower cloth, the sacred thread
 * showing at the chest, a darbha-grass ring on the near hand, a SRUVA ladle (offer) or
 * open hands (chant). Their EYES burn red. `index` picks the priest (a fixed design):
 *
 *   0 Chandabhargava (hotr)   older; a long pointed beard; broad      (×1.06 wide)
 *   1 Kautsa (udgatr)         a short beard; slim, tall                (×0.94, ×1.03 tall)
 *   2 Jaimini (brahman)       beardless; a heavy topknot instead of a shikha
 *   3 Sharngarava (adhvaryu)  a forked beard; stooped
 *
 * SIGNATURE LIGHT: ash and ember. Fill #0a0808 (the black cloth), inner #2a1a18, rim
 * #8a7a70 → #f2dcc8 (the pale ash on everything), ornaments #9a7a5a → #f0d0a0 (0.3–0.6);
 * the eyes a red ember (#ff3a1a) always. Never the fire's saffron: the fire lights them.
 *
 * Faces LEFT natively. Feet (or seat) on (x, y). scale 1 ≈ 1000 px standing.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, CH = KIT.characters;
  const { TAU, lerp } = R;
  const { cut, limb, ik, hand, along } = CH;

  const VARIANTS = [
    { name: 'Chandabhargava', w: 1.06, h: 1.0, beard: 'long', knot: 'shikha', stoop: 0.05 },
    { name: 'Kautsa', w: 0.94, h: 1.03, beard: 'short', knot: 'shikha', stoop: 0.0 },
    { name: 'Jaimini', w: 1.0, h: 1.0, beard: 'none', knot: 'bun', stoop: 0.02 },
    { name: 'Sharngarava', w: 1.0, h: 0.98, beard: 'fork', knot: 'shikha', stoop: 0.1 },
  ];
  const variant = (i) => VARIANTS[((i % 4) + 4) % 4];
  const D = { hip: 480, thigh: 242, shin: 228, foot: 70, sitHip: 145 };
  const PIV = -480, UP = 164, FO = 150;

  function rig(P) {
    const po = P.po, k = po.k, v = variant(P.index);
    const r = CH.profileRig(po, D);
    r.v = v; r.T = P.T; r.wind = po.wind ?? 0.4;
    r.lean = v.stoop + r.st * 0.04;
    r.look = P.ex.look || 0; r.speak = P.ex.speak || 0;
    let nh = r.sitting ? [-120, -480] : [-20, -530], nk = 'fist', na = Math.PI / 2;
    let fh = r.sitting ? [-60, -480] : [40, -540], fk = 'fist', fa = Math.PI / 2;
    r.ladle = 0;
    if (po.name === 'offer') {
      // the sruva held out over the fire, tipping (phase) to pour
      r.ladle = 1; r.lean += 0.12 * k;
      nh = along(nh, [-250, -640], k); fh = along(fh, [-150, -600], k); fk = 'open'; fa = Math.PI + 0.3;
      r.tip = 0.25 + 0.25 * Math.sin(po.phase || 0);
    }
    if (po.name === 'chant') {
      // both hands raised, palms forward: calling the serpents by name
      nh = along(nh, [-200, -880], k); nk = 'abhaya'; na = -Math.PI / 2 - 0.3;
      fh = along(fh, [-110, -900], k); fk = 'abhaya'; fa = -Math.PI / 2 - 0.15;
      r.look -= 0.12 * k;
    }
    if (po.name === 'speak') { nh = along(nh, [-250, -730], k); nk = 'open'; na = Math.PI + 0.45; }
    r.hand = nh; r.nearKind = nk; r.nearA = na; r.farHand = fh; r.farKind = fk; r.farA = fa;
    const c = Math.cos(-r.lean), s = Math.sin(-r.lean);
    r.rot = (p) => [p[0] * c - (p[1] - PIV) * s, p[0] * s + (p[1] - PIV) * c + PIV];
    r.shN = r.rot([4, -764]); r.shF = r.rot([28, -768]);
    return r;
  }

  function headPath(g, r) {
    const v = r.v;
    g.save();
    g.translate(6, -796);
    g.rotate(r.look);
    g.moveTo(30, 8);
    g.bezierCurveTo(40, -24, 50, -62, 46, -96);
    g.bezierCurveTo(42, -130, 16, -146, -12, -144);
    g.bezierCurveTo(-40, -142, -50, -122, -50, -104);
    g.lineTo(-48, -92);
    g.bezierCurveTo(-54, -84, -62, -74, -66, -64);
    g.lineTo(-55, -60); g.lineTo(-60, -54); g.lineTo(-55, -48);
    if (v.beard === 'long') { g.bezierCurveTo(-64, -20, -72, 40, -64, 110); g.lineTo(-40, 70); g.bezierCurveTo(-20, 40, 0, 20, 20, 10); }
    else if (v.beard === 'fork') { g.bezierCurveTo(-64, -20, -70, 30, -70, 70); g.lineTo(-54, 40); g.lineTo(-44, 72); g.bezierCurveTo(-30, 30, 0, 18, 20, 10); }
    else if (v.beard === 'short') { g.bezierCurveTo(-64, -30, -66, 0, -54, 18); g.bezierCurveTo(-30, 22, 0, 18, 20, 8); }
    else { g.lineTo(-55, -42); g.bezierCurveTo(-56, -28, -50, -14, -34, -6); g.bezierCurveTo(-18, 0, -4, 6, 4, 14); }
    g.closePath(); cut(g);
    g.moveTo(22, -70); g.ellipse(14, -70, 10, 18, 0.1, 0, TAU); cut(g);
    if (v.knot === 'bun') { g.moveTo(40, -150); g.ellipse(14, -152, 30, 22, 0.3, 0, TAU); cut(g); }
    else { g.moveTo(18, -140); g.quadraticCurveTo(26, -170, 14, -180); g.quadraticCurveTo(44, -178, 56, -150); g.quadraticCurveTo(40, -156, 34, -140); g.closePath(); cut(g); }
    if (r.speak > 0.02) {
      g.save(); g.globalCompositeOperation = 'destination-out';
      const o = 4 * r.speak;
      g.moveTo(-32, -34); g.lineTo(-57, -36 - o); g.lineTo(-57, -30 + o * 0.6); g.closePath(); cut(g);
      g.restore();
    }
    g.restore();
  }

  function torsoPath(g) {
    // the black upper cloth over both shoulders makes a broad, sloping shape
    CH.torso(g, { waistY: -470, neckY: -792, chestY: -680, front: -54, back: 66, waistF: -40, waistB: 56, neckF: -2, neckB: 30, pec: 6, lat: 10 });
  }

  function robePath(g, r) {
    if (r.sitting) { CH.lowerCloth(g, r, { waistY: -150, waistF: -40, waistB: 56 }); return; }
    CH.lowerCloth(g, r, { waistY: -480, waistF: -40, waistB: 56, len: 'ankle', flare: 1.1, pleats: false, T: r.T, wind: r.wind });
  }

  function armsPath(g, r, near) {
    const sh = near ? r.shN : r.shF, tgt = near ? r.hand : r.farHand;
    const el = ik(sh, tgt, UP, FO, near ? -1 : 1);
    limb(g, [sh, el, tgt], near ? [58, 40, 28] : [56, 38, 26]);   // wide black sleeves of cloth
    hand(g, tgt, near ? r.nearA : r.farA, 34, near ? r.nearKind : r.farKind);
    if (near && r.ladle) {
      // the sruva: a long handle and a small bowl, tipping
      const a = Math.PI - r.tip, e = [tgt[0] + Math.cos(a) * 240, tgt[1] + Math.sin(a) * 240];
      limb(g, [tgt, e], [10, 8]);
      g.moveTo(e[0] + 22, e[1]); g.ellipse(e[0], e[1] + 4, 24, 12, r.tip, 0, TAU); cut(g);
    }
  }

  function upperT(g, r) { g.translate(0, PIV); g.rotate(-r.lean); g.translate(0, -PIV); }

  function shape(g, color, P, r) {
    g.scale(r.v.w, r.v.h);
    g.translate(0, r.bob);
    g.fillStyle = color;
    g.save(); g.translate(0, r.drop);
    g.beginPath(); armsPath(g, r, false); g.fill();
    g.restore();
    g.beginPath(); CH.legs(g, r, [66, 42, 22]); g.fill();
    g.beginPath(); robePath(g, r); g.fill();
    g.save(); g.translate(0, r.drop);
    g.save(); upperT(g, r);
    g.beginPath(); torsoPath(g); g.fill();
    g.beginPath(); headPath(g, r); g.fill();
    g.restore();
    g.beginPath(); armsPath(g, r, true); g.fill();
    g.restore();
  }

  function ornaments(g, P, r, a, color) {
    if (a <= 0.01) return;
    g.scale(r.v.w, r.v.h);
    g.translate(0, r.bob);
    g.globalAlpha *= a;
    g.strokeStyle = color; g.fillStyle = color; g.lineCap = 'round';
    g.save(); g.translate(0, r.drop);
    g.save(); upperT(g, r);
    // the sacred thread where the black cloth parts; the cloth's edge
    g.beginPath(); g.moveTo(-10, -770); g.quadraticCurveTo(-46, -660, -40, -560); g.lineWidth = 2.5; g.stroke();
    g.beginPath(); g.moveTo(-30, -780); g.quadraticCurveTo(-60, -640, -42, -470); g.lineWidth = 1.5; g.globalAlpha *= 0.6; g.stroke(); g.globalAlpha /= 0.6;
    // ash marks on the brow
    g.save(); g.translate(6, -796); g.rotate(r.look);
    for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(-46, -118 + i * 7); g.lineTo(-22, -120 + i * 7); g.lineWidth = 2.2; g.stroke(); }
    g.restore();
    g.restore();
    // darbha ring on the near hand
    g.beginPath(); g.arc(r.hand[0], r.hand[1], 14, 0, TAU); g.lineWidth = 2.5; g.stroke();
    g.restore();
  }

  function scr(P, r, p) { const sx = P.flip ? -P.s : P.s; return [P.x + p[0] * r.v.w * sx, P.y + (p[1] + r.bob + r.drop) * r.v.h * P.s]; }

  function after(ctx, P, r, k) {
    // the eyes: red with smoke, always
    const e = scr(P, r, r.rot([6 - 36, -796 - 88]));
    KIT.glow(ctx, e[0], e[1], 34 * P.s, '#ff3a1a', 0.85);
    ctx.save(); ctx.fillStyle = '#ff6a3a'; ctx.beginPath(); ctx.ellipse(e[0], e[1], 7 * P.s, 3.2 * P.s, 0, 0, TAU); ctx.fill(); ctx.restore();
    void k;
  }

  const bible = {
    name: 'The priests of the snake sacrifice (ritvij)',
    role: 'Chandabhargava (hotr), Kautsa (udgatr), Jaimini (brahman), Sharngarava (adhvaryu): in black garments, eyes red with smoke, they call the serpents into the fire (CE 1.47–48).',
    palette: { fill: '#0a0808', inner: '#2a1a18', rimDim: '#8a7a70', rimBright: '#f2dcc8', ornamentDim: '#9a7a5a', ornament: '#f0d0a0', eyes: '#ff3a1a' },
    proportions: '≈ 1000 units standing: hip 480, thigh 242, shin 228. Variants: 0 broad ×1.06, 1 slim tall ×0.94/×1.03, 2 even, 3 stooped 0.1 rad.',
    props: ['black upper cloth over both shoulders, black ankle-length lower cloth', 'shaven head with a knotted shikha (Jaimini: a heavy topknot)', 'beard by index: long / short / none / forked', 'sacred thread at the chest', 'three ash lines on the brow', 'darbha-grass ring', 'sruva ladle (offer)'],
    light: 'Ash and ember: fill #0a0808, inner #2a1a18, rim #8a7a70 → #f2dcc8; ornaments #9a7a5a → #f0d0a0 (0.3–0.6); the eyes always burn red (#ff3a1a).',
    poses: [{ name: 'stand' }, { name: 'walk' }, { name: 'sit' }, { name: 'offer', note: 'k: the sruva held out over the fire; phase tips it' }, { name: 'chant', note: 'k: both hands raised, calling the serpents' }, { name: 'speak', note: 'k' }],
    voice: 'priests',
  };

  CH.define({
    id: 'priest', bible, rig, shape, ornaments, after, defaultPose: 'sit',
    rule: {
      fill: '#0a0808', lit: '#241a18', litGain: 0.7,
      rim: ['#8a7a70', '#f2dcc8'], inner: '#2a1a18', innerA: [0.8, 0.4], glow: 0.6,
      ornament: ['#9a7a5a', '#f0d0a0'], ornamentA: [0.3, 0.6],
    },
    bounds: () => [-560, -1220, 460, 30],
  });
  CH.ROSTER.push('priest');
  void lerp;
})();
