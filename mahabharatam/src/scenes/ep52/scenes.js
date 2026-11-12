/* Episode 52 · Gods in Disguise (CE Adi 1.61; the arc finale of Vyasa Begins). One scene per line of script/ep52.en.json.
 * Loads after ep41/_common, ep44/_common, ep46/_common, ep49/_common, ep51/_common.
 * The warriors are PROVISIONAL panel figures (kuru-origins.js); every god is a whole large figure standing behind his man
 * (never an emblem), pale with distance, opaque. Kali is the spirit of strife, not the goddess: the plaque says so. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, ST = KIT.stage, CAM = KIT.cam, ACT = KIT.act, TY = KIT.type, CH = KIT.characters, EP41 = window.EP41, EP46 = window.EP46, EP51 = window.EP51;
  const { TAU, clamp, lerp, E, hash } = R;
  const GY = EP41.GY;
  const fin = (ctx, T) => ST.finish(ctx, T, {});
  const names = (env, n) => [n, env.script.names[n]];
  const talk = (env, t) => EP41.mouth(env, t);
  const POST = (b = 0.3, v = 0.45) => () => ({ bloom: b, vignette: v, paper: 0.3 });
  const out = (t, env, d = 0.4) => clamp((t - (env.dur - d)) / 0.3);
  const GL = { dir: -Math.PI / 2 - 0.3, intensity: 1.3, front: 0.9, fill: 0.6, tint: ['#fff4d8', 0.5] };

  const MEN = ['yudhishthira', 'bhima', 'arjuna', 'nakula', 'sahadeva'], MX = [130, 335, 540, 745, 950];
  // the god behind man i, large (x, y = his feet); lit k = 0..1
  const god = (g, T, i, x, y, s, k = 1) => { const L = { ...GL, intensity: 0.9 + 0.5 * k, front: 0.5 + 0.4 * k };
    KIT.glow(g, x, y - 700 * s, 520 * s, '#fff0c0', 0.25 + 0.4 * k);
    if (i === 0) CH.dharma.draw(g, { x, y, scale: s * 0.95, facing: 'left', pose: { w: { bless: 0.6, stand: 0.4 }, prop: 'staff' }, light: L, expression: { emo: 'calm' }, t: T, key: 'god0' });
    else if (i === 2) CH.indra.draw(g, { x, y, scale: s * 0.9, facing: 'left', pose: { name: 'protect', k: 0.6 }, light: L, t: T, key: 'god2' });
    else CH.deva.draw(g, { x, y, scale: s, index: i === 1 ? 3 : i === 3 ? 1 : 5, facing: i === 4 ? 'right' : 'left', pose: { name: 'raise', k: i === 1 ? 0.5 : 0.15 }, light: L, t: T, key: 'god' + i }); };
  const man = (g, p, T, i, x, y, s, o = {}) => EP51.fig(g, T, MEN[i], x, y, s, { f: o.f || 'left', pose: o.pose || 'stand', L: o.L || ST.backlight(p, { from: [x, 600], at: [x, y], warm: '#ffd890' }), ex: { emo: 'resolve' }, key: 'man' + i });
  const ridge = (ctx, T, cam, pal, o) => EP51.land(ctx, T, cam, pal, { hz: 980, gy: 1050, sun: o.sun, trees: false, hillH: 220, dust: 'pollen', dustN: 20, grass: false,
    far: (g, p) => { if (o.far) o.far(g, p); }, figs: (g, p) => { g.fillStyle = KIT.hex(p.near, '#000000', 0.35); g.beginPath(); g.moveTo(-900, 1100); g.quadraticCurveTo(540, 980, 1980, 1100); g.lineTo(1980, 2900); g.lineTo(-900, 2900); g.closePath(); g.fill(); o.figs(g, p); } });

  // 1 · HOOK: five warriors in a row on a ridge at gold dawn; behind each, vast in the sky, a pale standing god; a pull back
  R.scene({ id: 'hook',
    draw(ctx, t, env) {
      const T = env.T, b1 = env.beats[1] ?? 2.2, cam = CAM.drift(CAM.pull(E.outCubic(clamp(t / 3.2)), { from: 1.5, to: 1.02, focus: [540, 1050] }), T, 0.5), k = E.outCubic(clamp((t - b1 + 0.5) / 0.8));
      ridge(ctx, T, cam, 'island-gold', { sun: [540, 600, 150],
        far: (g) => { for (let i = 0; i < 5; i++) god(g, T, i, MX[i] + (i - 2) * 40, 1060, 0.92, k); },
        figs: (g, p) => { for (let i = 0; i < 5; i++) man(g, p, T, i, MX[i], 1075 + Math.abs(i - 2) * 10, 0.5); } });
      EP51.hook(ctx, T, t, env, { y: 1520 });
      fin(ctx, T);
    },
    post: POST(0.4, 0.42) });

  // 2 · ASKED (the frame; the close-up): the king's face: eager, then awe as the answer begins
  R.scene({ id: 'asked', transition: { type: 'smoke', dur: 0.6, dir: -Math.PI / 2, color: '#1a4a5a' },
    draw(ctx, t, env) {
      const T = env.T, b1 = env.beats[1] ?? 3, cam = CAM.push(t / env.dur, { from: 1.0, to: 1.1, focus: [540, 780] });
      EP46.hall(ctx, T, cam, { pal: 'satra-teal-night', fx: -200, fire: 0.8, fs: 1.0, crowd: 0.5, front: () => {}, figs: (g, p, fl) => {
        CH.kingJanamejaya.draw(g, { x: 660, y: 2960, scale: 2.5, facing: 'left', pose: { w: { anjali: 0.5, stand: 0.5 } }, light: { ...EP46.lit(660, fl, 0.85, -200), fill: 0.45, intensity: 1.4 }, expression: { emo: ACT.emo(t, [[0, 'resolve'], [b1 - 0.6, 'wonder', { dur: 0.6 }]]), speak: 0, ...ACT.lead(t, [[0, [0.8, 0.1]], [b1 - 0.5, [0.7, -0.4]]], 0.35, 0.15) }, t: T, key: 'as-k' });
        const gr = g.createLinearGradient(0, 1220, 0, 1700); gr.addColorStop(0, 'rgba(4,14,20,0)'); gr.addColorStop(0.5, 'rgba(4,14,20,0.85)'); gr.addColorStop(1, 'rgba(4,14,20,0.96)'); g.fillStyle = gr; g.fillRect(-900, 1220, 2880, 1600); } });
      KIT.series.recapBand(ctx, T, clamp(t / 0.3) * (1 - clamp((t - 3.0) / 0.4)), env.strings, { y: 190 });
      TY.plaque(ctx, T, clamp((t - 0.9) / 0.6), ...names(env, 'Janamejaya'), { x: 250, y: 370, size: 44, out: out(t, env) });
      fin(ctx, T);
    },
    post: POST(0.36, 0.5) });

  // 3 · FIVE: a slow track along the row; as each god is named his great figure brightens and the man's plaque arrives
  R.scene({ id: 'five', transition: { type: 'brush', dur: 0.5, angle: 0.2, color: '#fff6c8' },
    draw(ctx, t, env) {
      const T = env.T, b = env.beats, bt = [b[1] ?? 4.8, b[2] ?? 5.8, b[3] ?? 7.1, b[4] ?? 8.5], cam = CAM.slide(E.inOutSine(clamp((t - 2.6) / (env.dur - 3.0))), { from: -150, to: 150, zoom: 1.2 });
      const lit = (i) => clamp((t - [bt[0], bt[1], bt[2], bt[3], bt[3] + 0.3][i] + 0.4) / 0.6);
      ridge(ctx, T, cam, 'messenger-dawn', { sun: [540, 560, 130],
        far: (g) => { for (let i = 0; i < 5; i++) god(g, T, i, MX[i] + (i - 2) * 40, 1060, 0.92, lit(i)); },
        figs: (g, p) => { for (let i = 0; i < 5; i++) man(g, p, T, i, MX[i], 1075 + Math.abs(i - 2) * 10, 0.5, { pose: ACT.pose(t, [[0, 'stand'], [[bt[0], bt[1], bt[2], bt[3], bt[3] + 0.3][i], 'attend', { act: 0.4 }]]) }); } });
      const seq = [['Yudhishthira', bt[0], bt[1]], ['Bhima', bt[1], bt[2]], ['Arjuna', bt[2], bt[3]], ['Nakula', bt[3], env.dur]];
      for (const [n, a, z] of seq) TY.plaque(ctx, T, clamp((t - a) / 0.45), n === 'Nakula' ? 'Nakula · Sahadeva' : n, env.script.names[n], { x: 540, y: 250, size: 50, out: clamp((t - z + 0.25) / 0.25) });
      TY.tag(ctx, T, clamp((t - 0.8) / 0.4), 'the five Pandavas · sons of Pandu', { x: 540, y: 250, size: 36, out: clamp((t - bt[0] + 0.4) / 0.3) });
      fin(ctx, T);
    },
    post: POST(0.4, 0.4) });

  // 4 · KARNA: a tilt up: a lone warrior in gold, his back to a huge low sun in which the Sun god stands
  R.scene({ id: 'karna', transition: { type: 'dissolve', dur: 0.35 },
    draw(ctx, t, env) {
      const T = env.T, b1 = env.beats[1] ?? 3.3, cam = CAM.tilt(E.inOutSine(clamp(t / 3.2)), { from: 210, to: -120, zoom: 1.12 });
      ridge(ctx, T, cam, 'wedding-turmeric', { sun: [540, 560, 330],
        far: (g) => { KIT.glow(g, 540, 560, 900, '#fff0a0', 0.4); CH.deva.draw(g, { x: 560, y: 1060, scale: 0.86, index: 4, facing: 'left', pose: { name: 'raise', k: 0.3 }, light: { ...GL, intensity: 1.2 }, t: T, key: 'kr-s' }); },
        figs: (g, p) => EP51.fig(g, T, 'karna', 420, 1100, 0.7, { f: 'left', pose: ACT.pose(t, [[0, 'stand'], [1.2, 'attend', { act: 0.5 }]]), L: ST.backlight(p, { from: [540, 560], at: [420, 1100], warm: '#fff0a0', front: 0.35 }), ex: { emo: 'resolve', gaze: [0.8, -0.2] }, key: 'kr-k' }) });
      TY.plaque(ctx, T, clamp((t - 0.4) / 0.5), ...names(env, 'Karna'), { x: 800, y: 460, size: 54, out: clamp((t - 2.1) / 0.25) });
      TY.plaque(ctx, T, clamp((t - 2.3) / 0.4), ...names(env, 'Bhishma'), { x: 800, y: 460, size: 42, out: clamp((t - 3.25) / 0.2) });
      TY.plaque(ctx, T, clamp((t - 3.4) / 0.4), ...names(env, 'Drona'), { x: 800, y: 460, size: 42, out: out(t, env, 0.25) });
      fin(ctx, T);
    },
    post: POST(0.46, 0.4) });

  // 5 · KRISHNA (the signature shot): a crane down from the great dark four-armed god to a dark young man in yellow below
  R.scene({ id: 'krishna', transition: { type: 'lamp', dur: 0.8, from: [540, 700], to: [540, 520] },
    draw(ctx, t, env) {
      const T = env.T, b = env.beats, b1 = b[1] ?? 2, b2 = b[2] ?? 3.6, cam = CAM.crane(E.inOutSine(clamp(t / (env.dur - 0.4))), { from: 1.5, to: 1.04, y0: -330, y1: 40 });
      EP51.heaven(ctx, T, cam, 'crystal-sky', { floor: 1220, sun: [860, 300, 80],
        back: (g) => KIT.glow(g, 540, 560, 900, '#9ab8ff', 0.45),
        mid: (g) => CH.vishnu.draw(g, { x: 540, y: 1000, scale: 0.9, facing: 'front', pose: { name: 'bless', k: 0.7 }, light: { dir: -Math.PI / 2 - 0.3, intensity: 1.3, front: 0.9, fill: 0.6 }, t: T, key: 'ks-v' }),
        figs: (g, p) => { KIT.glow(g, 540, 1000, 420, '#ffe890', 0.35 * clamp((t - b1) / 0.8)); EP51.fig(g, T, 'krishna', 540, 1250, 0.56, { f: 'left', pose: ACT.pose(t, [[0, 'stand'], [b2 - 0.5, 'bless', { act: 0.5 }]]), L: EP51.bright('#fff0c0', 1.35), ex: { emo: 'tender', gaze: [0.6, 0] }, key: 'ks-k' }); } });
      TY.plaque(ctx, T, clamp((t - 0.6) / 0.5), ...names(env, 'Narayana'), { x: 290, y: 300, size: 50, out: clamp((t - b2 + 0.5) / 0.3) });
      TY.plaque(ctx, T, clamp((t - b2 + 0.1) / 0.5), ...names(env, 'Krishna'), { x: 290, y: 300, size: 54, out: out(t, env, 0.3) });
      fin(ctx, T);
    },
    post: POST(0.44, 0.42) });

  // 6 · KALI (the turn, after a silence): a crowned prince with a mace, seen from below; behind him a tall dark shape with a green eye
  R.scene({ id: 'kali', transition: { type: 'dissolve', dur: 0.4 },
    draw(ctx, t, env) {
      const T = env.T, b = env.beats, b0 = b[0] ?? 0.95, b1 = b[1] ?? 3.3, b2 = b[2] ?? 6.5, cam = CAM.push(t / env.dur, { from: 1.04, to: 1.24, focus: [540, 760] }), rise = E.outCubic(clamp((t - b1 + 0.6) / 1.4));
      EP51.void(ctx, T, cam, 'venom-violet', { gy: 1300, glow: [540, 700, 900, '#5aff8a', 0.12 + 0.14 * rise],
        back: (g, p) => { ST.hills(g, p, { y: 1320, h: 240, seed: 221, peaks: 0.6 }); g.save(); g.beginPath(); g.rect(-900, -900, 2880, 2200 + 0 * rise); g.clip(); EP51.fig(g, T, 'kaliShade', 600, 1400 + 500 * (1 - rise), 1.36, { f: 'left', pose: { w: { bless: 0.3, stand: 0.7 } }, L: { dir: -Math.PI / 2, intensity: 1.2, front: 0.25, fill: 0.2, tint: ['#5aff8a', 0.7], minLum: 0.12 }, ex: { emo: 'wrath', gaze: [0.6, 0.6] }, key: 'kl-s' }); g.restore(); },
        figs: (g, p) => EP51.fig(g, T, 'duryodhana', 500, 1330, 0.8, { f: 'left', pose: ACT.pose(t, [[0, 'stand'], [b1, 'raise', { act: 0.5 }]], { prop: 'club' }), L: { dir: -Math.PI / 2 - 0.5, intensity: 1.25, front: 0.6, fill: 0.35, tint: ['#d8c0ff', 0.5], minLum: 0.3 }, ex: { emo: ACT.emo(t, [[0, 'resolve'], [b1, 'wrath']]), gaze: [0.8, -0.1] }, key: 'kl-d' }),
        dust: 'ash', dustN: 30 });
      TY.plaque(ctx, T, clamp((t - b1 + 0.3) / 0.5), ...names(env, 'Duryodhana'), { x: 800, y: 820, size: 44, out: clamp((t - b2 + 0.9) / 0.3) });
      TY.plaque(ctx, T, clamp((t - b2 + 0.5) / 0.5), 'Kali', 'the spirit of strife · not the goddess Kālī', { x: 760, y: 820, size: 50, out: out(t, env, 0.3) });
      TY.turnWord(ctx, T, clamp((t - b2) / 0.6), 'Strife', { x: 810, y: 1010, size: 84, out: out(t, env, 0.3), sub: 'Adi 1.61.80' });
      TY.tag(ctx, T, clamp((t - 1.2) / 0.4), 'Jarasandha, Shishupala: demons born as kings · Adi 1.61.4–5', { x: 540, y: 250, size: 28, out: clamp((t - b1 + 0.5) / 0.3) });
      fin(ctx, T);
    },
    post: POST(0.36, 0.52) });

  // 7 · DRAUPADI: a tilt up a low altar flame to a dark woman in gold rising from it; a pale goddess vast behind her
  R.scene({ id: 'draupadi', transition: { type: 'ink', dur: 0.6, at: [540, 1100], color: '#6a1a44' },
    draw(ctx, t, env) {
      const T = env.T, b = env.beats, b1 = b[1] ?? 2.6, b2 = b[2] ?? 3.9, cam = CAM.tilt(E.inOutSine(clamp(t / 3.4)), { from: 220, to: -100, zoom: 1.12 }), rise = E.outCubic(clamp((t - 0.6) / 2.0));
      EP51.heaven(ctx, T, cam, 'brahma-rose', { floor: GY + 60,
        back: (g) => KIT.glow(g, 540, 600, 900, '#fff0c8', 0.4),
        mid: (g) => EP51.fig(g, T, 'shri', 560, 1330, 1.25, { f: 'left', pose: { w: { bless: 0.6, stand: 0.4 } }, L: EP51.bright('#fff4e0', 1.4), ex: { emo: 'tender', gaze: [0.4, 0.6] }, key: 'dp-s' }),
        figs: (g, p) => {
          g.fillStyle = '#5a2a1a'; g.fillRect(360, GY - 60, 360, 130); g.fillStyle = '#e7b54a'; g.fillRect(350, GY - 80, 380, 24);   // the altar
          g.save(); g.beginPath(); g.rect(-900, -900, 2880, 900 + GY - 80); g.clip(); EP51.fig(g, T, 'panchali', 540, GY - 80 + 520 * (1 - rise), 0.72, { f: 'left', pose: ACT.pose(t, [[0, 'anjali'], [b2 - 0.4, 'stand', { act: 0.5 }]]), L: EP51.bright('#ffe0b0', 1.3), ex: { emo: 'resolve', gaze: [0.7, -0.1] }, key: 'dp-d' }); g.restore();
          CH.hearthfire.draw(g, { x: 540, y: GY - 76, scale: 0.42, t: T, k: 0.9, key: 'dp-f' }); } });
      TY.plaque(ctx, T, clamp((t - 0.8) / 0.5), ...names(env, 'Shri'), { x: 840, y: 780, size: 46, out: clamp((t - b2 + 0.5) / 0.3) });
      TY.plaque(ctx, T, clamp((t - b2 + 0.1) / 0.5), ...names(env, 'Draupadi'), { x: 830, y: 780, size: 46, out: out(t, env, 0.3) });
      fin(ctx, T);
    },
    post: POST(0.42, 0.4) });

  // 8 · PAYOFF (lit, ≥ 4 s) and 9 · ARCEND: the whole cast in one lit row under their gods; the teller small in front
  const ROW = [['yudhishthira', 90], ['bhima', 215], ['arjuna', 340], ['nakula', 450], ['sahadeva', 545], ['karna', 660], ['krishna', 775], ['panchali', 880], ['duryodhana', 990]];
  const row = (ctx, T, t, env, cam, bare) => ridge(ctx, T, cam, 'seat-ivory', { sun: [540, 520, 200],
    far: (g) => { KIT.glow(g, 540, 560, 1200, '#fff8e0', 0.5); for (let i = 0; i < 5; i++) god(g, T, i, 120 + i * 210, 1040, 0.8, 0.8); },
    figs: (g, p) => { if (bare) return; ROW.forEach(([id, x], i) => EP51.fig(g, T, id, x, 1060 + (i % 2) * 14, 0.42, { f: i < 5 ? 'right' : 'left', pose: 'stand', L: EP51.bright('#fff4d8', 1.3), ex: { emo: 'calm' }, key: 'rw-' + i }));
      CH.vaishampayanaSage.draw(g, { x: 560, y: 1210, scale: 0.52, facing: 'left', pose: ACT.pose(t, [[0, 'speak'], [2.6, 'bless', { act: 0.5 }]], { prop: false }), light: EP51.bright('#fff4d8', 1.35), expression: { emo: 'tender', speak: t < 20 ? talk(env, t) : 0, gaze: [0.5, 0] }, t: T, key: 'rw-v' }); } });
  R.scene({ id: 'payoff', transition: { type: 'dissolve', dur: 0.45 },
    draw(ctx, t, env) { const T = env.T, cam = CAM.orbit(t / env.dur, { from: -1, to: 1, amp: 90, zoom: 1.08 }); row(ctx, T, t, env, cam);
      TY.plaque(ctx, T, clamp((t - 1.2) / 0.5), ...names(env, 'Vaishampayana'), { x: 540, y: 300, size: 44, out: clamp((t - 4.4) / 0.3) });
      TY.tag(ctx, T, clamp((t - 4.6) / 0.4), 'Adi 1.61.101–102', { x: 540, y: 250, size: 32, out: out(t, env, 0.3) });
      fin(ctx, T); },
    post: POST(0.46, 0.36) });
  R.scene({ id: 'arcend', draw(ctx, t, env) { const T = env.T; row(ctx, T, 30 + t, env, CAM.still({ zoom: 1.08, x: 90 }), true); ctx.fillStyle = 'rgba(20,12,6,0.72)'; ctx.fillRect(0, 0, R.W, R.H); EP46.arcCard(ctx, T, clamp(t / 0.25) * (1 - clamp((t - (env.dur - 0.2)) / 0.2)), env.strings); fin(ctx, T); }, post: POST(0.36, 0.5) });

  // 10 · CLIFF: a green forest: a crowned rider with a bow at full gallop on his chariot, deer leaping ahead, spears behind
  const cliff = (ctx, T, t, env) => {
    const cam = CAM.drift(CAM.slide(clamp(t / 5.4), { from: 150, to: -150, zoom: 1.14 }), T, 1.4), d = 300 * (t / 5.4);
    EP51.wood(ctx, T, cam, 'hunt-emerald', { seed: 91, dust: 'dust', figs: (g, p) => {
      for (let i = 0; i < 9; i++) { g.fillStyle = '#0c1a10'; g.fillRect(1010 + i * 46 - d, GY - 760 - 40 * hash(i, 4), 5, 420); }   // the spears of the army behind
      KIT.army.draw(g, 'chariot', { x: 760 - d, y: GY - 190, s: 1.5, dir: -1, t: T, gait: 1, fill: '#3a1a0c', line: '#120806', gold: '#f0c050', rim: '#fff0b0', light: -Math.PI / 2, banner: '#1f8a5a' });
      EP51.fig(g, T, 'dushyanta', 810 - d, GY - 295, 0.3, { f: 'left', pose: { w: { point: 0.5, stand: 0.5 } }, L: EP51.lit(p, 800, GY, { front: 0.5 }), ex: { emo: 'resolve', gaze: [0.9, 0] }, key: 'cf-k' });
      for (let i = 0; i < 3; i++) EP51.beast(g, 'deer', 420 - d * 0.7 - i * 160, GY - 200 - 60 * Math.abs(Math.sin(T * 5 + i * 1.3)), 0.8, { dir: -1, T, run: 1, phase: T * 11 + i * 2 }); } });
    TY.source(ctx, T, clamp((t - 0.4) / 0.4), env.strings, { y: 110 });
    fin(ctx, T);
  };
  R.scene({ id: 'cliff', transition: { type: 'brush', dur: 0.5, angle: 0.15, color: '#d0f4c8' }, draw(ctx, t, env) { cliff(ctx, env.T, t, env); }, post: POST(0.3, 0.45) });
  KIT.series.overlayNextScene({ id: 'next', y: 1120, picture: (ctx, T, env, t) => cliff(ctx, T, 3.98 + t, env) });
})();
