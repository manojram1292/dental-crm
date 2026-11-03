/*
 * Ep 3 · line "days" · "And for eighteen days… they fought."
 *
 * Dusk on the field, from the ground: the two hosts as shadow puppets against the
 * sky, Kaurava banners on the left, Pandava banners on the right, chariots in front
 * facing each other, dust rising between them. On each of the 18 ticks (from
 * "days" to near the line's end, through its hold) one day passes: a sun and then a
 * moon cross a small arc in the sky, the horizon glows and dims, and a tally mark
 * is cut in the stone band at the top (groups of five, as in episode 2), with the
 * day's number beneath. The flicker is kept to the horizon band and the small
 * discs (no full-frame flashing). The dust thickens day by day; on "fought" it
 * surges.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP3 = window.EP3;
  const { TAU, clamp, lerp, E, PAL, hash } = R;
  const A = KIT.army;
  const HZ = 1010;

  function tallyPos(i) {
    const g = Math.floor(i / 5), j = i % 5;
    const gx = 150 + g * 190;
    return { g, j, x: gx + Math.min(j, 3) * 28, slash: j === 4, gx };
  }

  function standard(ctx, x, y, h, kind, wave, col) {
    ctx.fillStyle = '#0c0608';
    ctx.fillRect(x - 3, y - h, 6, h);
    ctx.fillStyle = col;
    if (kind === 0) { ctx.beginPath(); ctx.moveTo(x + 2, y - h); ctx.quadraticCurveTo(x + 44, y - h + 6 + wave, x + 90, y - h + 14 + wave * 1.5); ctx.lineTo(x + 2, y - h + 44); ctx.fill(); }
    else if (kind === 1) { ctx.fillStyle = '#0c0608'; ctx.beginPath(); ctx.ellipse(x, y - h, 38, 13, 0, Math.PI, TAU); ctx.fill(); }
    else { ctx.beginPath(); ctx.moveTo(x + 2, y - h); ctx.lineTo(x + 56, y - h + 10 + wave); ctx.lineTo(x + 30, y - h + 22 + wave * 0.5); ctx.lineTo(x + 56, y - h + 36 + wave); ctx.lineTo(x + 2, y - h + 40); ctx.fill(); }
  }

  R.scene({
    id: 'days',
    fadeIn: 0.8,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const ticks = (env.line.ticks || []).map((x) => x - env.line.start);
      const n = ticks.length || 18;
      const count = ticks.filter((x) => t >= x).length;
      // the day in progress: 0..1 between its tick and the next (sun first half, moon second)
      const cur = count ? ticks[count - 1] : 0, nxt = count < n ? ticks[count] : cur + 0.26;
      const ph = count ? clamp((t - cur) / Math.max(0.1, nxt - cur)) : 0;
      const day = count ? Math.sin(Math.PI * clamp(ph * 2)) : 0;           // 0..1..0 in the first half
      const prog = clamp(count / n);
      const fb = env.beats[1] ?? dur * 0.5;
      const surge = clamp((t - fb + 0.1) / 0.5) * (1 - 0.4 * clamp((t - fb - 1) / 2));
      // dusk sky (steady), deepening as the days pass
      KIT.vgrad(ctx, 0, HZ + 2, [[0, R.mix('#1a1838', '#0c0c22', prog)], [0.5, R.mix('#4a2e4a', '#2e1e3a', prog)], [0.82, R.mix('#b0583a', '#8a3a2a', prog)], [1, R.mix('#f0a050', '#c86a3a', prog)]]);
      // the day/night pulse only in the low horizon band
      KIT.glow(ctx, 540, HZ - 10, 760, '#ffc070', 0.35 * day, 'lighter', 0.22);
      // sun and moon on a small arc
      if (count) {
        const sunU = clamp(ph * 2), moonU = clamp(ph * 2 - 1);
        const arc = (u) => [lerp(300, 780, u), HZ - 120 - Math.sin(Math.PI * u) * 150];
        if (ph < 0.5) { const [x, y] = arc(sunU); KIT.glow(ctx, x, y, 110, '#ffc070', 0.6); ctx.fillStyle = '#ffe2a8'; ctx.beginPath(); ctx.arc(x, y, 26, 0, TAU); ctx.fill(); }
        else { const [x, y] = arc(moonU); KIT.glow(ctx, x, y, 90, '#c8d0ff', 0.4); ctx.fillStyle = '#e8ecff'; ctx.beginPath(); ctx.arc(x, y, 20, 0, TAU); ctx.fill(); ctx.fillStyle = R.mix('#2e1e3a', '#4a2e4a', 0.5); ctx.beginPath(); ctx.arc(x + 8, y - 4, 17, 0, TAU); ctx.fill(); }
      }
      // the plain
      KIT.vgrad(ctx, HZ, R.H, [[0, '#4a2a20'], [0.08, '#2a1712'], [1, '#0c0605']]);
      // the two hosts' banners along the horizon
      for (const side of [-1, 1]) {
        const col = side < 0 ? '#9a3a1c' : '#3a4a8a';
        for (let i = 0; i < 8; i++) {
          const u = i / 7, x = (side < 0 ? 40 + u * 360 : 1040 - u * 360) + (hash(i, side + 9) - 0.5) * 30;
          standard(ctx, x, HZ + 6 - hash(i, side + 3) * 8, 110 + hash(i, side + 5) * 170, i % 3, Math.sin(T * 2.4 + i) * 6, col);
        }
      }
      // dust rising between the hosts, thicker each day, surging on "fought"
      const dust = 0.08 + 0.16 * prog + 0.14 * surge;
      KIT.smoke.draw(ctx, 540, HZ + 20, T, { h: 420 + 160 * prog, w: 200, strands: 4, alpha: dust, color: '#8a6a5a', lean: 30, speed: 0.6, seed: 77, curls: 0.6, spread: 1.2 });
      const hz = ctx.createLinearGradient(0, HZ - 140, 0, HZ + 10);
      hz.addColorStop(0, 'rgba(150,100,80,0)'); hz.addColorStop(1, `rgba(150,100,80,${0.25 + 0.3 * prog + 0.2 * surge})`);
      ctx.fillStyle = hz; ctx.fillRect(0, HZ - 140, R.W, 150);
      // chariots in front, facing each other (shadow puppets with a dusk rim)
      const rimLight = Math.atan2(-1, 0);
      for (const [x, dir, ban, ph0] of [[200, 1, '#c0502a', 0], [410, 1, '#c0502a', 1.3], [880, -1, '#6a7ad0', 0.6], [670, -1, '#6a7ad0', 2.1]]) {
        A.draw(ctx, 'chariot', { x, y: HZ + 150, s: 0.48, dir, t: T, phase: ph0, gait: 0.25, fill: '#0e0708', line: null, gold: '#5a4020', banner: ban, rim: '#f0a060', light: rimLight, rimW: 3 });
      }
      for (let i = 0; i < 6; i++) {
        const side = i < 3 ? 1 : -1, x = side > 0 ? 90 + i * 70 : 990 - (i - 3) * 70;
        A.draw(ctx, 'soldier', { x, y: HZ + 230, s: 0.6, dir: side, t: T, phase: i, gait: 0.2, fill: '#0e0708', line: null, gold: '#5a4020', rim: '#e09060', light: rimLight, rimW: 2 });
      }
      // the tally band: one mark a day
      const by = 300;
      ctx.save();
      ctx.fillStyle = 'rgba(30,13,10,0.92)'; ctx.fillRect(100, by - 90, 880, 180);
      ctx.strokeStyle = 'rgba(231,181,74,0.4)'; ctx.lineWidth = 2; ctx.strokeRect(112, by - 78, 856, 156);
      ctx.lineCap = 'round';
      for (let i = 0; i < count; i++) {
        const P = tallyPos(i), age = t - ticks[i];
        const cut = E.outCubic(clamp(age / 0.08));
        const hot = Math.exp(-age / 0.3);
        ctx.strokeStyle = R.mix(PAL.goldDeep, '#fff0c0', hot);
        ctx.lineWidth = 9;
        ctx.beginPath();
        if (P.slash) { ctx.moveTo(P.gx - 18, by + 46); ctx.lineTo(lerp(P.gx - 18, P.gx + 104, cut), lerp(by + 46, by - 46, cut)); }
        else { ctx.moveTo(P.x, by - 52); ctx.lineTo(P.x, lerp(by - 52, by + 52, cut)); }
        ctx.stroke();
        if (hot > 0.05) KIT.glow(ctx, P.slash ? P.gx + 40 : P.x, by, 70, '#ffb04a', hot * 0.6);
      }
      ctx.restore();
      // the day's number
      if (count) {
        const S = env.strings;
        const a = clamp((t - ticks[0]) / 0.2);
        EP3.counter(ctx, `${(S.dayLabel || 'Day').toUpperCase()} ${count}`, KIT.CX, 470, { size: 64, alpha: a, key: 'day-n', glow: count === n ? 0.5 : 0.2 });
      }
    },
    post: () => ({ bloom: 0.4, vignette: 0.55, paper: 0.34 }),
  });
})();
