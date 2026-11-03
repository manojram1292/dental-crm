/*
 * CHARACTER · ARUNA, Vinata's first son, the red of dawn · `aruna`
 *
 * Episode 10 (CE 1.14): Vinata, ashamed that her rival's sons were born, breaks one of
 * her two eggs. Inside is a son whose upper body is formed and whose lower body is not.
 * Angry, he curses her to be her rival's slave for five hundred years, unless his brother,
 * left to hatch in his own time, sets her free. He rises into the sky and becomes the
 * charioteer of the Sun: the red of dawn.
 *
 * A radiant youth from the waist up, beardless, with long hair streaming back like flame
 * and a small crown-band with a sunburst jewel, earrings, a necklace, armlets; BELOW THE
 * WAIST HE IS NOT YET FORMED: the body thins into wisps of red light and mist (drawn with
 * the rig's fade, like the Pitrs, but solid and warm above). In 'rein' he holds the Sun's
 * reins in both hands.
 *
 * SIGNATURE LIGHT: dawn red. Fill #1a0606, inner #6a140a, rim #ff5a3a → #ffd8b0
 * (rim ×1.05, glow 1.1, a halo rim all round, faded below the waist), ornaments #ffb070 →
 * #fff0d0 (0.55–0.95); a red aura behind him. Never Parashurama's blood-red (darker,
 * wrathful) or Shringin's vermilion (no aura).
 *
 * Faces LEFT natively. (x, y) = where his feet would be. scale 1 ≈ 1040 px.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, CH = KIT.characters;
  const { TAU, lerp } = R;
  const { cut, limb, limbOutline, ik, hand, along, ribbon } = CH;

  const D = { hip: 500, thigh: 250, shin: 236, foot: 72, sitHip: 150 };
  const PIV = -500, UP = 170, FO = 156;

  function rig(P) {
    const po = P.po, k = po.k;
    const r = CH.profileRig({ ...po, name: 'stand', stride: 0 }, D);
    r.T = P.T; r.wind = po.wind ?? 0.8;
    r.lean = 0; r.look = P.ex.look || 0; r.speak = P.ex.speak || 0; r.wrath = P.ex.mood === 'wrath';
    let nh = [-34, -500], nk = 'open', na = Math.PI / 2 + 0.15, fh = [60, -520], fk = 'open', fa = Math.PI / 2 - 0.1;
    if (po.name === 'emerge') { r.lean = -0.1 * (1 - k); nh = along([-60, -760], nh, k); fh = along([30, -780], fh, k); nk = 'open'; na = -Math.PI / 2; fa = -Math.PI / 2; }
    if (po.name === 'speak') { nh = along(nh, [-250, -740], k); nk = 'open'; na = Math.PI + 0.45; }
    if (po.name === 'curse') { nh = along(nh, [-200, -920], k); nk = 'point'; na = -Math.PI / 2 - 0.45; r.lean += 0.05 * k; }
    if (po.name === 'point') { nh = along(nh, [-320, -640], k); nk = 'point'; na = Math.PI - 0.25; }
    if (po.name === 'rise') { nh = along(nh, [-120, -1120], k); fh = along(fh, [10, -1100], k); nk = 'open'; fk = 'open'; na = -Math.PI / 2 - 0.2; fa = -Math.PI / 2 - 0.1; r.look -= 0.25 * k; }
    if (po.name === 'rein') { nh = along(nh, [-260, -660], k); fh = along(fh, [-200, -690], k); nk = 'fist'; fk = 'fist'; na = 0; fa = 0; r.lean += 0.12 * k; }
    r.hand = nh; r.nearKind = nk; r.nearA = na; r.farHand = fh; r.farKind = fk; r.farA = fa;
    const c = Math.cos(-r.lean), s = Math.sin(-r.lean);
    r.rot = (p) => [p[0] * c - (p[1] - PIV) * s, p[0] * s + (p[1] - PIV) * c + PIV];
    r.shN = r.rot([4, -790]); r.shF = r.rot([30, -794]);
    return r;
  }

  function headPath(g, r) {
    g.save(); g.translate(8, -822); g.rotate(r.look);
    g.moveTo(32, 8);
    g.bezierCurveTo(42, -26, 52, -66, 48, -100);
    g.bezierCurveTo(44, -126, 30, -140, 0, -142);
    g.lineTo(-48, -136); g.lineTo(-52, -110); g.lineTo(-48, -94);
    g.bezierCurveTo(-56, -84, -64, -74, -70, -64);
    g.lineTo(-58, -60); g.lineTo(-62, -54); g.lineTo(-56, -50); g.lineTo(-58, -44);
    g.bezierCurveTo(-60, -30, -54, -14, -36, -6);
    g.bezierCurveTo(-20, 0, -4, 6, 4, 14);
    g.closePath(); cut(g);
    // long hair streaming back like flame
    for (let i = 0; i < 4; i++) {
      const pts = ribbon([30, -120 + i * 26], 0.15 + i * 0.12, 200 - i * 20, r.T + i, 10 * r.wind, i * 1.7, 10, -20);
      limbOutline(g, pts, pts.map((_, j) => lerp(30, 4, j / (pts.length - 1)))); cut(g);
    }
    // crown band and sunburst jewel
    g.moveTo(-52, -130); g.lineTo(50, -130); g.lineTo(52, -150); g.lineTo(-50, -152); g.closePath(); cut(g);
    for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.4; g.moveTo(0, -152); g.lineTo(Math.cos(a - 0.08) * 40, -152 + Math.sin(a - 0.08) * 40); g.lineTo(Math.cos(a + 0.08) * 40, -152 + Math.sin(a + 0.08) * 40); g.closePath(); cut(g); }
    g.moveTo(30, -44); g.arc(18, -44, 12, 0, TAU); cut(g);
    if (r.speak > 0.02) {
      g.save(); g.globalCompositeOperation = 'destination-out';
      const o = 4 * r.speak;
      g.moveTo(-34, -34); g.lineTo(-60, -36 - o); g.lineTo(-60, -30 + o * 0.6); g.closePath(); cut(g);
      g.restore();
    }
    g.restore();
  }

  function torsoPath(g) {
    CH.torso(g, { waistY: -490, neckY: -818, chestY: -700, front: -50, back: 58, waistF: -36, waistB: 50, neckF: -6, neckB: 30, pec: 8, lat: 8 });
  }

  function wisps(g, r) {
    // below the waist: unformed, wisps of light trailing down
    for (let i = 0; i < 6; i++) {
      const x0 = -36 + i * 16, sw = Math.sin(r.T * 2.2 + i * 1.3) * 26 * r.wind;
      const pts = [[x0, -500], [x0 + sw * 0.4, -380], [x0 + sw, -240 + i * 10], [x0 + sw * 1.4, -100 + i * 18]];
      limbOutline(g, pts, [40, 30, 18, 4]); cut(g);
    }
  }

  function armsPath(g, r, near) {
    const sh = near ? r.shN : r.shF, tgt = near ? r.hand : r.farHand;
    const el = ik(sh, tgt, UP, FO, near ? -1 : 1);
    limb(g, [sh, el, tgt], near ? [56, 38, 28] : [52, 36, 26]);
    hand(g, tgt, near ? r.nearA : r.farA, 36, near ? r.nearKind : r.farKind);
  }

  function upperT(g, r) { g.translate(0, PIV); g.rotate(-r.lean); g.translate(0, -PIV); }

  function shape(g, color, P, r) {
    g.fillStyle = color;
    g.beginPath(); armsPath(g, r, false); g.fill();
    g.beginPath(); wisps(g, r); g.fill();
    g.save(); upperT(g, r);
    g.beginPath(); torsoPath(g); g.fill();
    g.beginPath(); headPath(g, r); g.fill();
    g.restore();
    g.beginPath(); armsPath(g, r, true); g.fill();
  }

  function ornaments(g, P, r, a, color) {
    if (a <= 0.01) return;
    g.globalAlpha *= a;
    g.strokeStyle = color; g.fillStyle = color; g.lineCap = 'round';
    g.save(); upperT(g, r);
    CH.beads(g, [-8, -808], [-54, -756], [-40, -716], 9, 4.4);
    g.beginPath(); g.moveTo(-38, -496); g.quadraticCurveTo(8, -484, 52, -500); g.lineWidth = 6; g.stroke();
    g.save(); g.translate(8, -822); g.rotate(r.look);
    g.beginPath(); g.arc(0, -168, 7, 0, TAU); g.fill();
    g.beginPath(); g.ellipse(-30, -90, 7, 3, 0.1, 0, TAU); g.fill();
    g.restore();
    g.restore();
  }

  function before(ctx, P, r, k) {
    const sx = P.flip ? -P.s : P.s, h = r.rot([0, -720]);
    KIT.glow(ctx, P.x + h[0] * sx, P.y + h[1] * P.s, 620 * P.s, '#ff5a3a', 0.4 * (0.6 + 0.4 * k));
  }
  function after(ctx, P, r, k) {
    if (!r.wrath) return;
    const sx = P.flip ? -P.s : P.s, e = r.rot([8 - 30, -822 - 90]);
    KIT.glow(ctx, P.x + e[0] * sx, P.y + e[1] * P.s, 50 * P.s, '#ffd0a0', 0.9 * k);
  }

  const bible = {
    name: 'Aruna, the red of dawn',
    role: 'Vinata\'s first son, born from an egg broken too soon: formed above the waist, unformed below. He curses his mother to five hundred years of slavery unless his brother frees her, and becomes the charioteer of the Sun (CE 1.14).',
    palette: { fill: '#1a0606', inner: '#6a140a', rimDim: '#ff5a3a', rimBright: '#ffd8b0', ornamentDim: '#ffb070', ornament: '#fff0d0', aura: '#ff5a3a' },
    proportions: '≈ 1040 units where his feet would be: a youth\'s frame (hip 500); below the waist only wisps of light (faded, 45 %).',
    props: ['long hair streaming back like flame', 'crown band with a sunburst jewel', 'round earrings, necklace, armlets, belt', 'below the waist: wisps of red light (unformed)', 'the Sun\'s reins (rein)'],
    light: 'Dawn red: fill #1a0606, inner #6a140a, rim #ff5a3a → #ffd8b0 with a halo rim all round, faded below the waist; ornaments #ffb070 → #fff0d0 (0.55–0.95); a red aura behind.',
    poses: [{ name: 'stand' }, { name: 'emerge', note: 'k: rising from the shell, arms up → lowered' }, { name: 'speak', note: 'k' }, { name: 'curse', note: 'k: forefinger raised' }, { name: 'point', note: 'k: to the other egg' }, { name: 'rise', note: 'k: ascending, arms up' }, { name: 'rein', note: 'k: holds the Sun\'s reins' }],
    voice: 'aruna',
  };

  CH.define({
    id: 'aruna', bible, rig, shape, ornaments, before, after, defaultPose: 'stand',
    rule: {
      fill: '#1a0606', lit: '#3a0e08', litGain: 0.8, rimW: 1.05, halo: 0.6,
      rim: ['#ff5a3a', '#ffd8b0'], inner: '#6a140a', innerA: [0.9, 0.5], glow: 1.1,
      ornament: ['#ffb070', '#fff0d0'], ornamentA: [0.55, 0.95], fade: 0.45,
    },
    bounds: () => [-420, -1100, 420, 30],
  });
  CH.ROSTER.push('aruna');
})();
