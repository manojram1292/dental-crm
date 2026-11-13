"""One-off: turns src/scenes/trailer/scenes.js from the second cut into the third (run once; kept as the record of what changed)."""
import os, re
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..'))
P = f'{ROOT}/src/scenes/trailer/scenes.js'
s = open(P).read()
assert 'THIRD CUT' not in s, 'already patched'


def sub(a, b, n=1):
    global s
    assert s.count(a) >= 1, a[:80]
    s = s.replace(a, b) if n == 0 else s.replace(a, b, n)


def span(id):
    k = f"  R.scene({{ id: '{id}'"; i = s.index(k) if k in s else s.index(f"  scene({{ id: '{id}'"); j = s.index("}) });\n", i) + len("}) });\n"); return i, j


def drop(id):
    global s
    i, j = span(id); s = s[:i] + s[j:]


def put(id, new):
    global s
    i, j = span(id); s = s[:i] + new.rstrip('\n') + '\n' + s[j:]


# ── header ──
i = s.index('/* THE FULL-EPIC TRAILER'); j = s.index('*/', i) + 2
s = s[:i] + """/* THE FULL-EPIC TRAILER, THIRD CUT · "Mahabharatam: As Vyasa Told It" (script/trailer.en.json; pipeline number 97, never a
 * numbered episode). ONE SCENE PER SHOT: every script line is a shot, built to the plan in script/TRAILER-EDIT.md; every image
 * was read in the Critical Edition first (script/TRAILER-CHECK.md). Loads after ep41/_common (EP41), ep46/_common and
 * ep49/_common (EP49.boat). Figures: src/kit/characters/epic-cast.js.
 *
 * Rules of this cut:
 *   · told once, in order: no picture and no phrase comes twice (the armies under the title, then the chariot between them at
 *     the turn, are the one field, seen once from above and once on the ground);
 *   · a sentence is one voice clip; where the picture cuts inside a sentence the script line carries "cutAt" and `multi`
 *     changes picture on the frame before that word;
 *   · every camera move has a job (a push-in on a decision, a pull-back on a consequence, a cut three frames after an impact);
 *     nothing ever stands still (the gate fails a freeze over 0.3 s);
 *   · Krishna is drawn in colour, his face in shadow or turned from us, until the universal form;
 *   · captions are drawn here, not by kit/captions.js: one phrase at a time, at most two rows, cut with the shot; a plaque's
 *     box and letters arrive together.
 */""" + s[j:]

# ── a registry of this file's scenes, so that one line can show two of them (`multi`) ──
sub("  const fin = (ctx, T) => ST.finish(ctx, T, {});", """  const SC = {}, scene = (d) => { SC[d.id] = d; R.scene(d); };
  // One sentence, one voice clip, two pictures: the picture changes on the frame before word k of the line (script "cutAt": [k]).
  const cutTimes = (env) => { const L = R.lines[env.index]; return (env.script.lines[env.index].cutAt || []).map((k) => Math.round((L.words[k].t0 - 0.07) * 30) / 30 - L.start); };
  const multi = (id, ids, post) => scene({ id, draw(ctx, t, env) { const c = [0, ...cutTimes(env), env.dur]; let k = 0; while (k < ids.length - 1 && t >= c[k + 1] - 1e-6) k++;
    const off = c[k]; SC[ids[k]].draw(ctx, t - off, { ...env, dur: c[k + 1] - c[k], speech: env.speech.map((x) => x - off), beats: (env.beats || []).map((x) => x - off) }); }, post });
  const fin = (ctx, T) => ST.finish(ctx, T, {});""")
for id in ('field', 'insA', 'insB', 'insC', 'p2', 'p3'): drop(id)
sub("R.scene({", "scene({", 0)

