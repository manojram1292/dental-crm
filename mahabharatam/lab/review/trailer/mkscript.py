import json, sys
sys.path.insert(0, '/tmp/claude-0/-home-user-dental-crm/98c18506-4c60-5696-b6d2-9400870fcaf8/scratchpad/trailer')
from lines import LINES
TEXT = {i: t for i, t, _ in LINES}; TEXT["war"] = ""
base = json.load(open('script/ep43.en.json'))
sc = {k: base[k] for k in ('lang', 'fonts', 'timing', 'voice', 'captionBand')}
sc['timing'] = dict(sc['timing'], voiceGap=0.2, tail=0.3)
sc.update({
 "episode": 97, "kind": "trailer",
 "source": "THE FULL-EPIC TRAILER (pipeline number 97; never a numbered episode). One image and at most one short line per beat, from Bhishma's vow to the last walk, then the word itihasa. EVERY beat was read in the constituted text of the BORI Critical Edition (GRETIL e-text, lab/ce/): the verses, a Sanskrit quotation for each, and everything cut or reworded are in script/TRAILER-CHECK.md. In short: 6.55.86-98 (the cold open: Krishna raises the wheel and runs at Bhishma; Arjuna holds him; the wheel is not thrown), 1.94.86-90, 1.104.10-15 and 3.292.6-7, 1.107.1, 1.132.8-12 and 1.136.4-10, 1.139.1-4 and 1.142.28-31, 1.155.41, 1.179.14-22 (five arrows), 2.42.21-25 (the wheel released: Shishupala), 2.53-54 and 2.58.29-37, 2.60.22-28, 2.61.40-41 (the cloth: no cause is named; Krishna's part is star passage 543* and is not shown), 2.67.9-10, 5.125.26, 6.23.21-47 and 6.24.9-11, 6.114.81-85, 7.33.12 and 7.48.9-14, 8.66.42-65 and 8.67.24, 10.8.5-12, 11.16.1-4 and 11.25.36-42, 17.1.23-31 and 17.3.7-8, 1.1.52 (itihasa). 'Iti-ha-asa: so indeed it was' is the traditional analysis of the word, not a verse.",
 "structure": "COLD OPEN (the most arresting image, the title as a statement) -> the story in order, one image a beat, cut fast -> REST 1 and the conch -> the war by its consequences -> REST 2, a full stop of all sound -> the word itihasa in its three parts, its meaning, the promise, the invitation.",
 "names": {"Bhima": "strongest of the five", "Krishna": "of the Vrishnis, the wheel-bearer", "Duryodhana": "eldest of the hundred", "Arjuna": "the archer of the five", "Bhishma": "the prince who swore celibacy", "Karna": "born in armour, a charioteer's foster-son",
           "Draupadi": "born from the altar", "Shakuni": "he throws for Duryodhana", "Gandhari": "mother of the hundred", "Abhimanyu": "Arjuna's son", "Hidimba": "a man-eating rakshasa", "Yudhishthira": "eldest of the five",
           "Iti": "so", "Ha": "indeed", "Asa": "it was"},
 "loop": {"hookQuestion": "What is the whole Mahabharata?", "answeredBy": "promise", "openQuestion": "How does the telling begin? (episode 1)", "prevAnsweredBy": None},
 "hookStyle": "title",
 "strings": {"seriesTitle": "Mahabharatam", "seriesSubtitle": "As Vyasa Told It", "episodeLabel": "Mahabharatam", "episodeTitle": "As Vyasa Told It", "episodeSeparator": " · ",
  "nextEpisodeLabel": "Episode 1", "nextTitle": "The Storyteller Arrives", "followWord": "Follow",
  "wordParts": ["iti", "ha", "asa"], "wordGloss": ["so", "indeed", "it was"], "wordWhole": "itihasa", "wordMeaning": "So indeed it was",
  "sourceLine": "Text: the Mahabharata · BORI Critical Edition", "madeLine": "Voices: synthetic · Drawn in code"},
})
L = []
def line(id, **k):
    d = {"id": id, "text": TEXT[id], "est": 3.0, "pre": 160, "post": 160, "sfx": ["drum"]}; d.update(k); L.append(d)
line('hook', pre=60, post=700, role='hook', caption=False, beats=[3, 4], amb='storm', music='dread', foley=['whoosh@0', 'hooves'], pal='war-iron', cam='push', mixDb=1,
     note="COLD OPEN (CE 6.55.86-98): Krishna, the wheel raised and blazing, down from the chariot and running at Bhishma; Arjuna has him by the arm. The title low in the frame from frame 1.")
