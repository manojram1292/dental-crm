# Review log · episodes 11–20

After each render: a contact sheet of the final video (every 2.4 s) and 11–12 stills, checked against the
timeline (`build/timeline.epNN.en.json`) and the captions. Each entry says what works, what is weak, and the
concrete fix carried into the next episode. Engagement changes adopted from `research/engagement.md` are listed
at the end, with the episode they started in.

## Known weaknesses from episodes 7–10 (the starting list)

| Weakness | Fix | From |
|---|---|---|
| Ghost "glimpse" visions over the fire read faintly | Visions are solid painted medallions in a gold ring (`EP11.roundel`), full opacity, with a glow | ep 11 |
| Busy or dark figures (Kadru's thousand hoods, the lilac sage in daylight) | New figures get more front light in daylight scenes (`front` 0.4–0.6) and plain, readable silhouettes; crowds are 3–7 figures, not hundreds | ep 11 |
| Repeated silhouettes | `deva` / `asura` have six fixed variants by `index` (headdress, build, weapon), and every crowd mixes them | ep 11 |
| The big serpent was a plain painted snake | Vasuki and Ananta (`naga-kings.js`): banded belly plates, a diamond chain down the back, a hood with scale arcs, the head turned off the hood with an eye and a crown-jewel; a path-following body | ep 11 |
| Aruna's halo makes him look translucent | New luminous figures (Vishnu, Surya-like gods) keep a solid fill with a rim, never a halo-only fill | ep 11 |
| Surya's disc overflows its model-sheet cell | `lab/model-sheet.html` now clips every cell, and rows can set their own scale (`S`) | ep 11 |

## Episode 11 · The Horse from the Ocean (56.1 s)

**Works.** The cold open: the white horse surging out of the surf with the question in big text from frame 1,
and the Naimisha fire licking up from the bottom edge; the loop (the Next card dissolves back into frame 1) is
seamless. The horse module reads as a real animal (hocks, mane, a tail of strands). The vision medallion over
the fire reads clearly at phone size. Name cards on a dark lacquer plaque are legible on Meru's gold and the
pink sky. Narayana at 59 % of the runtime is a clear turn, with the conch under "Churn".

**Weak.**
1. At 2.6–3.2 s the episode title fades in while the hook text is still fading out: two layers of gold text
   overlap for half a second.
2. Two shots hold one framing for about 5 s with only a slow push (the sisters, the horse's name).
3. Meru and the amrita are two golden shots in a row (≈ 10 s of the same palette).
4. The ocean shot opens on an empty sea for 1.5 s; the makara is a thin outline.
5. Mandara reads as a dark cone (almost a fir tree) when small; Sauti is underlit in the fire scene.

**Fixes carried into episode 12.**
1. The title starts only after the hook card has gone, and sits lower (y 520): no overlap.
2. Every shot over ≈ 4 s gets a reframe or a cut on a beat (Mandara: tilt down to the roots and back up;
   Ananta: a shake on "tore"; the tortoise rises; the helix winds).
3. Palettes alternate shot to shot: daylight → firelight → evening → aquamarine → the deep → night churn.
4. No empty establishing shots: every shot has its subject in frame from its first frame.
5. Mandara is drawn larger, lit as stone (lit fill `#4a4430`, stone-gold rim), with a second summit and a crag;
   Sauti and the elder get front light 0.4–0.45 at the fire.

## Episode 12 · A Mountain for a Churning Stick (56.4 s)

**Works.** The title no longer collides with the hook text. Ananta's seven hoods in front of the tearing
mountain make a strong first frame; the shake on "tore" lands. The Ocean as a crowned king rising waist-deep
from the waves (the turn at 52 %, after a 350 ms rest) is the most striking new figure. The rope helix (back
turns drawn behind the mountain, front turns in front) reads as a real winding. Sauti's scene is a new angle.

**Weak.**
1. The title now starts too late: the hook's post is 0.95 s, so "Episode 12" is on screen for barely half a
   second before the recap.
2. Three shots in a row share one location and framing (the earth cut-away: hook, Mandara, Ananta, ≈ 12 s).
3. The tortoise shot splits attention: the shell at the bottom edge, the mountain and Indra floating above;
   Akupara's head is off-frame.
4. The hosts at the bottom of the rig shots are cropped at the head and crowd into dark clutter.
5. Mandara still reads as a dark cone at small sizes (better lit than in ep 11).

**Fixes carried into episode 13.**
1. The hook's post is 1.4 s and the title starts 0.3 s after the speech: the title holds ≥ 1 s.
2. No two consecutive shots share a framing: ep 13 alternates close churn → storm sky → wide milk → fire
   (from above, Sauti standing) → each wonder with its own composition (centre rise, low angle with petals,
   split frame, an arc to Narayana, a reveal).
3. One subject per shot, whole in frame: the wonders are single large frontal figures; supporting figures are
   placed fully inside the frame in the corners.
4. The crowds in the poison shot are three per side, scaled so heads stay in frame.

## Episode 13 · What Rose from the Ocean (57.4 s)

**Works.** The title holds for more than a second on a clean band. The sea's change from dark water to milk
to gold ghee reads in one shot. The run of wonders (Moon, Shri, Sura Devi and the horse, the Kaustubha,
Dhanvantari) is a quick-cut sequence of 3–4 s shots, each with its own name card and bell. The jewel's arc
to Narayana's breast and Dhanvantari's reveal (after a 350 ms rest) land. Captions sit in the dark sky
(captionY high), not on the white water.

**Weak.**
1. Five wonders in a row share one composition (a frontal figure rising in the centre of the white sea):
   quick cuts, but the same picture.
2. The Moon reads as a dark figure in a glow, not as the Moon: on a pale ground a dark-filled luminous being
   loses its light.
3. Indra's rain only becomes visible late in its 2.8 s shot.
4. The poison shot is the darkest of the arc and the crowd at the bottom is a dark mass.

**Fixes carried into episode 14.**
1. Repeated subjects get different shot sizes: Shiva appears four times, as a medium (hook), a full figure
   (drink), an extreme close-up on the throat (a 1.35→2.7× push), and a wide shot with the crescent moon and
   the sea.
2. Pale and luminous figures (Shiva) go on dark grounds (the darkened world); dark-filled figures (Brahma)
   go on a dark ground with their own ivory glow as the only light.
3. Effects that carry a line (the smoke, the blue throat) begin within 0.5 s of the shot's start.
4. Crowds in dark scenes are three per side with 0.3 front light so each figure still reads.

## Episode 14 · The Blue Throat (54.3 s) · as tradition tells it

**Works.** The fidelity framing: "As tradition tells it" is on screen from frame 1 to the last tradition
shot, and Sauti, close on his face, says plainly that many tellers add this story, with a small source line
("Southern manuscripts and the Puranas · not in the Critical Edition"). It is honest without sneering. Shiva
appears four times at four shot sizes (medium, full, an extreme close-up on the throat, a wide shot with the
crescent moon). The held 0.85 s on the blue throat, under a single deep bell, is the quietest and strongest
moment of the arc. Brahma's ivory light alone in the dark is a clean turn at 45 %.

**Weak.**
1. Shiva, a pale figure with bloom, blurs to near white at the medium size; his body is a plain block.
2. The poison's spreading fumes read as blue polka dots rather than smoke.
3. The recap caption sits over the niche's figure (as in earlier episodes).
4. The crowd in the rig shot is still cropped at the frame edges.

**Fixes carried into episode 15.**
1. Large pale or luminous figures get less bloom (post bloom ≤ 0.46 and front light, not glow), and dark
   figures that must read (Rahu's head) get front light 0.7 and a lighter lit-fill, and their corona is
   half-transparent so the mane reads against it.
2. Effects are drawn as shapes with edges (the discus's arc, the white flash, falling smoke shapes)
   rather than soft blobs.
3. Plaques move up to y 250 wherever a three-line caption sits under them, so names and captions never
   overlap.

## Episode 15 · The Enchantress and Rahu (57.6 s)

**Works.** The new dusk light (violet to rose, motes of illusion) is the arc's most distinctive palette. The
enchantress reads at a glance: tall profile, floating veil. Rahu's severed head is the strongest new image
of the arc, and it is never gore: a great crowned head in a half-transparent eclipse corona, the neck ending
in a band of white fire. The Sun's direct speech ("He is no god. He is Rahu!") with two beams of light
pointing down makes a clear turn at 56 %. The eclipse bite closes the myth visually.

**Weak.**
1. In the discus shot Narayana still holds his discus while it is also flying: two discuses on screen.
2. The clamour shot (2.9 s) is mostly empty white sea with arms cut at the edges.
3. Among the seated gods, Rahu's disguise is too good: he does not stand out until the slip.

**Fixes carried into episode 16.**
1. `vishnu` gets `pose.noDiscus`: while Sudarshana flies, his hand is empty (the kit change is
   additive; earlier episodes don't use it).
2. Crowd shots are framed so every figure is whole: the battle frieze uses four per side at staggered depths.
3. A disguised figure keeps a faint signature glow (`rahu`: 0.22 eclipse glow even in disguise), the way
   episode 15 was re-tuned before render; in ep 16 Nara's storm-jade rim marks him out among the gods.

## Episode 16 · The War for the Amrita (55.9 s) · the arc's end

**Works.** A new night-battle light (the sky lit red from the burning shore, weapon streaks) gives the arc a
proper climax, distinct from every earlier palette. Narayana's hand is empty while Sudarshana flies (the
episode 15 fix). Nara at full draw reads as an archer at a glance. The arc closes the way the bible asks
(the first and last episodes of a side tale return to the listener): Sauti's medallion shows the white horse
once more ("And that is how the white horse rose from the ocean"), and the cliffhanger returns to the sisters
on the sunrise shore, with Kadru's own question as the last spoken line.

**Weak.**
1. The clash shot opens on an empty shore for about a second, before the hosts walk in.
2. The hurled mountain peaks read as flat green-dotted triangles (they look like slices of fruit).
3. Kadru's close-up is lit by the pale sky, and her face is a dark mass.

**Fixes carried into episode 17.**
1. Every shot opens with its subject already in frame (the sisters are in the sunset shot from frame 1;
   the serpents are already rearing when the grove opens).
2. Props are drawn with the same rim and fill logic as characters, so they read as solid things.
3. Speaking close-ups are lit from the front (front 0.45–0.55) by the location's key light (the low sun
   at the right in the wager scenes).

## Episode 17 · The Wager (54.6 s) · the Garuda arc opens

**Works.** Three new lights: the sunset shore (a low gold sun, a glitter path), the serpents' grove in green
moonlight among banyan roots, and Brahma on Meru's summit. The wager is staged as a shot and reverse shot,
each sister speaking her own line (Vinata "He is all white", Kadru "His tail is black"). The callback to the
snake sacrifice of episode 8 sits inside Kadru's curse as a medallion, so the arc ties back into the frame
story. The sisters' dawn flight uses a new flying pose (`EP17.flyer`).

**Weak.**
1. In the hook the horse is cropped at the bottom, the black strands in his tail are faint at that size, and
   the sisters behind him are tiny.
2. The stake card is legible but small (one long line at 28 px).
3. Kashyapa's shot is dark: he is a turquoise rim on a dark hermitage.

**Fixes carried into episode 18.**
1. When a detail carries the line (the black tail), the shot is built around it: a push from 1.4× to 2.1×
   centred on the tail, held 0.9 s in silence.
2. The flying pose is used for every flight (hook, ocean, cliffhanger), so the sisters never stand on water.
3. A dark night flashback (the sons slipping into the tail) uses a lighter blue overlay (0.3 rather than 0.5).

## Episode 18 · The Black Hairs (54.2 s)

**Works.** The reveal works as planned: after a 400 ms rest, a push centred on the tail (1.4→2.1×) shows the
black hairs clearly, held in silence under one deep drum. The cut-away under the sea (makaras, glinting
jewels, the fire beneath the sea breathing on the sea-floor) is a new kind of image for the series. The
callback to Aruna at the reins of the Sun ("just as her son had foretold") ties the arc back to episode 10.
Sauti's two-hands gesture ("One flew in hope. The other already knew.") is a new angle on the fire.

**Weak.**
1. The flying pose, at large scale in the hook, reads as two women lying on a slope, and Vinata is cropped
   at the bottom.
2. In the night flashback the small coiled serpents read as spirals, and the shot is still dark.
3. The wager scenes and this episode share the same pink-to-violet shore; it is repeated across three
   episodes.

**Fixes carried into episode 19.**
1. Large flight is given to the one true flyer, Garuda, whose rig has real flight poses (`fly` with
   wing-beats, `spread`, `carry`); riders sit upright on their carrier (Kadru on Vinata's back in ep 20).
2. Serpents are drawn at ≥ 0.2 scale and in the `rise` pose (a hood is readable; a coil at small size is not).
3. New palettes for the next two episodes: a burning red-gold sky for Garuda's birth, Indra's heaven
   reddened by his blaze, the white heat of the Sun, Indra's storm, and Ramaniyaka at clear noon.

## Episode 19 · Garuda Is Born (55.8 s)

**Works.** Garuda's rig reads as an eagle-headed king of birds at every size: wings open in a V (both drawn
behind the body, so the head always shows), a beak, a crest and talons. The new burning sky is the episode's
own light. Agni with seven breathing tongues of fire, speaking his line (the turn at 45 %), is the
clearest new figure of the episode. The CE's detail is kept: the gods run to Agni, who tells them it is
Garuda. Sauti gets a ninth angle (from high above the clearing).

**Weak.**
1. Against the gold-and-red sky, Garuda is a dark shape: his features and plumage lose contrast, and his
   blaze aura disappears into a sky that is itself burning.
2. The great bird's shadow over the clearing is too faint to read.
3. The hermitage egg shot repeats episode 18's cliffhanger framing.

**Fixes carried into episode 20.**
1. Garuda's scenes are set against contrasting grounds: the blue sea, the white heat of the Sun (where he
   is the dark shape on purpose), Indra's slate storm, and the green-and-turquoise island. His front light is
   0.5–0.6.
2. Story beats are carried by figures, not by faint overlays (the serpents' fainting is a close-up on
   their drooping hoods, not a tint).
3. No shot repeats the previous episode's framing (ep 20 opens on Garuda in flight over the sea).

## Episode 20 · Carrying the Serpents (56.0 s)

**Works.** Garuda against contrasting grounds (the blue sea, the white heat of the Sun, Indra's slate storm,
the green and turquoise of Ramaniyaka) reads far better than in episode 19. The faint is a close-up on the
drooping hoods (the turn at 45 %), and the serpents' revival comes with Indra's rain. Ramaniyaka at clear
noon is a new light, and the episode's brightest. The serpents speak as one whispering voice (af_nicole
−2 st). Garuda's own question, the catalog's cliffhanger, is the last spoken line, over a close-up.

**Weak.**
1. Garuda's collar, a U-shaped band under the beak, reads as a cartoon smile in close-ups (also in
   episode 19). This is the most visible remaining flaw.
