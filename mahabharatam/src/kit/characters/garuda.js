/*
 * CHARACTER · GARUDA (Suparna, Vainateya), king of birds · `garuda`
 *
 * Episodes 18–30 (CE 1.20–30): Vinata's second son, who hatches in his own time, huge and
 * blazing like a heap of fire, so that the gods take him for Agni; to free his mother from
 * slavery he carries the serpents, then storms heaven for the amrita.
 *
 * As the murals draw him: a man's body with an EAGLE'S HEAD (a hooked beak, a fierce round
 * eye, a crest of flame-feathers under a small crown), vast WINGS whose primaries fan like
 * flames, a feathered mantle on the shoulders, taloned feet, armlets and a broad collar.
 * Faces LEFT. Wings: the far wing behind the body, the near wing in front; pose.flap (rad)
 * opens/closes them; `fly` beats them with pose.phase; `stand` folds them half-open.
 * pose.blaze (0..1) is his first fire (episode 19: the gods think he is Agni); `carry` (k)
 * lowers the talons and spreads the arms (the serpents on his back are drawn by the scene).
 *
 * SIGNATURE LIGHT: blazing gold. Fill #2a1004, lit #7a3c10, inner #7a3a0a, rim #ffb030 →
 * #fff4c0 (rim ×1.2), glow 1.1, ornaments vermilion-to-gold #ff6a2a → #ffe0a0; with blaze →
 * a fire-aura behind him. Never Aruna's dawn-red halo (his brother), never Surya's white disc.
 *
 * (x, y) = feet. scale 1 ≈ 1100 px to the crest; the open wingspan ≈ 2400.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, CH = KIT.characters;
  const { TAU, lerp, clamp, hash } = R;
  const { cut, limb, ik, hand, along } = CH;

  const D = { hip: 500, thigh: 250, shin: 230, foot: 80, sitHip: 150 };
  const PIV = -500;

  function rig(P) {
    const po = P.po, k = po.k;
    const fly = po.name === 'fly' || po.name === 'carry';
    const r = CH.profileRig(fly ? { ...po, name: 'stand', base: 'stand' } : po, D);
    r.T = P.T; r.look = P.ex.look || 0; r.wrath = P.ex.mood === 'wrath';
    r.blaze = clamp(po.blaze || 0);
    r.fly = fly;
    const beat = fly ? Math.sin(po.phase ?? P.T * 4) : 0;
    r.flap = po.flap ?? (fly ? 0.35 + 0.55 * beat : -0.25);   // radians: wings up (+) / down (−)
    r.open = po.open ?? (fly ? 1 : po.name === 'spread' ? k : 0.45);
    r.lean = fly ? 0.55 : po.name === 'bow' ? 0.35 * k : 0;
    // hands: anjali (palms together) at the chest by default; arms out when carrying / spread
    r.hand = [-120, -700]; r.farHand = [-100, -690]; r.kind = 'open';
    if (po.name === 'carry') { r.hand = [-260, -640]; r.farHand = [-200, -600]; }
    if (po.name === 'spread') { r.hand = along(r.hand, [-330, -880], k); }
    if (fly) {
      // legs trail back, talons drawn up
      const tuck = po.name === 'carry' ? 0.4 * k : 1;
      r.legs = r.legs.map((l, i) => { const a = 0.9 + 0.3 * i; const knee = [l.hip[0] + Math.sin(a) * D.thigh * 0.9, l.hip[1] + Math.cos(a) * D.thigh * 0.6]; const ankle = [knee[0] + D.shin * (0.4 + 0.5 * tuck), knee[1] + D.shin * (0.5 - 0.3 * tuck)]; return { ...l, knee, ankle, toe: [ankle[0] - 60, ankle[1] + 20], heel: [ankle[0] + 16, ankle[1] + 8] }; });
    }
    const c = Math.cos(-r.lean), s = Math.sin(-r.lean);
    r.rot = (p) => [p[0] * c - (p[1] - PIV) * s, p[0] * s + (p[1] - PIV) * c + PIV];
    r.shN = r.rot([4, -790]); r.shF = r.rot([30, -794]);
    if (r.lean) { r.hand = r.rot(r.hand); r.farHand = r.rot(r.farHand); }
    return r;
  }

  /** A wing from the shoulder root: a fan of long primaries. far: sweeps up and BACK (+x);
   *  near: sweeps up and FORWARD (−x), so the two wings open in a V above him. */
  function wingPts(r, root, far) {
    const span = lerp(460, 1150, r.open) * (far ? 0.9 : 1);
    const sg = far ? 1 : -1;
    const lead = -Math.PI / 2 + sg * (0.12 + 0.25 * r.open) - r.flap * 0.8 * sg;   // the leading edge
    const spread = lerp(0.45, 1.25, r.open);
    const pts = [];
    for (let i = 0; i <= 9; i++) {
      const u = i / 9, a = lead + sg * spread * u + 0.08 * Math.sin(r.T * 3 + i) * (r.fly ? 1 : 0.2);
      const len = span * (1 - 0.5 * Math.pow(u, 1.3)) * (i % 2 ? 0.93 : 1);
      pts.push({ a, len });
    }
    return { pts, sg };
  }
  function wing(g, r, root, far) {
    const { pts, sg } = wingPts(r, root, far);
    g.moveTo(root[0] - sg * 30, root[1] + 40);
    for (const { a, len } of pts) {
      const tip = [root[0] + Math.cos(a) * len, root[1] + Math.sin(a) * len];
      const a2 = a + sg * 0.07;
      g.lineTo(root[0] + Math.cos(a - sg * 0.04) * len * 0.8, root[1] + Math.sin(a - sg * 0.04) * len * 0.8);
      g.quadraticCurveTo(tip[0] + Math.cos(a) * 20, tip[1] + Math.sin(a) * 20, root[0] + Math.cos(a2) * len * 0.86, root[1] + Math.sin(a2) * len * 0.86);
    }
    g.lineTo(root[0] + sg * 60, root[1] + 160);
    g.closePath(); cut(g);
    // the wing's arm: a thick covert band along the leading edge
    const a0 = pts[0].a;
    limb(g, [[root[0], root[1]], [root[0] + Math.cos(a0) * pts[0].len * 0.55, root[1] + Math.sin(a0) * pts[0].len * 0.55]], [90, 50]);
  }

  function headPath(g, r) {
    g.save(); g.translate(10, -830); g.rotate(r.look); g.scale(1.25, 1.25);
    // head of an eagle: crown of the skull, the fierce brow, the hooked beak
    g.moveTo(40, 10); g.bezierCurveTo(56, -40, 58, -100, 30, -136); g.bezierCurveTo(0, -160, -50, -150, -76, -120);
    g.bezierCurveTo(-100, -110, -130, -96, -150, -70);       // the beak's top
    g.quadraticCurveTo(-162, -48, -140, -36); g.lineTo(-132, -52);   // the hook
    g.bezierCurveTo(-110, -54, -90, -50, -70, -44); g.bezierCurveTo(-60, -20, -30, 6, 0, 16); g.closePath(); cut(g);
    // flame-feather crest at the back of the head, under a small crown
    for (let i = 0; i < 6; i++) { const a = -2.2 + i * 0.32; const p0 = [20 + Math.cos(a) * 60, -90 + Math.sin(a) * 60]; g.moveTo(p0[0] - 10, p0[1]); g.quadraticCurveTo(p0[0] + Math.cos(a + 0.6) * 90, p0[1] + Math.sin(a + 0.6) * 90 - 20, p0[0] + Math.cos(a + 0.9) * 150 + 30, p0[1] + Math.sin(a + 0.9) * 120); g.lineTo(p0[0] + 12, p0[1] + 6); cut(g); }
    g.moveTo(-50, -140); g.lineTo(-40, -200); g.lineTo(-10, -178); g.lineTo(10, -220); g.lineTo(30, -176); g.lineTo(50, -196); g.lineTo(46, -136); g.closePath(); cut(g);
    g.restore();
  }

  function shape(g, color, P, r) {
    g.translate(0, r.bob);
    g.fillStyle = color;
    const root = r.rot([40, -760]);
    g.beginPath(); wing(g, r, [root[0] + 30, root[1] - 10], true); g.fill();
    g.beginPath(); wing(g, r, root, false); g.fill();   // both wings behind the body, so the head always reads
    g.save(); g.translate(0, r.drop);
    // far arm
    { const el = ik(r.shF, r.farHand, 170, 160, 1); g.beginPath(); limb(g, [r.shF, el, r.farHand], [56, 40, 28]); hand(g, r.farHand, 0.2, 34, r.kind); g.fill(); }
    g.restore();
    // legs with talons
    g.beginPath(); CH.legs(g, r, [78, 44, 26]);
    for (const l of r.legs) for (let k = 0; k < 3; k++) { const t = l.toe, a = Math.PI + 0.4 * (k - 1); g.moveTo(t[0], t[1]); g.quadraticCurveTo(t[0] + Math.cos(a) * 40, t[1] + Math.sin(a) * 30, t[0] + Math.cos(a) * 54, t[1] + 26); g.lineTo(t[0] + 6, t[1] + 8); cut(g); }
    g.fill();
    // a feathered kilt
    g.beginPath(); CH.lowerCloth(g, r, { waistY: -500, waistF: -44, waistB: 60, len: 'knee', flare: 1.25, pleats: true, T: r.T, wind: 0.8 }); g.fill();
    g.save(); g.translate(0, r.drop);
    g.save(); g.translate(0, PIV); g.rotate(-r.lean); g.translate(0, -PIV);
    g.beginPath(); CH.torso(g, { waistY: -490, neckY: -836, chestY: -710, front: -70, back: 66, waistF: -40, waistB: 56, neckF: -2, neckB: 34, pec: 20, lat: 10 }); g.fill();
    // feather mantle on the shoulders
    g.beginPath(); for (let i = 0; i < 7; i++) { const x = -60 + i * 22, y = -800 + Math.abs(i - 3) * 6; g.moveTo(x - 16, y); g.quadraticCurveTo(x, y + 70, x + 16, y); cut(g); } g.fill();
    g.beginPath(); headPath(g, r); g.fill();
    g.restore();
    { const el = ik(r.shN, r.hand, 170, 160, -1); g.beginPath(); limb(g, [r.shN, el, r.hand], [60, 42, 30]); hand(g, r.hand, 0.2, 36, r.kind); g.fill(); }
    g.restore();
  }

  function ornaments(g, P, r, a, color) {
    if (a <= 0.01) return;
    g.translate(0, r.bob);
    g.globalAlpha *= a; g.strokeStyle = color; g.fillStyle = color; g.lineCap = 'round';
    g.save(); g.translate(0, r.drop); g.translate(0, PIV); g.rotate(-r.lean); g.translate(0, -PIV);
    g.beginPath(); g.moveTo(-60, -820); g.quadraticCurveTo(-20, -740, 34, -820); g.lineWidth = 12; g.stroke();
    g.beginPath(); g.moveTo(-44, -496); g.lineTo(60, -496); g.lineWidth = 9; g.stroke();
    g.save(); g.translate(10, -830); g.rotate(r.look); g.scale(1.25, 1.25);
    g.fillStyle = r.wrath || r.blaze > 0.5 ? '#ff5a2a' : '#fff4c0'; g.beginPath(); g.arc(-62, -96, 9, 0, TAU); g.fill();
    g.strokeStyle = color; g.lineWidth = 5; g.beginPath(); g.moveTo(-90, -112); g.quadraticCurveTo(-60, -124, -36, -110); g.stroke();
    g.restore();
    g.restore();
    // feather bars and covert scallops on both wings (painted plumage, not a flat shape)
    const root = r.rot([40, -760]);
    for (const far of [true, false]) {
      const { pts } = wingPts(r, root, far);
      g.lineWidth = 5; g.globalAlpha = a * (far ? 0.5 : 0.8);
      for (const { a: aa, len } of pts) { g.beginPath(); g.moveTo(root[0] + Math.cos(aa) * len * 0.4, root[1] + Math.sin(aa) * len * 0.4); g.lineTo(root[0] + Math.cos(aa) * len * 0.9, root[1] + Math.sin(aa) * len * 0.9); g.stroke(); }
      for (let i = 0; i < 6; i++) { const { a: aa, len } = pts[Math.min(9, i + 1)]; const c = [root[0] + Math.cos(aa) * len * 0.32, root[1] + Math.sin(aa) * len * 0.32]; g.beginPath(); g.arc(c[0], c[1], 22, aa - 1.2, aa + 1.2); g.stroke(); }
    }
  }

  function before(ctx, P, r, k) {
    const s = P.s;
    KIT.glow(ctx, P.x, P.y - 700 * s, 1200 * s, '#ffb030', (0.25 + 0.6 * r.blaze) * k);
    if (r.blaze > 0.01) {
      // the fire-aura of his birth: tongues of flame all round him
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 24; i++) { const a = (i / 24) * TAU, life = (r.T * 0.8 + hash(i, 3)) % 1; const d = (500 + 300 * life) * s; KIT.glow(ctx, P.x + Math.cos(a) * d, P.y - 700 * s + Math.sin(a) * d * 1.2, 160 * s * 2, i % 2 ? '#ff6a1a' : '#ffd060', 0.5 * r.blaze * (1 - life)); }
      ctx.restore();
    }
  }

  CH.define({
    id: 'garuda', rig, shape, ornaments, before, defaultPose: 'stand',
    bible: {
      name: 'Garuda, king of birds',
      role: 'Vinata\'s second son: he hatches blazing like fire, carries the serpents, and storms heaven for the amrita to free his mother (CE 1.20–30).',
      palette: { fill: '#2a1004', lit: '#7a3c10', inner: '#7a3a0a', rimDim: '#ffb030', rimBright: '#fff4c0', ornamentDim: '#ff6a2a', ornament: '#ffe0a0' },
      proportions: '≈ 1100 units to the crest; open wingspan ≈ 2400; a man\'s body, an eagle\'s head, taloned feet.',
      props: ['eagle head with hooked beak and flame-feather crest', 'a small crown', 'vast flame-feathered wings', 'feathered mantle and kilt', 'talons', 'armlets and collar'],
      light: 'Blazing gold: rim #ffb030 → #fff4c0 (×1.2), glow 1.1, vermilion-gold ornaments; pose.blaze adds his birth-fire. Never Aruna\'s red halo or Surya\'s disc.',
      poses: [{ name: 'stand', note: 'wings half-open' }, { name: 'spread', note: 'k: wings and arm open' }, { name: 'fly', note: 'phase: the wings beat' }, { name: 'carry', note: 'k: talons and arms down, carrying' }, { name: 'bow', note: 'k' }, { name: 'any + blaze', note: '0..1: his birth-fire' }],
      voice: 'garuda',
    },
    rule: { fill: '#2a1004', lit: '#7a3c10', litGain: 1.0, rim: ['#ffb030', '#fff4c0'], inner: '#7a3a0a', innerA: [0.85, 0.45], glow: 1.1, rimW: 1.2, ornament: ['#ff6a2a', '#ffe0a0'], ornamentA: [0.6, 0.95] },
    bounds: () => [-1100, -2200, 1700, 60],
  });
  CH.ROSTER.push('garuda');
})();