# ── Krishna in colour, his face in shadow: shape(…, head = [x, y, r]) darkens the head and shoulders only ──
sub("  const shape = (g, a, col, draw, noProbe) => {", "  const shape = (g, a, col, draw, noProbe, head) => {")
sub("    q.save(); q.setTransform(1, 0, 0, 1, 0, 0); q.globalCompositeOperation = 'source-atop'; q.globalAlpha = a; q.fillStyle = col; q.fillRect(0, 0, b.canvas.width, b.canvas.height); q.restore();",
    """    q.save(); q.setTransform(1, 0, 0, 1, 0, 0); q.globalCompositeOperation = 'source-atop'; q.globalAlpha = a; q.fillStyle = col; q.fillRect(0, 0, b.canvas.width, b.canvas.height); q.restore();
    if (head) { const m = g.getTransform(), hx = m.a * head[0] + m.c * head[1] + m.e, hy = m.b * head[0] + m.d * head[1] + m.f, hr = head[2] * Math.hypot(m.a, m.b);   // the face in shadow: a soft dark over the head, fading at the shoulders
      const sh = q.createRadialGradient(hx, hy, hr * 0.3, hx, hy, hr); sh.addColorStop(0, col); sh.addColorStop(0.55, col); sh.addColorStop(1, 'rgba(0,0,0,0)');
      q.save(); q.setTransform(1, 0, 0, 1, 0, 0); q.globalCompositeOperation = 'source-atop'; q.globalAlpha = head[3] ?? 0.9; q.fillStyle = sh; q.fillRect(0, 0, b.canvas.width, b.canvas.height); q.restore(); }""")
# where his head is: a standing figure of scale s with its feet at (x, y) has its head about 1000 s above them
sub("  const beat = (env, i, d) => env.beats[i] ?? d;", "  const headOf = (x, y, s, k = 1) => [x, y - 985 * s, 300 * s * k];\n  const beat = (env, i, d) => env.beats[i] ?? d;")
# the field: he stands at the reins looking ahead, away from Arjuna
i = s.index("        if (!o.noKrishna) { const sx"); j = s.index("g.restore(); }\n", i) + len("g.restore(); }\n")
s = s[:i] + """        if (!o.noKrishna) shape(g, 0.16, '#080a1c', (q) => fig('epicKrishna', q, T, KR[0], KR[1], KR[2], 'left', { w: { stand: 1 } }, lit(p, [560, 900], KR[0], 0.5, 1.0, { tint: ['#ffc8a0', 0.3] }), { emo: 'calm', gaze: [0.8, 0.1] }, 'fw-k'), false, headOf(KR[0], KR[1], KR[2]));
""" + s[j:]
sub("{ z: 1.5, haze: false, draw: (g, p) => shape(g, 0.9, '#0a0604', (q) => fig('epicKrishna', q, T, 150, 2250, 1.5, 'right', { w: { stand: 0.8, offer: 0.2 + 0.05 * Math.sin(T * 2) } }, dark(p, [760, 760], 150, { warm: '#ffb070' }), { emo: 'calm' }, 'n1-k'), true) },",
    "{ z: 1.5, haze: false, draw: (g, p) => shape(g, 0.3, '#0a0604', (q) => fig('epicKrishna', q, T, 150, 2250, 1.5, 'right', { w: { stand: 0.8, offer: 0.2 + 0.05 * Math.sin(T * 2) } }, lit(p, [760, 760], 150, 0.35, 0.9, { tint: ['#ffb070', 0.3] }), { emo: 'calm' }, 'n1-k'), true, headOf(150, 2250, 1.5, 1.15)) },")
sub("shape(g, 0.84, '#04061c', (q) => fig('epicKrishna', q, T, KX, GY + 24, 0.94, 'right',", "shape(g, 0.18, '#04061c', (q) => fig('epicKrishna', q, T, KX, GY + 24, 0.94, 'right',")
sub("dark(p, [wp[0], wp[1]], KX, { warm: '#ffd070' }), { emo: 'calm', gaze: [0.9, 0] }, 'wh-k')); } },", "lit(p, [wp[0], wp[1]], KX, 0.6, 1.1, { tint: ['#ffd070', 0.3] }), { emo: 'calm', gaze: [0.9, 0] }, 'wh-k'), false, headOf(KX, GY + 24, 0.94)); } },")
sub("shape(g, 0.86, '#0c0806', (q) => fig('epicKrishna', q, T, 850, GY + 26, 0.88, 'left',", "shape(g, 0.2, '#0c0806', (q) => fig('epicKrishna', q, T, 850, GY + 26, 0.88, 'left',")
sub("dark(p, [540, 1000], 850, { warm: '#ff9a4a' }), { emo: 'calm', gaze: [0.8, 0.3] }, 'cu-k'));", "lit(p, [540, 1000], 850, 0.5, 1.0, { tint: ['#ff9a4a', 0.35] }), { emo: 'calm', gaze: [0.8, 0.3] }, 'cu-k'), false, headOf(850, GY + 26, 0.88));")

