# LESSONS: everything learned on "Mahabharatam — As Vyasa Told It"

Companion to `HANDOFF.md`. Each lesson says what happened and why the fix works. "Owner" = the person this series is for.

---

## 1. The owner: likes, dislikes, expectations, how to talk to them

**How to talk to them**
- Plain, short English. They often dictate by voice, so messages have transcription slips ("try post" = TryPost, "beer" =
  cover/thumbnail, "neural beats" = binaural beats, "$100 episodes" = 100 episodes). Read for intent; don't ask about the slips.
- Answer questions while background work keeps running; they asked for parallel work.
- Give honest status: what was measured, what was looked at, what nobody has heard yet. Never claim something sounds good;
  nobody in the cloud could listen.
- **Talk before building** anything large or any change of direction ("Just talk to me before creating"). Present a plan with a
  recommendation, then wait.
- Give costs with a breakdown when money is involved.
- Don't waste effort: "we are wasting things… make sure lessons learned". They want a closed loop with no rework and a minimum of tokens.
- They review on a phone; they react as a viewer, not an engineer.

**Likes (approved)**
- Trailer v3.2: music-then-title opening, the Vishvarupa scene from CE 6.33, the divine "I am Time" treatment, the end card with
  "follow / support / Episode 1" ("Everything is good").
- Red paper-cut / sanjhi sample (approved 2026-11-21).
- Depth and faithfulness: "a promise that we go everything in deep"; "verse by verse… what the scholars read" (worded truthfully
  as "From the Critical Edition, the text scholars read. Nothing added for effect.").
- Thinking like Christopher Nolan about edit grammar: push-ins at decisions, scale reveals, withholding, attention peaks.
- Stylised code-rendered 3D for war scenes (the "dragon kind of style"), with characters still drawn.

**Dislikes (each was a real complaint)**
- Stuck parts / freezes (trailer v1, 71–80 s).
- Words "getting stuck" and the video "stucks and starts again" (stitched voice fragments; repeated/flash inserts).
- Silences heard as "a cut" / "a lag" (trailer v3 at 36 s and 64 s).
- Episode 50 "very noisy… audios are not properly hearable" (voice buried).
- "Voices: synthetic · Drawn in code" on the end card: "overkilling, don't provide those informations".
- The last teaser felt "running": character introductions too fast.
- The trailer music: "that is too much"; wants **more classical**.

**Expectations / preferences**
- Episodes 54–58 s; teaser ≈ 1 minute; trailer may run longer (89 s accepted).
- Slow, clear character introductions (3–4 s each: name, one line of who they are, the verse).
- Voice clearly audible and "appealing", capable of epic weight.
- More graphics, more engagement, improve with every video.
- A proper thumbnail/cover for posts.
- Everything reviewed by them before posting.

## 2. Lessons and mistakes to avoid (with why)

1. **No deliberate silence.** Viewers on phones read silence as a playback fault. Use a 3.5 dB dip with the drone running.
2. **One take per sentence.** Stitching sentence fragments from different takes sounds like stuck words (pitch and room jump).
3. **Linear edit.** Repeated shots and flash inserts read as the video restarting. Never repeat a picture or a three-word phrase.
4. **Voice ≥ 15 dB over the bed** (median, 10th percentile ≥ 8 dB), measured per 100 ms over real speech windows. The first rule
   (duck 8–10 dB, lift the bed between words) buried the voice in ep 50.
5. **Hold the duck over the whole line** (30 ms before the first word to the last word, 0.12 s release). Per-word ducking pumps.
6. **Per-line gain moves the voice only.** Applying it to the whole mix punched holes in the bed.
7. **Carve the bed 5 dB at 2.5 kHz while the voice speaks.** That is where consonants live; the recogniser and the ear both improve.
8. **Measure locally, not globally.** A global voice-vs-bed projection said "fine" while the voice was buried; the per-window fit
   (`lab/review/vob.py`) matches what the owner heard.
9. **No freeze over 0.3 s.** Even an intended hold reads as a stuck video; keep something moving (particles, breath, light).
10. **Captions must be gone by the cut.** A caption carried over a cut looks like a ghost.
11. **No black-silhouette principal characters.** They read as a rendering error. Colour them; keep a face in shadow if needed.
12. **Text never on a face; plaques never under captions; box and text arrive together.**
13. **A word must end ≥ 150 ms before its picture cut**, or the cut clips the word.
14. **Sound from frame 0**, and something moving by 0.5 s: the swipe decision happens in the first second.
15. **Hook ≤ 8 words spoken by 3 s; turn at 40–60 %; ≤ 2.6 words/s; ≤ 2 new names per 10 s.**
16. **Fix after render only by splice** (redraw a shot, splice at master keyframes, framemd5 proves the rest is identical) or by a
    sound-only remux with the video stream copied (md5 checked). A full re-render for one shot wastes hours.
