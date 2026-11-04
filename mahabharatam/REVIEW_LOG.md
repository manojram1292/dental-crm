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