# ── the bow: Arjuna's plaque is here now ──
sub("{ bow: 0.42 + 0.58 * E.inQuad(clamp(u * 1.5)), sit: ss(0.2, 0.8, u), turn: 1 }); fin(ctx, T); },", "{ bow: 0.42 + 0.58 * E.inQuad(clamp(u * 1.5)), sit: ss(0.2, 0.8, u), turn: 1 }); plq(ctx, env, t, 'Arjuna', 330, 330, 0.3); fin(ctx, T); },")

# ── one sentence, two pictures ──
i, j = span('dice3'); s = s[:j] + "  multi('stakes', ['dice2', 'dice3'], () => ({ bloom: 0.34, vignette: 0.52, paper: 0.32 }));\n" + s[j:]
i, j = span('needle2'); s = s[:j] + "  multi('needle', ['needle1', 'needle2'], () => ({ bloom: 0.3, vignette: 0.55, paper: 0.3 }));\n" + s[j:]

# ── the war: one shot a sentence ──
drop('arrows1')
put('arrows2', """  // from his face, the arrows coming in, back to the whole bed
  scene({ id: 'arrows', draw(ctx, t, env) { const T = env.T, u = t / env.dur; arrowsWorld(ctx, T, t + 0.3, frame('pull', u, { z: 2.3, f: [700, 960], s: [540, 900] }, { z: 1.03, f: [540, 960] }, ev(E.inOutSine))); fin(ctx, T); }, post: () => ({ bloom: 0.38, vignette: 0.45, paper: 0.3 }) });""")
drop('boy1')
put('boy2', """  scene({ id: 'boy', draw(ctx, t, env) { const T = env.T, u = t / env.dur; boyWorld(ctx, T, shake({ ...CAM.orbit(u, { from: -1, to: 1, amp: 150, zoom: lerp(1.55, 1.1, E.outCubic(u)), turn: 0.035 }) }, T, 4), E.inQuad(0.1 + 0.9 * u)); fin(ctx, T); }, post: () => ({ bloom: 0.3, vignette: 0.55, paper: 0.3 }) });""")
drop('mud1')
put('mud2', """  scene({ id: 'mud',
    draw(ctx, t, env) { const T = env.T, u = t / env.dur, dropT = env.dur - 0.1, d = E.inQuad(clamp((t - (dropT - 0.22)) / 0.22)), hit = clamp((t - dropT) / 0.1);
      mudWorld(ctx, T, shake(frame('tilt', u, { z: 1.6, f: [380, 740], s: [540, 800] }, { z: 1.25, f: [700, 1086], s: SPOT }, ev(E.inOutSine)), T, 26 * hit * (1 - hit) * 4), u, d, hit); fin(ctx, T); },
    post: () => ({ bloom: 0.42, vignette: 0.5, paper: 0.3 }) });""")

# ── the universal form: the frame full to the bottom; the form held longer ──
sub("    g.fillStyle = '#1a0a1e'; g.fillRect(-2600, 1235, 6300, 3000); const gg = g.createLinearGradient(0, 1235, 0, 1420); gg.addColorStop(0, 'rgba(255,190,90,0.55)'); gg.addColorStop(1, 'rgba(255,190,90,0)'); g.fillStyle = gg; g.fillRect(-2600, 1235, 6300, 190);",
    """    { const eg = g.createLinearGradient(0, 1235, 0, 2000); eg.addColorStop(0, '#c8742a'); eg.addColorStop(0.25, '#7a3420'); eg.addColorStop(0.7, '#3a1630'); eg.addColorStop(1, '#241028'); g.fillStyle = eg; g.fillRect(-2600, 1235, 6300, 3000); }
    // the two armies under it (26 dhārtarāṣṭrasya putrāḥ … asmadīyair api yodhamukhyaiḥ: both sides), row behind row down to our feet, an aisle between them where the one chariot stands; its light on their spears and on the ground
    { g.save(); g.globalCompositeOperation = 'lighter'; g.translate(540, 1235); g.scale(1, 0.34); KIT.glow(g, 0, 0, 1500, '#ffc060', 0.55); g.restore(); }
    for (const [yy, sc_] of [[1292, 0.3], [1352, 0.42], [1440, 0.6], [1570, 0.86], [1760, 1.2], [2030, 1.7]]) { const n = Math.round(15 / Math.sqrt(sc_)), gap = 90 + 260 * (sc_ - 0.3);
      army(g, 540 - gap - 1500, 540 - gap, yy, n, 1, sc_ > 0.8 ? '#12060f' : '#1e0a18', T, { s: sc_, flag: '#e7b54a', spear: '#ffe0a0' }); army(g, 540 + gap, 540 + gap + 1500, yy, n, -1, sc_ > 0.8 ? '#12060f' : '#1e0a18', T, { s: sc_, flag: '#c8401a', spear: '#ffe0a0' }); }""")
