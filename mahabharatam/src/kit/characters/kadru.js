/*
 * CHARACTER · KADRU, mother of the serpents · `kadru`
 *
 * Episodes 8–10+ (CE 1.14–20): daughter of Daksha, wife of the sage Kashyapa. Granted a
 * boon, she asks for a thousand serpent sons of equal splendour. Later she wagers with
 * her sister-wife Vinata over the colour of the horse Uchchaihshravas's tail, and when
 * some of her sons refuse to cheat for her she curses them to burn in Janamejaya's
 * sacrifice ("a mother's curse").
 *
 * Tall, proud and handsome, with a sharp profile: hair in a high coiled bun crowned by a
 * small FIVE-HOODED SERPENT DIADEM (nagabhushana), serpent-coil armlets and a serpent
 * girdle, heavy round earrings, a necklace of green stones; an ankle-length sari whose
 * pallu falls straight down her back. Built on CH.female (paushya-queen.js).
 *
 * SIGNATURE LIGHT: tawny olive-gold ("kadru" means tawny) with venom-green jewels: fill
 * #0e0c06, inner #3a3008, rim #9a7a28 → #ece084, ornaments #3aa878 → #c8ffd8 (0.5–0.9:
 * the serpent jewels). Her eye glints green. Kin to Takshaka's green but never his cold
 * rim; set against Vinata's lotus-rose.
 *
 * Faces LEFT natively. Feet on (x, y). scale 1 ≈ 1040 px to the diadem.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, CH = KIT.characters;
  const { TAU, lerp } = R;
  const { cut, along, ik } = CH;
  const F = CH.female, PIV = F.PIV;

  function rig(P) {
    const r = F.rig(P);
    const po = P.po, k = po.k;
    if (po.name === 'curse') { r.hand = along(r.hand, [-230, -900], k); r.nearKind = 'point'; r.nearA = -Math.PI / 2 - 0.5; r.lean += 0.06 * k; r.look -= 0.08 * k; }
    if (po.name === 'point') { r.hand = along(r.hand, [-300, -760], k); r.nearKind = 'point'; r.nearA = Math.PI + 0.2; }
    if (po.name === 'cradle') { r.hand = along(r.hand, [-120, -600], k); r.farHand = along(r.farHand, [-90, -640], k); r.nearKind = 'cup'; r.farKind = 'cup'; r.look += 0.18 * k; }
    r.wrath = P.ex.mood === 'wrath';
    const c = Math.cos(-r.lean), s = Math.sin(-r.lean);
    r.rot = (p) => [p[0] * c - (p[1] - PIV) * s, p[0] * s + (p[1] - PIV) * c + PIV];
    r.shN = r.rot([2, -748]); r.shF = r.rot([24, -752]);
    return r;
  }

  function headPath(g, r) {
    g.save(); g.translate(6, -770); g.rotate(r.look);
    F.face(g);
    // hair: a high coiled bun, the hair falling behind to the shoulders
    g.moveTo(-42, -106); g.bezierCurveTo(-40, -150, 30, -160, 50, -120); g.bezierCurveTo(70, -70, 64, 0, 52, 40); g.lineTo(26, 30); g.bezierCurveTo(30, -20, 20, -80, -42, -106); g.closePath(); cut(g);
    g.moveTo(40, -170); g.ellipse(14, -170, 30, 26, 0.2, 0, TAU); cut(g);
    // the five-hooded serpent diadem rising from the bun
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i - 2) * 0.36, b = [10 + Math.cos(a) * 30, -186 + Math.sin(a) * 30], tip = [10 + Math.cos(a) * 74, -186 + Math.sin(a) * 74];
      g.moveTo(b[0] - 5, b[1]); g.lineTo(tip[0] - 4, tip[1] + 12); g.lineTo(tip[0] + 4, tip[1] + 12); g.lineTo(b[0] + 5, b[1]); g.closePath(); cut(g);
      g.moveTo(tip[0] + 13, tip[1]); g.ellipse(tip[0], tip[1], 13, 16, a + Math.PI / 2, 0, TAU); cut(g);
    }
    // heavy round earring
    g.moveTo(30, -36); g.arc(16, -36, 14, 0, TAU); cut(g);
    if (r.speak > 0.02) {
      g.save(); g.globalCompositeOperation = 'destination-out';
      const o = 3.5 * r.speak;
      g.moveTo(-28, -32); g.lineTo(-50, -34 - o); g.lineTo(-50, -28 + o * 0.6); g.closePath(); cut(g);
      g.restore();
    }
    g.restore();
  }

  function pallu(g, r) {
    const sw = Math.sin(r.T * 1.6) * 6 * r.wind + r.st * 14;
    g.moveTo(-10, -760); g.bezierCurveTo(50, -770, 70, -700, 74, -600); g.lineTo(90 + sw, -360); g.lineTo(46 + sw * 0.6, -350); g.bezierCurveTo(40, -480, 30, -640, -20, -720); g.closePath(); cut(g);
  }

  function shape(g, color, P, r) {
    g.translate(0, r.bob);
    g.fillStyle = color;
    g.save(); g.translate(0, r.drop);
    g.beginPath(); F.arms(g, r, false); g.fill();
    g.restore();
    g.beginPath(); CH.legs(g, r, [60, 38, 20]); g.fill();
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
    g.globalAlpha *= a;
    g.strokeStyle = color; g.fillStyle = color; g.lineCap = 'round';
    g.save(); g.translate(0, r.drop);
    g.save(); g.translate(0, PIV); g.rotate(-r.lean); g.translate(0, -PIV);
    CH.beads(g, [-2, -752], [-48, -690], [-30, -640], 9, 4);                       // green stones
    for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(-34, -462 + i * 9); g.quadraticCurveTo(10, -450 + i * 9, 56, -466 + i * 9); g.lineWidth = 3; g.stroke(); }   // serpent girdle
    g.save(); g.translate(6, -770); g.rotate(r.look);
    for (let i = 0; i < 5; i++) { const a2 = -Math.PI / 2 + (i - 2) * 0.36; g.beginPath(); g.arc(10 + Math.cos(a2) * 74, -186 + Math.sin(a2) * 74, 3.5, 0, TAU); g.fill(); }   // hood jewels
    g.beginPath(); g.ellipse(-30, -84, 7, 2.6, 0.1, 0, TAU); g.fill();
    g.restore();
    g.restore();
    // serpent-coil armlet on the near arm
    const el = ik(r.shN, r.hand, 160, 148, -1), p = [lerp(r.shN[0], el[0], 0.6), lerp(r.shN[1], el[1], 0.6)];
    for (let i = 0; i < 3; i++) { g.beginPath(); g.ellipse(p[0], p[1] + i * 8 - 8, 22, 6, 0.3, 0, TAU); g.lineWidth = 2.4; g.stroke(); }
    g.restore();
  }

  function after(ctx, P, r, k) {
    const sx = P.flip ? -P.s : P.s;
    const e = r.rot([6 - 30, -770 - 84]);
    KIT.glow(ctx, P.x + e[0] * sx, P.y + (e[1] + r.bob + r.drop) * P.s, (r.wrath ? 60 : 30) * P.s, '#60ffb0', (r.wrath ? 0.9 : 0.5) * k);
  }

  const bible = {
    name: 'Kadru, mother of the serpents',
    role: 'Daughter of Daksha, wife of Kashyapa; she asks for a thousand serpent sons, wagers with Vinata over the horse\'s tail, and curses her sons who refuse to cheat for her (CE 1.14–20).',
    palette: { fill: '#0e0c06', inner: '#3a3008', rimDim: '#9a7a28', rimBright: '#ece084', ornamentDim: '#3aa878', ornament: '#c8ffd8' },
    proportions: 'CH.female: ≈ 1040 units to the diadem; hip 480. A little taller and sharper than Vinata.',
    props: ['high coiled bun', 'five-hooded serpent diadem', 'heavy round earrings', 'necklace of green stones', 'serpent-coil armlets and girdle', 'sari with the pallu falling straight down her back'],
    light: 'Tawny olive-gold with venom-green jewels: fill #0e0c06, inner #3a3008, rim #9a7a28 → #ece084; ornaments #3aa878 → #c8ffd8 (0.5–0.9); a green glint in the eye (wrath: brighter).',
    poses: [{ name: 'stand' }, { name: 'walk' }, { name: 'sit' }, { name: 'speak', note: 'k' }, { name: 'point', note: 'k: the wager' }, { name: 'curse', note: 'k: forefinger raised high' }, { name: 'cradle', note: 'k: an egg held to her breast' }],
    voice: 'kadru',
  };

  CH.define({
    id: 'kadru', bible, rig, shape, ornaments, after, defaultPose: 'stand',
    rule: {
      fill: '#0e0c06', lit: '#2e2810', litGain: 0.8,
      rim: ['#9a7a28', '#ece084'], inner: '#3a3008', innerA: [0.85, 0.4], glow: 0.8,
      ornament: ['#3aa878', '#c8ffd8'], ornamentA: [0.5, 0.9],
    },
    bounds: () => [-460, -1120, 480, 30],
  });
  CH.ROSTER.push('kadru');
})();
