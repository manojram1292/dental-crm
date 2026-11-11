# Independent visual review: kit 41 (lab stills, two clips, lab reel "episode 99")

Reviewer did not make this work. Material seen: all 24 stills in `lab/kit41/`, both clips frame by frame
(10 fps strips, 30 fps on the key actions), a 0.5-scale render of the 27.5 s lab reel
(`node tools/preview.mjs clip --ep 99`), and 7 frames each from `episode39.mp4` and `episode40.mp4`.
Comparison images are in `lab/kit41/review/` (see the list at the end).

## Verdict

The kit is a real step up in **staging tools** (colour per scene, depth, camera, name plaque, close-up
with a readable change of expression) and a step **down in drawing and in identity**. Episodes 39–40 look
like a fire-lit shadow-puppet mural: dark ornamented silhouettes, warm rim light, a layered teardrop
flame, plaster. The kit 41 material looks like a pastel flat-design explainer: pale see-through
paper-doll figures with a white glow, a zig-zag campfire with an emoji face, large empty colour fields.
Put side by side (`lab/kit41/review/old-ep40-vs-new-kit41.jpg`) a viewer would not take them for the
same series. The acting, now seen in motion, is three poses with snaps between them and frozen holds of
1.6–2.4 s; it is not yet acting. Three things would embarrass the channel if they shipped: figures are
translucent (trees and title text show through a sage's body), the talking snake rises with its head at
Ruru's groin, and the god Agni is a cartoon face on a spiky fire that frowns. Do not render episodes
41–50 on this kit as it stands.

## What is clearly better than episodes 1–40

- **Colour scripting.** Green hermitage, purple storm, red curse, blue-grey memory: each scene is
  identifiable in one frame and the changes carry mood. Old episodes are orange/brown almost throughout.
- **Depth.** Foreground post and grass, mid trees, haze, light shafts (kit-02, kit-07). The camera slide
  in kit-02 a→b gives true parallax.
- **Close-up face.** kit-05 a→b is the first time in the series an emotion reads on a face at phone
  size (smile to fear: brow, eye white, mouth all change).
- **Name plaque** (kit-07): legible at 360 px, well placed, mural-like.
- **Hair and beard follow-through** on Bhrigu's strike (clip-acting-ink, frames 62–65): the one moment
  of real overlap in the motion.
- **Ink-blot transition** (clip-acting-ink 0.2–0.5 s): reads clearly, has an organic edge.
- **Captions**: the keyword underline and gold name are clear and unobtrusive.

## Findings

### BLOCKER (must fix before any episode renders)

**B1. Figures are translucent; background and text show through bodies.**
Seen in: kit-04-acting-2 and -3 (trees and the letters of DEVOUR ALL through Bhrigu's torso, dhoti and
head); every frame of clip-acting-ink; kit-05-closeup-b (tree trunk through Puloma's shoulder, the two
forearms form an X with darker overlap and background triangles between); kit-01 right figure (dark
discs at knee, elbow and hip where limb segments overlap); kit-03 (boar legs); kit-06-b.
Cause is almost certainly drawing each part with `globalAlpha < 1` (or the haze/back-light wash applied
per part). Fix: draw the whole figure opaque into an offscreen canvas at alpha 1, apply the tint
(`source-atop` fill) and rim there, then `drawImage` the result once. Atmosphere is then one
`globalAlpha` on that single blit, so nothing inside the figure double-blends. Add a gate check: sample a
pixel inside the torso with and without the background layer; it must not change.

**B2. The snake's head is at Ruru's groin.**
Seen in: kit-08-creature-source-line; lab reel 23.3–26.5 s (`strips/labreel-ruru-snake.jpg`). A thick,
glowing, rigid, pale shaft rises diagonally from the ground and ends against the front of his dhoti below
the waist. On a phone this is the first thing anyone will see and it will be clipped and mocked.
Fix: put 150–200 px of clear ground between snake and man; rear the snake to chest or face height with
the head turned to look up at his face; draw the body as an S-curve (see M8), not a plank; in the
close two-shot frame from the waist up, with the snake's head in the lower left third.

**B3. Agni is drawn as a mascot.**
Seen in: kit-01, kit-04-1/2/3, kit-10, cast-creatures ("hearthfire"), clip-acting-ink throughout. A
zig-zag flame with two dot eyes, flat brows and a line mouth that turns into a frown when cursed. It
reads as an emoji or a cereal-box character. Agni is a deity who is worshipped; the old episodes drew
the fire with no face and it had more presence. Also the caption says "does the fire tell the truth?"
while the face stares at the viewer (kit-01), which is comic.
Fix, in order of preference: (a) no face; let the fire act through shape, height, colour and sparks
(it shrinks and darkens when cursed), as in ep 39–40; (b) if Agni must be a person, draw a dignified
figure seen inside the flame in the series' own deity idiom (profile, crown, aura, two-tone), small and
still, never a face painted on the flame.

**B4. The look has left the mural.** (A decision as much as a bug, but it cannot be patched after
rendering.)
Seen in: every new still against `old-ep39-sheet.jpg` / `old-ep40-sheet.jpg`. What was lost:
(1) value structure: old figures are dark shapes against light with a thin warm rim; new figures are
pale mid-tones on mid-tone grounds with a white outer glow (sticker look); (2) ornament: old crowns,
bead strings, patterned borders, pillars, banners; new sets are blobs and flat bands; (3) the flame;
(4) texture: the plaster/hatching is fainter under the bright palettes. The "back-light rule" as shown
in kit-01 makes it worse, not better: the "new" figure is a washed grey-brown with a blue shawl and
X-ray joints, while the "old rule" black silhouette beside it is the stronger image.
Fix: keep the colour scripts, but hold a value rule: in any shot lit from behind, the figure's fill
stays under about 30 % luminance with hue from the scene, plus a 2–3 px warm rim on the light side
(inner stroke, clipped to the figure), no outer glow. Faces get local colour only in close-ups and
front-lit scenes. Remove the white `shadowBlur` halo everywhere. Bring back a border/ornament layer and
the old flame. Raise plaster texture contrast on light palettes (multiply at about 2× the current
strength on backgrounds brighter than 60 %).

### MAJOR

**M1. Dead holds.** After each action the figure freezes completely: Bhrigu 2.3–4.7 s of
clip-acting-ink (2.4 s, `strips/acting-01.6s.jpg`, `acting-03.2s.jpg`); Puloma 2.4–4.6 s of
clip-closeup-rack; Ruru 21.3–22.9 s of the reel with the staff up. Only sparks move. On a phone it
looks like the video stalled.
Fix: a moving hold on every pose: chest/shoulder breath (1–2 px, 3–4 s period), a slow 2–3 % drift
continuing the action's direction, cloth and beard settling with a damped spring for about 0.8 s after
every pose change, a blink every 3–5 s. Never hold a pose longer than about 1.2 s without a secondary
change.

**M2. Action timing is snap-and-freeze.** Bhrigu's arm goes waist to overhead in 5 frames with the
forearm crossing his face on the way (frames 39–43, `strips/acting-30fps-raise-f36-47.jpg`), then
overhead to full extension in 2 frames with no in-between or smear (frames 62–64,
`strips/acting-30fps-strike-f56-67.jpg`). At frames 57–58 the off arm jumps straight and the head rises
for exactly two frames and returns: it reads as a glitch, not as anticipation.
Fix: anticipation of 6–8 frames moving opposite to the action (lean back, hand back) with ease-out;
strike in 3–4 frames with one stretched/smeared in-between (draw the forearm as a tapered blade along
the arc); overshoot 8–10 % and settle over 8–12 frames. Route the hand on an arc outside the head so it
never covers the face. Remove or lengthen the 2-frame twitch.

**M3. Hands and the limp off-arm.** Hands are mittens or paddles (kit-05-b), or a bent hook. Nearly
every figure carries the idle arm as a raised elbow with a dangling wrist (Bhrigu kit-04-1, Ruru
kit-07, Puloma kit-02-a, Menaka and Pramati in the cast sheets). It reads as a puppet claw or a
"T-rex arm" and is the single most comic thing in the cast.
Fix: three hand shapes drawn as paths, scaled to about 0.8 of face height: (1) flat mudra hand: a
palm wedge, four fingers as one tapered block with 2–3 short dividing strokes, a separate thumb;
(2) grip: a rounded fist with the thumb across, drawn over the staff; (3) pointing/curse: index
extended, other fingers folded. Rest pose for the off-arm: upper arm along the torso, forearm slightly
forward, hand below the waist; or the hand resting on the staff or beads.

**M4. Title and overlays cover faces.** "DEVOUR ALL" sits across Bhrigu's head for 2.5 s
(kit-04-3), with a dark ring around his head behind it that reads as a black halo or noose. The
caption band crosses Puloma's neck and hand in the close-up (kit-05-a/b) and Puloma's feet and the
niche in kit-06. The source line touches Ruru's top-knot (kit-08, admitted).
Fix: give each shot a declared face box; the layout code refuses any text rect that intersects it
(make it a gate check). Place the turn-word in the empty half of the frame or below the figure. Drop
the ring or make it an ember burst from the pot. For close-ups, frame so the chin sits above the
caption band (band top is at about 62 % of frame height).

**M5. Framing wastes the phone screen.** In the wide shots the figure is about 45 % of frame height
in the upper half and the bottom 35 % is an empty dark band under the caption (kit-04, kit-07,
kit-10). In the niche shot Puloma is about 20 % of frame height (kit-06-b); her face is 12 px at
360 px wide. In wide shots no face is readable at phone size; only the close-up is.
Fix: move the horizon to about 70 % of frame height, scale figures to 60–70 % of frame height for
action shots, and give the niche a subject at least 45 % of its height. Fill the low band with
foreground (grass, altar steps, offerings).

**M6. The flame is a downgrade.** Zig-zag triangles in three flat colours (kit-01, kit-04,
cast-creatures) against the old layered teardrop flame with a white core and glow (ep 39 at 9 s,
ep 40 at 9 s).
Fix: reuse the old flame. If a new one is needed: 3–4 nested tongues, each a closed bezier teardrop
(wide base, S-curved tip), tips swayed by low-frequency noise, colours deep red → orange → yellow →
near-white core, `lighter` composite for the core, 2–3 detached flecks rising. No straight segments.

**M7. The boar.** A flat grey slab with a comb of spikes, a glowing crescent tusk, a red dot eye and
translucent stick legs; it glides across with almost no leg cycle (kit-03-a/b,
`strips/labreel-boar.jpg`). Grey on purple with rain, it reads as a hedgehog or a rock.
Fix: build it from masses: a big shoulder hump, a lower rump, a wedge head carried low with a snout
disc, a small ear; near-black fill with a magenta rim from the scene light; bristles as a ragged ridge
path along the spine only (short irregular strokes, not a saw); tusk small, curving up from the lower
jaw; legs short with a hock joint and cloven hoof, drawn opaque. Gallop: 4-pose cycle (gather, push,
stretch, land) with the body pitching ±4° and rising 10–15 px; 2–3 frames of dust or splash at each
landing. Let it enter fast and exit in under 1.5 s.

**M8. The serpents.** Dundubha is a plank with one hinge and evenly spaced ovals; the eye is a
cartoon dot with a brow (kit-07, kit-08). The viper is a tiny grey bean (cast-creatures). After
40 episodes of ornate jewelled nagas (ep 39 Takshaka) this is a clear drop.
Fix: one spline body for all snakes: sample a centreline from 8–10 control points driven by a
travelling sine, draw the body as a variable-width ribbon (stroke the left and right offsets), belly
stripe as a second narrower ribbon, pattern as diamonds stamped along the arc length, head as a
flattened spade with a small almond eye and a forked tongue flick. Viper: same code, shorter, thicker
head, zig-zag pattern, drawn at least 25 % of frame width when it matters.

**M9. Legs and feet.** Grey-brown sticks, a different colour from the torso, no knee shape, tiny
feet, and the hem floats above them (kit-04, kit-10, cast sheets). The children (chyavanaChild,
vyasaChild) stand on permanently bent stick knees with oversized heads and look like bobble-heads.
Fix: same skin colour as the torso; leg as a tapered two-segment shape with a slight calf bulge;
foot as a wedge about 0.9 head-lengths long; standing weight on one leg with the other relaxed; the
hem overlaps the shin. Children: head 1/5 of height, not 1/3, straight legs.

**M10. Saris and dhotis are one bell.** Every lower garment is a single smooth sack with one hem
line (kit-02, cast-ruru, cast-yamuna); no cloth lag is visible when figures change pose.
Fix: sari: add the pleat fan at the front (5–7 thin lines from the waist spreading to the hem), a
diagonal fold from hip to opposite shoulder for the pallu, a border band of 6–8 px in a second colour
along hem and pallu edge, and a scalloped hem with 3–4 waves. Dhoti: centre pleat fall plus 2–3 curved
tension lines from the waist knot. Drive the hem points and the pallu tip with a spring that lags the
hip by 3–5 frames.

**M11. Transitions.** Brush wipe: hard-edged red polygons for 2–3 frames (kit-11,
clip-closeup-rack 0.4–0.5 s); it reads as a render glitch, not a brush. Smoke and lamp pass through a
full-frame flat colour with the caption band left hanging on it (kit-09 purple, kit-12 white); the
lamp flash is close to full white for several frames, harsh on a phone in the dark, and the band turns
dirty grey.
Fix: brush: a mask drawn as 3–4 wide strokes with a dry-brush edge (stamp a bristle texture along the
path, noise on the alpha edge), 10–14 frames. Smoke/lamp: never reach a blank frame; keep the
incoming or outgoing scene at 20 % or more, cap the lamp at a warm cream (about 85 % luminance), and
fade the caption band with the scene.

**M12. Rack focus.** Only the figure blurs; trees and water stay as sharp as before, and the focus
arrives in about 0.2 s (clip-closeup-rack 5.9–6.1 s). It reads as the character loading, not as a lens.
Fix: blur by layer: the foreground grass starts sharp and ends blurred while the subject goes the
other way, over 0.6–0.8 s with ease; background at a constant mild blur.

**M13. Two bodies for the same people.** In ep 39–40 the sages and the king are dark seated or
standing silhouettes with a rim line and ornament; in cast-vyasa-begins.png Vyasa is a pale-blue-skinned
paper doll, Vaishampayana a pink-grey bowing figure, Janamejaya a tan figure with a yellow crown. Cut
together they will not read as the same people. (I could not compare the old Vyasa module directly at
size: CHARACTERS-preview.jpg is too small to read. The judgement rests on the ep 39–40 frames.)
Fix: one body per character. Either retire the old modules for these three from ep 41, or give the new
bodies the old silhouette treatment by default (B4) so that the difference is hidden by lighting; match
crown, hair-knot and beard outlines exactly to the old silhouettes.

**M14. Skin and type coding.** dasha (the fisher king) is the only human drawn with clearly darker
skin and round curly hair (cast-yamuna.png); menaka is grey; vyasaSage and devaduta are blue. A dark,
curly-haired fisherman next to fair kings invites a caste or race caricature reading. Blue for Vyasa
borrows the colour the series uses for gods.
Fix: one skin range for all humans, with variation spread across castes and ranks; mark the fisher
king by dress and paddle, not by body. Vyasa: dark brown ("Krishna Dvaipayana" is dark) rather than
blue. Menaka: warm skin with a cool rim, not grey.

### MINOR

- **m1.** The eye is one fixed almond with a dot; no blink was visible in either clip at 30 fps
  (possibly one half-lid at 2.9 s of clip-closeup-rack). Add a 3-frame blink and let the pupil lead head
  turns by 2–3 frames.
- **m2.** Close-up b pushes the head against the right edge and cuts the bun and flower off
  (kit-05-b); 60 % of the frame is empty tree. Keep the whole head in frame, looking into the space.
- **m3.** Double brow lines (kit-05-a) read as forehead stripes at phone size; use one tapered brow.
- **m4.** cast-faces: Ruru's staff runs straight through his ear and hair. Layer the staff behind the
  head or move the grip.
- **m5.** Puloma glides through kit-02 without stepping (`strips/labreel-puloma.jpg`). If it is a
  camera slide, plant her feet visibly; they are under the caption band.
- **m6.** Trees are identical scalloped blobs in every scene (kit-02, 03, 04, 06). Add 2–3 species
  (banyan with aerial roots, palm, flame-of-the-forest) and trunk taper.
- **m7.** The niche surround (kit-06) is dark navy with scattered leaf shapes: generic. Use a carved
  temple-niche frame as in the old recap card.
- **m8.** kit-01 label pills ("old rule", "back-light rule") are fine for the lab; keep them out of
  episodes.
- **m9.** Kamandalu held overhead reads as a club or gourd rattle at phone size (kit-04-1). Give it a
  spout and handle and show water leaving it on the strike.
- **m10.** The hut (kit-02) is a flat cone with ruler lines; add thatch layers and a door frame.
- **m11.** Rain streaks in kit-03 are sparse, uniform white dashes; vary length and alpha and slant them
  with the wind.
- **m12.** Ground bands (pale horizontal ellipses) in every scene read as leftover UI.

## Top 8 fixes, by visible payoff per effort

1. **Composite each figure opaque, then tint once** (B1). A few lines in the figure draw path; removes
   the worst artefact from every shot.
2. **Restage the snake and Ruru** (B2). Positions and one curve; removes the most damaging frame.
3. **Remove Agni's face and reuse the old flame** (B3, M6). Mostly deletion; restores dignity and the
   series' strongest motif at once.
4. **Silhouette-first lighting: dark fill, thin inner rim, no outer glow** (B4, M13). One shared
   shading function; pulls the look back to the mural and hides most of the two-bodies mismatch.
5. **Text never crosses a face** (M4): face box per shot plus a gate check; move the turn-word.
6. **Moving holds, blink and cloth settle** (M1, m1): one generic layer applied to every pose; ends the
   frozen-video feel.
7. **Three real hand shapes and a relaxed rest arm** (M3): about three paths and one pose default;
   fixes the "claw" on the whole cast.
8. **Reframe: bigger figures, lower horizon, filled foreground** (M5): numbers only; makes faces
   readable on a phone.

After these: strike timing (M2), spline snakes (M8), boar rebuild (M7), sari and dhoti folds (M10),
transitions (M11), layered rack focus (M12), legs and feet (M9), skin coding (M14).

## What I could not assess

- **Audio.** I cannot hear. Nothing here says anything about voice, music, foley, or sync of the
  actions to words or hits.
- **Motion at speed.** I judged motion from frame strips (30 fps for the two key actions, 10 fps
  elsewhere), not from playback. Shimmer, grain crawl and judder at real speed are not assessed. I saw no
  frame-to-frame popping apart from the 2-frame arm twitch in M2.
- **Full resolution.** All kit stills and clips are 540×960; the lab reel was rendered at 0.5 scale.
  Line quality and texture at 1080×1920 are not assessed. Phone-size readability was judged at about
  220–360 px wide.
- **Old character modules.** Compared only through episode 39 and 40 frames; the old model sheet was
  not legible at the size available.
- **Features not in the test material**: mb/shutter settings, the hawk and fish in motion, any crowd or
  multi-figure acting, any dialogue shot between two acting figures.

## Comparison images (`lab/kit41/review/`)

- `old-ep39-sheet.jpg`, `old-ep40-sheet.jpg`: 7 frames each from the finished episodes.
- `old-ep40-vs-new-kit41.jpg`: episode 40 frames beside kit-04-2 and kit-08.
- `phone-360-a.jpg`, `phone-360-b.jpg`: all 24 kit and cast stills at phone-thumbnail size.
- `strips/acting-*.jpg`: clip-acting-ink at 10 fps; `acting-30fps-raise-f36-47.jpg` and
  `acting-30fps-strike-f56-67.jpg` are the arm raise and the strike at 30 fps.
- `strips/closeup-*.jpg`: clip-closeup-rack at 10 fps.
- `strips/labreel-*.jpg`: the lab reel at 0.5 s steps, plus the boar, Puloma and Ruru/snake passages.
