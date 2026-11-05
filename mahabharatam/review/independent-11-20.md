# Independent review · episodes 11–20

Method: frames at 0, 0.5, 1, 2 and 3 s, a contact sheet at 1 frame per 2 s, and the last 3 s of each episode; ebur128 loudness and RMS over the voice gaps; the timeline JSON. Watched with the sound off, then on. This view was formed before reading REVIEW_LOG.md.

## 1. Scores (/10)

| Ep | Hook | Clarity | Readability | Pacing | Peak | Fidelity/respect | Loop/end |
|---|---|---|---|---|---|---|---|
| 11 | 7 | 6 | 7 | 6 | 5 | 8 | 7 |
| 12 | 7 | 7 | 6 | 6 | 6 | 7 | 6 |
| 13 | 5 | 6 | 6 | 5 | 4 | 8 | 7 |
| 14 | 8 | 7 | 6 | 6 | 8 | 7 | 6 |
| 15 | 9 | 8 | 7 | 8 | 8 | 9 | 7 |
| 16 | 6 | 6 | 6 | 7 | 5 | 8 | 9 |
| 17 | 6 | 9 | 6 | 7 | 7 | 9 | 7 |
| 18 | 4 | 8 | 6 | 7 | 8 | 8 | 8 |
| 19 | 6 | 8 | 5 | 7 | 6 | 7 | 7 |
| 20 | 6 | 8 | 5 | 7 | 6 | 7 | 8 |

**Biggest fix per episode**
- **11.** The recap ("Aruna became the red of dawn") right after "Where did this horse come from?" is a non sequitur for newcomers. Recap the horse, or drop the recap.
- **12.** About 12 s of the same earth cut-away. The cliffhanger "the ocean began to burn" is wrong: the forests burn.
- **13.** The hook figure doesn't read as the Moon. Open on Shri or on Dhanvantari's pot. All five wonders share one centred composition.
- **14.** The story starts at about 16 s because of Sauti's meta line. Move the source note to a legible card or the narrator's voice.
- **15.** Rahu's glowing neck band reads as a grin, which makes the run's best image comic.
- **16.** A five-line hook whose answer is guessable, and ambiguous grappling figures. Open on Sudarshana or the hurled peaks.
- **17.** In the hook, Kadru's head and arm merge with the horse's head and read as a horn. The first 3 s are quiet (−31.5 dB RMS against −28 dB for the speech).
- **18.** The 0–3 s frames are static, the question answers itself ("the one who cheated"), and the flying sisters read as lying down.
- **19.** "Born so bright", but the picture is a dark silhouette with a cartoon smile.
- **20.** Garuda grins through "What will buy our freedom?", which undercuts the climax.

## 2. Cross-episode patterns

- **Hook creep.** Hook speech grew from 6 words and 2.7 s (ep 11) to 12–13 words and 5–5.5 s (eps 16–20). The story now starts at 9–12 s, which is 17–22 % of the runtime.
- **Mass-produced risk.** All ten episodes run the same skeleton: capitals hook card → sawtooth "fire edge" → the same sepia "Previously" arch → a Sauti campfire cut → lacquer plaques → the same navy NEXT card. Viewers stop noticing the plaques, the Sauti cut and the fire edge by episode 3. The fire edge reads as a border, not as fire (in ep 17 the horse seems to stand in flames). The deva and asura friezes repeat through eps 11–16. The art is genuinely per-episode, but the frame around it is what a policy reviewer sees.
- **Captions.** The thin italic serif loses contrast over silhouetted crowds at the cliffhangers (eps 11, 12, 15, 16), which are the lines that matter most. The caption position jumps between top and bottom. The "As tradition tells it" tag and the ep 14 source line are about 24 px, too small to read on a phone.
- **Audio.**
  - Integrated loudness is **−19.2 to −21.2 LUFS**, 5–7 dB under the −14 norm. YouTube does not turn quiet videos up. README targets voice at −16 LUFS, so level is being lost after the mix.
  - Gaps between lines are 0.35–0.6 s about 90 % of the time, and speech runs at 1.9–2.3 words/s. The result is a metronomic TTS rhythm. The rare real rests (ep 14 1.0 s, ep 18 1.3 s) are the best moments.
  - There is no true silence anywhere.
  - The "silent" Next card is as loud as the speech.
  - The voice switches from British Sauti to the American narrator within 5 s.