2. Kadru riding on Vinata's back reads awkwardly (one figure sitting on another's head and shoulders).
3. The serpents on Ramaniyaka are a row of similar hoods.

**Fixes for episode 21 onward (already made in the kit; episodes 19–20 are not re-rendered).**
1. `garuda.js`: the collar is now a straight, low jewelled band across the chest, with no U under the beak.
2. Riding: draw the carrier bent forward (`bow` k ≈ 0.7) with the rider seated further back and lower,
   or show the pair in silhouette at a distance.
3. Crowds of serpents should mix `naga` variants with Vasuki-like single-hood leaders at larger scale, and
   vary their heights.

## Next steps (for whoever continues at episode 21)

- Episode 21, "The Price of Freedom" (CE 1.23–24): the serpents name their price (the amrita); Vinata's
  counsel to eat the Nishadas but never a brahmin. The Next card of episode 20 already shows the island and
  the pot. Reuse `EP20.island`, `EP17.ocean`, `garuda`, `vinata`, `naga`.
- Re-check Garuda's new collar in a solo sheet (`node tools/modelsheet.mjs --solo garuda`).
- Keep the cold-open grammar, the per-episode new light and Sauti angle, and the review loop.

## Engagement changes adopted (research/engagement.md)

The research arrived before episode 11 was scripted; the coordinator asked for its low-risk recommendations
from the next unscripted episode. All of these keep the essence (faithful, calm, mural, no bait).

