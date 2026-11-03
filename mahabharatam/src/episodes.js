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
  };
  const q = new URLSearchParams(location.search);
  const ep = +(q.get('ep') || 1);
  R.ep = EPISODES[ep] ? ep : 1;
  R.EPISODES = EPISODES;
  // Parser-inserted scripts written here run in order, before src/runtime.js.
  for (const f of EPISODES[R.ep]) document.write(`<script src="src/scenes/${f.includes('/') ? f : R.epTag() + '/' + f}.js"><\/script>`);
})();
