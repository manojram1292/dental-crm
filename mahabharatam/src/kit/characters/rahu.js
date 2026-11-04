/*
 * CHARACTER · RAHU, the asura who drank the amrita · `rahu`
 *
 * Episode 15 (CE 1.17): disguised as a god, the Danava Rahu sat among the gods and drank the
 * amrita; while it was still in his throat the Sun and the Moon pointed him out, and Narayana's
 * discus cut off his head. The head, made immortal, roared up into the sky; from that day it
 * pursues the Sun and the Moon (the eclipses).
 *
 * Two forms, one module:
 *   `disguise` (default) · the body of a god (the deva figure, variant crown), but drawn in
 *     Rahu's own eclipse light, so the viewer can pick him out among the gods (as the Sun and
 *     the Moon did): pose.k (0..1) lets the disguise slip, his ember rim showing through.
 *   `head` · the severed head as the mural shows it, never gore: a great head in profile with
 *     a mane of smoke-flame, a jewelled crown, wide eyes and open, roaring jaws, ending at the
 *     neck in a band of white fire (the stroke of the discus), no blood. pose.roar (0..1).
 *
 * SIGNATURE LIGHT: eclipse. Fill #0a0608, lit #241018, inner #3a0a1a, rim #b02a4a → #ffb8c8,
 * glow 0.9, a dark corona; ornaments bronze-gold. Never the asuras' plain ember, never
 * Parashurama's blood-red.
 * Faces LEFT. (x, y) = feet (disguise) or the neck (head). scale 1 ≈ 1050 px / head ≈ 700 px.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, CH = KIT.characters;
  const { TAU, lerp, clamp, hash } = R;
  const { cut, ribbon, limbOutline } = CH;

  function rig(P) {
    const po = P.po;
    if (po.name === 'head') return { head: true, T: P.T, roar: clamp(po.roar ?? 1), look: P.ex.look || 0 };
    const D = CH.deva._def;
    const r = D.rig({ ...P, index: 4, po: { ...po, name: po.base || (po.name === 'disguise' ? 'stand' : po.name) } });
    r.slip = po.name === 'disguise' ? po.k : 0;
    return r;
  }

  function headShape(g, r) {
    const o = r.roar;
    // mane of smoke-flame streaming back (+x) and up
    for (let i = 0; i < 9; i++) { const a = -2.3 + i * 0.28; const p0 = [Math.cos(a) * 160 + 40, -300 + Math.sin(a) * 180]; const pl = ribbon(p0, a + 1.9, 260 + 30 * Math.sin(i * 2.1), r.T * 1.6, 26, i * 1.7, 10, -40); limbOutline(g, pl, pl.map((_, j) => lerp(80, 6, j / (pl.length - 1)))); cut(g); }
    // the head in profile: brow, eye socket, nose, open jaws with fangs
    g.moveTo(200, -40); g.bezierCurveTo(220, -200, 180, -420, 0, -470); g.bezierCurveTo(-120, -470, -200, -410, -230, -330);
    g.lineTo(-260, -300); g.lineTo(-240, -280); g.bezierCurveTo(-280, -250, -300, -220, -310, -200);   // nose
    g.lineTo(-250, -190 + 10 * o);                                                                     // upper jaw
    g.lineTo(-300, -170 + 40 * o); g.lineTo(-230, -160 + 50 * o); g.lineTo(-290, -120 + 80 * o);       // fangs
    g.lineTo(-170, -60 + 70 * o); g.bezierCurveTo(-120, -10 + 50 * o, 0, 10, 80, 0); g.closePath(); cut(g);
    // the crown
    g.moveTo(-160, -420); g.lineTo(60, -470); g.lineTo(60, -520); g.lineTo(-150, -470); g.closePath(); cut(g);
    for (let i = 0; i < 5; i++) { const x = -140 + i * 48, y = -470 + i * -12; g.moveTo(x - 14, y); g.lineTo(x, y - 70); g.lineTo(x + 14, y - 4); g.closePath(); cut(g); }
    g.moveTo(60, -220); g.ellipse(40, -210, 26, 40, 0.2, 0, TAU); cut(g);
  }

  function shape(g, color, P, r) {
    if (r.head) { g.fillStyle = color; g.beginPath(); headShape(g, r); g.fill(); return; }
    CH.deva._def.shape(g, color, P, r);
  }

  function ornaments(g, P, r, a, color) {
    if (a <= 0.01) return;
    if (!r.head) { CH.deva._def.ornaments(g, P, r, a, color); return; }
    g.globalAlpha *= a; g.fillStyle = color; g.strokeStyle = color;
    // the wide eye
    g.save(); g.fillStyle = '#ffe0c0'; g.beginPath(); g.ellipse(-150, -330, 30, 20, -0.2, 0, TAU); g.fill(); g.fillStyle = '#1a0408'; g.beginPath(); g.arc(-160, -330, 10, 0, TAU); g.fill(); g.restore();
    g.lineWidth = 8; g.beginPath(); g.moveTo(-190, -365); g.quadraticCurveTo(-150, -385, -100, -360); g.stroke();
    for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(-120 + i * 52, -470 - i * 13, 9, 0, TAU); g.fill(); }
    // the neck ends in a band of white fire: the stroke of the discus, not a wound
    g.save(); g.globalAlpha = a; g.strokeStyle = '#fff4e0'; g.shadowColor = '#ffd890'; g.shadowBlur = R.px(26 * P.s); g.lineWidth = 22; g.lineCap = 'round';
    g.beginPath(); g.moveTo(-170, -58); g.bezierCurveTo(-60, 0, 80, 10, 200, -40); g.stroke(); g.restore();
  }

  function before(ctx, P, r, k) {
    if (r.head) {
      // the dark corona of the eclipse behind the head
      const s = P.s;
      ctx.save(); ctx.translate(P.x, P.y - 260 * s);
      KIT.glow(ctx, 0, 0, 900 * s, '#b02a4a', 0.4 * k);
      ctx.globalAlpha = 0.45; ctx.fillStyle = '#05030a'; ctx.beginPath(); ctx.arc(0, 0, 420 * s, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#ff8aa0'; ctx.lineWidth = 6 * s; ctx.globalAlpha = 0.6; ctx.beginPath(); ctx.arc(0, 0, 430 * s, 0, TAU); ctx.stroke();
      ctx.restore();
    } else {
      // a faint eclipse-glow even in disguise (so the viewer can pick him out, as the Sun and Moon did), stronger as it slips
      KIT.glow(ctx, P.x, P.y - 600 * P.s, 520 * P.s, '#b02a4a', 0.22 + 0.4 * r.slip);
    }
  }

  function after(ctx, P, r) {
    if (!r.head) return;
    // smoke curling from the mane
    const s = P.s;
    for (let i = 0; i < 8; i++) { const life = (r.T * 0.6 + hash(i, 61)) % 1; KIT.glow(ctx, P.x + (160 + life * 300) * s * (P.flip ? -1 : 1), P.y + (-420 - life * 300 + hash(i, 62) * 200) * s, 120 * s * 2, '#3a1a2a', 0.5 * (1 - life), 'source-over'); }
  }

  CH.define({
    id: 'rahu', rig, shape, ornaments, before, after, defaultPose: 'disguise',
    bible: {
      name: 'Rahu',
      role: 'The Danava who, disguised as a god, drank the amrita; the Sun and the Moon pointed him out and Narayana\'s discus took his head; the immortal head pursues them still (CE 1.17).',
      palette: { fill: '#0a0608', lit: '#241018', inner: '#3a0a1a', rimDim: '#b02a4a', rimBright: '#ffb8c8', ornamentDim: '#b08040', ornament: '#ffd8a0' },
      proportions: 'Disguise: the deva figure (crown variant 4), ≈ 1050 units. Head: ≈ 700 units with the crown, a mane of smoke-flame.',
      props: ['a god\'s crown (the disguise)', 'the severed head: a mane of smoke-flame, a crown, wide eyes, roaring jaws, the neck ending in white fire (never blood)', 'a dark eclipse corona'],
      light: 'Eclipse: rim #b02a4a → #ffb8c8, glow 0.9, a dark corona. Never the plain ember of the asuras.',
      poses: [{ name: 'disguise', note: 'k: the disguise slips' }, { name: 'head', note: 'roar 0..1' }],
      voice: 'rahu',
    },
    rule: { fill: '#0a0608', lit: '#3a1626', litGain: 1.0, rim: ['#b02a4a', '#ffb8c8'], inner: '#3a0a1a', innerA: [0.85, 0.45], glow: 0.9, ornament: ['#b08040', '#ffd8a0'], ornamentA: [0.55, 0.9] },
    bounds: (P, r) => (r.head ? [-480, -900, 700, 120] : [-560, -1340, 480, 30]),
  });
  CH.ROSTER.push('rahu');
})();
