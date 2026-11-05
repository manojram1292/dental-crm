/* Ep 0 · line "next" · the silent card: BEGIN · the niche opens on Sauti at the Naimisha fire · "Episode 1 · The Storyteller Arrives" under the series title; then the loop back to frame 1. */
(function () {
  'use strict';
  const KIT = window.KIT;
  function glimpse(g, T) {
    KIT.ashram.draw(g, T, { cycle: 0.8, speed: 0, smoke: { alpha: 0.3, lean: 10 }, teller: { x: 800, y: 1330, scale: 0.6, facing: 'left', pose: { name: 'speak', base: 'sit', k: 1 } } });
  }
  KIT.series.loopNextScene({ id: 'next', picture: glimpse, focus: [600, 1150], zoom: 0.6 });
})();
