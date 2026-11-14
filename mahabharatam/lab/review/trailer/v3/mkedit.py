"""Trailer v3 · writes script/TRAILER-EDIT.md from the built timeline (every shot: start, length, camera, sound, reason).
    python3 -I lab/review/trailer/v3/mkedit.py"""
import json, os
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..'))
tl = json.load(open(f'{ROOT}/build/timeline.ep97.en.json')); sc = json.load(open(f'{ROOT}/script/trailer.en.json')); SL = {l['id']: l for l in sc['lines']}
ld = lambda p, d=None: json.load(open(p)) if os.path.exists(p) else (d if d is not None else {})
score = ld(f'{ROOT}/audio/ep97/score-trailer.json'); mix = ld(f'{ROOT}/audio/ep97/mix.en.json'); sel = ld(f'{ROOT}/voice/ep97/en/select.json').get('summary', {})
P = {
 'title': ("CRANE down from above the spears to the red dawn", "a drum and the conch ON THE FIRST FRAME; the horn states the four-note motif; the clock starts (60)", "music and the name first; nothing spoken; the field is seen from above, once"),
 'vow': ("slow PUSH-IN on the prince's face as the hand goes up (lamp transition)", "a roll of drums into the cut; the motif on a veena; river", "a decision: push in. The story starts here and runs forward only"),
 'river': ("PULL-BACK from the basket to the wide river", "flute; a splash", "a consequence: pull back; the basket is the first round thing on the rhyme spot"),
 'cousins': ("RACK focus: Duryodhana, the five, the seat", "clock to 72; a staff on 'Five' and 'One'", "three short sentences, three planes"),
 'lac': ("TILT down from the burning house to the tunnel", "fire; a drum on the cut", "what was meant, then what happened"),
 'demon': ("ORBIT round the two; CUT three frames after the blow", "a growl; the blow two and a half frames before the cut", "the first impact cut"),
 'altar': ("CRANE up with her (smoke transition)", "the fire six frames before the picture; anklets; a bell", "a rise answers the blow"),
 'wheel': ("SLIDE with the wheel as it leaves his hand", "a whoosh; thunder after", "Krishna in colour, face in shadow: his face is kept for the universal form"),
 'dice1': ("PUSH-IN on Yudhishthira deciding", "the dice rattle six frames before the hall; clock to 90; the motif low and unfinished from here", "a decision: push in. From here hard cuts only"),
 'stakes': ("from above, TILT with the dice as they fall; inside the sentence, on the frame before 'his brothers', CUT to a SLIDE across the stakes", "the dice strike two and a half frames before the inside cut; a sweep on 'his wife'", "one sentence, one clip, two pictures: the voice does not stop for the cut"),
 'cloth1': ("ORBIT, close: the cloth hauled across the frame", "cloth, twice", "close on the act"),
 'cloth2': ("PULL-BACK to the hall of bowed heads; the cloth runs on", "cloth; the drone", "a consequence: pull back. No cause is shown"),
 'exile': ("SLIDE with six walking figures", "footsteps", "the one quiet walk before the refusal"),
 'needle': ("RACK from the envoy's back to the king; inside the sentence, on the frame before 'a needle-point', CUT to the close-up and PUSH IN", "a staff; a drum on the inside cut; a low horn rising a semitone and HELD; after 'earth' a rest: the sound dips 3.5 dB, nothing stops (v3.1: the owner heard the silence here as a cut)", "a decision that makes the war: the closest face of the film, then a breath"),
 'armies': ("CRANE down to both armies and the chariot between them", "the conch enters over the held horn ten frames before the cut (heard about six before); clock to 120", "the turn. The armies are named once, here"),
 'bow': ("PUSH-IN on Arjuna as he sits and the bow leaves his hand", "the motif on the horn; the bow strikes the chariot floor", "a decision: push in"),
 'vish': ("from tight on his face, PULL-BACK and CRANE up about thirty times in 1.8 s, then a slow drift; the one LONG HOLD", "a breath; the light floods on a drum and thunder; the motif in every octave with a conch, a drum on each beat; 'I am Time' doubled an octave below in a temple hall (3.5 s), a bell and a low swell on 'Time'; two low tones 7 Hz apart, one in each ear, under the shot", "the payoff, where the text has it: after the bow, before the war. The form fills the frame to the bottom: both armies under it"),
 'arrows': ("PULL-BACK from his face to the whole bed of arrows", "the arrows nine frames before the picture; a hit on the cut; the motif at full weight through the war", "the war begins on a consequence"),
 'boy': ("ORBIT, closing: the ring of spears comes in", "hooves; a hit on the cut", "one against many: the camera circles as they do"),
 'mud': ("TILT down from Karna to the wheel; CUT three frames after it drops", "a creak; the drop two and a half frames before the cut", "the third round thing on the rhyme spot (basket, dice, wheel)"),
 'raid': ("SLIDE with the man and the blade, left to right", "footsteps; steel", "the last of the war: night"),
 'curse': ("slow PUSH-IN on Gandhari and Krishna (both stay in frame)", "one low drum; a low horn; the drums are gone", "after the war: the cost"),
 'dog': ("CRANE up the mountain with the king and the dog", "the clock alone, wind, a flute held; after 'dog' a rest: a 3.5 dB dip, the clock still going (v3.1: no silence)", "the quietest shot: the story is over"),
 'word': ("slow PUSH-IN; the word large; its three parts struck in on the three spoken syllables", "the drone and embers; a tap and a low drum on each part; a bell on 'was'", "what the epic calls itself"),
 'p1': ("TILT up the names of the eighteen books", "a drum on each 'Every'", "the promise, one clip, one picture"),
 'first': ("CRANE down to the Naimisha fire as the storyteller arrives", "the motif plucked", "where episode 1 begins"),
 'nothing': ("PUSH-IN on Vyasa by the fire, a hand opening", "the motif on a flute", "the rule of the series"),
 'making': ("SLIDE along palm leaves laid down one after another", "a leaf on each beat; the motif low on a veena", "who makes this: plain words, no hype"),
 'support': ("CRANE back from the fire to the listeners' ring; one place is empty and lit", "a low horn on Pa, wanting its Sa", "the ask, as an invitation: a place for the viewer"),
 'endcard': ("slow PUSH-IN; fire, embers, the ring round FOLLOW beating", "ONE STRUCK D on the cut (the motif's Sa at last); it rings under the card over the fire and the drone to the last frame", "the card is held and never still: FOLLOW, Watch Episode 1, support, source"),
}
cut_in = lambda l: [round((l['words'][k]['t0'] - 0.07) * 30) / 30 for k in SL[l['id']].get('cutAt', [])]
rows = []; pics = []
for l in tl['lines']:
    c = [l['start']] + cut_in(l) + [l['end']]
    for i in range(len(c) - 1): pics.append((l['id'] + ('' if len(c) == 2 else f' [{i + 1}]'), c[i], c[i + 1] - c[i]))
    cam, snd, why = P[l['id']]
    rows.append(f"| {l['id']} | {l['start']:.2f} | {l['end'] - l['start']:.2f}{'' if len(c) == 2 else ' (' + ' + '.join(f'{c[i + 1] - c[i]:.2f}' for i in range(len(c) - 1)) + ')'} | {SL[l['id']]['text'] or '(no words)'} | {cam} | {snd} | {why} |")
