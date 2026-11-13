"""Trailer v2: writes script/TRAILER-EDIT.md, the shot-by-shot plan, with the PLANNED length of every shot beside the length
MEASURED on the built timeline (build/timeline.ep97.en.json: voice files in place).    python3 -I lab/review/trailer/v2/mkedit.py"""
import json, os
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..'))
tl = json.load(open(f'{ROOT}/build/timeline.ep97.en.json')); sc = json.load(open(f'{ROOT}/script/trailer.en.json'))
L = {l['id']: l for l in tl['lines']}; SLn = {l['id']: l for l in sc['lines']}
# id: (planned s, camera move and its job, sound event, why the eye stays)
P = {
 'title':   (4.0, "CRANE down and forward from the cloud to the spear-points, toward a rising red sun; the name scales in and settles", "war drums at 60 a minute (the clock starts under them), low drone, conch, the horn states the MOTIF, a drum roll and a swell of air into the cut", "nothing is explained: a name, an army on the march, a rising sound. The first cut lands on the roll's last stroke"),
 'field':   (3.6, "TILT down the chariot's banner to the two figures: the move finds the one still thing between two moving armies", "a drum on the cut; the SPINE CUE (one low horn note) for the first time; hooves far off", "the question of the film: why will he not fight? A plaque names him"),
 'vow':     (3.6, "slow PUSH-IN on the prince's face as the hand goes up (a decision)", "river and one cloth move 6 frames before the picture (lamp transition: a jump back in time); the motif on a veena", "the push says: this is where it started"),
 'river':   (3.1, "PULL-BACK from the basket (at the rhyme spot) to the whole river and the girl small on the bank (a consequence)", "water; the motif on a flute; the quietest voice so far", "scale: the thing given up gets smaller and smaller"),
 'insA':    (0.6, "locked WIDE with a hair of push (insert 1 of 3)", "the spine cue alone", "a wordless return to the chariot: the same light, the same note; no caption, so it cannot be read as the next event"),
 'cousins': (3.2, "RACK focus: the heir, then the five, then the one seat, on the three phrases", "the clock steps up to 72; a staff knock on 'Five' and on 'One'", "three things named, three things brought into focus"),
 'lac':     (2.3, "TILT down from the burning house through the earth to the tunnel: the move IS the escape", "flames; a drum on the cut", "the eye is led from the trap to the way out"),
 'demon':   (2.3, "hand-held ORBIT closing in; HARD CUT three frames after the blow lands", "a growl, a whoosh, the blow on a drum and a low boom; the cut takes the sound's tail", "cut on action: the blow is seen to land and is gone"),
 'insB':    (0.6, "PUSH, closer (insert 2 of 3): the two figures", "the spine cue", "closer than before: the film is approaching something"),
 'altar':   (2.4, "CRANE up with her as she rises (smoke transition: she comes out of the fire of the last shot)", "the fire 6 frames before the picture; anklets; one small bell", "a rise answers the fall of the blow"),
 'wheel':   (2.2, "SLIDE with the wheel as it leaves the hand, then back as the light returns", "a whoosh, a crack of thunder", "Krishna is a black shape lit only by the wheel: his face is kept back for the universal form"),
 'dice1':   (1.6, "PUSH-IN on Yudhishthira's face (a decision)", "the dice rattle 6 frames BEFORE the cut; the clock steps up to 90; the motif begins low and does not finish", "the sound arrives first, so the cut is already wanted"),
 'dice2':   (1.7, "from above, a short TILT down with the falling dice; HARD CUT three frames after they strike, at the rhyme spot", "a clack and a drum exactly on the strike", "cut on action; the dice land where the basket floated"),
 'dice3':   (1.5, "SLIDE with the hand that sweeps the stakes away, left to right", "cloth on the sweep; the motif's third note is held", "the list in the voice is a list of things leaving the frame"),
 'cloth1':  (1.5, "close ORBIT round the taut cloth", "cloth hauled, twice", "tight after wide: no air in the frame"),
 'cloth2':  (1.7, "PULL-BACK to the whole hall of bowed kings and the cloth heaping up (a consequence)", "cloth; the held note", "scale: everyone saw; nobody moved"),
 'insC':    (0.5, "PUSH, closest (insert 3 of 3): the hand opening on the bow", "the spine cue, loudest", "the third return is a detail: the next time the film is here, it stays"),
 'exile':   (1.7, "SLIDE with the six as they walk out of frame", "footfalls; a lighter drum", "the shortest full beat so far: thirteen years in under two seconds"),
 'needle1': (1.3, "RACK focus from the envoy's dark back to the king on his seat", "a staff knock; the drums come up", "who is refusing whom"),
 'needle2': (2.3, "PUSH-IN on Duryodhana's face (a decision); it goes on through the silence", "STOP 1: on the frame after 'earth' every sound is cut to nothing; lamp, embers and the push go on", "the first silence of the film, on a face"),
 'armies':  (1.6, "CRANE back and down to the wide of the inserts, now held", "the conch 6 frames BEFORE the cut, out of silence; the clock returns at 120; drum and boom on the cut", "the place the film has shown three times: past and battlefield meet"),
 'bow':     (2.2, "slow PUSH-IN on Arjuna as he sits and the bow falls (a decision)", "the motif at full weight begins; the bow strikes the chariot floor", "the last present-tense image; everything after it is 'will'"),
 'arrows1': (0.9, "close SLIDE along his body toward the face, left to right, with the arrows", "arrows in the air 6 frames BEFORE the cut; a hit on the cut; the motif at full weight", "the fastest run begins: every line is two shots, a hit on each cut, everything moving left to right"),
 'arrows2': (1.5, "PULL-BACK to the whole bed of arrows in the field (a consequence)", "a lighter hit", "close, then the scale of it"),
 'boy1':    (0.7, "tight PUSH on the boy's face and sword", "hooves; a hit", "a face for one beat"),
 'boy2':    (1.1, "wide ORBIT as the ring closes", "a lighter hit", "the frame itself closes on him"),
 'mud1':    (0.8, "RACK focus onto Karna heaving at the wheel", "a hit; the wood creaks", "effort before the fall"),
 'mud2':    (1.2, "TILT down to the wheel; HARD CUT three frames after it drops, hub at the rhyme spot", "the drop on a drum and a boom", "cut on action; the wheel sits where the basket and the dice sat"),
 'raid':    (1.7, "SLIDE with the man and his blade, left to right", "soft steps, a blade", "the only dark shot of the run: it ends the war in the night"),
 'curse':   (2.9, "slow PUSH toward the raised hand", "the drums fall away to one horn line and the clock", "the cutting slows by half: the war is over"),
 'dog':     (3.7, "CRANE up the mountain with the two of them", "the clock at 120 and the wind, alone; one flute note; the quietest voice", "the hush before the payoff: the clock is suddenly very loud"),
 'vish':    (7.2, "the ONE LONG HOLD: from tight on Arjuna's face, a PULL-BACK and CRANE up of thirty times, until he is a speck under the form; then a slow creep while the form moves", "breath; a swell as the light comes up; the motif with every octave and drums on every beat; STOP 2: one frame after 'I am Time' everything, the clock with it, is dead", "the only change of scale in the film, and the only face of Krishna in it"),
 'word':    (6.2, "slow PUSH-IN on the word in gold; rays and embers keep moving", "out of silence: air, embers; a wooden tap on each of the three parts; one soft bell on 'was'", "after the loudest image, the quietest: one word"),
 'p1':      (0.9, "TILT up the names of the eighteen books", "a drum on the cut; a plucked bed returns", "the promise as a list one can see"),
 'p2':      (0.9, "PULL-BACK from the raised hand of the vow", "a higher drum", "an image the viewer already owns"),
 'p3':      (0.9, "SLIDE along the spears", "the highest drum", "three cuts, three drums, rising"),
 'first':   (2.2, "CRANE down to the Naimisha fire as the storyteller walks in", "the motif plucked, then sung by the flute", "where episode 1 begins"),
 'follow':  (2.8, "PUSH-IN on Vyasa as his hand opens to us; FOLLOW lands on its word", "a drum on 'Follow'; a short roll", "an invitation, then a hard cut"),
 'endcard': (2.2, "HARD CUT on the word 'one'; a slow PULL so the card is never still", "ONE STRUCK NOTE (D, the motif's home) with a drum; it rings out by itself", "the last word and the last note land together"),
}
rows = []
tot_p = 0
for l in tl['lines']:
    p = P[l['id']]; tot_p += p[0]; d = l['end'] - l['start']
    said = SLn[l['id']]['text'] or '(no words)'
    rows.append(f"| {len(rows) + 1} | `{l['id']}` | {l['start']:.2f} | {p[0]:.1f} | {d:.2f} | {said} | {p[1]} | {p[2]} | {p[3]} |")
