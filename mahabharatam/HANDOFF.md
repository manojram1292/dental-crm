# HANDOFF: "Mahabharatam — As Vyasa Told It"

Written 2026-11-21 for a new Claude Code session on the owner's Mac. Read this file, then `LESSONS.md`, then `ASSETS.md`.
Everything the cloud sessions knew is in these three files plus the repository. Do not ask the owner again for anything answered here.

Repository: `manojram1292/dental-crm` (the series lives in the `mahabharatam/` folder; the rest of the repo is an unrelated
dental-CRM project; leave it alone). Branch with all work: `handoff` (same content as `claude/motion-graphics-showreel-v8vvuo`).

---

## 1. What this is, and the goal

A series of vertical short films that retell the Mahabharata faithfully, for **YouTube Shorts** and **Instagram Reels** (Facebook
Reels by cross-post; TikTok later, diaspora only because TikTok is banned in India).

- **Format:** 1080×1920, 30 fps, English. Episodes 54–58 s (hard max 59 s). Trailer 89.4 s; teaser ≤ 65 s.
- **Picture:** drawn entirely in code (Canvas 2D in headless Chromium; Three.js for the 3D war layer). Main look: an old temple
  mural come alive (flat painted shapes, plaster texture, fire as the light source). Second approved look: **red paper-cut
  (Indian sanjhi)**. No stock footage, no AI-generated images in the films so far.
- **Fidelity:** the BORI **Critical Edition** (CE) of the Mahabharata. Later-tradition material is left out or tagged on screen
  "As tradition tells it". The promise on screen: **"Nothing added for effect."** Never claim "verse by verse", "every verse" or
  "complete": the series condenses.
- **Goal:** build a channel (`@AsVyasaToldIt` suggested, not yet claimed) that tells the whole epic in order, episode by episode,
  starting with the trailer, then episode 1. Launch plan: `LAUNCH_PLAN.md`.

## 2. State on 2026-11-21

