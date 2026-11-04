/*
 * Ep 12 · line "next" · the short, silent Next card: a glimpse of episode 13, "What Rose from
 * the Ocean": the full Moon rising out of the white sea beside the turning mountain; then the
 * fire rises and the first frame returns (loop).
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP11 = window.EP11, EP12 = window.EP12;
  function glimpse(g, T) {
    EP11.sea(g, T, { milk: 0.9, jewels: 0, hz: 1050, after: (q) => {
      KIT.glow(q, 760, 700, 600, '#f4f8ff', 0.8);
      q.fillStyle = '#f8faff'; q.beginPath(); q.arc(760, 700, 150, 0, R.TAU); q.fill();
      EP12.churn(q, T, { cx: 420, y: 1500, s: 0.42, spin: T * 0.6, wrap: 1, hosts: 0 });
      EP11.surf(q, 1450, T, 1, { color: '#ffffff', deep: '#e8e8f8', deep2: '#a0a0c8' });
    } });
  }
  KIT.series.loopNextScene({ id: 'next', picture: glimpse, focus: [560, 1000], zoom: 0.5 });
})();
