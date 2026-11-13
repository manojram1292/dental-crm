/*
 * Episodes: which scene files make up each episode. Loaded by index.html after
 * the engine and the kit, before the runtime:
 *
 *   index.html?ep=2&lang=en  →  REEL.ep = 2, scenes from src/scenes/ep02/
 *
 * Scenes register themselves by line id (REEL.scene), so each episode's
 * script/epNN.<lang>.json lines are matched to these files' scenes. The kit
 * (src/kit/, src/kit/characters/) is shared by every episode. An entry with a slash
 * ('ep02/_common') is another episode's file, relative to src/scenes/.
 */
(function () {
  'use strict';
  const R = window.REEL;
  const EPISODES = {
    // episode 0: THE INTRODUCTION (the channel's opening statement, a trailer): a montage of the series' places and figures,
    // three title moments (the hundred thousand verses, the Critical Edition, "made in code"); 'ep01/s2-forest' is episode 1's own walk
    0: ['ep02/_common', 'ep03/_common', 'ep04/_common', 'ep05/_common', 'ep06/_common', 'ep07/_common', 'ep08/_common', 'ep09/_common', 'ep10/_common', 'ep11/_common', 'ep12/_common', 'ep13/_common', 'ep14/_common', 'ep15/_common', 'ep17/_common', 'ep20/_common', '_common', 's1-hook', 's2-verses', 's3-ce', 's4-know', 's5-vyasa', 's6-edition', 's7-order', 's8-code', 's9-voices', 's10-essence', 's11-deeper', 'ep01/s2-forest', 's13-next'],
    1: ['ep02/_common', 's1-before', 's2-forest', 's3-name', 's4-fire', 's5-asked', 's6-vyasa', 's7-tease', 's8-next'],
    2: ['_common', 's0-recap', 's1-ask', 's2-answer', 's3-parashurama', 's4-kings', 's5-lakes', 's6-pitrs', 's7-dawn', 's8-next'],
    // 'ep02/_common': another episode's helpers (EP2.mouth, EP2.mandala: the field of five lakes)
    3: ['ep02/_common', 'ep04/_common', '_common', 's0-recap', 's1-ask', 's2-patti', 's3-grid', 's5-units', 's6-armies', 's7-days', 's8-tease', 's9-next'],
    // episode 4 (Team A): Vyasa's hermitage, Ganesha the scribe; recap uses episode 2's field and the army tiles
    4: ['ep02/_common', '_common', 's0-recap', 's1-hook', 's2-vyasa', 's3-scribe', 's4-dialogue', 's5-pause', 's6-tusk', 's7-disciple', 's8-next'],
    // episodes 5–6 (Team B): Kurukshetra by day, Sarama; Uttanka, Paushya's palace, the Naga world (episode 6's recap reuses episode 5's helpers)
    5: ['_common', 's0-recap', 's1-hook', 's2-rite', 's3-pup', 's4-beaten', 's5-mother', 's6-curse', 's7-afraid', 's8-tease', 's9-next'],
    6: ['ep05/_common', '_common', 'ep07/_common', 's0-recap', 's1-hook', 's2-ask', 's3-gave', 's4-warn', 's5-stolen', 's6-naga', 's7-anger', 's8-court', 's9-avenge', 's10-vow', 's11-next'],
    // episode 7 (Astika parva): the noon forest, Shamika's cow-pen hermitage, the red river, the palace on one pillar (recap reuses episode 6's court)
    7: ['ep05/_common', 'ep06/_common', '_common', 's0-recap', 's1-hook', 's2-hunt', 's3-ask', 's4-silent', 's5-snake', 's6-heard', 's7-curse', 's8-warn', 's9-tower', 's10-seventh', 's11-insect', 's12-strike', 's13-cliff', 's14-next'],
    // episode 8: the court, the snake-sacrifice ground (dawn, then ablaze), Indra's heaven (recap reuses episode 7's pavilion)
    8: ['ep05/_common', 'ep06/_common', 'ep07/_common', '_common', 's0-recap', 's1-hook', 's2-learn', 's3-vow', 's4-builder', 's5-priests', 's6-fall', 's7-pull', 's8-flee', 's9-safe', 's10-cliff', 's11-next'],
    // episode 9: Kashyapa's hermitage before sunrise (recap reuses episode 8's sacrifice; serpents from ep08/_common)
    9: ['ep05/_common', 'ep06/_common', 'ep07/_common', 'ep08/_common', '_common', 's0-recap', 's1-hook', 's2-wives', 's3-boon', 's4-kadru', 's5-vinata', 's6-granted', 's7-eggs', 's8-jars', 's9-cliff', 's10-next'],
    // episode 10: the hermitage before dawn (ep09/_common), Aruna's red light, the open sky at dawn, the shore of the ocean
    10: ['ep05/_common', 'ep06/_common', 'ep07/_common', 'ep08/_common', 'ep09/_common', '_common', 's0-recap', 's1-hook', 's2-shame', 's3-inside', 's4-name', 's5-curse', 's6-free', 's7-rise', 's8-dawn', 's9-cliff', 's10-next'],
    // episode 11 (from here on: cold open → title → recap → story → cliffhanger image → silent Next card that loops):
    // the shore, Meru in gold, the cosmic ocean (ep11/_common); the recap reuses episode 10's sky
    11: ['ep05/_common', 'ep06/_common', 'ep07/_common', 'ep08/_common', 'ep09/_common', 'ep10/_common', '_common', 's1-hook', 's2-recap', 's3-sisters', 's4-name', 's5-frame', 's6-meru', 's7-amrita', 's8-narayana', 's9-asuras', 's10-ocean', 's11-cliff', 's12-next'],
    // episode 12: the plain of the world by day (Mandara and its roots), the shore at evening, the deep, the churning rig (ep12/_common)
    12: ['ep05/_common', 'ep06/_common', 'ep07/_common', 'ep08/_common', 'ep09/_common', 'ep10/_common', 'ep11/_common', '_common', 's1-hook', 's2-recap', 's3-ask', 's4-mandara', 's5-ananta', 's6-carry', 's7-ocean', 's8-tortoise', 's9-rope', 's10-hold', 's11-cliff', 's12-next'],
    // episode 13: the churning by night, Indra's storm, the WHITE SEA lit from below (ep13/_common), the wonders one by one
    13: ['ep05/_common', 'ep06/_common', 'ep07/_common', 'ep08/_common', 'ep09/_common', 'ep10/_common', 'ep11/_common', 'ep12/_common', '_common', 's1-hook', 's2-recap', 's3-fire', 's4-rain', 's5-milk', 's6-frame', 's7-moon', 's8-shri', 's9-sura', 's10-kaustubha', 's11-dhanvantari', 's12-cliff', 's13-next'],
    // episode 14 (as tradition tells it): the darkened world under the poison, Shiva's light and the blue of his throat (ep14/_common)
    14: ['ep05/_common', 'ep06/_common', 'ep07/_common', 'ep08/_common', 'ep09/_common', 'ep10/_common', 'ep11/_common', 'ep12/_common', 'ep13/_common', '_common', 's1-hook', 's2-recap', 's3-frame', 's4-poison', 's5-spread', 's6-brahma', 's7-drink', 's8-hold', 's9-name', 's10-cliff', 's11-next'],
    // episode 15: the shore at violet dusk (the enchantress's light), the deep sky of the Sun, the Moon and Rahu (ep15/_common)
    15: ['ep05/_common', 'ep06/_common', 'ep07/_common', 'ep08/_common', 'ep09/_common', 'ep10/_common', 'ep11/_common', 'ep12/_common', 'ep13/_common', '_common', 's1-hook', 's2-recap', 's3-clamour', 's4-frame', 's5-enchantress', 's6-pot', 's7-rahu', 's8-sun', 's9-discus', 's10-head', 's11-eclipse', 's12-cliff', 's13-next'],
    // episode 16: the shore in battle at night (ep16/_common), dawn on the plain, the Naimisha fire closing the tale, the shore at sunrise
    16: ['ep05/_common', 'ep06/_common', 'ep07/_common', 'ep08/_common', 'ep09/_common', 'ep10/_common', 'ep11/_common', 'ep12/_common', 'ep13/_common', 'ep15/_common', '_common', 's1-hook', 's2-recap', 's3-clash', 's4-rocks', 's5-discus', 's6-nara', 's7-flee', 's8-restore', 's9-sauti', 's10-cliff', 's11-tail', 's12-next'],
    // episode 17 (the Garuda arc): the shore at sunset, the serpents' grove at night, Meru's summit, Kashyapa's hermitage, the ocean at dawn (ep17/_common)
    17: ['ep05/_common', 'ep06/_common', 'ep07/_common', 'ep08/_common', 'ep09/_common', 'ep10/_common', 'ep11/_common', 'ep12/_common', 'ep13/_common', 'ep15/_common', '_common', 's1-hook', 's2-recap', 's3-white', 's4-black', 's5-stakes', 's6-frame', 's7-order', 's8-refuse', 's9-curse', 's10-brahma', 's11-kashyapa', 's12-cliff', 's13-next'],
    // episode 18: the ocean from above and beneath (the fire under the sea), a night flashback, the far shore, the red sky, the hermitage (ep17/_common)
    18: ['ep05/_common', 'ep06/_common', 'ep07/_common', 'ep08/_common', 'ep09/_common', 'ep10/_common', 'ep11/_common', 'ep12/_common', 'ep13/_common', 'ep15/_common', 'ep17/_common', 's1-hook', 's2-recap', 's3-fly', 's4-deep', 's5-frame', 's6-sons', 's7-arrive', 's8-tail', 's9-lost', 's10-slave', 's11-aruna', 's12-cliff', 's13-next'],
    // episode 19: the hermitage, the burning sky, Indra's heaven reddened, the Naimisha clearing from above, the shore
    19: ['ep05/_common', 'ep06/_common', 'ep07/_common', 'ep08/_common', 'ep09/_common', 'ep10/_common', 'ep11/_common', 'ep12/_common', 'ep13/_common', 'ep15/_common', 'ep17/_common', 's1-hook', 's2-recap', 's3-hatch', 's4-rise', 's5-gods', 's6-agni', 's7-praise', 's8-dim', 's9-frame', 's10-mother', 's11-cliff', 's12-next'],
    // episode 20: the shore, the ocean in flight, the white heat of the Sun, Indra's storm, the island of Ramaniyaka at noon (ep20/_common)
    20: ['ep05/_common', 'ep06/_common', 'ep07/_common', 'ep08/_common', 'ep09/_common', 'ep10/_common', 'ep11/_common', 'ep12/_common', 'ep13/_common', 'ep15/_common', 'ep17/_common', '_common', 's1-hook', 's2-recap', 's3-order', 's4-fly', 's5-sun', 's6-faint', 's7-pray', 's8-rain', 's9-frame', 's10-command', 's11-cliff', 's12-ask', 's13-next'],
    // episode 21 (independent review adopted: ≤ 8-word hook, unvoiced recap band, short NEXT › overlay, no fire edge):
    // Ramaniyaka in late gold, the palm grove at evening (amber), the Nishadas' bay at moonrise (teal), the night sky of the blessing
    21: ['ep05/_common', 'ep06/_common', 'ep07/_common', 'ep08/_common', 'ep09/_common', 'ep10/_common', 'ep11/_common', 'ep12/_common', 'ep13/_common', 'ep15/_common', 'ep17/_common', 'ep20/_common', '_common', 's1-hook', 's2-ask', 's3-mother', 's4-demand', 's5-price', 's6-frame', 's7-food', 's8-nishadas', 's9-never', 's10-bless', 's11-cliff', 's12-next'],
    // episode 22: the bay under a storm of dust, the moonlit sand, the high mountain hermitage at dawn (rose and snow), the lake of the brothers (in the vision)
    22: ['ep05/_common', 'ep06/_common', 'ep07/_common', 'ep08/_common', 'ep09/_common', 'ep10/_common', 'ep11/_common', 'ep12/_common', 'ep13/_common', 'ep15/_common', 'ep17/_common', 'ep20/_common', 'ep21/_common', '_common', 's1-hook', 's2-dust', 's3-burn', 's4-come', 's5-wife', 's6-both', 's7-blessed', 's8-frame', 's9-father', 's10-welfare', 's11-hungry', 's12-cliff', 's13-next'],
    // episode 23: the tale as a red-ochre mural panel, the storm-green lake of the brothers, the ledge at dawn (a low angle), the holy grove of Alamba at violet twilight
    23: ['ep05/_common', 'ep06/_common', 'ep07/_common', 'ep08/_common', 'ep09/_common', 'ep10/_common', 'ep11/_common', 'ep12/_common', 'ep13/_common', 'ep15/_common', 'ep17/_common', 'ep20/_common', 'ep21/_common', 'ep22/_common', '_common', 's1-hook', 's2-tell', 's3-divide', 's4-curse1', 's5-curse2', 's6-lake', 's7-eat', 's8-seize', 's9-frame', 's10-rauhina', 's11-broke', 's12-cliff', 's13-next'],
    // episode 24: the world from above at midday (a white glare), Gandhamadana (green-gold, petals), an empty snow mountain at evening alpenglow, heaven at night under omens
    24: ['ep05/_common', 'ep06/_common', 'ep07/_common', 'ep08/_common', 'ep09/_common', 'ep10/_common', 'ep11/_common', 'ep12/_common', 'ep13/_common', 'ep15/_common', 'ep17/_common', 'ep20/_common', 'ep21/_common', 'ep22/_common', 'ep23/_common', '_common', 's1-hook', 's2-beak', 's3-name', 's4-nowhere', 's5-gandha', 's6-warn', 's7-plead', 's8-leave', 's9-frame', 's10-drop', 's11b-omens', 's11-cliff', 's12-next'],
    // episode 25: the Valakhilyas' blue-white rite at night, Indra's council hall under the omens, the sacrifice at bright morning, a hoofprint puddle at ground level, the hermitage before sunrise, heaven's walls
    25: ['ep05/_common', 'ep06/_common', 'ep07/_common', 'ep08/_common', 'ep09/_common', 'ep10/_common', 'ep11/_common', 'ep12/_common', 'ep13/_common', 'ep15/_common', 'ep17/_common', '_common', 's1-hook', 's2-omen', 's3-answer', 's4-frame', 's5-wood', 's6-leaf', 's7-laugh', 's8-rite', 's9-peace', 's10-born', 's11-cliff', 's12-next'],
    // episode 26: heaven's courtyard under a bruised green-violet storm (omens, dust), the compass of heaven from above, the Naimisha fire from directly above
    26: ['ep05/_common', 'ep06/_common', 'ep07/_common', 'ep08/_common', 'ep09/_common', 'ep10/_common', 'ep11/_common', 'ep12/_common', 'ep13/_common', 'ep15/_common', 'ep17/_common', '_common', 's1-hook', 's2-omens', 's3-arm', 's3b-indra', 's4-guard', 's5-dust', 's6-vayu', 's7-clear', 's8-fight', 's9-frame', 's10-flee', 's11-cliff', 's12-next'],
    // episode 27: the inner court all on fire (then white steam), the amrita's vault in cold steel-blue, the open sky at deep blue dusk
    27: ['ep03/_common', 'ep05/_common', 'ep06/_common', 'ep07/_common', 'ep08/_common', 'ep09/_common', 'ep10/_common', 'ep11/_common', 'ep12/_common', 'ep13/_common', 'ep15/_common', 'ep17/_common', 'ep26/_common', '_common', 's1-hook', 's2-fire', 's3-mouths', 's4-small', 's5-wheel', 's5b-made', 's6-slip', 's7-frame', 's8-serpents', 's9-blind', 's10-take', 's11-cliff', 's12-next'],
    // episode 28: the sky at first light over a cloud-sea (gold below, blue above), a white-gold sky for the banner, Indra's storm rolling in
    28: ['ep05/_common', 'ep06/_common', 'ep07/_common', 'ep08/_common', 'ep09/_common', 'ep10/_common', 'ep11/_common', 'ep12/_common', 'ep13/_common', 'ep15/_common', 'ep17/_common', '_common', 's1-hook', 's2-meet', 's3-pleased', 's4-above', 's5-deathless', 's6-granted', 's6b-ageless', 's7-frame', 's8-offer', 's9-mount', 's10-banner', 's11-both', 's12-cliff', 's13-next'],
    // episode 29: Indra's storm, a silver noon among high clouds (the feather), the sky after the storm with a rainbow, the fire through smoke
    29: ['ep05/_common', 'ep06/_common', 'ep07/_common', 'ep08/_common', 'ep09/_common', 'ep10/_common', 'ep11/_common', 'ep12/_common', 'ep13/_common', 'ep15/_common', 'ep17/_common', 'ep20/_common', '_common', 's1-hook', 's2-strike', 's3-laugh', 's4-honour', 's5-feather', 's6-friend', 's7-strong', 's8-frame', 's9-plan', 's10-boon', 's11-cliff', 's12-next'],
    // episode 30 (the Garuda arc's end): Ramaniyaka at dawn (pink sky, mist on the lagoon), the kusha grass at ground level, the Naimisha fire at first light, the serpents' grove at night
    30: ['ep05/_common', 'ep06/_common', 'ep07/_common', 'ep08/_common', 'ep09/_common', 'ep10/_common', 'ep11/_common', 'ep12/_common', 'ep13/_common', 'ep15/_common', 'ep17/_common', 'ep20/_common', '_common', 's1-hook', 's1b-wait', 's2-set', 's3-terms', 's4-agree', 's5-vinata', 's6-bathe', 's7-frame', 's8-lick', 's9-split', 's10-holy', 's11-cliff', 's12-next'],
    // episode 31 (the Astika arc; ep31/_common is the arc's shared module EPA): the holy places before dawn (indigo, ash-silver),
    // Brahma's rose-gold dawn on the snow, beneath the earth (Shesha's pearl light), Vasuki's hall in violet
    31: ['ep05/_common', 'ep06/_common', 'ep07/_common', 'ep08/_common', 'ep09/_common', 'ep10/_common', 'ep11/_common', 'ep12/_common', 'ep13/_common', 'ep15/_common', 'ep17/_common', 'ep20/_common', 'ep31/_common', 's1-hook', 's2-eldest', 's3-brothers', 's4-penance', 's5-bone', 's6-frame', 's7-ask', 's8-wish', 's9-unsteady', 's10-hold', 's11-still', 's12-friend', 's13-cliff', 's14-next'],
    // episode 32: the hall by its jewel-fire (ember under violet), the vision panels in the smoke, the memory in silver-blue, the forest at night in teal
    32: ['ep05/_common', 'ep06/_common', 'ep07/_common', 'ep08/_common', 'ep09/_common', 'ep10/_common', 'ep11/_common', 'ep12/_common', 'ep13/_common', 'ep15/_common', 'ep17/_common', 'ep20/_common', 'ep31/_common', '_common', 's1-hook', 's2-council', 's3-brahmins', 's4-bite', 's5-clouds', 's6-no', 's7-frame', 's8-elapatra', 's9-memory', 's10-brahma', 's11-astika', 's12-sister', 's13-cliff', 's14-next'],
    // episode 33: the wilderness at ochre dusk, inside the pit (top-light from the moon), first grey-rose dawn on the rim
    33: ['ep05/_common', 'ep06/_common', 'ep07/_common', 'ep08/_common', 'ep09/_common', 'ep10/_common', 'ep11/_common', 'ep12/_common', 'ep13/_common', 'ep15/_common', 'ep17/_common', 'ep20/_common', 'ep31/_common', '_common', 's1-hook', 's2-wander', 's3-pit', 's4-hang', 's5-rat', 's6-ask', 's7-answer', 's8-iam', 's9-stalk', 's10-agree', 's11-terms', 's12-cliff', 's13-next'],
    // episode 34: the deep forest in green-gold shafts, the hall in wedding gold, their chamber at evening (violet, one lamp), the sunset shaft
    34: ['ep05/_common', 'ep06/_common', 'ep07/_common', 'ep08/_common', 'ep09/_common', 'ep10/_common', 'ep11/_common', 'ep12/_common', 'ep13/_common', 'ep15/_common', 'ep17/_common', 'ep20/_common', 'ep31/_common', 'ep32/_common', 'ep33/_common', '_common', 's1-hook', 's2-search', 's3-cry', 's4-alms', 's5-came', 's6-name', 's7-frame', 's8-answer', 's9-wed', 's10-joy', 's11-if', 's12-agree', 's13-served', 's14-cliff', 's15-next'],
    // episode 35: the world above at the sandhya hour, the chamber in the red shaft, the chamber at night (one lamp), the hall at dawn
    35: ['ep05/_common', 'ep06/_common', 'ep07/_common', 'ep08/_common', 'ep09/_common', 'ep10/_common', 'ep11/_common', 'ep12/_common', 'ep13/_common', 'ep15/_common', 'ep17/_common', 'ep20/_common', 'ep31/_common', 'ep32/_common', 'ep33/_common', 'ep34/_common', '_common', 's1-hook', 's2-setting', 's3-lap', 's4-angry', 's5-ask', 's6-wake', 's7-eyes', 's8-insult', 's9-plead', 's10-asti', 's11-gone', 's12-named', 's13-cliff', 's14-next'],
    // episode 36: the birth light, a hermitage of Bhrigu's line at morning, the waxing moon over the serpent world, Janamejaya's court at night by torchlight
    36: ['ep05/_common', 'ep06/_common', 'ep07/_common', 'ep08/_common', 'ep09/_common', 'ep10/_common', 'ep11/_common', 'ep12/_common', 'ep13/_common', 'ep15/_common', 'ep17/_common', 'ep20/_common', 'ep31/_common', 'ep32/_common', 'ep33/_common', 'ep34/_common', 'ep35/_common', '_common', 's1-hook', 's2-afraid', 's3-child', 's4-never', 's5-rejoiced', 's6-wait', 's7-born', 's8-named', 's9-grew', 's10-hope', 's11-teacher', 's12-frame', 's13-cliff', 's14-next'],
    // episode 37: the court by torchlight, the road at blazing noon, the regrowth light (green-gold), the sacrifice ablaze now
    37: ['ep05/_common', 'ep06/_common', 'ep07/_common', 'ep08/_common', 'ep09/_common', 'ep10/_common', 'ep11/_common', 'ep12/_common', 'ep13/_common', 'ep15/_common', 'ep17/_common', 'ep20/_common', 'ep31/_common', 'ep32/_common', 'ep33/_common', 'ep34/_common', 'ep35/_common', 'ep36/_common', '_common', 's1-hook', 's2-asked', 's3-healer', 's4-met', 's5-test', 's6-bite', 's7-revive', 's8-witness', 's9-gold', 's10-could', 's11-fury', 's12-cliff', 's13-next'],
    // episode 38: the hall under the spell (a red shaft through the cracked vault), the plain at a smoky red noon, the gate, the enclosure at noon through smoke
    38: ['ep05/_common', 'ep06/_common', 'ep07/_common', 'ep08/_common', 'ep09/_common', 'ep10/_common', 'ep11/_common', 'ep12/_common', 'ep13/_common', 'ep15/_common', 'ep17/_common', 'ep20/_common', 'ep31/_common', 'ep32/_common', 'ep33/_common', 'ep34/_common', 'ep35/_common', 'ep36/_common', 'ep37/_common', '_common', 's1-hook', 's2-drag', 's3-told', 's4-promise', 's5-walk', 's6-gate', 's7-frame', 's8-praise', 's9-more', 's10-aside', 's11-king', 's12-cliff', 's13-next'],
    // episode 39: Indra's heaven under a rumour of smoke, the sky over the sacrifice (storm-black, gold chant-ropes), the fire, the serpent held in mid-air
    39: ['ep05/_common', 'ep06/_common', 'ep07/_common', 'ep08/_common', 'ep09/_common', 'ep10/_common', 'ep11/_common', 'ep12/_common', 'ep13/_common', 'ep15/_common', 'ep17/_common', 'ep20/_common', 'ep31/_common', 'ep32/_common', 'ep33/_common', 'ep34/_common', 'ep35/_common', 'ep36/_common', 'ep37/_common', 'ep38/_common', '_common', 's1-hook', 's2-hiding', 's3-order', 's4-chant', 's5-drag', 's6-frame', 's7-letgo', 's8-fall', 's9-boon', 's10-else', 's11-stay', 's12-hang', 's13-cliff', 's14-next'],
    // episode 40 (the arc finale): the fire sinking, the enclosure after the fire (cool blue dusk, embers), Vasuki's hall at full gold dawn, the night of the telling, the arc-end card
    40: ['ep04/_common', 'ep05/_common', 'ep06/_common', 'ep07/_common', 'ep08/_common', 'ep09/_common', 'ep10/_common', 'ep11/_common', 'ep12/_common', 'ep13/_common', 'ep15/_common', 'ep17/_common', 'ep20/_common', 'ep31/_common', 'ep32/_common', 'ep33/_common', 'ep34/_common', 'ep35/_common', 'ep36/_common', 'ep37/_common', 'ep38/_common', 'ep39/_common', '_common', 's1-hook', 's2-urge', 's3-grant', 's4-embers', 's5-builder', 's6-frame', 's7-thanks', 's8-wish', 's9-payoff', 's10-told', 's11-arcend', 's12-cliff', 's13-next'],
    // 99: the KIT LAB REEL (episode 41 step-up): one shot per new kit feature; never published (script/ep99.en.json)
    41: ['_common', 'scenes'],
    42: ['ep41/_common', 'scenes'],
    43: ['ep41/_common', 'scenes'],
    44: ['ep41/_common', '_common', 'scenes'],
    45: ['ep41/_common', 'ep44/_common', 'scenes'],
    46: ['ep41/_common', 'ep44/_common', '_common', 'scenes'],
    47: ['ep41/_common', 'ep46/_common', '_common', 'scenes'],
    48: ['ep41/_common', 'ep46/_common', 'ep47/_common', 'scenes'],
    49: ['ep41/_common', 'ep44/_common', '_common', 'scenes'],
    50: ['ep41/_common', 'ep46/_common', 'ep47/_common', 'ep49/_common', 'scenes'],
    // 51–60 (the burden of the Earth, the descent of the portions; Shakuntala; Kacha): places and beasts in ep51/_common
    51: ['ep41/_common', 'ep44/_common', 'ep46/_common', 'ep49/_common', '_common', 'scenes'],
    52: ['ep41/_common', 'ep44/_common', 'ep46/_common', 'ep49/_common', 'ep51/_common', 'scenes'],
    53: ['ep41/_common', 'ep44/_common', 'ep46/_common', 'ep49/_common', 'ep51/_common', 'scenes'],
    54: ['ep41/_common', 'ep44/_common', 'ep46/_common', 'ep49/_common', 'ep51/_common', 'scenes'],
    55: ['ep41/_common', 'ep44/_common', 'ep46/_common', 'ep49/_common', 'ep51/_common', 'scenes'],
    56: ['ep41/_common', 'ep44/_common', 'ep46/_common', 'ep49/_common', 'ep51/_common', 'scenes'],
    57: ['ep41/_common', 'ep44/_common', 'ep46/_common', 'ep49/_common', 'ep51/_common', 'scenes'],
    58: ['ep41/_common', 'ep44/_common', 'ep46/_common', 'ep49/_common', 'ep51/_common', 'scenes'],
    59: ['ep41/_common', 'ep44/_common', 'ep46/_common', 'ep49/_common', 'ep51/_common', 'scenes'],
    60: ['ep41/_common', 'ep44/_common', 'ep46/_common', 'ep49/_common', 'ep51/_common', 'scenes'],
    // 97: THE FULL-EPIC TRAILER (script/trailer.en.json, scenes in src/scenes/trailer/; never a numbered episode)
    97: ['ep41/_common', 'ep46/_common', 'ep49/_common', 'trailer/scenes'],
    // 98: THE SERIES INTRODUCTION reel (script/intro.en.json, scenes in src/scenes/intro/; never a numbered episode)
    98: ['ep41/_common', 'ep46/_common', 'ep49/_common', 'intro/scenes'],
    99: ['lab'],
  };
  const q = new URLSearchParams(location.search);
  const ep = +(q.get('ep') || 1);
  R.ep = EPISODES[ep] ? ep : 1;   // 0 is the introduction
  R.EPISODES = EPISODES;
  // Parser-inserted scripts written here run in order, before src/runtime.js.
  for (const f of EPISODES[R.ep]) document.write(`<script src="src/scenes/${f.includes('/') ? f : R.epTag() + '/' + f}.js"><\/script>`);
})();
