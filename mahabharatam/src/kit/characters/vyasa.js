/*
 * CHARACTER · VYASA (Krishna Dvaipayana, "the dark one born on an island").
 *
 * The composer of the epic. Dark-complexioned (the only blue-black fill in
 * the series), lean, upright; long matted hair falling down his back to the
 * waist; a long full beard to the chest; a wide coiled topknot; bare chest with
 * the sacred thread; an ankle-length bark-cloth (valkala) with a ragged hem.
 * Props: the PALM-LEAF MANUSCRIPT (pothi, two boards and a cord) in the far
 * hand, a japa mala in the near hand.
 *
 * SIGNATURE LIGHT: soft gold halo. A wide warm-gold aura behind his head and a
 * faint prabhavali ring, a soft rim #b8925a → #ffe9b0, a cool inner glow
 * #1b2430 on a blue-black fill #0a0d12.
 *
 * Faces LEFT natively. Feet on (x, y). scale 1 ≈ 1040 px tall.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, CH = KIT.characters;
  const { TAU, clamp, lerp } = R;
  const { cut, limb, limbOutline, ik, hand, along } = CH;

  const D = { hip: 490, thigh: 246, shin: 232, foot: 72, sitHip: 150 };
  const PIV = -490, SH_N = [6, -770], SH_F = [30, -774], UP = 168, FO = 156;

  function rig(P) {
    const po = P.po, T = P.T, k = po.k;
    const r = CH.profileRig(po, D);
    r.T = T; r.wind = po.wind ?? 0.5;
    r.lean = r.st * 0.04 + (po.name === 'bow' ? 0.25 * k : 0);
    r.look = (P.ex.look || 0) + (po.name === 'dictate' ? -0.06 * k : 0);
    r.speak = P.ex.speak || 0;
    // near hand: the mala at his side; raised to teach/dictate/bless
    r.nearKind = 'fist'; r.nearA = Math.PI / 2;
    r.hand = r.sitting ? [-150, -470] : [-30, -520];
    if (po.name === 'speak') { r.nearKind = 'open'; r.hand = along(r.hand, [-230, -720], k); r.nearA = Math.PI + 0.4; }
    if (po.name === 'dictate') { r.nearKind = 'point'; r.hand = along(r.hand, [-190, -860], k); r.nearA = -Math.PI / 2 - 0.25; }
    if (po.name === 'bless') { r.nearKind = 'abhaya'; r.hand = along(r.hand, [-160, -850], k); r.nearA = -Math.PI / 2 - 0.1; }
    // far hand: the manuscript, held at the chest (on the lap when seated)
    r.farHand = r.sitting ? [-110, -560] : [-40, -650];
    r.pothiA = r.sitting ? 0.05 : -1.1;
    const c = Math.cos(-r.lean), s = Math.sin(-r.lean);
    const rot = (p) => [p[0] * c - (p[1] - PIV) * s, p[0] * s + (p[1] - PIV) * c + PIV];
    r.shN = rot(SH_N); r.shF = rot(SH_F);
    return r;
  }

  function headPath(g, r) {
    g.save();
    g.translate(8, -812);
    g.rotate(r.look);
    g.moveTo(32, 8);
    g.bezierCurveTo(42, -26, 52, -66, 48, -100);
    g.bezierCurveTo(44, -134, 20, -152, -10, -152);
    g.bezierCurveTo(-36, -150, -50, -134, -52, -112);
    g.lineTo(-56, -100);
    g.lineTo(-50, -93);
    g.bezierCurveTo(-56, -84, -66, -74, -72, -64);
    g.lineTo(-60, -60);
    g.lineTo(-62, -52);
    // a long, full beard to the chest
    g.bezierCurveTo(-72, -40, -82, -10, -80, 30);
    g.bezierCurveTo(-78, 90, -70, 150, -52, 196);
    g.bezierCurveTo(-34, 170, -12, 120, -4, 60);
    g.bezierCurveTo(0, 36, 6, 20, 8, 8);
    g.closePath(); cut(g);
    // the wide coiled topknot
    g.moveTo(56, -160); g.ellipse(10, -160, 46, 26, -0.1, 0, TAU); cut(g);
    g.moveTo(30, -192); g.ellipse(8, -190, 22, 18, 0, 0, TAU); cut(g);
    // matted hair falling down the back to the waist
    const sw = Math.sin(r.T * 1.1) * 6 * r.wind;
    g.moveTo(30, -150);
    g.bezierCurveTo(70, -120, 84, -40, 86, 60);
    g.bezierCurveTo(88, 160, 96 + sw, 250, 104 + sw, 330);
    g.lineTo(88 + sw, 310); g.lineTo(80 + sw, 340); g.lineTo(70 + sw, 300); g.lineTo(58 + sw, 326);
    g.bezierCurveTo(56, 220, 50, 120, 44, 40);
    g.bezierCurveTo(40, -20, 40, -80, 22, -120);
    g.closePath(); cut(g);
    if (r.speak > 0.02) {
      g.save(); g.globalCompositeOperation = 'destination-out';
      const o = 5 * r.speak;
      g.moveTo(-36, -44); g.lineTo(-74, -46 - o); g.lineTo(-74, -38 + o * 0.6); g.closePath(); cut(g);
      g.restore();
    }
    g.restore();
  }

  function torsoPath(g) {
    CH.torso(g, { waistY: -480, neckY: -808, chestY: -680, front: -46, back: 56, waistF: -36, waistB: 50, neckF: -6, neckB: 32, pec: 4, lat: 6 });
  }

  function pothi(g, r) {
    g.save();
    g.translate(r.farHand[0], r.farHand[1] - 20);
    g.rotate(r.pothiA);
    g.moveTo(-62, -16); g.lineTo(62, -16); g.lineTo(68, 0); g.lineTo(62, 16); g.lineTo(-62, 16); g.lineTo(-68, 0); g.closePath(); cut(g);
    // the cord's loose ends
    limbOutline(g, [[30, 16], [36, 46], [28, 70]], [5, 4, 3]); cut(g);
    g.restore();
  }

  function armsPath(g, r, near) {
    if (near) {
      const el = ik(r.shN, r.hand, UP, FO, r.nearKind === 'fist' ? -1 : -1);
      limb(g, [r.shN, el, r.hand], [54, 36, 28]);
      hand(g, r.hand, r.nearA, 38, r.nearKind);
    } else {
      const el = ik(r.shF, r.farHand, UP, FO, 1);
      limb(g, [r.shF, el, r.farHand], [50, 34, 26]);
      hand(g, r.farHand, -0.4, 36, 'cup');
      pothi(g, r);
    }
  }

  function clothPath(g, r) {
    CH.lowerCloth(g, r, { waistY: -490, waistF: -38, waistB: 52, len: 'ankle', flare: 1, pleats: false });
    if (!r.sitting) {
      // ragged bark-cloth hem
      const hemY = Math.max(r.legs[0].ankle[1], r.legs[1].ankle[1]) - 30;
      const xs = r.legs.map((l) => l.ankle[0]), x0 = Math.min(...xs) - 40, x1 = Math.max(...xs) + 44;
      for (let i = 0; i < 6; i++) {
        const x = lerp(x0, x1, (i + 0.5) / 6);
        g.moveTo(x - 14, hemY); g.lineTo(x, hemY + 22 + (i % 2) * 8); g.lineTo(x + 14, hemY); g.closePath(); cut(g);
      }
    }
  }

  function upper(g, r, part) {
    g.save(); g.translate(0, r.drop);
    if (part === 'back') { g.beginPath(); armsPath(g, r, false); g.fill(); }
    else if (part === 'body') {
      g.save(); g.translate(0, -PIV); g.rotate(-r.lean); g.translate(0, PIV);
      g.beginPath(); torsoPath(g); g.fill();
      g.beginPath(); headPath(g, r); g.fill();
      g.restore();
    } else { g.beginPath(); armsPath(g, r, true); g.fill(); }
    g.restore();
  }

  function shape(g, color, P, r) {
    g.translate(0, r.bob);
    g.fillStyle = color;
    upper(g, r, 'back');
    g.beginPath(); CH.legs(g, r, [70, 44, 24]); g.fill();
    g.beginPath(); clothPath(g, r); g.fill();
    upper(g, r, 'body');
    upper(g, r, 'front');
  }

  function ornaments(g, P, r, a, color) {
    if (a <= 0.01) return;
    g.translate(0, r.bob);
    g.globalAlpha *= a;
    g.strokeStyle = color; g.fillStyle = color; g.lineCap = 'round';
    g.save(); g.translate(0, r.drop);
    g.save(); g.translate(0, -PIV); g.rotate(-r.lean); g.translate(0, PIV);
    g.beginPath(); g.moveTo(-14, -790); g.quadraticCurveTo(-34, -640, 40, -500); g.lineWidth = 3.5; g.stroke();   // sacred thread
    g.beginPath(); g.moveTo(-38, -486); g.quadraticCurveTo(8, -474, 52, -492); g.lineWidth = 4; g.stroke();      // waist cord
    g.save(); g.translate(8, -812); g.rotate(r.look);
    g.beginPath(); g.ellipse(10, -160, 46, 26, -0.1, Math.PI * 0.95, Math.PI * 1.6); g.lineWidth = 3; g.stroke(); // topknot coil
    g.beginPath(); g.ellipse(10, -160, 30, 16, -0.1, Math.PI * 1.0, Math.PI * 1.7); g.lineWidth = 2.5; g.stroke();
    g.restore();
    g.restore();
    // the manuscript's boards and cord
    g.save(); g.translate(r.farHand[0], r.farHand[1] - 20); g.rotate(r.pothiA);
    g.lineWidth = 3; g.strokeRect(-62, -16, 124, 32);
    g.beginPath(); g.moveTo(22, -16); g.lineTo(22, 16); g.lineWidth = 3; g.stroke();
    g.restore();
    // the japa mala in the near hand
    if (r.nearKind === 'fist') CH.beads(g, [r.hand[0] + 4, r.hand[1] + 14], [r.hand[0] - 26, r.hand[1] + 120], [r.hand[0] + 16, r.hand[1] + 96], 12, 3.6);
    g.restore();
  }

  /** The halo: a wide soft gold aura and a faint prabhavali ring behind the head. */
  function before(ctx, P, r, k) {
    const sx = P.flip ? -P.s : P.s;
    const hx = P.x + 8 * sx, hy = P.y + (r.bob + r.drop - 900) * P.s;
    KIT.glow(ctx, hx, hy, 520 * P.s, '#ffcf7a', 0.32 * k);
    KIT.glow(ctx, hx, hy, 220 * P.s, '#fff0c0', 0.28 * k);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.28 * k;
    ctx.strokeStyle = '#ffd98a'; ctx.lineWidth = Math.max(1, 5 * P.s);
    ctx.beginPath(); ctx.arc(hx, hy, 150 * P.s, 0, TAU); ctx.stroke();
    ctx.globalAlpha = 0.12 * k; ctx.lineWidth = Math.max(1, 2 * P.s);
    ctx.beginPath(); ctx.arc(hx, hy, 172 * P.s, 0, TAU); ctx.stroke();
    ctx.restore();
  }

  const bible = {
    name: 'Vyasa (Krishna Dvaipayana)',
    role: 'Composer of the Mahabharata; grandfather of the Kauravas and Pandavas. Taught it to Vaishampayana, who recited it at Janamejaya\'s sacrifice.',
    palette: { fill: '#0a0d12', inner: '#1b2430', rimDim: '#b8925a', rimBright: '#ffe9b0', halo: '#ffcf7a', ornamentDim: '#a8741f', ornament: '#f7dc9c' },
    proportions: 'Standing height ≈ 1040 units: hip 490, thigh 246, shin 232; beard 200 (to the chest); hair to the waist (≈ 480 below the crown); topknot 92 wide.',
    props: ['palm-leaf manuscript (pothi) with boards and cord (far hand)', 'japa mala (near hand)', 'bark-cloth valkala with ragged hem', 'sacred thread'],
    light: 'Soft gold halo: aura #ffcf7a behind the head + prabhavali ring; soft rim #b8925a → #ffe9b0 (rim width × 0.85); cool inner #1b2430 on blue-black #0a0d12.',
    poses: [
      { name: 'stand' }, { name: 'walk' }, { name: 'sit', note: 'manuscript on the lap' },
      { name: 'speak', note: 'near hand opens (k)' }, { name: 'dictate', note: 'near hand raised, one finger up (k)' },
      { name: 'bless', note: 'abhaya (k)' }, { name: 'bow', note: 'k' },
    ],
    voice: 'vyasa',   // the speaker key in script/cast.json (voice id, speed, pitch)
  };

  CH.define({
    id: 'vyasa', bible, rig, shape, ornaments, before, defaultPose: 'stand',
    rule: {
      fill: '#0a0d12', lit: '#1e2a33', litGain: 0.8,
      rim: ['#b8925a', '#ffe9b0'], inner: '#1b2430', innerA: [0.85, 0.45], glow: 0.7, rimW: 0.85,
      ornament: ['#a8741f', '#f7dc9c'], ornamentA: [0.45, 0.8],
    },
    bounds: () => [-380, -1200, 300, 20],
  });
  CH.ROSTER.push('vyasa');
})();
