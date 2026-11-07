/*
 * CHARACTER · KING PARIKSHIT (son of Abhimanyu, father of Janamejaya) · `parikshit`
 *
 * Episode 7 (Adi Parva, Astika sub-parva, CE 1.36–40): hunting, he loses a wounded
 * deer, asks the silent sage Shamika where it went, gets no answer, and in anger lays
 * a dead snake on the sage's shoulder with the tip of his bow. Cursed by the sage's son
 * Shringin, he hides in a palace on a single pillar; on the seventh day Takshaka,
 * hidden as an insect in a fruit, kills him with his venom.
 *
 * Janamejaya's father, older and harder: a short full BEARD and moustache, long hair
 * tied at the nape; a HUNTING CROWN (a gold band with a low two-tier crest and a
 * plume of three feathers falling back); makara earrings; one necklace; armlets; a
 * chest strap for the QUIVER on his back (arrow fletchings above the far shoulder);
 * a knee-length hunting dhoti with a sash; a long recurved BOW, always in the NEAR
 * hand (it is what he acts with: planted, carried, lifting the snake).
 * 'sit' seats him on his son's simhasana (the same throne, the same house).
 *
 * SIGNATURE LIGHT: rose-crimson with gold. Fill #100606, inner #4a1018, rim #b8384a →
 * #ffb0a0 (rosier and deeper than his son's saffron, never Parashurama's blood-red),
 * ornaments #b88a2a → #ffd888 (0.5–0.9). Mood 'wrath': an ember in his eye.
 *
 * Faces LEFT natively. Feet on (x, y). scale 1 ≈ 1060 px without the crest
 * (≈ 1190 with it): his son's frame.
 *
 * Anchors (mod.anchor(opts, name) → screen [x, y]): 'hand' (near hand), 'bowTip'
 * (the bow's upper tip: the snake hangs from it in 'drape'), 'head', 'eye'.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, CH = KIT.characters;
  const { TAU, clamp, lerp } = R;
  const { cut, limb, limbOutline, ik, hand, along, ribbon } = CH;

  const D = { hip: 500, thigh: 250, shin: 236, foot: 74, sitHip: 150, throneHip: 300 };
  const PIV = -500, SH_N = [4, -790], SH_F = [30, -794], UP = 174, FO = 160;
  const BOW = 620;   // bow length (tip to tip)

  function rig(P) {
    const raw = P.po, k = raw.k;
    const run = raw.name === 'run';
    let po = raw.name === 'sit' ? { ...raw, base: 'throne' } : raw;
    if (run) po = { ...raw, name: 'walk', stride: 1.3 };
    if (raw.name === 'weary') po = { ...raw, name: 'walk', stride: raw.stride ?? 0.45 };
    const r = CH.profileRig(po, D);
    r.T = P.T; r.wind = raw.wind ?? (run ? 1 : 0.5);
    r.lean = r.st * 0.05 + (run ? 0.14 : 0);
    r.look = P.ex.look || 0; r.speak = P.ex.speak || 0; r.wrath = P.ex.mood === 'wrath';
    // near hand: the bow (grip, angle of the bow's axis: −π/2 = upright)
    let nh = r.throne ? [-170, -620] : [-40, -540], nk = 'fist', bowA = -Math.PI / 2 + 0.05, bowOn = true;
    let fh = r.throne ? [-60, -650] : [44, -560], fk = 'fist', fa = Math.PI / 2;
    if (raw.name === 'walk' || run) { nh = [-60 - 40 * Math.sin(raw.phase || 0), -560]; bowA = -Math.PI / 2 - 0.35; fh = [40 + 40 * Math.sin((raw.phase || 0) + Math.PI), -580]; }
    if (raw.name === 'weary') {
      // slowing, spent: head down, the bow trailing low, the far hand at the chest
      r.lean += 0.16 * k; r.look += 0.2 * k;
      nh = [-80, -500]; bowA = lerp(-Math.PI / 2 - 0.35, -Math.PI / 2 - 1.05, k);
      fh = along(fh, [-40, -700], k); fk = 'open'; fa = Math.PI / 2 + 0.6;
    }
    if (raw.name === 'speak') { fh = along(fh, [-270, -780], k); fk = 'open'; fa = Math.PI + 0.35; r.look -= 0.05 * k; }
    if (raw.name === 'point') { fh = along(fh, [-320, -830], k); fk = 'point'; fa = Math.PI + 0.22; }
    if (raw.name === 'drape') {
      // k 0 → 0.25: the bow's tip lowered to the grass (hooks the snake); 0.25 → 0.5: lifted
      // high; 0.5 → 1: carried forward and laid level (the snake slides onto the sage)
      const u1 = clamp(k / 0.25), u2 = clamp((k - 0.25) / 0.25), u3 = clamp((k - 0.5) / 0.5);
      nh = along(along(along(nh, [-180, -440], u1), [-210, -760], u2), [-220, -520], u3);
      bowA = lerp(lerp(lerp(-Math.PI / 2 + 0.05, -Math.PI - 1.0, u1), -Math.PI + 0.75, u2), -Math.PI + 0.05, u3);
      r.lean += 0.15 * u1 * (1 - u2) + 0.08 * u3;
      fh = along(fh, [60, -620], u2);
    }
    if (raw.name === 'hold') {
      // the bow set aside; the near hand turns something small (the fruit) before his eyes
      bowOn = false; nh = along([-20, -560], [-200, -760], k); nk = 'cup'; r.look += 0.18 * k;
    }
    if (raw.name === 'fall') {
      // struck: recoils, arms flung up, sinking
      bowOn = false; r.lean -= 0.35 * k; r.look -= 0.3 * k;
      nh = along(nh, [-160, -1000], k); nk = 'open'; fh = along(fh, [80, -980], k); fk = 'open'; fa = -Math.PI / 2;
    }
    r.hand = nh; r.nearKind = nk; r.bowA = bowA; r.bowOn = bowOn; r.farHand = fh; r.farKind = fk; r.farA = fa;
    const c = Math.cos(-r.lean), s = Math.sin(-r.lean);
    const rot = (p) => [p[0] * c - (p[1] - PIV) * s, p[0] * s + (p[1] - PIV) * c + PIV];
    r.rot = rot;
    r.shN = rot(SH_N); r.shF = rot(SH_F);
    if (raw.name === 'weary' || raw.name === 'fall') { r.hand = rot(r.hand); r.farHand = rot(r.farHand); }
    // the bow: grip at the hand, axis bowA; tips along the axis
    const d = [Math.cos(r.bowA), Math.sin(r.bowA)];
    r.bowTop = [r.hand[0] + d[0] * BOW * 0.5, r.hand[1] + d[1] * BOW * 0.5];
    r.bowBot = [r.hand[0] - d[0] * BOW * 0.5, r.hand[1] - d[1] * BOW * 0.5];
    return r;
  }

  function headPath(g, r) {
    g.save();
    g.translate(8, -822);
    g.rotate(r.look);
    // a mature face: straight nose, full short beard, moustache
    g.moveTo(32, 8);
    g.bezierCurveTo(42, -26, 52, -66, 48, -100);
    g.bezierCurveTo(44, -126, 30, -140, 0, -142);
    g.lineTo(-48, -136);
    g.lineTo(-52, -110);
    g.lineTo(-48, -94);
    g.bezierCurveTo(-56, -84, -64, -74, -70, -64);
    g.lineTo(-58, -60);
    g.lineTo(-64, -54); g.lineTo(-58, -48);
    // beard: full and short, squared at the chin
    g.bezierCurveTo(-66, -38, -70, -10, -58, 12);
    g.lineTo(-30, 22);
    g.bezierCurveTo(-6, 22, 10, 18, 22, 6);
    g.closePath(); cut(g);
    // hair tied at the nape, a short tail
    g.moveTo(44, -110); g.bezierCurveTo(70, -90, 78, -40, 66, -10); g.bezierCurveTo(84, 10, 80, 40, 70, 56); g.bezierCurveTo(58, 30, 46, 0, 36, -40); g.closePath(); cut(g);
    // hunting crown: a gold band, a low two-tier crest
    g.moveTo(-54, -128); g.lineTo(52, -128); g.lineTo(54, -152); g.lineTo(-50, -154); g.closePath(); cut(g);
    g.moveTo(-40, -152); g.lineTo(-30, -196); g.lineTo(30, -196); g.lineTo(40, -152); g.closePath(); cut(g);
    g.moveTo(-26, -196); g.lineTo(-10, -234); g.lineTo(12, -234); g.lineTo(24, -196); g.closePath(); cut(g);
    // a plume of three feathers falling back
    const fl = Math.sin(r.T * 2.4) * 5 * r.wind;
    for (let i = 0; i < 3; i++) {
      const a0 = -0.9 + i * 0.32, L = 120 - i * 14;
      const b = [6, -232], tip = [b[0] + Math.sin(a0 + 0.9) * L + fl, b[1] - Math.cos(a0 + 0.9) * L * 0.55 + i * 10];
      g.moveTo(b[0], b[1]); g.quadraticCurveTo((b[0] + tip[0]) / 2 + 4, (b[1] + tip[1]) / 2 - 16, tip[0], tip[1]);
      g.quadraticCurveTo((b[0] + tip[0]) / 2 - 4, (b[1] + tip[1]) / 2 + 6, b[0], b[1] + 6); g.closePath(); cut(g);
    }
    // makara earring
    g.moveTo(32, -50); g.ellipse(18, -44, 15, 20, 0.2, 0, TAU); cut(g);
    if (r.speak > 0.02) {
      g.save(); g.globalCompositeOperation = 'destination-out';
      const o = 4 * r.speak;
      g.moveTo(-36, -34); g.lineTo(-62, -36 - o); g.lineTo(-62, -30 + o * 0.6); g.closePath(); cut(g);
      g.restore();
    }
    g.restore();
  }

  function torsoPath(g) {
    CH.torso(g, { waistY: -490, neckY: -818, chestY: -700, front: -56, back: 64, waistF: -40, waistB: 56, neckF: -6, neckB: 32, pec: 10, lat: 12 });
  }

  function quiverPath(g, r) {
    // a quiver slung across the back, mouth above the far shoulder; three fletchings
    limb(g, [[70, -560], [96, -860]], [40, 46]);
    for (const [dx, dy] of [[86, -900], [104, -912], [120, -898]]) {
      g.moveTo(dx - 6, dy + 20); g.lineTo(dx + 6, dy + 20); g.lineTo(dx + 12, dy - 36); g.lineTo(dx - 2, dy - 24); g.closePath(); cut(g);
    }
  }

  function sashPath(g, r) {
    const pts = ribbon([52, -500], 1.3 - 0.3 * r.wind, 200, r.T, 12 * r.wind, 3.4);
    limbOutline(g, pts, pts.map((_, i) => lerp(28, 10, i / (pts.length - 1)))); cut(g);
  }

  function bowPath(g, r) {
    if (!r.bowOn) return;
    // a recurved bow: two curved limbs bowed away from the string, tips flicked back
    const a = r.hand, t = r.bowTop, b = r.bowBot;
    const d = [Math.cos(r.bowA), Math.sin(r.bowA)], nrm = [-d[1], d[0]];   // the belly bows toward +nrm (forward when upright)
    const bend = -62;
    const m1 = [lerp(a[0], t[0], 0.5) + nrm[0] * bend, lerp(a[1], t[1], 0.5) + nrm[1] * bend];
    const m2 = [lerp(a[0], b[0], 0.5) + nrm[0] * bend, lerp(a[1], b[1], 0.5) + nrm[1] * bend];
    limb(g, [b, m2, a, m1, t], [12, 20, 24, 20, 12]);
    for (const [p, s] of [[t, 1], [b, -1]]) { g.moveTo(p[0], p[1]); g.lineTo(p[0] - nrm[0] * 22 + d[0] * 18 * s, p[1] - nrm[1] * 22 + d[1] * 18 * s); g.lineTo(p[0] + d[0] * 6 * s, p[1] + d[1] * 6 * s); g.closePath(); cut(g); }
    // the string (thin)
    limb(g, [t, b], [3, 3]);
  }

  function throne(g) {
    g.moveTo(-170, -300); g.lineTo(150, -300); g.lineTo(150, -268); g.lineTo(-170, -268); g.closePath(); cut(g);
    g.moveTo(120, -268); g.lineTo(150, -268); g.lineTo(150, -30); g.lineTo(172, 0); g.lineTo(110, 0); g.lineTo(122, -30); g.closePath(); cut(g);
    g.moveTo(-150, -268); g.lineTo(-120, -268); g.lineTo(-122, -30); g.lineTo(-104, 0); g.lineTo(-170, 0); g.lineTo(-148, -30); g.closePath(); cut(g);
    g.moveTo(110, -300); g.lineTo(150, -300); g.lineTo(150, -820); g.quadraticCurveTo(140, -880, 110, -900); g.closePath(); cut(g);
  }

  function armsPath(g, r, near) {
    const sh = near ? r.shN : r.shF, tgt = near ? r.hand : r.farHand;
    const el = ik(sh, tgt, UP, FO, near ? -1 : 1);
    limb(g, [sh, el, tgt], near ? [62, 42, 30] : [58, 40, 28]);
    const am = along(sh, el, 0.45), ax = el[0] - sh[0], ay = el[1] - sh[1], al = Math.hypot(ax, ay) || 1;
    g.moveTo(am[0] - (ay / al) * 32, am[1] + (ax / al) * 32); g.lineTo(am[0] - (ay / al) * 46 - (ax / al) * 10, am[1] + (ax / al) * 46 - (ay / al) * 10); g.lineTo(am[0] - (ay / al) * 32 - (ax / al) * 18, am[1] + (ax / al) * 32 - (ay / al) * 18); g.closePath(); cut(g);
    hand(g, tgt, near ? (r.nearKind === 'cup' ? 0 : r.bowA + Math.PI / 2) : r.farA, 38, near ? r.nearKind : r.farKind);
  }

  function upperT(g, r) { g.translate(0, PIV); g.rotate(-r.lean); g.translate(0, -PIV); }

  function shape(g, color, P, r) {
    g.translate(0, r.bob);
    g.fillStyle = color;
    if (r.throne) { g.beginPath(); throne(g); g.fill(); }
    g.save(); g.translate(0, r.drop);
    g.save(); upperT(g, r); g.beginPath(); quiverPath(g, r); g.fill(); g.restore();
    g.beginPath(); armsPath(g, r, false); g.fill();
    g.beginPath(); sashPath(g, r); g.fill();
    g.restore();
    g.beginPath(); CH.legs(g, r, [74, 46, 24]); g.fill();
    g.beginPath();
    if (r.throne) {
      const kn = r.legs[0].knee;
      g.moveTo(-40, -340); g.lineTo(60, -340); g.lineTo(60, -270); g.lineTo(kn[0] - 30, kn[1] + 30); g.lineTo(kn[0] - 36, kn[1] - 40); g.closePath(); cut(g);
    } else CH.lowerCloth(g, r, { waistY: -500, waistF: -40, waistB: 56, len: 'knee', flare: 1.08, pleats: true, T: r.T, wind: r.wind });
    g.fill();
    g.save(); g.translate(0, r.drop);
    g.save(); upperT(g, r);
    g.beginPath(); torsoPath(g); g.fill();
    g.beginPath(); headPath(g, r); g.fill();
    g.restore();
    g.beginPath(); bowPath(g, r); g.fill();
    g.beginPath(); armsPath(g, r, true); g.fill();
    g.restore();
  }

  function ornaments(g, P, r, a, color) {
    if (a <= 0.01) return;
    g.translate(0, r.bob);
    g.globalAlpha *= a;
    g.strokeStyle = color; g.fillStyle = color; g.lineCap = 'round';
    if (!r.sitting) {
      const hemY = Math.max(r.legs[0].knee[1], r.legs[1].knee[1]) + 28;
      const xs = r.legs.map((l) => l.knee[0]);
      g.beginPath(); g.moveTo(Math.min(...xs) - 30, hemY); g.quadraticCurveTo(lerp(xs[0], xs[1], 0.5), hemY + 14, Math.max(...xs) + 40, hemY - 4); g.lineWidth = 5; g.stroke();
    }
    g.save(); g.translate(0, r.drop);
    g.save(); upperT(g, r);
    // belt, one necklace, the quiver strap across the chest, quiver bands
    g.beginPath(); g.moveTo(-42, -498); g.quadraticCurveTo(8, -486, 58, -504); g.lineWidth = 7; g.stroke();
    CH.beads(g, [-8, -808], [-58, -752], [-42, -712], 9, 4.4);
    g.beginPath(); g.moveTo(40, -800); g.quadraticCurveTo(-20, -660, -44, -560); g.lineWidth = 5; g.stroke();
    for (const u of [0.2, 0.8]) { const p = along([70, -560], [96, -860], u); g.beginPath(); g.moveTo(p[0] - 24, p[1]); g.lineTo(p[0] + 24, p[1] - 4); g.lineWidth = 4; g.stroke(); }
    g.save(); g.translate(8, -822); g.rotate(r.look);
    for (const [y, w] of [[-152, 48], [-196, 32]]) { g.beginPath(); g.moveTo(-w - 4, y); g.lineTo(w + 6, y); g.lineWidth = 5; g.stroke(); }
    for (const [x, y] of [[0, -172], [0, -214]]) { g.beginPath(); g.arc(x, y, 5, 0, TAU); g.fill(); }
    g.beginPath(); g.ellipse(18, -44, 15, 20, 0.2, 0, TAU); g.lineWidth = 3; g.stroke();
    g.beginPath(); g.ellipse(-30, -90, 7, 3, 0.1, 0, TAU); g.fill();   // the eye
    g.restore();
    g.restore();
    // the bow's grip binding and tips
    if (r.bowOn) {
      const d = [Math.cos(r.bowA), Math.sin(r.bowA)];
      for (const s of [-1, 1]) { const p = [r.hand[0] + d[0] * 40 * s, r.hand[1] + d[1] * 40 * s]; g.beginPath(); g.arc(p[0], p[1], 6, 0, TAU); g.fill(); }
    }
    g.restore();
  }

  function scr(P, r, p) { const sx = P.flip ? -P.s : P.s; return [P.x + p[0] * sx, P.y + (p[1] + r.bob + r.drop) * P.s]; }

  function after(ctx, P, r, k) {
    if (!r.wrath) return;
    const e = scr(P, r, r.rot([8 - 30, -822 - 90]));
    KIT.glow(ctx, e[0], e[1], 40 * P.s, '#ff5a3a', 0.75 * k);
  }

  const bible = {
    name: 'King Parikshit (son of Abhimanyu, father of Janamejaya)',
    role: 'The Kuru king. Hunting, he lays a dead snake on the silent sage Shamika; cursed by Shringin, he hides in a palace on one pillar and is killed by Takshaka on the seventh day (CE 1.36–40).',
    palette: { fill: '#100606', inner: '#4a1018', rimDim: '#b8384a', rimBright: '#ffb0a0', ornamentDim: '#b88a2a', ornament: '#ffd888' },
    proportions: 'His son\'s frame: ≈ 1060 units without the crest (≈ 1190 with it); hip 500, thigh 250, shin 236; a heavier chest (front −56, back 64). Bow 620 tip to tip.',
    props: ['hunting crown: gold band, low two-tier crest, a plume of three feathers', 'short full beard and moustache; hair tied at the nape', 'makara earrings', 'necklace, armlets, belt', 'quiver on the back (fletchings above the far shoulder), chest strap', 'knee-length hunting dhoti, sash', 'recurved bow, always in the NEAR hand', 'his son\'s simhasana (sit)'],
    light: 'Rose-crimson with gold: fill #100606, inner #4a1018, rim #b8384a → #ffb0a0; ornaments #b88a2a → #ffd888 (0.5–0.9). Wrath: an ember in the eye.',
    poses: [
      { name: 'stand', note: 'bow planted' }, { name: 'walk' }, { name: 'run' }, { name: 'weary', note: 'k: a slow, spent walk; head down, bow trailing' },
      { name: 'sit', note: 'enthroned' }, { name: 'speak', note: 'k: far hand opens' }, { name: 'point', note: 'k' },
      { name: 'drape', note: 'k: the bow tip lowered to the grass (0 → 0.25), lifted high with the snake (→ 0.5), laid level over the sage (→ 1); anchor bowTip' },
      { name: 'hold', note: 'k: bow set aside, the near hand turns a fruit before his eyes; anchor hand' },
      { name: 'fall', note: 'k: struck, recoiling' },
    ],
    voice: 'parikshit',
  };

  const mod = CH.define({
    id: 'parikshit', bible, rig, shape, ornaments, after, defaultPose: 'stand',
    rule: {
      fill: '#100606', lit: '#7a3038', litGain: 0.8,
      rim: ['#b8384a', '#ffb0a0'], inner: '#4a1018', innerA: [0.88, 0.45], glow: 0.8,
      ornament: ['#b88a2a', '#ffd888'], ornamentA: [0.5, 0.9],
    },
    bounds: () => [-560, -1260, 460, 30],
  });
  mod.anchor = (opts, name) => {
    const P = CH.resolve(opts, mod._def), r = rig(P);
    if (name === 'bowTip') return scr(P, r, r.bowTop);
    if (name === 'head') return scr(P, r, r.rot([0, -900]));
    if (name === 'eye') return scr(P, r, r.rot([-22, -912]));
    return scr(P, r, r.hand);
  };
  CH.ROSTER.push('parikshit');
})();
