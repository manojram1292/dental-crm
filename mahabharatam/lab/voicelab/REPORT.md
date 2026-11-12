# Voice lab: a more natural narration (episode 44)

The owner: "I am not very satisfied with the narration. It is robotic. Can you make it more natural?"

**Nobody listened to anything in this folder.** Every number below is a proxy (pitch statistics, pauses, a speech
recogniser). They can say that a voice moves more or is understood; they cannot say that it sounds natural, warm or right
for the epic. The owner's ear decides: play the three clips.

## Recommendation

**Candidate C, Chatterbox, for the narrator**, subject to the owner hearing the clips and to the two conditions under
"Before rolling out".

- It is the only candidate whose pitch moves clearly more than today's voice: 17.8 semitones per line against 10.1 (a
  flat contour is the usual cause of "robotic"), with the same recogniser error count (3 of 107 words).
- It fits the pictures already rendered: all 12 lines of episode 44 go inside their old windows with at most 7.4 % tempo
  change, no word cut, both real silences kept. `episode44.newvoice.mp4` is that remix and passes the audio gate.
- It is free and licensed for commercial use (MIT), runs on this CPU without a GPU, and costs about 25 minutes an episode.

Directing Kokoro (candidate B) did **not** do what was hoped. With the same voice, one pass per sentence plus pauses and
pace by meaning change the pauses and the pace, but the pitch numbers stay where they were (10.4 against 10.1 semitones).
Once B is fitted into the old windows it measures like A. Which Kokoro voice is used matters more than the direction:
`bm_george` measures 13.8 and `hm_omega` 15.5 semitones, but the recogniser understands both worse.

## Listen to these (the same 20 s of episode 44, 0:30–0:50, same pictures, same ambience / foley / music)

| file | what |
|---|---|
| `A-current.clip.mp4` | today's voice (Kokoro `am_michael`, the accepted mix) |
| `B-kokoro-directed.clip.mp4` | Kokoro `am_michael`, directed, fitted into the old windows |
| `C-chatterbox.clip.mp4` | Chatterbox's default voice, fitted into the old windows |
| `episode44.newvoice.mp4`, `episode44.newvoice-share.mp4` | the whole episode with candidate C (100 MB / 16.6 MB) |

