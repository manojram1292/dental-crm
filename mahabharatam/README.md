# Mahabharatam — As Vyasa Told It

Vertical YouTube Shorts (1080×1920, 30 fps). Every frame and every sound is generated from code: Canvas 2D in headless Chromium, and numpy/scipy synthesis. The narration is Kokoro-82M text-to-speech; nothing else is AI-generated. The look is an old temple mural come alive: flat painted shapes, plaster texture, shadow-puppet (tholu bommalata) silhouettes, and fire as the light source. The text follows the Critical Edition (BORI) of the Adi Parva.

| Episode | Title | Source | Output |
|---|---|---|---|
| 1 | The Storyteller Arrives | Adi Parva 1 | `episode01.mp4` (+ `episode01-share.mp4`), 44.8 s |
| 2 | The Field of Five Lakes | Adi Parva 2 (Samantapanchaka) | `episode02.mp4` (+ `episode02-share.mp4`), 49.6 s |
| 3 | Eighteen Armies | Adi Parva 2 (the akshauhini) | `episode03.mp4` (+ `episode03-share.mp4`), 56.4 s |
| 4 | The Story Is Born | Adi Parva 1 (Vyasa, Vaishampayana); Ganesha as scribe from later tradition, marked on screen | `episode04.mp4` (+ `episode04-share.mp4`), 51.9 s |
| 5 | The Curse of Sarama | Adi Parva 3 (Paushya parva: Janamejaya's sacrifice at Kurukshetra, Sarama's curse) | `episode05.mp4` (+ `episode05-share.mp4`), 51.9 s |
| 6 | The Stolen Earrings | Adi Parva 3 (Paushya parva: Uttanka, the queen's earrings, Takshaka, the Naga world) | `episode06.mp4` (+ `episode06-share.mp4`), 50.1 s |
| 7 | The Seven-Day Curse | Adi Parva 36–40 (Astika parva: Parikshit, the silent sage Shamika, Shringin's curse, the palace on one pillar, Takshaka in the fruit) | `episode07.mp4` (+ `episode07-share.mp4`), 58.0 s |
| 8 | The Snake Sacrifice | Adi Parva 47–48 (Janamejaya's vow, the builder's warning, the priests in black, the serpents fall, Takshaka flees to Indra) | `episode08.mp4` (+ `episode08-share.mp4`), 56.0 s |
| 9 | Two Wives, Two Wishes | Adi Parva 14 (Kashyapa's boons to Kadru and Vinata; a thousand eggs and two; five hundred years) | `episode09.mp4` (+ `episode09-share.mp4`), 56.2 s |
| 10 | The Broken Egg | Adi Parva 14 (Vinata breaks an egg; Aruna's curse; the charioteer of the Sun) | `episode10.mp4` (+ `episode10-share.mp4`), 54.3 s |
| 11 | The Horse from the Ocean | Adi Parva 15 (the sisters see Uchchaihshravas; Meru; Narayana's counsel to churn) | `episode11.mp4` (+ `episode11-share.mp4`), 56.1 s |
| 12 | A Mountain for a Churning Stick | Adi Parva 16 (Ananta uproots Mandara; the Ocean's share; Akupara the tortoise king; Vasuki the rope) | `episode12.mp4` (+ `episode12-share.mp4`), 56.4 s |
| 13 | What Rose from the Ocean | Adi Parva 16 (fire, Indra's rain, milk and ghee; the Moon, Shri, Sura Devi, the horse, the Kaustubha, Dhanvantari); the cliffhanger's poison tagged | `episode13.mp4` (+ `episode13-share.mp4`), 57.4 s |
| 14 | The Blue Throat | **As tradition tells it** (the kalakuta and Nilakantha are in the Southern/vulgate Adi 16, not the CE text); tagged on screen throughout | `episode14.mp4` (+ `episode14-share.mp4`), 54.3 s |
| 15 | The Enchantress and Rahu | Adi Parva 16–17 (Narayana's illusion; Rahu; the Sun and the Moon; the discus; the eclipse) | `episode15.mp4` (+ `episode15-share.mp4`), 57.6 s |
| 16 | The War for the Amrita | Adi Parva 17 (the battle on the shore; Sudarshana; Nara; Mandara set back); returns to the sisters | `episode16.mp4` (+ `episode16-share.mp4`), 55.9 s |
| 17 | The Wager | Adi Parva 18 (the wager; Kadru's order and curse; Brahma lets it stand; Kashyapa's cure) | `episode17.mp4` (+ `episode17-share.mp4`), 54.6 s |
| 18 | The Black Hairs | Adi Parva 19–20 (the flight over the ocean; the black tail; Vinata enslaved) | `episode18.mp4` (+ `episode18-share.mp4`), 54.2 s |
| 19 | Garuda Is Born | Adi Parva 20 (Garuda hatches blazing; the gods run to Agni; the praise; his mother a slave) | `episode19.mp4` (+ `episode19-share.mp4`), 55.8 s |
| 20 | Carrying the Serpents | Adi Parva 21–23 (to Ramaniyaka; the Sun's heat; Kadru's prayer and Indra's rain; the serpents' orders) | `episode20.mp4` (+ `episode20-share.mp4`), 56.0 s |

## Continuity: one structure for every episode

1. **RECAP** (≈ 3–4 s; not in episode 1). Line id `recap`, spoken by the narrator. `KIT.series.recapScene`
   shows the "Previously" strip and the last episode's key image as a sepia memory in a temple niche;
   `series_recap_sting` in `tools/score.py` plays under it.
2. **HOOK**: one clear question (`role: "hook"`). Sauti and the Naimisha sages by the fire are the anchor
   framing: every episode opens or returns there. The episode title (`KIT.series.episodeTitle`) is set
   in the hook line's tail (`post`).
3. **STORY**: a complete mini-arc.
4. **NEXT**: a cliffhanger line, then line `next` ("Next: <title>", `caption: false`) over the teaser card
   (`KIT.series.nextScene`: NEXT, a niche opening on a glimpse of the next episode's key image, its
   number and title) with `series_next_sting`.

Card words come from the script's `strings` (`previouslyLabel`, `prevEpisodeLabel`, `prevEpisodeTitle`,
`nextLabel`, `nextEpisodeLabel`, `nextTitle`, `traditionNote`), so dubbing changes only the script.
The API is documented at the top of `src/kit/series.js`.

The characters are fixed in a **character bible**: see `CHARACTERS.md` and `CHARACTERS.png`.

## From episode 11: the cold-open grammar (research/engagement.md)

Episodes 11–20 reorder the four beats for viewers who arrive cold: **HOOK first** (the episode's strongest
image already moving in frame 1, the question as big text from frame 1 with `KIT.series.hookCard`, the
caption off for that line, the Naimisha fire licking up from the bottom edge with `KIT.series.fireEdge`),
then the **title** in the hook's post (≥ 1 s, only after the hook text has gone), then a short **RECAP**
(2.5–3.5 s), the **STORY** (with a brief cut to Sauti at the fire, a different angle each episode, and a
turn at 40–60 %: direct speech or a reveal after a 200–400 ms rest with a bell or drum), the cliffhanger
image and line, and a **silent ≈ 1.7 s Next card** (`KIT.series.loopNextScene`: script line with
`"voice": false` and an `est`) that dissolves back into frame 1, so the episode loops. `tools/voice.py`
skips `"voice": false` lines. Earlier episodes are unchanged (the kit additions are new functions).

New modules (see `CHARACTERS.md`): `uchchaihshravas.js` (`horse`), `vishnu.js`, `brahma.js`,
`devas-asuras.js` (`deva`, `asura`: six variants each), `naga-kings.js` (`vasuki`, `ananta`, `naga`),
`mandara.js`, `akupara.js` (`akupara`, `samudra`), `ocean-treasures.js` (`chandra`, `lakshmi`, `sura`,
`dhanvantari`), `shiva.js`, `enchantress.js`, `rahu.js`, `nara.js`, `garuda.js`, `agni.js`. Locations:
`src/scenes/ep11/_common.js` … `ep20/_common.js` (Meru, the cosmic ocean, solid vision medallions
`EP11.roundel`, name plaques `EP11.plaque`; the churning rig `EP12.churn`; the white sea `EP13.whiteSea`;
the darkened world `EP14`; the violet dusk and the deep sky `EP15`; the night battle `EP16`; the sunset
shore, the serpents' grove and the ocean `EP17`, with flying figures `EP17.flyer`; Ramaniyaka `EP20`).
Score cues: `build_ep11` … `build_ep20` in `tools/score.py`. Each episode's review is in `REVIEW_LOG.md`.
The model sheet now clips every cell (Surya's disc no longer overflows) and rows may set their own scale.

## How it is built (dubbing-ready, per episode)

```
script/epNN.<lang>.json     ← the ONLY source of words: lines {id, speaker?, text, say?, est, beats?, ticks?, pre?, post?,
                               emphasis?, display?, hold?} + strings (titles, end card)
script/cast.json            ← who speaks how: speaker → Kokoro voice, speed, pitch (the bible's voices)
voice/epNN/<lang>/<id>.wav  ← narration/dialogue, one file per line id (+ <id>.json: chunk times, from tools/voice.py)
   │  node tools/timeline.mjs --ep N --lang <lang>
   ▼
build/timeline.epNN.<lang>.json  ← per-line start/end, speech window, per-word times, beat times, tick times
   ├─► pictures   src/scenes/epNN/*.js (one scene per line id; listed in src/episodes.js)
   ├─► captions   src/kit/captions.js (word-by-word, inside the Shorts safe zone)
   ├─► music      python3 tools/score.py --ep N   → audio/epNN/music.wav (≈ −22 LUFS bed; one cue sheet per episode)
   └─► mix        python3 tools/mix.py --ep N     → audio/epNN/mix.<lang>.wav (voice −16 LUFS, music ducked −8 dB)
node tools/render.mjs --ep N [--lang <lang>]   runs all of the above and writes episodeNN[.<lang>].mp4
```

`index.html?ep=2&lang=en` plays an episode live (served over HTTP, after `node tools/timeline.mjs --ep 2`). `src/episodes.js` loads that episode's scene files. The kit (`src/kit/`) and the characters are shared by every episode.

Each line's duration works like this:
- If `voice/epNN/<lang>/<id>.wav` exists, the duration is `pre + voice + post + hold`. `pre` and `post` are in ms; they default to `timing.voiceLead` and `timing.voiceGap`. The voice starts at `start + pre`.
- If there is no voice file, the duration is `est`.

The end card then holds for `timing.tail` seconds.

- `beats` are **word indices**. The timeline turns them into times in the speech, and the pictures and drums land on them.
- `ticks: {count, from, to, curve}` spreads `count` hits between two words, accelerating when `curve < 1`. `to: "end"` runs them to the line's end (minus `endPad` s, default 0.5), through its `post` and `hold`. In episode 2, the 21 crowns, the tally marks and the drums all read `line.ticks`; in episode 3, the 18 army blocks and the 18 days do.
- When `tools/voice.py` has written a chunk sidecar (`<id>.json`), caption words are placed inside the chunk they were spoken in. Pauses therefore line up exactly.

## Voices and modulation (`tools/voice.py`)

```bash
python3 -I tools/voice.py --model <kokoro dir> --ep 2 [--lang en] [--only ask,answer] [--dry]
```

- `speaker` (the default is `narrator`) → `script/cast.json`: `{voice, speed, pitch (semitones), g2p}`. Narrator: am_michael at 0.81× (episode 1's voice). Sauti: bm_fable at 0.83×. The elder sage: bm_lewis at 0.77×, unshifted. These are about 10 % slower than the first cut (0.9 / 0.92 / 0.8 and −0.5 st). Because Kokoro's speed is not linear, the speech runs about 12–15 % longer.
- Per line, `speed` multiplies the speaker's speed.
- `say` (which defaults to `text`) is what gets spoken, with inline marks:
  - `…` pauses 420 ms.
  - `—` pauses 280 ms.
  - `,` `;` `:` split the line there and add 80 ms (on top of the chunk's own breath).
  - `.` `?` `!` in mid-line add 250 ms.
  - `[p:400]` pauses 400 ms. Right after punctuation it replaces that pause (the longer wins).
  - `{s:0.85}` speaks what follows at 0.85× (`{s}` resets).

  The line is synthesised in chunks and joined with exact silences.
- `pitch` is applied by synthesising at `speed / f` and resampling by `f = 2^(st/12)`, so the tempo stays where the cast sets it.
- Each line is levelled to −21 dBFS active RMS.
- Sanskrit names, and a few English words that espeak gets wrong, are spoken from the IPA in `NAMES`. An entry is one string, or `{en-us, en-gb}` when the American and British voices need different vowels. The conventions are:
  - short a → ʌ/ə
  - ā → ɑː
  - aspirated bh → bʰ
  - r between vowels → the tap ɾ
  - ṇ → ɳ
  - ś/ṣ → ʃ
  - c → ʧ
- A segment-final article "a" before a name is spoken weak. espeak would otherwise read it as the letter A.
- `tools/mix.py` lightens the voice stem before levelling it. It applies a 90 Hz high-pass, a −4 dB low shelf at 170 Hz and a −1.5 dB shelf at 7.5 kHz. There is no compressor.
- `--dry` prints the chunks and phonemes without synthesising.

## Add a language (example: Tamil)

1. Copy each `script/epNN.en.json` to `script/epNN.ta.json`.
2. Translate every `text` (and `say`) and every `strings` value. Re-point `beats` and `ticks` to the matching word indices (0-based, words split on spaces). Update `emphasis`. Leave the `id`s unchanged.
3. Set `fonts` to a family that has the script's glyphs. Add its woff2 file to `fonts/` and an `@font-face` rule to `fonts/fonts.css`.
4. Record or generate `voice/epNN/ta/<id>.wav`. Any sample rate works, mono or stereo, as PCM 16/24/32-bit or float. Trim the silence at the head and tail.
5. Run `node tools/render.mjs --ep N --lang ta`. This writes `episodeNN.ta.mp4`.

## Tools

```bash
pip install numpy scipy pillow imageio-ffmpeg soundfile kokoro-onnx   # ffmpeg comes from imageio-ffmpeg
npm i playwright                                                      # or link an existing install
node tools/timeline.mjs --ep 2                       # build the timeline
node tools/preview.mjs sheet --ep 2 --from 8 --to 13 # contact sheet (also: strip, frames, bench, purity, clip)
node tools/preview.mjs purity --ep 2                 # draw() must be a pure function of time
node tools/render.mjs --ep 2 [--mb 8]                # final render → episode02.mp4
node tools/modelsheet.mjs                            # lab/model-sheet.html → CHARACTERS.png
node tools/modelsheet.mjs --solo parashurama --out x.png   # one character, large, in every pose
```

The share copy is made with `ffmpeg -i episodeNN.mp4 -c:v libx264 -crf 23 -preset slow -c:a aac -b:a 160k episodeNN-share.mp4`. If that comes out over 20 MB (episode 8's fire and falling serpents did: 22 MB), cap it: add `-maxrate 2500k -bufsize 5000k` (episode 8's share copy is made that way, 16 MB).

## Reusable kit (`src/kit/`)

| File | What it provides |
|------|------------------|
| `core.js` | Fire flicker, glow sprites, rim-lit silhouettes, gold lettering, ornaments, embers, fireflies |
| `fire.js` | The painted sacred fire, its light pool, and the stepped homa-kunda altar |
| `characters/rig.js` | The character system: the shared rig (limbs, IK, hands, the profile skeleton and its pose library) and the renderer that applies each character's signature lighting rule |
| `characters/*.js` | One module per character, each with a single `draw(ctx, opts)`: Sauti, the elder sage, the generic sages, Parashurama, the Pitrs, Vyasa and Janamejaya (see `CHARACTERS.md`) |
| `forest.js` | Mural trees and a fly-through forest |
| `smoke.js` | Rising smoke |
| `ashram.js` | The Naimisha clearing, with sky day/night cycling and star trails, its sages (`hide` frees places for other characters) |
| `manuscript.js` | Palm-leaf pages |
| `captions.js` | Captions |
| `endcard.js` | The series end card |
| `series.js` | The continuity grammar every episode follows (RECAP → HOOK → STORY → NEXT): `KIT.series.recapStrip` ("Previously…" strip + the last episode as a sepia memory in a temple niche), `episodeTitle` (the title lockup after the hook), `nextTeaser` (the "Next" card with a glimpse of the next episode), `traditionTag` ("As tradition tells it"), and `recapScene` / `nextScene` to register the standard scenes. All words come from script `strings` (API at the top of the file). Score: `series_recap_sting` / `series_next_sting` in `tools/score.py`. |
| `army.js` | The four arms of the army as mural puppets: `KIT.army.draw(ctx, 'chariot' \| 'elephant' \| 'horse' \| 'soldier', o)` (chariot with two horses and a banner, elephant with howdah, horse with rider and lance, foot soldier with spear and shield), plus the patti tile and its mip-mapped pattern for massed armies |

Episode-specific helpers live with their scenes. For example, `src/scenes/ep02/_common.js` holds the storm, the lakes, crowns, lotuses and the field seen from above (`EP2.mandala`). Episode 3 reuses it: in `src/episodes.js`, an entry with a slash (`'ep02/_common'`) loads another episode's file. `src/scenes/ep03/_common.js` holds the multiplying patti grid, the gold counters and the marching friezes.

`lab/model-sheet.html` is the character model sheet. Open it over HTTP to view it, or render it with `tools/modelsheet.mjs`.

The engine (`src/engine.js`, `src/runtime.js`) and the tools are forked from `../ribhu-film`. Fonts are Cinzel and EB Garamond, under the SIL Open Font License (see `fonts/`).

Episodes 1–3 were re-cut to the continuity structure above (episode 1 has no recap: its hook is "Where did the greatest story ever told begin?"). Episode 3's seven ×3 steps now sit on the `multiply` line's `ticks` (slow first, quicker later) with a row of ×3…×10 badges that light as each step happens; `tools/score.py`'s `ep3_steps` reads the same ticks. Episode 4 adds Ganesha (`ganesha.js`) and Vaishampayana (`vaishampayana.js`), and a new location with its own light: Vyasa's hermitage in the Himalayan foothills at morning (`src/scenes/ep04/_common.js`).
Episodes 7–10 (the Astika parva; the series bible is `SERIES.md` and `catalog/series.json`) add Parikshit (`parikshit.js`), Shamika (`shamika.js`), Shringin (`shringin.js`), the priests of the snake sacrifice (`priests.js`, four fixed designs by `index`), the builder (`sthapati.js`), Indra (`indra.js`), Kadru and Vinata (`kadru.js`, `vinata.js`, on `CH.female`), Kashyapa (`kashyapa.js`), Aruna (`aruna.js`) and Surya (`surya.js`). Their locations, each with its own light, are in `src/scenes/ep07/_common.js` (the forest at noon, Shamika's cow-pen hermitage, the red river, the palace on one pillar and its interior, the venom-fire), `ep08/_common.js` (the snake sacrifice, Indra's heaven, painted serpents of every colour, `EP8.fallers`), `ep09/_common.js` (Kashyapa's hermitage before sunrise, eggs, steaming jars, a thousand hoods) and `ep10/_common.js` (the open sky at dawn, the Sun's chariot, the shore and the white horse). Score cues: `build_ep7` … `build_ep10` in `tools/score.py`. Captions can now be lifted per line with `"captionY": <px> | "high"` (default unchanged), so they never cover low action. The lean transform in `vyasa.js`, `janamejaya.js` and `parashurama.js` now rotates about the hip (`translate(0, PIV) · rotate · translate(0, −PIV)`, as in `ganesha.js`); episode 6's Next card now names episode 7, "The Seven-Day Curse", with a glimpse of the palace on one pillar.
Episodes 5–6 add Sarama and her son (`sarama.js` with the shared dog rig `CH.canine`, `pup.js`), Janamejaya's brothers (`kuru-princes.js`, three fixed variants by `index`), Uttanka (`uttanka.js`), King Paushya's queen (`paushya-queen.js`, with the shared female figure `CH.female` and the earrings prop `KIT.kundala`), the teacher's wife (`guru-patni.js`) and Takshaka (`takshaka.js`: naga form and a shimmering beggar's disguise). Their locations, each with its own light, are in `src/scenes/ep05/_common.js` (Kurukshetra by day, Sarama's ridge at dawn, Hastinapura at night, a dusk road) and `src/scenes/ep06/_common.js` (the hermitage at morning, Paushya's palace in gold, the road and the cleft, the Naga world, Janamejaya's court); episode 6 loads `ep05/_common` for its recap. Their score cues are `build_ep5` / `build_ep6` in `tools/score.py` (ominous low drums for the curse; `naga_shimmer` for the serpent world). The new speakers' voices (af_heart, bf_emma, am_puck) come from the same Kokoro release (`voices/<id>.bin`).