| # | Recommendation | Adopted | How |
|---|---|---|---|
| 1 | Cold open on the hook, recap after it | ep 11 | Order HOOK → title → RECAP (2.5–3.5 s) → STORY |
| 2 | First frame already moving, the strongest image | ep 11 | Each hook scene draws the episode's key image in motion from t = 0 (the horse in the surf, Mandara tearing free, the Moon rising, Shiva drinking, Rahu's head, the battle, the horse's tail, the sisters in flight, Garuda's birth, Garuda carrying the serpents) |
| 3 | Hook a newcomer can follow, with a stake | ep 11 | No unfamiliar names in the hooks ("Where did this horse come from?", "What if a bet … could cost you your freedom?") |
| 4 | Hook text on screen from frame 1 | ep 11 | `KIT.series.hookCard`: big Cinzel text, stake words gilded, caption off for that line |
| 5 | Shorter ending, "Next" on the card only | ep 11 | The spoken "Next: …" is gone; a silent ≈ 1.7 s card (`"voice": false`) |
| 6 | Seamless loop back to the fire | ep 11 | `KIT.series.loopNextScene` dissolves into the episode's first frame; `fireEdge` and the crackle are under both the first and the last frame |
| 7 | A turn at 40–60 % | ep 11 | Direct speech or a reveal at 44–59 % in every episode (Narayana, the Ocean, the Moon, Brahma, the Sun, the discus and Nara, the sons' refusal, the cheat revealed, Agni, the serpents fainting) |
| 8 | No image held longer than ≈ 4 s | ep 11, tightened from ep 12 | Push-ins, tilts and in-line cuts on beats; reviewed per episode (ep 11 had two ≈ 5 s holds, fixed from ep 12) |
| 9 | Stingers and silence | ep 11 | A 200–400 ms `pre` rest before reveal and speech lines, a bell or drum on the reveal beat in every score cue |
| 15 | Vary composition from episode to episode | ep 11 | A new Sauti angle each episode (nine so far), a new location light per episode, varied shot sizes for repeated figures |
| — | Captions readable | ep 11, refined ep 13 | captionY lifted over light grounds and low action; plaques for names on bright grounds |
| — | Respect for devotional audiences | ep 13 | Tradition material tagged and explained by Sauti without sneering (ep 14); deities drawn frontally as icons; violence stylised (Rahu's head, the battle) |

Not adopted here (packaging, outside the render): "Link a reel" and related-video links, Trial Reels,
cover templates, caption-line questions and pinned comments, and "who's who" carousels. They are
recommended for upload.

## Independent review (review/independent-11-20.md): adopted and rejected

Read before episode 21 was scripted (it arrived while the introduction was in production). Its top 10, each
with what was done and where it is measured (`QUALITY_SCORECARD.md`, `tools/scorecard.py`):

| # | Finding | Decision | How / why |
|---|---|---|---|
| 1 | Hook ≤ 8 words, spoken ≤ 3.0 s, ≤ 3 card lines | **Adopted** (ep 0, ep 21 on) | Hook lines are ≤ 8 words with a faster line speed (1.12–1.2×); scorecard columns *hook words* and *hook speech end* |
| 2 | Story by 6 s; mid-arc recaps as an unvoiced strip | **Adopted** (ep 21 on) | The spoken recap line is gone; `KIT.series.recapBand` lays "Previously · Episode N" and one line over the first story shot; column *story start* |
| 3 | Master at −14 LUFS, ≤ −1 dBTP | **Adopted** (all episodes) | `tools/mix.py` now masters to −14 LUFS with a look-ahead true-peak limiter at −1 dBTP; episodes 1–20 remixed and remuxed (video copied); column *LUFS / dBTP* (ebur128) |
| 4 | Readable captions; tags ≥ 36 px | **Adopted** | Captions get a dark 7 px outline under every word (kit-wide; applies to every render from now on); the ep 14 source line is now 40 px upright on a scrim, in two lines; tags were already 40 px |
| 5 | No smile on Garuda or Rahu; Garuda luminous | **Adopted** for Garuda (eps 19–20 re-rendered, ep 21 on); **Rahu deferred** | Garuda: a lighter face mask, a gold beak with a gape line, the collar moved low on the chest with a pendant, a warm painted band on the wings, a brighter fill and lit colour. Rahu does not appear in episodes 21–30; his neck band is listed as a remaining weakness for the next Rahu episode or an ep 15 re-render |
| 6 | Real motion in 0–1 s | **Adopted** | Every hook has a camera move or an action that starts at t = 0 (scorecard *motion by 0.5 s*, mean frame difference) |
| 7 | Break the template | **Adopted in part** | From ep 21 the Garuda arc drops the fire edge and the navy Next card; hooks rotate among three openings (question card over action · direct speech in medias res · a single held image with a one-line card). The lacquer plaques stay (they carry names the audio cannot spell) |
| 8 | Rhythm 2.4–2.6 words/s, varied gaps, one rest ≥ 0.8 s | **Adopted** | Narrator lines run at 1.08–1.12× line speed; `pre` values vary 100–900 ms with one deliberate rest ≥ 0.8 s per episode; columns *words/s* and *gap sd / max* |
| 9 | Fidelity copy-check before each render | **Adopted** | Every row of the scorecard carries the CE reference and a check that the cliffhanger matches the next episode's opening; the remaster fixed eps 12, 14 and 18 |
| 10 | Shorter end (Next ≤ 1.0–1.2 s over the cliffhanger image), Link-a-reel | **Adopted** (render side) / **passed to the owner** (upload side) | `KIT.series.overlayNextScene`: the cliffhanger picture keeps playing under a slim NEXT › band, then dissolves into frame 1; the Next card is 9 dB quieter (mix). Link-a-reel and Related-video links are YouTube upload settings, outside the render |

Rejected or not acted on:
- **Re-render episodes 11, 13, 16, 17 for their hooks** (a recap that doesn't match the hook, the Moon, Ananta's hoods reading as a hand, Kadru's head merging with the horse): rejected for now; each costs a full re-render and the remaster brief limits re-renders to factual fixes. Listed as remaining weaknesses.
- **The five-person blind test and retention/CTR measures**: not measurable from here (no viewers, no analytics). The scorecard uses proxies from the timeline and the frames.
- **Ep 16: the amrita given to Nara**: checked. CE 1.17 ends with the gods giving the amrita to Nara (Kiritin) to guard. The episode's line ("the gods kept the amrita safe") is not wrong, only less specific, so it was not changed (the brief said fix only if wrong).
- **Ep 11 layer "side" in an arc marked main**: the catalog's ep 11 belongs to the churning tale, a side tale inside the main Astika arc; the layer is deliberate.

## The November remaster (episodes 1–20) and the introduction (episode 0)

- **Loudness**: every episode remixed to −14 LUFS / −1 dBTP and remuxed into its existing mp4 and share copy (video stream
  copied); the measured values are in the remux log and the scorecard.
- **Facts**: ep 12 "the hold" now names the ends (the gods the tail, the asuras the head, CE 1.16) and the cliffhanger is
  "fire poured from Vasuki's mouths" (the ocean did not burn); ep 14's Sauti line is "a story that many manuscripts leave
  out" with a 40 px two-line source plate ("In some manuscripts and the Puranas · not in the Critical Edition"); ep 18 says
  Aruna "had cursed". All three re-voiced and re-rendered; the catalog's ep 12 cliffhanger updated.
- **Episode 0** (the introduction, a draft for the owner): Sauti's fire as the cold open, three new title moments (the
  hundred thousand verses with the Critical Edition's ≈ 75,000; the edition's name with episode 14's honest tag as the
  example; the drawing code wiped into the picture), a four-cut montage of released episodes, and Sauti's closing line over
  episode 1's own walk through the forest. Weak: the montage's figures are smaller than in the episodes; the Vyasa shot is a
  dark silhouette on a bright sky; it renders slowly (the memory niches draw three full pictures per frame).

## Episodes 21–30 · the Garuda arc, second half

Every episode: an opening ≤ 8 words in one of three rotating styles, the unvoiced recap band, a turn at 42–60 % after the
episode's one long rest (0.85–0.9 s), a new light (often two or three), the ≤ 1.2 s NEXT › overlay that dissolves into
frame 1, −14 LUFS. Numbers per episode are in `QUALITY_SCORECARD.md`.

**21 · The Price of Freedom (57.8 s).** *Works:* Garuda with the lit face reads on the late-gold island; the four guardians
of Vinata's blessing (Wind, Moon, Fire, Sun) arrive on the beats as painted signs with labels; the coal glowing in his throat
on "burned" sets up ep 22. *Weak:* the memory roundel of the horse's tail is hard to read; Vinata is a dark silhouette in
the amber grove. *Fix carried:* lighter figures keep front ≥ 0.55 against low sun; roundels are framed on the whole subject.

**22 · The Brahmin in the Throat (55.8 s).** *Works:* the hook in medias res (the line itself on the card); the brahmin
lit from inside like a coal; the couple walking away under the moon; the high hermitage in rose and snow (a new light).
*Weak:* the hermitage scenes are three shots of one place; the Nishadas are small. *Fix carried:* one place, one framing:
later episodes vary scale (close, wide, low angle) within a location.

**23 · The Elephant and the Tortoise (57.4 s).** *Works:* the red-ochre mural panel for Kashyapa's tale (a story inside a
story gets its own look); the transformations on the curse words; the violet grove of Alamba; the hanging sages read as a
fringe of tiny glowing figures. *Weak:* the elephant's legs are blocky; the carried load floats a little below the talons.

**24 · The Thumb-Sized Sages (55.6 s).** *Works:* the midday glare from above (a new light), Gandhamadana in green-gold
with petals, the sages letting go as sparks of light toward the snow; Indra under the omens. *Weak:* the branch in his beak
is thin at small sizes.

**25 · Why Indra Feared a Bird (56.5 s).** *Works:* the blue-white rite (a new light) as the hook; the macro shot of the
hoofprint puddle with the tiny sages under one stalk; Indra's foot passing over them as the turn; Shaunaka himself asks, as
in the CE. *Weak:* Brihaspati and Indra are dark figures against red arches.

**26 · Garuda Storms Heaven (55.8 s).** *Works:* the bruised-violet storm over white colonnades; Vishvakarma with his
hammer; Indra's cry to Vayu as the turn; the compass of heaven with the four quarters lighting as named. *Weak:* the
plan-view of the Naimisha fire is abstract; the fight cuts are quick and small.

**27 · The Wheel of Blades (55.4 s).** *Works:* the wheel itself (a frontal blade-rimmed wheel spinning over the vault's
cold steel-blue); the counter "90 × 90 mouths"; fire turned to steam; the serpents' ember eyes. *Weak:* the shrunk Garuda is
a gold speck in two shots.

**28 · A Boon from Vishnu (55.3 s).** *Works:* first light over a cloud-sea (gold below, blue above); Vishnu frontal and
large; the reversal (the bird offers the god a boon) as the turn; the banner with Garuda's image above the god.
*Weak:* several two-shots share one composition (Vishnu left, Garuda right).

**29 · The Feather and the Thunderbolt (58.2 s).** *Works:* the single gold feather falling in silver light with the
"Suparna" plaque; the rainbow after the storm as the new light for friendship; the earth on one feather. *Weak:* the hook
runs 3.6 s (two short sentences); the episode is at the upper limit.

**30 · Forked Tongues (57.1 s).** *Works:* dawn on Ramaniyaka (pink, misted); Vinata freed, unveiling, with Garuda bowing
(episode 18's bow reversed); the tongue forking in extreme close-up; the closing medallion of the snake sacrifice ties the
arc back to the frame story. *Weak:* the kusha "glow" is faint; the serpents read as a row.

### Remaining weaknesses (for whoever continues at episode 31)
- Close-up serpents with three hoods read as a hand (fixed in ep 30 by using index 0 for close-ups; keep single hoods close).
- Several figures (Vinata, Kashyapa, Brihaspati, Indra) are still dark silhouettes against bright grounds; raise `front` or
  give them a lit fill as Garuda now has.
- Rahu's neck band (ep 15) still reads as a grin; Kadru/horse merge in the ep 17 hook; Ananta's hoods (ep 12) read as a
  hand; the Moon in ep 13 is dark. Not re-rendered.
- The elephant module's legs are blocky; the carried load in `EP23.carry` sits slightly below the talons.
- The introduction renders slowly (≈ 1.5 s per frame at mb 4).

## Independent review 21–30 (review/independent-21-30.md): adopted and rejected

Read before episode 32 was scripted (episode 31 was scripted but not yet rendered, so it was brought under the same rules).

| # | Finding | Decision | How / where measured |
|---|---|---|---|
| 10 (first) | Make the scorecard honest | **Adopted** | `tools/scorecard.py` measures every audio number on the final mp4: ebur128 I / TP / LRA, `silencedetect` (−45 dB, ≥ 0.6 s), and the Next window's ebur128 loudness against the body's. Repeats also compare the 0.5 s, 3 s and last frames with the previous 3 episodes by a 64-bit DCT pHash (`key_repeats`, `key_min_dist`). Eps 21–30 re-scored; correction note in `QUALITY_SCORECARD.md`. |
| — | Next card really quieter (≥ 8 dB under, on the mp4) | **Adopted** (ep 31 on) | `tools/mix.py` sets the Next window 10 dB under the body AFTER mastering (iterated, 40 ms ramp: the limiter had squeezed the body and the boundary word/sting leaked); the gate fails a mix under 8 dB. |
| 1 | Lit faces | **Adopted** (kit) | `rig.js` light gets `fill` (a frontal fill on top of `front`); lighter `lit` colours for Indra, Kashyapa, Vinata, Brihaspati, Vyasa, Brahma, Vasuki, the nagas; every new arc character (`astika-arc.js`) has a mid-tone lit fill. *Eye* on each contact sheet. |
| 2 | Named subject ≥ 10 % of frame height | **Adopted** | Composition rule for every scene from ep 31 (Elapatra at ≈ 50 %, the sister at ≈ 60 %); *eye* column on the scorecard. |
| 3 | Vary the frame, not the grammar | **Adopted** | Hook style chosen by content (ep 31 direct speech over the canopy; ep 32 a question over the council from above), the hook card and the title placed by content (ep 31 top over the earth; title lands at 2.4–2.8 s), the arc's own NEXT treatment (`overlayNextScene({ style: 'serpent' })`: a lapis cartouche with a serpent border, placed per episode). Measured by `key_min_dist`. |
| 4 | Hook copy rules | **Adopted** | The gate fails an undefined pronoun in the hook; payoff never stated; deity faces kept clear of the card (checked on the 0 s still). |
| 5 | Real silence and dynamics | **Adopted** | `mix.py` mutes everything (≤ −60 dB) in the rest before the turn (≥ 0.6 s at −45 dB on the mp4); per-line `mixDb` (intimate lines −3…−5 dB, peaks +1) deepened automatically until LRA ≥ 4.2 LU; the gate checks both on the mix. |
| 6 | ≤ 2.6 words/s; lift the 1.5 s gap cap | **Adopted** | The gate fails > 2.6 words/s; rests now vary with the script (1.0–1.2 s before the turn, not a fixed 1.5). |
| 7 | One fixed upright caption band, full contrast; recap band above y = 1450 | **Adopted** (ep 31 on) | `"captionBand": { "y": 1400 }` in the script: one place, weight 700, the whole line at full contrast from its first word; the recap band at y = 300. Also found and fixed: the two EB Garamond files were swapped (`EBGaramond.woff2` is the Italic), so every "upright" caption had been italic: `fonts/fonts.css` now maps them correctly. |
| 8 | Ep 40 as an arc finale: a ≥ 4 s lit payoff + an arc-end card | **Planned for ep 40** | — |
| 9 | ≤ 2 new names per 10 s, one plaque per shot | **Adopted** | The gate counts first mentions of proper names in any 10 s window (ep 31 failed it once: the friend line was rewritten). |
| — | Throat coal in eps 21–22 reads as a second eye | **Not done** | It needs two full re-renders; not cheap. Left as a remaining weakness. |
| — | Vinata's hand-on-hip pose | **Adopted** (kit) | `vinata.js` standing pose: hands clasped low in front, arms straight; the same for Jaratkaru the bride (`nagini`). |
| — | Catalog: ep 11 `side` in a `main` arc | **Kept** | As decided at ep 21: a side tale inside the main arc, deliberate. |
| — | Trial Reel A/B on ep 31 | **Passed to the owner** | An upload setting, outside the render. |

Rejected: none of the top 10 outright. The reviewer's 1–2 dB figure for the Next window could not be reproduced exactly (ebur128 over [next.start, end] on the mp4 gives −5 to −7 dB for eps 21–30), but the point stands: it was nowhere near the 9–12 dB the scorecard claimed.

## Episodes 31–40 · the Astika arc (the frame story returns)

The arc shares `src/scenes/ep31/_common.js` (`EPA`: the holy places, beneath the earth, the earth disc, Vasuki's hall in four
moods, Shesha rearing straight up) and the new characters in `src/kit/characters/astika-arc.js` (Elapatra, Jaratkaru the bride
`nagini`, Jaratkaru the ascetic, Astika, Chyavana, Kashyapa the healer, the witness in the tree). Every episode passes
`tools/gate.mjs` before rendering; numbers are in `QUALITY_SCORECARD.md`.

**31 · Shesha Holds the Earth (57.6 s).** *Works:* the cold open is a direct-speech line over a moving image (Shesha's canopy
rising under the quaking earth); the seven hoods now read as one canopy with a crown of heads, not a hand; the earth as a painted
disc in the dark with Shesha's own pearl light (a new light); Brahma lit and frontal in a rose-gold dawn, with the serpent small
below him (a vertical, not a side-by-side, two-shot); the first real silence (1.04 s) and the first LRA over 4 (5.5 LU) in the
series; the Next really 10 dB under. *Weak:* the canopy still reads as a goblet when the body is thin; Shesha's white body blooms
in the dark cavern; the montage of holy places is dark and the serpent small in it; Garuda appears only in one shot.
*Fix carried:* the fixed caption band means every subject is composed above y ≈ 1300 or large enough that the band crosses the
legs (done in eps 32–36 by moving cameras and figures); the gate's LRA check failed ep 32 once, so `mix.py` now aims at 4.6 LU and
every script marks its intimate lines with `mixDb`.

**32 · Vasuki's Council (56.8 s).** *Works:* the hook is a question over the council seen from the vault (the frame chosen by the
content, not by a rotation); the serpents' three plans as sepia vision panels in the jewel-fire's smoke; Vasuki's single hood very
close for "No"; Brahma's memory in a cold silver-blue (a new light) with the sage, the bride and the boy as medallions; the sister
large and lit at the end; the teal moonlit forest with eyes in the roots. LRA 6.1 LU, a real 1.04 s silence, Next −10.3 dB.
*Weak:* the vision panels' figures are small; the hall is violet in three of its four shots; the gate refused the first render
for LRA (3.4 LU). *Fix carried:* every later script marks two or three quiet lines with `mixDb`; `mix.py` aims at 4.6 LU.

**33 · The Ancestors in the Pit (56.4 s).** *Works:* the hook is a statement card over the image itself (the rat at the root); the
pit as a top-lit shaft (a new light) and the reveal "I am Jaratkaru" as a camera rise up the shaft; "the grass is our line · the
rat is time · you are the last root" in three cuts on the beats; the three conditions as a short gold list on a dark panel; no
Sauti cut (the template broken on purpose). *Weak:* the hanging ancestors (the Pitr design turned head-down) are pale and their
faces small; the wilderness is a flat ochre; the ascetic is a pale grey on the dusk. *Fix carried:* figures in front of a fire
or a sun are moved so the light is beside them, not behind (eps 34–40).

**34 · The Bride with His Name (56.1 s).** *Works:* the green-gold forest with three rings of light for the three calls; the
over-the-shoulder exchange (the sage's dark profile, the serpents in the light beyond) instead of a side-by-side; the wedding in
the hall's gold lamps as a slow orbit; the sleeper and the watcher, and the sunset shaft crawling toward him for the cliffhanger.
*Weak:* the forest's trunks read as a barcode; the bride and Vasuki share one colour family and merge when close. *Fix carried:*
separate the two violet figures in depth (one foreground, one mid-ground) from ep 35 on.

**35 · The Sunset Prayer (55.8 s).** *Works:* the hook states the stake ("Wake the sage, and lose him forever") over the moving
image; the sandhya hour in the world above (a new light); Shaunaka himself asks "And what did she choose?" (the elder speaks for
the first time in the arc); the turn is the sage's reversal after a real silence; the word "asti" on a plaque and the small gold
flame of the promised child carried into the next episodes. *Weak:* the purple bride and the red shaft make many shots a similar
magenta; the sage's anger is a pose, not a face. *Fix carried:* vary the palette per shot (ep 36: white-gold birth, green
hermitage, blue moon).

**36 · The Boy Called Astika (56.2 s).** *Works:* the question hook with the boy in a ring of opening eyes; the birth as a
white-gold radiance (a new light); the waxing moon in four steps on the beats as the boy grows; Chyavana in an ember-lit green
hermitage; Sauti telling Shaunaka that the teacher was of his own family (a bridge to the next arc). *Weak:* the boy's standing
pose (Shringin's) keeps a hand on the hip; the court at the cliffhanger is dark. *Fix carried:* the frame-story figures got lighter
lit fills (Sauti, the elder, Janamejaya, Takshaka, the priests, the builder, Parikshit).

**37 · The Witness in the Tree (55.5 s).** *Works:* Kashyapa the healer appears at last (deferred since ep 7), leaf-green with his
pouch of herbs; the road at blazing noon (a new light) with short black shadows; the banyan burning to a grey heap and regrowing
sprout → leaves → tree in a green-gold light (another new light) as the turn; the man in the branches explains the hook's eye;
the catalog corrected (he burned with the tree and came back with it; Vasuki is pulled toward the fire, not in it). Takshaka's
five hoods now share a web and read as one canopy. *Weak:* the banyan's canopy is simple; the court at night repeats ep 36's
framing. *Fix carried:* the noon sacrifice in ep 38 is graded daylit through smoke rather than the night crimson.

**38 · Astika at the Gate (56.9 s).** *Works:* the hook in medias res (Vasuki: "My limbs are burning. Send your son!") with gold
mantra bands closing on him; the hall under the spell with a red shaft through the cracked vault (a new light); the boy on the
long road at a smoky red noon (a new light); the guards' crossed spears; the praise as the turn, the boy lit and set beside the
fire, not in front of it. *Weak:* the sacrifice is orange in five shots; the priests read as grey ghosts at small size.

**39 · Indra Lets Go (56.8 s).** *Works:* the chant as gold ropes of syllables spiralling up the smoke (a new light: storm-black
lit from below); Indra's white-gold car dragged down; "And Indra let go" as a close on his hand after a real silence; Takshaka
tumbling; "Stay! Stay! Stay!" with three rings of light; Takshaka held in the air in gold rings. *Weak:* Indra's car is a simple
canopy on clouds; Takshaka is cropped at the top while falling.

**40 · The Sacrifice Stops (58.0 s) · the arc finale.** *Works:* the hook over the fire sinking under the held serpent; the
enclosure after the fire in a cool blue dusk with embers (the first cool light at the sacrifice); the builder of ep 8 nodding, his
warning come true; the serpents' boon in Vasuki's hall at full gold (a new light); the review's finale rule: a 5.7 s lit payoff
(the boy running into his mother's arms under Vasuki's hood) and an arc-end card ("The end of an arc · Astika · Episodes 31–40 ·
the whole arc is in the Astika playlist") before the cliffhanger to Shaunaka's own family. *Weak:* the serpents' ring around the
boy is crowded; the telling of the Mahabharata (Vaishampayana and the king at night) is small and dark.

**A miss, and the tooling fix.** Ep 34's hook moved only 2.3 grey levels by 0.5 s (target ≥ 6): the forest opens on a slow push.
The gate's frame pass now also measures Move@0.5 and fails an episode under 6. It caught eps 35 (3.7), 36 (0.9) and 39 (4.0)
before they were rendered; their hooks now open on a fast ease-out move (19.4, 9.6, 35.6). The same pass caught static holds
over 4 s in eps 33 (the conditions shot), 35 (the "asti" shot) and 40 (the serpents' boon); each got a camera push.

### Remaining weaknesses (for whoever continues at episode 41)
- **Palette runs.** Within an episode one hue can dominate several shots (violet in the hall for eps 32 and 34, orange at the
  sacrifice for eps 38–39). Vary the light per shot as well as per location.
- **Small or pale figures in places.** The hanging ancestors (ep 33) are pale with small faces; the priests read as grey at small
  size; the telling at night (ep 40) is small. Shesha's white body blooms in the dark cavern (ep 31).
- **Silhouettes against fire.** Janamejaya and Astika still go dark when the fire is directly behind them; the fix is to set the
  fire beside the figure (done in eps 38–40), not more fill.
- **Boys' poses.** Astika is built on Shringin's body, whose standing pose keeps a hand on the hip.
- **Key-frame variety** is about the eps 21–30 level (pHash min distance 22–28 against a mean of 24.6): no repeats, but the hook
  card at the top and the title under it are still the most common layout. Ep 41 should open with a different frame.
- **Not re-rendered:** the throat coal in eps 21–22 (it reads as a second red eye); the elephant's legs are now tapered with knees
  and feet in `brothers.js`, but no episode since ep 24 has used the elephant, so it is untested in a scene.
- **Ep 34's hook** moved only 2.3 grey levels by 0.5 s (the only scorecard miss in eps 31–40); the gate now prevents it.

### Next steps
- Ep 41 opens the Bhrigu tales (catalog S01A06): Puloma, the rakshasa and Agni at Bhrigu's hermitage. Ep 36 already set up that
  Chyavana was of Shaunaka's family, and ep 40's cliffhanger shows a woman and a boar in the smoke.
- Keep `tools/gate.mjs` in the loop (it runs inside `tools/render.mjs`), and keep marking two or three intimate lines per script
  with `mixDb` so the LRA stays above 4.

## Episodes 41–50 · Phase A: the kit step-up and the scripts (Nov 11)

Nothing in this section has been voiced or rendered as an episode. The kit was tested on a lab reel (`--ep 99`, 27 s, voiced and mixed) and on
stills; the scripts were tested by the script gate on predicted voice lengths.

### The remaining weaknesses of episodes 31–40, and what was built for each

| Weakness (above) | What was built | Test still (`lab/kit41/`) | What was looked at |
|---|---|---|---|
| Palette runs (violet hall, orange sacrifice) | `KIT.stage.PAL`: one palette per scene section; the script names a palette on every line; the gate fails a hue that runs more than two lines (script) or two shots (measured on frames) | `kit-02-colour-depth-slide-*`, `kit-03-*`, `kit-04-*` | Five neighbouring shots in amber, green, purple, crimson, green: none shares a hue. The gate measured 25°, 104°, 301°, 6°, 84°, 211°, 135°, 133° on the lab reel. |
| A figure on a ground of its own hue (the gold boy in the gold hall) | The gate's figure probe: each figure's mean colour against the ground in its own box (ΔE ≥ 20; on its own hue, ΔL* ≥ 25) | `kit-02-colour-depth-slide-b` | The probe FAILED the first design: Puloma's green sari in her green hermitage (ΔE 14). Her sari is now indigo. The slate boar on a teal storm and the olive snake in an olive thicket were also caught by eye; the storm is now a purple dusk and the snake is paler on a dark green shade. |
| Silhouettes against fire | `KIT.stage.backlight`: a rim on both sides in the fire's colour, a cool bounce fill, a floor on the fill's luminance (`light.wrap / tint / bounce / minLum` in the rig) | `kit-01-backlight-old-vs-new` | The same figure twice in front of the same fire: left, the old rule, a black cut-out; right, face, horns, pelt and arm all readable at 400 px wide. |
| Flat depth | `KIT.stage.shot`: layers with a depth under one camera (pan × depth, zoom × depth), depth haze, rack focus; shafts, particles with depth, mist, vignette, a bristle-grain finish | `kit-02-*` (a slide: the hut and near trunks move against the hills), `kit-03-*` (an orbit), `kit-06-frame-within-rack-a/b` (rack focus) | Between the a and b stills the near trunk crosses from the left edge to the right while the hut and the figure shift only a little and the hills hardly at all; the parallax is real but modest at this camera travel. In the rack pair the figure and far bank are soft in a and sharp in b; the foreground reeds do not visibly soften in b, so the rack reads as a focus pull on the subject only. |
| Poses, not acting; the hand on the hip | `KIT.act` and the acting figure (`characters/actor.js`): 23 key poses that blend with anticipation and overshoot; blink, breath, gaze; cloth, hair and beard on the pose of 0.13 s ago; no pose keeps a hand on the hip | `kit-04-acting-1-anticipation`, `-2-action`, `-3-follow-through-turnword` | The arm goes back and up before the throw; in the third still the shawl and beard are still travelling. Checked on stills and a frame strip only; the two test clips (`clip-acting-ink.mp4`, `clip-closeup-rack.mp4`) were rendered but not watched in motion. |
| Small or pale faces | A face drawn for the close-up (eye with lid, iris and gaze; brow; mouth; a tear), keyed by `KIT.act.emo` | `kit-05-closeup-a-tender`, `kit-05-closeup-b-fear`, `cast-faces` | Tender (a small smile, lids low) against fear (brows up and pinched, eye wide, mouth open) reads at 400 px wide. Weary, wrath and sorrow read apart on three other faces. |
| One layout for every hook and title | Camera moves as named functions (`KIT.cam`), frame-within-frame (`KIT.stage.within`), four transitions born from the medium; each script fixes where its hook card sits | `kit-06-*`, `kit-09-transition-smoke`, `kit-10-transition-ink`, `kit-11-transition-brush`, `kit-12-transition-lamp` | Ink: blots with a dark wet edge. Brush: diagonal bristle bands. Lamp: the frame blooms to white-gold and opens on the next shot. Smoke: at its thickest the still is a flat field of the smoke's colour (by design, 0.1 s). |
| Type | `KIT.type.plaque` (the band brushes on, letters land, an underline draws), `turnWord`, `source`; kinetic emphasis in the fixed caption band (a 6 % swell and an underline on gilded names only) | `kit-07-plaque-kinetic-caption`, `kit-08-creature-source-line`, `kit-04-acting-3-*` | The plaque reads at phone size once moved clear of the face (the first placement covered Ruru's head). The source line is small (34 px) by intent and legible; in the lab cliffhanger it touches the figure's top-knot: scenes must keep the top of the frame clear for it. The caption band did not move. |
| Sound: one bed, no place | Three stems (ambience per place, foley, music by mood); the music 11 dB lower under the voice; a silence before every `rest` line; J-cuts by `ambLead` | (lab reel audio) | Measured, not listened to: music −15 dB under the voice, two silences (1.33 s longest), LRA 7.4 LU, −13.9 LUFS, −2.2 dBTP, Next −10.5 dB. Nobody has listened to the new instruments or the foley; they are synthesised from the old generators and may sound crude. |

### Things the tests showed that are NOT fixed

- **The flames are spiky.** The household fire (Agni as the witness) is seven sharp tongues; it reads as fire with a face, but it is cruder than the figures.
- **The boar is a flat grey mass** with simple legs; in the orbit still the foreground trunk hides part of it.
- **The viper is a small worm** at rest; it needs a scene to scale it.
- **The hand shapes** (the open palm especially) read as a mitten with a thumb.
- **Standing figures** are still a little stiff at the knees, and the women's saris are one simple bell.
- **The acting was judged on stills.** Anticipation and follow-through need to be watched in motion before episode 41 is rendered.
- **Vyasa, Vaishampayana and Janamejaya have two bodies now** (the old modules, and the acting figures from episode 47).
- **Key-frame variety.** A 64-bit pHash of two unrelated frames averages 32; the old "min distance vs the last three episodes" (22–28) was already at chance level and cannot be pushed "clearly above 24.6" by better pictures. The gate now fails under 22, warns under min 28 / mean 32, and also checks consecutive shots (fail ≤ 12). The honest target is the mean.

### The scripts

`script/ARC-41-50.md` is the plan; all ten scripts pass `node tools/gate.mjs --ep N` (41–50) on predicted voice lengths: 54.8–58.6 s, hooks 5–8 words spoken by 2.3–2.9 s,
turns at 42–57 %, 2.20–2.57 words/s, two rests each, 6–9 palettes with no hue for more than two lines, 5–8 camera moves, 4 medium transitions.
The catalog changes are listed in each episode's `notes`. (At the time of Phase A the CE hosts could not be opened; that was put right in Phase B, below.)

## Episodes 41–50 · Phase B: the visual rework, the story review and the CE pass (Nov 11)

Nothing in 41–50 is voiced or rendered yet. Episodes 1–40 draw exactly as before (`tools/regress.mjs`: 13 episodes × 10 frames identical).

### The visual review (review/independent-kit41-visual.md)

Proof is in `lab/kit41/v2/`: `before-after-540.jpg`, `before-after-phone-360.jpg`, `phone-360-all.jpg`, `side-by-side-ep39-40-vs-kit41v2.jpg`, `strips/*.png` (30 fps), `m13-one-body-old-vs-new.png`, `kit-*.png`, `cast-*.png`; the first kit's stills are in `before/`.

| Finding | What was done | Honest state |
|---|---|---|
| B1 translucent figures | Measured: the figures were opaque (`tools/opacity.mjs`: worst change 1/255). The see-through look came from blending a blurred and a sharp copy of each layer, from inner-glow discs and from pale fills with an outer glow. Layers are now composited opaque and blitted once; blur is a real filter; inner discs and outer glow are gone for the acting figures | fixed |
| B2 snake at the groin | Restaged: clear ground, the snake rears on an S-curve to chest height, a waist-up two-shot; a staging rule in script/ARC-41-50.md 9.2 and in the picture notes of 45–46 | fixed in the lab; the rule must be kept when the scenes are written |
| B3 emoji fire | No face. `hearthfire` is the series' altar and layered flame | fixed |
| B4 poster look | Silhouette-first lighting (dark, rich fill; thin rim; no outer glow), darker mural palettes, plaster and bristle texture, textile and jewellery detail | better; still flatter than a painted mural |
| M1/M2 acting | Moving holds (stillest second moves 1.2 grey levels), real-time anticipation / action / settle, polar arm blends, a smear frame | better; judged only on strips and one clip |
| M3 hands, M9 legs and feet, M10 cloth | Three hand shapes, calf and wedge feet, child proportions, pleats, folds, borders, lag | better; hands are still simple, feet are not planted in a walk |
| M4 text on faces | Face boxes per figure; plaques, turn-word and source line move clear; the frame gate fails on a hit | fixed (gate: "no text on a face") |
| M5 framing | Lower horizon, larger figures, filled foreground | better; the back-light test shot is still emptier than episode 40's fire shots |
| M7/M8 creatures | Boar rebuilt from masses with a four-phase gallop; spline snakes with a face | better |
| M11 transitions | No blank or near-white frame; brush has a dry bristle edge; smoke and lamp cross-dissolve underneath | fixed |
| M12 rack focus | All layers blur by depth | fixed |
| M13 one body per person | Vyasa, Vaishampayana, Janamejaya brought to their bibles (above) | closer, not identical |
| M14 skin | Natural range across ranks; Vyasa dark brown; Menaka no longer grey | fixed |

Not done: the pupil leading a head turn (m1), planted feet (m5). Does the new look beat episodes 39–40? On variety of colour, depth, readable faces, staging and text it does. On the fire-lit shots it does not clearly: episode 39–40's big fires and glowing silhouettes are still the more dramatic frames, and the new figures read as flat cut-outs beside them. A real answer needs one rendered episode judged at phone size.

### The story review and the CE pass

All in `script/ARC-41-50.md` section 9: the order of telling said on screen (9.1), the staging rules (9.2), every item of the story review with what was done (9.3), and the fidelity pass against the Critical Edition with verse numbers (9.4). Scripts: 54.6–58.5 s predicted, all pass the script gate. The CE text (GRETIL e-text) is in `lab/ce/` and is git-ignored.

Two things the CE pass found that no reviewer had: the rakshasa never says "You are the mouth of the gods" (removed from 41), and aired episode 36's "from the sage Chyavana" follows the vulgate where the CE reads "Chyavana's son" (1.44.18; catalog note; not re-voiced).

Kit changes made for the scripts: a recap line longer than 62 characters breaks into two lines (`KIT.series.recapBand`; shorter ones draw as before), and a long source line shrinks to fit (`KIT.type.source`). Still: `lab/kit41/v2/kit-13-recap-two-lines-and-order-note.png`.

## Episodes 41–50 · production log (Nov 11 on)

### Episode 41 · The Bride and the Demon (the pilot)

Before it: the fire gap was closed (`EP41.hearth`: a flame 1.6–1.75 × the kit's, a glow on the wall and on the ground, embers, a warm rim; figures side-lit by the fire with a cool bounce so a dark body stands off an orange wall); Puloman was redrawn as a rakshasa lord (taller, a heavy mane, two long horns swept back, a blood-red cloth, gold); eyes lead a head turn (`KIT.act.lead`); feet are planted in a walk (`KIT.act.stride`, a linear stance phase; the old cycle walked backwards and was put right).

Rendered twice. The first render was looked at on a 24-frame contact sheet and 30 fps strips (`lab/review/ep41/`) and failed on: Puloma cropped to half a face in the hook; the boar's head hidden behind the caption band, so that the rider seemed to kneel on a black hill; a 0.4 s cross-dissolve into the doorway shot that read as see-through figures; the memory cloud cut by the top edge. All four were fixed (the chase has its own, higher ground line; the dissolve is 0.2 s) and the episode re-rendered.

What the measurements say (mp4): 57.7 s; hook spoken by 2.98 s; motion at 0.5 s 16.0; no static hold; turn at 46 %; -14.1 LUFS, -2.1 dBTP, LRA 5.8; two silences (1.03 s); Next 10.4 dB under the body; no blank or near-white frame (brightest frame mean 114 of 255); peak -2.5 dBFS, no clipped sample; ambience differs by place (spectral centroid: hearth 990 Hz, night fire 909 Hz, forest 1598 Hz, storm 1156 Hz); share copy 19.2 MB (capped at 2.5 Mbit/s: the uncapped CRF 23 copy was 26 MB, the fire is expensive).

Lessons carried to 42 on:
- **The voice-length prediction is not safe.** Episode 41 came in 1.2 s over, 43 at 2.7 s over and 45 at 4.7 s over (the slow voices and the narrator at speed 1.0). Voice first, then trim; the narrator runs at 1.1 where an episode is long.
- **The figure-against-ground check is a mean colour against a mean colour.** A blue-black body in a red cloth averages to brown and fails against an orange wall although the eye separates it. What works: a cool bounce light on a dark figure before fire; a figure as a rim-lit silhouette against the flame itself; a strong front light on a figure against a dark ground.
- **The outgoing shot is still drawn during a transition**, and is measured as part of the next line: a figure must still stand off its ground after its line ends.
- **Captions hide the bottom 27 %.** Low heads (a boar, a lying figure, a snake) go above y = 1250 or the ground line is raised.
- **A swelling sound is laid by its peak** (`tools/score.py`), and each cue is logged as laid (`foley-cues.json`), because onsets cannot be read from a summed stem.
- **Picture sync cannot be proved by frame differences.** Every cue's action is keyed in code to the same beat as the sound (0 frames by construction); the measured largest picture change lay within 2 frames of the cue for 6 of 22 cues, and 7 cues show no more change than a median frame (a staff tap, a breath, a first step, the flame bending). Those actions are too small; later episodes make them larger.

Still weak in 41: the two frame-story shots are dark shapes beside a small fire (the old seated figures); the far rakshasa in `came` stays a little soft after the rack; the smoke puffs of the change are flat discs; the rider kneels calmly on a running boar.

### Episode 42 · The Child Who Fell

Rendered twice. The first render showed Puloma still with child in every shot after the birth (the walk, the river, the gate, the hut): a story error, seen on the contact sheet. A second figure, `pulomaMother` (the same woman, no longer with child), now carries episode 42 from `ash` on.

Measured (mp4): 56.7 s; hook by 2.56 s; motion at 0.5 s 19.2; longest static hold 1.1 s; turn (Bhrigu's question, a close-up after a 1.1 s silence) at 56 %; -14.1 LUFS, -1.8 dBTP, LRA 5.1; eight lights on screen (hue run 2); key frames against 39–41: min 26, mean 31.6; no blank or near-white frame; 20 of 23 foley cues on their beat (the three others are sustained sounds: a flame, a growl, the river); share 18.4 MB.

Lessons: check the body against the story after every event that changes it; a prop the character carries by default (Bhrigu's water-pot) turns up in close-ups and curses unless it is switched off (`pose.prop: false`); in the curse the pot read as a pan in his hand.

Still weak: Brahma in the cloud is a small gold emblem; the river is a pale wedge more than water; the child is a standing boy in light, not a new-born.
