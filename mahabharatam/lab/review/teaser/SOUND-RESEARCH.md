# War teaser · sound research and decisions

For the war teaser (pipeline 96). The owner said: "I'm not convinced by the sound. Research what sound this tone needs, find open libraries for producing sound on that logic, and add it."

Researched on 2026-11-16 with web search. The research sources are mostly practitioners' articles and vendor blogs, not standards. I say so where it matters.

**What nobody has done:** nobody has listened to the result. Every statement below about how the teaser sounds is a design intention or a measurement, not a judgement by ear.

## 1. What makes a modern epic teaser sound impactful

### Tension and release
- **The pattern:** the basic trailer structure is a riser that builds, then a hit on the downbeat. The riser's peak lands exactly on the impact (Violet Recording).
- **Layering:** trailer sounds are stacked from several sources (Ableton). A common recipe is a pitched riser plus a noise riser, then a braam or impact (Violet Recording).
- **The low end:** a sub drop sits under each major hit, and the low end of the braam and the heaviest hits is kept apart so it does not pile up (Violet Recording; Morphic). "Louder" is not the same as "bigger" (Krotos).

### Silence before the hit, done as a dip
- **What practitioners say:** a sudden drop to near-silence before a hit makes the hit feel larger by contrast (Violet Recording).
- **Our rule:** this project's owner heard real silences as playback faults. So the "silence" here is a **dip**: the bed falls 3.5 dB and a reverse swell rises, and nothing stops.
- **Where:** before the conch (the turn), and under the reverse swell before the peak.

### The Shepard tone
- **What it is:** octave-spaced tones that seem to rise for ever (Wikipedia; StudioBinder; PremiumBeat).
- **Where it is known from:** Nolan and Zimmer used it in *The Prestige*, *The Dark Knight* and *Dunkirk*.
- **Why it suits a teaser:** it signals that things "can still get worse" (PremiumBeat).
- **Used here:** a Shepard–Risset riser runs under the rest into the conch.

### Whoosh and hit
- **Grammar:** the whoosh is the build-up and the hit is the payoff (FilmLifestyle).
- **Used here:**
  - arrows whoosh past the camera, panned across the stereo field with a Doppler fall;
  - a rush runs under each volley;
  - a whoosh plays as the chariot passes.

## 2. What fits an Indian epic

The search found good material on the instruments, but little on how mythological films actually score with them. This part is therefore partly my own design reasoning, labelled as such.

### The instruments, and what the sources say
- **Tanpura:** the drone that holds the raga's tonic and fifth, rather than a melody (Orchestral Tools, *Svara*).
  - Used here: the tanpura drone (D, with A) runs from the first frame to the last. It is the "no dead air" bed, in the idiom.
- **Shankha (conch):** blown in ritual. The sources link its sound with Om and with purifying a space (Carved Culture; Pratha).
  - The text itself makes the conch the sound of the war's start (6.23.12–19). It is the one instrument the verses give us.
- **Drums (dhol, nagara, dundubhi; damaru):** the dhol is the staple of Hindi film rhythm (Mr. & Mrs. 55). The dundubhi and the damaru are the mythic drums (Carved Culture).
  - My own reasoning: a modern trailer's "war drums" are usually taiko ensembles. A taiko-like low membrane under dhol strokes (the bass dagga and the treble tilli crack) and damaru-like rolls gives the trailer weight in an Indian voice.
