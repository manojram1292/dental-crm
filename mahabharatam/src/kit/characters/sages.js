/*
 * CHARACTER · THE SAGES OF NAIMISHA (generic seated rishis around the fire).
 *
 * Frontal shadow-puppets (seen from the front, or from behind with
 * facing: 'back'), cross-legged in jnana mudra. They are one family of
 * figures with small fixed differences so the circle never looks cloned:
 * opts.index picks the sage, and his beard, topknot, shawl and build come from
 * a fixed table (VARIANTS, seeded per index). Sage 3 is always sage 3.
 *
 * SIGNATURE LIGHT: the fire circle. Facing the fire (light.front ≈ 0.5) their
 * fronts glow terracotta (#8a3c1e) with an ember inner light; from behind they
 * are soot-black (#0d0808) with an amber rim (#e0954a → #ffe0a0).
 *
 * Feet/seat on (x, y). scale 1 ≈ 560 px tall seated.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, CH = KIT.characters;
  const { TAU, clamp, lerp, PAL, hash } = R;
  const { cut, limb, hand } = CH;

  /**
   * The fixed variations. beard: 0 none · 1 short point · 2 long · 3 broad/forked
   * hair: 0 bun + crown knot · 1 tall jata tower · 2 twin knots · 3 low bun with locks on the shoulders
   * shawl: 0 none · 1 over the left shoulder · 2 over the right · mala: bool · w: build
   */
  const VARIANTS = [
    { beard: 1, hair: 0, shawl: 0, mala: true, w: 1.0, h: 1.0 },     // index 0 (= the episode-1 sage)
    { beard: 2, hair: 1, shawl: 1, mala: true, w: 0.94, h: 1.02 },
    { beard: 3, hair: 3, shawl: 2, mala: false, w: 1.08, h: 0.97 },
    { beard: 2, hair: 2, shawl: 0, mala: true, w: 0.97, h: 1.0 },
    { beard: 0, hair: 0, shawl: 1, mala: false, w: 0.92, h: 0.98 },  // the young one
    { beard: 1, hair: 1, shawl: 2, mala: true, w: 1.04, h: 1.03 },
    { beard: 3, hair: 0, shawl: 1, mala: true, w: 1.0, h: 0.99 },
    { beard: 2, hair: 3, shawl: 0, mala: false, w: 1.06, h: 1.0 },
  ];
  const variant = (i) => {
    const v = VARIANTS[((i % VARIANTS.length) + VARIANTS.length) % VARIANTS.length];
    // a seeded nudge so even repeats differ a little
    return { ...v, w: v.w * (0.98 + 0.04 * hash(i, 71)), lean0: (hash(i, 6) - 0.5) * 0.6 };
  };

  function rig(P) {
    const po = P.po, v = variant(P.index);
    const turn = clamp(P.ex.look || 0, -1, 1);
    const lean = (po.lean ?? v.lean0) + turn * 0.9 * (po.leanTurn ?? 1);
    // hands: resting on the knees (jnana mudra) unless speaking / blessing
    let gest = null;
    if (po.name === 'speak') gest = { kind: 'open', at: [lerp(150, 90, po.k), lerp(-86, -300, po.k)], a: -Math.PI / 2 - 0.6 };
    if (po.name === 'bless') gest = { kind: 'abhaya', at: [lerp(150, 120, po.k), lerp(-86, -330, po.k)], a: -Math.PI / 2 };
    return { v, turn, lean, gest, T: P.T, back: P.back, standing: po.base === 'stand' || po.name === 'walk', po };
  }

  function sagePath(g, P, r) {
    const { v, turn } = r, T = P.T;
    const breath = Math.sin(T * 1.3 + P.index * 1.7) * 2;
    const back = r.back;
    g.save();
    g.scale(v.w, v.h);
    if (r.standing) {
      // standing, frontal: two legs under a long cloth, feet out
      const step = r.po.name === 'walk' ? Math.sin(r.po.phase) : 0;
      for (const s of [-1, 1]) {
        const lift = Math.max(0, s * step) * 18;
        g.moveTo(s * 40 - 22, -60); g.lineTo(s * 40 + 22, -60); g.lineTo(s * 42 + 20, -14 - lift); g.lineTo(s * 42 + 30 * s + 8, -lift); g.lineTo(s * 42 - 26, -lift); g.closePath(); cut(g);
      }
      g.moveTo(-80, -380); g.bezierCurveTo(-96, -260, -100, -140, -96, -52); g.quadraticCurveTo(0, -36, 96, -52); g.bezierCurveTo(100, -140, 96, -260, 80, -380); g.closePath(); cut(g);
      g.translate(0, -300);
    } else {
      // crossed legs
      g.moveTo(-178, -4);
      g.bezierCurveTo(-205, -40, -170, -88, -82, -100);
      g.lineTo(82, -100);
      g.bezierCurveTo(170, -88, 205, -40, 178, -4);
      g.quadraticCurveTo(0, 8, -178, -4);
      g.closePath(); cut(g);
    }
    g.save();
    g.translate(0, -90);
    g.rotate(r.lean * 0.16);
    g.translate(0, 90);
    // torso
    g.moveTo(-64, -90);
    g.bezierCurveTo(-74, -170, -96, -250, -104, -300 + breath);
    g.quadraticCurveTo(-100, -332, -52, -340);
    g.lineTo(52, -340);
    g.quadraticCurveTo(100, -332, 104, -300 + breath);
    g.bezierCurveTo(96, -250, 74, -170, 64, -90);
    g.closePath(); cut(g);
    // shawl draped over one shoulder (a fold that breaks the outline)
    if (v.shawl) {
      const s = v.shawl === 1 ? -1 : 1;
      g.moveTo(s * 60, -338); g.quadraticCurveTo(s * 128, -330, s * 122, -250); g.quadraticCurveTo(s * 124, -200, s * 112, -150); g.lineTo(s * 84, -160); g.quadraticCurveTo(s * 92, -260, s * 40, -330); g.closePath(); cut(g);
    }
    // arms: resting on the knees (jnana mudra), or one raised
    for (const s of [-1, 1]) {
      if (r.gest && s === 1) {
        const sh = [96, -306], el = CH.ik(sh, r.gest.at, 120, 116, 1);
        limb(g, [sh, el, r.gest.at], [44, 32, 26]);
        hand(g, r.gest.at, r.gest.a, 30, r.gest.kind);
        continue;
      }
      limb(g, [[s * 96, -306], [s * 128, -200], [s * 150, -86]], [44, 32, 26]);
    }
    // neck + head (oval), turning: a profile nose appears on the turned side
    g.moveTo(-18, -330); g.lineTo(-18, -362); g.lineTo(18, -362); g.lineTo(18, -330); g.closePath(); cut(g);
    const hx = turn * 10;
    g.moveTo(hx + 36, -405);
    g.ellipse(hx, -405, 37 - Math.abs(turn) * 2, 50, 0, 0, TAU); cut(g);
    if (Math.abs(turn) > 0.02 && !back) {
      const sd = Math.sign(turn), k = Math.abs(turn);
      g.moveTo(hx + sd * 30, -428);
      g.lineTo(hx + sd * (30 + 34 * k), -396);
      g.lineTo(hx + sd * 30, -390);
      g.closePath(); cut(g);
    }
    // beard
    if (!back && v.beard) {
      if (v.beard === 1) {
        g.moveTo(hx - 30, -392);
        g.quadraticCurveTo(hx - 26 + turn * 10, -340, hx + turn * 26, -318);
        g.quadraticCurveTo(hx + 26 + turn * 10, -340, hx + 30, -392);
      } else if (v.beard === 2) {
        g.moveTo(hx - 33, -395);
        g.bezierCurveTo(hx - 36, -330, hx - 20 + turn * 14, -280, hx + turn * 30, -250);
        g.bezierCurveTo(hx + 20 + turn * 14, -280, hx + 36, -330, hx + 33, -395);
      } else {
        g.moveTo(hx - 36, -398);
        g.bezierCurveTo(hx - 44, -350, hx - 34 + turn * 10, -312, hx - 14 + turn * 22, -300);
        g.lineTo(hx + turn * 22, -318);
        g.lineTo(hx + 14 + turn * 22, -300);
        g.bezierCurveTo(hx + 34 + turn * 10, -312, hx + 44, -350, hx + 36, -398);
      }
      g.closePath(); cut(g);
    }
    // hair
    const kx = hx - turn * 8;
    if (v.hair === 0) {
      g.moveTo(kx + 28, -466); g.ellipse(kx, -466, 28, 24, 0, 0, TAU); cut(g);
      g.moveTo(kx + 12, -492); g.ellipse(kx, -494, 12, 11, 0, 0, TAU); cut(g);
    } else if (v.hair === 1) {
      // tall jata tower, slightly tapering, tied twice
      g.moveTo(kx - 24, -448); g.bezierCurveTo(kx - 30, -500, kx - 20, -540, kx - 8, -560);
      g.quadraticCurveTo(kx, -572, kx + 8, -560); g.bezierCurveTo(kx + 20, -540, kx + 30, -500, kx + 24, -448); g.closePath(); cut(g);
    } else if (v.hair === 2) {
      for (const s of [-1, 1]) { g.moveTo(kx + s * 22 + 18, -462); g.ellipse(kx + s * 22, -462, 18, 17, 0, 0, TAU); cut(g); }
    } else {
      g.moveTo(kx + 24, -452); g.ellipse(kx, -452, 24, 18, 0, 0, TAU); cut(g);
      for (const s of [-1, 1]) {
        g.moveTo(hx + s * 30, -430); g.quadraticCurveTo(hx + s * 52, -380, hx + s * 50, -326); g.lineTo(hx + s * 36, -330); g.quadraticCurveTo(hx + s * 38, -380, hx + s * 22, -420); g.closePath(); cut(g);
      }
    }
    g.restore();
    g.restore();
  }

  function shape(g, color, P, r) {
    g.fillStyle = color;
    g.beginPath(); sagePath(g, P, r); g.fill();
  }

  function ornaments(g, P, r, a, color) {
    if (a <= 0.01) return;
    const v = r.v;
    g.globalAlpha *= a * (r.back ? 0.5 : 1);
    g.scale(v.w, v.h);
    g.strokeStyle = color; g.fillStyle = color; g.lineCap = 'round';
    if (r.standing) g.translate(0, -300);
    // cloth border along the crossed legs
    if (!r.standing) {
      g.beginPath(); g.moveTo(-170, -16); g.quadraticCurveTo(0, -4, 170, -16); g.lineWidth = 6; g.stroke();
      g.beginPath(); g.moveTo(-150, -70); g.quadraticCurveTo(-80, -96, 0, -92); g.lineWidth = 3; g.stroke();
    }
    if (!r.back) {
      g.save(); g.translate(0, -90); g.rotate(r.lean * 0.16); g.translate(0, 90);
      if (v.mala) for (let i = 0; i <= 12; i++) {
        const s = i / 12, x = lerp(-40, 40, s), y = -318 + Math.sin(s * Math.PI) * 70;
        g.beginPath(); g.arc(x, y, 4.5, 0, TAU); g.fill();
      }
      // the sacred thread / shawl border runs over the shoulder the shawl is on
      const sd = v.shawl === 2 ? -1 : 1;
      g.beginPath(); g.moveTo(sd * -92, -300); g.lineTo(sd * 70, -110); g.lineWidth = 5; g.stroke();
      if (v.shawl) { const s = v.shawl === 1 ? -1 : 1; g.beginPath(); g.moveTo(s * 112, -150); g.lineTo(s * 86, -160); g.lineWidth = 4; g.stroke(); }
      g.restore();
    }
  }

  const bible = {
    name: 'The sages of Naimisha (generic seated rishis)',
    role: 'Shaunaka\'s companions at the twelve-year sacrifice; they listen around the fire and turn their heads together.',
    palette: { back: '#0d0808', front: '#8a3c1e', inner: '#b85a2c', rimDim: '#e0954a', rimBright: '#ffe0a0', ornamentDim: PAL.goldDeep, ornament: PAL.goldPale },
    proportions: 'Seated height 560 units (scale 1): crossed legs 356 wide, torso 208 wide at the shoulders, head an upright oval 74×100. Build ±8 % per index.',
    props: ['rudraksha mala (some)', 'sacred thread / shawl border', 'gold border on the crossed legs'],
    variations: VARIANTS,
    light: 'Fire circle: facing the fire their fronts glow terracotta #8a3c1e with an ember inner #b85a2c; from behind soot #0d0808 with an amber rim #e0954a → #ffe0a0.',
    poses: [
      { name: 'sit', note: 'jnana mudra; pose.lean nudges the torso' }, { name: 'stand' }, { name: 'walk', note: 'frontal step, phase' },
      { name: 'speak', note: 'right hand opens (k)' }, { name: 'bless', note: 'abhaya (k)' }, { name: 'listen', note: 'expression.look turns the head (−1..1)' },
    ],
    voice: 'sages',   // the speaker key in script/cast.json (voice id, speed, pitch)
  };

  CH.define({
    id: 'sage', bible, rig, shape, ornaments, defaultPose: 'sit',
    rule: {
      fill: '#0d0808', lit: '#8a3c1e', litGain: 1,
      rim: ['#e0954a', '#ffe0a0'], inner: '#b85a2c', innerA: [0, 0.7], glow: 0.5,
      ornament: [PAL.goldDeep, PAL.goldPale], ornamentA: [0.35, 0.85], rimW: 0.85,
    },
    bounds: (P, r) => [-240, r.standing ? -900 : -600, 240, 20],
  });
  CH.VARIANTS = VARIANTS;
  CH.ROSTER.push('sage');
})();
