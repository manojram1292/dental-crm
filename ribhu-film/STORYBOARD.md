# RIBHU LABS — "ONE CUP, MADE FOUR" · Director's storyboard

A 30-second brand film for Ribhu Labs (ribhulabs.ai). Every frame and every
sound is generated from code. It's text on screen, not voiceover, with a
composed and sound-designed score. It has to feel like a premium studio brand
film: **warm, crafted, quiet confidence, one idea per shot**. It must never feel
like a tech demo or a template.

**The story.** "Ribhu" is an old word for a skilled maker. One of the oldest
tales is about three brothers who took a single cup and made it four. Ribhu
Labs works the same way, in three chapters that match the website:
**01 Understand → 02 Make → 03 Renew**. It ends on the brand promise,
*World-renewing craftsmanship*.

**The visual arc: darkness to light.** The film opens in a dark umber
workshop lit by one warm shaft of light. It ends in the brand's warm ivory,
with the logo as it appears on the website. The copper cup is the
protagonist, and the three flames of the logo are the three makers.

| # | Time (s) | Frames @30 | Scene file | Chapter / rail | Beat |
|---|---|---|---|---|---|
| 1 | 0.0–5.0 | 0–149 | `s1-tale.js` | (no rail) | The tale: a copper cup in the dark; three sparks |
| 2 | 5.0–7.5 | 150–224 | `s2-understand.js` | 01 Understand | The cup is scanned: point cloud, contours, annotations |
| 3 | 7.5–10.0 | 225–299 | `s3-make.js` | 02 Make | The robotic hand works the cup; one becomes four |
| 4 | 10.0–15.0 | 300–449 | `s4-worlds.js` | 02 Make | Four cups, four kinds of work |
| 5 | 15.0–17.5 | 450–524 | `s5-system.js` | 02 Make | One system: the four lights converge |
| 6 | 17.5–22.5 | 525–674 | `s6-renew.js` | 03 Renew | The hand passes the spark to a person |
| 7 | 22.5–30.0 | 675–899 | `s7-mark.js` | (rail fades out) | Three flames become the logo; to ivory |

Music is 96 BPM, so one beat = 0.625 s and **one bar = 2.5 s**. Scene
boundaries sit on bars, and big arrivals land on beats (multiples of 0.625 s).

---

## 1. Technical contract

Read it all before writing code.

* **Files.** Each scene is one classic script, `src/scenes/sN-*.js`, calling
  `REEL.scene({...})` in an IIFE. No modules and no network. `window.REEL`
  (`src/engine.js`) holds timing, easing, noise, colour and 2D helpers.
  `window.RB` (`src/kit/core.js`) is the film kit: the 3D renderer, lighting,
  materials, cup, logo, typography, atmosphere and hand-off shots.
  `window.THREE` is three.js r186; `window.THREE_ADDONS` has
  `RoomEnvironment, RoundedBoxGeometry, mergeGeometries, mergeVertices,
  SVGLoader`. The robotic hand rig is `RB.hand` (`src/kit/hand.js`).
* **Pure function of time.** `draw(ctx, t, env)` must give identical pixels
  for the same `t` in any call order. Build meshes, geometry and materials
  **once in `init()`**. In `draw()`, set *every* animated property (positions,
  rotations, scales, material opacity/emissive, visibility, camera) from `t`,
  every call. Nothing may carry over from a previous frame. Don't use
  `Math.random` or `Date`. Randomness comes from `REEL.rng(seed)` or
  `REEL.hash(i, seed)`. Simulations are pre-computed in `init()`.
  `tools/preview.mjs purity` checks this.
* **3D.** `RB.stage()` gives `{ scene, camera, key, rim }` already lit in the
  workshop look. Add meshes to it, pose with `RB.setCam(camera, {pos, look,
  fov})`, then `RB.draw3D(ctx, scene, camera, {exposure, alpha})`. The renderer
  clears to transparent, so paint your 2D backdrop first and your 2D
  type/effects after. The renderer applies the motion-blur jitter itself.
  **Budget: at most 2 `draw3D` calls per frame.** One is normal, and each costs
  about 0.2 s in the headless renderer at 1080p. Keep scenes under about
  250k triangles. Don't use shadow maps; use `RB.contactShadow()` instead.
* **Local time.** `t` = seconds since the scene started, `env.T` = absolute
  seconds, `env.p` = 0..1. Frames are at multiples of 1/30 s. The final render
  averages 8 sub-samples across a 180° shutter (the first half of each frame
  interval), so real motion blur comes for free. Don't fake it.
