/* Ep 13 · line "recap" · RECAP · episode 12's key image as a memory: the rig on the tortoise, the hosts at either end. */
(function () {
  'use strict';
  const KIT = window.KIT, EP11 = window.EP11, EP12 = window.EP12;
  function picture(g, T) {
    EP11.sea(g, T, { hz: 1000, jewels: 0.3, after: (q) => { EP12.churn(q, T, { cx: 540, y: 1560, s: 0.52, spin: T * 0.5, wrap: 1, hosts: 1, pull: Math.sin(T) }); EP11.surf(q, 1520, T, 1, { color: '#dfe6ff', deep: '#1e2a6a', deep2: '#060a24' }); } });
  }
  KIT.series.recapScene({ id: 'recap', focus: [540, 1250], zoom: 0.7, picture, fadeIn: 0.3 });
})();