- **Bansuri, shehnai, veena; choir:** genre-palette references pair them with orchestral strings and big drums (an AI-music prompt page: a sketch of the genre's palette, not evidence).
  - Used here: the bansuri, the veena and a wordless choir ("aa", "oo"). A shehnai was not built.
- **Temple bells:** used here on each name plaque, on "Time", and on the end.

### The motif
- **What it is:** the series' own four notes, Sa Pa komal-Dha Pa (D A B-flat A), from the approved trailer. komal-Dha gives the Bhairavi/Phrygian darkness.
- **How it is used:** it is the "recognisable motif".
  - It changes colour per introduction: horn, veena, bansuri.
  - It plays in octaves (low horn plus bansuri) at the peak.
  - It resolves only on the end card's struck D.
- **Its origin:** our own synth. Nothing is copied from any film or serial.

## 3. Loudness and mixing for short-form with voice-over

### Loudness targets
- **The consensus:** −14 LUFS integrated for YouTube, Instagram Reels and TikTok, with a true peak at or below −1 dBTP. A platform's re-encoder adds overs to files that peak near 0 (Pixteller; Descript; Joseph Nilo).
- **One dissent:** some sources prefer −16 for dialogue-led content.
- **Ours:** −14 LUFS and −1.5 dBTP on the mp4. The limiter ceiling is −2.5, leaving headroom for AAC.

### Music under the voice
- **What one practitioner blog suggests:** music 18–24 dB under the voice for narration, within a range of 15–30 dB (Overseer). This is a starting point, not a standard.
- **The project's own rule** (README, standing rule 5; `tools/mix.py` RULES2): the voice stands a median 15 dB over everything else, with the 10th percentile at least 8 dB.
  - The duck is held over each whole line: music 17 dB, ambience 11 dB, foley 12 dB.
  - The bed is carved 5 dB around 2.5 kHz while the voice speaks.
  - This rule came after the owner rejected a mix where the music masked the voice.
  - The teaser is mixed by exactly that code: the script flag `"teaser": 1` sends it to `main_rules2`.

### Consequence for the design
The war drums, braams and hits live in the music stem, and are ducked 17 dB under every line. So the impacts are placed **on the cuts and in the air between lines**:
- the pre-line pre-roll;
- the motif answering after each introduction;
- the conch before "The conches sound";
- the peak's sub drop on the cut.

The voice and the hits take turns, the way a trailer cuts VO against hits.

## 4. Libraries evaluated

| library | licence | commercially usable for our output? | status here | decision |
|---|---|---|---|---|
| **Spotify pedalboard** 0.9.26 | GPL-3.0 (bundles JUCE, GPL-3.0 or commercial; Rubber Band, GPL-2+ or commercial; VST3 SDK, GPL-3.0), per its PyPI page | yes: GPL governs the software if it is distributed. Audio rendered with it is not a derivative work of the library, and nothing of pedalboard ships in the film. The pitch shifter (Rubber Band) is not used. | installed from PyPI into the system Python (`pip install pedalboard`) | **used**: compressor, high-pass on the stems |
| **numpy / scipy** | BSD-3-Clause | yes | already installed | **used**: every instrument is a numpy/scipy recipe (below), plus FFT convolution with the measured rooms |
| **pyo** | LGPL-3.0 | yes | not installed | not needed: it duplicates what numpy/scipy and pedalboard did here |
| **Csound** | LGPL-2.1 | yes | not installed (system package) | not tried |
| **SuperCollider** | GPL-3.0 | yes (as for pedalboard) | not installed (system package) | not tried |
| **pyarrow** | Apache-2.0 | yes | installed from PyPI | used only to unpack the IR dataset (below) |

### Synthesis recipes used (all in `tools/score_teaser.py`)
- **Membrane drums** (taiko-like, the dhol's dagga and tilli): modal partials at circular-membrane Bessel ratios (1, 1.59, 2.14, 2.30, 2.65, 2.92, 3.16), with a pitch drop and a noise slap.
- **Damaru-like rolls:** fast tilli strokes rising.
- **Karplus–Strong strings:** a veena-like pluck, and the tanpura with a jawari-like bridge buzz.
- **Temple bell:** modal synthesis (hum, prime, tierce, quint, nominal and upper partials, each with its own decay).
- **Shankha:** a band-limited pulse through two shell formants (about 0.9 and 2.4 kHz), with breath noise, a pitch swell and waver.
- **Braam:** detuned saws on D1/D2 through an opening low-pass, then saturation and a sub.
- **Sub drop:** an exponential sine sweep, 110 → 26 Hz.
- **Choir:** formant synthesis (saw "glottal" pulses with vibrato and jitter, through three vowel formants).
- **Bansuri:** a sine plus soft harmonics, breath noise and growing vibrato.
- **Shepard–Risset riser.**
- **Arrows:** a narrow whistle with a Doppler fall, and a breath rush panned across.
- **Hooves:** a three-beat gallop for four horses.
- **Wheels:** a brown-noise rumble with creaks.
- **The hosts' murmur:** band-noise voices with syllabic swells and metal clinks.
- **Wind.**

## 5. Impulse responses (real rooms)

| source | licence | reachable from this container? | used |
|---|---|---|---|
| **MIT IR Survey** (Traer & McDermott, PNAS 2016, doi:10.1073/pnas.1612524113) via the Hugging Face mirror `benjamin-paine/mit-impulse-response-survey` | **CC-BY 4.0** (stated in the dataset card; the lab's page says the same) | yes: huggingface.co is reachable. The lab's own host (mcdermottlab.mit.edu) is **blocked** by the network policy. | **yes**, six IRs (below) |
| OpenAIR (University of York) | per item, mostly CC-BY 4.0 | **blocked** (the proxy answers 403) | no |
| EchoThief | its own licence (not checked further) | not tried | no |

**Attribution** (CC-BY 4.0 requires it, and it belongs in the published description): "Reverberation: impulse responses from the MIT Acoustical Reverberation Scene Statistics Survey, J. Traer and J. H. McDermott, PNAS 113(48), 2016, CC-BY 4.0."

The files are in `lab/review/teaser/ir/`; `irs.json` gives the source and an estimated decay for each. The extractor is `lab/review/teaser/tools/ir_extract.py` (the 16 MB parquet was deleted after extraction; it is regenerable).

| IR | where it is used |
|---|---|
| `041_TrainStation_SouthStationBoston.wav` (decay about 3.2 s) | the peak (choir, horn, bansuri, bells) and the end card's resolve: the "temple hall" |
| `256_Stairwell.wav` (about 1.4 s) | the drum engine's room |
| `133_SubwayStation_ParkStreetBoston.wav` (about 1.4 s) | a light common room on the whole score (12 % wet) |
| `235_Outside_Field.wav` | the field's foley (conches, arrows, hooves): an outdoor slap |
| `080_Outdoor_GrassyField.wav`, `139_Outside_StreetsOfBoston.wav` | kept as alternatives; not used |

## 6. Sample libraries (CC0)

| host | result |
|---|---|
| freesound.org | **blocked** (no connection), and needs a login to download in any case |
| opengameart.org | **blocked** |
| archive.org | **blocked** |
| sonniss.com (GDC bundles) | **blocked**; its licence is royalty-free, not CC0 or CC-BY |

So **no samples were used**. Everything is synthesised (section 4), and the rooms are real (section 5).

## 7. Decisions, as built (`tools/score_teaser.py`)

| moment | what plays |
|---|---|
| **frame 0** | a sub hit, a taiko and a dhol stroke, the conch, and a soft braam under the name. The tanpura and a low D–A string drone start here and never stop. |
| **the cause** | a heartbeat drum at 60; a choir "oo" swell under "One throne"; a dark braam and a bell on the refusal |
| **the field** | the hosts' murmur and wind come in; a great taiko on the cut; the motif on a low horn |
| **the seven introductions** | on each cut, a soft low hit and a quiet braam; a temple bell as the plaque lands; the pulse rising 66 → 72 → 80; the motif answering after each line in a new colour. Hooves and wheels under Krishna; a creak under Drona's chariots; a dhol under Bhima. |
| **the rest** (before the turn) | the bed dips 3.5 dB (in `tools/mix.py`); a Shepard riser and a reverse swell climb into the conch |
| **the run** | Bhishma's conch (on the left), then two more for the other side (centre, right); a braam and a sub hit on the turn; the drum engine at 120 → 132 bpm, adding layers bar by bar (taiko on 1 and 3, dagga on the off-beats, tilli in eighths, then sixteenths); rolls and braams into the cuts; ten arrow passes in stereo; hooves, wheels and a passing whoosh under the chariot; the bow's fall on the floor |
| **the peak** | a reverse swell, then **a SUB DROP on the cut** (110 → 26 Hz), a struck braam, a choir on D (aa), the motif in octaves, drums on the beat, bells on "Time", a low conch, all in the hall |
| **after** | a veena motif, a bansuri; the fire's crackle |
| **the end** | **one struck resolve on D**: taiko, a bell, low strings, the conch and a sub, ringing under the card to the last frame |

## Sources
- Violet Recording, "Sound Design for Trailers": https://violetrecording.com/sound-design-for-trailers/
- Ableton, "Learn How to Make High-Impact Sounds for Movies and Trailers": https://www.ableton.com/en/blog/learn-how-to-make-high-impact-sounds-for-movies-and-trailers/
- Krotos, "5 Tips for Designing Trailer Sound Effects": https://www.krotosaudio.com/?p=152539
- Morphic, cinematic sound effects (vendor page): https://morphic.com/resources/sounds/cinematic-sound-effects
- FilmLifestyle (whoosh and hit; Shepard tone): https://filmlifestyle.com/what-is-the-shepard-tone/
- Shepard tone: https://en.wikipedia.org/wiki/Shepard_tone · https://www.studiobinder.com/blog/shepard-tone-illusion/ · https://www.premiumbeat.com/blog/shepard-tone-sound-design-filmmaking · https://www.motionpictures.org/2017/08/brilliant-sound-technique-makes-dunkirk-so-viscerally-intense/
- Orchestral Tools, *Svara* (tanpura, Indian film palette): https://www.orchestraltools.com/magazine/behind-the-scenes/svara-ajit-interview
- Carved Culture, instruments in Indian mythology: https://www.carvedculture.com/blogs/articles/famous-musical-instruments-in-indian-mythology
- Mr. & Mrs. 55, instruments of Bollywood film music (dhol, shankh): https://mrandmrs55.com/2015/06/27/a-guide-to-the-instruments-of-old-bollywood-film-music-from-hindustani-to-western-and-everything-in-between/
- Pixteller, audio finishing checklist (−14 LUFS, −1 dBTP): https://pixteller.com/blog/the-audio-finishing-checklist-every-social-media-creator-needs-649
- Descript, audio levels for video: https://www.descript.com/blog/article/how-to-set-the-perfect-audio-levels-for-video
- Joseph Nilo, dialogue loudness: https://josephnilo.com/blog/dialogue-loudness-lufs-true-peak-video/
- Overseer, background music under voice-over (18–24 dB): https://www.overseeros.com/blog/background-music-volume-under-voiceover
- pedalboard on PyPI (licence): https://pypi.org/project/pedalboard
- MIT IR Survey: https://mcdermottlab.mit.edu/Reverb/IR_Survey.html · Hugging Face mirror (CC-BY 4.0): https://huggingface.co/datasets/benjamin-paine/mit-impulse-response-survey
- OpenAIR (licences per item): https://www.openair.hosted.york.ac.uk/?page_id=2

## Measured (the mix wav, `audio/ep96/mix.en.json`; the mp4 numbers are in REVIEW_LOG.md)

| measure | value | rule |
|---|---|---|
| integrated loudness | −14.15 LUFS | about −14 |
| true peak (wav) | −3.14 dBTP (mp4: master −2.8, share −3.0) | ≤ −1.5 on the mp4 (the limiter ceiling is −2.5) |
| loudness range | 5.1 LU | ≥ 4 |
| voice over everything else, median | 15.5 dB on the wav; 15.0 on the share mp4 | ≥ 15 |
| voice over everything else, 10th percentile | 9.0 dB on the wav; 8.9 on the share mp4 | ≥ 8 |
| music under the voice | −20.7 dB | |
| floor between lines | worst 100 ms window −29.8 dBFS; 0 windows under −34 (inside lines, the pauses between sentences fall to about −44 dBFS) | none under −34 |
| falls | worst 11.0 dB in 0.3 s; 0 over 12 | none over 12 |
| silences ≥ 0.6 s at −45 dB | 0 | none |
| first 100 ms | −12.3 dBFS (the opening hits start 40 ms in: on sample 0 they overshot to +3.8 dBFS in the AAC share copy) | sound from frame 0 |
| the two rests (dips) | before the conch 1.18 s, quietest −17.5 dBFS; before the promise 1.46 s, quietest −22.2 dBFS | dips, never silence |

**How the clarity was reached.** The first mix measured a median of 16.0 dB but an LRA of only 2. Giving the build its range (quieter
introductions, a louder run, set by the lines' `mixDb`) dropped the voice to 14.8 / 7.7. Per line, the run and the peak were the weak lines
(about 11–12 dB): the drums, the braams' low end and the arrows sat under the words. The score now steps the drum engine, the hall and
the foley back 7–8 dB under each spoken line of the run, peak and card, high-passes the music at 160 Hz under the words (the sub and the
braams hit in the gaps), and compresses and limits the music stem so the hits do not force the master limiter down
(`lab/review/teaser/tools/vob_lines.py` prints the per-line numbers).

Nobody has listened to this mix. Every number above is a measurement.
