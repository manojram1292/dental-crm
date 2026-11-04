/*
 * CHARACTERS · WHAT ROSE FROM THE OCEAN (episode 13; CE 1.16): the Moon `chandra`, Shri (Lakshmi)
 * `lakshmi`, the goddess of wine (Sura Devi, Varuni) `sura`, and Dhanvantari the healer
 * `dhanvantari`. (The white horse is `horse`; the Kaustubha jewel is worn by `vishnu`.)
 *
 * All four are drawn FRONTALLY, as temple icons rising out of the white sea, on one shared
 * frontal body (a different crown, garment, hands and palette each), so the procession of
 * wonders reads as a set and each one is still unmistakable:
 *
 *   CHANDRA, the Moon: a serene youth inside a great silver disc, a crescent at his crown,
 *     a white lotus in each raised hand (the Moon's answer to Surya's sun-disc).
 *     LIGHT: moon-silver. Fill #0c1420, lit #2a3a58, inner #3a4a70, rim #c8dcff → #ffffff,
 *     glow 1.0, a silver disc behind.
 *   SHRI (Lakshmi), goddess of fortune: in WHITE garments (as the epic says), standing on a
 *     pink lotus, lotuses in her two raised hands, a tall karanda crown, gold necklaces.
 *     LIGHT: ivory and rose-gold, a PALE figure. Fill #e8dcd0, lit #fff8f0, inner #f4ece4,
 *     rim #ffb0a0 → #fff4ec, glow 0.9, gold ornaments #e0a840 → #fff0c0.
 *   SURA DEVI (Varuni), goddess of wine: a queenly figure holding up a cup, a wine jar on her
 *     hip, a crown of vine leaves. Drawn with dignity, as a goddess, never as a drinker.
 *     LIGHT: wine-crimson. Fill #18060c, lit #44142a, inner #5a1a34, rim #c04060 → #ffd0dc,
 *     glow 0.8, gold ornaments.
 *   DHANVANTARI, physician of the gods: a youthful god with a simple crown, a garland of
 *     healing herbs, holding the WHITE POT of amrita at his chest in both hands (it glows).
 *     LIGHT: pale herb-jade. Fill #08140c, lit #1a3a24, inner #24502e, rim #c8f0c0 → #ffffff,
 *     glow 0.9; the pot pure white (#ffffff, glowing). Never Takshaka's deep green rim.
 *
 * facing 'front'. (x, y) = feet. scale 1 ≈ 1000 px. Poses: stand · rise (k: arms opening as
 * they rise) · bless (k: the right hand in abhaya); Dhanvantari: `offer` (k: the pot held out).
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, CH = KIT.characters;
  const { TAU, lerp, clamp } = R;
  const { cut, limb, along, hand } = CH;

  function rig(P) {
    const po = P.po, k = po.k;
    const r = { T: P.T, k, name: po.name, open: po.name === 'rise' ? k : 1 };
    r.l = [-lerp(140, 230, r.open), lerp(-560, -820, r.open)];
    r.r = [lerp(140, 230, r.open), lerp(-560, -820, r.open)];
    r.lKind = 'fist'; r.rKind = 'fist';
    if (po.name === 'bless') { r.l = along([-230, -820], [-210, -720], k); r.lKind = 'abhaya'; }
    r.offer = po.name === 'offer' ? k : 0;
    return r;
  }

  function body(g, opt, r) {
    const fem = opt.fem;
    g.moveTo(-(fem ? 120 : 100), -520); g.lineTo(fem ? 120 : 100, -520);
    g.bezierCurveTo(fem ? 150 : 120, -380, fem ? 140 : 120, -180, fem ? 130 : 100, -40);
    g.lineTo(fem ? 150 : 120, 0); g.lineTo(-(fem ? 150 : 120), 0); g.lineTo(-(fem ? 130 : 100), -40);
    g.bezierCurveTo(-(fem ? 140 : 120), -180, -(fem ? 150 : 120), -380, -(fem ? 120 : 100), -520); g.closePath(); cut(g);
    // torso
    if (fem) { g.moveTo(-90, -520); g.bezierCurveTo(-80, -600, -130, -660, -118, -740); g.quadraticCurveTo(0, -770, 118, -740); g.bezierCurveTo(130, -660, 80, -600, 90, -520); g.closePath(); cut(g); }
    else { g.moveTo(-96, -520); g.bezierCurveTo(-104, -610, -140, -680, -132, -750); g.quadraticCurveTo(0, -780, 132, -750); g.bezierCurveTo(140, -680, 104, -610, 96, -520); g.closePath(); cut(g); }
    g.moveTo(-26, -760); g.lineTo(26, -760); g.lineTo(24, -800); g.lineTo(-24, -800); g.closePath(); cut(g);
    g.moveTo(54, -860); g.ellipse(0, -860, 54, 68, 0, 0, TAU); cut(g);
    for (const s of [-1, 1]) { g.moveTo(s * 56, -840); g.arc(s * 58, -832, 13, 0, TAU); cut(g); }
    // arms
    const shL = [-112, -730], shR = [112, -730];
    if (opt.pot) {
      const c = [0, lerp(-640, -700, r.offer)], pl = [-50, c[1] + 20], pr = [50, c[1] + 20];
      limb(g, [shL, [-170, -600], pl], [48, 36, 28]); limb(g, [shR, [170, -600], pr], [48, 36, 28]);
    } else {
      limb(g, [shL, [shL[0] - 70, -620], r.l], [48, 36, 28]); limb(g, [shR, [shR[0] + 70, -620], r.r], [48, 36, 28]);
      hand(g, r.l, -Math.PI / 2, 32, r.lKind); hand(g, r.r, -Math.PI / 2, 32, r.rKind);
    }
  }

  function crown(g, kind) {
    if (kind === 'karanda') { for (const [y, w] of [[-920, 50], [-966, 40], [-1006, 30], [-1040, 18]]) { g.moveTo(-w, y); g.quadraticCurveTo(0, y - 64, w, y); g.closePath(); cut(g); } }
    else if (kind === 'crescent') { g.moveTo(-50, -920); g.lineTo(50, -920); g.lineTo(44, -960); g.lineTo(-44, -960); g.closePath(); cut(g); g.moveTo(-70, -1010); g.quadraticCurveTo(0, -940, 70, -1010); g.quadraticCurveTo(0, -970, -70, -1010); cut(g); }
    else if (kind === 'vine') { g.moveTo(-54, -916); g.lineTo(54, -916); g.lineTo(50, -950); g.lineTo(-50, -950); g.closePath(); cut(g); for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.42; g.moveTo(0, -940); g.quadraticCurveTo(Math.cos(a - 0.4) * 50, -940 + Math.sin(a - 0.4) * 50, Math.cos(a) * 80, -940 + Math.sin(a) * 80); g.quadraticCurveTo(Math.cos(a + 0.4) * 50, -940 + Math.sin(a + 0.4) * 50, 0, -940); cut(g); } }
    else { g.moveTo(-52, -918); g.lineTo(52, -918); g.lineTo(40, -990); g.quadraticCurveTo(0, -1020, -40, -990); g.closePath(); cut(g); }
  }

  function lotusAt(g, p, sz) { for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.45; g.moveTo(p[0], p[1]); g.quadraticCurveTo(p[0] + Math.cos(a - 0.3) * sz * 0.7, p[1] + Math.sin(a - 0.3) * sz * 0.7, p[0] + Math.cos(a) * sz, p[1] + Math.sin(a) * sz); g.quadraticCurveTo(p[0] + Math.cos(a + 0.3) * sz * 0.7, p[1] + Math.sin(a + 0.3) * sz * 0.7, p[0], p[1]); cut(g); } }

  function makeShape(opt) {
    return function shape(g, color, P, r) {
      g.fillStyle = color;
      g.beginPath();
      body(g, opt, r);
      crown(g, opt.crown);
      if (opt.lotuses) { lotusAt(g, [r.l[0], r.l[1] - 40], 70); if (r.rKind !== 'abhaya') lotusAt(g, [r.r[0], r.r[1] - 40], 70); }
      if (opt.cup) { const c = r.r; g.moveTo(c[0] - 46, c[1] - 30); g.lineTo(c[0] + 46, c[1] - 30); g.quadraticCurveTo(c[0] + 40, c[1] + 20, c[0], c[1] + 24); g.quadraticCurveTo(c[0] - 40, c[1] + 20, c[0] - 46, c[1] - 30); cut(g); g.moveTo(c[0] + 10, c[1] + 24); g.lineTo(c[0] + 10, c[1] + 60); g.lineTo(c[0] - 10, c[1] + 60); g.lineTo(c[0] - 10, c[1] + 24); cut(g);
        // the jar on the left hip
        g.moveTo(-150, -480); g.ellipse(-190, -480, 60, 70, 0, 0, TAU); cut(g); g.moveTo(-210, -550); g.lineTo(-170, -550); g.lineTo(-172, -590); g.lineTo(-208, -590); g.closePath(); cut(g); }
    };
  }

  function makeOrn(opt) {
    return function ornaments(g, P, r, a, color) {
      if (a <= 0.01) return;
      g.globalAlpha *= a; g.strokeStyle = color; g.fillStyle = color; g.lineCap = 'round';
      g.beginPath(); g.moveTo(-100, -748); g.quadraticCurveTo(0, -660, 100, -748); g.lineWidth = 10; g.stroke();
      if (opt.fem) { g.beginPath(); g.moveTo(-90, -740); g.quadraticCurveTo(0, -600, 90, -740); g.lineWidth = 5; g.stroke(); }
      g.beginPath(); g.moveTo(-110, -522); g.lineTo(110, -522); g.lineWidth = 9; g.stroke();
      for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(i * 22, -510); g.lineTo(i * 30, -40); g.lineWidth = 3; g.stroke(); }
      if (opt.herbs) for (let i = 0; i <= 10; i++) { const u = i / 10; const x = lerp(-110, 110, u), y = -740 + Math.sin(Math.PI * u) * 300; g.beginPath(); g.ellipse(x * (0.4 + 0.6 * Math.abs(Math.cos(Math.PI * u))), y, 14, 7, u * 3, 0, TAU); g.fill(); }
      if (opt.pot) {
        const c = [0, lerp(-640, -700, r.offer)];
        g.save(); g.fillStyle = '#ffffff'; g.shadowColor = '#ffffff'; g.shadowBlur = R.px(30 * P.s);
        g.beginPath(); g.ellipse(c[0], c[1] - 10, 92, 80, 0, 0, TAU); g.fill();
        g.beginPath(); g.moveTo(-40, c[1] - 84); g.lineTo(40, c[1] - 84); g.lineTo(30, c[1] - 120); g.lineTo(-30, c[1] - 120); g.closePath(); g.fill();
        g.beginPath(); g.ellipse(0, c[1] - 124, 50, 12, 0, 0, TAU); g.fill();
        g.restore();
        g.strokeStyle = '#e8c060'; g.lineWidth = 5; g.beginPath(); g.ellipse(c[0], c[1] - 10, 92, 80, 0, 0, TAU); g.stroke();
      }
      if (opt.cup) { g.save(); g.fillStyle = '#ff6a8a'; g.beginPath(); g.ellipse(r.r[0], r.r[1] - 30, 40, 9, 0, 0, TAU); g.fill(); g.restore(); }
    };
  }

  function discBefore(colA, colB, rr) {
    return function before(ctx, P, r, k) {
      const cx = P.x, cy = P.y - 700 * P.s, R0 = rr * P.s;
      KIT.glow(ctx, cx, cy, R0 * 2.2, colA, 0.5 * k);
      const g = ctx.createRadialGradient(cx, cy, R0 * 0.2, cx, cy, R0);
      g.addColorStop(0, 'rgba(255,255,255,0.95)'); g.addColorStop(0.75, colB); g.addColorStop(1, 'rgba(200,220,255,0)');
      ctx.save(); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R0, 0, TAU); ctx.fill(); ctx.restore();
    };
  }
  function lotusSeat(ctx, P, k) {
    const s = P.s;
    ctx.save(); ctx.translate(P.x, P.y); ctx.scale(s, s);
    KIT.glow(ctx, 0, -80, 420, '#ffb0c0', 0.35 * k);
    for (const [n, len, w, fill, sp] of [[9, 170, 56, '#b04a6a', 3.0], [7, 190, 50, '#e88aa8', 2.4]]) for (let i = 0; i < n; i++) { ctx.save(); ctx.rotate(-sp / 2 + (i / (n - 1)) * sp); ctx.beginPath(); ctx.moveTo(0, 30); ctx.quadraticCurveTo(w, -len * 0.5, 0, -len); ctx.quadraticCurveTo(-w, -len * 0.5, 0, 30); ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = '#ffe0ea'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore(); }
    ctx.restore();
  }

  const poses = [{ name: 'stand' }, { name: 'rise', note: 'k: the arms open as they rise' }, { name: 'bless', note: 'k' }];
  const defs = [
    { id: 'chandra', name: 'Chandra (Soma), the Moon', role: 'The first wonder to rise from the churned ocean, cool and bright (CE 1.16).', opt: { crown: 'crescent', lotuses: true }, before: discBefore('#dfe8ff', 'rgba(220,232,255,0.7)', 470),
      pal: { fill: '#0c1420', lit: '#2a3a58', inner: '#3a4a70', rimDim: '#c8dcff', rimBright: '#ffffff', ornamentDim: '#dfe8ff', ornament: '#ffffff' },
      rule: { fill: '#0c1420', lit: '#2a3a58', litGain: 0.8, rim: ['#c8dcff', '#ffffff'], inner: '#3a4a70', innerA: [0.85, 0.5], glow: 1.0, ornament: ['#dfe8ff', '#ffffff'], ornamentA: [0.7, 1.0] },
      light: 'Moon-silver: rim #c8dcff → #ffffff, glow 1.0, a great silver disc behind: the Sun\'s counterpart.', props: ['a silver disc behind him', 'a crescent at the crown', 'a white lotus in each raised hand'], voice: null, bounds: [-640, -1340, 640, 30] },
    { id: 'lakshmi', name: 'Shri (Lakshmi), goddess of fortune', role: 'She rises from the churned ocean in white garments (CE 1.16).', opt: { fem: true, crown: 'karanda', lotuses: true }, before: (ctx, P, r, k) => lotusSeat(ctx, P, k),
      pal: { fill: '#e8dcd0', lit: '#fff8f0', inner: '#f4ece4', rimDim: '#ffb0a0', rimBright: '#fff4ec', ornamentDim: '#e0a840', ornament: '#fff0c0', lotus: '#e88aa8' },
      rule: { fill: '#e8dcd0', lit: '#fff8f0', litGain: 0.85, rim: ['#ffb0a0', '#fff4ec'], inner: '#f4ece4', innerA: [0.5, 0.3], glow: 0.9, ornament: ['#e0a840', '#fff0c0'], ornamentA: [0.8, 1.0] },
      light: 'Ivory and rose-gold: a PALE figure (her white garments), rose-gold rim, gold ornaments, on a pink lotus.', props: ['white garments', 'tall karanda crown', 'a lotus in each raised hand', 'a pink lotus seat'], voice: null, bounds: [-300, -1140, 300, 60] },
    { id: 'sura', name: 'Sura Devi (Varuni), goddess of wine', role: 'She rises from the churned ocean after Shri (CE 1.16). Drawn with a queen\'s dignity.', opt: { fem: true, crown: 'vine', cup: true },
      pal: { fill: '#18060c', lit: '#44142a', inner: '#5a1a34', rimDim: '#c04060', rimBright: '#ffd0dc', ornamentDim: '#e0b050', ornament: '#fff0c0' },
      rule: { fill: '#18060c', lit: '#44142a', litGain: 0.8, rim: ['#c04060', '#ffd0dc'], inner: '#5a1a34', innerA: [0.85, 0.5], glow: 0.8, ornament: ['#e0b050', '#fff0c0'], ornamentA: [0.6, 0.95] },
      light: 'Wine-crimson: rim #c04060 → #ffd0dc, glow 0.8, gold ornaments, a rose glint in the cup.', props: ['a crown of vine leaves', 'a cup held up', 'a wine jar on the hip'], voice: null, bounds: [-320, -1080, 320, 30] },
    { id: 'dhanvantari', name: 'Dhanvantari, physician of the gods', role: 'Last of the wonders: he rises bearing the white pot of amrita (CE 1.16).', opt: { crown: 'simple', pot: true, herbs: true },
      pal: { fill: '#08140c', lit: '#1a3a24', inner: '#24502e', rimDim: '#c8f0c0', rimBright: '#ffffff', ornamentDim: '#e0c060', ornament: '#fff4c8', pot: '#ffffff' },
      rule: { fill: '#08140c', lit: '#1a3a24', litGain: 0.8, rim: ['#c8f0c0', '#ffffff'], inner: '#24502e', innerA: [0.85, 0.5], glow: 0.9, ornament: ['#e0c060', '#fff4c8'], ornamentA: [0.65, 1.0] },
      light: 'Pale herb-jade: rim #c8f0c0 → #ffffff, glow 0.9, a garland of herbs; the white pot of amrita glows pure white.', props: ['a simple crown', 'a garland of healing herbs', 'the white pot of amrita held at the chest'], voice: 'dhanvantari', bounds: [-300, -1060, 300, 30],
      poses: [{ name: 'stand' }, { name: 'offer', note: 'k: the pot held out' }] },
  ];
  for (const d of defs) {
    CH.define({
      id: d.id, rig, shape: makeShape(d.opt), ornaments: makeOrn(d.opt), before: d.before, defaultPose: 'stand',
      bible: { name: d.name, role: d.role, palette: d.pal, proportions: 'Frontal, ≈ 1000 units to the crown (shared frontal body).', props: d.props, light: d.light, poses: d.poses || poses, voice: d.voice },
      rule: d.rule, bounds: () => d.bounds,
    });
    CH.ROSTER.push(d.id);
  }
  void clamp;
})();
