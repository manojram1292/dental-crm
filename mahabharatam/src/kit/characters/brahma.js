/*
 * CHARACTER · BRAHMA (Pitamaha, the Grandfather) · `brahma`
 *
 * Episodes 11–17 (CE 1.15–18): the gods' council on Meru turns to him; at his word (and
 * Narayana's) Ananta uproots Mandara; he lets Kadru's curse on the serpents stand and gives
 * Kashyapa the knowledge that cures poison.
 *
 * Drawn FRONTALLY and SEATED on a great pink lotus, as in temple iconography: four faces
 * (the front one and the two side faces in profile are seen), each crowned with a tall
 * jata-mukuta; a long white beard on the front face; four arms (upper right a rosary,
 * upper left the palm-leaf Veda, lower right open in blessing, lower left the kamandalu);
 * an upper cloth over the left shoulder.
 *
 * SIGNATURE LIGHT: lotus-ivory. Fill #16100a, lit #3a2c18, inner #5a4220, rim #f2dcb0 →
 * #fffaf0 (warm ivory, softer and paler than Sauti's fire-gold), glow 0.75, ornaments
 * #e8b860 → #fff4d0; the lotus seat is painted rose-pink and glows from within.
 *
 * facing: 'front'. (x, y) = the base of the lotus. scale 1 ≈ 1100 px lotus to crown.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, CH = KIT.characters;
  const { TAU, lerp } = R;
  const { cut, limb, along, ik, hand } = CH;

  function rig(P) {
    const po = P.po, k = po.k;
    const r = { T: P.T, k, name: po.name };
    r.lr = [-150, -470]; r.lrKind = 'open'; r.lrA = Math.PI / 2 + 0.3;
    if (po.name === 'bless') { r.lr = along(r.lr, [-190, -640], k); r.lrKind = 'abhaya'; r.lrA = -Math.PI / 2; }
    if (po.name === 'speak') { r.lr = along(r.lr, [-240, -560], k); r.lrA = lerp(r.lrA, Math.PI + 0.3, k); }
    r.ur = [-210, -800]; r.ul = [210, -800]; r.ll = [150, -440];
    r.speak = P.ex.speak || 0;
    return r;
  }

  function face(g, x, y, side) {
    // side 0: front face (an oval and a beard); ±1: a profile face looking out to that side
    if (!side) {
      g.moveTo(x + 58, y); g.ellipse(x, y, 58, 70, 0, 0, TAU); cut(g);
      g.moveTo(x - 46, y + 10); g.bezierCurveTo(x - 50, y + 120, x - 20, y + 190, x, y + 210); g.bezierCurveTo(x + 20, y + 190, x + 50, y + 120, x + 46, y + 10); g.closePath(); cut(g);
    } else {
      const s = side;
      g.moveTo(x - s * 30, y - 60); g.bezierCurveTo(x + s * 30, y - 70, x + s * 46, y - 20, x + s * 52, y + 4); g.lineTo(x + s * 44, y + 14); g.bezierCurveTo(x + s * 48, y + 60, x + s * 30, y + 120, x + s * 10, y + 150); g.lineTo(x - s * 30, y + 60); g.closePath(); cut(g);
    }
    // a tiered jata-mukuta: three rounded tiers, narrowing, and a small finial
    for (const [dy, w, h] of [[-46, 50, 40], [-82, 40, 34], [-112, 28, 28]]) { g.moveTo(x - w, y + dy); g.quadraticCurveTo(x - w * 1.08, y + dy - h, x, y + dy - h * 1.2); g.quadraticCurveTo(x + w * 1.08, y + dy - h, x + w, y + dy); g.closePath(); cut(g); }
    g.moveTo(x + 12, y - 150); g.arc(x, y - 150, 12, 0, TAU); cut(g);
  }

  function shape(g, color, P, r) {
    g.fillStyle = color;
    g.beginPath();
    // crossed legs (padmasana) on the lotus
    g.moveTo(-250, -330); g.bezierCurveTo(-260, -260, -200, -230, 0, -232); g.bezierCurveTo(200, -230, 260, -260, 250, -330); g.bezierCurveTo(180, -380, 100, -400, 0, -400); g.bezierCurveTo(-100, -400, -180, -380, -250, -330); g.closePath(); cut(g);
    // torso
    g.moveTo(-90, -380); g.bezierCurveTo(-100, -480, -140, -560, -130, -640); g.quadraticCurveTo(0, -680, 130, -640); g.bezierCurveTo(140, -560, 100, -480, 90, -380); g.closePath(); cut(g);
    // upper cloth over the left shoulder
    g.moveTo(130, -650); g.bezierCurveTo(60, -600, -40, -480, -90, -400); g.lineTo(-60, -390); g.bezierCurveTo(-10, -470, 80, -580, 140, -610); g.closePath(); cut(g);
    // neck and the four faces (three seen)
    g.moveTo(-26, -660); g.lineTo(26, -660); g.lineTo(24, -700); g.lineTo(-24, -700); g.closePath(); cut(g);
    face(g, -112, -726, -1); face(g, 112, -726, 1);
    face(g, 0, -760, 0);
    // arms
    for (const [sh, hd, bend, w] of [[[-120, -630], r.ur, 1, 50], [[120, -630], r.ul, -1, 50], [[-112, -600], r.lr, -1, 48], [[112, -600], r.ll, 1, 48]]) {
      const el = ik(sh, hd, 170, 160, bend); limb(g, [sh, el, hd], [w, 36, 28]);
    }
    hand(g, r.lr, r.lrA, 36, r.lrKind);
    hand(g, r.ur, -Math.PI / 2, 32, 'fist'); hand(g, r.ul, -Math.PI / 2, 32, 'fist');
    // the palm-leaf Veda (upper left): a long bound bundle
    g.moveTo(r.ul[0] - 56, r.ul[1] - 56); g.lineTo(r.ul[0] + 56, r.ul[1] - 56); g.lineTo(r.ul[0] + 56, r.ul[1] - 22); g.lineTo(r.ul[0] - 56, r.ul[1] - 22); g.closePath(); cut(g);
    // the kamandalu (lower left)
    const k = r.ll;
    g.moveTo(k[0] + 50, k[1] + 50); g.ellipse(k[0], k[1] + 50, 50, 44, 0, 0, TAU); cut(g);
    g.moveTo(k[0] - 12, k[1]); g.lineTo(k[0] + 12, k[1]); g.lineTo(k[0] + 10, k[1] + 12); g.lineTo(k[0] - 10, k[1] + 12); g.closePath(); cut(g);
    g.moveTo(k[0] + 40, k[1] + 30); g.quadraticCurveTo(k[0] + 80, k[1] + 10, k[0] + 90, k[1] - 20); g.lineTo(k[0] + 80, k[1] - 24); g.quadraticCurveTo(k[0] + 70, k[1] + 4, k[0] + 36, k[1] + 20); g.closePath(); cut(g);
  }

  function ornaments(g, P, r, a, color) {
    if (a <= 0.01) return;
    g.globalAlpha *= a; g.strokeStyle = color; g.fillStyle = color; g.lineCap = 'round';
    // crown bands on the three crowns
    for (const [x, y] of [[-112, -726], [112, -726], [0, -760]]) for (const [dy, w] of [[-46, 46], [-82, 36], [-112, 25]]) { g.beginPath(); g.moveTo(x - w, y + dy); g.lineTo(x + w, y + dy); g.lineWidth = 5; g.stroke(); }
    // the rosary (upper right), a loop of beads
    for (let i = 0; i < 14; i++) { const an = (i / 14) * TAU; g.beginPath(); g.arc(r.ur[0] + Math.cos(an) * 34, r.ur[1] + 40 + Math.sin(an) * 50, 6, 0, TAU); g.fill(); }
    // the palm-leaf bundle's cords
    g.lineWidth = 3; for (const u of [-28, 28]) { g.beginPath(); g.moveTo(r.ul[0] + u, r.ul[1] - 58); g.lineTo(r.ul[0] + u, r.ul[1] - 20); g.stroke(); }
    // collar, sacred thread
    g.beginPath(); g.moveTo(-100, -650); g.quadraticCurveTo(0, -590, 100, -650); g.lineWidth = 9; g.stroke();
    g.beginPath(); g.moveTo(-110, -640); g.quadraticCurveTo(0, -500, 80, -390); g.lineWidth = 3; g.stroke();
    // the white beard's strands on the front face
    g.save(); g.globalAlpha *= 0.8; g.strokeStyle = '#fffaf0'; g.lineWidth = 3;
    for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(i * 14, -730); g.quadraticCurveTo(i * 18, -640, i * 6, -560); g.stroke(); }
    g.restore();
  }

  function lotus(ctx, P, k) {
    const s = P.s;
    ctx.save(); ctx.translate(P.x, P.y); ctx.scale(s, s);
    KIT.glow(ctx, 0, -200, 520, '#ff9ab8', 0.35 * k);
    const petal = (a, len, w, fill) => { ctx.save(); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(w, -len * 0.55, 0, -len); ctx.quadraticCurveTo(-w, -len * 0.55, 0, 0); ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = '#ffd8e4'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore(); };
    ctx.translate(0, -130);
    for (let i = 0; i < 9; i++) petal(-1.6 + (i / 8) * 3.2, 230, 70, '#b04a6a');
    for (let i = 0; i < 7; i++) petal(-1.2 + (i / 6) * 2.4, 250, 60, '#e07a98');
    ctx.restore();
  }
  function before(ctx, P, r, k) { KIT.glow(ctx, P.x, P.y - 700 * P.s, 700 * P.s, '#fff0d0', 0.22 * k); lotus(ctx, P, k); }

  const bible = {
    name: 'Brahma, the Grandfather',
    role: 'The creator, the gods\' counsel on Meru; he lets Kadru\'s curse stand and gives Kashyapa the cure for poison (CE 1.15–18).',
    palette: { fill: '#16100a', lit: '#b89870', inner: '#5a4220', rimDim: '#f2dcb0', rimBright: '#fffaf0', ornamentDim: '#e8b860', ornament: '#fff4d0', lotus: '#e07a98' },
    proportions: 'Frontal and seated: ≈ 1100 units from the base of the lotus to the crowns; four faces (three seen), four arms.',
    props: ['four faces with tall jata-mukutas', 'long white beard', 'rosary (upper right)', 'palm-leaf Veda (upper left)', 'kamandalu (lower left)', 'a great pink lotus seat'],
    light: 'Lotus-ivory: rim #f2dcb0 → #fffaf0 (paler than Sauti\'s fire-gold), glow 0.75, ornaments #e8b860 → #fff4d0; the lotus glows rose-pink.',
    poses: [{ name: 'sit', note: 'on the lotus (default)' }, { name: 'bless', note: 'k' }, { name: 'speak', note: 'k' }],
    voice: 'brahma',
  };

  CH.define({
    id: 'brahma', bible, rig, shape, ornaments, before, defaultPose: 'sit',
    rule: {
      fill: '#16100a', lit: '#b89870', litGain: 0.8,
      rim: ['#f2dcb0', '#fffaf0'], inner: '#5a4220', innerA: [0.85, 0.5], glow: 0.75,
      ornament: ['#e8b860', '#fff4d0'], ornamentA: [0.6, 0.95],
    },
    bounds: () => [-360, -1000, 360, 20],
  });
  CH.ROSTER.push('brahma');
})();
