/*
 * CHARACTERS · THE DEVAS (gods) `deva` and THE ASURAS (Danavas, Daityas) `asura`
 *
 * Episodes 11–16 (CE 1.15–17): the two hosts, half-brothers and rivals, churn the ocean
 * together and then fight for the amrita. Both are profile figures (face LEFT natively)
 * on one shared warrior body, so they read as kin; each host has six fixed variants by
 * `index` (headdress, build and weapon), so a crowd never repeats one silhouette.
 *
 * DEVAS: slim and upright, beardless, jewelled crowns of six kinds (kirita, karanda pot-
 * crown, jata-mukuta, plumed crest, flame crest, lotus crest), a small pale prabha behind
 * the head, a flying sash. SIGNATURE LIGHT: pearl-gold: fill #12101a, lit #2c2840, inner
 * #3a3460, rim #ffe6a0 → #ffffff, glow 0.7, ornaments #f0c860 → #fff8d8.
 *
 * ASURAS: broader (body ×1.12), heavy brows, a thick moustache and one small fang, wild
 * flame-shaped locks or spiked/horned helmets; maces, clubs, swords. Given their dignity:
 * they are kings and warriors, not monsters. SIGNATURE LIGHT: ember: fill #100606, lit
 * #301010, inner #4a120a, rim #e0502a → #ffc090, glow 0.6, bronze ornaments #a07040 →
 * #f0c080. Never Aruna's luminous red halo, never Parashurama's blood-red.
 *
 * Poses: stand · walk · pull (k, phase: hauling the serpent-rope, leaning back, hands at
 * chest height in front) · raise (k: weapon high) · strike (k) · point (k) · bow (k) ·
 * cower (k). (x, y) = feet. scale 1 ≈ 1050 px (deva) / 1100 px (asura) to the crown.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, CH = KIT.characters;
  const { TAU, lerp } = R;
  const { cut, limb, limbOutline, ik, hand, along, ribbon } = CH;

  const D = { hip: 500, thigh: 252, shin: 236, foot: 74, sitHip: 150 };
  const PIV = -500;

  function makeRig(kind) {
    return function rig(P) {
      const po = P.po, k = po.k;
      const r = CH.profileRig(po, D);
      r.kind = kind; r.v = ((P.index % 6) + 6) % 6; r.T = P.T;
      r.look = P.ex.look || 0; r.speak = P.ex.speak || 0;
      r.lean = r.st * 0.04;
      let nh = [-60, -560], fh = [40, -540], wa = -Math.PI / 2 + 0.2;
      if (po.name === 'pull') {
        const ph = Math.sin((po.phase || 0));
        r.lean = -(0.2 + 0.08 * ph) * k;                // leaning back against the rope
        nh = along(nh, [-230, -640 - 20 * ph], k); fh = along(fh, [-150, -660 - 20 * ph], k);
      }
      if (po.name === 'raise') { nh = along(nh, [-80, -1160], k); wa = lerp(wa, -Math.PI / 2, k); }
      if (po.name === 'strike') { nh = along([-80, -1120], [-330, -640], k); wa = lerp(-Math.PI / 2, -0.2, k); r.lean = 0.18 * k; }
      if (po.name === 'point') { fh = along(fh, [-330, -830], k); }
      if (po.name === 'bow') { r.lean = 0.35 * k; r.look += 0.2 * k; }
      if (po.name === 'cower') { r.lean = -0.15 * k; nh = along(nh, [-120, -900], k); fh = along(fh, [-60, -880], k); r.look -= 0.25 * k; }
      r.hand = nh; r.farHand = fh; r.wa = wa; r.pull = po.name === 'pull' ? k : 0;
      const c = Math.cos(-r.lean), s = Math.sin(-r.lean);
      r.rot = (p) => [p[0] * c - (p[1] - PIV) * s, p[0] * s + (p[1] - PIV) * c + PIV];
      r.shN = r.rot([4, -790]); r.shF = r.rot([30, -794]);
      if (po.name === 'bow') { r.hand = r.rot(r.hand); r.farHand = r.rot(r.farHand); }
      return r;
    };
  }

  function headPath(g, r) {
    const asura = r.kind === 'asura', v = r.v;
    g.save(); g.translate(8, -820); g.rotate(r.look);
    // the face in profile
    g.moveTo(34, 8);
    g.bezierCurveTo(44, -26, 54, -66, 50, -100);
    g.bezierCurveTo(46, -128, 30, -142, 0, -144);
    g.lineTo(-46, -136);
    if (asura) { g.lineTo(-58, -120); g.lineTo(-52, -108); } else g.lineTo(-50, -110);   // heavy brow
    g.lineTo(-48, -96); g.bezierCurveTo(-56, -86, -64, -76, -70, -64); g.lineTo(-58, -60);
    if (asura) { g.lineTo(-84, -50); g.quadraticCurveTo(-50, -40, -30, -58); g.lineTo(-58, -44); }   // thick moustache
    g.lineTo(-60, -42); g.bezierCurveTo(-62, -28, -56, -12, -36, -4); g.bezierCurveTo(-18, 2, -4, 6, 6, 14);
    g.closePath(); cut(g);
    if (asura) { g.moveTo(-46, -40); g.lineTo(-40, -18); g.lineTo(-36, -40); g.closePath(); cut(g); }   // a small fang
    // earring
    g.moveTo(34, -46); g.ellipse(20, -38, 14, 20, 0.2, 0, TAU); cut(g);
    // headdress by variant
    const band = () => { g.moveTo(-52, -130); g.lineTo(54, -130); g.lineTo(54, -152); g.lineTo(-50, -154); g.closePath(); cut(g); };
    if (!asura) {
      band();
      if (v === 0) { g.moveTo(-40, -150); g.lineTo(-30, -280); g.lineTo(30, -280); g.lineTo(42, -150); g.closePath(); cut(g); g.moveTo(-16, -280); g.lineTo(0, -320); g.lineTo(16, -280); g.closePath(); cut(g); }
      else if (v === 1) { for (const [y, w] of [[-150, 44], [-196, 34], [-236, 24], [-268, 14]]) { g.moveTo(-w, y); g.quadraticCurveTo(0, y - 60, w, y); g.closePath(); cut(g); } }
      else if (v === 2) { g.moveTo(-34, -150); g.quadraticCurveTo(-40, -250, 0, -300); g.quadraticCurveTo(40, -250, 34, -150); g.closePath(); cut(g); g.moveTo(26, -290); g.arc(0, -290, 26, 0, TAU); cut(g); }
      else if (v === 3) { g.moveTo(-30, -150); g.lineTo(-20, -230); g.lineTo(30, -230); g.lineTo(36, -150); g.closePath(); cut(g); const pl = ribbon([10, -230], -0.6, 160, r.T, 10, 2.2, 10, -30); limbOutline(g, pl, pl.map((_, j) => lerp(26, 6, j / (pl.length - 1)))); cut(g); }
      else if (v === 4) { for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.3; g.moveTo(0, -150); g.quadraticCurveTo(Math.cos(a - 0.2) * 70, -150 + Math.sin(a - 0.2) * 70, Math.cos(a) * 120, -150 + Math.sin(a) * 120); g.quadraticCurveTo(Math.cos(a + 0.25) * 60, -150 + Math.sin(a + 0.25) * 60, 0, -150); cut(g); } }
      else { for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * 0.32; g.moveTo(0, -150); g.quadraticCurveTo(Math.cos(a) * 60 - Math.sin(a) * 26, -150 + Math.sin(a) * 60 + Math.cos(a) * 26, Math.cos(a) * 92, -150 + Math.sin(a) * 92); g.quadraticCurveTo(Math.cos(a) * 60 + Math.sin(a) * 26, -150 + Math.sin(a) * 60 - Math.cos(a) * 26, 0, -150); cut(g); } }
    } else {
      if (v === 0 || v === 3) {
        // wild locks streaming back like flames
        for (let i = 0; i < 6; i++) { const a = -2.2 + i * 0.32; const p0 = [Math.cos(a) * 60 + 10, -90 + Math.sin(a) * 60]; const pl = ribbon(p0, a + 0.9 + 0.4, 120 + i * 14, r.T, 12, i * 1.3, 8, -10); limbOutline(g, pl, pl.map((_, j) => lerp(40, 4, j / (pl.length - 1)))); cut(g); }
        g.moveTo(-50, -130); g.quadraticCurveTo(0, -176, 60, -120); g.lineTo(60, -90); g.lineTo(-50, -110); g.closePath(); cut(g);
        if (v === 3) { g.moveTo(-10, -150); g.lineTo(-30, -250); g.lineTo(10, -170); g.closePath(); cut(g); }
      } else if (v === 1 || v === 4) {
        // a domed helmet with horns curving forward
        g.moveTo(-56, -120); g.quadraticCurveTo(-50, -200, 0, -206); g.quadraticCurveTo(56, -200, 60, -110); g.closePath(); cut(g);
        for (const s of v === 1 ? [1] : [1, -0.6]) { g.moveTo(-20, -190); g.quadraticCurveTo(-80 * s, -260, -120 * s, -230); g.quadraticCurveTo(-80 * s, -240, -4, -170); g.closePath(); cut(g); }
      } else {
        // a broad crown of spikes
        band();
        for (let i = 0; i < 6; i++) { const x = -48 + i * 19; g.moveTo(x - 9, -150); g.lineTo(x, -230 - (i % 2) * 30); g.lineTo(x + 9, -150); g.closePath(); cut(g); }
      }
    }
    if (r.speak > 0.02) { g.save(); g.globalCompositeOperation = 'destination-out'; const o = 4 * r.speak; g.moveTo(-36, -34); g.lineTo(-60, -36 - o); g.lineTo(-60, -30 + o * 0.6); g.closePath(); cut(g); g.restore(); }
    g.restore();
  }

  function weaponPath(g, r) {
    const asura = r.kind === 'asura', v = r.v, c = r.hand;
    const d = [Math.cos(r.wa), Math.sin(r.wa)], n = [-d[1], d[0]];
    const P = (a, b) => [c[0] + d[0] * a + n[0] * b, c[1] + d[1] * a + n[1] * b];
    const w = asura ? ['mace', 'sword', 'spear', 'club', 'mace', 'sword'][v] : ['spear', 'lotus', 'sword', 'spear', 'bow', 'lotus'][v];
    if (r.pull > 0.5) return;   // both hands on the rope
    if (w === 'spear') { limb(g, [P(-260, 0), P(380, 0)], [14, 12]); g.moveTo(...P(380, -18)); g.lineTo(...P(470, 0)); g.lineTo(...P(380, 18)); g.closePath(); cut(g); }
    else if (w === 'sword') { limb(g, [P(-40, 0), P(20, 0)], [20, 20]); g.moveTo(...P(20, -40)); g.lineTo(...P(30, -40)); g.lineTo(...P(30, 40)); g.lineTo(...P(20, 40)); g.closePath(); cut(g); g.moveTo(...P(30, -14)); g.lineTo(...P(300, -8)); g.lineTo(...P(340, 0)); g.lineTo(...P(30, 14)); g.closePath(); cut(g); }
    else if (w === 'mace') { limb(g, [P(-50, 0), P(240, 0)], [22, 22]); g.moveTo(...P(330, 0)); g.ellipse(...P(300, 0), 70, 52, r.wa, 0, TAU); cut(g); }
    else if (w === 'club') { limb(g, [P(-40, 0), P(300, 0)], [24, 56]); }
    else if (w === 'lotus') { limb(g, [P(0, 0), P(200, 0)], [8, 8]); const t = P(220, 0); for (let i = 0; i < 5; i++) { const a = r.wa + (i - 2) * 0.45; g.moveTo(t[0], t[1]); g.quadraticCurveTo(t[0] + Math.cos(a - 0.3) * 40, t[1] + Math.sin(a - 0.3) * 40, t[0] + Math.cos(a) * 60, t[1] + Math.sin(a) * 60); g.quadraticCurveTo(t[0] + Math.cos(a + 0.3) * 40, t[1] + Math.sin(a + 0.3) * 40, t[0], t[1]); cut(g); } }
    else if (w === 'bow') { g.moveTo(...P(0, -320)); g.quadraticCurveTo(...P(-120, 0), ...P(0, 320)); g.lineTo(...P(-14, 320)); g.quadraticCurveTo(...P(-140, 0), ...P(-14, -320)); g.closePath(); cut(g); }
  }

  function armsPath(g, r, near) {
    const sh = near ? r.shN : r.shF, tgt = near ? r.hand : r.farHand;
    const el = ik(sh, tgt, 176, 164, near ? -1 : 1);
    const w = r.kind === 'asura' ? 1.15 : 1;
    limb(g, [sh, el, tgt], [64 * w, 44 * w, 30 * w]);
    hand(g, tgt, near ? r.wa + Math.PI / 2 : (r.pull ? Math.PI : Math.PI / 2), 38, 'fist');
  }

  function sashPath(g, r) {
    const pts = ribbon([50, -510], 1.15, 240, r.T, 14, 3.1 + r.v);
    limbOutline(g, pts, pts.map((_, i) => lerp(30, 8, i / (pts.length - 1)))); cut(g);
  }

  function upperT(g, r) { g.translate(0, PIV); g.rotate(-r.lean); g.translate(0, -PIV); }

  function shape(g, color, P, r) {
    const wide = r.kind === 'asura' ? 1.12 : 1;
    g.translate(0, r.bob);
    g.scale(wide, 1);
    g.fillStyle = color;
    g.save(); g.translate(0, r.drop);
    g.beginPath(); armsPath(g, r, false); g.fill();
    g.beginPath(); sashPath(g, r); g.fill();
    g.restore();
    g.beginPath(); CH.legs(g, r, [76, 46, 24]); g.fill();
    g.beginPath(); CH.lowerCloth(g, r, { waistY: -500, waistF: -42, waistB: 56, len: r.kind === 'asura' ? 'knee' : 'ankle', flare: 1.1, pleats: true, T: r.T, wind: 0.6 }); g.fill();
    g.save(); g.translate(0, r.drop);
    g.save(); upperT(g, r);
    g.beginPath(); CH.torso(g, { waistY: -490, neckY: -814, chestY: -700, front: -60, back: 66, waistF: -40, waistB: 56, neckF: -6, neckB: 32, pec: 12, lat: 10 }); g.fill();
    g.beginPath(); headPath(g, r); g.fill();
    g.restore();
    g.beginPath(); weaponPath(g, r); g.fill();
    g.beginPath(); armsPath(g, r, true); g.fill();
    g.restore();
  }

  function ornaments(g, P, r, a, color) {
    if (a <= 0.01) return;
    const wide = r.kind === 'asura' ? 1.12 : 1;
    g.translate(0, r.bob); g.scale(wide, 1);
    g.globalAlpha *= a; g.strokeStyle = color; g.fillStyle = color; g.lineCap = 'round';
    g.save(); g.translate(0, r.drop); upperT(g, r);
    g.beginPath(); g.moveTo(-52, -790); g.quadraticCurveTo(-20, -730, 30, -790); g.lineWidth = 9; g.stroke();
    g.beginPath(); g.moveTo(30, -800); g.quadraticCurveTo(-40, -660, -40, -500); g.lineWidth = 3; g.stroke();
    g.beginPath(); g.moveTo(-40, -496); g.lineTo(56, -496); g.lineWidth = 7; g.stroke();
    g.restore();
  }

  function prabha(ctx, P, r, k) {
    if (r.kind !== 'deva') return;
    const sx = P.flip ? -P.s : P.s;
    const hp = r.rot([30, -900]);
    const x = P.x + hp[0] * sx, y = P.y + (hp[1] + r.bob + r.drop) * P.s;
    KIT.glow(ctx, x, y, 260 * P.s, '#ffe6a0', 0.35 * (0.6 + 0.4 * k));
    ctx.save(); ctx.globalAlpha = 0.75 * (0.6 + 0.4 * k);
    ctx.strokeStyle = '#ffe6a0'; ctx.lineWidth = 5 * P.s; ctx.beginPath(); ctx.arc(x, y, 126 * P.s, 0, TAU); ctx.stroke();
    ctx.globalAlpha *= 0.5; ctx.lineWidth = 2 * P.s; ctx.beginPath(); ctx.arc(x, y, 142 * P.s, 0, TAU); ctx.stroke();
    ctx.restore();
  }

  const common = { shape, ornaments, before: prabha, defaultPose: 'stand', bounds: () => [-560, -1340, 480, 30] };
  const poses = [{ name: 'stand' }, { name: 'walk' }, { name: 'pull', note: 'k, phase: hauling the rope' }, { name: 'raise', note: 'k' }, { name: 'strike', note: 'k' }, { name: 'point', note: 'k' }, { name: 'bow', note: 'k' }, { name: 'cower', note: 'k' }];

  CH.define({
    id: 'deva', rig: makeRig('deva'), ...common,
    bible: {
      name: 'The devas (gods)',
      role: 'The gods of heaven, Indra\'s host: they churn the ocean with the asuras and fight them for the amrita (CE 1.15–17). Six fixed variants by index.',
      palette: { fill: '#12101a', lit: '#2c2840', inner: '#3a3460', rimDim: '#ffe6a0', rimBright: '#ffffff', ornamentDim: '#f0c860', ornament: '#fff8d8' },
      proportions: 'Shared warrior body: ≈ 1050 units to the crown, hip 500. Slim and upright.',
      props: ['six crowns: kirita, karanda pot-crown, jata-mukuta, plumed crest, flame crest, lotus crest', 'a small pale prabha behind the head', 'spear, lotus, sword or bow by index', 'flying sash'],
      light: 'Pearl-gold: rim #ffe6a0 → #ffffff, glow 0.7, gold ornaments; a pale prabha behind each head.',
      poses, voice: 'devas',
    },
    rule: { fill: '#12101a', lit: '#2c2840', litGain: 0.8, rim: ['#ffe6a0', '#ffffff'], inner: '#3a3460', innerA: [0.8, 0.45], glow: 0.7, ornament: ['#f0c860', '#fff8d8'], ornamentA: [0.55, 0.9] },
  });
  CH.define({
    id: 'asura', rig: makeRig('asura'), ...common,
    bible: {
      name: 'The asuras (Danavas)',
      role: 'The gods\' half-brothers and rivals: they churn with the gods, clamour for the amrita and lose it to the enchantress (CE 1.15–17). Six fixed variants by index.',
      palette: { fill: '#100606', lit: '#301010', inner: '#4a120a', rimDim: '#e0502a', rimBright: '#ffc090', ornamentDim: '#a07040', ornament: '#f0c080' },
      proportions: 'The same body ×1.12 wide; heavy brows, moustache and a small fang; knee-length cloth.',
      props: ['flame-locks, horned helmets or spiked crowns by index', 'mace, sword, spear or club'],
      light: 'Ember: rim #e0502a → #ffc090, glow 0.6, bronze ornaments. Never Aruna\'s luminous halo, never Parashurama\'s blood-red.',
      poses, voice: 'asuras',
    },
    rule: { fill: '#100606', lit: '#301010', litGain: 0.8, rim: ['#e0502a', '#ffc090'], inner: '#4a120a', innerA: [0.85, 0.45], glow: 0.6, ornament: ['#a07040', '#f0c080'], ornamentA: [0.5, 0.85] },
  });
  CH.ROSTER.push('deva', 'asura');
})();