### Finished (share copies committed, see §8)
- Episodes **00–55** (00 = the channel's opening statement; 01–55 story episodes, Adi Parva). Status "released" in the catalog
  means finished and uploadable. **Nothing has been uploaded anywhere.**
  - 50 and 52–55: newest pipeline (one take per sentence, rules 2, voice-clarity mix).
  - 41–49 and 51: older voice and the old credit line ("Voices: synthetic · Drawn in code"), which the owner later rejected.
- **Trailer** v3.2 (89.4 s): owner approved the picture ("Everything is good"). Sound: see half-done.
- **Teaser** (64.6 s, war in hybrid 3D): delivered, **no verdict from the owner yet**.
- **Paper-cut sample** (57.1 s, pipeline 95, birth of Gandhari's hundred sons): **owner approved** (2026-11-21).
- **Intro reel** (pipeline 98, 55.4 s): an older series-introduction reel.

### Half-done / waiting on the owner
1. **Trailer sound → classical.** Owner: "I didn't like the sound, that is too much. Can we make it more classical? Talk to me
   before creating." A plan was proposed and NOT built (details in LESSONS.md §6). Owner must choose: (a) code-synth only,
   (b) free real recordings (CC0/CC-BY samples, now reachable from the Mac), (c) a real musician / licensed track; raga Darbari
   Kanada (recommended) or Bhairavi; lead instrument sarangi (recommended), veena or bansuri.
   The same remix fixes the trailer's **voice clarity** (measured median 9.2 dB voice over bed, 55 % of speech under 10 dB;
   rule is ≥ 15 dB). Picture stays bit-identical (sound-only remux).
2. **Thumbnail / cover art.** Owner wants a proper thumbnail, made with **ChatGPT** image generation in the owner's browser
   (use Claude in Chrome on the Mac). Current placeholder cover: `launch/trailer-cover.jpg` (a frame at 1.6 s).
3. **Posting tool "TryPost".** Owner wants posting through TryPost. Not connected (not found in the connector directory).
   Next session: ask nothing, but check whether a TryPost MCP connector / CLI / API exists on the Mac; if it needs a key, name the
   key and let the owner enter it (never in chat or the repo). Alternative listed in LAUNCH_PLAN.md: Metricool connector.
4. **Title spelling.** Trailer title card says **MAHABHARATA**; teaser, paper-cut, captions say **MAHABHARATAM**. Owner to pick.
5. **Handle** not chosen or claimed.
6. **Trailer post package** for review: `launch/trailer-post.md` (title, descriptions, hashtags, pinned comment, timing).
   Owner has not approved the captions yet.
7. Older open decisions: narration voice (Chatterbox now; ElevenLabs Creator $22/month; owner's own voice), a second voice for
   women's/quoted lines, redo 41–49 and 51 to the new standard, launch date, analytics.
8. Episodes **56–60**: scripted and drawn (`script/ep56–60.en.json`, `script/ARC-51-60.md`), not voiced or rendered. Owner said
   to stop after five episodes (50, 52–55).

### Exact next steps (in this order)
1. Set up the Mac (§5) and confirm a render works: `node tools/gate.mjs --ep 55 --audio` must pass; `CHECK_ONLY=1 bash tools/finish.sh 55`.
2. Get the owner's answers on the trailer sound options (one short message listing the choices above, with the recommendation).
3. Build the classical trailer score as a new `tools/score_trailer_classical.py` behind a script flag, remix with
   `tools/remux.sh 97` (video stream copied), measure voice-over-bed ≥ 15 dB, send for review.
4. Thumbnail with ChatGPT (ask before each download; never get around a login or bot check), finish the title text in code.
5. Connect TryPost (or the chosen tool); prepare the post; **post only after the owner says so**.
6. Then episode 1 posting cadence per LAUNCH_PLAN.md; paper-cut inserts or episodes as the owner decides.

## 3. Files and folders that matter (all under `mahabharatam/` unless noted)

| Path | What it is |
|---|---|
| `HANDOFF.md`, `LESSONS.md`, `ASSETS.md` | This handoff. |
| `README.md` | Long project readme; section "Standing rules learned from the trailer" = rules + which gate checks each. |
| `SERIES.md` | The series bible: structure of the whole epic into seasons, arcs, episodes. |
| `CHARACTERS.md`, `CHARACTERS.png` | Character designs and identities (how each person is drawn). |
| `LAUNCH_PLAN.md` | Platforms, cadence, posting time (7–8 pm IST), launch checklist, connectors. |
| `QUALITY_SCORECARD.md` | One row of measured numbers per episode. |
| `REVIEW_LOG.md` | Every episode/trailer review, findings, owner verdicts, commands to re-run. |
| `VFX-PIPELINE.md` | 3D/VFX tools installed, what runs where, style options. |
| `launch/trailer-post.md`, `launch/trailer-cover.jpg` | Trailer post package for owner review. |
| `catalog/series.json` | Every episode: id, title, synopsis, cliffhanger, CE refs, characters, playlists, status. |
| `script/epNN.en.json` | One script per episode: lines (narration), picture plan, palette, camera, foley, music mood, timing. |
| `script/trailer.en.json` (ep97), `script/teaser.en.json` (ep96), `script/papercut.en.json` (ep95), `script/intro.en.json` (ep98) | Special films; `script/epNN.en.json` symlinks point to them. |
| `script/ARC-41-50.md`, `script/ARC-51-60.md` | Arc plans + verse-by-verse CE check of every beat. |
| `script/TRAILER-EDIT.md`, `TRAILER-CHECK.md`, `TEASER-PLAN.md`, `TEASER-CHECK.md`, `papercut-CHECK.md` | Shot plans and verse checks for the special films. |
| `script/cast.json` | Voice ids per character for the old Kokoro episodes 0–40. |
| `src/` | The drawing engine. `src/episodes.js` maps pipeline numbers to scene modules. |
| `src/kit/` | The kit: `stage.js` (palettes, parallax, camera, transitions), `act.js` (poses, faces, plaques), `characters/` (all figures). |
| `src/scenes/epNN/`, `src/scenes/teaser/` (`war3d.js` = Three.js layer), `src/scenes/papercut/` | Scenes per film. |
| `index.html` | The page the renderer loads. |
| `fonts/` | Cinzel, EB Garamond (woff2) + OFL licences + `fonts.css`. |
| `tools/` | The pipeline (§4). |
| `voice/epNN/en/` | Chosen voice clips + JSON side-cars (word timings). `voice/names.json` = best spelling per Sanskrit name. |
| `audio/epNN/` | `music.wav`, `amb.wav`, `foley.wav`, `voice-stem.en.wav`, `mix.en.wav`, `mix.en.json` (measurements). |
| `build/timeline.epNN.en.json` | Timeline built from voiced line lengths. |
| `lab/review/epNN/`, `lab/review/teaser/`, `lab/review/papercut/`, `lab/review/trailer/` | Review sheets, gate logs, proofs. `lab/review/vob.py` = voice-over-bed measure. |
| `lab/review/trailer/v3/voice/ref_daniel.wav` | **The narration reference voice** (made by Kokoro, no real person). |
| `lab/review/teaser/ir/` | Six real room impulse responses (MIT, CC-BY 4.0) used by teaser and paper-cut scores. |
| `lab/review/teaser/SOUND-RESEARCH.md` | Trailer sound grammar, Indian instrument palette, library/licence evaluation. |
| `lab/voicelab/` | Voice tooling (`cb.py` Chatterbox ONNX, `lib.py` Kokoro). `venv/` is gitignored (recreate, §5). |
| `lab/ce/` | CE e-texts (GRETIL), **gitignored**; re-download (§5). |
| `research/` | Background research notes. |
| `episodeNN-share.mp4`, `*-share.mp4` | Final share copies (committed). Masters `episodeNN.mp4` etc. are gitignored (regenerable). |
| repo root `.claude/skills/` | Skills: `mahabharatam-episode`, `photoreal-cg`, `lemo-styles`. |

## 4. Pipeline (how a film is made)

1. **Script** → verify every beat against the CE (arc document / CHECK file) before drawing.
2. **Voice**: Chatterbox (ONNX, CPU) with the reference `ref_daniel.wav`; one take per sentence, 5 takes per line, chosen by
   recogniser accuracy (faster-whisper base.en), pitch within ±2 semitones of the film median, no clipped edges; never stretch > 4 %.
3. **Timeline** `node tools/timeline.mjs --ep N`.
4. **Score** `python3 -I tools/score.py --ep N` (routes trailer/teaser/papercut to their own `score_*.py`).
5. **Mix** `python3 -I tools/mix.py --ep N` (RULES2 for `"rules": 2` scripts).
6. **Gate** `node tools/gate.mjs --ep N [--frames] [--audio]`; render refuses on any FAIL.
7. **Render** `node tools/render.mjs --ep N --workers 2` (needs ≥ 4 GB RAM free, ≥ 11 GB disk free).
8. **Finish** `bash tools/finish.sh N` → share copy + every check + sheets.
9. **Fix only by splice** (redraw a shot, splice at keyframes) or `bash tools/remux.sh N` for sound only.

Full step-by-step with every command: skill `.claude/skills/mahabharatam-episode/SKILL.md` (= `tools/episode_loop.md`).

| Tool | Purpose |
|---|---|
| `tools/rules2.py --ep N` | Put a script under the current rules. |
| `tools/voice2.py jobs/gen/select/names` | Voice pipeline (run with `lab/voicelab/venv/bin/python`). |
| `tools/voice.py` | Old Kokoro voice pipeline (episodes 0–40). |
| `tools/score.py`, `score_trailer3.py`, `score_teaser.py`, `score_papercut.py` | Synthesised scores. |
| `tools/mix.py` | Mix + loudness + floor/voice-clarity reports. |
| `tools/gate.mjs` | Quality gate. |
| `tools/stills.mjs` | Preview stills every 0.25 s straight from the canvas. |
| `tools/render.mjs` | Full or `--video-only --from --to` segment render. |
| `tools/finish.sh`, `tools/remux.sh` | Finish/verify; sound-only remix. |
| `tools/soundcheck2.py`, `tools/checks.py`, `tools/sharecheck.py` | Sound floor, clicks, voice-over-bed, recogniser; freezes, SSIM. |
| `tools/sheets.py`, `row.py`, `scorecard.py`, `facehits.mjs`, `regress.mjs` | Review sheets, scorecard, text-on-face check, regression of old episodes. |

## 5. Setting up from scratch on the Mac

Versions the cloud used (match or exceed): **Node 22.23**, **Python 3.11.18**, **ffmpeg 6.1** (with libx264), **git-lfs 3.4**,
Chromium via Playwright.

```bash
# system tools (Homebrew)
brew install node@22 python@3.11 ffmpeg git-lfs
git lfs install

git clone https://github.com/manojram1292/dental-crm.git
cd dental-crm && git checkout handoff
cd mahabharatam

# Node side: three 0.187.0, hyperframes 0.9.55, playwright ^1.56
npm ci
npx playwright install chromium          # on the Mac this works (in the cloud it was pre-installed)

# Python for score / mix / checks (system or a venv)
python3.11 -m pip install numpy==2.4.6 scipy==1.17.1 soundfile==0.14.0 pillow==13.0.0 pedalboard==0.9.26 pyarrow==26.0.1 imageio-ffmpeg

# Voice venv (Chatterbox ONNX + Kokoro + faster-whisper)
python3.11 -m venv lab/voicelab/venv
lab/voicelab/venv/bin/pip install onnxruntime==1.31.1 tokenizers==0.23.3 huggingface_hub==2.4.0 \
    faster-whisper==1.2.1 kokoro-onnx==0.6.1 numpy==2.4.6 scipy==1.17.1 soundfile==0.14.0
# Chatterbox ONNX model (MIT, onnx-community/chatterbox-ONNX) → lab/voicelab/venv/models/cb/ (about 1.5 GB):
bash lab/voicelab/get_chatterbox.sh
# faster-whisper base.en downloads itself into lab/voicelab/venv/models/whisper on first use.
# Kokoro (only for old episodes 0–40, or to remake ref_daniel.wav): onnx-community/Kokoro-82M-v1.0-ONNX,
#   onnx/model.onnx → $KOKORO_DIR/model.onnx and voices/*.bin packed to voices.npz by tools/voice.py --model DIR

# Optional 3D/VFX (teaser only used Three.js, already in npm): Blender bpy 4.5.16 LTS in lab/vfx/venv (950 MB)
python3.11 -m venv lab/vfx/venv && lab/vfx/venv/bin/pip install bpy==4.5.16

# CE source texts (gitignored): GRETIL Mahabharata files mbh_01_u.htm … (one per parvan) → lab/ce/
#   from gretil.sub.uni-goettingen.de (Sanskrit e-texts, Mahabharata, BORI CE). adi.txt is a plain-text Adi extract made from mbh_01.
```

**Environment variables (names only; none is a secret):**
- `KOKORO_DIR`: folder with Kokoro `model.onnx` + `voices.npz` (old pipeline; default path in `lab/voicelab/lib.py` is a cloud
  scratchpad path, so set it on the Mac).
- `CB_THREADS`: CPU threads for Chatterbox.
- `PYTHON`, `FFMPEG`: override the python / ffmpeg binaries the Node tools call.
- `GATE_DUMP`: makes the gate dump its measures.
- **No API keys are used by the pipeline.** Keys that future steps may need (owner enters them, never in chat/repo):
  TryPost (or Metricool) posting credentials; ElevenLabs API key only if the owner chooses ElevenLabs; ChatGPT, Google Flow and
  Instagram/YouTube are used through the owner's logged-in browser, no keys.

**Fonts:** `fonts/Cinzel.woff2`, `fonts/EBGaramond.woff2`, `fonts/EBGaramond-Italic.woff2` (OFL), loaded by `fonts/fonts.css`.
Nothing to install system-wide.

**Assets:** none external besides the CE texts, the voice models and the six impulse responses (committed). See ASSETS.md.

**Check the setup works:**
```bash
node tools/gate.mjs --ep 55 --audio          # must PASS
CHECK_ONLY=1 bash tools/finish.sh 55         # re-checks the finished files
python3 lab/review/vob.py audio/ep55/mix.en.wav audio/ep55/voice-stem.en.wav   # voice over bed ≈ 17 dB median
```
Render a film: `node tools/render.mjs --ep N --workers 2` then `bash tools/finish.sh N`. On the Mac use more workers if RAM allows;
the cloud had no GPU (software WebGL: 3D frames 4 s each). On the Mac, WebGL uses the GPU and will be much faster.

## 6. Owner rules in force (short; reasons in LESSONS.md)
- Nothing is posted, uploaded, scheduled or replied publicly without the owner's explicit OK for that item.
- No paid credits (ElevenLabs, Higgsfield, Wan, Runway, Flow beyond the included plan) without approval.
- On-screen credits: the text source only. Never mention synthetic voice, AI, or "drawn in code" on screen or in captions.
- No full silences. Voice clearly audible (≥ 15 dB over the bed). Linear edit, no repeated shots or flash inserts.
- Character introductions slow (≈ 3–4 s each), never "running".
- Talk to the owner before building anything large or changing the sound direction.
- Git: commit code separately from each reviewed video; no model names in the repo; no credentials in the repo.
- Keep the owner's email and personal details out of anything sent to outside services.
- Don't copy the owner's private ribhu-labs code into this public repo.

## 7. How to check any work
`node tools/gate.mjs --ep N --audio` · `CHECK_ONLY=1 bash tools/finish.sh N` · `python3 lab/review/vob.py …` ·
`ffmpeg -i X-share.mp4 -vf freezedetect=n=0.003:d=0.3 -map 0:v -f null -` · open `lab/review/epNN/post-contact.jpg` and the cut
sheets · compare lines with the CE check files. Old episodes must stay unaffected: gate output for 44, 48, 49, 96, 97 byte-identical
to `lab/review/papercut/gate-proof/`.

## 8. Every final video

All share copies: H.264 + AAC, 1080×1920, 30 fps, −14 LUFS, < 21 MB, in `mahabharatam/`. Masters (same names without `-share`,
40–140 MB each, ~5 GB total) are gitignored and regenerable with `tools/render.mjs`.

**Captions and hashtags:** only the trailer has a reviewed-for-approval caption (`launch/trailer-post.md`). The episode captions
below are **drafts** generated from the catalog (title + first sentence of the synopsis + the promise + next-episode pointer),
never approved. Cliffhangers for end-card text are in `catalog/series.json`. Rule for any caption: true to the CE, no "AI" /
"synthetic", no "verse by verse".

| File | Length | Resolution | Size | Title | Caption (draft) | Hashtags (draft) |
|---|---|---|---|---|---|---|
| `mahabharatam/episode00-share.mp4` | 73.5 s | 1080×1920 | 20.1 MB | Channel opening statement (pinned, before ep 1) | The Mahabharata as Vyasa told it: from the Critical Edition, the text scholars read. Nothing added for effect. Episode 1 is next. | #Mahabharata #Mahabharatam #Vyasa #IndianMythology #Itihasa #Shorts |
| `mahabharatam/episode01-share.mp4` | 44.8 s | 1080×1920 | 13.1 MB | The Storyteller Arrives | Episode 1: The Storyteller Arrives. In the Naimisha forest, sages led by Shaunaka keep a twelve-year sacrifice. From the Critical Edition, the text scholars read. Next: episode 2. | #Mahabharata #Mahabharatam #Sauti #Shaunaka #IndianMythology #Itihasa #Shorts |
| `mahabharatam/episode02-share.mp4` | 49.6 s | 1080×1920 | 12.6 MB | The Field of Five Lakes | Episode 2: The Field of Five Lakes. The sages ask where the great war was fought. From the Critical Edition, the text scholars read. Next: episode 3. | #Mahabharata #Mahabharatam #Sauti #Shaunaka #Parashurama #IndianMythology #Itihasa #Shorts |
| `mahabharatam/episode03-share.mp4` | 56.4 s | 1080×1920 | 14.5 MB | Eighteen Armies | Episode 3: Eighteen Armies. Asked what an akshauhini is, Sauti builds one from a single patti (one chariot, one elephant, three horses, five foot soldiers), tripling it seven times and multiplying by ten: 21,870 chariots, as many elephants, 65,610 horses and 109,350 foot soldiers. From the Critical Edition, the text scholars read. Next: episode 4. | #Mahabharata #Mahabharatam #Sauti #Shaunaka #IndianMythology #Itihasa #Shorts |
| `mahabharatam/episode04-share.mp4` | 51.9 s | 1080×1920 | 12.6 MB | The Story Is Born | Episode 4: The Story Is Born. Vyasa holds the whole epic in his mind. From the Critical Edition, the text scholars read. Next: episode 5. | #Mahabharata #Mahabharatam #Vyasa #Ganesha #Vaishampayana #IndianMythology #Itihasa #Shorts |
| `mahabharatam/episode05-share.mp4` | 51.9 s | 1080×1920 | 15.1 MB | The Curse of Sarama | Episode 5: The Curse of Sarama. At Kurukshetra, Janamejaya and his brothers Shrutasena, Ugrasena and Bhimasena sit at a long sacrifice. From the Critical Edition, the text scholars read. Next: episode 6. | #Mahabharata #Mahabharatam #Janamejaya #JanamejayaBrothers #Sarama #IndianMythology #Itihasa #Shorts |
| `mahabharatam/episode06-share.mp4` | 50.1 s | 1080×1920 | 14.4 MB | The Stolen Earrings | Episode 6: The Stolen Earrings. Uttanka, the student of Veda, asks his teacher's wife what gift to bring; she asks for the earrings of King Paushya's queen. From the Critical Edition, the text scholars read. Next: episode 7. | #Mahabharata #Mahabharatam #Uttanka #Gurupatni #PaushyaQueen #IndianMythology #Itihasa #Shorts |
| `mahabharatam/episode07-share.mp4` | 58.0 s | 1080×1920 | 17.5 MB | The Seven-Day Curse | Episode 7: The Seven-Day Curse. King Parikshit, hunting, follows a wounded deer and asks the sage Shamika, who is keeping a vow of silence, where it went. From the Critical Edition, the text scholars read. Next: episode 8. | #Mahabharata #Mahabharatam #Sauti #Parikshit #Shamika #IndianMythology #Itihasa #Shorts |
| `mahabharatam/episode08-share.mp4` | 56.0 s | 1080×1920 | 15.5 MB | The Snake Sacrifice | Episode 8: The Snake Sacrifice. Janamejaya, told how his father died, vows the sarpa-satra. From the Critical Edition, the text scholars read. Next: episode 9. | #Mahabharata #Mahabharatam #Sauti #Janamejaya #Sthapati #IndianMythology #Itihasa #Shorts |
| `mahabharatam/episode09-share.mp4` | 56.2 s | 1080×1920 | 16.4 MB | Two Wives, Two Wishes | Episode 9: Two Wives, Two Wishes. Long ago the sage Kashyapa granted boons to his wives Kadru and Vinata, daughters of Daksha. From the Critical Edition, the text scholars read. Next: episode 10. | #Mahabharata #Mahabharatam #Kashyapa #Kadru #Vinata #IndianMythology #Itihasa #Shorts |
| `mahabharatam/episode10-share.mp4` | 54.3 s | 1080×1920 | 14.1 MB | The Broken Egg | Episode 10: The Broken Egg. Ashamed that her rival's sons were born, Vinata broke one of her eggs. From the Critical Edition, the text scholars read. Next: episode 11. | #Mahabharata #Mahabharatam #Vinata #Aruna #Surya #IndianMythology #Itihasa #Shorts |
| `mahabharatam/episode11-share.mp4` | 56.1 s | 1080×1920 | 15.8 MB | The Horse from the Ocean | Episode 11: The Horse from the Ocean. Kadru and Vinata see Uchchaihshravas, the white king of horses, honoured by the gods. From the Critical Edition, the text scholars read. Next: episode 12. | #Mahabharata #Mahabharatam #Sauti #Kadru #Vinata #IndianMythology #Itihasa #Shorts |
| `mahabharatam/episode12-share.mp4` | 57.7 s | 1080×1920 | 17.5 MB | A Mountain for a Churning Stick | Episode 12: A Mountain for a Churning Stick. At Brahma's and Narayana's word, the serpent Ananta uproots Mount Mandara and the gods carry it to the ocean, which agrees to be churned if it gets a share of the amrita. From the Critical Edition, the text scholars read. Next: episode 13. | #Mahabharata #Mahabharatam #Sauti #Brahma #Vishnu #IndianMythology #Itihasa #Shorts |
| `mahabharatam/episode13-share.mp4` | 57.4 s | 1080×1920 | 17.6 MB | What Rose from the Ocean | Episode 13: What Rose from the Ocean. Gods and asuras churn. From the Critical Edition, the text scholars read. Next: episode 14. | #Mahabharata #Mahabharatam #Sauti #Vishnu #Indra #IndianMythology #Itihasa #Shorts |
| `mahabharatam/episode14-share.mp4` | 53.9 s | 1080×1920 | 14.7 MB | The Blue Throat | Episode 14: The Blue Throat. As tradition tells it (in the Southern manuscripts and the vulgate, not in the Critical Edition's text): as the churning goes on, the kalakuta poison rises, its fumes engulfing the worlds. From the Critical Edition, the text scholars read. Next: episode 15. | #Mahabharata #Mahabharatam #Sauti #Shiva #Brahma #IndianMythology #Itihasa #Shorts |
| `mahabharatam/episode15-share.mp4` | 57.6 s | 1080×1920 | 14.5 MB | The Enchantress and Rahu | Episode 15: The Enchantress and Rahu. The asuras clamour for the amrita. From the Critical Edition, the text scholars read. Next: episode 16. | #Mahabharata #Mahabharatam #Sauti #Vishnu #Enchantress #IndianMythology #Itihasa #Shorts |
| `mahabharatam/episode16-share.mp4` | 55.9 s | 1080×1920 | 16.3 MB | The War for the Amrita | Episode 16: The War for the Amrita. Gods and asuras fight on the shore. From the Critical Edition, the text scholars read. Next: episode 17. | #Mahabharata #Mahabharatam #Sauti #Vishnu #Nara #IndianMythology #Itihasa #Shorts |
| `mahabharatam/episode17-share.mp4` | 54.6 s | 1080×1920 | 13.0 MB | The Wager | Episode 17: The Wager. Vinata says the horse is all white; Kadru says its tail is black; the loser will be the winner's slave. From the Critical Edition, the text scholars read. Next: episode 18. | #Mahabharata #Mahabharatam #Sauti #Kadru #Vinata #IndianMythology #Itihasa #Shorts |
| `mahabharatam/episode18-share.mp4` | 54.0 s | 1080×1920 | 14.6 MB | The Black Hairs | Episode 18: The Black Hairs. The sisters fly over the great ocean, its depths full of monsters and jewels, to where the horse stands. From the Critical Edition, the text scholars read. Next: episode 19. | #Mahabharata #Mahabharatam #Sauti #Kadru #Vinata #IndianMythology #Itihasa #Shorts |
| `mahabharatam/episode19-share.mp4` | 55.8 s | 1080×1920 | 17.6 MB | Garuda Is Born | Episode 19: Garuda Is Born. In his time Garuda bursts from his egg, huge and blazing, and rises into the sky. From the Critical Edition, the text scholars read. Next: episode 20. | #Mahabharata #Mahabharatam #Sauti #Garuda #Vinata #IndianMythology #Itihasa #Shorts |
| `mahabharatam/episode20-share.mp4` | 56.0 s | 1080×1920 | 19.0 MB | Carrying the Serpents | Episode 20: Carrying the Serpents. Kadru orders Vinata to carry her to an island in the sea, and Garuda to carry the serpents. From the Critical Edition, the text scholars read. Next: episode 21. | #Mahabharata #Mahabharatam #Sauti #Garuda #Vinata #IndianMythology #Itihasa #Shorts |
| `mahabharatam/episode21-share.mp4` | 57.8 s | 1080×1920 | 17.9 MB | The Price of Freedom | Episode 21: The Price of Freedom. The serpents name their price: bring us the amrita. From the Critical Edition, the text scholars read. Next: episode 22. | #Mahabharata #Mahabharatam #Garuda #Vinata #IndianMythology #Itihasa #Shorts |
| `mahabharatam/episode22-share.mp4` | 55.8 s | 1080×1920 | 17.0 MB | The Brahmin in the Throat | Episode 22: The Brahmin in the Throat. Garuda swallows a crowd of Nishadas, and one of them burns his throat: a brahmin. From the Critical Edition, the text scholars read. Next: episode 23. | #Mahabharata #Mahabharatam #Garuda #Kashyapa #IndianMythology #Itihasa #Shorts |
| `mahabharatam/episode23-share.mp4` | 57.4 s | 1080×1920 | 14.8 MB | The Elephant and the Tortoise | Episode 23: The Elephant and the Tortoise. Kashyapa tells of two brothers: the wrathful sage Vibhavasu cursed his younger brother Supratika, who wanted their wealth divided, to become an elephant, and Supratika cursed him back to become a tortoise; they fight on in a lake. From the Critical Edition, the text scholars read. Next: episode 24. | #Mahabharata #Mahabharatam #Garuda #Kashyapa #IndianMythology #Itihasa #Shorts |
| `mahabharatam/episode24-share.mp4` | 55.6 s | 1080×1920 | 16.7 MB | The Thumb-Sized Sages | Episode 24: The Thumb-Sized Sages. The broken branch is full of Valakhilyas, sages no bigger than a thumb, hanging upside down in austerity. From the Critical Edition, the text scholars read. Next: episode 25. | #Mahabharata #Mahabharatam #Garuda #Valakhilyas #Kashyapa #IndianMythology #Itihasa #Shorts |
| `mahabharatam/episode25-share.mp4` | 56.5 s | 1080×1920 | 15.0 MB | Why Indra Feared a Bird | Episode 25: Why Indra Feared a Bird. Shaunaka asks, and Sauti tells: at Kashyapa's sacrifice, Indra laughed at the Valakhilyas struggling to carry a single leaf. From the Critical Edition, the text scholars read. Next: episode 26. | #Mahabharata #Mahabharatam #Indra #Valakhilyas #Kashyapa #IndianMythology #Itihasa #Shorts |
| `mahabharatam/episode26-share.mp4` | 55.8 s | 1080×1920 | 17.5 MB | Garuda Storms Heaven | Episode 26: Garuda Storms Heaven. Heaven fills with omens: winds, meteors, a rain of blood. From the Critical Edition, the text scholars read. Next: episode 27. | #Mahabharata #Mahabharatam #Garuda #Indra #Devas #IndianMythology #Itihasa #Shorts |
| `mahabharatam/episode27-share.mp4` | 55.4 s | 1080×1920 | 16.4 MB | The Wheel of Blades | Episode 27: The Wheel of Blades. Garuda drinks rivers to put out the fire around the amrita, shrinks small enough to slip through the spokes of a spinning wheel edged with blades, and blinds the two great serpents that guard it. From the Critical Edition, the text scholars read. Next: episode 28. | #Mahabharata #Mahabharatam #Garuda #IndianMythology #Itihasa #Shorts |
| `mahabharatam/episode28-share.mp4` | 55.3 s | 1080×1920 | 16.6 MB | A Boon from Vishnu | Episode 28: A Boon from Vishnu. Pleased that Garuda did not drink, Vishnu offers him a boon. From the Critical Edition, the text scholars read. Next: episode 29. | #Mahabharata #Mahabharatam #Garuda #Vishnu #IndianMythology #Itihasa #Shorts |
| `mahabharatam/episode29-share.mp4` | 58.2 s | 1080×1920 | 16.8 MB | The Feather and the Thunderbolt | Episode 29: The Feather and the Thunderbolt. Indra strikes with the vajra. From the Critical Edition, the text scholars read. Next: episode 30. | #Mahabharata #Mahabharatam #Garuda #Indra #IndianMythology #Itihasa #Shorts |
| `mahabharatam/episode30-share.mp4` | 57.1 s | 1080×1920 | 13.4 MB | Forked Tongues | Episode 30: Forked Tongues. Garuda sets the amrita on a bed of kusha grass and tells the serpents to bathe before they drink. From the Critical Edition, the text scholars read. Next: episode 31. | #Mahabharata #Mahabharatam #Garuda #Vinata #Indra #IndianMythology #Itihasa #Shorts |
| `mahabharatam/episode31-share.mp4` | 57.6 s | 1080×1920 | 14.2 MB | Shesha Holds the Earth | Episode 31: Shesha Holds the Earth. Shesha, the eldest serpent, will not live among his scheming brothers. From the Critical Edition, the text scholars read. Next: episode 32. | #Mahabharata #Mahabharatam #Shesha #Brahma #Garuda #IndianMythology #Itihasa #Shorts |
| `mahabharatam/episode32-share.mp4` | 56.8 s | 1080×1920 | 15.5 MB | Vasuki's Council | Episode 32: Vasuki's Council. Vasuki gathers the serpents to escape the curse. From the Critical Edition, the text scholars read. Next: episode 33. | #Mahabharata #Mahabharatam #Vasuki #Elapatra #Brahma #IndianMythology #Itihasa #Shorts |
| `mahabharatam/episode33-share.mp4` | 56.4 s | 1080×1920 | 12.1 MB | The Ancestors in the Pit | Episode 33: The Ancestors in the Pit. The ascetic Jaratkaru, wandering and celibate, finds his ancestors hanging head-down in a pit, clinging to a single stalk that a rat is gnawing away. From the Critical Edition, the text scholars read. Next: episode 34. | #Mahabharata #Mahabharatam #Jaratkaru #IndianMythology #Itihasa #Shorts |
| `mahabharatam/episode34-share.mp4` | 56.1 s | 1080×1920 | 12.3 MB | The Bride with His Name | Episode 34: The Bride with His Name. Jaratkaru calls into the forest for a bride. From the Critical Edition, the text scholars read. Next: episode 35. | #Mahabharata #Mahabharatam #Jaratkaru #JaratkaruBride #Vasuki #IndianMythology #Itihasa #Shorts |
| `mahabharatam/episode35-share.mp4` | 55.8 s | 1080×1920 | 11.0 MB | The Sunset Prayer | Episode 35: The Sunset Prayer. Jaratkaru sleeps as the sun goes down. From the Critical Edition, the text scholars read. Next: episode 36. | #Mahabharata #Mahabharatam #Jaratkaru #JaratkaruBride #IndianMythology #Itihasa #Shorts |
| `mahabharatam/episode36-share.mp4` | 56.2 s | 1080×1920 | 12.7 MB | The Boy Called Astika | Episode 36: The Boy Called Astika. Astika is born, raised in Vasuki's house and taught the Vedas by Chyavana, son of Bhrigu. From the Critical Edition, the text scholars read. Next: episode 37. | #Mahabharata #Mahabharatam #Astika #Vasuki #Chyavana #IndianMythology #Itihasa #Shorts |
| `mahabharatam/episode37-share.mp4` | 55.5 s | 1080×1920 | 15.8 MB | The Witness in the Tree | Episode 37: The Witness in the Tree. Janamejaya asks his ministers how Parikshit died. From the Critical Edition, the text scholars read. Next: episode 38. | #Mahabharata #Mahabharatam #Janamejaya #Takshaka #KashyapaHealer #IndianMythology #Itihasa #Shorts |
| `mahabharatam/episode38-share.mp4` | 56.9 s | 1080×1920 | 16.6 MB | Astika at the Gate | Episode 38: Astika at the Gate. With most of his people burned and the spell dragging him toward the fire, Vasuki begs his sister to send her son. From the Critical Edition, the text scholars read. Next: episode 39. | #Mahabharata #Mahabharatam #Astika #Vasuki #JaratkaruBride #IndianMythology #Itihasa #Shorts |
| `mahabharatam/episode39-share.mp4` | 56.8 s | 1080×1920 | 17.0 MB | Indra Lets Go | Episode 39: Indra Lets Go. The priests say Takshaka is hiding with Indra. From the Critical Edition, the text scholars read. Next: episode 40. | #Mahabharata #Mahabharatam #Astika #Janamejaya #Takshaka #IndianMythology #Itihasa #Shorts |
| `mahabharatam/episode40-share.mp4` | 58.0 s | 1080×1920 | 18.8 MB | The Sacrifice Stops | Episode 40: The Sacrifice Stops. The assembly urges the king, and Janamejaya grants the boon. From the Critical Edition, the text scholars read. Next: episode 41. | #Mahabharata #Mahabharatam #Astika #Janamejaya #Takshaka #IndianMythology #Itihasa #Shorts |
| `mahabharatam/episode41-share.mp4` | 57.7 s | 1080×1920 | 18.3 MB | The Bride and the Demon | Episode 41: The Bride and the Demon. Shaunaka asks Sauti for the story of his own family, the Bhrigus (in the text this tale is told before the serpent tales). From the Critical Edition, the text scholars read. Next: episode 42. | #Mahabharata #Mahabharatam #Sauti #Shaunaka #Puloma #IndianMythology #Itihasa #Shorts |
| `mahabharatam/episode42-share.mp4` | 56.7 s | 1080×1920 | 17.6 MB | The Child Who Fell | Episode 42: The Child Who Fell. In anger the child drops from Puloma's womb (and is called Chyavana, "the fallen"), shining like the sun; the rakshasa lets her go and burns to ash. From the Critical Edition, the text scholars read. Next: episode 43. | #Mahabharata #Mahabharatam #Chyavana #Puloma #Bhrigu #IndianMythology #Itihasa #Shorts |
| `mahabharatam/episode43-share.mp4` | 56.9 s | 1080×1920 | 17.0 MB | The Curse on Fire | Episode 43: The Curse on Fire. Bhrigu curses Agni to eat everything. From the Critical Edition, the text scholars read. Next: episode 44. | #Mahabharata #Mahabharatam #Agni #Bhrigu #Brahma #IndianMythology #Itihasa #Shorts |
| `mahabharatam/episode44-share.mp4` | 56.2 s | 1080×1920 | 15.9 MB | Ruru and Pramadvara | Episode 44: Ruru and Pramadvara. Ruru is a young sage of Bhrigu's line. From the Critical Edition, the text scholars read. Next: episode 45. | #Mahabharata #Mahabharatam #Ruru #Pramadvara #Menaka #IndianMythology #Itihasa #Shorts |
| `mahabharatam/episode45-share.mp4` | 56.0 s | 1080×1920 | 15.6 MB | Half a Life | Episode 45: Half a Life. A messenger of the gods tells the grieving Ruru that the dead do not return, but that the gods have left one way: half his own life. From the Critical Edition, the text scholars read. Next: episode 46. | #Mahabharata #Mahabharatam #Ruru #Pramadvara #Dharma #IndianMythology #Itihasa #Shorts |
| `mahabharatam/episode46-share.mp4` | 58.2 s | 1080×1920 | 17.6 MB | The Snake Who Was a Sage | Episode 46: The Snake Who Was a Sage. Ruru raises his staff over an old, harmless snake (a dundubha). From the Critical Edition, the text scholars read. Next: episode 47. | #Mahabharata #Mahabharatam #Ruru #Sahasrapat #Pramati #IndianMythology #Itihasa #Shorts |
| `mahabharatam/episode47-share.mp4` | 56.8 s | 1080×1920 | 17.2 MB | Vyasa Comes to the Sacrifice | Episode 47: Vyasa Comes to the Sacrifice. While King Janamejaya's snake sacrifice is still burning, Vyasa, the poet of the Mahabharata, walks into the hall with his students. From the Critical Edition, the text scholars read. Next: episode 48. | #Mahabharata #Mahabharatam #Vyasa #Vaishampayana #Janamejaya #IndianMythology #Itihasa #Shorts |
| `mahabharatam/episode48-share.mp4` | 56.5 s | 1080×1920 | 16.8 MB | The Whole Story in One Breath | Episode 48: The Whole Story in One Breath. Vaishampayana first tells the whole story in brief: five brothers, a jealous cousin, poison and a house built to burn, a princess won and a kingdom built, a crooked game of dice, twelve years in the forest and one in hiding, the refusal, the war, and a land won back laid waste. From the Critical Edition, the text scholars read. Next: episode 49. | #Mahabharata #Mahabharatam #Vaishampayana #Janamejaya #Yudhishthira #IndianMythology #Itihasa #Shorts |
| `mahabharatam/episode49-share.mp4` | 57.3 s | 1080×1920 | 17.6 MB | The King, the Fish and the Ferry Girl | Episode 49: The King, the Fish and the Ferry Girl. The full telling begins with the poet's grandfather: King Uparichara, with his crystal chariot of the sky. From the Critical Edition, the text scholars read. Next: episode 50. | #Mahabharata #Mahabharatam #UparicharaVasu #Satyavati #DasaChief #IndianMythology #Itihasa #Shorts |
| `mahabharatam/episode50-share.mp4` | 55.1 s | 1080×1920 | 17.1 MB | Born on an Island | Episode 50: Born on an Island. Satyavati, a young woman, rows a ferry. From the Critical Edition, the text scholars read. Next: episode 51. | #Mahabharata #Mahabharatam #Parashara #Satyavati #Vyasa #IndianMythology #Itihasa #Shorts |
| `mahabharatam/episode51-share.mp4` | 53.2 s | 1080×1920 | 14.9 MB | The Burden of the Earth | Episode 51: The Burden of the Earth. Asked why godlike heroes were born on earth, the teller answers that it is a secret of the gods, and tells it. From the Critical Edition, the text scholars read. Next: episode 52. | #Mahabharata #Mahabharatam #EarthGoddess #Brahma #Parashurama #IndianMythology #Itihasa #Shorts |
| `mahabharatam/episode52-share.mp4` | 54.4 s | 1080×1920 | 17.3 MB | Gods in Disguise | Episode 52: Gods in Disguise. The king asks which god was born as whom. From the Critical Edition, the text scholars read. Next: episode 53. | #Mahabharata #Mahabharatam #Vaishampayana #Janamejaya #Krishna #IndianMythology #Itihasa #Shorts |
| `mahabharatam/episode53-share.mp4` | 54.9 s | 1080×1920 | 16.9 MB | The King and the Hermitage | Episode 53: The King and the Hermitage. The story of the epic's royal house begins with Dushyanta, of Puru's line. From the Critical Edition, the text scholars read. Next: episode 54. | #Mahabharata #Mahabharatam #Dushyanta #Kanva #IndianMythology #Itihasa #Shorts |
| `mahabharatam/episode54-share.mp4` | 56.0 s | 1080×1920 | 17.3 MB | The Girl the Birds Protected | Episode 54: The Girl the Birds Protected. How can a celibate sage have a daughter? From the Critical Edition, the text scholars read. Next: episode 55. | #Mahabharata #Mahabharatam #Shakuntala #Dushyanta #Vishvamitra #IndianMythology #Itihasa #Shorts |
| `mahabharatam/episode55-share.mp4` | 54.0 s | 1080×1920 | 16.5 MB | A Marriage Without Witnesses | Episode 55: A Marriage Without Witnesses. "Be my wife. From the Critical Edition, the text scholars read. Next: episode 56. | #Mahabharata #Mahabharatam #Shakuntala #Dushyanta #Kanva #IndianMythology #Itihasa #Shorts |
| `mahabharatam/trailer-share.mp4` | 89.4 s | 1080×1920 | 18.5 MB | Official trailer v3.2 (approved; caption in launch/trailer-post.md) | see §8 | see §8 |
| `mahabharatam/teaser-share.mp4` | 64.6 s | 1080×1920 | 18.1 MB | War teaser, hybrid 3D (no verdict yet) | see §8 | see §8 |
| `mahabharatam/papercut-share.mp4` | 57.1 s | 1080×1920 | 18.4 MB | Paper-cut sample: the birth of the hundred (approved) | see §8 | see §8 |
| `mahabharatam/intro-share.mp4` | 55.4 s | 1080×1920 | 17.3 MB | Series introduction reel (pipeline 98) | see §8 | see §8 |

**Special films:**
- **Trailer** (`trailer-share.mp4`, 89.4 s). YouTube title: "Mahabharatam: As Vyasa Told It | Official Trailer". Description,
  Reels caption, hashtags and pinned comment: `launch/trailer-post.md`. Hashtags (YouTube): #Mahabharata #Mahabharatam #Vyasa
  #Krishna #Arjuna #BhagavadGita #IndianMythology #Itihasa #Shorts. Cover: `launch/trailer-cover.jpg`. Sound to be redone (§2).
- **Teaser** (`teaser-share.mp4`, 64.6 s). Draft caption: "Eighteen armies. One charioteer. 'I am Time.' The Mahabharata as Vyasa
  told it, from the Critical Edition. Episode 1 is next." Hashtags: #Mahabharata #Mahabharatam #Kurukshetra #Krishna #Arjuna
  #Bhishma #Karna #BhagavadGita #IndianMythology #Shorts. **If posted, the description must carry the CC-BY credit** (ASSETS.md).
- **Paper-cut sample** (`papercut-share.mp4`, 57.1 s). Draft caption: "One lump of flesh. A hundred sons. How the Kauravas were
  born, as the Critical Edition tells it (Adi 107). Nothing added for effect." Hashtags: #Mahabharata #Mahabharatam #Gandhari
  #Duryodhana #Kauravas #Vyasa #PaperCut #Sanjhi #IndianArt #Shorts. **Needs the CC-BY credit too** (its score uses the MIT rooms).
- **Intro reel** (`intro-share.mp4`, 55.4 s, pipeline 98): older series introduction; superseded by the trailer.
