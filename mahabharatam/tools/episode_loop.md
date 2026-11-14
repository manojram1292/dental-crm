# The episode loop ("rules": 2)

One episode, start to finish, cheapest checks first, so that the full render happens ONCE. Built from what the trailer cost
(four rounds of rework; README "Standing rules learned from the trailer"). Used first for episodes 50 and 52–55.

Run everything from `mahabharatam/`. `N` is the episode number, `NN` its two digits. `PYV=lab/voicelab/venv/bin/python`.
One heavy job at a time (voice generation, a frame pass, a render). Intermediates live in `lab/review/epNN/` (the scratchpad does
not survive a container restart).

## 0 · Put the script under the rules (once)

    python3 -I tools/rules2.py --ep N

Sets `"rules": 2`, `"credits": "source-only"`, `timing.frameSnap`, removes `strings.madeLine`. Episodes without `"rules": 2`
(00–49, 51) gate, mix and score exactly as before.

## 1 · Script check (free)

    node tools/gate.mjs --ep N

Fix every FAIL that is not about the voice (hook ≤ 8 words, turn 40–60 %, names, loop, palettes, camera, signature, no three-word
phrase twice, no picture under 1.3 s, no jcut/lcut, credits). A line may only be reworded inside what the arc document's verse
check verified (`script/ARC-*.md`); note the change in REVIEW_LOG.md.

## 2 · Voice (the slow step: about 20 s a take, 5 takes a line, 20 minutes an episode)

    $PYV tools/voice2.py jobs --ep N          # prints what the model will be given; names come from voice/names.json
    $PYV tools/voice2.py gen --ep N           # takes → lab/review/epNN/voice/takes
    $PYV tools/voice2.py select --ep N        # → voice/epNN/en/*.wav + side-cars, select.json; updates voice/names.json

Read the printout: every line's `heard` text, `err` (recogniser errors of the chosen take: want 0), pitch in semitones from the
film's median (must be within ±2), and the WEAK NAMES line. Fix here, not after the render:

- a weak name: `jobs --ep N --alt "Name=Spelling"` (only the lines carrying it get new takes), `gen`, `select`. The best spelling is
  kept in `voice/names.json` and reused by every later episode. `$PYV tools/voice2.py names` prints the record.
- a line with errors, or one outside the pitch window: `jobs --ep N --only id,id` (five more takes), `gen`, `select`.
- length: `node tools/timeline.mjs --ep N` prints the duration. Outside 54–58 s: change `pre` / `post` first (never under 220 / 260
  ms; the rests stay ≥ 800 ms), then trim or tighten a line inside what the verse check allows. Never time-stretch.

## 3 · Mix, and the audio gate on the wav alone

    python3 -I tools/score.py --ep N && python3 -I tools/mix.py --ep N
    node tools/gate.mjs --ep N --audio

The mix prints the floor (worst 100 ms window, falls), the rests as dips, the Next band, the first 100 ms and the least
word-to-cut margin. The gate must show no FAIL except picture rules. Fix here (a word nearer than 150 ms to its cut: raise that
line's `post`; a gap inside a sentence: other takes).

## 4 · Preview stills and the VIEWER PASS (no render)

    node tools/stills.mjs --ep N
    node tools/gate.mjs --ep N --frames --audio      # also the 30 fps freeze pass, captions after cuts, no picture twice

Open every `lab/review/epNN/pre-*.jpg`. Judge as someone who has never read the epic, on a phone, thumb ready:

- First 2 seconds (`pre-open.jpg`): something moving and a reason to stay? Do you know what you are looking at?
- One idea at a time: one subject, one caption, at most one new name; nothing competing with the speaker.
- Eyes follow faces and motion: is what the narrator speaks of the thing that moves or is lit? A face under a caption or plaque?
- Continuity (`pre-cuts-*.jpg`): does each cut follow from the last picture? Anything that pops, jumps, flashes or repeats? Anything
  that LOOKS like a mistake IS one (the trailer's deliberate silences and flash inserts were all read as faults).
- Feeling: where is the peak; do picture, voice and music rise there together? Is the end the second-strongest moment?
- Trust: nothing beyond the text; restraint on violence and on Draupadi / Shakuntala / Satyavati scenes.
- Review rules no gate can check: no black-silhouette principal character (colour, face in shadow or turned away); a plaque arrives
  with its box and text together, never under the caption band or on a face (`node tools/facehits.mjs --ep N`).

Write three or four lines (hook / turn / end, and what was changed) for REVIEW_LOG.md. Fix the scenes here and repeat this step.

## 5 · Full gate → render once

    df -h . ; free -g                               # ≥ 11 GB disk, ≥ 4 GB memory (render.mjs refuses otherwise)
    node tools/render.mjs --ep N --workers 2        # runs score, mix and the full gate itself; refuses on any FAIL

## 6 · Verify the mp4

    tools/finish.sh N

Makes `episodeNN-share.mp4` and prints one block: freezes over 0.3 s (master and share), the sound floor and falls measured on the
share file, the recogniser's reading of the final mix against the script, clicks at clip boundaries, loudness, SSIM. Then OPEN
`lab/review/epNN/post-pass-*.jpg`, `post-cuts-*.jpg` and `post-contact.jpg` and look at all of them.
Then: `python3 -I tools/scorecard.py --ep N` (the row for QUALITY_SCORECARD.md), REVIEW_LOG.md entry, catalog status.

## 7 · Only if step 6 finds a real fault: redraw the shot and splice

Never a full re-render for one shot. For a shot from `a` to `b` seconds (cut times, on the frame grid):

    node tools/render.mjs --ep N --workers 2 --video-only --from A --to B --out lab/review/epNN/seg.mp4
    # A = a keyframe of the master at or before a (ffprobe … key_frame), B = the next keyframe at or after b
    ffmpeg -i episodeNN.mp4 -an -c copy -frames:v <A·30> head.mp4 ; … tail from frame <B·30> ; concat (demuxer, -c copy) ; mux the
    # master's audio back with -c copy ; framemd5 before and after: only frames A·30 … B·30−1 may differ

(the trailer's end card was replaced this way: `lab/review/trailer/v32/`). A sound-only fault: `tools/remux.sh N` (score and mix again, the audio
gate, the new mix into the master and the share copy with the video stream COPIED and its md5 compared, then the checks of step 6).

## What the loop does not check

Nobody listens. Every statement about the voice and the mix is a measurement (pitch, recogniser, levels). Pronunciation of
Sanskrit names is judged only by how nearly an English recogniser writes them.
