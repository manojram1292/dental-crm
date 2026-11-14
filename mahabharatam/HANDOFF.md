# Handoff brief: "Mahabharatam — As Vyasa Told It"

Paste this whole file to another agent. It explains the project, the standards, the pipeline, the techniques, what has been learned
the hard way, where things stand, and how to check the work. Everything lives in the repository; this file points to it.

---

## 1. The task

A series of vertical short videos retelling the Mahabharata faithfully, for YouTube Shorts and Instagram Reels.

- **Format:** 1080×1920, 30 fps, English. Each episode is 54–58 s (hard maximum 59 s). A separate trailer runs 89.4 s.
- **Picture:** drawn entirely in code in a temple-mural style. No stock footage and no AI image generation.
- **Fidelity:** follows the BORI Critical Edition (CE) of the Mahabharata. Material that exists only in later tradition is either
  left out or tagged on screen "As tradition tells it". Nothing is exaggerated for effect. That is the series' promise ("Nothing
  added for effect").
- **Owner's standing instructions:**
  - improve on every video;
  - research before writing;
  - the storytelling must be solid and flawless;
  - more graphics and more engagement;
  - do the work in a closed loop with no rework, judged as a human viewer would feel it;
  - be economical with effort.
- **Owner decisions in force:**
  - On-screen credits show only the text source ("Text: the Mahabharata · BORI Critical Edition"). Do not show "Voices: synthetic ·
    Drawn in code" (the owner called it overkill).
  - No full silences, anywhere.
  - The voice must be clearly hearable over the music.
  - Nothing is published or uploaded without the owner's approval.
  - No paid services (ElevenLabs, Higgsfield credits) without approval.

## 2. Where everything is

- **Repository and branch:** repository `dental-crm`, folder `mahabharatam/`, branch `claude/motion-graphics-showreel-v8vvuo`.
  Push only there. Open no pull request unless asked.
