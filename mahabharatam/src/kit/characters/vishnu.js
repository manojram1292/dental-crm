/*
 * CHARACTER · VISHNU (Narayana, Hari) · `vishnu`
 *
 * Episodes 11–16 (CE 1.15–17): Narayana tells the gods to churn the ocean with the asuras;
 * he takes the amrita from the asuras by an enchanting illusion (the enchantress is her
 * own module), his discus Sudarshana beheads Rahu, and with Nara he wins the war on the
 * shore. Recurs throughout the epic (Krishna is his own figure).
 *
 * Drawn FRONTALLY, as in temple iconography (samabhanga, standing straight): four arms
 * (upper right the discus SUDARSHANA, upper left the conch PANCHAJANYA, lower right open
 * in blessing or speech, lower left resting on the MACE), a tall cylindrical KIRITA with
 * jewel bands, makara earrings, the KAUSTUBHA jewel on the chest, the long forest garland
 * (vanamala) to the knees, and the yellow silk (pitambara) with a fan of pleats. A lotus-
 * petal aureole (prabha) behind him.
 *
 * SIGNATURE LIGHT: rain-cloud indigo in gold. Fill #0b1030, lit #1e2c78, inner #2a3a9a,
 * rim #e8b040 → #fff2c0 (the gold of the pitambara), glow 0.85; ornaments #f0c050 →
 * #fffbe0; the Kaustubha burns white-blue; the discus white-gold fire. Never Indra's
 * electric blue rim or Kashyapa's turquoise: Vishnu is dark, edged in GOLD.
 *
 * facing: 'front'. (x, y) = feet. scale 1 ≈ 1120 px to the top of the crown.
 *   CH.vishnu.discus(ctx, x, y, r, T, a)   Sudarshana in flight (a spinning wheel of fire)
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, CH = KIT.characters;
  const { TAU, lerp } = R;
  const { cut, limb, along, ik, hand } = CH;

  function rig(P) {
    const po = P.po, k = po.k, T = P.T;
    const r = { T, k, name: po.name, br: Math.sin(T * 1.6) * 3 };
    // upper hands: discus (screen left) and conch (screen right), raised beside the crown
    r.ur = [-230, -930]; r.ul = [230, -930];
    // lower right: at the hip / blessing / speaking; lower left: on the mace head
    r.lr = [-170, -600]; r.lrKind = 'open'; r.lrA = Math.PI / 2 + 0.4;
    r.ll = [190, -470];
    if (po.name === 'bless') { r.lr = along(r.lr, [-200, -760], k); r.lrKind = 'abhaya'; r.lrA = -Math.PI / 2; }
    if (po.name === 'speak') { r.lr = along(r.lr, [-250, -700], k); r.lrKind = 'open'; r.lrA = lerp(Math.PI / 2 + 0.4, Math.PI + 0.3, k); }
    if (po.name === 'discus') { r.ur = along(r.ur, [-300, -1180], k); }
    r.discusR = 70 + (po.name === 'discus' ? 50 * k : 0);
    r.spin = T * (po.name === 'discus' ? 3 + 6 * k : 0.6);
    r.noDiscus = !!po.noDiscus;   // the discus is away (in flight, drawn by the scene)
    return r;
  }

  function shape(g, color, P, r) {
    g.fillStyle = color;
    g.beginPath();
    // legs under the pitambara: a long garment to the ankles, flared, with the fan of pleats
    g.moveTo(-110, -540); g.lineTo(110, -540); g.bezierCurveTo(130, -380, 120, -200, 100, -60); g.lineTo(130, -40); g.lineTo(-130, -40); g.lineTo(-100, -60); g.bezierCurveTo(-120, -200, -130, -380, -110, -540); g.closePath(); cut(g);
    for (const s of [-1, 1]) { g.moveTo(s * 40, -60); g.lineTo(s * 90, -60); g.lineTo(s * 96, 0); g.lineTo(s * 26, 0); g.closePath(); cut(g); }
    // sash loops at the hips
    for (const s of [-1, 1]) { g.moveTo(s * 100, -560); g.quadraticCurveTo(s * 210, -500, s * 170, -380); g.quadraticCurveTo(s * 150, -470, s * 90, -500); g.closePath(); cut(g); }
    // torso: broad shoulders, narrow waist
    g.moveTo(-96, -540); g.bezierCurveTo(-110, -620, -150, -700, -140, -780); g.quadraticCurveTo(-60, -810, 0, -808); g.quadraticCurveTo(60, -810, 140, -780); g.bezierCurveTo(150, -700, 110, -620, 96, -540); g.closePath(); cut(g);
    // neck, head
    g.moveTo(-30, -800); g.lineTo(30, -800); g.lineTo(28, -850); g.lineTo(-28, -850); g.closePath(); cut(g);
    g.moveTo(58, -910); g.ellipse(0, -910, 58, 72, 0, 0, TAU); cut(g);
    // the tall cylindrical kirita
    g.moveTo(-62, -960); g.lineTo(-56, -1100); g.quadraticCurveTo(0, -1130, 56, -1100); g.lineTo(62, -960); g.closePath(); cut(g);
    g.moveTo(-26, -1110); g.quadraticCurveTo(0, -1180, 26, -1110); g.closePath(); cut(g);
    // makara earrings
    for (const s of [-1, 1]) { g.moveTo(s * 62, -890); g.ellipse(s * 66, -880, 16, 22, 0, 0, TAU); cut(g); }
    // four arms
    const shR = [-130, -770], shL = [130, -770];
    // upper arms: out and down to the elbow, the forearm rising (the classic four-armed stance)
    for (const [sh, hd, s] of [[shR, r.ur, -1], [shL, r.ul, 1]]) {
      const el = [sh[0] + s * 120, -690 + Math.min(0, hd[1] + 930) * 0.4]; limb(g, [sh, el, hd], [56, 42, 30]);
    }
    for (const [sh, hd, s] of [[[-120, -730], r.lr, -1], [[120, -730], r.ll, 1]]) {
      const el = ik(sh, hd, 190, 180, s > 0 ? 1 : -1); limb(g, [sh, el, hd], [54, 40, 30]);
    }
    hand(g, r.lr, r.lrA, 40, r.lrKind);
    hand(g, r.ll, -Math.PI / 2, 36, 'fist');
    // the mace: a long shaft from the lower left hand to the ground, a ribbed head under the hand
    limb(g, [[r.ll[0] + 30, r.ll[1] + 30], [r.ll[0] + 60, -10]], [24, 20]);
    g.moveTo(r.ll[0] + 52, r.ll[1] - 8); g.ellipse(r.ll[0] + 22, r.ll[1] - 8, 36, 48, 0.15, 0, TAU); cut(g);
    // the conch in the upper left hand
    const c = r.ul;
    g.moveTo(c[0] - 34, c[1] + 10); g.bezierCurveTo(c[0] - 40, c[1] - 60, c[0] + 30, c[1] - 90, c[0] + 44, c[1] - 30); g.bezierCurveTo(c[0] + 50, c[1] + 10, c[0] + 10, c[1] + 40, c[0] - 34, c[1] + 10); g.closePath(); cut(g);
    // the discus rides on the upper right forefinger (its fire is drawn in after())
    hand(g, r.ur, -Math.PI / 2, 34, 'point');
    // the garland, as a band hanging from the shoulders to the knees
    g.moveTo(-120, -760); g.bezierCurveTo(-150, -500, -110, -260, 0, -230); g.bezierCurveTo(110, -260, 150, -500, 120, -760);
    g.lineTo(100, -750); g.bezierCurveTo(124, -500, 90, -280, 0, -258); g.bezierCurveTo(-90, -280, -124, -500, -100, -750); g.closePath(); cut(g);
  }

  function ornaments(g, P, r, a, color) {
    if (a <= 0.01) return;
    g.globalAlpha *= a; g.strokeStyle = color; g.fillStyle = color; g.lineCap = 'round';
    // crown bands and the jewel at its brow
    for (const y of [-975, -1030, -1085]) { g.beginPath(); g.moveTo(-60, y); g.quadraticCurveTo(0, y + 8, 60, y); g.lineWidth = 7; g.stroke(); }
    g.beginPath(); g.arc(0, -1000, 9, 0, TAU); g.fill();
    // broad collar and sacred thread
    g.beginPath(); g.moveTo(-110, -790); g.quadraticCurveTo(0, -700, 110, -790); g.lineWidth = 12; g.stroke();
    g.beginPath(); g.moveTo(-110, -770); g.quadraticCurveTo(-10, -620, 90, -540); g.lineWidth = 4; g.stroke();
    // the waist band and the pleats of the pitambara
    g.beginPath(); g.moveTo(-104, -545); g.lineTo(104, -545); g.lineWidth = 10; g.stroke();
    for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(i * 18, -530); g.lineTo(i * 26, -70); g.lineWidth = 3; g.stroke(); }
    // armlets and bangles
    for (const s of [-1, 1]) for (const y of [-700, -690]) { g.beginPath(); g.arc(s * 150, y, 12, 0, TAU); g.lineWidth = 4; g.stroke(); }
    // garland flowers
    for (let i = 0; i <= 12; i++) { const u = i / 12; const x = Math.sin(Math.PI * u) * 0 + lerp(-125, 125, u); const y = -760 + Math.sin(Math.PI * u) * 510; g.beginPath(); g.arc(x * (0.35 + 0.65 * Math.abs(Math.cos(Math.PI * u))), y, 9, 0, TAU); g.fill(); }
    // the Kaustubha, burning white-blue on the chest
    g.save(); g.fillStyle = '#e8f6ff'; g.shadowColor = '#9ad8ff'; g.shadowBlur = R.px(18 * P.s); g.beginPath(); g.arc(0, -720, 16, 0, TAU); g.fill(); g.restore();
  }

  function before(ctx, P, r, k) {
    // the lotus-petal aureole behind him
    const cx = P.x, cy = P.y - 760 * P.s, s = P.s;
    KIT.glow(ctx, cx, cy, 900 * s, '#e8b040', 0.25 * k);
    ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#3a2a10'; ctx.strokeStyle = '#e8b040'; ctx.lineWidth = 4;
    for (let i = 0; i < 18; i++) {
      const a = -Math.PI + (i / 17) * Math.PI * 2;
      ctx.save(); ctx.rotate(a);
      ctx.beginPath(); ctx.moveTo(300, -30); ctx.quadraticCurveTo(400, 0, 300, 30); ctx.quadraticCurveTo(330, 0, 300, -30); ctx.fill(); ctx.stroke();
      ctx.restore();
    }
    ctx.beginPath(); ctx.arc(0, -150, 170, 0, TAU); ctx.globalAlpha = 0.35; ctx.fillStyle = '#ffe8a0'; ctx.fill();
    ctx.restore();
  }

  function discus(ctx, x, y, rr, T, a = 1, spin = T * 6) {
    if (a <= 0.01) return;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y);
    KIT.glow(ctx, 0, 0, rr * 4, '#ffe8a0', 0.7);
    ctx.rotate(spin);
    ctx.fillStyle = '#fff8e0';
    ctx.beginPath();
    for (let i = 0; i < 16; i++) { const a0 = (i / 16) * TAU; ctx.lineTo(Math.cos(a0) * rr * 1.25, Math.sin(a0) * rr * 1.25); ctx.lineTo(Math.cos(a0 + 0.2) * rr, Math.sin(a0 + 0.2) * rr); }
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#e8a030'; ctx.lineWidth = rr * 0.12;
    ctx.beginPath(); ctx.arc(0, 0, rr * 0.78, 0, TAU); ctx.stroke();
    for (let i = 0; i < 8; i++) { const a0 = (i / 8) * TAU; ctx.beginPath(); ctx.moveTo(Math.cos(a0) * rr * 0.2, Math.sin(a0) * rr * 0.2); ctx.lineTo(Math.cos(a0) * rr * 0.75, Math.sin(a0) * rr * 0.75); ctx.lineWidth = rr * 0.08; ctx.stroke(); }
    ctx.fillStyle = '#e8a030'; ctx.beginPath(); ctx.arc(0, 0, rr * 0.2, 0, TAU); ctx.fill();
    ctx.restore();
  }

  function after(ctx, P, r) {
    if (r.noDiscus) return;
    const sx = P.flip ? -P.s : P.s;
    const x = P.x + r.ur[0] * sx, y = P.y + (r.ur[1] - 70 - r.discusR * 0.4) * P.s;
    discus(ctx, x, y, r.discusR * P.s, r.T, 1, r.spin);
  }

  const bible = {
    name: 'Vishnu (Narayana)',
    role: 'Narayana counsels the churning, takes the amrita by an enchanting illusion, beheads Rahu with the discus and wins the war on the shore with Nara (CE 1.15–17).',
    palette: { fill: '#0b1030', lit: '#1e2c78', inner: '#2a3a9a', rimDim: '#e8b040', rimBright: '#fff2c0', ornamentDim: '#f0c050', ornament: '#fffbe0' },
    proportions: 'Frontal, ≈ 1120 units to the top of the kirita; shoulders 280 wide; four arms.',
    props: ['discus Sudarshana (upper right)', 'conch (upper left)', 'mace (lower left, resting on the ground)', 'tall cylindrical kirita', 'makara earrings', 'the Kaustubha jewel', 'forest garland to the knees', 'yellow pitambara with a fan of pleats', 'lotus-petal aureole'],
    light: 'Rain-cloud indigo edged in gold: rim #e8b040 → #fff2c0, glow 0.85, a gold lotus aureole behind, the Kaustubha white-blue, the discus white-gold fire.',
    poses: [{ name: 'stand' }, { name: 'bless', note: 'k: abhaya' }, { name: 'speak', note: 'k' }, { name: 'discus', note: 'k: the discus raised high, blazing and spinning' }],
    voice: 'vishnu',
  };

  const mod = CH.define({
    id: 'vishnu', bible, rig, shape, ornaments, before, after, defaultPose: 'stand',
    rule: {
      fill: '#0b1030', lit: '#1e2c78', litGain: 0.8,
      rim: ['#e8b040', '#fff2c0'], inner: '#2a3a9a', innerA: [0.8, 0.5], glow: 0.85,
      ornament: ['#f0c050', '#fffbe0'], ornamentA: [0.65, 1.0],
    },
    bounds: () => [-420, -1340, 420, 30],
  });
  mod.discus = discus;
  CH.ROSTER.push('vishnu');
})();
