/*
 * Episodes: which scene files make up each episode. Loaded by index.html after
 * the engine and the kit, before the runtime:
 *
 *   index.html?ep=2&lang=en  →  REEL.ep = 2, scenes from src/scenes/ep02/
 *
 * Scenes register themselves by line id (REEL.scene), so each episode's
 * script/epNN.<lang>.json lines are matched to these files' scenes. The kit
 * (src/kit/, src/kit/characters/) is shared by every episode.
 */
(function () {
  'use strict';
  const R = window.REEL;
  const EPISODES = {
    1: ['s1-before', 's2-forest', 's3-name', 's4-fire', 's5-asked', 's6-vyasa', 's7-episode'],
    2: ['_common', 's1-ask', 's2-answer', 's3-parashurama', 's4-kings', 's5-lakes', 's6-pitrs', 's7-dawn', 's8-episode'],
  };
  const q = new URLSearchParams(location.search);
  const ep = +(q.get('ep') || 1);
  R.ep = EPISODES[ep] ? ep : 1;
  R.EPISODES = EPISODES;
  // Parser-inserted scripts written here run in order, before src/runtime.js.
  for (const f of EPISODES[R.ep]) document.write(`<script src="src/scenes/${R.epTag()}/${f}.js"><\/script>`);
})();
