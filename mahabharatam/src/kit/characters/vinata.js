/*
 * CHARACTER · VINATA, mother of Aruna and Garuda · `vinata`
 *
 * Episodes 9–10+ (CE 1.14–20): daughter of Daksha, wife of the sage Kashyapa. She asks
 * for only two sons, stronger and more glorious than all of Kadru's. Impatient after five
 * hundred years, she breaks one egg: Aruna, half-formed, curses her to be her rival's
 * slave. Losing the wager over the horse's tail, she becomes Kadru's slave until Garuda
 * wins her freedom.
 *
 * Gentle and upright, softer in line than her sister: hair in a low knot at the nape
 * wound with a string of lotus buds, a single lotus at the temple, small drop earrings, a
 * fine necklace, two bangles; an ankle-length sari, its pallu over the near shoulder and
 * falling in front. Built on CH.female. When enslaved (pose.slave: true) her ornaments
 * are gone and the pallu covers her head.
 *
 * SIGNATURE LIGHT: lotus dawn-rose. Fill #100a0c, inner #3a1a2a, rim #d890b0 → #fff0f6,
 * ornaments #e8b8c8 → #fff4f8 (0.4–0.75). Never Kadru's olive-gold; the mother of the
 * dawn (Aruna) and of the golden bird.
 *
 * Faces LEFT natively. Feet on (x, y). scale 1 ≈ 990 px to the crown of the head.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, CH = KIT.characters;
  const { TAU } = R;
  const { cut, along } = CH;
  const F = CH.female, PIV = F.PIV;

  function rig(P) {
    const r = F.rig(P);
    const po = P.po, k = po.k;
    r.slave = !!po.slave;
    // (Nov 7, independent review 21–30) standing, her hands hang clasped low in front, arms straight: the old folded-at-
    // the-waist hands read as a proud hand-on-hip, wrong for a grieving slave mother
    if (po.name === 'stand' || !po.name) { r.hand = [-60, -430]; r.farHand = [-40, -436]; r.nearKind = 'cup'; r.farKind = 'cup'; r.nearA = 0.9; r.farA = 0.8; }
    if (po.name === 'cradle') { r.hand = along(r.hand, [-120, -600], k); r.farHand = along(r.farHand, [-90, -640], k); r.nearKind = 'cup'; r.farKind = 'cup'; r.look += 0.2 * k; }
    if (po.name === 'reach') { r.hand = along(r.hand, [-320, -380], k); r.nearKind = 'open'; r.nearA = Math.PI / 2 + 0.5; r.lean += 0.35 * k; r.look += 0.3 * k; }
    if (po.name === 'grieve') { r.hand = along(r.hand, [-80, -780], k); r.nearKind = 'open'; r.nearA = -Math.PI / 2 - 0.9; r.lean += 0.12 * k; r.look += 0.25 * k; }
    if (po.name === 'bow') { r.lean += 0.35 * k; r.look += 0.2 * k; }
    const c = Math.cos(-r.lean), s = Math.sin(-r.lean);
    r.rot = (p) => [p[0] * c - (p[1] - PIV) * s, p[0] * s + (p[1] - PIV) * c + PIV];
    r.shN = r.rot([2, -748]); r.shF = r.rot([24, -752]);
    if (po.name === 'grieve' || po.name === 'bow') { r.hand = r.rot(r.hand); r.farHand = r.rot(r.farHand); }
    return r;
  }

  function headPath(g, r) {
    g.save(); g.translate(6, -770); g.rotate(r.look);
    F.face(g);
    if (r.slave) {
      g.moveTo(-40, -112); g.bezierCurveTo(-30, -150, 30, -164, 60, -128); g.bezierCurveTo(90, -80, 92, 40, 96, 150); g.lineTo(30, 170); g.bezierCurveTo(40, 60, 44, -40, 30, -80); g.bezierCurveTo(10, -122, -20, -120, -40, -112); g.closePath(); cut(g);
    } else {
      g.moveTo(-42, -104); g.bezierCurveTo(-36, -150, 40, -152, 50, -110); g.bezierCurveTo(56, -80, 54, -50, 40, -30); g.bezierCurveTo(30, -70, 10, -96, -42, -104); g.closePath(); cut(g);
      g.moveTo(84, -56); g.ellipse(60, -56, 26, 22, 0, 0, TAU); cut(g);                  // low knot
      g.moveTo(-14, -140); g.ellipse(-24, -140, 12, 9, -0.4, 0, TAU); cut(g);             // lotus at the temple
      g.moveTo(20, -30); g.lineTo(26, -6); g.lineTo(14, -6); g.closePath(); cut(g);     // drop earring
    }
    if (r.speak > 0.02) {
      g.save(); g.globalCompositeOperation = 'destination-out';
      const o = 3.5 * r.speak;
      g.moveTo(-28, -32); g.lineTo(-50, -34 - o); g.lineTo(-50, -28 + o * 0.6); g.closePath(); cut(g);
      g.restore();
    }
    g.restore();
  }

  function pallu(g, r) {
    // over the near shoulder, falling in front to the knee
    const sw = Math.sin(r.T * 1.5) * 5 * r.wind + r.st * 10;
    g.moveTo(30, -770); g.bezierCurveTo(-10, -790, -50, -760, -56, -700); g.lineTo(-70 - sw, -420); g.lineTo(-30 - sw * 0.6, -410); g.bezierCurveTo(-30, -560, -20, -700, 30, -740); g.closePath(); cut(g);
  }

  function shape(g, color, P, r) {
    g.translate(0, r.bob);
    g.fillStyle = color;
    g.save(); g.translate(0, r.drop);
    g.beginPath(); F.arms(g, r, false); g.fill();
    g.restore();
    g.beginPath(); CH.legs(g, r, [58, 36, 20]); g.fill();
    g.beginPath(); F.skirt(g, r); g.fill();
    g.save(); g.translate(0, r.drop);
    g.save(); g.translate(0, PIV); g.rotate(-r.lean); g.translate(0, -PIV);
    g.save(); g.translate(0, 18); g.beginPath(); F.torso(g); g.fill(); g.restore();
    g.beginPath(); pallu(g, r); g.fill();
    g.beginPath(); headPath(g, r); g.fill();
    g.restore();
    g.beginPath(); F.arms(g, r, true); g.fill();
    g.restore();
  }

  function ornaments(g, P, r, a, color) {
    if (a <= 0.01) return;
    g.translate(0, r.bob);
    g.globalAlpha *= a * (r.slave ? 0.4 : 1);
    g.strokeStyle = color; g.fillStyle = color; g.lineCap = 'round';
    g.save(); g.translate(0, r.drop);
    g.save(); g.translate(0, PIV); g.rotate(-r.lean); g.translate(0, -PIV);
    if (!r.slave) CH.beads(g, [-2, -752], [-36, -716], [-24, -690], 7, 3);
    // the pallu's border
    g.beginPath(); g.moveTo(-56, -700); g.lineTo(-70, -420); g.lineWidth = 4; g.stroke();
    g.save(); g.translate(6, -770); g.rotate(r.look);
    if (!r.slave) for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(30 + i * 9, -100 + i * 12, 4, 0, TAU); g.fill(); }   // lotus buds in the hair
    g.beginPath(); g.ellipse(-30, -84, 7, 2.6, 0.1, 0, TAU); g.fill();
    g.restore();
    g.restore();
    g.restore();
  }

  const bible = {
    name: 'Vinata, mother of Aruna and Garuda',
    role: 'Daughter of Daksha, wife of Kashyapa; she asks for two sons greater than Kadru\'s, breaks an egg too soon (Aruna), loses the wager and becomes Kadru\'s slave (CE 1.14–20).',
    palette: { fill: '#100a0c', inner: '#3a1a2a', rimDim: '#d890b0', rimBright: '#fff0f6', ornamentDim: '#e8b8c8', ornament: '#fff4f8' },
    proportions: 'CH.female: ≈ 990 units; hip 480. Softer and a little shorter than Kadru.',
    props: ['low knot at the nape wound with lotus buds', 'a lotus at the temple', 'small drop earrings', 'fine necklace, two bangles', 'sari, pallu over the near shoulder and falling in front', 'slave: no ornaments, the pallu over her head'],
    light: 'Lotus dawn-rose: fill #100a0c, inner #3a1a2a, rim #d890b0 → #fff0f6; ornaments #e8b8c8 → #fff4f8 (0.4–0.75).',
    poses: [{ name: 'stand' }, { name: 'walk' }, { name: 'sit' }, { name: 'speak', note: 'k' }, { name: 'cradle', note: 'k: an egg held to her breast' }, { name: 'reach', note: 'k: bending, a hand to the egg (breaks it)' }, { name: 'grieve', note: 'k' }, { name: 'bow', note: 'k' }, { name: 'any + slave: true', note: 'ornaments gone, pallu over the head' }],
    voice: 'vinata',
  };

  CH.define({
    id: 'vinata', bible, rig, shape, ornaments, defaultPose: 'stand',
    rule: {
      fill: '#100a0c', lit: '#7a4466', litGain: 0.8,
      rim: ['#d890b0', '#fff0f6'], inner: '#3a1a2a', innerA: [0.85, 0.4], glow: 0.75,
      ornament: ['#e8b8c8', '#fff4f8'], ornamentA: [0.4, 0.75],
    },
    bounds: () => [-480, -1060, 480, 30],
  });
  CH.ROSTER.push('vinata');
  void KIT;
})();
