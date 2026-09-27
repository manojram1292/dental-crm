# CLAUDE — MOTION REEL 2026 · Director's storyboard

A 15-second motion design showreel, the kind a senior motion designer puts at
the top of a résumé. Every frame is generated from code. It has to feel like the
work of someone with **taste, restraint and technical range**, not a tech demo.

**Arc: "It starts with a curve."** Seven chapters, each one a fundamental of
motion design, getting harder as it goes. The HUD labels every chapter, so the
reel reads as a résumé:

| # | Time (s) | Frames | Chapter (HUD label) | Background in → out |
|---|----------|--------|---------------------|---------------------|
| 1 | 0.00–2.00 | 0–119 | EASING & TIMING | ink → **solid signal** |
| 2 | 2.00–4.00 | 120–239 | KINETIC TYPE | **solid signal** → **solid paper** |
| 3 | 4.00–6.00 | 240–359 | SHAPE & RHYTHM | **solid paper** → **solid ink** |
| 4 | 6.00–8.00 | 360–479 | PARTICLES & FLOW | **solid ink** → **lattice of dots on ink** |
| 5 | 8.00–10.00 | 480–599 | 3D & DIMENSION | **lattice of dots on ink** → glitch-out |
| 6a | 10.00–11.00 | 600–659 | RANGE (cuts 1–4) | glitch-in → hard cut |
| 6b | 11.00–12.00 | 660–719 | RANGE (cuts 5–8) | hard cut → **black + fading dot** |
| 7 | 12.00–15.00 | 720–899 | CONTACT | **black** → end card (final frame = hero still) |

Bold states are hard hand-off contracts: the last frame of one scene and the
first frame of the next must match exactly, so every cut is a seamless match cut.

---

## 1. Technical contract (read before writing code)

* **Files.** Each scene is one classic script, `src/scenes/sN-*.js`, that calls
  `REEL.scene({...})` inside an IIFE. No ES modules, no imports, no network. Use
  helpers from `window.REEL` (see `src/engine.js`, which is well commented).
* **Pure function of time.** `draw(ctx, t, env)` must produce the same pixels
  for the same `t` no matter the call order. No state carried between calls, no
  `Math.random()`, no `Date`, no `performance.now()`. Randomness comes from
  `REEL.rng(seed)` (create it inside draw or in init) or `REEL.hash(i, seed)`.
  Anything that needs simulation (flow-field particles and so on) is
  **pre-simulated in `init()`** at a fixed timestep and looked up or
  interpolated in `draw`. The renderer calls `draw` at sub-frame times for
  motion blur and splits frames across parallel pages, so hidden state *will*
  show up as glitches.
* **Local time.** `t` = seconds since the scene start; `env.T` = absolute
  seconds; `env.p` = 0..1 progress; `env.W`=1920, `env.H`=1080. Frames are at
  exact multiples of 1/60 s, and the last frame of a scene is at `t = dur - 1/60`.
* **Logical pixels.** Always draw in 1920×1080 logical px. The runtime
  pre-scales the context. For offscreen canvases use `REEL.buffer(key, w, h)`,
  which is scale-aware. `ctx.filter` blur and `shadowBlur` are in *backing*
  pixels, so use `REEL.blur(px)` and `REEL.px(n)`.
* **Paint the whole frame.** The engine clears to ink, but each scene owns its
  background. Leave the context state however you like: the engine
  saves/restores around `draw`.
* **Performance.** Aim for ≤ 60 ms per draw at scale 1 in headless Chromium
  (check with `node tools/preview.mjs bench --from A --to B`), and never more
  than 150 ms. The final render samples every frame 8 times for motion blur.
  Avoid per-pixel JS loops over full-res buffers.
* **Safe areas.** The HUD lives in the top 110 px and bottom 110 px (crop
  marks at a 44 px inset, mono labels at x=80). Keep hero content inside
  roughly x∈[120,1800], y∈[130,950]. Full-bleed colour and texture are fine
  everywhere.
* **HUD overrides (optional).** `hud(t, env)` may return
  `{ alpha, jitter, label }`. The montage uses `label` to rename its chapter
  per cut, and `jitter` (0..1) to shake the HUD during glitches.
