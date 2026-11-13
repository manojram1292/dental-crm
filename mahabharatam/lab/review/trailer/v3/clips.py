"""Trailer v3 · the voice clips. One clip = one sentence (or one run of short sentences said in one breath); never part of one.
id → (text given to the model, kind, level offset dB, exaggeration, takes). EXPOSED lines get 12 takes, the rest 7."""
CLIPS = {
 'vow': ("Long ago, a prince swears away his throne and his line.", 'plain', 0, 0.5, 12),
 'river': ("A mother gives her first-born to the river.", 'slow', -1.5, 0.4, 12),
 'cousins': ("A hundred brothers. Five cousins. One throne.", 'plain', 0, 0.5, 7),
 'lac': ("A palace, built to burn.", 'plain', 0, 0.5, 7),
 'demon': ("Bhima breaks a man-eating demon.", 'hard', 0.5, 0.55, 7),
 'altar': ("A woman rises from a fire altar.", 'plain', 0, 0.5, 7),
 'wheel': ("Krishna lets the wheel fly.", 'plain', 0.5, 0.5, 7),
 'dice1': ("Then, the dice.", 'hard', 1, 0.5, 12),
 'stakes': ("A king stakes his kingdom, his brothers, his wife.", 'hard', 1, 0.55, 12),
 'cloth1': ("They pull at her cloth.", 'plain', -0.5, 0.45, 7),
 'cloth2': ("The cloth does not end.", 'plain', -0.5, 0.45, 7),
 'exile': ("Thirteen years of exile.", 'plain', 0, 0.5, 7),
 'needle': ("Duryodhana will not give a needle-point of earth.", 'hard', 1, 0.55, 12),
 'armies': ("Two armies stand ready for war.", 'hard', 1, 0.55, 7),
 'bow': ("Arjuna lowers his bow.", 'plain', 0, 0.45, 7),
 'v1': ("He asks to see.", 'plain', 0, 0.45, 12),
 'v2': ("Krishna shows him everything.", 'awe', 0.5, 0.55, 12),
 'v3': ("I am Time.", 'awe', 1, 0.55, 12),
 'arrows': ("Bhishma falls on a bed of arrows.", 'hard', 1, 0.55, 7),
 'boy': ("A boy, alone against many.", 'hard', 1, 0.55, 7),
 'mud': ("Karna's wheel, sunk in the earth.", 'hard', 1, 0.55, 7),
 'curse': ("A mother of a hundred sons curses Krishna.", 'plain', 0, 0.5, 7),
 'dog': ("And at the end, a king will not abandon his dog.", 'slow', -1.5, 0.4, 12),
 'w1': ("It calls itself itihasa.", 'slow', -1, 0.4, 12),
 'itihaasa': ("Iti. Ha. Aasa.", 'parts', 0, 0.45, 12),
 'w3': ("So indeed it was.", 'plain', 0.5, 0.5, 12),
 'p1': ("Every book. Every vow. Every war.", 'plain', 0.5, 0.5, 12),
 'first': ("From the first verse to the last.", 'plain', 0, 0.5, 12),
 'nothing': ("Nothing added for effect.", 'plain', 0, 0.45, 12),
 'making': ("We are making this, episode by episode.", 'plain', 0, 0.45, 12),
 'support': ("If you want it told this way, follow and support the series.", 'plain', 0, 0.45, 12),
 'endcard': ("Episode one is waiting.", 'plain', 0.5, 0.5, 12),
}
# the caption's words where the model is given another spelling
SCRIPT_TEXT = {'lac': "A palace built to burn.", 'altar': "A woman rises from a fire-altar.", 'dice1': "Then the dice.", 'itihaasa': "Iti. Ha. Asa.", 'v3': "“I am Time.”"}
REF = 'Kokoro bm_daniel reading a calm storyteller passage at 0.8 speed (lab/review/trailer/v3/voice/ref_daniel.wav): chosen from five references by measurement: fewest pitch jumps (0.08 a second), least creak (0.2 %), warmest tilt, takes within 1.7 semitones of each other'
if __name__ == '__main__':
    import json, sys
    ref = sys.argv[1]
    json.dump([{'id': k, 'text': t, 'ref': ref, 'exag': ex, 'temp': 0.7, 'seeds': list(range(n))} for k, (t, kind, off, ex, n) in CLIPS.items()], open(sys.argv[2], 'w'), indent=1)
    print(sum(v[4] for v in CLIPS.values()), 'takes')
