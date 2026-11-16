#!/usr/bin/env python3
"""Writes script/teaser.en.json (pipeline number 96, kind "trailer", "teaser": 1) and the script/ep96.en.json symlink.
Every beat is checked in script/TEASER-CHECK.md; the shot plan is script/TEASER-PLAN.md.
    python3 -I lab/review/teaser/mkscript.py"""
import json, os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
OUT = f'{ROOT}/script/teaser.en.json'
keep = {}
if os.path.exists(OUT):   # keep the measured voice estimates once the voice exists
    for l in json.load(open(OUT))['lines']:
        keep[l['id']] = l.get('estVoice')

INTRO = dict(pre=160, post=300)   # the introductions: slower, a breath after each line, the plaque held

lines = [
    dict(id='title', text='', voice=False, caption=False, est=3.1, role='title', beat='title', amb='sky', music='dread', pal='war-iron', cam='push',
         sfx=['conch', 'drum'], ambLead=0,
         note='OPENING, no voice; SOUND ON THE FIRST FRAME (a sub hit, a war drum and the conch). 3D: Kurukshetra at dawn, the camera low over massed ranks pushing in toward the red sun, banners moving, dust drifting through the lens. MAHABHARATAM arrives large, legible by 1.5 s; AS VYASA TOLD IT under it.'),
    dict(id='cousins', text='A hundred brothers. Five cousins. One throne.', estVoice=3.4, pre=200, post=380, beats=[3, 5], amb='court', ambLead=200, music='still',
         foley=['step', 'staff'], pal='seat-ivory', cam='rack', tr='lamp',
         note='CE 1.107.1 (the hundred), the five sons of Pandu: drawn. The hall: an empty lion-throne lit from above; a hundred small figures in purple on the left, five in white on the right; the focus racks from the hundred to the five to the throne on the words.'),
    dict(id='needle', text='Duryodhana will not give a needle-point of earth.', estVoice=3.2, pre=150, post=520, closeup=True, emphasis=['Duryodhana'], music='dread',
         foley=['breath', 'staff'], pal='venom-violet', cam='push',
         note='CE 5.125.26: a slow push-in to the closest face of the film: Duryodhana, crowned, the mace upright. Plaque DURYODHANA. A needle glints and turns at the edge of the frame.'),
    dict(id='gather', text='Eighteen armies gather at Kurukshetra.', estVoice=2.8, pre=150, post=520, amb='sky', ambLead=250, music='awe',
         foley=['hooves', 'steps'], pal='noon-ochre', cam='crane', tr='smoke',
         note='CE 1.2.234 (eighteen akshauhinis; the war lasted eighteen days), 6.23.1 (dharmakshetre kurukshetre). 3D WIDE: the camera cranes up and back from the ground over the plain; two dark seas of ranks with banners, chariots rolling into line, dust over the field. The first big 3D reveal.'),
    dict(id='bhishma', text='Bhishma, the grandsire, leads the Kauravas.', **INTRO, estVoice=3.0, music='awe', foley=['cloth', 'staff'], pal='cold-slate', cam='push',
         note='CE 5.153.26 (Duryodhana makes Bhishma commander), 1.94.86-90 (the vow). Drawn Bhishma, white and silver, the great bow, in front of 3D ranks with silver banners; a slow push-in. Plaque BHISHMA · the grandsire, sworn never to rule.'),
    dict(id='drona', text='Drona taught them all. Now he fights for Duryodhana.', **INTRO, estVoice=3.4, music='dread', foley=['steps', 'creak'], pal='dharma-copper', cam='slide',
         note='CE 1.122.39-40 (Bhishma gives Pandu\'s sons and the Kauravas to Drona as pupils), 1.2.26 (Drona guards the Kuru host five days). Drawn Drona (new kit figure: an old brahmin warrior, saffron, grey top-knot, bow) beside a 3D row of chariots; the camera slides with him. Plaque DRONA · teacher of both sides.'),
    dict(id='karna', text='Karna will not fight while Bhishma lives.', **INTRO, estVoice=2.9, music='wrath', foley=['cloth', 'flame'], pal='sun-white', cam='push',
         note='CE 5.165.27 (he will not fight while Bhishma lives); the plaque: born in armour, 1.104.11. Drawn Karna, sun-gold armour and the glowing earrings, against a 3D low sun; he sets his bow down. Plaque KARNA · born in armour, the Sun\'s son.'),
    dict(id='arjuna', text='Arjuna, the archer, chose Krishna over an army.', **INTRO, estVoice=3.2, music='wonder', foley=['snap', 'cloth'], pal='hunt-emerald', cam='rack',
         note='CE 5.7.19-20 (Arjuna chooses Keshava, who will not fight; Duryodhana takes the army). Drawn Arjuna with the bow (Gandiva is not named); behind him, out of focus, the 3D army that Duryodhana took. Plaque ARJUNA · the archer of the five.'),
    dict(id='krishna', text='Krishna will lift no weapon. He drives the chariot.', **INTRO, estVoice=3.2, music='wonder', foley=['hooves', 'creak'], pal='crystal-sky', cam='slide',
         note='CE 5.7.17 (ayudhyamanah ... nyastashastro: not fighting, weapons laid down), 5.7.35 (I will be your charioteer), 6.23.14 (white horses yoked to the great chariot). 3D chariot with four white horses and turning wheels; drawn Krishna on it at the reins, in colour, his face in shadow (kept for the form). Plaque KRISHNA · of the Vrishnis, the charioteer.'),
    dict(id='conch', text='The conches sound. The first arrows fly.', estVoice=2.8, pre=850, post=180, fast=True, amb='storm', ambLead=0, music='chase',
         foley=['whoosh', 'thunder'], sfx=['conch'], pal='war-iron', cam='crane',
         note='THE TURN (CE 6.23.12-19: Bhishma\'s conch, then the conches, drums and horns of both sides; 6.23.20 pravritte shastrasampate: the weapons had begun to fly). A REST BEFORE IT, NOT A SILENCE: the bed dips 3.5 dB and a riser climbs. 3D: both armies; conch shockwaves ring out across the plain; banners whip; then the first volley rises with trails and arcs over the camera. The war run starts here: the cutting is faster from now on.'),
    dict(id='between', text='Arjuna asks for his chariot between the armies.', estVoice=2.8, pre=60, post=200, fast=True, music='chase', foley=['hooves', 'creak'], pal='arrival-umber-gold', cam='slide',
         note='CE 6.23.20-24 (the monkey banner; set my chariot between the two armies; Krishna sets it there). 3D: the white horses at the gallop, wheels turning, the monkey banner, the chariot running out between the two armies with arrows crossing high overhead; drawn Arjuna and Krishna on it (placed by the 3D projection).'),
    dict(id='lowers', text='He sees teachers and kin. He lowers his bow.', estVoice=2.8, pre=60, post=250, fast=True, emphasis=['lowers'], amb='sky', music='grief', foley=['thud', 'breath'], pal='mist-lavender', cam='push',
         note='CE 6.23.25-26 (before Bhishma and Drona: he sees fathers, grandfathers, teachers, uncles, brothers, sons), 6.23.47 (he sits on the chariot floor, letting go of bow and arrows). A push-in on Arjuna as the bow leaves his hand; the 3D armies behind him out of focus (depth of field), dust drifting.'),
    dict(id='time', text='Krishna shows his supreme form. “I am Time.”', estVoice=3.6, pre=200, post=1300, emphasis=['Time'], amb='heaven', music='awe',
         foley=['breath', 'thunder'], pal='release-gold', cam='pull', signature=True,
         note='THE SIGNATURE SHOT AND THE ONE LONG HOLD (CE 6.33.9 paramam rupam aishvaram; 6.33.12 the light of a thousand suns; 6.33.19, 25 mouths of blazing fire; 6.33.26-29 both armies, Bhishma, Drona and Karna among them, streaming in like moths into a flame; 6.33.32 kalo \'smi). A SUB DROP INTO THE SHOT. 3D divine light: a white core, glowing tubes of light, a shockwave across the plain, particle streams; the drawn form (many faces, many arms) above Arjuna; the camera pulls back from him.'),
    dict(id='promise', text='Taken from the Critical Edition, the text scholars read. Nothing added for effect.', estVoice=5.0, pre=150, post=300, amb='night-fire', ambLead=300, music='calm', foley=['leaf', 'rustle'],
         pal='naimisha-bluehour', cam='tilt', tr='brush', rest=True,
         note='The series\' promise, worded to be true (TEASER-CHECK.md, "The promise"). Palm leaves with lines of Sanskrit-like strokes (not letters) and, as they pass, the references of the verses this teaser used. After the peak the sound comes down to the drone and the motif.'),
    dict(id='endcard', text='Follow. Episode one is waiting.', estVoice=2.2, pre=200, post=2000, caption=False, beat='end', music='awe', foley=['staff'], sfx=['bell-low'],
         pal='arrival-umber-gold', cam='push',
         note='THE END CARD, held and always moving: MAHABHARATAM large, FOLLOW in a ring that beats, "Episode 1 · The Storyteller Arrives", the source line ONLY. ONE STRUCK RESOLVE on the cut; it rings under the card.'),
]
MIXDB = {'cousins': -3, 'needle': -2, 'gather': -1, 'bhishma': -3, 'drona': -3, 'karna': -2.5, 'arjuna': -2.5, 'krishna': -2, 'conch': 1.5, 'between': 2, 'lowers': 1, 'time': 2.5, 'promise': -3, 'endcard': -1}
for l in lines:
    if l['id'] in MIXDB: l['mixDb'] = MIXDB[l['id']]
