/*
 * CHARACTER · THE TEACHER'S WIFE (wife of the teacher Veda) · `gurupatni`
 *
 * Episode 6 (Adi Parva 3): asked what gift she would have from her husband's
 * student, she asks Uttanka for the earrings of King Paushya's queen, to wear at
 * a rite four days away. Minimal by design: she appears once.
 *
 * Built on CH.female (src/kit/characters/paushya-queen.js). A hermitage
 * householder, not a queen: the end of her plain sari covers her head and falls
 * over both shoulders (a hood-like silhouette, never a crown); a low knot of hair
 * at the nape under it; a mangala-sutra and two plain bangles, nothing more; she
 * holds a small clay oil lamp in her far hand.
 *
 * SIGNATURE LIGHT: hearth amber, soft. Fill #100a08, inner #3a1e10, rim #c08050
 * → #f8d8a8; ornaments #a07838 → #e8c888 at only 0.3–0.6; her lamp's small flame
 * is the only bright thing about her.
 *
 * Faces LEFT natively. Feet on (x, y). scale 1 ≈ 960 px.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, CH = KIT.characters;
  const { TAU, lerp } = R;
  const { cut, limb, ik } = CH;
  const F = CH.female, PIV = F.PIV;

  function rig(P) {
    const r = F.rig(P);
    // the lamp in the far hand, held before her
    if (P.po.name !== 'walk') r.farHand = r.sitting ? [-110, -470] : [-60, -560];
    r.farKind = 'cup'; r.farA = 0;
    return r;
  }

  function headPath(g, r) {
    g.save(); g.translate(6, -770); g.rotate(r.look);
    F.face(g);
    // the sari end over the head: a hood from the brow down the back and both shoulders
    g.moveTo(-40, -112);
    g.bezierCurveTo(-30, -150, 30, -164, 60, -128);
    g.bezierCurveTo(90, -80, 92, 40, 96, 150);
    g.lineTo(30, 170);
    g.bezierCurveTo(40, 60, 44, -40, 30, -80);
    g.bezierCurveTo(10, -122, -20, -120, -40, -112);
    g.closePath(); cut(g);
    // the knot at the nape under the cloth
    g.moveTo(76, -60); g.ellipse(56, -62, 22, 18, 0, 0, TAU); cut(g);
    if (r.speak > 0.02) {
      g.save(); g.globalCompositeOperation = 'destination-out';
      const o = 3.5 * r.speak;
      g.moveTo(-28, -32); g.lineTo(-50, -34 - o); g.lineTo(-50, -28 + o * 0.6); g.closePath(); cut(g);
      g.restore();
    }
    g.restore();
  }

  function lampPath(g, r) {
    const h = r.farHand;
    g.moveTo(h[0] - 40, h[1] - 18); g.quadraticCurveTo(h[0], h[1] + 12, h[0] + 40, h[1] - 18); g.lineTo(h[0] + 30, h[1] - 24); g.lineTo(h[0] - 34, h[1] - 24); g.closePath(); cut(g);
    g.moveTo(h[0] - 40, h[1] - 18); g.lineTo(h[0] - 58, h[1] - 28); g.lineTo(h[0] - 34, h[1] - 24); g.closePath(); cut(g);
  }

  function shape(g, color, P, r) {
    g.translate(0, r.bob);
    g.fillStyle = color;
    g.save(); g.translate(0, r.drop);
    g.beginPath(); F.arms(g, r, false); g.fill();
    g.beginPath(); lampPath(g, r); g.fill();
    g.restore();
    g.beginPath(); CH.legs(g, r, [60, 38, 20]); g.fill();
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
    g.globalAlpha *= a;
    g.strokeStyle = color; g.fillStyle = color; g.lineCap = 'round';
    g.save(); g.translate(0, r.drop);
    g.save(); g.translate(0, PIV); g.rotate(-r.lean); g.translate(0, -PIV);
    // mangala-sutra, the hood's border, the eye
    CH.beads(g, [-2, -752], [-40, -700], [-28, -660], 7, 3);
    g.beginPath(); g.arc(-28, -652, 6, 0, TAU); g.fill();
    g.save(); g.translate(6, -770); g.rotate(r.look);
    g.beginPath(); g.moveTo(-40, -112); g.bezierCurveTo(-30, -150, 30, -164, 60, -128); g.lineWidth = 4; g.stroke();
    g.beginPath(); g.ellipse(-30, -84, 7, 2.8, 0.1, 0, TAU); g.fill();
    g.restore();
    g.restore();
    const el = ik(r.shN, r.hand, 160, 148, -1), p = [lerp(el[0], r.hand[0], 0.8), lerp(el[1], r.hand[1], 0.8)];
    g.beginPath(); g.arc(p[0], p[1], 15, 0, TAU); g.lineWidth = 3; g.stroke();
    g.restore();
  }

  function after(ctx, P, r, k) {
    // the lamp's small flame
    const sx = P.flip ? -P.s : P.s, h = r.farHand;
    const fx = P.x + (h[0] - 52) * sx, fy = P.y + (h[1] - 30 + r.bob + r.drop) * P.s;
    const fl = KIT.flicker(P.T, 41);
    KIT.glow(ctx, fx, fy - 10 * P.s, 160 * P.s, '#ffb050', 0.35 * fl);
    ctx.save();
    ctx.fillStyle = '#ffe2a0';
    ctx.beginPath(); ctx.moveTo(fx - 7 * P.s, fy); ctx.quadraticCurveTo(fx - 4 * P.s, fy - 26 * P.s * fl, fx + Math.sin(P.T * 7) * 3 * P.s, fy - 34 * P.s * fl); ctx.quadraticCurveTo(fx + 6 * P.s, fy - 14 * P.s, fx + 7 * P.s, fy); ctx.closePath(); ctx.fill();
    ctx.restore();
    void k;
  }

  const bible = {
    name: 'The teacher\'s wife',
    role: 'Wife of Uttanka\'s teacher (Veda); she asks for the earrings of King Paushya\'s queen as her gift (Adi Parva 3).',
    palette: { fill: '#100a08', inner: '#3a1e10', rimDim: '#c08050', rimBright: '#f8d8a8', ornamentDim: '#a07838', ornament: '#e8c888', lamp: '#ffe2a0' },
    proportions: '≈ 960 units (CH.female: hip 480), the sari end over her head; seated hip 140.',
    props: ['plain sari, its end over her head and shoulders', 'low knot of hair at the nape', 'mangala-sutra', 'two plain bangles', 'a small clay oil lamp in the far hand'],
    light: 'Hearth amber, soft: fill #100a08, inner #3a1e10, rim #c08050 → #f8d8a8; ornaments #a07838 → #e8c888 at 0.3–0.6; the lamp flame is her only bright point.',
    poses: [
      { name: 'stand' }, { name: 'walk' }, { name: 'sit' }, { name: 'speak', note: 'k' },
      { name: 'ask', note: 'k: the near hand opens, palm up: "one gift"' }, { name: 'bless', note: 'k' },
    ],
    voice: 'guru_patni',
  };

  CH.define({
    id: 'gurupatni', bible, rig, shape, ornaments, after, defaultPose: 'stand',
    rule: {
      fill: '#100a08', lit: '#30180c', litGain: 0.8,
      rim: ['#c08050', '#f8d8a8'], inner: '#3a1e10', innerA: [0.8, 0.4], glow: 0.6,
      ornament: ['#a07838', '#e8c888'], ornamentA: [0.3, 0.6],
    },
    bounds: () => [-440, -1000, 480, 30],
  });
  CH.ROSTER.push('gurupatni');
  void limb;
})();