sub("x0 = 540 + sd * (130 + 420 * hash(i, 5)), y0 = 1222;", "deep = hash(i, 13) * hash(i, 14), x0 = 540 + sd * (130 + 420 * hash(i, 5)) * (1 + 0.5 * deep), y0 = 1222 + 620 * deep;")
sub("s = lerp(9, 3, q), onBody", "s = lerp(9 + 16 * deep, 3, q), onBody")
sub("for (let i = 0; i < 150; i++) { const sd = i % 2 ? 1 : -1, m = mouths", "for (let i = 0; i < 230; i++) { const sd = i % 2 ? 1 : -1, m = mouths")
sub("    row(40, 0.62, [-80, 150, 380, 700, 930, 1160], 11, 0.94);", "    row(-150, 0.5, [-140, 40, 220, 400, 580, 760, 940, 1120], 23, 0.95);\n    row(40, 0.62, [-80, 150, 380, 700, 930, 1160], 11, 0.94);")
sub("const T = env.T, w = env.words, sp2 = w[6] ? w[6].t0 : 2.4, lightK = ss(0.2, sp2 - 0.9, t), moveT = sp2 - 1.5;", "const T = env.T, w = env.words, sp2 = w[4] ? w[4].t0 : 2.0, lightK = ss(0.15, sp2 - 0.75, t), moveT = Math.max(0.25, sp2 - 1.45), PULL = 1.8;")
sub("const e = E.inOutCubic(clamp((t - moveT) / 2.3)), creep = clamp((t - moveT - 2.3) / Math.max(0.5, env.dur - moveT - 2.3));", "const e = E.inOutCubic(clamp((t - moveT) / PULL)), creep = clamp((t - moveT - PULL) / Math.max(0.5, env.dur - moveT - PULL));")
sub("scr = [lerp(540, face[0], e), lerp(800, face[1], e)];", "scr = [lerp(540, face[0], e), lerp(800, face[1] + 150, e)];   // the horizon ends low in the frame: the form above it, the armies below")
sub("const fl = Math.max(0, 1 - Math.abs(t - (sp2 - 1.0)) / 0.45);", "const fl = Math.max(0, 1 - Math.abs(t - (sp2 - 0.85)) / 0.4);")
sub("sh.addColorStop(1, `rgba(10,4,14,${0.6 * e})`); ctx.fillStyle = sh; ctx.fillRect(0, 1240, W, 700);", "sh.addColorStop(1, `rgba(10,4,14,${0.22 * e})`); ctx.fillStyle = sh; ctx.fillRect(0, 1240, W, 700);")

