/*
 * CHARACTER · MOUNT MANDARA, the churning stick · `mandara`
 *
 * Episodes 11–16 (CE 1.16–17): the mountain eleven thousand yojanas high, covered in
 * forests and creepers, full of birds and beasts, that Ananta uproots and the gods carry to
 * the ocean; set on the back of the king of tortoises and wound with Vasuki, it is whirled
 * to churn the ocean; its forests catch fire and Indra puts the fire out with rain; after
 * the war it is set back in its place.
 *
 * A mountain treated as a character (it has a pose and a light of its own): a tall rounded
 * peak whose slopes are TIERS OF FOREST (scalloped tree crowns along every ledge), with
 * waterfalls, a few birds, and, when uprooted, ROOTS and rock hanging below. pose.spin
 * (radians) turns the forest bands around the mountain's axis (the churning), pose.burn
 * (0..1) lights its forests (stylised flames along the ledges, never smoke-black ruin).
 *
 * SIGNATURE LIGHT: stone-gold with green forests. Rock fill #1a1810, lit #4a4430, inner
 * #3a3420, rim #d8c890 → #fff8e0 (rimW 1.6), glow 0.5; green forest clumps over the rock;
 * waterfalls and blossoms #d8f0ff → #ffffff.
 *
 * Poses: stand (rooted, a foot of hills) · uprooted (k: roots and rock hang below) ·
 * churn (spin, burn). facing: 'front'. (x, y) = the base. scale 1 ≈ 1500 px tall.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, CH = KIT.characters;
  const { TAU, lerp, hash, clamp } = R;
  const { cut } = CH;

  const H = 1500, W = 680;   // height, half-width at the base
  const half = (y) => { const u = clamp(-y / H); return W * Math.sqrt(Math.max(0, 1 - Math.pow(u, 1.25))) * (0.9 + 0.1 * Math.sin(u * 7.0)) * (1 - 0.25 * u); };

  function rig(P) {
    const po = P.po;
    return { T: P.T, name: po.name, k: po.k, spin: po.spin || 0, burn: clamp(po.burn || 0), up: po.name === 'uprooted' || po.name === 'churn' ? po.k : 0 };
  }

  function shape(g, color, P, r) {
    g.fillStyle = color;
    g.beginPath();
    // the body: a tall rounded cone, its silhouette scalloped with tree crowns
    const N = 30;
    // a rocky dome: irregular outcrops on both flanks (fixed by hash, turned by the spin)
    const jag = (i, side) => 34 * hash(i + Math.round(r.spin * 4) * side, side > 0 ? 7 : 3);
    g.moveTo(-half(0), 0);
    for (let i = 0; i <= N; i++) { const y = -(i / N) * H; g.lineTo(-half(y) - jag(i, -1), y); g.lineTo(-half(y) - jag(i, -1) * 0.3, y - H / N * 0.5); }
    for (let i = N; i >= 0; i--) { const y = -(i / N) * H; g.lineTo(half(y) + jag(i, 1) * 0.3, y - H / N * 0.5); g.lineTo(half(y) + jag(i, 1), y); }
    g.closePath(); cut(g);
    // a second, lower summit on the right shoulder and a crag on the left
    g.moveTo(half(-H * 0.7) * 0.2, -H * 0.72); g.quadraticCurveTo(half(-H * 0.7) * 0.7, -H * 1.02, half(-H * 0.62) * 1.05, -H * 0.6); g.closePath(); cut(g);
    g.moveTo(-half(-H * 0.5) * 0.9, -H * 0.5); g.lineTo(-half(-H * 0.5) * 1.08, -H * 0.72); g.lineTo(-half(-H * 0.5) * 0.6, -H * 0.6); g.closePath(); cut(g);
    // clumps of great trees on the ledges, standing proud of the outline
    for (let i = 0; i < 16; i++) {
      const y = -(0.08 + 0.86 * hash(i, 41)) * H, w = half(y), side = i % 2 ? 1 : -1, x = side * (w + 4), rr = 26 + 26 * hash(i, 42);
      for (const [dx, dy, k] of [[0, 0, 1], [-rr * 0.9, rr * 0.4, 0.7], [rr * 0.9, rr * 0.4, 0.75]]) { g.moveTo(x + dx + rr * k, y + dy - rr); g.arc(x + dx, y + dy - rr, rr * k, 0, TAU); cut(g); }
    }
    // the base: rooted hills, or roots and rock hanging when uprooted
    if (r.up > 0.01) {
      g.moveTo(-W, 0); g.quadraticCurveTo(-W * 0.6, 140 * r.up, 0, 260 * r.up); g.quadraticCurveTo(W * 0.6, 140 * r.up, W, 0); g.closePath(); cut(g);
      for (let i = 0; i < 9; i++) { const x = lerp(-W * 0.8, W * 0.8, i / 8); const len = (120 + 160 * hash(i, 4)) * r.up; g.moveTo(x - 10, 60 * r.up); g.quadraticCurveTo(x + 30 * Math.sin(i + r.T), 60 * r.up + len * 0.6, x + 20 * Math.sin(i * 2.1), 120 * r.up + len); g.lineTo(x + 10, 60 * r.up); g.closePath(); cut(g); }
    } else {
      g.moveTo(-W * 1.5, 0); g.quadraticCurveTo(-W, -140, -W * 0.4, -60); g.quadraticCurveTo(0, -20, W * 0.4, -60); g.quadraticCurveTo(W, -140, W * 1.5, 0); g.closePath(); cut(g);
    }
  }

  function ornaments(g, P, r, a, color) {
    if (a <= 0.01) return;
    g.globalAlpha *= a;
    // forest clumps over the rock (turning with the spin) and rock strata
    for (let i = 0; i < 70; i++) {
      const y = -(0.05 + 0.9 * hash(i, 51)) * H, w = half(y);
      const th = hash(i, 52) * TAU + r.spin;
      const z = Math.sin(th); if (z < 0.05) continue;
      const x = Math.cos(th) * w * 0.9, rr = (10 + 14 * hash(i, 53)) * (0.5 + 0.5 * z);
      g.fillStyle = i % 3 ? 'rgba(90,170,90,0.55)' : 'rgba(150,210,110,0.5)';
      g.beginPath(); g.arc(x, y, rr, 0, TAU); g.arc(x + rr * 0.8, y + rr * 0.3, rr * 0.7, 0, TAU); g.arc(x - rr * 0.8, y + rr * 0.3, rr * 0.7, 0, TAU); g.fill();
    }
    g.strokeStyle = 'rgba(200,230,190,0.18)'; g.lineWidth = 3;
    for (let b = 1; b < 8; b++) { const y = -(b / 8) * H, w = half(y); g.beginPath(); g.moveTo(-w * 0.9, y + 20); g.quadraticCurveTo(0, y + 50 + 10 * Math.sin(b + r.spin), w * 0.9, y + 20); g.stroke(); }
    // waterfalls (only when still)
    if (!r.spin) {
      g.strokeStyle = color; g.lineWidth = 6; g.lineCap = 'round';
      for (const [x, y0, y1] of [[-120, -1100, -760], [150, -900, -520], [-40, -600, -260]]) {
        g.globalAlpha = a * 0.7; g.beginPath(); g.moveTo(x, y0);
        for (let s = 0; s <= 8; s++) g.lineTo(x + Math.sin(s * 1.3 + r.T * 4) * 4, lerp(y0, y1, s / 8));
        g.stroke();
      }
    }
    // blossoms
    g.globalAlpha = a * 0.8; g.fillStyle = '#ffd0e0';
    for (let i = 0; i < 22; i++) { const y = -hash(i, 21) * H * 0.9, w = half(y); const x = (hash(i, 22) * 2 - 1) * w * 0.8; g.beginPath(); g.arc(x, y, 6, 0, TAU); g.fill(); }
  }

  function after(ctx, P, r) {
    if (r.burn <= 0.01) return;
    // the forests on fire: flame tongues along the ledges, a red-gold glow (stylised)
    const s = P.s;
    ctx.save(); ctx.translate(P.x, P.y); ctx.scale(s, s);
    KIT.glow(ctx, 0, -H * 0.5, 1100, '#ff6a20', 0.45 * r.burn);
    for (let i = 0; i < 26; i++) {
      const y = -(0.08 + 0.85 * hash(i, 31)) * H, w = half(y), side = i % 2 ? 1 : -1;
      const x = side * w * (0.6 + 0.4 * hash(i, 32)), f = 0.6 + 0.4 * Math.sin(r.T * 7 + i * 2.1), hh = (60 + 70 * hash(i, 33)) * f * r.burn;
      for (const [col, k] of [['#c8300c', 1], ['#ff9a20', 0.7], ['#fff0a0', 0.4]]) {
        ctx.fillStyle = col; ctx.globalAlpha = 0.85 * r.burn;
        ctx.beginPath(); ctx.moveTo(x - 26 * k, y); ctx.quadraticCurveTo(x - 16 * k, y - hh * k * 0.6, x + Math.sin(r.T * 5 + i) * 8, y - hh * k); ctx.quadraticCurveTo(x + 16 * k, y - hh * k * 0.6, x + 26 * k, y); ctx.closePath(); ctx.fill();
      }
    }
    ctx.restore();
  }

  const bible = {
    name: 'Mount Mandara',
    role: 'The churning stick: uprooted by Ananta, carried to the ocean, set on the tortoise\'s back, wound with Vasuki and whirled; its forests burn and Indra\'s rain puts them out (CE 1.16–17).',
    palette: { fill: '#1a1810', lit: '#4a4430', inner: '#3a3420', rimDim: '#d8c890', rimBright: '#fff8e0', forest: '#5aaa5a', ornamentDim: '#d8f0ff', ornament: '#ffffff' },
    proportions: '≈ 1500 units tall, ≈ 1040 wide at the base; a rounded cone of forest ledges.',
    props: ['tiers of forest crowns', 'waterfalls', 'blossoms', 'roots and rock when uprooted', 'pose.spin (churning)', 'pose.burn (its forests on fire)'],
    light: 'Stone-gold with green forests: rock fill #1a1810 → lit #4a4430, rim #d8c890 → #fff8e0 (rimW 1.6), green forest clumps, white waterfalls.',
    poses: [{ name: 'stand' }, { name: 'uprooted', note: 'k' }, { name: 'churn', note: 'spin, burn' }],
    voice: null,
  };

  CH.define({
    id: 'mandara', bible, rig, shape, ornaments, after, defaultPose: 'stand',
    rule: { fill: '#1a1810', lit: '#4a4430', litGain: 0.8, rim: ['#d8c890', '#fff8e0'], inner: '#3a3420', innerA: [0.85, 0.45], glow: 0.5, rimW: 1.6, ornament: ['#d8f0ff', '#ffffff'], ornamentA: [0.5, 0.85] },
    bounds: () => [-W * 1.6, -H - 140, W * 1.6, 460],
  });
  CH.ROSTER.push('mandara');
})();
