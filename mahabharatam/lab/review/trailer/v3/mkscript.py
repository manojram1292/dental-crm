"""Trailer v3: writes script/trailer.en.json. One LINE per SHOT; a sentence is ONE voice clip and is never cut into two files:
where the picture cuts inside a sentence the line carries "cutAt": [word index] and the scene changes picture on the frame before
that word (src/scenes/trailer/scenes.js, `multi`).      python3 -I lab/review/trailer/v3/mkscript.py
Voiced shots take their length from the voice file (pre + voice + post); the title from "est"."""
import json, os
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..'))
base = json.load(open(f'{ROOT}/script/ep43.en.json'))
sc = {k: base[k] for k in ('lang', 'fonts', 'timing', 'voice', 'captionBand')}
sc['timing'] = dict(sc['timing'], voiceGap=0.2, tail=0.0, frameSnap=True)
sc.update({
 "episode": 97, "kind": "trailer", "credits": "source-only", "cut": 3, "scoreStops": True, "bedFloor": {"floorDb": -26, "dropDb": 10, "dropWindowS": 0.3},
 "noStops": True, "divine": {"line": "vish", "fromWord": 8, "lightFromWord": 4, "octaveDb": -9, "lightDb": -15, "hallSeconds": 3.5, "preDelayMs": 60}, "binaural": {"line": "vish", "leftHz": 98, "rightHz": 105, "dbfs": -38},
 "source": "THE FULL-EPIC TRAILER, third cut (pipeline number 97; never a numbered episode). Told once, in order, no image and no phrase twice. Every beat was read in the constituted text of the BORI Critical Edition (GRETIL e-text, lab/ce/): the verses, a Sanskrit quotation for each and everything cut or reworded are in script/TRAILER-CHECK.md; the edit is planned shot by shot in script/TRAILER-EDIT.md. In short: 1.94.86-90, 1.104.10-15 and 3.292.6-7, 1.107.1, 1.132.8-12 and 1.136.4-10, 1.139.1-4 and 1.142.28-31, 1.155.41, 2.42.21-25, 2.53-54 and 2.58.29-37, 2.61.40-41 (the cloth: no cause is named; Krishna is not shown), 2.67.9-10 and 2.68.1 (deerskins), 5.125.26, 6.23.21-47 (the chariot between the armies; the bow let go), 6.33.3-35 (the universal form; 'I am Time' is 6.33.32 kalo 'smi), 6.114.81-85, 7.33.12 and 7.48.13, 8.66.60-65 and 8.67.24, 11.25.36-42, 17.1.23-31 and 17.3.7-8, 1.1.52 (itihasa). 'Iti-ha-asa: so indeed it was' is the traditional analysis of the word, not a verse.",
 "structure": "TITLE (music from the first frame, the name, no voice) -> THE STORY ONCE, IN ORDER, in the present tense: the vow, the river, the cousins, the fire, the demon, the altar, the wheel, the dice, the cloth, exile, the needle-point -> a rest (a dip, no silence) -> the conch: two armies, the only time they are named; Arjuna lowers his bow; the universal form, the one long hold -> the war in order, the fastest cutting -> the curse -> the dog -> a rest -> the word itihasa -> the promise -> who makes this and what to do -> the end card, held.",
 "names": {"Bhima": "strongest of the five", "Krishna": "of the Vrishnis, the wheel-bearer", "Duryodhana": "eldest of the hundred", "Arjuna": "the archer of the five", "Bhishma": "the prince who swore celibacy", "Karna": "born in armour, a charioteer's foster-son",
           "Draupadi": "born from the altar", "Yudhishthira": "eldest of the five", "Time": "kalo 'smi (6.33.32)", "Iti": "so", "Ha": "indeed", "Asa": "it was"},
 "loop": {"hookQuestion": "What does the archer see when he will not fight?", "answeredBy": "vish", "openQuestion": "How does the telling begin? (episode 1)", "prevAnsweredBy": None},
 "hookStyle": "title",
 "strings": {"seriesTitle": "Mahabharata", "seriesSubtitle": "As Vyasa Told It", "episodeLabel": "Mahabharatam", "episodeTitle": "As Vyasa Told It", "episodeSeparator": " · ",
  "nextEpisodeLabel": "Watch Episode 1", "nextTitle": "The Storyteller Arrives", "followWord": "Follow", "supportLine": "Support the series: follow, share, comment",
  "wordParts": ["iti", "ha", "asa"], "wordGloss": ["so", "indeed", "it was"], "wordWhole": "itihasa", "wordMeaning": "So indeed it was",
  "books": ["Adi", "Sabha", "Vana", "Virata", "Udyoga", "Bhishma", "Drona", "Karna", "Shalya", "Sauptika", "Stri", "Shanti", "Anushasana", "Ashvamedhika", "Ashramavasika", "Mausala", "Mahaprasthanika", "Svargarohana"],
  "sourceLine": "Text: the Mahabharata · BORI Critical Edition"},
})
L = []
def shot(id, text, **k):
    d = {"id": id, "text": text, "pre": 0, "post": 0}
    if not text: d.update(voice=False, caption=False, est=k.pop('est'))
    else: d['estVoice'] = round(max(0.5, len(text.split()) / 2.5 + 0.2 * text.count('.')), 2)   # until the voice exists
    d.update(k)
    if not text: d.pop('pre'); d.pop('post')
    L.append(d)
