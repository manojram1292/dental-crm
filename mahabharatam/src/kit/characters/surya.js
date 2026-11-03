/*
 * CHARACTER · SURYA, the Sun · `surya`
 *
 * Episode 10 (CE 1.14): Aruna becomes the charioteer of the Sun. Recurs (Karna's father,
 * the churning, Rahu).
 *
 * Drawn frontally and with reverence, as in temple iconography: a standing radiant figure
 * inside a great SUN-DISC of rays, a tall crown (kirita), round earrings, a broad collar,
 * both hands raised at the shoulders, each holding a full-blown LOTUS by its stalk; a long
 * dhoti to the ankles. His face is the brightest point; he is seen through the light.
 *
 * SIGNATURE LIGHT: blazing gold-white. Fill #3a1a04 (only a warm shadow inside the light),
 * inner #ffb030, rim #ffd060 → #fffbe8 with a halo rim all round, glow 1.3, a gold aura and
 * the disc of rays behind. The brightest thing in any frame he is in.
 *
 * facing: 'front' only. (x, y) = feet. scale 1 ≈ 1000 px (the disc ≈ 1300 across).
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, CH = KIT.characters;
  const { TAU, lerp } = R;
  const { cut, limb } = CH;

  function rig(P) { return { T: P.T, k: P.po.k, bless: P.po.name === 'bless' }; }

  function shape(g, color, P, r) {
    g.fillStyle = color;
    g.beginPath();
    // legs and dhoti (to the ankles, flared)
    g.moveTo(-60, -480); g.lineTo(60, -480); g.lineTo(84, -40); g.lineTo(40, -40); g.lineTo(30, 0); g.lineTo(-30, 0); g.lineTo(-40, -40); g.lineTo(-84, -40); g.closePath(); cut(g);
    // torso
    g.moveTo(-70, -490); g.bezierCurveTo(-80, -600, -110, -700, -100, -780); g.lineTo(100, -780); g.bezierCurveTo(110, -700, 80, -600, 70, -490); g.closePath(); cut(g);
    // neck, head, crown
    g.moveTo(-24, -780); g.lineTo(24, -780); g.lineTo(22, -820); g.lineTo(-22, -820); g.closePath(); cut(g);
    g.moveTo(50, -880); g.ellipse(0, -880, 50, 64, 0, 0, TAU); cut(g);
    g.moveTo(-48, -920); g.lineTo(-36, -1060); g.lineTo(0, -1100); g.lineTo(36, -1060); g.lineTo(48, -920); g.closePath(); cut(g);
    for (const s of [-1, 1]) {
      g.moveTo(s * 50, -860); g.arc(s * 54, -850, 16, 0, TAU); cut(g);
      // arms raised at the shoulders, holding lotuses
      const sh = [s * 96, -760], el = [s * 170, -640], hd = [s * 150, -800];
      limb(g, [sh, el, hd], [44, 32, 26]);
      limb(g, [hd, [s * 150, -900]], [8, 8]);
      g.moveTo(s * 150, -900);
      for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.42; g.moveTo(s * 150, -900); g.quadraticCurveTo(s * 150 + Math.cos(a - 0.3) * 40, -900 + Math.sin(a - 0.3) * 40, s * 150 + Math.cos(a) * 60, -900 + Math.sin(a) * 60); g.quadraticCurveTo(s * 150 + Math.cos(a + 0.3) * 40, -900 + Math.sin(a + 0.3) * 40, s * 150, -900); cut(g); }
    }
  }

  function ornaments(g, P, r, a, color) {
    if (a <= 0.01) return;
    g.globalAlpha *= a; g.strokeStyle = color; g.fillStyle = color; g.lineCap = 'round';
    g.beginPath(); g.moveTo(-90, -760); g.quadraticCurveTo(0, -690, 90, -760); g.lineWidth = 10; g.stroke();
    g.beginPath(); g.moveTo(-64, -500); g.lineTo(64, -500); g.lineWidth = 8; g.stroke();
    for (const y of [-960, -1020]) { g.beginPath(); g.moveTo(-40, y); g.lineTo(40, y); g.lineWidth = 4; g.stroke(); }
  }

  function before(ctx, P, r, k) {
    const cx = P.x, cy = P.y - 700 * P.s, R0 = 650 * P.s;
    KIT.glow(ctx, cx, cy, R0 * 2.2, '#ffd060', 0.6 * k);
    const g = ctx.createRadialGradient(cx, cy, R0 * 0.2, cx, cy, R0);
    g.addColorStop(0, 'rgba(255,250,220,0.95)'); g.addColorStop(0.7, 'rgba(255,200,90,0.85)'); g.addColorStop(1, 'rgba(255,150,40,0.0)');
    ctx.save(); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R0, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(255,240,190,0.7)'; ctx.lineWidth = 6 * Math.max(0.4, P.s);
    for (let i = 0; i < 24; i++) { const a = (i / 24) * TAU + P.T * 0.08; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * R0 * 0.75, cy + Math.sin(a) * R0 * 0.75); ctx.lineTo(cx + Math.cos(a) * R0 * 1.12, cy + Math.sin(a) * R0 * 1.12); ctx.stroke(); }
    ctx.restore();
  }

  const bible = {
    name: 'Surya, the Sun',
    role: 'The Sun, whose chariot Aruna drives (CE 1.14). Drawn frontally, as in temple iconography.',
    palette: { fill: '#3a1a04', inner: '#ffb030', rimDim: '#ffd060', rimBright: '#fffbe8', ornamentDim: '#fff0b0', ornament: '#ffffff' },
    proportions: '≈ 1000 units frontal; the sun-disc behind him ≈ 1300 across, centred on his chest.',
    props: ['sun-disc of rays', 'tall kirita', 'round earrings, broad collar, belt', 'two full-blown lotuses held up at the shoulders', 'ankle-length dhoti'],
    light: 'Blazing gold-white: halo rim all round (#ffd060 → #fffbe8), glow 1.3, a gold aura and the disc of rays: the brightest thing in the frame.',
    poses: [{ name: 'stand', note: 'frontal, lotuses raised' }],
    voice: 'surya',
  };

  CH.define({
    id: 'surya', bible, rig, shape, ornaments, before, defaultPose: 'stand',
    rule: {
      fill: '#3a1a04', lit: '#ffb030', litGain: 0.6, rimW: 1.2, halo: 0.8,
      rim: ['#ffd060', '#fffbe8'], inner: '#ffb030', innerA: [0.9, 0.7], glow: 1.3,
      ornament: ['#fff0b0', '#ffffff'], ornamentA: [0.7, 1.0],
    },
    bounds: () => [-260, -1120, 260, 20],
  });
  CH.ROSTER.push('surya');
  void lerp;
})();