bf = mix.get('bed_floor', {})
doc = f"""# Trailer, third cut · the edit, shot by shot

Generated by `lab/review/trailer/v3/mkedit.py` from the built timeline ({tl['duration']:.2f} s, {len(tl['lines'])} shots, {len(pics)} pictures,
{sum(len(l['text'].split()) for l in sc['lines'])} words). Verses: `script/TRAILER-CHECK.md`.

## What the owner said of the second cut, and what this cut does about each

1. **"Words get stuck."** Sentences had been voiced in pieces (a 0.5 s "A boy," from one take, "alone against many" as another
   file) and the pieces differed in pitch and had clipped ends. Now a sentence is ONE clip from ONE take and is never cut into
   two files; where the picture cuts inside a sentence (twice: `stakes`, `needle`) the voice runs through and only the picture
   changes, on the frame before a word. No shot is under 1.3 s; none carries fewer than three words.
2. **"It sticks and starts again."** The second cut opened on the armies, showed the chariot, jumped back to the past, returned
   to the chariot three times without words and said "Two armies" twice. This cut is told once, in order. The armies are named
   once (the turn). The universal form stands where the text has it, after the lowered bow and before the war. No picture and
   no three-word phrase occurs twice (the gate checks the phrases).
3. **Sound holes.** The music was ducked 11 dB with a slow release, so every breath dropped the mix to near silence, and the
   film began with 0.3 s of nothing. Now a bed (drone, tanpura, rising tone, the place's air) runs from the first sample to
   the last (v3.1: the two silences are gone too); it is ducked 8 dB with a 150 ms release; and after mastering, wherever a 100 ms window is
   still under −26 dBFS or falls more than 10 dB within 0.3 s, the bed is lifted there. The gate fails the mix otherwise.
4. **"Make the voice more appealing."** One reference for every line (a calm, low storyteller read, not a pitched-down voice),
   takes rejected if their pitch is more than 2 semitones from the set's, chosen for evenness (few pitch jumps, no creak) and
   not for range; no time-stretch; soft edges with their own breath room; a little presence and a short room in the mix.
5. **"The end card should matter."** After the promise the narrator says who makes this and what to do, and the card is held
   {next(l['end'] - l['start'] for l in tl['lines'] if l['id'] == 'endcard'):.1f} s, always moving, FOLLOW largest.

## Shots

| shot | start (s) | length (s) | spoken | camera | sound | why |
|---|---|---|---|---|---|---|
""" + '\n'.join(rows) + f"""

## The shot-length curve (every picture under the voice, in order)

{' · '.join(f'{n} {d:.2f}' for n, s_, d in pics)}

Shortest picture: {min(d for n, s_, d in pics):.2f} s. The story's shots shorten from the vow to the needle-point; the turn opens out
into the one long hold; the war is the fastest run the 1.3 s floor allows; the curse and the dog slow to the second stop.
The second cut's sub-second shots (0.70 to 0.93 s) are gone: they were the "stuck words".

## Sound

- Stops: {json.dumps(score.get('stops', []))} (v3.1: none. The owner heard the two silences of v3 as a cut and a lag). Where they were, {json.dumps(score.get('dips_where_the_stops_were', []))}, the stems dip 3.5 dB and everything goes on sounding.
- Krishna's words: {json.dumps(mix.get('divine', {}))}
- Under the universal form only: {json.dumps(score.get('binaural', {}))} (two sines, one in each ear).
- Clock: {score.get('clock', {}).get('ticks', '?')} ticks, tempo steps {json.dumps(score.get('clock', {}).get('tempo_steps', []))}, last tick {score.get('clock', {}).get('last', '?')} s.
- Motif: {score.get('motif', '')}.
- Duck under the voice: {json.dumps(mix.get('duck_db', {}))} dB, release 150 ms. Voice chain: {mix.get('voice_eq', '')}.
- Floor (measured on the whole finished mix, no exempt windows): worst 100 ms window {bf.get('worst_window_db', '?')} dBFS at {bf.get('worst_window_at_s', '?')} s;
  windows under −26 dBFS: {bf.get('windows_under_floor', '?')}; worst fall within 0.3 s: {bf.get('worst_drop_db', '?')} dB at {bf.get('worst_drop_at_s', '?')} s; falls over 10 dB: {bf.get('drops_over_limit', '?')}.
  Before the bed was lifted: {json.dumps(bf.get('before_lifting_the_bed', {}))}. The bed was lifted (by at most {bf.get('bed_lift_db_max', '?')} dB) over {bf.get('bed_lifted_seconds', '?')} s in all.
- Mix: {mix.get('lufs', '?')} LUFS, {mix.get('true_peak_dbtp', '?')} dBTP, LRA {mix.get('lra', '?')}.

## Voice

{json.dumps({k: v for k, v in sel.items() if k != 'pauses_shortened'}, indent=1)}

Pauses inside sentences shortened to 0.33 s (0.45 s between the short sentences of one clip): {json.dumps(sel.get('pauses_shortened', {}))}

## Kept from the second cut, dropped from it

Kept: the clock and its four tempos; the rising tone; the motif and its one resolution on the last cut; shot-length
acceleration; push-ins on decisions and pull-backs on consequences; the round-thing rhyme (basket, dice, wheel); sound leading
picture (dice, conch, arrows, altar fire); cuts three frames after an impact; Krishna's face kept for the universal form.

Dropped: the opening on the chariot; the three wordless inserts; the future tense; "But first"; the second "Two armies";
the picture of the vow and of the spears coming back under the promise; the two full silences (v3.1); sentences cut into two files; the 11 % slow-down.
"""
open(f'{ROOT}/script/TRAILER-EDIT.md', 'w').write(doc)
print('wrote script/TRAILER-EDIT.md', round(tl['duration'], 2), 's;', len(pics), 'pictures; shortest', round(min(d for n, s_, d in pics), 2))