score = json.load(open(f'{ROOT}/audio/ep97/score-trailer.json')) if os.path.exists(f'{ROOT}/audio/ep97/score-trailer.json') else {}
sec = lambda ids: [round(L[i]['end'] - L[i]['start'], 2) for i in ids]
doc = f"""# Trailer, second cut · the edit plan

Built by `lab/review/trailer/v2/mkedit.py` from the plan below and the timeline as built ({tl['duration']:.2f} s, {len(tl['lines'])} shots,
timeline `{tl['signature']}`). "Planned" is what the edit was designed to; "built" is what the voice files gave.

## The idea

One moment holds the film together: **a chariot standing between two armies, and an archer who will not fight.** The film opens
on it, leaves it for the past, and cuts back to it three times without a word, each time closer (the field, the two figures,
the hand on the bow), always in the same blue-iron light with the same low horn note, so a first-time viewer learns that this
image is *now* and everything else is *how it came to this*. The past is told in the present tense. At "Two armies" the past
arrives at the chariot. From there the voice changes tense: what follows **will** happen (Bhishma, the boy, Karna, the night
raid, the curse, the dog). Then "But first": the film goes back to the chariot a last time, and this time it does not cut away.
That is the payoff, the universal form, and the only long shot in the film.

Techniques used, and what each is for (the techniques are general film grammar; no shot, line or note is taken from any film):

- **Cross-cutting to one fixed image** gives the viewer a place to stand while eleven events go by.
- **A clock that never stops and only gets faster** (60, 72, 90, 120 a minute), with a tone under it that seems to rise
  for ever, makes time itself audible; it stops dead one frame after the words "I am Time".
- **Shots shorten steadily** from the dice to the war, so that the one long hold is felt as a hold.
- **Sound leads picture** by six frames at three cuts (dice, conch, arrows): the ear asks for the cut before the eye gets it.
- **Cuts on impact**, three frames after contact (the blow, the dice, the wheel).
- **A visual rhyme**: the basket on the river, the dice on the cloth and the wheel in the earth sit on the same spot of the frame.
- **Withholding**: Krishna is a black shape, in profile or from behind, in every shot before the universal form.
- **Two silences**, each cut on a frame, each with the picture still moving. Nothing else in the film goes quiet.

## Every shot

| # | shot | starts (s) | planned (s) | built (s) | words | camera, and its job | sound | why the eye stays |
|---|---|---|---|---|---|---|---|---|
{chr(10).join(rows)}

Planned total {tot_p:.1f} s; built {tl['duration']:.2f} s.

## The shot-length curve (seconds)

| section | planned | built |
|---|---|---|
| opening and "now" (title, field) | {P['title'][0]}, {P['field'][0]} | {', '.join(map(str, sec(['title', 'field'])))} |
| the past, early beats (vow, river, cousins, lac, demon, altar, wheel) | {', '.join(str(P[i][0]) for i in ['vow', 'river', 'cousins', 'lac', 'demon', 'altar', 'wheel'])} | {', '.join(map(str, sec(['vow', 'river', 'cousins', 'lac', 'demon', 'altar', 'wheel'])))} |
| the three inserts | {', '.join(str(P[i][0]) for i in ['insA', 'insB', 'insC'])} | {', '.join(map(str, sec(['insA', 'insB', 'insC'])))} |
| from the dice (dice ×3, cloth ×2, exile, needle ×2) | {', '.join(str(P[i][0]) for i in ['dice1', 'dice2', 'dice3', 'cloth1', 'cloth2', 'exile', 'needle1', 'needle2'])} | {', '.join(map(str, sec(['dice1', 'dice2', 'dice3', 'cloth1', 'cloth2', 'exile', 'needle1', 'needle2'])))} |
| the turn (armies, bow) | {P['armies'][0]}, {P['bow'][0]} | {', '.join(map(str, sec(['armies', 'bow'])))} |
| what will come: the war (arrows ×2, boy ×2, mud ×2, raid) | {', '.join(str(P[i][0]) for i in ['arrows1', 'arrows2', 'boy1', 'boy2', 'mud1', 'mud2', 'raid'])} | {', '.join(map(str, sec(['arrows1', 'arrows2', 'boy1', 'boy2', 'mud1', 'mud2', 'raid'])))} |
| after the war (curse, dog) | {P['curse'][0]}, {P['dog'][0]} | {', '.join(map(str, sec(['curse', 'dog'])))} |
| THE HOLD (the universal form) | {P['vish'][0]} | {', '.join(map(str, sec(['vish'])))} |
| the word, the promise, the end (word, p1, p2, p3, first, follow, endcard) | {', '.join(str(P[i][0]) for i in ['word', 'p1', 'p2', 'p3', 'first', 'follow', 'endcard'])} | {', '.join(map(str, sec(['word', 'p1', 'p2', 'p3', 'first', 'follow', 'endcard'])))} |

The last shot before each stop is longer than its neighbours because the silence is inside it (`needle2`, `vish`): the picture
keeps moving through the stop.

## Sound plan

- Clock: {json.dumps(score.get('clock', {}))}
- Stops (seconds, start and end of digital silence in the stems): {json.dumps(score.get('stops', []))}
- Motif: {score.get('motif', '')}. Stated by the horn in the opening (1.05 s); veena under the vow; flute over the river; low and
  unfinished across the dice hall and the cloth; full weight from `bow` to `raid`; every octave under the universal form; plucked and
  sung under "From the first verse to the last"; resolved by one struck D on the last word.
- Leads: the dice rattle starts 6 frames before its cut; the conch starts 10 frames and the arrows 9 frames early, because both swell in and are audible about 6 frames before the cut; river, altar fire, dice hall, arrows' sky and the promise's
  night fire come in 6 frames early (`ambLead`).
- Stems: the clock and every hit are in the foley stem (ducked 2 dB under the voice: they do not pump); the rise and the places in
  the ambience stem (5 dB); drone, horn, veena, flute and bells in the music stem (11 dB).

## Where the plan had to choose between two instructions

- The brief asks both for "the war fastest, then the one long hold on the universal form, then the cut to silence" and for
  "after the war: the curse, the dog, then the stop", with exactly two stops. Both cannot hold. Built here: war → curse → dog →
  universal form → stop. The curse and the dog are told in the future tense with the war ("will curse", "will not abandon"),
  and "But first" brings the film back to the chariot. The stop therefore falls on "I am Time", where the clock dies.
- "Told in order" was dropped from the promise: SERIES.md records three places where the series moves material (the Bhrigu
  tales after Astika, Parikshit's death before Kadru and Vinata, Bhishma's days in order). The promise as spoken:
  "Every book. Every vow. Every war. From the first verse to the last. Nothing added for effect."

## What changed once the voice existed

The plan was written before any line was voiced (first total: 84.7 s, the war as four shots of 2.1, 1.6, 1.6 and 1.5 s). The
voice as generated came to 92 s. The "planned" column above is the plan as revised then:

- **The war is seven shots, not four.** The narrator needs about 2 s for each war line, which would have made the war no faster
  than the dice hall. Three of the four lines are now cut in two between two words (close, then wide), so the cutting there
  is the fastest of the film (0.7 to 1.9 s a shot) without the voice being hurried.
- **"In the forest," was cut** from the demon line, and four clips were re-chosen for length (noted in `voice/ep97/en/select.json`).
- **Four early beats are 2.0 to 2.3 s, not 3 to 3.5 s** (the palace, the demon, the altar, the wheel): their lines are four to
  six words. The curve still falls from 3.8 s to under 1 s and then opens to the 7.4 s hold.
- **The two quiet lines (the river, the dog) are slowed 11 %** by a time-stretch, because this voice speaks every line at about
  three words a second and the river line came out fastest of all.
- **The hold on the universal form is 7.4 s as a shot**; the form itself is on screen for about 4.4 s of it (the first 3 s are
  Arjuna's face and the pull-back). The brief asked for 5 to 6 s.
"""
open(f'{ROOT}/script/TRAILER-EDIT.md', 'w').write(doc)
print('wrote script/TRAILER-EDIT.md', round(tot_p, 1), 'planned', tl['duration'], 'built')