Each clip is 1.7 MB (720 × 1280). The stretch has the turn, the bite, the grief line, both real silences and the start of
the cliffhanger. **Episode 44 has no quoted speech** (all 12 lines are the narrator's), so no clip can show one, and the
quoted-speech ideas were not tested.

Full narration, lines in order with the episode's own gaps, voice only (48 kHz wav):
`A-current.narration.wav`, `B-kokoro-directed.narration.wav`, `C-chatterbox.narration.wav`, and two other Kokoro
narrators with the same direction: `B2-bm_george.narration.wav` (British) and `B3-hm_omega.narration.wav` (Kokoro's Hindi
male voice reading the English phonemes: the nearest thing to an Indian-English voice in the model). B and C are at
their own natural pace in these files; in the clips they are fitted to the old timing.

## The numbers (episode 44, 12 lines, 107 words without the names)

| | A current | B directed | B refitted | B2 bm_george | B3 hm_omega | C Chatterbox |
|---|---|---|---|---|---|---|
| median pitch (Hz) | 116 | 115 | 113 | 143 | 128 | 146 |
| **pitch range per line, mean (semitones, 5–95 %)** | **10.1** | 10.4 | 10.2 | 13.8 | 15.5 | **17.8** |
| flattest / liveliest line (st) | 8.6 / 11.7 | 9.8 / 12.2 | 9.0 / 11.4 | 10.3 / 16.7 | 13.8 / 17.2 | 14.1 / 20.4 |
| pitch standard deviation per line, mean (st) | 3.2 | 3.3 | 3.3 | 4.1 | 4.7 | 5.6 |
| how much the lines differ in range (sd, st) | 0.8 | 0.6 | 0.7 | 1.9 | 1.0 | 1.8 |
| melody sameness between lines (0–1, lower = more varied) | 0.20 | 0.15 | 0.18 | 0.53 | 0.51 | 0.22 |
| pauses ≥ 70 ms inside lines | 25 | 21 | 23 | 23 | 33 | 22 |
| pause median / sd / longest (s) | 0.16 / 0.10 / 0.41 | 0.28 / 0.21 / 0.82 | 0.17 / 0.12 / 0.47 | 0.28 / 0.17 / 0.82 | 0.18 / 0.18 / 0.82 | 0.15 / 0.09 / 0.39 |
| speaking rate, syllables per second of speech | 3.43 | 3.91 | 3.44 | 3.57 | 4.00 | 3.89 |
| rate variation across lines (CV %) | 9.2 | 12.8 | 10.2 | 12.8 | 12.6 | 11.3 |
| energy under 150 Hz (%) | 26.0 | 24.3 | 24.2 | 38.2 | 22.0 | 11.2 |
| 150–500 Hz | 39.7 | 42.5 | 42.7 | 50.1 | 62.1 | 51.8 |
| 500 Hz – 2 kHz | 27.3 | 24.5 | 24.4 | 7.9 | 14.2 | 30.2 |
| 2–5 kHz | 4.4 | 5.2 | 5.2 | 2.4 | 1.4 | 5.2 |
| 5–9 kHz (sibilance) | 2.5 | 3.3 | 3.3 | 1.5 | 0.3 | 1.4 |
| above 9 kHz | 0.19 | 0.24 | 0.24 | 0.03 | 0.05 | 0.16 |
| recogniser word errors without names | 3 (2.8 %) | 3 (2.8 %) | 1 (0.9 %) | 5 (4.7 %) | 8 (7.5 %) | 3 (2.8 %) |

How to read it:

- **Pitch.** Every line of A has almost the same range (8.6 to 11.7 semitones, spread 0.8): that sameness is measurable.
  C has 76 % more range and its lines differ from each other. A wide range can also come from creaky or breathy stretches
  that the pitch tracker reads an octave off; only listening separates the two.
- **Pace.** A speaks 3.4 syllables a second; unhurried human narration is nearer 4 to 5. The cast file says the owner asked
  for this slowness earlier ("slower, lighter"). Kokoro slows down by stretching every sound evenly, which a person does
  not do. B and C at their own pace are near 3.9; fitted into the old windows they are held to A's timing again.
- **Melody sameness** is a rough number (it ranks the two livelier Kokoro voices as the most repetitive). Do not lean on it.
- **Recogniser errors** are mostly the recogniser's own: every candidate, A included, loses "an apsara". `hm_omega` is the
  only real intelligibility worry: a whole line was lost ("Ruru saw her, and loved her" was heard as "Lulu Saha 'i and
  Love Thay").
- **The chain adds no harshness.** The 24 → 48 kHz resampling leaves 0.002 % of the energy above 12 kHz (no images); the
  voice EQ halves the energy under 150 Hz (26 → 13 %) and leaves 5–9 kHz at 2.9 %. A de-esser moved that band by 0.4
  points. De-essing, warmth EQ and room were therefore not put into any candidate (`mixlab.py` has a de-esser and a room
  as options, both off). Kokoro's 24 kHz output has almost nothing above 9 kHz: the voice is dull on top, not harsh.

Recogniser: faster-whisper `base.en` on CPU. Pitch: Praat (parselmouth), autocorrelation, 10 ms step. Per-line detail:
`metrics.json`.

## Names

Chatterbox takes spelling, not IPA, so names are respelt. What the recogniser wrote for each name in the episode lines:

| line | name | A (Kokoro, IPA) | B (Kokoro, IPA) | C written as | C heard |
|---|---|---|---|---|---|
| family | Ruru | Rooru | Rooru | Rooroo | Rauru |
| family | Bhrigu's | Perigu's | Prigu's | Brigoo's | Briku's |
| named | Pramadvara | Premudvara | Premudvara | Pramudvarah | Promudvara |
| loved | Ruru | Voodoo | Voodoo | Rooroo | Roor |
| cliff | Ruru | Ruro | Voodoo | Rooroo | Roharu |

The nine names of the brief in one carrier sentence ("They told the king about X, long ago."), one take each
(`names.json`):

| name | Kokoro from IPA | Chatterbox, plain spelling | Chatterbox, respelt (as written → heard) |
|---|---|---|---|
| Ruru | Rooru | Ruru | Rooroo → Roru |
| Pramadvara | Premudvada | pramavara (the d is lost) | Pruhmudvara → Prumudvara |
| Sthulakesha | Stoolacacia | Stula Kesha | Stoolakaysha → Stula Kaisha |
| Menaka | Manica | Menaka | Maynaka → Meinaka |
| Bhrigu | Prigu | Briegu | Brigoo → Brie Gu |
| Vaishampayana | Vaisham Payana | Vaishampayana | Vy-shum-paayana → Bisham Payana |
| Janamejaya | Junimagia | Jana Mejaya | Junna-may-jaya → Juna Mai Jaya |
| Shakuntala | Shakuntala | Shah Kuntala | Shuh-koon-tala → Shukantala |
| Dushyanta | Dushyanta | Dushanta (the y is lost) | Doosh-yunta → Dush Yunta |

What this shows and what it does not. The recogniser has never seen these names and writes the same Kokoro "Ruru" (fixed
phonemes) three ways, one of them "Voodoo", so it cannot certify a pronunciation. It does show that Chatterbox dropped no
name and turned none into an English word in the episode; that the plain spelling is often as good as a respelling
(Menaka, Vaishampayana, Ruru) and sometimes loses a sound (Pramadvara, Dushyanta); and that Chatterbox's three "Ruru"s
were heard as three different words (Rauru / Roor / Roharu), which may be the recogniser or may be real variation
between takes, which Kokoro's IPA cannot have. Vowel length and stress (pra-MAD-va-raa) cannot be read from these
spellings at all. **Names are Chatterbox's weak point and need a person's ear once per name.**

Two of the 18 name takes began with a stray sound that is not in the text (heard as "B," and "Right?"). None of the 24
episode takes did, but every Chatterbox take must go through the recogniser before it is used.

## Refit: can episodes 41–46 get the new voice without re-rendering?

For episode 44, yes, by a sound-only remix.

Method (`fit.py`): each punctuation group of a new line starts where the same words start in the old voice file, so the
captions already drawn re-synchronise at every pause; a group is sped up or slowed by at most 8 % (pitch kept); nothing is
cut; and each new file is padded to **exactly the old file's sample count**. The timeline is built from the voice file
lengths, so `tools/timeline.mjs` then produces the identical timeline (signature `df579dd26edcdc56`): the score, the mix,
the gate and the soundcheck run unchanged and the pictures stay valid.

| | B Kokoro directed | C Chatterbox |
|---|---|---|
| lines that fit their window | 12 of 12 | 12 of 12 |
| lines that do not fit | 0 | 0 |
| largest tempo change | 7.4 % | 7.4 % |
| words clipped | 0 | 0 |
| real silences (before `snake`, before `lay`) | 1.11 s, 1.21 s, unchanged | 1.11 s, 1.21 s, unchanged |
| caption timing: word start against the old voice, median | 0.04 s | 0.06 s |
| words within 0.10 s / within 0.20 s | 76 % / 94 % | 64 % / 89 % |
| worst word | 0.52 s | 0.50 s |

Caption timing is the recogniser's word start in the new line minus the same word's start in the old line (109 and 104
words compared, `sync.json`). The captions were drawn for the old line, so this is the drift a viewer would see.
Chatterbox speaks faster than the windows were made for, so inside a long group its words run ahead of the captions by
0.3–0.4 s (worst line `play`: "with her friends" comes 0.34–0.38 s early). The one 0.5 s word ("as" in `lay`) is the same
in both candidates and is probably the recogniser misplacing it in the old file. Nobody watched the result: whether a
third of a second shows on the kinetic captions is for the owner to judge on `episode44.newvoice-share.mp4`.

`episode44.newvoice.mp4` is the accepted picture stream, untouched, with the candidate C mix. Checks:

- Audio gate (`tools/gate.mjs --ep 44 --audio`, run in a copy of the tree with the new voice files in place of the old):
  **passed**. Two silences ≥ 0.6 s at −45 dB (longest 1.12 s), LRA 5.5 LU, music 13 dB under the voice, true peak
  −2.23 dBTP, Next 10.3 dB under the body.
- `tools/mix.py` itself, run in that copy, wrote a mix byte-identical to the lab's: −14.1 LUFS, −2.23 dBTP.
- On the mp4 (ffmpeg ebur128): −14.1 LUFS, LRA 5.5 LU, peak −2.1 dBFS (the accepted episode: −14.1, 5.1, −2.2). The share
  copy: −14.2 LUFS, 16.6 MB; its picture is the existing CRF 23 share stream, copied, not encoded again.
- `tools/soundcheck.py` (`episode44.newvoice.soundcheck.json` and `-spectrogram.png`): no sample at full scale, peak
  −2.51 dBFS, 2.12 s under −50 dB, all as in the accepted episode; energy above 6 kHz 0.96 % (accepted: 2.74 %), so the
  new voice is darker on top. Its foley and picture lines are those of the accepted episode: the stems were not touched.

Not done: episodes 41, 42, 43, 45 and 46. They have 3 to 5 quoted lines each (Puloman, Bhrigu, Agni, Ruru, the
messenger …), which this trial did not voice with Chatterbox. The fit works line by line and should behave the same, but
that is not proven for them.

## Cost to roll out

Measured here at low priority beside two video renders (4 cores, no GPU):

| | seconds |
|---|---|
| Chatterbox: load the model | 137–167 |
| Chatterbox: one take of one line | 57 on average (17 s of compute per second of speech) |
| **Chatterbox: one episode, 12 lines, 2 takes each** | **about 1,500 (25 minutes)**; with 1 take each about 14 minutes |
| Kokoro directed: one episode | 61 (about 200 when fitting to old windows) |
| fit + mix + mux of an episode | under 60; no picture is rendered |

Memory: Chatterbox peaked at 2.0 GB, Kokoro at 0.8 GB. Disk: 1.5 GB of model files, in `venv/models/` (git-ignored).
Six episodes (41–46): about 2.5 hours of this machine for the narrator's lines.

Two takes a line were made and one chosen by the recogniser, then by length (`cb_select.py`). On `left` the first take was
heard with 5 wrong words and the second with 3; on `play` 2 and 0. One take a line is not enough.

`voice.patch` (not applied; `git apply --check` passes against the current `tools/voice.py`) adds four options, all
opt-in, so nothing changes for the agents voicing episodes now:

- `--directed`: one pass per line, pauses found in the audio and set by punctuation, pace by meaning from fields the
  scripts already have, blended cast voices (`am_michael:0.6+bm_george:0.4`);
- `--fit`: the drop-in refit described above (the old sidecar's chunks are kept, the new times go under `refit`);
- `--out DIR`: write somewhere other than `voice/epNN/<lang>/`;
- `--engine chatterbox --cb lab/voicelab --takes N`: the narrator's lines by Chatterbox through `cb.py`, names from a
  `RESPELL` table; other speakers stay with Kokoro.

How far the patched tool was tested (in a copy of the tree, never in `tools/`):

- `--directed --fit`, Kokoro, all of episode 44: 11 of 12 files came out at exactly the old length. `left` was 0.31 s
  over, because the tool starts from the cast's speed 0.81 where the lab started from 0.86. A retry loop (a little
  quicker, up to +8 %) was added for that. Rerun on `left` with the loop: exactly the old length (133,773 samples), tempo change 7.4 %.
- `--engine chatterbox`: one line (`bit`, 1 take) through the patched tool: exactly the old length (57,156 samples), tempo change 7.4 %; 2 min 42 s in all, most of it loading. Not run on a whole episode through the patched tool (the lab scripts did that).

The patch does not include the take selection by recogniser (that is `cb_select.py`, which needs faster-whisper); it keeps
the take nearest the wanted length. Chatterbox needs the `tokenizers` package, which the pipeline's Python does not have:
run that path with `lab/voicelab/venv/bin/python`.

## Before rolling out

1. **The owner listens** to the three clips and says whether C is better, and whether a new narrator voice is acceptable
   at all: C is not `am_michael`. The narrator would change from episode 47 on, or from 41 by remix.
2. **Names by ear, once each**, with the chosen spelling frozen in `RESPELL`. Until then a Chatterbox name line is a risk.

Open questions if C is chosen: the characters would still be Kokoro, and a livelier narrator next to them may make them
sound worse by contrast; and for new episodes the timeline would be built from Chatterbox's own faster pace, which
removes the caption drift but makes a 12-line episode roughly 10 % shorter unless lines are added.

## Licences (read from the Hugging Face model cards)

| model | licence | used for |
|---|---|---|
| ResembleAI/chatterbox | MIT | the model behind candidate C |
| onnx-community/chatterbox-ONNX | MIT | the files actually run (its ONNX export; the language model in its 4-bit file) |
| Kokoro-82M (onnx-community/Kokoro-82M-v1.0-ONNX) | Apache-2.0 | A and B, as before |
| faster-whisper `base.en` (OpenAI Whisper weights) | MIT | measuring only; in no output |

No voice was cloned. Candidate C uses the model's own `default_voice.wav`. NeuTTS Air, Parler-TTS and Sesame CSM were not
tried, because Chatterbox worked. XTTS-v2, F5-TTS and Fish were not used.

## What was not checked

- Nothing was heard. Naturalness, warmth, accent, whether C's default voice suits an Indian epic, whether it is taken for
  a man's or a woman's voice (median pitch 146 Hz), whether the fitted lines sound stretched: all unknown.
- Chatterbox ran from the ONNX export with a 4-bit language model and without classifier-free guidance (the export has
  none). The full-precision PyTorch model may sound better or pace differently; it did not fit the free disk.
- The ONNX route does not add Resemble's inaudible watermark, which the PyTorch package adds by default.
- Quoted speech: episode 44 has none. A different voice or pitch for quotes and a breath before them were not tested.
- Blended Kokoro voices are implemented (`lib.style`, the patch) but not measured; that trial was stopped to keep memory
  down when the coordinator warned about it.
- Only episode 44 was refitted, with one small recogniser.
- A Chatterbox narrator given a Kokoro `am_michael` clip as its reference (to keep today's voice identity): made for five lines only (`snake` to `cliff`, one take each, `C2-chatterbox-kokoro-ref.5lines.wav`, voice only). On those lines: median pitch 126 Hz (A 116, C 158), range 12.6 semitones (A 9.7, C 17.5), no recogniser error, but 4.65 syllables a second, faster still. So it keeps more of today's voice and less of the liveliness. Not fitted, not mixed, not compared by ear.

## One thing that went wrong

To run the audio gate on the new voice without touching the pipeline's files, I made a copy of the tree with symlinks.
Its `build` was a symlink to the real `build/`, and `tools/gate.mjs` rewrites the timeline file. At about 04:22 UTC the
real `build/timeline.ep44.en.json` was overwritten with a wrong timeline (37 s, built with no voice files), and about a
minute later with the right one again. It is byte-identical to the committed file now (`git diff` is empty, signature
`df579dd26edcdc56`). Anything that read episode 44's timeline in that minute read a wrong one. The copy has had its own
`build/` since.

## Files

```
lab/voicelab/
  REPORT.md  voice.patch  metrics.json  sync.json  names.json
  A-current.clip.mp4  B-kokoro-directed.clip.mp4  C-chatterbox.clip.mp4
  A-current.narration.wav  B-kokoro-directed.narration.wav  C-chatterbox.narration.wav
  B2-bm_george.narration.wav  B3-hm_omega.narration.wav  C2-chatterbox-kokoro-ref.5lines.wav
  episode44.newvoice.mp4  episode44.newvoice-share.mp4  episode44.newvoice.soundcheck.json  …-spectrogram.png
  cb.py        Chatterbox through ONNX (candidate C)           cb_select.py  one take per line, by the recogniser
  kd.py        Kokoro, directed (candidate B)                  fit.py        fit lines into an existing timeline; narration wavs
  mixlab.py    tools/mix.py's chain on a lab voice directory   measure.py, asr_extra.py   the numbers
  lib.py       shared helpers
  cand/        per candidate: lines/ (natural pace), fit/ (fitted, drop-in length)
  work/        logs, takes, the copy of the tree used for the gate (work/shadow)
  venv/        the lab's virtualenv and the model files (git-ignored)
```
