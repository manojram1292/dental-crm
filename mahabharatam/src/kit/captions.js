/*
 * KIT.captions · narration captions, drawn over every scene by the engine
 * (REEL.overlay). Text comes ONLY from script/<lang>.json; word timings come
 * from build/timeline.<lang>.json, so captions follow any voice/language.
 *
 * Style: EB Garamond, cream with a dark 7 px outline (from the November remaster) on a soft painted scrim, revealed word by word
 * (each word rises and warms in on its own time); names listed in a line's
 * `emphasis` are set in gold. Kept inside the Shorts safe zone: centred on
 * SAFE's centre, bottom edge at y = 1490 (YouTube UI covers the bottom ~20%
 * and right ~15%).
 *
 * A line with "caption": false is not captioned (the end card shows its text).
 * A line with "captionY": <px> sets the caption block's bottom baseline (default 1488), so a
 * shot whose key action is low can lift the caption above it (e.g. 560: upper third, still
 * inside SAFE). "captionY" can also be "high" (= 560). Episodes 1–6 use the default.
 *
 * THE FIXED BAND (episode 31 on; independent review 21–30, item 7): a script with "captionBand": { "y": 1400 } puts every
 * caption in ONE place (captionY is ignored: the shots are composed around the band), in a bolder upright face (700),
 * with the WHOLE line shown at full contrast from its first word (no dim, unrevealed words); the word being spoken
 * warms to white-gold. The scrim is darker (≥ 4.5:1 for cream on it, even over white skies).
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT;
  const { clamp, lerp, E, PAL } = R;

  const CFG = { size: 64, lineH: 78, maxW: 820, bottom: 1488, weight: 600 };
  KIT.CX = (R.SAFE.x0 + R.SAFE.x1) / 2; // 495: optical centre of the safe area
  const layouts = new Map();
  const core = (w) => w.replace(/[^\p{L}\p{N}]/gu, '').toLowerCase();

  function layout(ctx, L) {
    const key = `${L.id}|${R.lang}|${R.scale}`;
    let lay = layouts.get(key);
    if (lay) return lay;
    ctx.save();
    ctx.font = R.font(CFG.size, 'caption', R.script && R.script.captionBand ? 700 : CFG.weight);
    const space = ctx.measureText(' ').width;
    const emph = (L.emphasis || []).map(core);
    const rows = [[]];
    let x = 0;
    L.words.forEach((w, i) => {
      const ww = ctx.measureText(w.w).width;
      if (x > 0 && x + ww > CFG.maxW) { rows.push([]); x = 0; }
      const c = core(w.w);
      rows[rows.length - 1].push({ i, w: w.w, x, ww, gold: !!c && emph.some((e) => c.startsWith(e)) });
      x += ww + space;
    });
    ctx.restore();
    const out = rows.map((r) => { const last = r[r.length - 1]; return { words: r, width: last ? last.x + last.ww : 0 }; });
    lay = { rows: out };
    layouts.set(key, lay);
    return lay;
  }

  function draw(ctx, T) {
    const lines = R.lines; let i = R.lineIndexAt(T), L = lines[i];
    // J- and L-cuts (episode 41 on): a voice may start before its picture (speechStart < start) or run past it
    // (speechEnd > end); the caption follows the VOICE, in the same fixed band.
    const nx = lines[i + 1], pv = lines[i - 1];
    if (nx && nx.speechStart < nx.start - 0.01 && T >= nx.speechStart - 0.08 && nx.caption !== false) L = nx;
    else if (pv && pv.speechEnd > pv.end + 0.01 && T < pv.speechEnd + 0.25 && T < L.speechStart - 0.08 && pv.caption !== false) L = pv;
    if (!L || L.caption === false) return;
    const tIn = L.speechStart - 0.08, tOut = L.speechEnd > L.end + 0.01 ? L.speechEnd + 0.3 : (lines[lines.indexOf(L) + 1] && lines[lines.indexOf(L) + 1].speechStart < L.end ? lines[lines.indexOf(L) + 1].speechStart - 0.02 : L.end - 0.08);
    const vis = clamp((T - tIn) / 0.2) * (1 - clamp((T - (tOut - 0.28)) / 0.28));
    if (vis <= 0.001) return;
    const BAND = R.script && R.script.captionBand;
    const lay = layout(ctx, L);
    const n = lay.rows.length;
    const bottom = BAND ? BAND.y : L.captionY === 'high' ? 560 : (typeof L.captionY === 'number' ? L.captionY : CFG.bottom);
    const top = bottom - (n - 1) * CFG.lineH;
    if (R.probe && R.faces && R.faces.some((f) => f.y + f.r * 0.8 > top - CFG.size && f.y - f.r * 0.8 < bottom + 14 && Math.abs(f.x - KIT.CX) < Math.max(...lay.rows.map((q) => q.width)) / 2 + f.r * 0.8)) R.probe.type.captionFace = (R.probe.type.captionFace || 0) + 1;   // the gate: a caption must not cross a face
    // painted scrim behind the caption block
    ctx.save();
    ctx.globalAlpha = vis * (BAND ? 0.95 : 0.78);
    const g = ctx.createLinearGradient(0, top - 200, 0, bottom + 110);
    const sa = BAND ? 0.8 : 0.62;
    g.addColorStop(0, 'rgba(10,7,6,0)'); g.addColorStop(0.45, `rgba(10,7,6,${sa})`); g.addColorStop(0.8, `rgba(10,7,6,${sa})`); g.addColorStop(1, 'rgba(10,7,6,0)');
    ctx.fillStyle = g; ctx.fillRect(0, top - 200, R.W, bottom + 110 - (top - 200));
    ctx.restore();
    ctx.save();
    ctx.font = R.font(CFG.size, 'caption', BAND ? 700 : CFG.weight);
    ctx.textBaseline = 'alphabetic';
    ctx.shadowColor = 'rgba(8,5,3,0.9)';
    ctx.shadowBlur = R.px(12);
    ctx.shadowOffsetY = R.px(2);
    lay.rows.forEach((row, r) => {
      const y0 = top + r * CFG.lineH, x0 = KIT.CX - row.width / 2;
      for (const w of row.words) {
        const wt = L.words[w.i];
        const k = BAND ? 1 : clamp((T - (wt.t0 - 0.05)) / 0.34);
        if (k <= 0) continue;
        const e = E.outCubic(k);
        const speaking = clamp((T - wt.t0) / 0.08) * (1 - clamp((T - wt.t1) / 0.35));
        ctx.globalAlpha = vis * e;
        const base = w.gold ? PAL.goldPale : PAL.cream;
        ctx.fillStyle = w.gold ? R.mix(PAL.gold, '#ffe6a6', speaking * 0.6) : BAND ? R.mix(base, '#fff2c8', speaking * 0.8) : R.mix(base, '#ffffff', speaking * 0.35);
        // KINETIC EMPHASIS (episode 41 on; "captionBand": { "kinetic": true }): a gilded word swells a little as it is spoken
        // and a brushed gold underline draws on under it and stays. The band itself never moves.
        const kin = BAND && BAND.kinetic && w.gold;
        if (kin) {
          const pop = Math.sin(Math.PI * clamp((T - wt.t0) / 0.42)) * 0.06, ul = E.outCubic(clamp((T - wt.t0) / 0.35));
          const cx = x0 + w.x + w.ww / 2;
          ctx.translate(cx, y0 - 20); ctx.scale(1 + pop, 1 + pop); ctx.translate(-cx, -(y0 - 20));
          if (ul > 0) { ctx.save(); ctx.shadowColor = 'transparent'; ctx.globalAlpha = vis * 0.9; ctx.fillStyle = PAL.gold; ctx.beginPath(); ctx.moveTo(x0 + w.x - 4, y0 + 12); ctx.quadraticCurveTo(x0 + w.x + w.ww * ul * 0.5, y0 + 7, x0 + w.x + (w.ww + 4) * ul, y0 + 11); ctx.quadraticCurveTo(x0 + w.x + w.ww * ul * 0.5, y0 + 15, x0 + w.x - 4, y0 + 16); ctx.fill(); ctx.restore(); }
          if (R.probe) R.probe.type.kinetic = 1;
        }
        // (independent review, item 4) a dark outline under every word: legible over bright skies and crowds
        ctx.save(); ctx.shadowColor = 'transparent'; ctx.lineJoin = 'round'; ctx.lineWidth = 7; ctx.strokeStyle = 'rgba(12,8,6,0.85)';
        ctx.strokeText(w.w, x0 + w.x, y0 + (1 - e) * 16); ctx.restore();
        ctx.fillText(w.w, x0 + w.x, y0 + (1 - e) * 16);
        if (kin) ctx.setTransform(R.scale, 0, 0, R.scale, 0, 0);
      }
    });
    ctx.restore();
  }

  KIT.captions = { draw, CFG };
  R.overlay = draw;
})();