* **Logical pixels.** Draw in 1920×1080 logical px (the context is
  pre-scaled). Offscreen 2D buffers use `REEL.buffer(key, w, h)`. Filter blur
  sizes go through `REEL.blur(px)`.
* **Safe area.** Keep type and hero content inside x∈[120,1800],
  y∈[110,960]. The chapter rail sits bottom-left at y≈1010.
* **Rail and post hooks.** `rail(t, env)` returns `{ alpha, active: 1|2|3,
  progress }`: draw the rail from 5.0 to 22.5 with the chapter numbering
  below. `post(t, env)` returns `{ bloom, vignette, grain }`. The defaults are
  0.35 / 0.42 / 0.16. Scene 7 lowers them on ivory.
* **Performance.** A draw should take ≤ 450 ms at scale 1 (`bench`). Previews
  run at half scale and are much faster.
* **Only edit the files you own.** Don't touch the engine, runtime, kit or
  tools, or other scenes. If you need a helper, write it in your own file.
  Report kit issues instead of editing them.

### Preview tools (run from `ribhu-film/`, write outputs to `.preview/<you>-…`)
```
node tools/preview.mjs sheet  --from 5 --to 7.466 --count 16 --cols 4 --out .preview/x.png   # half-res contact sheet
node tools/preview.mjs strip  --from 7.3 --to 7.7 --out .preview/x.png                        # every frame of a range
node tools/preview.mjs frames --times 6.2,7.0 --outdir .preview/x [--mb 8]                    # full-res stills (+ final blur/AA)
node tools/preview.mjs bench  --from 5 --to 7.466        # ms per draw at scale 1
node tools/preview.mjs purity --from 5 --to 7.466        # must report "pure"
```
Page errors from *your* scene are bugs. Other designers are working in
parallel, so errors or placeholders from other scenes may show up; ignore
those. `--post 0 --hud 0` disables post and rail, for exact pixel checks.

---

## 2. Style guide

**Palette** (`REEL.PAL`):

| Name | Hex | Use |
|---|---|---|
| graphite | `#191b19` | |
| ink | `#111311` | |
| umber | `#44372e` | workshop warmth |
| taupe | `#817368` | stone, quiet text |
| ivory | `#eeead5` | text on dark, the finale ground |
| **copper** | **`#b46f43`** | the brand |
| copperHot | `#d16d3e` | accents, rules |
| ember | `#ffb48e` | glows |
| charcoal | `#292925` | the dark flames |
| line | `#50564a` | ruled lines |
| mute | `#979e91` | |

Everything stays warm. No blues, no neon, no rainbow gradients. Copper is the
only saturated colour.

**Type.** Space Grotesk for the wordmark and the rare display moment. Manrope
500 for story lines. JetBrains Mono for small caps annotations and kickers.
Use `RB.type.line` for **every** story line, `RB.type.kicker` for chapter
kickers and `RB.type.annotation` for labels. One typographic voice for the
whole film. Story lines are 56–64 px. Hold every line long enough to read:
at least 1.2 s after it lands, and 2+ words per 0.5 s of hold.

**Light.** One warm key from the upper left (the light shaft), a copper rim
from the right, deep shadows, and a subtle vignette. Use dust motes
(`RB.atmos.dust`) wherever the shaft is visible. Their motion runs on
absolute time, so they continue across cuts.

**Motion.** Slow, confident, weighted: this is craft, not hype.
- Cameras glide (inOutSine/Cubic) and never cut on a dead frame.
- Objects move with mass: anticipation, eased arrivals, small overshoot on
  landings only.
- Hits land on beats.
- Contrast is the tool: long stillness, then one decisive move.
- Every transition is motivated by the object: dissolve into points, split
  into four, light flowing, a spark rising. No cross-dissolve wipes between
  unrelated images.

**Honesty (from the Ribhu Labs working agreement).** The robotic hand is an
illustrative concept, not a product. No claims, numbers, client names, UI
from real products, or "AI says…" text. The vignettes show *kinds of work*,
not case studies. The tale is told as "one of the oldest stories", with no
gods, scripture or religious symbols. The logo is used exactly as drawn
(`RB.mark2D` / `RB.mark3D`), never reinterpreted, recoloured or distorted in
its final lockup.

---

## 3. Scenes

Text copy is final. The times given are when a line starts to land (`tIn`)
and starts to leave (`tOut`), in absolute seconds.