line('vow', beats=[2], amb='river', ambLead=200, music='wonder', foley=['water', 'cloth@0'], pal='island-gold', cam='crane', tr='lamp',
     note="CE 1.94.86-90: the young prince, a hand raised, before the fisher-king on the river bank; flowers rain. Plaque: Bhishma.")
line('karna', sfx=[], beats=[5], amb='river', music='tender', foley=['water', 'splash@0'], pal='riverbank-pearl', cam='slide', tr='cut',
     note="CE 1.104.10-15, 3.292.6-7: a girl kneels at the water; a basket goes out on the river with a child in it, gold armour and earrings shining. Plaque: Karna.")
line('rivals', beats=[2, 4, 6], amb='court', music='dread', foley=['step@0', 'staff@1'], pal='seat-ivory', cam='rack', tr='cut',
     note="CE 1.107: Duryodhana large and grave in the foreground, the mace upright; beyond him, in focus second, five figures. Plaque: Duryodhana.")
line('lac', beats=[3], amb='hearth', music='chase', foley=['flame', 'whoosh@0'], pal='wrath-crimson', cam='tilt', tr='cut',
     note="CE 1.132, 1.136: the lacquered house goes up; a tilt down to six small figures leaving by a tunnel under it with one lamp.")
line('demon', beats=[3], emphasis=['Bhima'], amb='forest-night', music='chase', foley=['growl@0', 'thud'], pal='thicket-shade', cam='orbit', tr='cut',
     note="CE 1.139.1-4, 1.142.28-31: the rakshasa Hidimba, huge, ember-red, tawny-eyed, reaches; Bhima, as big, takes him by the arms. Plaque: Hidimba.")
line('altar', beats=[2], amb='hearth', music='awe', foley=['flame@0', 'anklet'], pal='hearth-amber', cam='tilt', tr='lamp',
     note="CE 1.155.41: Draupadi rises out of the middle of the fire-altar. Plaque: Draupadi.")
line('bow', beats=[3], amb='court', music='joy', foley=['snap@0', 'cloth'], pal='crystal-sky', cam='crane', tr='cut',
     note="CE 1.179.14-22: Arjuna looses; the mark on its pole comes down (five arrows); a white garland. Plaque: Arjuna.")
line('wheel', post=1100, beats=[1, 3], emphasis=['Krishna'], amb='heaven', music='awe', foley=['whoosh@0', 'thunder@1'], pal='pure-flame', cam='push', signature=True, tr='ink', mixDb=1,
     note="THE SIGNATURE SHOT (CE 2.42.21-25): Krishna, large; the wheel leaves his hand, a ring of fire across the frame; a light rises from where it went and comes back into him. Plaque: Krishna.")
line('dice', beats=[2, 6, 8, 10], amb='court', music='dread', foley=['thud@0', 'thud@2'], pal='dice-vermilion', cam='pull', tr='cut',
     note="CE 2.53-54, 2.58: Shakuni throws; from above the dice turn on the red cloth and the stakes slide away one after another. Plaque: Shakuni.")
line('hall', sfx=[], beats=[2], amb='court', music='grief', foley=['steps', 'anklet@0'], pal='cold-slate', cam='slide', tr='cut', mixDb=-2,
     note="CE 2.60.22-28: Draupadi, hair loose, a hand on her wrist pulling her across the frame past the pillars; the hall's seated heads.")
line('cloth', sfx=[], beats=[1, 6], amb='court', music='grief', foley=['cloth@0', 'cloth@1'], pal='boar-dusk', cam='orbit', tr='cut', mixDb=-2,
     note="CE 2.61.40-41: the cloth is pulled, and there is more cloth, and more: it runs out of frame in a long red band. No cause is shown. She stands; the heads in the hall are bowed.")
line('exile', beats=[0], amb='forest-day', music='calm', foley=['steps', 'birds'], pal='exile-forest', cam='slide', tr='brush',
     note="CE 2.67.9-10: six small figures walk away under great trees.")
line('needle', post=1050, beats=[5], emphasis=['Duryodhana'], amb='court', music='wrath', foley=['staff@0', 'breath'], pal='dharma-copper', cam='push', closeup=True, tr='cut',
     note="THE CLOSE-UP (CE 5.125.26): Duryodhana's face, lamp-lit: resolve hardening; his eye goes to the one he is refusing. A king holding his ground.")