* **Motion blur is automatic.** The final render averages 8 sub-frames across a
  180° shutter. Do not fake blur on fast moves, because real blur is coming.
  Check it with `preview.mjs frames --times … --mb 8`.

### Engine cheat-sheet (`REEL.*`)
`PAL` colours · `font(size, family, weight, style)`, where families are
`display` (Inter Tight, variable 100–900, italic 900), `serif` (Instrument
Serif, regular and italic) and `mono` (JetBrains Mono 100–800). Variable weights animate: `font(300, 'display', lerp(100, 900, p))`.
`ctx.letterSpacing = '12px'` works.
Timing: `seg(t,a,b)`, `ease(t,a,b,fn)`, `tween(t, keys)`, `stagger(t, i, n, {start, spread, dur, fn})`, `clamp/lerp/remap/smoothstep`.
Easing: `E.outExpo, E.inOutQuint, E.outBack, E.backOut(s), E.spring(bounces, damping), E.bezier(x1,y1,x2,y2), E.reel` (the signature S1 curve), `E.snap`, `E.whip`, plus the standard families.
Beat: `beatIndex(T)`, `beatPhase(T)`, `beatPulse(T, decay)`. Use the **absolute** time `env.T` for beat sync.
Noise: `noise.n2, n3, fbm2, fbm3, curl2`. Random: `rng(seed)` (`.range .int .pick .gauss .sign`), `hash(i, seed)`.
Colour: `rgba(hex,a)`, `mix(hexA,hexB,t,a)`, `ramp([hex…], t, a)`.
Shapes: `shapePts(kind, cx, cy, r, count, rot)` with kind circle/square/triangle/diamond/hex/star/'ngon:5'/'star:6:0.4', where all kinds share sample angles so `morphPts(A, B, t)` morphs cleanly. Also `resample`, `polyPath`, `roundRectPath`, `circlePath`, `fillCircle`, `cubicPoint`, `cubicPts`.
Text: `layoutLetters(ctx, text, align)` gives per-glyph x positions with real kerning. `textPoints(text, font, {x,y,step})` samples text into points (call it in init).
3D: `v3.rotX/rotY/rotZ/add/sub/scale/dot/cross/norm`, `project([x,y,z], {f,cx,cy})`.
Hand-offs: `shared.CURVE`, `shared.LATTICE`, `shared.latticeProject(x,y,z,cam)`, `shared.latticePoints(cam)`.

### Preview tools (you can look at your own frames; do it a lot)
```
node tools/preview.mjs sheet --from 2 --to 4 --count 16 --out .preview/<name>.png   # contact sheet (half res)
node tools/preview.mjs strip --from 3.9 --to 4.1 --out .preview/<name>.png          # every frame of a short range
node tools/preview.mjs frames --times 2.5,3.25 --outdir .preview/<dir> [--mb 8]      # full-res stills (+ motion blur)
node tools/preview.mjs bench --from 2 --to 4                                        # ms per draw
```
Every command prints page errors (exceptions thrown inside scenes) at the end.
Treat any error in *your* scene as a bug. Other designers are editing their own
scene files at the same time, so errors or placeholders from other scenes may
show up; ignore those. Put your outputs under `.preview/` (git-ignored) with a
unique name, because other agents share the folder. **Only edit the file(s)
you own.** Don't touch `src/engine.js`, `src/runtime.js`, the tools, or other
scenes. If you need a helper, write it inside your own file. If you find an
engine bug, work around it locally and report it.

---

## 2. Style guide

**Palette** (`REEL.PAL`): ink `#0B0B10`, ink2 `#16161F`, paper `#F2EEE6`,
**signal `#FF4B1F`** (the hero colour), cobalt `#2A3CFF`, acid `#D7FF3A` (small
doses only), lilac `#B8A9FF`, mute `#6E6C78`. Use flat, confident colour blocks.
No random rainbow gradients: gradients stay inside the palette
(signal→lilac→cobalt is the house ramp).