## 3. Top 10 for episodes 21–30

1. **Hook of 8 words or fewer, spoken in 3.0 s or less, at most three card lines.** *Measure:* `hook.speechEnd` ≤ 3.0; swipe-away and skip rate against the ep 11–20 median.
2. **Story by 6 s.** Mid-arc recaps become an unvoiced strip over the first story shot. *Measure:* `lines[2].start` ≤ 6; retention at 10 s.
3. **Master at −14 LUFS, ≤ −1 dBTP.** *Measure:* ebur128 I between −15 and −13, as a release gate.
4. **Captions.** An upright or heavier face, a scrim or stroke, one fixed band, and tags at 36 px or more. *Measure:* sampled contrast of at least 4.5:1 behind 100 % of cliffhanger captions.
5. **No smile on Garuda or Rahu.** Make Garuda luminous, as the text describes. *Measure:* a five-person blind test ("what is he feeling?") with zero "happy" answers; comment sentiment.
6. **Real motion in 0–1 s, on the episode's answer image.** *Measure:* mean frame difference over 0–3 s above a threshold (ep 18 would fail).
7. **Break the template.** Rotate 3–4 opening grammars, vary the NEXT card per arc, and redraw or retire the fire edge. *Measure:* perceptual-hash similarity of first and last frames across episodes falls below the baseline.
8. **Vary the rhythm.** Aim for 2.4–2.6 words/s, gaps from 0.15 to 1.2 s, and one rest of 0.8 s or more per episode. *Measure:* standard deviation of the gaps ≥ 0.25 s; average % viewed.
9. **Fidelity copy-check.** The cliffhanger must match what the next episode shows, and every `approx` ref is verified before it is printed. *Measure:* zero mismatches on a per-episode checklist.
10. **Shorter end, plus links.** Overlay "Next ›" on the cliffhanger image for 1.0 s or less, and turn on Link-a-reel and Related-video links. *Measure:* retention over the last 3 s, the ratio of views to engaged views, and next-episode click-through.

## 4. Factual and respect concerns

- **Ep 14.** "The oldest manuscripts do not hold [it]" overclaims. The CE relegates the kalakuta passage (Adi 1.16) because it is missing from a manuscript group, not because of age. A bard citing manuscripts also breaks the frame. Give the note to the narrator ("The Critical Edition leaves this out; many tellings keep it"). The tagging itself is exemplary.
- **Ep 12.** In 1.16 the fire comes from Vasuki's mouths and Mandara's forests burn. The ocean does not.
- **Ep 12, the `hold` note** says the CE names neither end. My recollection is that 1.16 places the asuras at Vasuki's head and the gods at his tail. Please verify.
- **Ep 16.** I believe 1.17 ends with the amrita given to Nara (Kiritin) for safekeeping. Please check; if so, it is a faithful detail that pays off later with Arjuna.
- **Ep 18.** "Foretold" softens Aruna's curse in 1.14. Ep 10 says "curse", so keep that word.
- **Catalog.** Ep 11 has `layer: "side"`, but its arc S01A02 is `main`.
- **Respect.** Garuda, a revered vahana, grins in eps 19–20, including the climax. The ep 16 fighters' chest contours read ambiguously. Shiva is serene, though he blooms to a white block.
- **Missing file.** `episode20-share.mp4` is missing.

## 5. Where I disagree with REVIEW_LOG.md

- **The loop is not "seamless".** A full navy NEXT card is a stop signal, and the hook voice restarts cold.
- **Long holds are not "fixed from ep 12".** The timeline still shows 6–7 s single-picture lines (ep 13 milk 7.3 s, ep 19 rise 6.9 s, ep 20 hook 6.9 s), and the log never flags the hook growing to 5.5 s.
- **Loudness is never mentioned**, though it is the cheapest win here.
- **Garuda does not read well "at every size".** The smile and the dark-on-bright contradiction are already there in ep 19. I would re-render the 19–20 hooks and covers, not just fix the kit.
- **Ananta's seven hoods are not a strong first frame.** At phone size they read as a hand.
- **Agreed:** the ep 11 title overlap, the ep 13 repeated composition, the fruit-slice peaks and the flying pose. The log's shot-level discipline is good, but it misses the series-level patterns: the template, the hook length, the audio level and the captions.