17. **`remux.sh` must abort if the gate fails.** It once replaced the mp4s although the gate had failed.
18. **Intermediates live in the repository tree**, not the scratchpad: the cloud container restarted four times and wiped `/tmp`.
19. **One heavy job at a time.** A render was killed by running out of memory. The render refuses below 4 GB RAM / 11 GB disk.
20. **Tool changes are additive behind a script flag** (`"rules": 2`, `"teaser": 1`, `"papercut": 1`) and proven harmless with
    byte-identical gate output for old episodes (44, 48, 49, 96, 97).
21. **Never claim more than the text.** Popular details absent from the CE (Gandhari striking her womb with an iron bar, the donkey
    bray, blood rain, Krishna's role in the cloth scene) are left out or tagged "As tradition tells it".
22. **The promise must be literally true.** "Every episode cites its verses" was dropped because episodes 01–40 show no source
    line. "Verse by verse" / "complete" are false because the series condenses.
23. **Sanskrit names**: the TTS is English. Store, per name, the spelling the recogniser hears best (`voice/names.json`) and reuse
    it. Still weak: Kanva, Menaka, Puru, Draupadi, Dvaipayana, Bhima, Karna, Kurukshetra ("Kool lu keshitra"), Duhshala ("to charlotte").
24. **Report honestly.** Every sound statement from the cloud was a measurement; say "nobody has heard it".
25. **Disk**: a render needs ~11 GB; clear `.frames-ep*` and `lab/review/*/seg/` first; never delete venvs, voice, audio or committed files.
26. **Playwright browser mismatch** (cloud only): Playwright 1.65 wanted headless build 1255; only 1243 was installed, so a symlink
    was made. On the Mac, `npx playwright install chromium` avoids this.
27. **Software WebGL is slow** (cloud, no GPU): 3D frames took 1–1.3 s, 5.6 s with 8 motion-blur sub-frames. Render in segments,
    join without re-encoding, mux the gate-passed mix once.
28. **Three.js black frames**: clamp rim terms; single-sample HalfFloat targets + SMAA; assign render-target textures after
    ShaderPass construction (photoreal-cg skill §9).

## 3. Techniques and tricks that worked (and why)

- **Canvas as a pure function of time** → any frame renders deterministically; segments and splices are bit-exact.
- **Timeline from voiced line lengths** → picture always fits the voice; cuts snap to the 30 fps grid.
- **Edit grammar** (from the trailer): slow push-in on a face at a decision; pull-back to reveal scale at a consequence; hard cut
  2–3 frames after impact; match cuts on shape/position; sound leads picture by 4–8 frames; shots shorten toward the climax with one
  long hold on the signature shot; withhold (Krishna's lit face kept until Vishvarupa).
- **Viewer pass on 0.25 s preview stills before rendering** (questions in the skill) → catches stick figures, red-on-red blobs,
  hands crossing faces, overlapping peacocks, before an expensive render.
- **"I am Time"**: octave-down double with formants kept, a wide double, 3.5 s temple-hall reverb, bell, conch, swell.
- **Binaural pair** 98/105 Hz ≈ 18 dB under the voice under Vishvarupa, mono-safe.
- **Hybrid 3D** (teaser): Three.js toon-shaded terrain, 15,000 soldier cards, chariots with turning wheels, up to 780 arrows with
  trails, conch shockwave rings, divine light; drawn characters placed by the 3D camera's projection; haze mix + DOF + dust over the
  joins + the series grain tie them together. 8 motion-blur sub-frames (skill says 10) to save time.
- **Paper-cut**: inset yin contour on every piece, hand-cut wobble edges with light/dark cut rims, tight paper shadows, no floating
  islands, 12 fps stepped characters (hold 2–3 frames at 30 fps), fold–cut–unfold on a strong beat, backlit pots, page-peel transitions.
- **Real rooms**: six MIT impulse responses (CC-BY) give real space to synthesised instruments.
- **Score grammar** (teaser): risers into hits, braams with sub drops kept apart, Shepard riser, whoosh-then-hit, silence replaced
  by a dip + reverse swell; tanpura from frame 0; conch (the one instrument the verses give); the series motif D–A–B♭–A recoloured
  per introduction and resolved on one struck D at the end card. (The owner now finds this too much for the trailer; see §6.)

## 4. Prompts and settings that gave the best results

**Voice (Chatterbox ONNX, `tools/voice2.py`)**
- Reference: `lab/review/trailer/v3/voice/ref_daniel.wav` = Kokoro `bm_daniel` reading a calm storyteller passage at **0.8 speed**.
- Per take: `exaggeration 0.5` (0.55 for quoted speech), `temperature 0.7`, 5 seeds per line, language model 4-bit (`language_model_q4`).
- Selection: recogniser errors (faster-whisper `base.en`, int8, CPU) first, pitch within ±2 semitones of the film median, 120–250 ms
  of air after the last word, pace weight 40 (prefers the slower of equal takes; the voice reads ≈ 3 words/s, the gate allows 2.6
  including pauses). No stretch > 4 %.
- `pre`/`post` padding never under 220/260 ms; rests ≥ 800 ms.

**Mix (RULES2 in `tools/mix.py`)**
```
duck: music 17 dB, ambience 11 dB, foley 12 dB; release 0.12 s; rest dip 3.5 dB; next band 6 dB under
floor −34 dBFS, max drop 12 dB in 0.3 s (between lines only; speech spans exempt)
carve 5 dB @ 2.5 kHz Q 0.8 under the voice; bed lift ≤ 18 dB in gaps, never under the voice
voice over bed: median ≥ 15 dB, p10 ≥ 8 dB; −14 LUFS; limiter ceiling −2.5 dBTP; LRA ≥ 4
```

**Share encode**: `-crf 23 -maxrate 2500k`, a keyframe on every cut, `+faststart` → < 20 MB per minute, SSIM ≥ 0.97 to master.

**AI video (from the photoreal-cg skill; owner's tools, used on the Mac only)**
- Google Flow, Omni Flash 1.2, video-to-video: upload a hard 3–5 s excerpt; 360p gate first (identity, limbs, overlaps, camera must
  not change), then 720p. Result log in the skill. Watch for invented elements (it added lightning).
- ChatGPT image generation for plates: "repaint this 3D layout photoreal, keep every element exactly in place".
- Neither has been used on this series yet.

**Music**: all synthesised (numpy/scipy physical models + pedalboard compressor/limiter/high-pass + MIT rooms). No samples used
(sample sites were blocked in the cloud).

**Motion**: pose blends with anticipation and follow-through (never a pose switch); camera vocabulary `KIT.cam.push / pull / tilt /
slide / orbit / rack / crane`; transitions born from the medium (ink, brush, lamp, smoke; peel/turn for paper-cut).

## 5. Decisions made, and why

| Decision | Why |
|---|---|
| Follow the BORI Critical Edition | The series' promise: what scholars read; later additions are tagged. |
| Code-drawn picture, no AI images in the films | Consistency, control, owner's choice of a temple-mural look. |
| Chatterbox (open source, CPU) for narration, one voice | Free; better than Kokoro; ElevenLabs offered ($22/month Creator ≈ $88–99 for 100 episodes with retakes), not chosen yet. |
| Credits = text source only | Owner: synthetic/drawn-in-code lines are overkill. |
| No full silences anywhere | Owner heard them as faults. |
| Voice-clarity mix (≥ 15 dB) | Owner: ep 50 not hearable. Applied to 50, 52–55, teaser, paper-cut; not yet to the trailer. |
| Stop after five new episodes (50, 52–55) | Owner's instruction. |
| Teaser as a separate film | Keeps the approved trailer untouched. |
| War scenes: stylised 3D, characters still drawn | Owner's direction; not photoreal. |
| Paper-cut adapted to Indian sanjhi | Culturally right (sanjhi temple stencils tell Krishna stories); approved. |
| Masters not committed | ~5 GB, regenerable; GitHub LFS free quota is 1 GB. |
| Posting only after explicit approval | Owner's rule. |

## 6. Open questions and ideas not yet tried

- **Classical trailer score** (proposed, not built): drop booms/risers/braams/sub drops. Tanpura drone throughout; one lead
  (sarangi recommended, or veena / bansuri); pakhawaj (dhrupad temple drum) instead of war drums; temple bells and conch only at
  the Gita and "I am Time". Form of a classical performance: **alap** (free, no pulse) for the family story → **jor** (gentle pulse)
  for dice and exile → **jhala** (fast, dense) for the war → back to one held note + drone for "I am Time" → quiet end card. Raga:
  **Darbari Kanada** (grave, royal; recommended) or Bhairavi (sorrow). Quieter overall so the voice sits ≥ 15 dB clear. Quality
  options: code-synth (melody will sound synthetic) / CC0–CC-BY real recordings from the Mac (recommended) / real musician.
- Thumbnail with ChatGPT; title spelling MAHABHARATA vs MAHABHARATAM; handle; launch date; TryPost connection.
- Second voice for women's and quoted lines; the owner's own voice; ElevenLabs.
- Redo 41–49 and 51 to the new voice/credit standard; episodes 56–60.
- Use paper-cut for inserts (genealogies, "one becomes many") or whole episodes; other lemo styles (engraving for verse plates and
  maps, isometric for army sizes as Isotype) untried.
- Flow video-to-video pass on a 3D war shot (360p gate first) to push realism; untried.
- Teaser weak spots: flat card horses, repeated soldier drawings, Vishvarupa as a flat drawing over 3D light.
- Paper-cut weak spots: pots read as shapes at phone size, small faces in wides, one boy figure stamped 100 times.
- `fonts/fonts.css` maps the normal style to `EBGaramond-Italic.woff2` and italic to `EBGaramond.woff2`. Possibly swapped; check
  before changing (old renders depend on it).
- Analytics tool after launch (adjust posting time from our own data after 2 weeks).