**Type.** Inter Tight 800–900 for impact, tight tracking, huge sizes. Instrument
Serif Italic for elegant contrast words. JetBrains Mono for small technical
labels (uppercase, letter-spaced 2–4 px).

**Motion principles.** This is what we're being judged on.
- Nothing moves linearly unless it's mechanical on purpose. Default to strong
  eases: expo/quint out for arrivals, expo in for exits, springs and back for
  character.
- Anticipation before big moves, overshoot and settle after. Squash and stretch
  on things with mass.
- Stagger groups (20–60 ms per element) and cascade from a point of origin.
- **Hit the beat.** 120 BPM, so beats land on every 0.5 s of absolute time
  (every 30 frames). Major arrivals land exactly on beats. Use `beatPulse` for
  subtle bumps on every beat.
- Contrast of speed: hold, then *snap*. Stillness makes speed read.
- Negative space and composition matter. Align to a grid, and don't fill
  every pixel.
- Every transition is motivated: shapes become other shapes, and the camera
  flies *through* something. No cross-dissolves.

---

## 3. Scenes

### S1 · EASING & TIMING · 0.00–2.00 · `s1-easing.js`
*The atom of motion: a graph-editor curve.* Background ink.
- **0.00–0.60** A faint graph-editor grid (paper at ~6–10% alpha) draws on:
  lines sweep out from the centre with staggered timing. Graph box
  x 460→1460, y 240→840 (1000×600). Small mono axis labels: `TIME` along the
  bottom and `VALUE` up the side.
- **0.10** A signal dot (r≈11) pops in at P0 (bottom-left of the graph) with an
  overshoot.
- **0.15–0.90** Curve and handles: the curve starts as a straight diagonal
  (linear). Two bezier handles (paper lines with square knobs at the handle
  ends) swing out on a spring to their final positions for
  `cubic-bezier(0.83, 0, 0.17, 1)` (`REEL.shared.CURVE`: P1=(x0+0.83w, y-bottom),
  P2=(x0+0.17w, y-top)). The curve re-shapes **live** as the handles move. Curve
  stroke is signal, ~6 px, round caps.
- **0.45–1.00** A mono label types on under the graph,
  `cubic-bezier(0.83, 0, 0.17, 1)`, with a blinking caret.
- **0.75–1.50** Playback: a vertical playhead sweeps left→right at constant
  speed. The dot rides the curve (x linear in time, y = eased value). To the
  right of the graph (x≈1560) a second "value" dot slides vertically with the
  eased value, leaving **onion-skin ghosts** at equal time intervals so the
  spacing chart visibly bunches at the ends and spreads in the middle. This is
  the classic animator's spacing chart, and it's the whole point of the shot.
- **1.50** (beat 3) The dot lands at P3 (top-right) with a squash impact.
- **1.50–1.75** The graph elements fall away / scale out in a stagger. The dot
  anticipates (a slight squash and pull-back).
- **1.75–2.00** The dot whips toward centre and expands with `E.inExpo`
  until it covers the entire frame.
- **Contract out:** the frame at t≥1.985 (frame 119) is **solid signal**. The
  circle must fully cover all four corners by then.

### S2 · KINETIC TYPE · 2.00–4.00 · `s2-type.js`
*Copy: "TIMING IS EVERYTHING". Three words, three beats, three typographic ideas.*
- **Contract in:** frame 120 is solid signal.
- **2.00–2.50 "TIMING"**: ink on signal. Inter Tight 900, huge (~330 px, most
  of the width). Letters rise from behind a mask line (each glyph clipped to
  its own box and translated up from below), `E.outExpo`, 30–40 ms stagger, a
  slight skew that settles to zero. A small mono kicker above, e.g. `01 — WORD`.
- **2.50–3.00 "is"**: hard cut on the beat. Background flips to ink, and the
  word is paper Instrument Serif *Italic*, enormous (~520 px), scaling
  1.25→1.0 with `E.outExpo` and a gentle rotation settle. Elegant contrast.
- **3.00–3.50 "EVERYTHING"**: cut on the beat. Background paper, ink text. A
  **variable-font weight wave**: each letter animates Inter Tight weight
  100→900 with a staggered phase, so a wave of boldness runs through the word
  while tracking tightens. Re-measure the layout every frame, because widths
  change with weight.
