/*
 * CHARACTER · THE PITRS (the ancestors of Parashurama's line, Richika and the Bhargavas).
 *
 * Luminous elders, seen from the front, who never quite touch the ground:
 * long robes that thin into wisps below the knee, shawls over both shoulders,
 * long beards, topknots. They are drawn translucent (screen-blended), with a
 * rim of light all the way round. opts.index picks one of the fixed
 * variations (height, beard, hair) so a group of them reads as a family.
 *
 * SIGNATURE LIGHT: cool silver glow. Silver-blue fill #7d8ea6 at 70 %, a halo
 * rim #b9c6d8 → #ffffff on every side (brightest toward the light), a pale
 * inner light #e4ecf8, a soft cool aura behind, and the lower 42 % fading out.
 *
 * Base of the robe (where the wisps end) on (x, y). scale 1 ≈ 900 px tall.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, CH = KIT.characters;
  const { TAU, clamp, lerp, hash } = R;
  const { cut, limb, hand, along } = CH;

  /** beard 1 long · 2 forked · 3 short; hair 0 bun · 1 tall knot; h: height */
  const VARIANTS = [
    { beard: 1, hair: 0, h: 1.0, w: 1.0 },
    { beard: 2, hair: 1, h: 1.05, w: 0.95 },
    { beard: 3, hair: 0, h: 0.96, w: 1.04 },
    { beard: 1, hair: 1, h: 1.02, w: 0.98 },
    { beard: 2, hair: 0, h: 0.98, w: 1.02 },
  ];
  const variant = (i) => VARIANTS[((i % VARIANTS.length) + VARIANTS.length) % VARIANTS.length];

  function rig(P) {
    const po = P.po, T = P.T, k = po.k, v = variant(P.index);
    const bob = Math.sin(T * 1.1 + P.index * 1.9) * 10;
    const sway = po.name === 'walk' ? Math.sin(po.phase) * 0.05 : Math.sin(T * 0.7 + P.index) * 0.015;
    // hands (local, frontal): [left, right] targets and kinds
    let hands = [{ at: [-70, -470], kind: 'cup', a: 0.4 }, { at: [70, -470], kind: 'cup', a: Math.PI - 0.4 }];
    const raise = (side, to, kind, a) => { hands[side] = { at: along(hands[side].at, to, k), kind, a }; };
    if (po.name === 'speak') raise(1, [150, -640], 'open', -Math.PI / 2 + 0.5);
    if (po.name === 'bless') { raise(0, [-130, -700], 'abhaya', -Math.PI / 2 - 0.15); raise(1, [130, -700], 'abhaya', -Math.PI / 2 + 0.15); }
    if (po.name === 'plead') { raise(0, [-170, -620], 'abhaya', -Math.PI / 2 - 0.5); raise(1, [170, -620], 'abhaya', -Math.PI / 2 + 0.5); }
    // descending: the robe trails upward behind them
    const trail = po.name === 'descend' ? 1 - k : 0;
    const sitting = po.base === 'sit';
    return { v, bob: sitting ? 0 : bob, sway, hands, trail, T, sitting, turn: clamp(P.ex.look || 0, -1, 1) };
  }

  function figure(g, P, r) {
    const { v, T } = r;
    g.save();
    g.scale(v.w, v.h);
    g.translate(0, r.bob);
    g.rotate(r.sway);
    if (r.sitting) {
      g.moveTo(-190, -4); g.bezierCurveTo(-215, -50, -170, -110, -86, -120); g.lineTo(86, -120); g.bezierCurveTo(170, -110, 215, -50, 190, -4); g.quadraticCurveTo(0, 10, -190, -4); g.closePath(); cut(g);
      // the upper body sits on the folded legs; the robe below the lap is hidden
      g.save(); g.beginPath(); g.rect(-400, -1400, 800, 1300); g.clip(); g.beginPath();
      g.translate(0, 300);
    }
    // the robe: falls from the shoulders and thins into wisps
    const tr = r.trail;
    g.moveTo(-100, -640);
    g.bezierCurveTo(-140, -520, -150, -360, -170, -170);
    for (let i = 0; i <= 6; i++) {
      const x = lerp(-170, 170, i / 6), w = Math.sin(T * 1.6 + i * 1.3 + P.index) * 14;
      const tip = -40 - (i % 2) * 60 - tr * 180 * (0.5 + 0.5 * Math.sin(i * 2.1));
      g.lineTo(x + w, i % 2 ? tip : tip + 30 + tr * 60);
    }
    g.bezierCurveTo(150, -360, 140, -520, 100, -640);
    g.quadraticCurveTo(0, -668, -100, -640);
    g.closePath(); cut(g);
    // shawl falling over both shoulders into long panels
    for (const s of [-1, 1]) {
      g.moveTo(s * 40, -660); g.quadraticCurveTo(s * 132, -660, s * 128, -560); g.lineTo(s * 150, -300 - tr * 80); g.lineTo(s * 108, -320 - tr * 60); g.quadraticCurveTo(s * 100, -560, s * 30, -630); g.closePath(); cut(g);
    }
    // arms
    r.hands.forEach((h, i) => {
      const s = i ? 1 : -1, sh = [s * 104, -620];
      const el = CH.ik(sh, h.at, 130, 124, s > 0 ? -1 : 1);
      limb(g, [sh, el, h.at], [44, 32, 26]);
      hand(g, h.at, h.a, 30, h.kind);
    });
    // neck, head, beard, hair
    const hx = r.turn * 10;
    g.moveTo(-18, -650); g.lineTo(-18, -684); g.lineTo(18, -684); g.lineTo(18, -650); g.closePath(); cut(g);
    g.moveTo(hx + 36, -726); g.ellipse(hx, -726, 36, 48, 0, 0, TAU); cut(g);
    if (v.beard === 1) { g.moveTo(hx - 32, -712); g.bezierCurveTo(hx - 36, -640, hx - 18, -590, hx, -560); g.bezierCurveTo(hx + 18, -590, hx + 36, -640, hx + 32, -712); g.closePath(); cut(g); }
    else if (v.beard === 2) { g.moveTo(hx - 34, -714); g.bezierCurveTo(hx - 40, -650, hx - 30, -610, hx - 14, -594); g.lineTo(hx, -620); g.lineTo(hx + 14, -594); g.bezierCurveTo(hx + 30, -610, hx + 40, -650, hx + 34, -714); g.closePath(); cut(g); }
    else { g.moveTo(hx - 30, -710); g.quadraticCurveTo(hx - 24, -660, hx, -646); g.quadraticCurveTo(hx + 24, -660, hx + 30, -710); g.closePath(); cut(g); }
    if (v.hair === 0) { g.moveTo(hx + 28, -786); g.ellipse(hx, -786, 28, 22, 0, 0, TAU); cut(g); }
    else { g.moveTo(hx - 20, -770); g.bezierCurveTo(hx - 24, -820, hx - 12, -850, hx, -862); g.bezierCurveTo(hx + 12, -850, hx + 24, -820, hx + 20, -770); g.closePath(); cut(g); }
    if (r.sitting) g.restore();
    g.restore();
  }

  function shape(g, color, P, r) {
    g.fillStyle = color;
    g.beginPath(); figure(g, P, r); g.fill();
  }

  function ornaments(g, P, r, a, color) {
    if (a <= 0.01) return;
    const v = r.v;
    g.globalAlpha *= a;
    g.scale(v.w, v.h); g.translate(0, r.bob); g.rotate(r.sway);
    if (r.sitting) g.translate(0, 300);
    g.strokeStyle = color; g.lineCap = 'round';
    // robe folds: long hairlines
    for (const x of [-90, -40, 20, 70]) { g.beginPath(); g.moveTo(x * 0.7, -600); g.quadraticCurveTo(x * 1.1, -380, x * 1.3, -170); g.lineWidth = 2; g.stroke(); }
    // shawl borders
    for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * 108, -320); g.quadraticCurveTo(s * 100, -560, s * 30, -630); g.lineWidth = 3; g.stroke(); }
    // brow and closed eyes, beard strands: the face reads through the glow
    const hx = r.turn * 10;
    g.lineWidth = 2.5;
    for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(hx + sd * 8, -734); g.quadraticCurveTo(hx + sd * 16, -728, hx + sd * 24, -734); g.stroke(); }
    for (const dx of [-10, 0, 10]) { g.beginPath(); g.moveTo(hx + dx, -700); g.lineTo(hx + dx * 1.4, -640); g.stroke(); }
    // a mala
    g.fillStyle = color;
    for (let i = 0; i <= 10; i++) { const s = i / 10; g.beginPath(); g.arc(lerp(-36, 36, s), -650 + Math.sin(s * Math.PI) * 60, 3.5, 0, TAU); g.fill(); }
  }

  function before(ctx, P, r, k) {
    // the cool aura they bring with them
    const up = r.sitting ? 300 : 0;
    KIT.glow(ctx, P.x, P.y - (520 - up) * P.s, 600 * P.s, '#a9c4ff', 0.2 * k);
    KIT.glow(ctx, P.x, P.y - (726 - up) * P.s, 200 * P.s, '#eef4ff', 0.22 * k);
  }

  const bible = {
    name: 'The Pitrs (Parashurama\'s ancestors: Richika and the Bhargava fathers)',
    role: 'They appear to Parashurama at Samantapanchaka, are pleased by his devotion, and ask him to stop; he stops, and the lakes become holy (Adi Parva 2).',
    palette: { fill: '#3c4a62', inner: '#9fb4d8', rimDim: '#a9b9d2', rimBright: '#f4f8ff', aura: '#a9c4ff', ornament: '#f4f8ff' },
    proportions: 'Height ≈ 900 units, no feet: the robe thins into seven wisps; shoulders 208 wide; heads 72×96. Height ±5 % per index.',
    props: ['shawl panels over both shoulders', 'robe folds', 'mala'],
    variations: VARIANTS,
    light: 'Cool silver glow: drawn translucent (screen, 78 %) on a slate fill #3c4a62; halo rim all round #a9b9d2 → #f4f8ff (rim × 1.2); inner #9fb4d8; aura #a9c4ff; silver robe folds; the lower 42 % fades out.',
    poses: [
      { name: 'stand', note: 'hovering, a slow bob' }, { name: 'walk', note: 'a glide (phase sways the robe)' }, { name: 'sit', note: 'cross-legged, hovering' },
      { name: 'speak', note: 'one hand opens (k)' }, { name: 'bless', note: 'both hands abhaya (k)' },
      { name: 'plead', note: 'both palms out: "stop" (k)' }, { name: 'descend', note: 'k: robe trails upward while falling, settles at 1' },
    ],
    voice: 'pitrs',   // the speaker key in script/cast.json (voice id, speed, pitch)
  };

  CH.define({
    id: 'pitr', bible, rig, shape, ornaments, before, defaultPose: 'stand',
    rule: {
      fill: '#334058', lit: '#3c4a62', litGain: 1,
      rim: ['#a9b9d2', '#f4f8ff'], inner: '#9fb4d8', innerA: [0.14, 0.2], glow: 0.45, halo: 0.75, rimW: 1.2,
      ornament: ['#b9c8e0', '#f4f8ff'], ornamentA: [0.45, 0.85], alpha: 0.78, mode: 'screen', fade: 0.42,
    },
    bounds: (P, r) => [-260, r.sitting ? -620 : -900, 260, 30],
  });
  CH.PITR_VARIANTS = VARIANTS;
  CH.ROSTER.push('pitr');
  void hash;
})();