W = 'war-iron'
shot('title', '', est=3.4, role='title', beat='field', amb='sky', music='dread', pal=W, cam='crane', sfx=['drum', 'conch'], mixDb=1.5,
     note="OPENING, no voice; SOUND ON THE FIRST FRAME (a drum and the conch at level, no fade-in): from high above, two armies as dark masses under a red dawn, banners moving, the camera coming down; MAHABHARATA arrives large, legible by 1.5 s.")
# ── THE STORY, once, in order, present tense ──
shot('vow', "Long ago, a prince swears away his throne and his line.", pre=200, post=60, amb='river', ambLead=200, music='wonder', foley=['water', 'cloth'], pal='island-gold', cam='push', tr='lamp',
     note="CE 1.94.86-90: a slow push-in on the young prince's face as he raises his hand before the fisher-king; flowers begin to fall. Plaque: Bhishma.")
shot('river', "A mother gives her first-born to the river.", pre=120, post=150, amb='river', music='tender', foley=['water', 'splash'], pal='riverbank-pearl', cam='pull', mixDb=-2,
     note="CE 1.104.10-15, 3.292.6-7: the basket with the shining child, close; the camera pulls back and the river takes it. Plaque: Karna.")
shot('cousins', "A hundred brothers. Five cousins. One throne.", beats=[3, 5], pre=60, post=40, amb='court', music='dread', foley=['step', 'staff'], pal='seat-ivory', cam='rack',
     note="CE 1.107.1: Duryodhana large in the foreground; the focus racks to the five across the hall, then to the one seat. Plaque: Duryodhana.")
shot('lac', "A palace built to burn.", pre=60, post=60, amb='hearth', music='chase', foley=['flame', 'whoosh'], pal='wrath-crimson', cam='tilt',
     note="CE 1.132.8-12, 1.136.4-10: the lacquered house in flames; a tilt down through the earth to six figures leaving by a tunnel with one lamp.")
shot('demon', "Bhima breaks a man-eating demon.", pre=60, post=40, emphasis=['Bhima'], amb='forest-night', music='chase', foley=['growl', 'thud'], pal='thicket-shade', cam='orbit',
     note="CE 1.139.1-4, 1.142.28-31: the rakshasa reaches; Bhima's blow lands and the shot is CUT three frames after the contact.")
shot('altar', "A woman rises from a fire-altar.", pre=80, post=60, amb='hearth', ambLead=200, music='awe', foley=['flame', 'anklet'], pal='hearth-amber', cam='crane', tr='smoke',
     note="CE 1.155.41: Draupadi rises out of the middle of the altar; the camera rises with her. Plaque: Draupadi.")
shot('wheel', "Krishna lets the wheel fly.", pre=60, post=120, emphasis=['Krishna'], amb='heaven', music='awe', foley=['whoosh', 'thunder'], pal='pure-flame', cam='slide',
     note="CE 2.42.21-25: Krishna in colour, seen from behind the shoulder, his face turned away and in shadow; the wheel leaves his hand and the camera goes with it. Plaque: Krishna.")
# ── from the dice on: hard cuts only, shots shorten ──
shot('dice1', "Then the dice.", pre=150, post=150, beat='dice', amb='court', ambLead=200, music='dread', foley=['snap'], pal='dice-vermilion', cam='push',
     note="CE 2.53-54: the dice rattle before the picture; a push-in on Yudhishthira's face as he decides. Plaque: Yudhishthira.")
shot('stakes', "A king stakes his kingdom, his brothers, his wife.", cutAt=[5], beats=[7], pre=60, post=60, fast=True, beat='dice', music='dread', foley=['thud', 'cloth'], pal='dice-vermilion', cam='tilt',
     note="ONE SENTENCE, ONE CLIP, TWO PICTURES (CE 2.58.29-37). From above: the dice fall and strike the red cloth; on the frame before 'his brothers' the picture cuts to the stakes swept across the cloth to Shakuni's side: five crowns, then a red veil.")
