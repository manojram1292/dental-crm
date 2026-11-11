/*
 * Episodes 41–43 · shared places (not a scene): the Bhrigu arc's three lights.
 *   EP41.hearth(ctx, T, cam, o)     INSIDE THE HUT BY THE HOUSEHOLD FIRE: the fire scenes of episodes 39–40 (a flame that
 *                                   fills the frame, a glow on the wall and on the ground, embers, a warm rim on every
 *                                   figure) with the new painted figures. o = { fire (0..1.5), fs (flame scale), fx, lean,
 *                                   dark, pure, door: { x } (daylight through the doorway), figs(g, pal, flicker), pal }
 *   EP41.lit(x, fl, front)          the fire's light on a figure standing at x (a warm rim on the fire's side, the face open)
 *   EP41.hermitage(ctx, T, cam, o)  THE HERMITAGE AT MORNING (green; six planes, shafts, pollen). o = { figs, far(g, pal) }
 *   EP41.naimisha(ctx, T, cam, o)   THE FRAME: the Naimisha fire at the blue hour. o = { figs(g, pal, fl), pal }
 *   EP41.vision(g, x, y, r, T, draw) a picture in the smoke: a pale cloud with dark, opaque shadow-figures inside it
 *   EP41.mouth(env, t)              0..1 while the line's voice is speaking
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, ST = KIT.stage, CH = KIT.characters;
  const { TAU, clamp, lerp, hash } = R;
  const EP41 = (window.EP41 = {});
  const GY = (EP41.GY = 1390), HZ = (EP41.HZ = 1330);
  EP41.mouth = (env, t) => (t > env.speech[0] && t < env.speech[1] ? 0.5 + 0.5 * Math.sin(env.T * 13) : 0);
  EP41.lit = (x, fl = 1, front = 0.42, fx = 540) => ({ dir: Math.atan2(130, fx - x), intensity: 1.25 * fl, front, fill: 0.14, wrap: 0.5, tint: ['#ffb050', 0.6], bounce: ['#3a2a50', 0.15], minLum: 0 });

  EP41.hearth = (ctx, T, cam, o = {}) => {
    const fl = KIT.flicker(T, 3), k = o.fire ?? 1.1, kk = Math.min(1, k) * (1 - 0.6 * (o.dark || 0)), FX = o.fx ?? 540, fs = o.fs ?? 1.6;
    ST.shot(ctx, T, { pal: o.pal || 'hearth-amber', cam, layers: [
      { z: 0, haze: false, draw: (g) => {
        const gr = g.createLinearGradient(0, -500, 0, GY); gr.addColorStop(0, '#0e0503'); gr.addColorStop(0.55, '#34130a'); gr.addColorStop(1, '#6e2c0e'); g.fillStyle = gr; g.fillRect(-900, -900, 2880, GY + 900);
        // the wattle wall: reeds and ties, and the roof's thatch coming down at the top
        g.lineWidth = 5; g.strokeStyle = 'rgba(8,3,2,0.5)'; g.beginPath(); for (let i = 0; i < 58; i++) { const x = -760 + i * 46 + 9 * hash(i, 3); g.moveTo(x, -500); g.lineTo(x + 6 * (hash(i, 4) - 0.5), GY); } g.stroke();
        g.lineWidth = 7; g.strokeStyle = 'rgba(255,160,70,0.09)'; g.beginPath(); for (let j = 0; j < 7; j++) { const y = -260 + j * 240; g.moveTo(-800, y); g.lineTo(1900, y + 12); } g.stroke();
        for (const x of [-170, 300, 790, 1260]) { g.fillStyle = '#120704'; g.fillRect(x - 28, -700, 56, GY + 700); g.fillStyle = 'rgba(255,150,60,0.22)'; g.fillRect(x < FX ? x + 20 : x - 28, -700, 8, GY + 700); }
        g.fillStyle = '#0a0402'; g.beginPath(); g.moveTo(-900, -900); g.lineTo(1980, -900); g.lineTo(1980, -40); g.lineTo(540, -300); g.lineTo(-900, -40); g.closePath(); g.fill();
        g.strokeStyle = 'rgba(200,120,50,0.25)'; g.lineWidth = 4; g.beginPath(); for (let i = 0; i < 40; i++) { const x = -800 + i * 68, y = -40 - 260 * (1 - Math.abs(x - 540) / 1440); g.moveTo(x, y); g.lineTo(x + 12, y + 60 + 30 * hash(i, 6)); } g.stroke();
        if (o.door) { const dx = o.door.x, dw = o.door.w || 330, dh = o.door.h || 980; // daylight through the doorway
          const dg = g.createLinearGradient(0, GY - dh, 0, GY); dg.addColorStop(0, '#bfe6a0'); dg.addColorStop(0.6, '#5aa050'); dg.addColorStop(1, '#2a6a30'); g.fillStyle = dg; g.fillRect(dx - dw / 2, GY - dh, dw, dh);
          g.fillStyle = '#1c5a2a'; for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(dx - dw / 2 + 40 + i * 70, GY - 330 - 60 * hash(i, 8), 120, 0, TAU); g.fill(); }
          g.fillStyle = '#120704'; g.fillRect(dx - dw / 2 - 34, GY - dh - 40, 34, dh + 40); g.fillRect(dx + dw / 2, GY - dh - 40, 34, dh + 40); g.fillRect(dx - dw / 2 - 34, GY - dh - 40, dw + 68, 44); }
      } },
      { z: 0.45, haze: false, draw: (g) => { KIT.glow(g, FX, GY - 560 * fs / 1.6, 1300 * fs / 1.6, '#ff7a1e', 0.5 * fl * kk); KIT.glow(g, FX, GY - 380 * fs / 1.6, 640 * fs / 1.6, '#ffd27a', 0.42 * fl * kk); } },
      { z: 0.8, haze: false, draw: (g) => { CH.hearthfire.draw(g, { x: FX, y: GY - 10, scale: fs, t: T, k, lean: o.lean || 0, dark: o.dark || 0, pure: o.pure || 0, key: o.key || 'h' }); if (o.smoke) o.smoke(g); } },
      { z: 1, haze: false, draw: (g, p) => {
        const fg = g.createLinearGradient(0, GY - 30, 0, R.H + 300); fg.addColorStop(0, '#5e2608'); fg.addColorStop(0.35, '#2c1005'); fg.addColorStop(1, '#0c0402'); g.fillStyle = fg; g.fillRect(-900, GY - 30, 2880, 1300);
        g.save(); g.globalCompositeOperation = 'lighter'; g.translate(FX, GY + 50); g.scale(1, 0.2); KIT.glow(g, 0, 0, 1000 * fs / 1.6, '#ff8a2a', 0.55 * fl * kk); g.restore();   // the glow on the ground
        if (o.figs) o.figs(g, p, fl);
      } },
      { z: 1.4, haze: false, draw: (g) => ST.particles(g, T, { kind: 'ember', count: Math.round(70 * kk) + 6, box: [FX - 430, 60, 860, 1180], cam }) },
      { z: 2.0, haze: false, soft: 0.35, draw: (g) => { g.fillStyle = '#080302';   // near: water jars and a hanging garland, dark against the fire
        for (const [x, s] of [[-150, 1.2], [1230, 1.0]]) { g.beginPath(); g.ellipse(x, 1880, 190 * s, 230 * s, 0, 0, TAU); g.fill(); g.fillRect(x - 70 * s, 1880 - 300 * s, 140 * s, 90 * s); g.beginPath(); g.ellipse(x, 1880 - 300 * s, 96 * s, 24 * s, 0, 0, TAU); g.fill(); }
      } },
    ] });
    return fl;
  };

  EP41.hermitage = (ctx, T, cam, o = {}) => ST.shot(ctx, T, { pal: 'hermitage-green', cam, layers: [
    { z: 0, draw: (g, p) => ST.sky(g, p, { hz: HZ, sun: [860, 520, 56] }) },
    { z: 0.15, draw: (g, p) => { ST.cloudBank(g, p, T, { y: 420, count: 4 }); ST.hills(g, p, { y: HZ, h: 420, seed: 2 }); } },
    { z: 0.4, draw: (g, p) => ST.treeline(g, p, { y: HZ + 10, h: 620, T, seed: 5, kind: 'mixed' }) },
    { z: 0.7, draw: (g, p) => { ST.treeline(g, p, { y: HZ + 40, h: 900, gap: 520, T, seed: 9, color: p.near, kind: 'banyan' }); ST.hut(g, p, { x: o.hutX ?? 820, y: HZ + 50, s: 1.15, lit: 0.6 }); if (o.far) o.far(g, p); } },
    { z: 0.85, haze: false, draw: (g) => ST.shafts(g, T, { x: 780, angle: -0.42, count: 5, alpha: 0.16 }) },
    { z: 1, haze: false, draw: (g, p) => { ST.ground(g, p, { y: GY - 20 }); if (o.figs) o.figs(g, p); } },
    { z: 1.25, haze: false, draw: (g) => ST.particles(g, T, { kind: 'pollen', count: 40, cam }) },
    { z: 1.9, haze: false, soft: 0.3, draw: (g, p) => { ST.trunks(g, p, { xs: [-170, 1250], w: 200 }); ST.grass(g, p, { y: 1940, h: 300, T }); } },
  ] });

  EP41.naimisha = (ctx, T, cam, o = {}) => {
    const fl = KIT.flicker(T, 7);
    ST.shot(ctx, T, { pal: o.pal || 'naimisha-bluehour', cam, layers: [
      { z: 0, draw: (g, p) => ST.sky(g, p, { hz: HZ, sun: [240, 420, 40] }) },
      { z: 0.3, draw: (g, p) => ST.treeline(g, p, { y: HZ + 10, h: 780, T, seed: 21, kind: 'sal' }) },
      { z: 0.6, draw: (g, p) => ST.treeline(g, p, { y: HZ + 40, h: 1050, gap: 480, T, seed: 23, color: p.near, kind: 'banyan' }) },
      { z: 0.8, haze: false, draw: (g) => { KIT.glow(g, 540, GY - 260, 520, '#ff8a2a', 0.22 * fl); CH.hearthfire.draw(g, { x: 540, y: GY - 10, scale: 0.7, t: T, k: 1.0, key: 'nm' }); if (o.smoke) o.smoke(g); } },
      { z: 1, haze: false, draw: (g, p) => { ST.ground(g, p, { y: GY - 20 });
        g.save(); g.globalCompositeOperation = 'lighter'; g.translate(540, GY + 40); g.scale(1, 0.2); KIT.glow(g, 0, 0, 560, '#ff8a2a', 0.3 * fl); g.restore();
        if (o.figs) o.figs(g, p, fl); } },
      { z: 1.4, haze: false, draw: (g) => ST.particles(g, T, { kind: 'ember', count: 16, box: [300, 300, 480, 900], cam }) },
      { z: 1.9, haze: false, soft: 0.3, draw: (g, p) => { ST.trunks(g, p, { xs: [-200, 1280], w: 190 }); ST.grass(g, p, { y: 1950, h: 280, T, count: 40 }); } },
    ] });
    return fl;
  };

  // the dusk of the chase (boar-dusk): episodes 41–43
  const CH_HZ = 1170; EP41.CG = 1235;   // the chase's own, higher ground line
  EP41.chase = (ctx, T, cam, figs, o = {}) => ST.shot(ctx, T, { pal: o.pal || 'boar-dusk', cam, layers: [
    { z: 0, draw: (g, p) => ST.sky(g, p, { hz: CH_HZ }) },
    { z: 0.12, draw: (g, p) => ST.cloudBank(g, p, T, { y: 460, count: 7, speed: 40, color: '#3a1440', alpha: 0.9, size: 1.5 }) },
    { z: 0.3, draw: (g, p) => ST.hills(g, p, { y: CH_HZ, h: 520, seed: 4, peaks: 0.5 }) },
    { z: 0.6, draw: (g, p) => ST.treeline(g, p, { y: CH_HZ + 30, h: 700, T: T * 3, sway: 26, seed: 7, kind: 'sal' }) },
    { z: 1, haze: false, draw: (g, p) => { ST.ground(g, p, { y: EP41.CG - 30 }); figs(g, p); } },
    { z: 1.3, haze: false, draw: (g) => ST.particles(g, T, { kind: 'dust', count: 50, cam }) },
    { z: 2.0, haze: false, soft: 0.35, draw: (g, p) => ST.trunks(g, p, { xs: [-280, 1360], w: 190 }) },
  ] });
  EP41.rider = (g, p, T, x, y, s, emo) => CH.puloma.draw(g, { x: x + 110 * s, y: y - 560 * s, scale: 0.56 * s, facing: 'left', pose: { w: { kneel: 0.75, recoil: 0.25 }, wind: 1 }, light: ST.light(p, { from: [200, 300], at: [x, y], front: 0.85, k: 1.25 }), expression: { emo: emo || 'fear', gaze: [-0.6, -0.2] }, t: T, key: 'rd' });

  EP41.vision = (g, x, y, r, T, a, draw) => {
    if (a <= 0.01) return;
    const b = R.buffer('ep41-vision', 900, 900), q = b.ctx; b.clear(); R.resetCtx(q);
    // the shadow-figures first, darkened to one deep tone (a shadow-play: opaque, never see-through); then the pale cloud behind them
    q.save(); q.translate(450, 450); draw(q); q.restore(); R.resetCtx(q);
    q.globalCompositeOperation = 'source-atop'; q.fillStyle = 'rgba(34,14,8,0.62)'; q.fillRect(0, 0, 900, 900);
    q.globalCompositeOperation = 'destination-over'; q.translate(450, 450);
    const gr = q.createRadialGradient(0, 0, r * 0.2, 0, 0, r * 1.05); gr.addColorStop(0, 'rgb(255,236,196)'); gr.addColorStop(1, 'rgb(206,186,170)'); q.fillStyle = gr;
    for (let i = 0; i < 9; i++) { const an = (i / 9) * TAU + 0.2 * Math.sin(T * 0.5 + i), rr = r * (0.62 + 0.1 * Math.sin(T * 0.7 + i * 1.7)); q.beginPath(); q.arc(Math.cos(an) * r * 0.42, Math.sin(an) * r * 0.36, rr * 0.62, 0, TAU); q.fill(); }
    q.beginPath(); q.arc(0, 0, r * 0.7, 0, TAU); q.fill(); R.resetCtx(q);
    g.save(); g.globalAlpha = clamp(a); g.drawImage(b.canvas, x - 450, y - 450 - (1 - clamp(a)) * 40, 900, 900); g.restore();
  };
})();