# ── the word: larger, a slow push-in, each part struck in on its syllable ──
sub("size = 150, y = 820, sheen = ((t * 0.8) % 1.5) * 1.5 - 0.4, zs = lerp(0.86, 0.98, u);", "size = 172, y = 800, sheen = ((t * 0.8) % 1.5) * 1.5 - 0.4, zs = lerp(0.9, 1.05, u);")
sub("gap = 86 * sp,", "gap = 44 * sp,")
sub("lift = 1 + 0.12 * Math.sin(Math.PI * clamp((t - tI[i] + 0.04) / 0.4));", "hitK = clamp((t - tI[i] + 0.04) / 0.32), lift = 1 + 0.3 * (1 - E.outCubic(hitK)) * (said > 0 ? 1 : 0);\n        if (said > 0 && hitK < 1) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; KIT.glow(ctx, cx, y - 50, 300 + 260 * hitK, '#ffd070', 0.75 * (1 - hitK)); ctx.strokeStyle = `rgba(255,224,150,${0.8 * (1 - hitK)})`; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(cx, y - 50, 120 + 240 * E.outCubic(hitK), 0, TAU); ctx.stroke(); ctx.restore(); }")
sub("lerp(0.45, 1, Math.max(said, 0)) : 1), glow: 0.45, sheen, key: 'tr-w' + i });", "lerp(0.4, 1, Math.max(said, 0)) : 1), glow: 0.6, sheen, key: 'tr-w' + i });")
sub("ctx.fillRect(cx - ws[i] / 2, y + 34, ws[i], 4); ctx.font = R.font(54, 'caption', 600, 'italic');", "ctx.fillRect(cx - ws[i] / 2, y + 38, ws[i], 5); ctx.font = R.font(62, 'caption', 600, 'italic');")
sub("ctx.fillText(gl[i], cx, y + 104); ctx.restore(); }", "ctx.fillText(gl[i], cx, y + 116); ctx.restore(); }")
sub("KIT.goldText(ctx, S.wordMeaning.toUpperCase(), 540, 1130, { size: 76,", "KIT.goldText(ctx, S.wordMeaning.toUpperCase(), 540, 1110, { size: 88,")
sub("KIT.glow(g, 540, 800, 760 + 120 * Math.sin(T * 1.7), '#ffb040', 0.26 + 0.14 * u + 0.1 * Math.sin(T * 2.6));", "KIT.glow(g, 540, 800, 860 + 120 * Math.sin(T * 1.7), '#ffb040', 0.34 + 0.2 * u + 0.1 * Math.sin(T * 2.6));")

# ── the promise: a pulse on each "Every" ──
sub("g.fillStyle = gr; g.fillRect(-900, -900, 2880, 3720); KIT.glow(g, 540, 900, 900, '#4a6ae0', 0.3); } },", "g.fillStyle = gr; g.fillRect(-900, -900, 2880, 3720); const pk = Math.max(...[0.05, ...(env.beats || [])].map((b_) => (t >= b_ ? Math.exp(-(t - b_) / 0.25) : 0))); KIT.glow(g, 540, 900, 900, '#4a6ae0', 0.3); KIT.glow(g, 540, 900, 1100, '#ffc860', 0.35 * pk); } },")