- **3.50–3.85 Echo**: the word duplicates into a vertical stack of ~7 outline
  copies (stroked ink, no fill) that fan out above and below with staggered
  springs. The classic repeated-type effect.
- **3.80–4.00 Exit**: the whole composition is cut into ~12 horizontal strips
  that shoot off alternately left and right (`E.inExpo`), revealing paper.
- **Contract out:** frame 239 is **solid paper** (plus grain from post).

### S3 · SHAPE & RHYTHM · 4.00–6.00 · `s3-shapes.js`
*A Bauhaus/Swiss grid of looping micro-animations. Fifteen ideas in two seconds.*
- **Contract in:** frame 240 is solid paper.
- Grid: 5 columns × 3 rows of square tiles, 250 px with 28 px gutters (about
  1362×806), centred. Each tile has a flat colour background from the palette
  (ink, signal, cobalt, acid, lilac, paper-with-ink-outline), arranged
  deliberately and balanced, never random.
- **4.00–4.50** Tiles pop in with a diagonal or centre-out stagger, scaling
  from 0 with a spring, or unfolding.
- **4.30–5.50** Every tile runs a *different* beat-synced loop (one cycle = 1
  or 2 beats, driven by `env.T`). Suggestions: bouncing ball with squash and
  stretch · pendulum · rotating Truchet quarter-circles · circle→square→triangle
  morph (`shapePts` + `morphPts`) · sliding op-art stripes · sine wave of dots
  · spring-pop square · orbiting planets · equalizer bars · nested rotating
  squares with staggered delay · pac-man/clock wipe · marching chevrons ·
  ripple rings · plus-sign field rotating in a wave · Lissajous line drawing.
  All flat, crisp geometry.
- **5.50–5.85** Collapse: each tile shrinks into a small ink circle, and all
  circles fly (curved paths, staggered, `E.inOutQuint`) to the frame centre,
  merging into one ink circle, r≈70.
- **5.85–6.00** That circle expands with `E.inExpo` to cover the frame.
- **Contract out:** frame 359 is **solid ink**.

### S4 · PARTICLES & FLOW · 6.00–8.00 · `s4-particles.js`
*Systems thinking: thousands of agents, one choreography.*
- **Contract in:** frame 360 is solid ink.
- **6.00–6.15** Burst: ~5,000–8,000 particles explode outward from the centre
  (as if the S3 circle shattered). Colours from the house ramp
  signal→lilac→cobalt, with a few acid sparks.
- **6.10–6.90** Flow: particles ride a curl-noise field (`noise.curl2`),
  drawn as short luminous streaks (additive `'lighter'`) that form silky
  ribbons. **Pre-simulate in `init()`** at a fixed dt (e.g. 1/240 s) and store
  positions, so `draw` just looks them up.
- **6.90–7.40** Formation: particles swarm into the word **FLOW** (Inter Tight
  900, huge, via `textPoints`), with most of them arriving on the 7.0 beat and a
  shimmer or hold until 7.4.
- **7.40–8.00** Re-formation: the letters dissolve and every particle flies
  to a point of the **lattice** (`REEL.shared.latticePoints()`: 14×14 = 196
  targets). Extra particles fade out or collapse onto their nearest target.
  Arrival settles by ~7.9. By frame 479 the image is exactly the lattice: dots
  of radius `LATTICE.dotR` (3.5) in `LATTICE.dotColor` (paper) on ink, no
  trails.
- **Contract out:** frame 479 is the flat lattice of paper dots on ink,
  identical to S5 frame 480.

### S5 · 3D & DIMENSION · 8.00–10.00 · `s5-dimension.js`
*The flat becomes volume. Software 3D in Canvas2D: flat-shaded columns in an isometric city.*
- **Contract in:** frame 480 is the flat dot lattice (`latticePoints()` with the
  default `LATTICE` camera).
- **8.00–8.40** Each dot extrudes into a square column (base ≈ 0.72 of
  spacing) rising from height 0. The rise ripples out radially from the centre
  in a stagger, with overshoot.
