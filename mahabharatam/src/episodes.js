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
  };
  const q = new URLSearchParams(location.search);
  const ep = +(q.get('ep') || 1);
  R.ep = EPISODES[ep] ? ep : 1;   // 0 is the introduction
  R.EPISODES = EPISODES;
  // Parser-inserted scripts written here run in order, before src/runtime.js.
  for (const f of EPISODES[R.ep]) document.write(`<script src="src/scenes/${f.includes('/') ? f : R.epTag() + '/' + f}.js"><\/script>`);
})();
