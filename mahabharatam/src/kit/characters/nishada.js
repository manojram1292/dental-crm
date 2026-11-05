/*
 * CHARACTERS · THE NISHADAS of the ocean's bay · `nishada` (men, index 0..3), `nishadi` (the brahmin's
 * Nishada wife) · and THE BRAHMIN in Garuda's throat · `brahmin`
 *
 * Episodes 21–22 (CE 1.24–25): Vinata sends Garuda to eat the Nishadas, a people who live in a remote bay of
 * the ocean; among those he swallows is a brahmin, who burns his throat like a coal; the brahmin will not come
 * out without his Nishadi wife, and Garuda lets both go. Drawn with respect: a fishing people at their work
 * and their homes, not monsters (the epic's own word for them is a people, a jati).
 *
 * BUILT ON shared bodies (the epic names many people who appear once; SERIES.md asks for shared rigs with
 * fixed variations): `nishada` on the young man's body of `uttanka` (his staff becomes a fishing spear; the
 * shaven head gets long hair bound with a cord; a net over the shoulder, by index), `nishadi` on the sari'd
 * figure of `gurupatni` (shell necklace; no lamp), `brahmin` on `vaishampayana` (the sacred thread, a
 * forehead mark). Each has its OWN light:
 *   nishada / nishadi  MOON-ON-WATER: fill #0a1014, lit #23343a, rim #7ab8c0 → #e0f6f4, ornaments shell-white
 *   brahmin            HEARTH-IVORY with an inner coal: fill #120c06, lit #3a2a16, rim #e8c890 → #fff6dc;
 *                      pose.coal (0..1) lights him from inside like the live coal Vinata described.
 * Face LEFT. (x, y) = feet. scale 1 ≈ 1000 px.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, CH = KIT.characters;
  const { TAU, clamp } = R;
  const U = CH.uttanka._def, GP = CH.gurupatni._def, VA = CH.vaishampayana._def;

  // ── nishada ──────────────────────────────────────────────────────────────
  function nRig(P) { const r = U.rig(P); r.idx = (P.index ?? 0) % 4; return r; }
  function nShape(g, color, P, r) {
    U.shape(g, color, P, r);
    // long hair bound at the nape (over the shaven head of the base body), drawn in the same silhouette
    g.save(); g.translate(0, r.bob + r.drop); g.translate(0, -485); g.rotate(-(r.lean || 0)); g.translate(0, 485); g.fillStyle = color;
    g.beginPath(); g.ellipse(34, -912, 46, 40, 0, 0, TAU); g.fill();
    g.beginPath(); g.moveTo(50, -920); g.quadraticCurveTo(110, -860, 92, -760 - r.idx * 10); g.lineTo(70, -770); g.quadraticCurveTo(80, -850, 34, -900); g.fill();
    if (r.idx % 2 === 0) { // a rolled net over the far shoulder
      g.beginPath(); g.ellipse(70, -700, 46, 96, 0.3, 0, TAU); g.fill();
    }
    g.restore();
  }
  function nOrn(g, P, r, a, color) {
    U.ornaments(g, P, r, a, color);
    g.save(); g.translate(0, r.bob + r.drop); g.translate(0, -485); g.rotate(-(r.lean || 0)); g.translate(0, 485); g.globalAlpha *= a; g.strokeStyle = color; g.lineWidth = 3;
    g.beginPath(); g.moveTo(-10, -930); g.quadraticCurveTo(30, -956, 76, -920); g.stroke();   // the hair cord
    if (r.idx % 2 === 0) { for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(40 + i * 14, -790); g.lineTo(100 + i * 10, -610); g.stroke(); } }
    for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(-30 + i * 14, -770 + Math.abs(i - 2) * 4, 4, 0, TAU); g.fill(); }  // shell beads
    g.restore();
  }
  CH.define({
    id: 'nishada', rig: nRig, shape: nShape, ornaments: nOrn, defaultPose: 'stand',
    bible: {
      name: 'The Nishadas (a fishing people of the ocean\'s bay)',
      role: 'Vinata sends Garuda to eat the Nishadas who live in a remote bay; he swallows a crowd of them, and a brahmin among them burns his throat (CE 1.24–25).',
      palette: { fill: '#0a1014', lit: '#23343a', inner: '#1a3a40', rimDim: '#7ab8c0', rimBright: '#e0f6f4', ornamentDim: '#a8c8c0', ornament: '#f4fff8' },
      proportions: 'The young man\'s body (≈ 1000 units); long hair bound at the nape; a fishing spear in the far hand; a rolled net over the shoulder (even index).',
      props: ['fishing spear', 'rolled net (index 0, 2)', 'hair cord', 'shell beads'],
      light: 'Moon on water: rim #7ab8c0 → #e0f6f4, shell-white ornaments; never Takshaka\'s cold green.',
      poses: [{ name: 'stand' }, { name: 'walk' }, { name: 'run', note: 'phase' }, { name: 'crouch', note: 'k' }, { name: 'point', note: 'k' }],
      voice: null,
    },
    rule: { fill: '#0a1014', lit: '#23343a', litGain: 0.9, rim: ['#7ab8c0', '#e0f6f4'], inner: '#1a3a40', innerA: [0.8, 0.4], glow: 0.6, ornament: ['#a8c8c0', '#f4fff8'], ornamentA: [0.45, 0.85] },
    bounds: () => [-560, -1360, 460, 30],
  });
  CH.ROSTER.push('nishada');

  // ── nishadi (the brahmin's wife) ─────────────────────────────────────────
  CH.define({
    id: 'nishadi', rig: GP.rig, shape: GP.shape,
    ornaments: (g, P, r, a, color) => {
      GP.ornaments(g, P, r, a, color);
      g.save(); g.globalAlpha *= a; g.fillStyle = color;
      for (let i = 0; i < 7; i++) { g.beginPath(); g.arc(-36 + i * 11, -700 + Math.abs(i - 3) * 6, 5, 0, TAU); g.fill(); }   // shell necklace
      g.restore();
    },
    defaultPose: 'stand',
    bible: {
      name: 'The Nishadi, the brahmin\'s wife',
      role: 'A Nishada woman married to a brahmin; he will not leave Garuda\'s throat without her, and Garuda lets them both go (CE 1.25).',
      palette: { fill: '#0a1014', lit: '#23343a', inner: '#1a3a40', rimDim: '#7ab8c0', rimBright: '#e0f6f4', ornamentDim: '#a8c8c0', ornament: '#f4fff8' },
      proportions: 'The sari\'d figure (≈ 1000 units), the sari\'s end over her head; a shell necklace.',
      props: ['plain sari, its end over her head', 'shell necklace'],
      light: 'Moon on water, like her people.',
      poses: [{ name: 'stand' }, { name: 'walk' }, { name: 'speak', note: 'k' }, { name: 'bless', note: 'k' }],
      voice: null,
    },
    rule: { fill: '#0a1014', lit: '#2a3a40', litGain: 0.9, rim: ['#7ab8c0', '#e0f6f4'], inner: '#1a3a40', innerA: [0.8, 0.4], glow: 0.6, ornament: ['#a8c8c0', '#f4fff8'], ornamentA: [0.45, 0.85] },
    bounds: () => [-440, -1000, 480, 30],
  });
  CH.ROSTER.push('nishadi');

  // ── the brahmin ──────────────────────────────────────────────────────────
  function bBefore(ctx, P, r, k) {
    const c = clamp(P.po.coal || 0);
    if (c > 0.01) KIT.glow(ctx, P.x, P.y - 600 * P.s, 700 * P.s, '#ff6a1a', 0.75 * c * (0.85 + 0.15 * Math.sin(r.T * 11 || 0)));
  }
  CH.define({
    id: 'brahmin', rig: (P) => { const r = VA.rig(P); r.T = P.T; return r; }, shape: VA.shape,
    ornaments: (g, P, r, a, color) => {
      VA.ornaments(g, P, r, a, color);
      g.save(); g.globalAlpha *= a; g.strokeStyle = color; g.lineWidth = 3;
      g.beginPath(); g.moveTo(26, -786); g.quadraticCurveTo(-36, -640, -36, -488); g.stroke();   // the sacred thread
      g.restore();
    },
    before: bBefore, defaultPose: 'stand',
    bible: {
      name: 'The brahmin in Garuda\'s throat',
      role: 'Swallowed with the Nishadas, he burns Garuda\'s throat like a live coal; offered his freedom, he will not go without his Nishadi wife (CE 1.25).',
      palette: { fill: '#120c06', lit: '#3a2a16', inner: '#5a3a1a', rimDim: '#e8c890', rimBright: '#fff6dc', ornamentDim: '#d0a860', ornament: '#fff0c8' },
      proportions: 'The young bard\'s body (≈ 1000 units) with the sacred thread.',
      props: ['sacred thread', 'forehead mark (the base body\'s)'],
      light: 'Hearth-ivory; pose.coal (0..1) lights him from inside like a live coal.',
      poses: [{ name: 'stand' }, { name: 'walk' }, { name: 'speak', note: 'k' }, { name: 'bless', note: 'k' }, { name: 'any + coal', note: '0..1: the coal-glow in the throat' }],
      voice: 'brahmin',
    },
    rule: { fill: '#120c06', lit: '#3a2a16', litGain: 0.9, rim: ['#e8c890', '#fff6dc'], inner: '#5a3a1a', innerA: [0.8, 0.4], glow: 0.8, ornament: ['#d0a860', '#fff0c8'], ornamentA: [0.5, 0.9] },
    bounds: () => [-520, -1300, 480, 30],
  });
  CH.ROSTER.push('brahmin');
})();