- **Start with these documents:**
  - `README.md`, the "Standing rules learned from the trailer" section: the lessons, each with whether a gate checks it.
  - `tools/episode_loop.md`: the step-by-step loop for one episode, with every command.
  - `REVIEW_LOG.md`: what was done and found on every episode and trailer cut, with commands to re-run.
  - `QUALITY_SCORECARD.md`: one row of measured numbers per episode.
  - `catalog/series.json`: titles and status of every episode.
  - `script/ARC-41-50.md` and `script/ARC-51-60.md`: arc plans, the CE verse check for every beat, and the reviews.
  - `script/TRAILER-EDIT.md` (the trailer's shot plan) and `script/TRAILER-CHECK.md` (its verse check).
- **Code:**
  - `src/` holds the drawing engine, the character kit (`src/kit/characters/`) and scenes per episode (`src/scenes/epNN/`).
  - `tools/` holds the pipeline (see §4).
- **Inputs and outputs:**
  - Scripts: `script/epNN.en.json`.
  - Voice clips: `voice/epNN/en/`.
  - Sound stems and mix: `audio/epNN/`.
  - Timelines: `build/timeline.epNN.en.json`.
  - Review sheets: `lab/review/epNN/`.
  - CE source texts (GRETIL): `lab/ce/`, gitignored.
- **Videos:**
  - Masters `episodeNN.mp4` and `trailer.mp4` are gitignored.
  - Share copies `episodeNN-share.mp4` and `trailer-share.mp4` (under 20 MB) are committed, one commit per reviewed video.
  - Unreviewed share copies are hidden through `.git/info/exclude` until accepted.

## 3. How a video is made

1. **Script** (`script/epNN.en.json`). It holds lines (narration), each with a picture plan: palette, camera move, foley, music
   mood, speaker and notes. It is verified against the CE beat by beat in the arc document before any drawing.
2. **Voice.** Chatterbox TTS (open source, MIT licence) runs on CPU in `lab/voicelab/venv`, using one reference voice (a Kokoro
   `bm_daniel` voice read slowly) for the whole film. Each sentence is generated as one take, 5 takes per line, and the take is
   chosen by measurement:
   - recogniser accuracy (faster-whisper);
   - pitch within 2 semitones of the film's median;
   - no creak or clipped edges;
   - 120–250 ms of air after the last word.
   No time-stretch over 4 %. Captions are timed from the recogniser's word timestamps. Name spellings that the recogniser hears
   correctly are stored in `voice/names.json` and reused.
3. **Timeline** (`tools/timeline.mjs`) is built from the voiced line lengths. Picture cuts fall on the 30 fps frame grid.
4. **Score** (`tools/score.py`) is synthesised music in three stems: music, ambience and foley. It uses mood motifs, a pulse and
   drones. It is our own synth, with nothing copied.
5. **Mix** (`tools/mix.py`, the "rules": 2 path, `RULES2`). See §5.
6. **Gate** (`tools/gate.mjs`). Automatic quality rules on the script, the audio and sampled frames, listed in §6. A render is
   refused unless the gate passes.
7. **Render** (`tools/render.mjs`). Headless Chromium with Playwright draws each frame from the canvas, as a pure function of time,
   and ffmpeg encodes. It refuses to start without 4 GB of free memory and 11 GB of free disk. Run only one heavy job at a time:
   a render was once killed by running out of memory.
8. **Finish and verify** (`tools/finish.sh N`):
   - the share encode (`-crf 23 -maxrate 2500k`, a keyframe on every cut, `+faststart`);
   - freeze detection;
   - the sound-floor check;
   - the voice-over-bed check;
   - the recogniser on the final mix;
   - contact and cut sheets.
9. **Fix after render only by splice.** Redraw the faulty shot and splice it in (other frames stay bit-identical). For a sound-only
   fix, `tools/remux.sh N` remixes and re-muxes with the video stream copied (checked by md5). It refuses if the audio gate fails.

## 4. Key tools

| Tool | What it does |
|---|---|
| `tools/rules2.py --ep N` | Puts a script under the current rules (`"rules": 2`, source-only credits, frame snap). |
| `tools/voice2.py jobs / gen / select / names` | The voice pipeline. |
| `tools/score.py`, `tools/mix.py` | Music and mix. |
| `tools/gate.mjs --ep N [--frames] [--audio]` | The quality gate. |
| `tools/stills.mjs` | Preview stills every 0.25 s straight from the canvas, before any render. |
| `tools/render.mjs --ep N --workers 2` | Full render. `--video-only` renders shots for a splice. |
| `tools/finish.sh N` | Share copy and every check on the finished file. |
| `tools/remux.sh N` | Sound-only remix into the existing videos. |
| `tools/soundcheck2.py` | Sound floor, falls, clipping, clip-boundary clicks, voice over bed, recogniser. |
| `tools/checks.py` | Freezes, low motion, repeated frames, SSIM of the share copy against the master. |
| `tools/sheets.py`, `tools/row.py`, `tools/scorecard.py` | Review sheets and scorecard rows. |

## 5. Sound techniques (current, and why)

- **The voice stands clear.** While the voice speaks it must sit a median of at least 15 dB over everything else, with the 10th
  percentile at least 8 dB. This is measured as a local fit per 100 ms over windows of actual speech, within 12 dB of the voice's
  median.
  - **How:** the duck is held over each whole line, from 30 ms before the first word to the last word. Music ducks 17 dB, ambience
    11 dB, foley 12 dB. The bed is carved 5 dB around 2.5 kHz while the voice speaks. A line's quieter `mixDb` moves the voice only.
  - **Why:** the first version ("duck 8–10 dB at most, never under −26 dBFS") buried the voice. The owner said episode 50 was "very
    noisy, the audio is not properly hearable".
- **No full silence and no holes.** Between lines the bed (drone, pulse, ambience) keeps running.
  - The floor rule (no 100 ms window under −34 dBFS) and the fall rule (no drop of more than 12 dB within 0.3 s) apply between
    lines. There the bed may be lifted, but never under the voice.
  - A "rest" (before the turn) is a dip of 3–4 dB, not silence.
  - Sound is present from frame 0.
  - **Why:** the owner heard deliberate silences as "a cut" or "a lag", and dead air between words as "words getting stuck".
- **Loudness:** about −14 LUFS, true peak no higher than −1.5 dBTP on the mp4 (the limiter ceiling is −2.5). Loudness range at
  least 4. The "Next episode" band sits 5–6 dB under the body.
- **Trailer only:** "I am Time" uses an octave-down double with formants kept, a wide double and a 3.5 s temple-hall reverb, with a
  bell, a conch and a swell around it. A subtle binaural pair (98/105 Hz, about 18 dB under the voice) runs under the Vishvarupa
  scene and is mono-safe. The trailer was mixed before the voice-clarity fix and measures only about 9 dB voice over bed. It has
  not been remixed (the owner approved it; remixing it is offered).

## 6. Picture and edit techniques

- **The gate checks:**
  - hook of 8 words or fewer, spoken by 3.0 s;
  - motion at 0.5 s;
  - turn at 40–60 % of the running time;
  - 2.6 words a second or fewer;
  - at most 2 new names per 10 s;
  - palette variety (hue run of 2 or fewer);
  - at least 4 camera moves and 1 signature shot;
  - contrast ΔE of at least 20;
  - no text on a face;
  - plaques never under captions and never jumping;
  - key-frame pHash variety against the previous 3 episodes.
- **Under rules 2 the gate also checks:**
  - no freeze over 0.3 s;
  - captions gone by the cut;
  - cuts on the frame grid;
  - no picture and no three-word phrase used twice;
  - no picture under 1.3 s;
  - every sentence one take;
  - a word ends at least 150 ms before its picture cut;
  - source-only credits.
- **Review-only rules** (not gate-checked): no black-silhouette principal characters; plaques arrive with box and text together.
- **The edit grammar** (from the trailer, applied with judgement):
  - a slow push-in on a face at a decision;
  - a pull-back to reveal scale when a consequence lands;
  - a hard cut on impact, 2–3 frames after contact;
  - match cuts on shape and screen position;
  - sound leads picture by 4–8 frames;
  - shot length accelerates toward the climax, with one long hold on the signature shot;
  - withholding (Krishna's lit face kept back until Vishvarupa in the trailer).
- **Linear storytelling.** No repeated images or phrases and no flash inserts. The owner read cross-cut inserts as the video
  "restarting".
- **Restraint and respect.** The Draupadi and Shakuntala scenes are handled with restraint. The cloth scene shows no cause, because
  Krishna's part there is a later star passage.

## 7. The closed loop (no rework)

The loop runs the cheapest checks first, so the full render happens once (`tools/episode_loop.md`):

1. script gate;
2. voice: generate, select, recogniser, and fix names here;
3. mix and audio gate on the wav alone;
4. preview stills every 0.25 s and a **viewer pass**;
5. full gate, then render once;
6. verify the mp4 and open the sheets;
7. splice only if step 6 finds a real fault.

**The viewer pass** judges the episode as a first-time viewer on a phone, with the sound on and a thumb ready to swipe:
- Is there something moving and a reason to stay within 2 s?
- Is there one idea, one subject and one caption at a time?
- Is the thing being spoken about the thing that is lit or moving?
- Does anything pop, jump, flash or repeat? Anything that looks like a mistake is one.
- Do picture, voice and music rise together at the peak?
- Is the end the second-strongest moment?
- Is nothing exaggerated beyond the text?

## 8. Hard-won lessons (do not repeat)

1. A deliberate silence reads as a playback fault. Use a dip.
2. Stitched sentence fragments sound like "stuck words". Use one take per sentence.
3. Repeated shots and flash inserts read as the video restarting. Keep the edit linear.
4. Ducking music only 8–10 dB and lifting the bed between words buries the voice. The voice must be 15 dB clear.
5. A per-line gain applied to the whole mix makes holes in the bed. Apply it to the voice only.
6. Black-silhouette characters read as a rendering error.
7. Save intermediates in the repository tree, not in the scratchpad. The container has restarted three times.
8. A render needs about 11 GB of free disk. Clear stale `.frames-ep*` folders first.
9. Report honestly. Nobody can listen inside the container, so every sound claim is a measurement until the owner hears it. Say
   which statements are measured and which are assumed.

## 9. Current state (2026-11-14)

- **Finished share videos:**
  - episodes 00–49 (41–49 with the old voice and the old credit line);
  - episode 51 (old voice);
  - episodes 50 and 52–55 (new voice and loop; the remix for voice clarity is being re-attached now);
  - the trailer, 89.4 s, approved by the owner, with the end card carrying the source line only.
- **Not started:** episodes 56–60 are scripted and drawn but not voiced or rendered. The owner said to stop after five episodes.
- **Open owner decisions:**
  - the narration voice: keep Chatterbox, try ElevenLabs Creator at $22 a month (about $88–99 covers 100 episodes with retakes), or
    the owner's own voice;
  - whether women's and quoted lines get a second voice (currently one male voice reads everything);
  - whether to remix the trailer for voice clarity;
  - whether to redo 41–49 and 51 to match;
  - channel handle, launch date, and whether to build an analytics tool.
- **Weak points:**
  - Sanskrit names misheard by the recogniser: Kanva, Menaka, Puru, Draupadi, Dvaipayana, Bhima, Karna.
  - Episode 52 is a catalogue-style episode.
  - Five lines in 50 and 52 were reworded to avoid repeated phrases and have not been re-read against the CE.

## 10. How to check the work

- **Read** the README standing rules, `tools/episode_loop.md`, and the last entries in `REVIEW_LOG.md`.
- **For any episode N, from `mahabharatam/`:**
  - Gate (prints every measure and every FAIL):

        node tools/gate.mjs --ep N --audio

  - Re-runs the checks on the finished files and writes `lab/review/epNN/`:

        CHECK_ONLY=1 bash tools/finish.sh N

  - Voice clarity:

        python3 lab/review/vob.py audio/epNN/mix.en.wav audio/epNN/voice-stem.en.wav

  - Freezes:

        ffmpeg -i episodeNN-share.mp4 -vf freezedetect=n=0.003:d=0.3 -map 0:v -f null -

- **Look at** `lab/review/epNN/post-contact.jpg` and the cut sheets, and play the share mp4 with sound.
- **Check fidelity:** compare each line with the verse references in `script/ARC-51-60.md` and the GRETIL texts in `lab/ce/`.
- **Check the old episodes are unaffected:** gate output for episodes 44, 48, 49 and 51 must be byte-identical to the baseline in
  `lab/review/gate-proof/`.

## 11. Working rules for an agent

- **Git:**
  - Commit and push only on `claude/motion-graphics-showreel-v8vvuo`. Commit code separately from videos, one commit per accepted
    video.
  - Commit messages end with the Co-Authored-By and Claude-Session lines the session gives.
  - Never put model names in the repository.
- **Privacy and spending:** keep credentials and the owner's personal details out of the repository and away from external
  services. Spend no paid credits without approval.
- **Changes:** edits to shared tools are additive, behind a script-level flag, so older episodes gate and mix exactly as before.
  Prove it with byte-identical gate output.
- **When finishing a task:** report what was measured, what was looked at, what was assumed, and what nobody has heard.