for l in lines:
    if l['id'] in keep and keep[l['id']] is not None and 'estVoice' in l:
        l['estVoice'] = keep[l['id']]

sc = {
    'lang': 'en',
    'fonts': {'caption': "'EB Garamond'", 'display': "'Cinzel'"},
    'timing': {'wordsPerSecond': 2.4, 'voiceGap': 0.2, 'voiceLead': 0.12, 'tail': 0.0, 'frameSnap': True},
    'voice': {'note': 'tools/voice2.py (Chatterbox, the bm_daniel reference, one take a line, no stretch); names from voice/names.json'},
    'captionBand': {'y': 1400, 'kinetic': True},
    'episode': 96,
    'kind': 'trailer',
    'teaser': 1,
    'cut': 3,
    'noStops': True,
    'credits': 'source-only',
    'source': ('THE WAR TEASER (pipeline number 96; never a numbered episode). About a minute: why the war happens, the principal figures '
               'introduced one at a time, the conches, the chariot between the armies, the universal form. Every beat read in the constituted text of '
               'the BORI Critical Edition (GRETIL, lab/ce/): script/TEASER-CHECK.md. In short: 1.107.1, 5.125.26, 1.2.234 and 6.23.1, 5.153.26 and 1.94.86-90, '
               '1.122.39-40 and 1.2.26, 1.104.11 and 5.165.27, 5.7.17-20 and 5.7.35, 6.23.12-20, 6.23.20-26 and 6.23.47, 6.33.9-32.'),
    'structure': ('TITLE over the 3D field (sound on frame 0) -> WHY: the throne, the refusal -> THE FIELD (3D) -> SIX INTRODUCTIONS, slow, one at a time '
                  '(Duryodhana in the refusal; Bhishma, Drona, Karna; Arjuna, Krishna) -> a rest (a dip) -> THE WAR RUN: conches, arrows, the chariot between '
                  'the armies, the bow lowered -> THE PEAK: the universal form, "I am Time" -> the promise -> the end card.'),
    'names': {
        'Duryodhana': 'eldest of the hundred',
        'Kurukshetra': 'the field of the Kurus',
        'Bhishma': 'the grandsire, sworn never to rule',
        'Kauravas': 'Duryodhana and his brothers',
        'Drona': 'teacher of both sides',
        'Karna': "born in armour, the Sun's son",
        'Arjuna': 'the archer of the five',
        'Krishna': 'of the Vrishnis, the charioteer',
        'Time': "kalo 'smi (6.33.32)",
        'Critical': 'the BORI Critical Edition',
        'Edition': 'the BORI Critical Edition',
    },
    'plaques': {
        'Duryodhana': ['eldest of the hundred', 'Udyoga 5.125.26'],
        'Bhishma': ['the grandsire, sworn never to rule', 'Udyoga 5.153.26'],
        'Drona': ['teacher of both sides', 'Adi 1.122.40'],
        'Karna': ["born in armour, the Sun's son", 'Udyoga 5.165.27'],
        'Arjuna': ['the archer of the five', 'Udyoga 5.7.19'],
        'Krishna': ['of the Vrishnis, the charioteer', 'Udyoga 5.7.35'],
    },
    'loop': {'hookQuestion': 'Why do two armies of one family meet at Kurukshetra?', 'answeredBy': 'needle',
             'openQuestion': 'How does the telling begin? (episode 1)', 'prevAnsweredBy': None},
    'hookStyle': 'title',
    'strings': {
        'seriesTitle': 'Mahabharatam', 'seriesSubtitle': 'As Vyasa Told It',
        'episodeLabel': 'Mahabharatam', 'episodeTitle': 'As Vyasa Told It', 'episodeSeparator': ' · ',
        'nextEpisodeLabel': 'Episode 1', 'nextTitle': 'The Storyteller Arrives', 'followWord': 'Follow',
        'sourceLine': 'Text: the Mahabharata · BORI Critical Edition',
    },
    'lines': lines,
}
json.dump(sc, open(OUT, 'w'), indent=1, ensure_ascii=False)
open(OUT, 'a').write('\n')
link = f'{ROOT}/script/ep96.en.json'
if not os.path.islink(link):
    os.symlink('teaser.en.json', link)
print('wrote', os.path.relpath(OUT, ROOT), len(lines), 'lines')
