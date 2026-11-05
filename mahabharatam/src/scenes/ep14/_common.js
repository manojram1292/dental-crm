/*
 * Episode 14 · shared pieces (not a scene). AS TRADITION TELLS IT: every scene but the
 * cliffhanger and the Next card carries KIT.series.traditionTag (EP14.tag) at the top.
 *
 * LOCATION AND LIGHT: THE DARKENED WORLD. The white sea of episode 13 (EP13.whiteSea) under
 * the poison: o.dark drains it to slate and night, the poison's smoke (EP13.poison) towers
 * from the centre; the only lights are the figures' own: Brahma's ivory, then Shiva's ash-white
 * and the deep blue of his throat, which becomes the key light (EP14.throatLight).
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP13 = window.EP13;
  const { clamp } = R;
  const EP14 = (window.EP14 = {});
  EP14.mouth = EP13.mouth; EP14.plaque = EP13.plaque;
  EP14.tag = (ctx, T, a, S) => KIT.series.traditionTag(ctx, T, clamp(a), S, { y: 196 });
  EP14.throatLight = (x, y, sx, sy, k = 1) => ({ dir: Math.atan2(sy - (y - 600), sx - x), intensity: k, front: 0.4 });
  /** The small source line under the tag (frame scene). */
  EP14.source = (ctx, a, text) => {
    if (a <= 0.01 || !text) return;
    // (remaster) phone-legible: 40 px upright on a dark scrim, split into two lines at ' · '
    const parts = String(text).split(' · ');
    ctx.save(); ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.font = R.font(40, 'caption', 600);
    const w = Math.max(...parts.map((q) => ctx.measureText(q).width));
    ctx.fillStyle = 'rgba(8,6,10,0.72)'; ctx.beginPath(); ctx.roundRect(KIT.CX - w / 2 - 30, 226, w + 60, 50 * parts.length + 24, 14); ctx.fill();
    ctx.fillStyle = '#f2e6c8'; ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = R.px(6);
    parts.forEach((q, i) => ctx.fillText(q, KIT.CX, 266 + i * 50)); ctx.restore();
  };
})();
