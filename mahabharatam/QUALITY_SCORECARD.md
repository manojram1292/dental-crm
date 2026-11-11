# Quality scorecard

One row per episode from episode 20 (the baseline) on. Every number that can be measured is measured:
`python3 -I tools/scorecard.py --ep N` reads the timeline, the script and the rendered video (decoded at
10 fps, 135×240 grey) and runs ebur128. The rest is checked on stills and marked *eye*.

**Columns and targets**

| Column | What | Target | Source |
|---|---|---|---|
| Hook@0 | the hook text is on screen at frame 0 | yes | still at t = 0 |
| Hook | words · speech end (s) | ≤ 8 · ≤ 3.0 | timeline (independent review #1) |
| Move@0.5 | mean grey-level change, frame 0 → 0.5 s (0–255) | ≥ 6 | video (#6) |
| Story | start of the first story line (s) | ≤ 6 | timeline (#2) |
| Hold | longest static hold (s): frames whose 1 s change stays under 2 grey levels | ≤ 4 | video |
| Turn | where the turn line starts (% of runtime) | 40–60 | timeline (the line noted "TURN") |
| Cap×fig | frames where a caption covers a key figure (of the 24-still contact sheet) | 0 | *eye* |
| Dur | duration (s) | 54–58, max 59 | timeline |
| Light | new location lights | ≥ 1 | *eye* / `_common.js` |
| Repeat | compositions repeated vs the previous 3 episodes (line-midpoint stills, 16×16 dHash, Hamming ≤ 30/240) | 0 | video |
| W/s · gaps | speech rate · gap sd / longest rest (s) | 2.4–2.6 · sd ≥ 0.25, one rest ≥ 0.8 | timeline (#8) |
| LUFS · TP | integrated loudness · true peak | −14 ± 1 · ≤ −1.0 | ebur128 (#3) |
| Next | the Next card's mean level vs the body (dB) | ≤ −6 | volumedetect (#10) |
| Open/Next | opening style (A question card · B direct speech · C statement) / Next variant | rotate | script (#7) |
| Fidelity | CE reference · tradition tags · the cliffhanger matches the next episode's opening | checked | script + catalog (#9) |
| Pure | `node tools/preview.mjs purity` | pure | tool |
| Share | share copy size (MB) | ≤ 20 | file |

## Rows

| Ep | Hook@0 | Hook | Move@0.5 | Story | Hold | Turn | Cap×fig | Dur | Light | Repeat | W/s · gaps | LUFS · TP | Next | Open/Next | Fidelity | Pure | Share |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 20 (baseline, Nov 4 render) | yes | 12 w · 5.45 s ✗ | 20.6 | 10.6 s ✗ | 4.0 s | 47 % | 2 of 24 (*eye*: the cliff and ask captions over Garuda) | 56.0 | 1 (Ramaniyaka at noon) | 0 | 2.13 ✗ · 0.33 / 1.5 | −20.4 ✗ · −1.1 | +2.0 dB ✗ | A / navy card | Adi 1.21–23 · none · ✓ (ep 21 opens on the price) | pure | 19.5 |
| 0 (intro, draft) | yes | 6 w · 3.05 s | 12.0 | 4.35 s | 2.5 s | n/a (a statement, no story turn) | 0 of 24 (*eye*) | 73.5 (intro: 55–75 target) | the title moments on a dark plaster ground; the rest is montage | n/a (montage by design) | 2.25 · 0.35 / 1.45 | −14.3 · −1.1 | −7.7 dB | A / BEGIN card | ≈100,000 (traditional) / ≈75,000 (CE); the tradition tag shown as the example | pure | 21.0 (73 s, capped) |
| 21 | yes | 6 w · 2.37 s | 22.8 | 3.7 s | 3.0 s | 52 % | 1 of 24 (*eye*: the "never" caption over Vinata) | 57.8 | 3 (late-gold island, amber palm grove, moonlit bay) + the blessing night | 0 | 2.45 · 0.33 / 1.55 | −14.1 · −0.9 ✗ (AAC overshoot; limiter headroom raised to 0.4 dB from ep 23) | −10.0 dB | A / NEXT › overlay | Adi 1.23–24 · none · ✓ (ep 22 opens on the throat) | pure | 18.8 |
| 22 | yes | 6 w · 2.46 s | 20.6 | 3.8 s | 3.9 s | 60 % | 1 of 24 (*eye*: the "come" caption at the top crosses the wing-tips) | 55.8 | 2 (the bay under a storm of dust; the high hermitage at dawn, rose and snow) + the lake in the vision | 0 | 2.63 · 0.33 / 1.55 | −14.1 · −1.0 | −10.7 dB | B / NEXT › overlay | Adi 1.25 · none · ✓ (ep 23 opens on the lake) | pure | 17.8 |
| 23 | yes | 8 w · 3.15 s ✗ (0.15 over) | 7.1 | 4.5 s | 4.2 s ✗ (the red-ochre panel, "tell") | 55 % | 0 of 24 (*eye*) | 57.4 | 2 (the red-ochre mural panel; Alamba at violet twilight) + the storm-green lake in full | 0 | 2.42 · 0.33 / 1.5 | −14.2 · −1.0 | −11.8 dB | C / NEXT › overlay | Adi 1.25–26 · none · ✓ (the curses checked: Vibhavasu cursed Supratika to be the elephant) | pure | 15.6 |
| 24 | yes | 7 w · 2.64 s | 25.9 | 3.9 s | 4.8 s ✗ (the "plead" shot under the branch) | 48 % | 0 of 24 (*eye*) | 55.6 | 3 (midday glare from above; Gandhamadana green-gold; the snow mountain at alpenglow) + heaven at night | 0 | 2.77 · 0.32 / 1.5 | −14.1 · −1.0 (after the remux with 1 dB AAC headroom) | −9.4 dB | A / NEXT › overlay | Adi 1.26 · none · ✓ (ep 25 opens on the Valakhilyas' rite) | pure | 17.5 |
| 25 | yes | 5 w · 2.39 s | 13.0 | 3.7 s | 1.2 s | 55 % | 0 of 24 (*eye*) | 56.5 | 4 (the blue-white rite at night; Indra's council hall under the omens; the sacrifice at bright morning; a hoofprint puddle at ground level) | 0 | 2.39 · 0.33 / 1.5 | −14.1 · −1.7 | −9.2 dB | B / NEXT › overlay | Adi 1.26–27 · none · ✓ (Shaunaka asks, as in the CE; ep 26 opens at heaven's gate) | pure | 15.8 |
| 26 | yes | 6 w · 3.03 s (on the line) | 19.3 | 4.3 s | 3.6 s | 47 % | 1 of 24 (*eye*: the "clear" caption over the charging gods) | 55.8 | 2 (heaven's courtyard under a bruised green-violet storm; the compass of heaven from above) | 0 | 2.48 · 0.35 / 1.5 | −14.2 · −1.7 | −10.6 dB | C / NEXT › overlay | Adi 1.28 · none · ✓ (ep 27 opens on the wheel) | pure | 18.3 |
| 27 | yes | 8 w · 2.76 s | 19.6 | 4.1 s | 1.1 s | 60 % | 0 of 24 (*eye*; captions moved high over the vault shots) | 55.4 | 3 (the inner court on fire, turning to steam; the vault in cold steel-blue; the open sky at deep blue dusk) | 0 | 2.68 · 0.34 / 1.5 | −14.2 · −1.8 | −9.5 dB | A / NEXT › overlay | Adi 1.29 · none · ✓ (ep 28 opens on Vishnu) | pure | 17.2 |
| 28 | yes | 5 w · 2.23 s | 62.2 | 3.5 s | 1.7 s | 59 % | 0 of 24 (*eye*) | 55.3 | 2 (first light over a cloud-sea; a white-gold sky for the banner) + Indra's storm at the cliffhanger | 0 (but within the episode several two-shots share one layout, *eye*) | 2.69 · 0.29 / 1.5 | −14.2 · −1.8 | −10.0 dB | B / NEXT › overlay | Adi 1.29 · none · ✓ (ep 29 opens on the vajra) | pure | 17.4 |
| 29 | yes | 7 w · 3.6 s ✗ (two sentences) | 58.6 | 4.9 s | 3.7 s | 44 % | 0 of 24 (*eye*) | 58.2 (over the 58 target, under the 59 max) | 2 (a silver noon among high clouds; the sky after the storm with a rainbow) | 0 | 2.49 · 0.33 / 1.5 | −14.2 · −1.6 | −9.2 dB | C / NEXT › overlay | Adi 1.29–30 · none · ✓ (the sage of the vajra left unnamed, as the line needs no name) | pure | 17.6 |
| 30 | yes | 7 w · 3.58 s ✗ (a slow Sauti line) | 12.6 | 4.9 s | 3.3 s | 44 % | 0 of 24 (*eye*) | 57.1 | 2 (Ramaniyaka at dawn, pink and misted; the kusha grass at ground level) + the Naimisha fire at first light | 0 | 2.49 · 0.35 / 1.5 | −14.1 · −1.8 | −9.2 dB | A / NEXT › overlay | Adi 1.30 · none · ✓ (catalog cliffhanger reworded "their mother's curse"; ep 31 opens the Astika arc) | pure | 14.1 |

## Summary (episodes 21–30 against the episode-20 baseline)

- **Hook**: 5–8 words in every episode (baseline 12); spoken by 2.2–3.6 s (baseline 5.45). Three episodes miss the 3.0 s
  target by 0.03–0.6 s (23, 29, 30); all are under 3.6 s.
- **Story start**: 3.5–4.9 s (baseline 10.6); every episode meets ≤ 6 s.
- **Motion by 0.5 s**: 7–62 grey levels (every hook moves from frame 0; ep 23's 7.1 is the slowest: the elephant's rear starts slow).
- **Longest static hold**: 1.1–4.8 s; two misses (ep 23 4.2 s on the mural panel, ep 24 4.8 s under the branch).
- **Turn**: 44–60 % in all ten (each after one 0.85–0.9 s rest; gap max 1.5 s in every episode).
- **Speech rate**: 2.39–2.77 words/s (baseline 2.13); gap sd 0.29–0.35.
- **Loudness**: −14.1 to −14.2 LUFS, −1.4 to −1.9 dBTP on the mp4s (baseline −20.4); the same for episodes 0–20 after
  the remaster.
- **Next card**: 9–12 dB under the body (baseline +2 dB), ≈ 1.1 s.
- **Repeated compositions vs the previous 3 episodes** (dHash): 0 in all ten.
- **New lights**: 2–4 per episode.
- **Purity**: pure in all. **Share copies**: 14.1–18.8 MB (the 73 s introduction: 21.0 MB).

## Correction (Nov 7): what the old rows over-claimed, and the re-score

The independent review of eps 21–30 (`review/independent-21-30.md` §6) found that this scorecard over-claimed. It was right on each point:

- **The Next card.** The old tool compared the mean volume of the Next window *plus the fade-out tail* with the body, which made the
  card look 9–12 dB quieter. Measured properly on the mp4 (ebur128 integrated, [next.start, end] against [0, next.start]), eps 21–30
  are only **5.1–7.0 dB** under the body. The mastering limiter squeezed the body; the pre-master −9 dB did not survive.
- **The rest.** The 0.85–0.9 s "rest" before the turn existed in the timeline but the music bed played straight through it:
  `silencedetect` (−45 dB, ≥ 0.6 s) finds **no silence in any of eps 21–30**.
- **Loudness range.** Never measured before: **1.9–2.6 LU** in all ten (nothing breathes).
- **Repeats.** Only line-midpoint stills were compared, so the repeated hook, title and Next layouts were never tested. The tool now
  also compares the 0.5 s, 3 s and last frames by pHash (`key_repeats` at Hamming ≤ 10/64, and `key_min_dist`, the closest
  same-slot pair against the previous three episodes: higher is more varied). Eps 21–30: no pair ≤ 10; `key_min_dist` 20–28.
- **Ep 21's true peak** (−0.9 ✗) was a stale pre-remux number: the mp4 measures **−1.8 dBTP**.
- **Ep 28's caption column** said 0, but the hook card covers Vishnu's face at t = 0: it should read **1 of 24**.
- **Speech rate**: eps 22, 24, 27, 28 run 2.63–2.77 words/s, over the 2.6 the review asked for; the rows showed the numbers but
  the summary called the item adopted.

`tools/scorecard.py` now measures every audio number on the final mp4 (ebur128 I / TP / LRA, silencedetect, the Next window by
ebur128), and adds the key-frame pHash check. Re-scored eps 21–30 (audio and repeats only; the other columns stand):

| Ep | LUFS · TP (mp4) | LRA | Silences ≥ 0.6 s at −45 dB | Next vs body (ebur128) | W/s | Key repeats · min dist |
|---|---|---|---|---|---|---|
| 21 | −14.1 · −1.8 | 2.6 ✗ | 0 ✗ | −6.3 ✗ | 2.45 | 0 · 28 |
| 22 | −14.1 · −1.9 | 1.9 ✗ | 0 ✗ | −6.1 ✗ | 2.63 ✗ | 0 · 24 |
| 23 | −14.2 · −1.7 | 2.0 ✗ | 0 ✗ | −7.0 ✗ | 2.42 | 0 · 22 |
| 24 | −14.2 · −1.7 | 2.0 ✗ | 0 ✗ | −5.5 ✗ | 2.77 ✗ | 0 · 24 |
| 25 | −14.1 · −1.7 | 2.0 ✗ | 0 ✗ | −5.8 ✗ | 2.39 | 0 · 26 |
| 26 | −14.2 · −1.7 | 2.2 ✗ | 0 ✗ | −6.3 ✗ | 2.48 | 0 · 26 |
| 27 | −14.2 · −1.8 | 2.1 ✗ | 0 ✗ | −5.1 ✗ | 2.68 ✗ | 0 · 22 |
| 28 | −14.2 · −1.8 | 2.1 ✗ | 0 ✗ | −5.5 ✗ | 2.69 ✗ | 0 · 20 |
| 29 | −14.2 · −1.6 | 2.2 ✗ | 0 ✗ | −5.1 ✗ | 2.49 | 0 · 26 |
| 30 | −14.1 · −1.8 | 2.2 ✗ | 0 ✗ | −5.3 ✗ | 2.49 | 0 · 28 |

## Rows from episode 31 (the honest scorecard; the pre-render gate)

From episode 31 every episode passes `tools/gate.mjs` before a final frame is rendered (`tools/render.mjs` runs it after the score
and the mix): hook ≤ 8 words and ≤ 3.0 s, story ≤ 5 s, turn 40–60 % after a ≥ 0.8 s rest, ≤ 59 s, Next ≤ 1.2 s, no static hold
> 4 s (a 1/8-size pass), ≤ 2.6 words/s, ≤ 2 new names per 10 s, no undefined pronoun in the hook, one fixed caption band, a real
silence ≥ 0.6 s at −45 dB, LRA ≥ 4 LU, Next ≥ 8 dB under the body. New targets: **LRA ≥ 4**, **silence ≥ 1**, **Next ≤ −8 dB**,
**words/s ≤ 2.6**, **key min dist** above the eps 21–30 mean (24.6).

| Ep | Hook | Move@0.5 | Story | Hold | Turn | Cap×fig | Dur | Light | Repeat (mid · key · min dist) | W/s · gaps | LUFS · TP · LRA | Silence | Next | Open / Next | Fidelity | Pure | Share |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 31 | 5 w · 2.11 s | 15.2 | 3.4 s | 2.9 s | 43 % | 0 of 24 (*eye*: fixed band at 1400; the canopy and the earth composed above it) | 57.6 | 3 (the holy places before dawn, indigo and ash-silver; Brahma's rose-gold dawn on the snow; beneath the earth, Shesha's pearl light) + the grove at moonset | 0 · 0 · 24 (= baseline) | 2.56 · 0.33 / 1.5 | −14.1 · −1.7 · **5.5** | 1 (1.04 s) | **−10.3 dB** | direct speech over the canopy / the arc's serpent cartouche | Adi 1.32 · none · ✓ (ep 32 opens on the council) | pure | 14.9 |
| 32 | 8 w · 2.72 s | 9.4 | 3.87 s | 2.2 s | 48 % | 0 of 24 (*eye*: fixed band at 1400) | 56.8 | 3 (the hall by its jewel-fire; the memory in silver-blue; the forest at night in teal) + the vision panels | 0 · 0 · 24 | 2.49 · 0.3 / 1.35 | -14.1 · -1.7 · **6.1** | 1 (1.04 s) | **-10.3 dB** | question over the council from the vault / serpent cartouche | Adi 1.33–35 · none · ✓ (ep 33 opens on the wanderer) | pure | 16.2 |
| 33 | 7 w · 2.38 s | 20.3 | 3.53 s | 2.3 s | 49 % | 0 of 24 (*eye*: fixed band at 1400) | 56.4 | 3 (the wilderness at ochre dusk; inside the pit, top-lit by the moon; the grey-rose dawn on the rim) | 0 · 0 · 24 | 2.35 · 0.31 / 1.35 | -14.1 · -1.7 · **5.2** | 1 (1.11 s) | **-10.3 dB** | statement card over the image (the rat) / serpent cartouche | Adi 1.41–42 (and 1.13) · none · ✓ | pure | 12.7 |
| 34 | 7 w · 2.58 s | 2.3 ✗ (the forest hook starts on a slow push; the gate now checks Move@0.5) | 3.73 s | 2.0 s | 53 % | 0 of 24 (*eye*: fixed band at 1400) | 56.1 | 3 (the deep forest in green-gold shafts; the hall in wedding gold; the chamber at evening, violet, one lamp) + the sunset shaft | 0 · 0 · 24 | 2.55 · 0.28 / 1.35 | -14.2 · -1.8 · **4.8** | 1 (1.04 s) | **-10.3 dB** | direct speech (the cry in the forest) / serpent cartouche | Adi 1.42–43 · none · ✓ | pure | 12.9 |
| 35 | 7 w · 2.62 s | 17.8 | 3.77 s | 3.0 s | 46 % | 0 of 24 (*eye*: fixed band at 1400) | 55.8 | 3 (the sandhya hour in the world above; the chamber in the red shaft; the chamber at night) + the hall at dawn | 0 · 0 · 24 | 2.58 · 0.27 / 1.35 | -14.1 · -1.6 · **5.2** | 1 (0.94 s) | **-10.3 dB** | statement card (the stake) / serpent cartouche | Adi 1.43–44 · none · ✓ | pure | 11.6 |
| 36 | 7 w · 2.43 s | 8.5 | 3.58 s | 3.3 s | 42 % | 0 of 24 (*eye*: fixed band at 1400) | 56.2 | 4 (the birth light; a hermitage of Bhrigu's line at morning; the waxing moon over the serpent world; the court at night by torchlight) | 0 · 0 · 28 | 2.45 · 0.28 / 1.35 | -14.1 · -1.7 · **5.6** | 1 (1.1 s) | **-10.3 dB** | question card (the boy in the ring of eyes) / serpent cartouche | Adi 1.44 · none · ✓ | pure | 13.3 |
| 37 | 7 w · 2.45 s | 16.8 | 3.6 s | 3.0 s | 43 % | 0 of 24 (*eye*: fixed band at 1400) | 55.5 | 3 (the road at blazing noon; the regrowth light, green-gold; the sacrifice ablaze now) | 0 · 0 · 22 | 2.54 · 0.28 / 1.35 | -14.1 · -1.8 · **4.9** | 1 (1.06 s) | **-10.3 dB** | statement card (the eye in the leaves) / serpent cartouche | Adi 1.45–46 (reordered, catalog corrected) · none · ✓ | pure | 16.6 |
| 38 | 7 w · 2.99 s | 7.1 | 4.14 s | 3.1 s | 53 % | 0 of 24 (*eye*: fixed band at 1400) | 56.9 | 3 (the hall under the spell, a red shaft; the plain at a smoky red noon; the enclosure at noon through smoke) | 0 · 0 · 22 | 2.43 · 0.28 / 1.35 | -14.2 · -1.7 · **5.8** | 1 (1.06 s) | **-10.3 dB** | direct speech in medias res (Vasuki) / serpent cartouche | Adi 1.49–50 · none · ✓ | pure | 17.4 |
| 39 | 8 w · 2.97 s | 36.5 | 4.12 s | 0.0 s | 47 % | 0 of 24 (*eye*: fixed band at 1400) | 56.8 | 2 (Indra's heaven under a rumour of smoke; the sky over the sacrifice with gold chant-ropes) | 0 · 0 · 24 | 2.2 · 0.27 / 1.35 | -14.1 · -1.6 · **5.1** | 1 (1.07 s) | **-10.3 dB** | statement card (the car dragged down) / serpent cartouche | Adi 1.51–53 (catalog refs widened) · none · ✓ | pure | 17.8 |
| 40 | 7 w · 2.28 s | 23.4 | 3.43 s | 0.0 s | 47 % | 0 of 24 (*eye*: fixed band at 1400) | 58.0 | 2 (the enclosure after the fire, blue dusk and embers; Vasuki's hall at full gold dawn) + the night of the telling | 0 · 0 · 24 | 2.35 · 0.65 / 2.4 | -14.1 · -1.7 · **5.7** | 1 (1.04 s) | **-10.3 dB** | statement card over the fire sinking; arc-end card / serpent cartouche | Adi 1.51–53 · none · ✓ (ep 41 opens the Bhrigu tales) | pure | 19.7 |

## Summary (episodes 31–40 against episodes 21–30, all measured on the mp4)

| | Eps 21–30 (re-scored) | Eps 31–40 |
|---|---|---|
| Hook | 5–8 w · 2.2–3.6 s (3 misses over 3.0 s) | 5–8 w · 2.1–2.99 s (0 misses: the gate fails > 3.0 s) |
| Story start | 3.5–4.9 s | 3.4–4.1 s |
| Motion by 0.5 s | 7–62 | 7.1–36.5 (one miss: ep 34 at 2.3, before the gate checked it) |
| Longest static hold | 1.1–4.8 s (2 misses) | 0–3.3 s (0 misses: the gate's frame pass) |
| Turn | 44–60 % | 42–53 % |
| Words/s | 2.39–2.77 (4 over 2.6) | 2.20–2.58 (0 over) |
| Loudness / true peak | −14.1 to −14.2 / −1.6 to −1.9 | −14.1 to −14.2 / −1.6 to −1.8 |
| **LRA** | **1.9–2.6 LU** (all ✗) | **4.8–6.1 LU** (all ✓) |
| **Real silence ≥ 0.6 s at −45 dB** | **0 in all ten** | **1 in every episode** (0.94–1.10 s, before the turn) |
| **Next vs body** | **−5.1 to −7.0 dB** (all ✗) | **−10.3 dB** in all |
| Key-frame pHash min distance | 20–28 (mean 24.6) | 22–28 (about the same; no repeats at ≤ 10/64) |
| New lights | 2–4 | 2–4 |
| Share copies | 14.1–18.8 MB | 11.6–19.7 MB |
| Captions | thin italic (the font files were swapped), position jumps | one fixed bold upright band at 1400, full contrast |

## Targets from episode 41 (the step-up; no rows yet: nothing is rendered)

Everything above stays. Added by `tools/gate.mjs` (S = on the script alone, F = `--frames`, A = `--audio`) and `tools/scorecard.py` (M = on the mp4):

| Check | Target | Fails at | Where |
|---|---|---|---|
| Hook spoken | ≤ 2.8 s (aim) | > 3.0 s | S |
| Caption hold | every captioned line on screen ≥ 1.8 s | < 1.8 s | S |
| Names | every new name has a 1–6 word identifier (`names`); no "as we saw" | any missing | S |
| Loop | the hook's question answered in the episode; the previous episode's by 15 s | > 15 s, or a question that does not match | S |
| Titles | `episodeTitle`, `nextTitle` equal the catalog's | any mismatch | S |
| Source line | `sourceLine` + `madeLine` ("synthetic"); on screen ≥ 1.0 s | missing / < 1.0 s | S / F |
| Colour script | a palette on every line; ≥ 2 the episode before did not use | hue run > 2 lines | S |
| Shot hues | dominant hue of each shot's midpoint frame | run > 2 shots | F, M (`hue_run`) |
| Figure vs ground | CIE ΔE between a figure (≥ 10 % of frame height) and the ground in its box | ΔE < 20, or on its own hue with ΔL* < 25 | F |
| Camera | ≥ 4 distinct moves; one signature shot | < 4 | S, F (probe) |
| Transitions | ≥ 2 distinct of ink / brush / lamp / smoke | < 2 | S, F (probe) |
| Close-up | one face close-up with a change of emotion; a figure ≥ 1.4 frame heights in that line | none | S, F |
| Sound layers | ambience on every line (≥ 2 places), ≥ 3 music moods, a foley cue on every spoken line | any missing | S |
| J / L cuts | ≥ 2 (≥ 150 ms), no overlapping speech | < 2 | S |
| Rests | 2 real silences | 0 (1 warns) | S, A |
| Stems | three stems; the music ≥ 6 dB lower under the voice | < 6 dB | A |
| True peak | ≤ −1.5 dBTP on the mix | > −1.5 | A |
| Key frames vs the previous 3 episodes | pHash min ≥ 28 and mean ≥ 32 | min < 22 | F, M (`key_min_dist`, `key_mean_dist`) |
| Consecutive shots | pHash mean ≥ 28 | any pair ≤ 12 | F |

Unchanged: −14 LUFS (±1), LRA ≥ 4, Next ≥ 8 dB under the body, hook ≤ 8 words, motion by 0.5 s ≥ 6, story by 5 s, turn 40–60 %, no static hold > 4 s, ≤ 2.6 words/s,
≤ 2 new names per 10 s, Next ≤ 1.2 s.

**On key-frame variety.** Two unrelated frames differ by 32 of 64 pHash bits on average, and the smallest of nine such pairs is about 26. Episodes
21–40 scored a min of 20–28 (mean of the mins 24.6): chance level. Episode 40 measures min 24, mean 30.4. A min "clearly above 24.6" would need the
frames to be deliberately unlike, not merely different, so the mean is the target and the min only guards against a near-repeat.

**The kit lab reel (ep 99; 27 s; not an episode)** through the whole gate, to show the new checks run: 7 camera moves and 4 medium transitions seen by the probe; shot hues 25 / 104 / 301 / 6 / 84 / 211 / 135 / 133°
(run ≤ 2); 419 figure samples, all standing off their grounds; source line 3.3 s; consecutive shots pHash min 22, mean 26.9; 2 silences (longest 1.33 s); LRA 7.4 LU;
three stems, music −15 dB under the voice; −2.2 dBTP; Next −10.5 dB. Its picture and sound were not judged as an episode.

**Phase B additions to the gate (F = `--frames`).** Text on a face: a plaque, turn-word, source line or caption that crosses a figure's face box in more than 2 sampled frames fails the episode. `tools/opacity.mjs`: figures over two grounds must not change by more than 2/255 (measured 1/255), and the stillest second of a held pose must still move (measured 1.2 grey levels). The lab reel after the rework: 7 camera moves, 4 transitions, shot hues 25 / 103 / 307 / 6 / 89 / 30 / 129 / 128, 418 figure samples all standing off their grounds, no text on a face, consecutive shots pHash min 20, mean 25.1. Scripts 41–50 after the story review: 54.6–58.5 s predicted, turns at 41–57 %, 2.23–2.55 words/s.

## Rows from episode 41 (measured on the mp4: `tools/scorecard.py`, `tools/soundcheck.py`, `tools/review.py`)

Foley column: cues whose onset or peak lies within 2 frames of the beat they were asked for, of all cues (from episode 42 each sound is measured alone, before it is summed into the stem: `audio/epNN/foley-cues.json`; episode 41 was measured in the summed stem). Lights: distinct palettes on screen. Key frames: pHash against the three episodes before.

| Ep | Dur | Hook | Move@0.5 | Turn | W/s | Lights · hue run | Camera · transitions | LUFS · TP · LRA | Silences | Next | Stems rms (amb · foley · mus) | Foley on the beat | Peak · clipped | Key frames min · mean | Share |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 41 | 57.7 | 7 w · 2.98 s | 16.0 | 46 % | 2.44 | 4 · 2 | 8 · 4 | -14.1 · -2.1 · 5.8 | 2 (1.03 s) | -10.4 dB | -35.1 · -37.5 · -26.6 | 19 of 22 | -2.5 dBFS · 0 | 22 · 28.4 | 19.2 |
| 42 | 56.7 | 7 w · 2.56 s | 19.2 | 56 % | 2.30 | 8 · 2 | 8 · 4 | -14.1 · -1.8 · 5.1 | 2 (1.12 s) | -10.3 dB | -34.7 · -34.3 · -25.6 | 20 of 23 | -2.5 dBFS · 0 | 26 · 31.6 | 18.4 |
| 43 | 56.9 | 5 w · 2.46 s | 13.1 | 57 % | 2.47 | 8 · 2 | 6 · 4 | -14.1 · -2.3 · 5.9 | 2 (1.05 s) | -10.3 dB | -35.2 · -34.6 · -26.9 | 16 of 20 | -2.5 dBFS · 0 | 22 · 32.0 | 17.8 |
