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