shot('cloth1', "They pull at her cloth.", pre=60, post=40, fast=True, beat='cloth', amb='court', music='grief', foley=['cloth'], pal='boar-dusk', cam='orbit', mixDb=-1.5,
     note="CE 2.61.40: close: a hand hauls the red cloth across the frame; her figure holds still.")
shot('cloth2', "The cloth does not end.", pre=60, post=120, fast=True, beat='cloth', music='grief', foley=['cloth'], pal='boar-dusk', cam='pull', mixDb=-1.5,
     note="CE 2.61.41: the pull-back: the hall of seated kings around her, heads bowed, and the cloth running out of frame and heaped on the floor. No cause is shown; Krishna is not there.")
shot('exile', "Thirteen years of exile.", pre=60, post=60, fast=True, amb='forest-day', music='calm', foley=['steps'], pal='exile-forest', cam='slide', mixDb=-1,
     note="CE 2.67.9-10, 2.68.1: six figures walk away under great trees, deerskins over their shoulders (ajinany uttariyani).")
shot('needle', "Duryodhana will not give a needle-point of earth.", cutAt=[4], pre=60, post=1050, fast=True, beat='needle', closeup=True, emphasis=['Duryodhana'], amb='court', music='wrath', foley=['staff', 'breath'], pal='dharma-copper', cam='rack',
     note="ONE SENTENCE, ONE CLIP, TWO PICTURES (CE 5.125.26): the court, the envoy (Krishna, in colour, his back to us) in the foreground, the focus going to the king on his seat; on the frame before 'a needle-point' THE CLOSE-UP: a push-in on Duryodhana's face. A REST, NOT A SILENCE (v3.1): after 'earth' the sound dips 3.5 dB, the low horn held, the bed and the clock running; the push, the lamp and the embers go on.")
# ── the turn ──
shot('armies', "Two armies stand ready for war.", pre=450, post=100, fast=True, beat='field', amb='sky', music='awe', foley=['hooves'], sfx=['conch'], pal=W, cam='crane', mixDb=1.5,
     note="THE TURN (CE 6.23.20-21): the conch enters over the held horn before the cut; both armies, one chariot standing between them. The only time the armies are named.")
shot('bow', "Arjuna lowers his bow.", pre=80, post=150, fast=True, beat='field', emphasis=['Arjuna'], music='awe', foley=['thud'], pal=W, cam='push',
     note="CE 6.23.47: a slow push-in on Arjuna as he sits and the bow leaves his hand; Krishna beside him turned away from us. Plaque: Arjuna.")
shot('vish', "He asks to see. Krishna shows him everything. “I am Time.”", pre=150, post=1600, emphasis=['Krishna', 'Time'], amb='heaven', music='awe', foley=['breath', 'thunder'], pal='sun-white', cam='pull+crane', signature=True, mixDb=1.5,
     note="THE SIGNATURE SHOT AND THE ONE LONG HOLD (CE 6.33.3-35; every drawn element is cited in TRAILER-CHECK.md): Krishna's own words ('I am Time') are doubled an octave below and ring in a temple hall, with a bell and a low swell on 'Time'; two low tones 7 Hz apart, one in each ear, run under the whole shot. Tight on Arjuna's face; the light of a thousand suns comes up on it; the camera pulls back and up until he is a speck with joined palms under a form with many faces, eyes and arms that leaves the frame on every side; below it the two armies lit by it, and streams of warriors going up into its mouths. Where it happens in the text: between the lowered bow and the war.")
# ── the war, in order: the fastest cutting; everything moves left to right ──
shot('arrows', "Bhishma falls on a bed of arrows.", pre=60, post=40, fast=True, beat='arrows', emphasis=['Bhishma'], amb='sky', ambLead=200, music='chase', foley=['whoosh', 'thud'], pal='fishers-coral', cam='pull', mixDb=1.5,
     note="CE 6.114.81-85: the arrows are heard before the picture; from his face back to the whole bed of arrows: he does not touch the ground; the field at sunset.")
shot('boy', "A boy, alone against many.", pre=60, post=40, fast=True, beat='boy', amb='storm', music='chase', foley=['hooves'], pal='cold-slate', cam='orbit', mixDb=1.5,
     note="CE 7.33.12, 7.48.13 (eko bahubhih): Abhimanyu, sword up; the ring of spears and wheels closes from both sides. The blow is not shown.")