### S1 · THE TALE · 0.0–5.0 · `s1-tale.js`
The cup is presented like a museum object, and the tale is told.
- **0.0–1.0.** Black. Then a thin warm line of light traces the cup's rim
  (a copper glint crossing the lip), and the light shaft fades up from the
  upper left with dust. The cup emerges from darkness on a dark stone plinth
  (`RB.cup()`, `RB.plinth()`, `RB.contactShadow()`) as the key light rises.
  The camera begins a slow push-in. The cup sits right of centre, and the
  text column is on the left.
- **0.35 → out 2.4.** Line (x≈150, y≈500, 60 px; land it briskly, stagger ≈0.04, dur ≈0.6):
  `One of the oldest stories\nis about makers.`
- **2.5 (bar 2).** Line: `Three brothers.` (tIn 2.55), then `One cup.` on a
  second line (tIn 3.15). Both leave at 4.25. As the words land, **three
  sparks ignite** around the cup, one per beat (2.5, 3.125, 3.75). One is
  copper-ember, two are darker embers with copper rims, a quiet nod to the
  logo's three flames. They orbit the cup slowly, like makers at work, leaving
  faint trails.
- **4.375–5.0.** The sparks spiral in and dive into the cup (the last beat
  of the bar). The cup glows from within for a moment. The camera settles
  exactly on `RB.shots.cupHero` at 5.0. The plinth and shaft dim, so the cup
  is alone against the dark.
- **Contract out (frame 149 → 150):** the cup at world origin, rotation.y = 0,
  camera exactly `RB.shots.cupHero`, backdrop `RB.atmos.backdrop` defaults,
  no text, no plinth visible (fully faded by 4.9), glow from within ≤ 20%.

### S2 · 01 UNDERSTAND · 5.0–7.5 · `s2-understand.js`
Seeing the work as it is.
- **Contract in:** identical to S1's out frame.
- **5.0–5.6.** A horizontal scan line (a thin ember band) sweeps down the cup.
  Where it passes, the copper surface dissolves into a **point cloud** of the
  same shape (`RB.cupPoints()`) and fine **contour rings** of the lathe
  profile (ivory hairlines).
- **5.4–7.0.** The camera orbits slowly (about 35°) around the cloud. Three
  annotations draw on with leader lines, **observations about the work, not
  numbers**: `FORM · HAND-RAISED`, `MATERIAL · COPPER`, `USE · SHARED BY MANY`
  (`RB.type.annotation`, staggered 5.6 / 5.9 / 6.2).
- **Kicker** `01 · UNDERSTAND` at 5.15. **Line** `See the work as it is.`
  (tIn 5.35, tOut 6.95), left column (x≈150, y≈560).
- **7.0–7.5.** The points pull back onto the surface. The scan sweeps upward
  and re-solidifies the copper, landing solid on the downbeat 7.5 in shot
  `RB.shots.cupMake`.
- **Rail:** active 1 (fades in 5.0–5.5), progress = (T−5)/2.5.
- **Contract out:** the solid cup at origin, rotation.y = 0, camera exactly
  `RB.shots.cupMake`, no annotations, standard backdrop.

### S3 · 02 MAKE · 7.5–10.0 · `s3-make.js`
Make one thing into four.
- **Contract in:** S2's out frame. The robotic hand (`RB.hand`) is off-frame
  upper right.
