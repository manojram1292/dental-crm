# Mahabharatam — As Vyasa Told It

Vertical YouTube Shorts (1080×1920, 30 fps). Every frame and every sound is generated from code: Canvas 2D in headless Chromium, and numpy/scipy synthesis. The narration is Kokoro-82M text-to-speech; nothing else is AI-generated. The look is an old temple mural come alive: flat painted shapes, plaster texture, shadow-puppet (tholu bommalata) silhouettes, and fire as the light source. The text follows the Critical Edition (BORI) of the Adi Parva.

| Episode | Title | Source | Output |
|---|---|---|---|
| 1 | The Storyteller Arrives | Adi Parva 1 | `episode01.mp4` (+ `episode01-share.mp4`), 36.2 s |
| 2 | The Field of Five Lakes | Adi Parva 2 (Samantapanchaka) | `episode02.mp4` (+ `episode02-share.mp4`), 44.6 s |
| 3 | Eighteen Armies | Adi Parva 2 (the akshauhini) | `episode03.mp4` (+ `episode03-share.mp4`), 50.7 s |

The characters are fixed in a **character bible**: see `CHARACTERS.md` and `CHARACTERS.png`.

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

The share copy is made with `ffmpeg -i episodeNN.mp4 -c:v libx264 -crf 23 -preset slow -c:a aac -b:a 160k episodeNN-share.mp4`.

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
| `army.js` | The four arms of the army as mural puppets: `KIT.army.draw(ctx, 'chariot' \| 'elephant' \| 'horse' \| 'soldier', o)` (chariot with two horses and a banner, elephant with howdah, horse with rider and lance, foot soldier with spear and shield), plus the patti tile and its mip-mapped pattern for massed armies |

Episode-specific helpers live with their scenes. For example, `src/scenes/ep02/_common.js` holds the storm, the lakes, crowns, lotuses and the field seen from above (`EP2.mandala`). Episode 3 reuses it: in `src/episodes.js`, an entry with a slash (`'ep02/_common'`) loads another episode's file. `src/scenes/ep03/_common.js` holds the multiplying patti grid, the gold counters and the marching friezes.

`lab/model-sheet.html` is the character model sheet. Open it over HTTP to view it, or render it with `tools/modelsheet.mjs`.

The engine (`src/engine.js`, `src/runtime.js`) and the tools are forked from `../ribhu-film`. Fonts are Cinzel and EB Garamond, under the SIL Open Font License (see `fonts/`).

Episode 1 is unchanged in story. Its voice was regenerated with the slower, lighter settings, so its timeline re-flowed and its music was re-scored to match. Its scenes now draw through the character modules. Sauti matches the old frames closely. The circle's sages now carry their per-index variations, so a re-render of episode 1 shows them less uniform than the existing `episode01.mp4`.
