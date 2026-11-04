/*
 * CHARACTER · THE ENCHANTRESS (Narayana's illusion) · `enchantress`
 *
 * Episodes 15–16 (CE 1.16–17): to take the amrita from the asuras, Narayana "resorted to an
 * enchanting illusion, the wondrous form of a woman" and went among them; bewitched, they
 * gave her the pot, and she gave it to the gods. The epic gives her no name (the name
 * "Mohini" is Puranic), so the series calls her only the enchantress.
 *
 * Built on CH.female (profile, faces LEFT): tall and graceful, a high tiered bun wound with
 * jasmine and a crescent comb, long drop earrings, a jewelled girdle, a sari whose pallu
 * becomes a long VEIL that floats on the air like a mirage, and the pot of amrita on her hip
 * (`carry`) or tilted forward to pour (`pour`, k). pose.reveal (0..1) lets Narayana's gold
 * show through her rim at the end: the illusion seen for what it is.
 *
 * SIGNATURE LIGHT: illusion-pearl. Fill #0e0a20, lit #2a2050, inner #3a2a70, rim #c8a0ff →
 * #fff0ff (pearl-violet, kin to Narayana's indigo), glow 1.0; gold ornaments #e8b84a →
 * #fff0c0; a drift of shimmering motes around the veil. With reveal → 1 the rim turns to
 * Narayana's gold (#e8b040).
 *
 * Feet on (x, y). scale 1 ≈ 1000 px to the top of the bun.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, CH = KIT.characters;
  const { TAU, lerp, clamp, hash } = R;
  const { cut, along, ribbon, limbOutline } = CH;
  const F = CH.female, PIV = F.PIV;

  function rig(P) {
    const r = F.rig(P);
    const po = P.po, k = po.k;
    r.reveal = clamp(po.reveal || 0);
    r.pot = po.name === 'carry' || po.name === 'pour' || po.pot;
    if (r.pot) { r.farHand = [40, -540]; r.farKind = 'cup'; }
    if (po.name === 'pour') { r.hand = along(r.hand, [-230, -650], k); r.nearKind = 'cup'; r.farHand = along([40, -540], [-150, -660], k); r.potTilt = 1.3 * k; r.lean += 0.12 * k; }
    else r.potTilt = 0;
    if (po.name === 'beckon') { r.hand = along(r.hand, [-200, -760], k); r.nearKind = 'open'; r.nearA = -Math.PI / 2 - 0.6; }
    r.potAt = r.farHand;
    return r;
  }

  function headPath(g, r) {
    g.save(); g.translate(6, -788); g.rotate(r.look);
    F.face(g);
    g.moveTo(44, -60); g.bezierCurveTo(58, -90, 54, -130, 20, -142); g.lineTo(0, -138); g.bezierCurveTo(30, -120, 40, -90, 30, -50); g.closePath(); cut(g);
    // a high bun in three tiers, a crescent comb
    for (const [y, w] of [[-160, 40], [-198, 32], [-230, 22]]) { g.moveTo(26 + w, y); g.ellipse(26, y, w, w * 0.75, 0, 0, TAU); cut(g); }
    g.moveTo(-4, -250); g.quadraticCurveTo(26, -290, 60, -250); g.quadraticCurveTo(26, -270, -4, -250); cut(g);
    // long drop earring
    g.moveTo(20, -36); g.lineTo(26, 20); g.lineTo(14, 20); g.closePath(); cut(g);
    if (r.speak > 0.02) { g.save(); g.globalCompositeOperation = 'destination-out'; const o = 3.5 * r.speak; g.moveTo(-28, -32); g.lineTo(-50, -34 - o); g.lineTo(-50, -28 + o * 0.6); g.closePath(); cut(g); g.restore(); }
    g.restore();
  }

  function veil(g, r) {
    const pts = ribbon([30, -770], 0.5 - 0.2 * r.wind, 640, r.T * 0.8, 30, 2.1, 16, 180);
    limbOutline(g, pts, pts.map((_, i) => lerp(40, 110, Math.sin(Math.PI * Math.min(1, i / (pts.length - 1) * 1.1))))); cut(g);
  }

  function pot(g, r) {
    const p = r.potAt;
    g.save(); g.translate(p[0] + 30, p[1] - 30); g.rotate(-r.potTilt);
    g.moveTo(70, 0); g.ellipse(0, 0, 70, 60, 0, 0, TAU); cut(g);
    g.moveTo(-30, -56); g.lineTo(30, -56); g.lineTo(22, -84); g.lineTo(-22, -84); g.closePath(); cut(g);
    g.restore();
  }

  function shape(g, color, P, r) {
    g.translate(0, r.bob);
    g.fillStyle = color;
    g.save(); g.translate(0, r.drop);
    g.beginPath(); veil(g, r); g.fill();
    g.beginPath(); F.arms(g, r, false); g.fill();
    if (r.pot) { g.beginPath(); pot(g, r); g.fill(); }
    g.restore();
    g.beginPath(); CH.legs(g, r, [58, 36, 20]); g.fill();
    g.beginPath(); F.skirt(g, r); g.fill();
    g.save(); g.translate(0, r.drop);
    g.save(); g.translate(0, PIV); g.rotate(-r.lean); g.translate(0, -PIV);
    g.save(); g.translate(0, 18); g.beginPath(); F.torso(g); g.fill(); g.restore();
    g.beginPath(); headPath(g, r); g.fill();
    g.restore();
    g.beginPath(); F.arms(g, r, true); g.fill();
    g.restore();
  }

  function ornaments(g, P, r, a, color) {
    if (a <= 0.01) return;
    g.translate(0, r.bob);
    g.globalAlpha *= a; g.strokeStyle = color; g.fillStyle = color; g.lineCap = 'round';
    g.save(); g.translate(0, r.drop);
    g.save(); g.translate(0, PIV); g.rotate(-r.lean); g.translate(0, -PIV);
    CH.beads(g, [-2, -752], [-36, -716], [-24, -690], 9, 3.5);
    g.beginPath(); g.moveTo(-36, -470); g.lineTo(60, -470); g.lineWidth = 9; g.stroke();
    g.save(); g.translate(6, -788); g.rotate(r.look);
    for (let i = 0; i < 10; i++) { const t = (i / 10) * TAU; g.beginPath(); g.arc(26 + Math.cos(t) * 42, -180 + Math.sin(t) * 40, 5, 0, TAU); g.fill(); }
    g.restore();
    g.restore();
    if (r.pot) {
      const p = r.potAt;
      g.save(); g.translate(p[0] + 30, p[1] - 30); g.rotate(-r.potTilt);
      g.fillStyle = '#ffffff'; g.shadowColor = '#ffffff'; g.shadowBlur = R.px(24 * P.s);
      g.beginPath(); g.ellipse(0, 0, 56, 46, 0, 0, TAU); g.fill();
      g.restore();
    }
    g.restore();
  }

  function after(ctx, P, r) {
    // motes of the illusion drifting off the veil
    const s = P.s, sx = P.flip ? -s : s;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 18; i++) {
      const life = (r.T * 0.4 + hash(i, 41)) % 1, x = P.x + (60 + hash(i, 42) * 600) * sx, y = P.y + (-760 + hash(i, 43) * 500 - life * 200) * s;
      KIT.glow(ctx, x, y, 26 * s * 2, r.reveal > 0.5 ? '#ffd890' : '#e0c0ff', 0.6 * Math.sin(Math.PI * life));
    }
    ctx.restore();
  }

  const bible = {
    name: 'The enchantress (Narayana\'s illusion)',
    role: 'Narayana in the illusory form of a wondrous woman: she takes the amrita from the asuras and gives it to the gods (CE 1.16–17). Unnamed in the epic ("Mohini" is Puranic).',
    palette: { fill: '#0e0a20', lit: '#2a2050', inner: '#3a2a70', rimDim: '#c8a0ff', rimBright: '#fff0ff', ornamentDim: '#e8b84a', ornament: '#fff0c0', reveal: '#e8b040' },
    proportions: 'CH.female, ≈ 1000 units to the top of the bun; a veil streaming ≈ 640 behind her.',
    props: ['a high tiered bun with jasmine and a crescent comb', 'long drop earrings', 'a jewelled girdle', 'a floating veil', 'the white pot of amrita (carry / pour)'],
    light: 'Illusion-pearl: rim #c8a0ff → #fff0ff, glow 1.0, gold ornaments, shimmering motes; pose.reveal turns the rim to Narayana\'s gold.',
    poses: [{ name: 'stand' }, { name: 'walk' }, { name: 'carry', note: 'the pot on her hip' }, { name: 'pour', note: 'k' }, { name: 'beckon', note: 'k' }, { name: 'any + reveal', note: '0..1' }],
    voice: 'enchantress',
  };
  const mod = CH.define({
    id: 'enchantress', bible, rig, shape, ornaments, after, defaultPose: 'carry',
    rule: { fill: '#0e0a20', lit: '#2a2050', litGain: 0.8, rim: ['#c8a0ff', '#fff0ff'], inner: '#3a2a70', innerA: [0.85, 0.45], glow: 1.0, ornament: ['#e8b84a', '#fff0c0'], ornamentA: [0.6, 0.95] },
    bounds: () => [-420, -1100, 760, 40],
  });
  // pose.reveal: blend the rim toward Narayana's gold (the rule is fixed; draw() swaps it per call)
  const base = mod._def.rule, gold = { ...base, rim: ['#e8b040', '#fff2c0'], inner: '#2a3a9a' };
  mod.draw = (ctx, o = {}) => { const rv = clamp((o.pose && o.pose.reveal) || 0); mod._def.rule = rv > 0.5 ? gold : base; const out = CH.render(ctx, mod._def, o); mod._def.rule = base; return out; };
  CH.ROSTER.push('enchantress');
})();