# ── "Nothing added for effect": the old follow shot without its word ──
i, j = span('follow'); blk = s[i:j]
blk = blk.replace("id: 'follow'", "id: 'nothing'").replace("b1 = w[4] ? w[4].t0 : env.dur * 0.6,", "b1 = env.dur * 0.4,")
a = blk.index("      const kf = clamp("); b = blk.index("      fin(ctx, T);", a); blk = blk[:a] + blk[b:]
blk += """
  // ── MAKING: palm leaves laid down one after another, lines of writing on each, a cord through them: the series as it is made ──
  scene({ id: 'making',
    draw(ctx, t, env) {
      const T = env.T, u = t / env.dur, cam = frame('slide', u, { z: 1.1, f: [470, 900] }, { z: 1.1, f: [610, 980] }, (x) => x);
      ST.shot(ctx, T, { pal: 'memory-indigo', cam, layers: [
        { z: 0, haze: false, draw: (g) => { const gr = g.createLinearGradient(0, -400, 0, 2200); gr.addColorStop(0, '#0a0a24'); gr.addColorStop(1, '#2a1608'); g.fillStyle = gr; g.fillRect(-900, -900, 2880, 3720); KIT.glow(g, 540, 1500, 1200, '#ff9a3a', 0.3 * KIT.flicker(T, 3)); } },
        { z: 1, haze: false, draw: (g) => { for (let i = 0; i < 7; i++) { const k = E.outCubic(clamp((t - 0.05 - i * 0.3) / 0.4)); if (k <= 0) continue; const y = 430 + i * 152, x = lerp(1700, 540 + (i % 2 ? 26 : -26), k), wr = clamp((t - 0.3 - i * 0.3) / 0.9), newest = clamp(1 - (t - 0.05 - i * 0.3) / 0.6);
            g.save(); g.translate(x, y); g.rotate((i % 2 ? 1 : -1) * 0.012 + 0.2 * (1 - k)); g.fillStyle = 'rgba(0,0,0,0.4)'; g.beginPath(); g.roundRect(-392, -50, 800, 124, 14); g.fill();
            if (newest > 0) KIT.glow(g, 0, 0, 520, '#ffd070', 0.5 * newest);
            g.fillStyle = '#dcbc7c'; g.strokeStyle = '#7a5626'; g.lineWidth = 4; g.beginPath(); g.roundRect(-400, -60, 800, 120, 14); g.fill(); g.stroke();
            g.fillStyle = '#3a2410'; for (const hx of [-250, 250]) { g.beginPath(); g.arc(hx, 0, 11, 0, TAU); g.fill(); }
            g.strokeStyle = '#3a2410'; g.lineWidth = 5; g.lineCap = 'round'; for (let r = 0; r < 3; r++) { const yy = -32 + r * 32, upto = clamp(wr * 3 - r); if (upto <= 0) continue; g.beginPath(); for (let c = 0; c < Math.floor(26 * upto); c++) { const xx = -370 + c * 28.5; if (Math.abs(xx - 250) < 26 || Math.abs(xx + 250) < 26) continue; const hh = 8 + 9 * hash(i * 31 + r * 7 + c, 5); g.moveTo(xx, yy - hh * 0.5); g.quadraticCurveTo(xx + 9, yy - hh, xx + 18, yy + hh * 0.4); } g.stroke(); g.lineWidth = 3; g.beginPath(); g.moveTo(-374, yy - 13); g.lineTo(-374 + 748 * upto, yy - 13); g.stroke(); g.lineWidth = 5; }
            g.restore(); }
          g.strokeStyle = '#a8301a'; g.lineWidth = 7; const top = clamp(t / 0.4); for (const hx of [-250, 250]) { g.beginPath(); g.moveTo(540 + hx, 330); g.lineTo(540 + hx + 8 * Math.sin(T * 2 + hx), lerp(330, 430 + 152 * Math.min(6, t / 0.3), top)); g.stroke(); } } },
        { z: 1.4, haze: false, draw: (g) => ST.particles(g, T * 2, { kind: 'ember', count: 50, cam }) },
      ] });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.36, vignette: 0.5, paper: 0.32 }) });

  // ── SUPPORT: the listeners' ring at the fire, from behind; one place in it is empty and lit ──
  scene({ id: 'support',
    draw(ctx, t, env) {
      const T = env.T, u = t / env.dur, fl = KIT.flicker(T, 5), cam = frame('crane', u, { z: 1.3, f: [540, 760] }, { z: 1.04, f: [540, 1000] }, ev(E.outCubic));
      const sitter = (g, x, y, sc_, col, rim) => { g.fillStyle = col; g.beginPath(); g.ellipse(x, y - 150 * sc_, 150 * sc_, 200 * sc_, 0, 0, TAU); g.fill(); g.beginPath(); g.arc(x, y - 400 * sc_ + 3 * Math.sin(T * 1.3 + x), 72 * sc_, 0, TAU); g.fill();
        g.strokeStyle = rim; g.lineWidth = 6 * sc_; g.beginPath(); g.arc(x, y - 400 * sc_ + 3 * Math.sin(T * 1.3 + x), 72 * sc_, -2.6, -0.5); g.stroke(); g.beginPath(); g.ellipse(x, y - 150 * sc_, 150 * sc_, 200 * sc_, 0, -2.5, -0.64); g.stroke(); };
      ST.shot(ctx, T, { pal: 'hearth-amber', cam, layers: [
        { z: 0, draw: (g, p) => ST.sky(g, p, { hz: 1180, stars: 0.6, T }) },
        { z: 0.3, draw: (g, p) => ST.treeline(g, p, { y: 1220, h: 760, T, seed: 31, kind: 'sal' }) },
        { z: 0.7, haze: false, draw: (g) => { g.fillStyle = '#1c0e06'; g.fillRect(-900, 1180, 2880, 1900); g.save(); g.globalCompositeOperation = 'lighter'; g.translate(540, 1330); g.scale(1, 0.3); KIT.glow(g, 0, 0, 1100, '#ff8a2a', 0.6 * fl); g.restore();
          for (const [x, sc_] of [[250, 0.42], [400, 0.4], [680, 0.4], [830, 0.42]]) sitter(g, x, 1300, sc_, '#5a2c12', 'rgba(255,190,110,0.9)');   // across the fire, facing us, lit
          KIT.glow(g, 540, 1080, 760, '#ff8a2a', 0.5 * fl); CH.hearthfire.draw(g, { x: 540, y: 1330, scale: 0.72, t: T, k: 1.1, key: 'su-f' }); } },
        { z: 1, haze: false, draw: (g) => { for (const [x, y, sc_] of [[60, 1800, 1.05], [330, 1730, 0.95], [760, 1730, 0.95], [1030, 1800, 1.05]]) sitter(g, x, y, sc_, '#120805', 'rgba(255,170,90,0.85)');
          // the empty place: a mat, lit, waiting
          const pu = 0.5 + 0.5 * Math.sin(T * 3.2), a = ss(0.25, 0.6, u); g.save(); g.translate(545, 1690); g.scale(1, 0.32); g.globalCompositeOperation = 'lighter'; KIT.glow(g, 0, 0, 330 + 40 * pu, '#ffd070', (0.5 + 0.3 * pu) * a); g.restore();
          g.save(); g.translate(545, 1690); g.scale(1, 0.32); g.fillStyle = `rgba(200,150,70,${0.9 * a + 0.1})`; g.beginPath(); g.arc(0, 0, 150, 0, TAU); g.fill(); g.strokeStyle = `rgba(255,224,150,${a})`; g.lineWidth = 12; g.beginPath(); g.arc(0, 0, 150 + 26 * pu, 0, TAU); g.stroke(); g.restore(); } },
        { z: 1.4, haze: false, draw: (g) => ST.particles(g, T, { kind: 'ember', count: 60, box: [240, 300, 600, 1000], cam }) },
      ] });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.4, vignette: 0.5, paper: 0.3 }) });
"""
s = s[:i] + blk + s[j:]