- **8.40–9.60** Heights follow a travelling radial sine ripple plus a fresh
  pulse on every beat (8.5, 9.0, 9.5), so kicks visibly punch waves outward.
  Flat shading: top face lightest, left face mid, right face darkest. Colour
  by height along the house ramp (cobalt low → lilac → signal high), with
  acid only on the very tallest tips at the beat peaks. Painter's algorithm
  (sort by depth). The camera slowly orbits (yaw 45°→~75°) and pushes in a
  little. Background ink, with a subtle reflection or ground glow if it helps.
- **9.70–10.00** Exit: the signal corrupts. RGB channel split, horizontal
  slice displacement and scanline tearing ramp up (draw into a
  `REEL.buffer` and re-blit offset slices and tinted copies), peaking at frame
  599. HUD `jitter` ramps up too.
- **Contract out:** hard cut on the downbeat into a glitchy montage.

### S6 · RANGE · 10.00–12.00 · `s6a-montage.js` (10–11) + `s6b-montage.js` (11–12)
*The rapid-fire section: eight vignettes, each a different technique, one per
8th note (0.25 s = 15 frames each), with hard cuts on the grid. Each vignette
should move a lot within its 15 frames.* The two files are separate
`REEL.scene` registrations that share chapter `index: 6` (label `Range`). Each
uses `hud()` to rename the chapter per cut (e.g. `{ label: 'Range — Liquid' }`).
Occasional 1–2 frame flash/invert frames at cuts are welcome. Build each
vignette as its own function of local time within its 0.25 s slot.

**6a · `s6a-montage.js` · 10.00–11.00 · id `montage-a`**
1. **10.00 LIQUID**: gooey metaballs merging and splitting (threshold a
   blurred low-res buffer, or evaluate the field on a coarse grid and draw
   marching squares). Lilac bg, ink blobs. The first 2–3 frames can carry
   residual glitch energy from S5's exit.
2. **10.25 OP ART**: moiré of concentric rings or rotating line gratings.
   Paper/ink.
3. **10.50 SPLIT-FLAP**: slot-machine digits rolling and landing on `2026`
   (mono, huge), acid bg, ink digits, per-digit stagger with overshoot.
4. **10.75 WIREFRAME**: rotating 3D torus or icosphere wireframe, paper lines
   on cobalt, depth-faded (far edges dimmer and thinner).

**6b · `s6b-montage.js` · 11.00–12.00 · id `montage-b`**
5. **11.00 TYPE FIELD**: the word `MOVE` tiled in a grid, displaced by a
   travelling wave (scale/offset per cell), ink on signal.
6. **11.25 SPEED**: radial speed lines / sunburst spinning, ink on paper,
   with a zoom punch.
7. **11.50 DATAMOSH**: a chaotic glitch collage of the reel so far, with RGB
   split, pixel-sort streaks and block displacement, and HUD jitter at max.
   Every scene's `draw` is a pure function of time, so you may render
   *other* scenes into a `REEL.buffer` for fragments, e.g.
   `const s = REEL.scenes.find(x => x.id === 'dimension'); s.draw(buf.ctx, 1.2, {...env, t: 1.2, T: s.start + 1.2, p: 1.2 / (s.end - s.start), scene: s})`.
   Wrap such calls in try/catch (another designer may be mid-edit) and keep
   the cost in check (1–3 renders into a half-size buffer).
8. **11.75 CRT OFF**: the image (a bright glitched frame) collapses
   vertically into a thin bright horizontal line (≈0.07 s), then the line
   shrinks horizontally into a bright dot (≈0.07 s). The dot glows and fades.
   The last ~3 frames (11.95–12.00) are pure black, the "air" before the drop.
- **Contract out:** frame 719 is black (ink), a tiny fading dot at most.

### S7 · CONTACT · 12.00–15.00 · `s7-endcard.js`
*The signature. Calm, confident, premium. The drop hits at 12.00.*
- **12.00** Impact from the centre point: a flash, then a paper shockwave
  ring that expands and thins, plus a burst of fine sparks. A beat-synced
  bump.