- **7.5–8.6.** The hand descends into frame, graphite with an ivory sensor
  module and copper accents (echoing the website's hero image). It closes
  gently around the cup's bowl (anticipation, then contact at 8.125, a beat)
  and lifts and turns it a little, as a craftsman inspects work.
- **Kicker** `02 · MAKE` at 7.6. **Line** `Make one thing into four.`
  (tIn 7.8, tOut 9.55), left column.
- **8.75 (beat).** The hand sets the cup down and opens. **1 → 2:** the cup
  divides, a second cup sliding out of the first like a reflection separating.
- **9.375 (beat).** **2 → 4.**
- **10.0 (downbeat).** The four cups land in a row at `RB.shots.rowX`
  (y = 0, rotation 0) while the camera pulls back to `RB.shots.row4`. The hand
  exits upward by 9.8.
- **Rail:** active 2, progress = (T−7.5)/10.
- **Contract out:** four solid cups at x = rowX, camera exactly
  `RB.shots.row4`, no hand, standard backdrop, no text.

### S4 · FOUR KINDS OF WORK · 10.0–15.0 · `s4-worlds.js`
Each cup holds one kind of Ribhu work, 1.25 s (two beats) each. The camera
glides along the row, framing each cup in turn slightly from above so we see
into it. Inside or above each cup, a small, elegant world plays out, a mix of
3D and fine 2D line work, in copper/ivory/ember only:

| Time | Label (mono, `RB.type.annotation`) | What we see |
|---|---|---|
| 10.0 | `AUTOMATION` | Loose ivory paper slips and message cards fall into the cup and rise out as neat, sorted stacks with copper tabs. |
| 11.25 | `OPERATIONS` | Points of light (people/teams) around the rim connect with copper hairlines into one shared ring: one view. |
| 12.5 | `ROBOTICS & VISION` | A camera reticle locks onto a small stone in the cup: bounding box, depth lines, a gentle focus pull. |
| 13.75 | `AGRONOMY` | Dark soil fills the cup, a seedling unfurls, and a thin moisture line draws across it. |

- **14.6–15.0.** The camera pulls back to `RB.shots.row4Wide`. All four
  worlds settle, and each cup keeps a soft inner glow (ember, about 40%).
- **Rail:** active 2.
- **Contract out:** four cups at rowX, camera exactly `RB.shots.row4Wide`,
  each cup with a small ember glow at its mouth centre (radius ≈ 26 px,
  intensity 0.5), no labels.

### S5 · ONE SYSTEM · 15.0–17.5 · `s5-system.js`
- **Contract in:** S4's out frame.
- **15.0–15.625.** Copper hairlines draw between the four glows, then arc
  above them: four kinds of work, one system.
- **15.625 (beat).** The four lights lift out of the cups and spiral upward,
  converging into **one ember** above the row. The cups dim.
- **Line**, centred at x=960, y≈300: `Intelligence. Put to work.` (tIn
  15.65, tOut 17.05), with "Intelligence." in ember and "Put to work." in
  ivory.
- **16.9–17.5.** The camera tilts down and the row sinks into darkness. The
  single ember drifts to `RB.shots.palmSpark` (screen 960, 500) on a pure
  dark backdrop.
- **Rail:** active 2 (progress reaches 1 at 17.5).
- **Contract out:** only the ember (`RB.fx.ember` at palmSpark, r=13,
  intensity 1) on `RB.atmos.backdrop({ gx: 960, gy: 540, gr: 900, lift: 0.7 })`.
  No cups visible.

### S6 · 03 RENEW · 17.5–22.5 · `s6-renew.js`
Renew the people, not just the tools.
- **Contract in:** S5's out frame (the ember alone at 960, 500).
- **17.5–18.4.** The robotic hand rises into the light *under* the ember,
  palm up, so the ember rests in its palm (the hand was always there, and
  now we see it).
- **Kicker** `03 · RENEW` at 17.7. **Line** `Renew the people,\nnot just
  the tools.` (tIn 18.0, tOut 21.8), left column.
- **18.4–19.4.** From the left, a **human hand draws itself** in one
  continuous ivory line, like a maker's sketch: open, palm up, reaching.
  It's drawn, not rendered. The contrast is deliberate: the person is the
  craft.
- **19.4–20.3.** The robotic hand tilts, and the ember rolls from the metal
  palm into the drawn hand. The hit is at **20.0 (beat)**. On contact, the
  line drawing fills with warm light from the palm outward: the person is
  now carrying the flame. The robotic hand withdraws slowly (it's a
  hand-off, not a takeover).
- **21.25–22.5.** The ember lifts from the drawn palm and rises. The drawing
  fades to a faint glow. The ember arrives at `RB.shots.riseSpark`
  (960, 430) at 22.5, still rising.
- **Rail:** active 3, progress = (T−17.5)/5. The rail fades out 22.0–22.5.
- **Contract out:** the ember at riseSpark (r=12, intensity 1) on the dark
  backdrop, rising (velocity ≈ −120 px/s). Nothing else.

### S7 · THE MARK · 22.5–30.0 · `s7-mark.js`
Darkness to light. The three makers become the mark.
- **Contract in:** S6's out frame.
- **22.5–23.75.** The ember keeps rising, then **splits into three**: one
  copper, two charcoal-dark with copper rims. They swirl around each other
  like three makers circling one work.
- **23.75–25.0.** The three become the three extruded flames of `RB.mark3D()`
  and **assemble into the exact logo**. Each flame flies to its home, turning
  to face the camera. It locks together on **25.0 (downbeat)** with a warm
  light sweep across the bevels. While this happens, the background warms
  and brightens **from the dark workshop into ivory** (`#eeead5`), like dawn
  filling the room, fully ivory by 25.6.
- **25.0–26.4.** The logo settles, a very slow drift and turn (≤ 4°). The
  wordmark `Ribhu Labs` (`RB.wordmark`, ink `#141514` on ivory) appears
  beside or under it with a mask reveal.
- **26.25.** The line `World-renewing craftsmanship.` (Manrope, ink, 44–52 px,
  tIn 26.25).
- **27.5.** `ribhulabs.ai` (mono, copper, letter-spaced, tIn 27.5).
- **27.5–30.0.** Hold. Life, not stillness: a slow light sweep across the
  logo, and a few warm dust motes in the light. The final frame (899) is the
  hero still and thumbnail, a complete, balanced, beautiful lockup.
  **No fade to black.**
- **Post:** on ivory, bloom ≈ 0.12, vignette ≈ 0.16, grain 0.12.

---

## 4. Sound (`tools/synth.py` → `audio/film.wav`)
48 kHz stereo 16-bit, exactly 30.000 s (1,440,000 samples). 96 BPM, D minor
(D dorian colour). Everything is synthesised in numpy/scipy, with no samples.
The palette is **craft and warmth**:
- the copper cup's own voice, a struck singing-bowl/bell tone with long
  shimmering partials, which is the film's signature sound;
- soft felt-piano and FM-mallet motifs;
- a warm low pad and a deep sub;
- metallic workshop percussion: anvil taps, a soft felt kick, shakers and
  hand-hammer ticks;
- servo whirs for the robotic hand;
- airy dust, whooshes and risers;
- a big warm impact for the logo.

Premium, restrained, cinematic, never EDM, never harsh. Peaks ≤ −1 dBTP,
about −14 LUFS integrated, and a clean tail by 30.0.

| Time | Cue |
|---|---|
| 0.0–1.0 | Room tone and air. A deep sub drone fades in. 0.35 a delicate high shimmer as the light traces the rim. |
| 1.0 | **Cup strike #1**: the singing-bowl tone (D), soft, with a long tail. |
| 0.35–2.4 | A warm pad (Dm9) swells in under the first line. |
| 2.5 / 3.125 / 3.75 | Three spark ignitions (soft crackle + bell pings A, D, F), panned left, right, centre. |
| 4.375–5.0 | Sparks dive: a reverse swell into 5.0. |
| 5.0 | Cup strike #2 (A) + a glassy "scan" shimmer; a soft data-tick texture 5.0–7.0 (scan sweep, tiny clicks per annotation at 5.6 / 5.9 / 6.2). |
| 7.0–7.5 | Reverse swell into the downbeat as the cup re-solidifies. |
| 7.5 | **The groove begins**: felt kick on every beat, soft shaker 16ths, bass pulse on the off-beats (D). Servo whir as the hand descends (7.5–8.1); a soft grip "clack" at 8.125. |
| 8.75 / 9.375 / 10.0 | **Multiplication**: bowl strikes that stack, 1→2 (D + A) on 8.75, 2→4 (D A C F) on 9.375, and all four ringing as one chord (Dm7 add9) on 10.0, plus a kick accent. |
| 10.0–15.0 | Four worlds, one signature sound each on its two beats: 10.0 paper flicks and sorting ticks · 11.25 connecting pings forming an arpeggio · 12.5 a focus beep and soft shutter · 13.75 a soil crunch and a rising "sprout" bloom. The groove continues; a mallet motif carries the melody. Chords: Dm (10–12.5) → B♭maj7 (12.5–15). |
| 15.0 | The four bowls chime together. 15.625 the lights lift: an ascending shimmer and a rising swell under "Intelligence. Put to work." (accent 15.65). |
| 16.9–17.5 | The groove drops away; a descending airy sweep as the camera sinks. |
| 17.5–22.5 | **Renew, intimate**: felt piano (Fmaj7 → C/E → Dm), soft pad, no drums. Quiet servo at 17.5–18.4. A pencil-on-paper sketch texture 18.4–19.4. **20.0 the hand-off**: a warm bell and a soft bloom swell. 21.25–22.5 a riser as the ember lifts. |
| 22.5–25.0 | Three rising tones as the ember splits (22.9 / 23.2 / 23.5), swirling whooshes, a build. |
| 25.0 | **The logo locks**: a big warm impact (sub boom, cup strike low D, a full Dm9/D-major-lift bell chord, a lush long reverb). |
| 26.25 / 27.5 | Two gentle ticks for the lines. |
| 25.0–30.0 | The tail blooms and decays to near-silence by 29.9 (the last 0.1 s is silent). |