# ── the end card ──
put('endcard', """  // Everything that must be read sits left of x = 920 and above y = 1500 (the platforms' own buttons and captions cover the rest).
  scene({ id: 'endcard',
    draw(ctx, t, env) {
      const T = env.T, S = env.strings, u = t / env.dur, cam = frame('push', u, { z: 1.0, f: [540, 960] }, { z: 1.12, f: [540, 1000] }, (x) => x), z = lerp(1, 1.045, u), CXT = 490;
      ST.shot(ctx, T, { pal: 'arrival-umber-gold', cam, layers: [
        { z: 0, haze: false, draw: (g) => { const gr = g.createRadialGradient(540, 1300, 80, 540, 1300, 1500); gr.addColorStop(0, '#6a3c0c'); gr.addColorStop(0.5, '#1c1006'); gr.addColorStop(1, '#060302'); g.fillStyle = gr; g.fillRect(-900, -900, 2880, 3720); } },
        { z: 0.5, haze: false, draw: (g) => { KIT.glow(g, 540, 1300, 900, '#ffb040', 0.3 + 0.05 * Math.sin(T * 3)); g.save(); g.translate(540, 1300); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 14; i++) { const a = (i / 14) * TAU - T * 0.25; g.fillStyle = 'rgba(255,170,60,0.07)'; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a - 0.06) * 1900, Math.sin(a - 0.06) * 1900); g.lineTo(Math.cos(a + 0.06) * 1900, Math.sin(a + 0.06) * 1900); g.fill(); } g.restore(); } },
        { z: 0.8, haze: false, draw: (g) => CH.hearthfire.draw(g, { x: 540, y: 1840, scale: 0.95, t: T, k: 1.1, key: 'ec-f' }) },
        { z: 1.2, haze: false, draw: (g) => ST.particles(g, T * 1.6, { kind: 'ember', count: 90, cam }) },
        { z: 1.6, haze: false, draw: (g) => ST.particles(g, T * 2.2 + 5, { kind: 'ember', count: 50, cam }) },
      ] });
      const inn = (d) => E.outCubic(clamp((t - d) / 0.22)), fit = (txt, size, fam, wt, st, maxW) => { let fs = size; ctx.font = R.font(fs, fam, wt, st); while (ctx.measureText(txt).width > maxW && fs > 20) { fs -= 1; ctx.font = R.font(fs, fam, wt, st); } return fs; };
      ctx.save(); ctx.translate(CXT, 760); ctx.scale(z, z); ctx.translate(-CXT, -760);
      // 1 · FOLLOW: the largest thing on the card, in a ring that beats
      const k1 = inn(0.02), FY = 600, pu = (T * 0.9) % 1;
      if (k1 > 0) { ctx.save(); ctx.globalAlpha = k1; ctx.fillStyle = 'rgba(14,8,6,0.78)'; ctx.beginPath(); ctx.roundRect(CXT - 400, FY - 170, 800, 250, 40); ctx.fill(); ctx.strokeStyle = PAL.gold; ctx.lineWidth = 6; ctx.stroke();
        for (const ph of [pu, (pu + 0.5) % 1]) { ctx.globalAlpha = k1 * 0.8 * (1 - ph); ctx.strokeStyle = '#ffe0a0'; ctx.lineWidth = 7 * (1 - ph) + 1; ctx.beginPath(); ctx.roundRect(CXT - 400 - 34 * ph, FY - 170 - 34 * ph, 800 + 68 * ph, 250 + 68 * ph, 40 + 20 * ph); ctx.stroke(); } ctx.restore();
        KIT.goldText(ctx, (S.followWord || '').toUpperCase(), CXT, FY, { size: 176, spacing: 12, weight: 700, alpha: k1, glow: 0.5, sheen: ((t * 0.7) % 1.5) * 1.5 - 0.4, key: 'tr-follow2' }); }
      // 2 · Watch Episode 1 · its name
      const k2 = inn(0.3); if (k2 > 0) { ctx.save(); ctx.globalAlpha = k2; ctx.textAlign = 'center'; ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = R.px(8);
        ctx.letterSpacing = '6px'; fit((S.nextEpisodeLabel || '').toUpperCase(), 78, 'display', 700, 'normal', 800); ctx.fillStyle = PAL.goldPale; ctx.fillText((S.nextEpisodeLabel || '').toUpperCase(), CXT, 870);
        ctx.letterSpacing = '0px'; fit(S.nextTitle || '', 66, 'caption', 600, 'italic', 800); ctx.fillStyle = PAL.cream; ctx.fillText(S.nextTitle || '', CXT, 960); ctx.fillStyle = PAL.gold; ctx.fillRect(CXT - 220 * k2, 996, 440 * k2, 4); ctx.restore(); }
      // 3 · support, small
      const k3 = inn(0.6); if (k3 > 0) { ctx.save(); ctx.globalAlpha = k3; ctx.textAlign = 'center'; ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = R.px(6); fit(S.supportLine || '', 44, 'caption', 600, 'normal', 800); ctx.fillStyle = '#ffe9c0'; ctx.fillText(S.supportLine || '', CXT, 1090); ctx.restore(); }
      // 4 · the source line, smallest
      const k4 = inn(0.85); if (k4 > 0) { ctx.save(); ctx.globalAlpha = 0.92 * k4; ctx.textAlign = 'center'; ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = R.px(6); ctx.fillStyle = '#e8d8b8'; fit(S.sourceLine || '', 32, 'caption', 500, 'normal', 800); ctx.fillText(S.sourceLine || '', CXT, 1200); fit(S.madeLine || '', 28, 'caption', 500, 'normal', 800); ctx.fillText(S.madeLine || '', CXT, 1246); ctx.restore(); }
      ctx.restore();
      // the pointer: three chevrons running down toward the account's own Follow button, bottom left
      const k5 = inn(1.0); if (k5 > 0) { ctx.save(); ctx.strokeStyle = '#ffd070'; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 12; for (let i = 0; i < 3; i++) { const ph = (T * 1.4 - i * 0.22) % 1, a = Math.sin(Math.PI * clamp(ph)); ctx.globalAlpha = k5 * (0.25 + 0.75 * a); const x = 190, y = 1300 + i * 58 + 10 * a; ctx.beginPath(); ctx.moveTo(x - 46, y); ctx.lineTo(x, y + 40); ctx.lineTo(x + 46, y); ctx.stroke(); } ctx.restore(); }
      if (R.probe) R.probe.card = { follow: [CXT - 400, FY - 170, CXT + 400, FY + 80], lowestText: 1246 + 150, rightmostText: CXT + 400 * z };
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.42, vignette: 0.5, paper: 0.3 }) });""")
open(P, 'w').write(s)
print('patched', len(s.splitlines()), 'lines')
