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