line('war', voice=False, caption=False, est=2.2, pre=0, post=0, sfx=['silence', 'conch'], amb='sky', ambLead=300, music='awe', foley=['hooves'], pal='war-iron', cam='crane', tr='smoke',
     note="THE TURN, unvoiced, after a real silence held on Duryodhana's face (CE 6.1.1-3, 6.23): the conch; two armies drawn up on the plain, banners, dust; one chariot comes out between them. A crane down.")
line('field', beats=[1, 5, 7], emphasis=['Arjuna', 'Krishna'], music='awe', foley=['hooves', 'thud@1'], pal='war-iron', cam='push', tr='cut',
     note="CE 6.23.21-47, 6.24.9-11: the chariot between the armies; Arjuna sits and lets the bow fall; Krishna turns to him and speaks.")
line('arrows', sfx=[], beats=[1, 7], emphasis=['Bhishma'], amb='sky', music='grief', foley=['thud@0', 'breath'], pal='fishers-coral', cam='pull', tr='cut', mixDb=-2,
     note="CE 6.114.81-85: at sunset Bhishma lies on the arrows and does not touch the ground. A pull back.")
line('boy', beats=[3, 6], amb='storm', music='chase', foley=['hooves', 'whoosh@1'], pal='cold-slate', cam='orbit', tr='cut',
     note="CE 7.33.12, 7.48.13: Abhimanyu alone, sword up, inside a ring of spears and chariot wheels that closes. The blow is not shown. Plaque: Abhimanyu.")
line('mud', sfx=[], beats=[2], emphasis=['Karna'], amb='void', music='grief', foley=['creak@0', 'breath'], pal='island-gold', cam='tilt', tr='cut', mixDb=-2,
     note="CE 8.66.60-65, 8.67.24: the chariot wheel sunk in the earth; Karna's hands on it, heaving; behind him the red sun going down.")
line('raid', sfx=[], beats=[2], amb='forest-night', music='dread', foley=['steps', 'flame@0'], pal='satra-teal-night', cam='slide', tr='ink', mixDb=-2,
     note="CE 10.8.5-12: night; dark tents; one figure with a blade goes in, not by the gate.")
line('curse', beats=[6], emphasis=['Krishna'], amb='void', music='grief', foley=['flame', 'cloth@0'], pal='ash-grey', cam='push', tr='cut',
     note="CE 11.16.1-4, 11.25.36-42: Gandhari, blindfolded, a hand raised toward Krishna; behind them a field of fires to the horizon. Plaque: Gandhari.")
line('dog', sfx=[], beats=[6, 9], amb='sky', music='still', foley=['steps', 'breath@1'], pal='mist-lavender', cam='crane', tr='brush', post=300, mixDb=-3,
     note="CE 17.1.23-31, 17.3.7: snow and a mountain; one old king in bark cloth walking up; a dog at his heel; he stops and turns to it. Plaque: Yudhishthira.")
line('word', pre=1100, post=250, rest=True, sfx=['silence'], beats=[3], amb='void', music='still', foley=['staff@0'], pal='arrival-umber-gold', cam='push', tr='cut', mixDb=-2,
     note="After a full stop of all sound (CE 1.1.52): dark; the word in gold, itihasa.")
line('means', beats=[0, 1, 2, 3], amb='void', music='wonder', foley=['staff@0', 'staff@1', 'staff@2'], sfx=['bell@3'], pal='arrival-umber-gold', cam='push', tr='cut',
     note="The word splits into its three parts as they are spoken, each with its gloss under it; then the meaning.")
line('promise', beats=[0, 5], amb='night-fire', ambLead=250, music='awe', foley=['flame', 'steps@0'], pal='naimisha-bluehour', cam='crane', tr='lamp',
     note="The Naimisha fire at the blue hour; the storyteller comes to it.")
line('follow', beats=[0, 1], post=2200, amb='night-fire', music='awe', foley=['flame@0', 'cloth'], sfx=['drum', 'bell@1'], pal='naimisha-firstlight', cam='push', tr='cut', mixDb=1,
     note="First light: Vyasa, lit, large, a hand open to us, beside the great fire; the source line (fixed); Episode 1's title. The shot keeps drifting to the last frame.")
sc['lines'] = L
json.dump(sc, open('script/trailer.en.json', 'w'), indent=1, ensure_ascii=False)
print(len(L))