- **12.05–12.70** `CLAUDE`: paper, Inter Tight 900, ~250–300 px, centred
  slightly above the middle. Each letter rises out of a mask with a 40–50 ms
  stagger, `E.outExpo`, with subtle tracking that settles tight.
- **12.45–13.10** Callback: underneath the name, the S1 easing curve
  (`shared.CURVE`) draws on as an underline stroke in signal (left→right), with
  the signal dot riding it and coming to rest at its end. It starts with a
  curve, and it ends with one.
- **12.80–13.40** Sub-line: `Motion Designer` in Instrument Serif Italic
  (~72 px, paper). Below it a mono line types on, e.g.
  `SHOWREEL 2026 — EVERY FRAME RENDERED IN CODE`, small and letter-spaced.
- **13.00, 13.50, 14.00, 14.50** On each beat a small geometric accent from S3
  pops in around the composition (a signal circle, a cobalt triangle, an acid
  square, a lilac ring), springy, and then floats gently.
- **13.40–15.00** Hold with life: slow drift and parallax, a slight breathing
  scale (≤1%). Nothing distracting. The final frame (899) must be a beautiful,
  complete hero still (it becomes the thumbnail). No fade to black.

---

## 4. Sound (`tools/synth.py` → `audio/showreel.wav`)
48 kHz stereo 16-bit, exactly 15.000 s (720,000 samples). 120 BPM, key A minor.
Everything is synthesised in numpy/scipy, with no samples. It should sound
tight, modern and premium, never harsh: gentle filtering, tasteful stereo,
glue compression, peaks ≤ −1 dBFS, around −14 LUFS.

| Time | Cue |
|------|-----|
| 0.00–2.00 | Intro: airy filtered pad (Am9) swelling in. 0.10 soft "blip" as the dot pops. 0.05–0.60 faint rising ticks as the grid draws. 0.45–1.00 tiny, very quiet key clicks as the label types. 0.75–1.50 soft sine glide whose pitch follows the easing curve (≈300→900 Hz). 1.50 small "tock" on the landing. 1.50–2.00 riser/reverse swell into the drop. |
| 2.00 | **Drop 1**: kick + sub impact. The groove starts. |
| 2.00–10.00 | Groove: four-on-the-floor kick on every beat. Clap on beats 2 and 4 (2.5, 3.5, 4.5 …). 16th closed hats with swing-free accents, open hat on off-beats. Off-beat pumping bass (sidechain feel). Chords per bar: Am (2–4), F (4–6), C (6–8), G (8–10). |
| 2.00 / 2.50 / 3.00 | Word slams: short tonal stabs/thuds layered on the kicks. 3.50–3.85 echo stutter. 3.80–4.00 slice "swish". |
| 4.00–4.50 | 15 pitched plucks (marimba/FM, A-minor pentatonic) following the tile pop-in stagger. 5.50–6.00 reverse "suck" into 6.00. |
| 6.00 | Particle burst: noise burst + glassy shimmer. 6.1–7.4 airy panning whooshes. 7.0 tonal swell as FLOW forms. 7.4–8.0 gathering sweep. |
| 8.00 | Hit. 8.0–9.7 deep "boom" on each beat as the 3D ripples fire. 9.7–10.0 digital glitch stutter. |
| 10.00–11.75 | Build: a snare roll accelerating (8ths → 16ths → 32nds) with rising pitch, plus a noise/saw riser. A distinct tiny SFX on each 0.25 s cut (bloop, moiré shimmer, flap clacks, wire tone, …). Kick continues until 11.5. |
| 11.75–11.95 | CRT power-down: a falling "zip" (~2 kHz→50 Hz) plus static crackle. |
| 11.95–12.00 | **True silence.** |
| 12.00 | **Final drop**: a massive but clean impact (sub boom ~55→30 Hz, noise crash, long reverb tail) and a sustained Am9 chord. |
| 12.05–12.35 | Six soft ticks as the letters land. 12.45–13.10 rising glide for the underline. 13.0 / 13.5 / 14.0 / 14.5 plucks on the accent pops (A, C, E, A'). The tail decays and fades to silence by 15.00. |
