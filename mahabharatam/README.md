# Mahabharatam — As Vyasa Told It · Episode 1: The Storyteller Arrives

A vertical YouTube Short (1080×1920, 30 fps, about 30 s). Every frame and every sound is generated from code: Canvas 2D in headless Chromium, numpy/scipy synthesis. There is no AI image, video or voice generation. The look is an old temple mural come alive: flat painted shapes, plaster texture, shadow-puppet (tholu bommalata) silhouettes, and the sacred fire as the light source in every shot. The text follows the Critical Edition, Adi Parva, chapter 1.

**Output files:** `episode01.mp4` (H.264 + AAC, 8-sample motion blur) and `episode01-share.mp4` (a lighter copy).

## How it is built (dubbing-ready)

```
script/<lang>.json          ← the ONLY source of words: lines {id, text, est, beats?, emphasis?, display?, hold?} + strings (titles, end card)
voice/<lang>/<id>.wav       ← optional narration, one file per line id
   │  node tools/timeline.mjs --lang <lang>
   ▼
build/timeline.<lang>.json  ← per-line start/end, speech window, per-word times, beat times
   ├─► pictures   src/scenes/*.js (one scene per line id; animated in time normalised to the line)
   ├─► captions   src/kit/captions.js (word-by-word, inside the Shorts safe zone)
   ├─► music      python3 tools/score.py --lang <lang>  → audio/music.wav (≈ −22 LUFS bed, cues placed from the timeline)
   └─► mix        python3 tools/mix.py --lang <lang>    → audio/mix.<lang>.wav (music + voice; music ducked −8 dB under voice)
node tools/render.mjs --lang <lang>   runs all of the above and writes episode01[.<lang>].mp4
```

Each line's duration works like this:
- If `voice/<lang>/<id>.wav` exists, the duration is `voiceLead + voice duration + voiceGap + hold`, and the voice starts at `start + voiceLead`.
- If there is no voice file, the duration is `est`.

The end card then holds for `timing.tail` seconds.

`beats` are **word indices**. The tool turns them into times inside each line's speech, and the picture and the drums land on them: the hook's three flashes on the three "Before"s, the gold name, the vision in the smoke, and the title bloom. A translator moves these indices to the matching words.

## Add a language (example: Tamil)

1. `cp script/en.json script/ta.json`. Translate every `text` and every `strings` value. Re-point `beats` to the matching word indices (0-based, words split on spaces), and update `emphasis` (the words shown in gold). Leave the `id`s unchanged.
2. Set `fonts` to a family that has the script's glyphs, for example `"caption": "'Noto Serif Tamil'"`. Add its woff2 file to `fonts/` and an `@font-face` rule to `fonts/fonts.css`.
3. Record or generate one WAV per line: `voice/ta/before.wav`, `voice/ta/forest.wav`, … Any sample rate works, mono or stereo, as PCM 16/24/32-bit or float. Trim the silence at the head and tail.
4. Run `node tools/render.mjs --lang ta`. This writes `episode01.ta.mp4`. To preview first, run `node tools/preview.mjs sheet --lang ta`, or open `index.html?lang=ta` over HTTP after running `node tools/timeline.mjs --lang ta`.

To add the English voice, put `voice/en/<id>.wav` in place and run `node tools/render.mjs`.

## Tools

```bash
pip install numpy scipy pillow imageio-ffmpeg     # ffmpeg comes from imageio-ffmpeg
npm i playwright                                    # or link an existing install
node tools/timeline.mjs [--lang en]                 # build the timeline
node tools/preview.mjs sheet --from 8 --to 13       # contact sheet (also: strip, frames, bench, purity, clip)
node tools/preview.mjs purity --from 0 --to 30      # draw() must be a pure function of time
node tools/render.mjs [--lang en] [--mb 8]          # final render
```

## Reusable kit (`src/kit/`, for later episodes)

| File | What it provides |
|------|------------------|
| `core.js` | Fire flicker, glow sprites, rim-lit silhouettes, gold lettering, ornaments, embers, fireflies |
| `fire.js` | The painted sacred fire, its light pool, and the stepped homa-kunda altar |
| `figures.js` | The storyteller (walk cycle, staff, kamandalu, shawl) and seated sages (head turns), with gold cloth borders |
| `forest.js` | Mural trees and a fly-through forest |
| `smoke.js` | Rising smoke |
| `ashram.js` | The Naimisha clearing, with sky day/night cycling and star trails around Dhruva |
| `manuscript.js` | Palm-leaf pages |
| `captions.js` | Captions |
| `endcard.js` | The series end card |

The engine (`src/engine.js`, `src/runtime.js`) and the tools are forked from `../ribhu-film`.

Fonts are Cinzel and EB Garamond, under the SIL Open Font License (see `fonts/`).