shot('mud', "Karna's wheel, sunk in the earth.", pre=60, post=40, fast=True, beat='mud', emphasis=['Karna'], amb='void', music='chase', foley=['creak', 'thud'], pal='island-gold', cam='tilt', mixDb=1.5,
     note="CE 8.66.60-64, 8.67.24: Karna on his knees, heaving at the wheel; the red sun behind him; the wheel drops into the earth; CUT three frames after it stops.")
# (the night raid, 10.8.9-11, is not in this cut: with the call to action added the film had to lose two seconds after the turn)
shot('curse', "A mother of a hundred sons curses Krishna.", pre=150, post=60, emphasis=['Krishna'], amb='void', music='grief', foley=['flame', 'cloth'], pal='ash-grey', cam='push', mixDb=-0.5,
     note="CE 11.25.36-42: Gandhari, blindfolded, her hand rising toward Krishna, who stands with his back to us; a field of fires behind.")
shot('dog', "And at the end, a king will not abandon his dog.", pre=200, post=760, amb='sky', music='still', foley=['steps', 'breath'], pal='mist-lavender', cam='crane', mixDb=-3,
     note="CE 17.1.23-31, 17.3.7: snow and the mountain; the old king walking up, the dog at his heel; he stops and turns to it. The quietest shot. A REST, NOT A SILENCE (v3.1): after 'dog' the sound dips 3.5 dB; the flute holds, the clock goes on; the snow goes on falling.")
shot('word', "It calls itself itihasa. Iti. Ha. Asa. So indeed it was.", capOnly=1, beats=[3, 4, 5, 6, 7], pre=160, post=120, rest=True, beat='word', amb='void', music='still', foley=['staff'], sfx=['bell'], pal='arrival-umber-gold', cam='push', mixDb=-1.5,
     note="After the rest (CE 1.1.52): dark, embers; the word in gold, large, a slow push-in; its three parts land on the three spoken syllables, each with its gloss; then the meaning. One struck note under 'was'.")
# ── the promise ──
shot('p1', "Every book. Every vow. Every war.", beats=[2, 4], pre=120, post=40, amb='night-fire', ambLead=200, music='wonder', foley=['staff'], pal='memory-indigo', cam='tilt', mixDb=0.5,
     note="THE PROMISE, one clip: the names of the eighteen books run up the frame in gold; a drum on each 'Every'.")
shot('first', "From the first verse to the last.", pre=60, post=40, amb='night-fire', music='wonder', foley=['flame', 'steps'], pal='naimisha-bluehour', cam='crane',
     note="The Naimisha fire at the blue hour; the storyteller comes to it.")
shot('nothing', "Nothing added for effect.", pre=60, post=100, amb='night-fire', music='wonder', foley=['flame'], pal='naimisha-firstlight', cam='push',
     note="First light: Vyasa by the great fire, a hand opening to us.")
# ── who makes this, and what to do ──
shot('making', "We are making this, episode by episode.", pre=100, post=60, beat='end', amb='night-fire', music='awe', foley=['staff'], pal='memory-indigo', cam='slide', mixDb=-1,
     note="Palm leaves laid down one after another, each with its lines of writing, a cord through them: the series as it is made.")
shot('support', "If you want it told this way, follow and support the series.", pre=80, post=40, beat='end', amb='night-fire', music='awe', foley=['flame'], pal='hearth-amber', cam='crane', mixDb=-0.5,
     note="The listeners' ring at the fire seen from behind, and one empty place in it, lit: yours.")
shot('endcard', "Episode one is waiting.", pre=200, post=2750, caption=False, beat='end', music='awe', foley=['staff'], sfx=['bell-low'], pal='arrival-umber-gold', cam='push', mixDb=1,
     note="THE END CARD, held at least 4.5 s and always moving (fire, embers, a slow push-in): FOLLOW largest, with a pulsing ring and a pointer; then 'Watch Episode 1 · The Storyteller Arrives'; then 'Support the series: follow, share, comment' small; then the source line. Nothing in the bottom 420 px or the right-hand 160 px. One struck note on the cut; it rings under the card over the fire.")
sc['lines'] = L
json.dump(sc, open(f'{ROOT}/script/trailer.en.json', 'w'), indent=1, ensure_ascii=False)
print(len(L), 'shots;', sum(len(l['text'].split()) for l in L), 'words; estimated', round(sum(l.get('est', 0) or (l['pre'] + l['post']) / 1000 + l['estVoice'] for l in L), 1), 's')
