import fs from 'node:fs';
import { openReel, dataUrlToBuffer } from './lib.mjs';
const reel = await openReel({ scale: 0.5, ep: 99, grain: 0 });
const url = await reel.pages[0].evaluate(() => {
  const R = window.REEL, KIT = window.KIT, ST = KIT.stage, CH = KIT.characters, c = window.__reelCanvas, g = c.getContext('2d');
  R.resetCtx(g); const p = ST.pal('hearth-amber');
  ST.shot(g, 1.3, { pal: p, layers: [{ z: 0, draw: (q, pp) => ST.sky(q, pp, { hz: 1920 }) }], grade: 0.3 });
  CH.hearthfire.draw(g, { x: 540, y: 1700, scale: 1.5, t: 1.3, k: 1.1 });
  CH.puloman.draw(g, { x: 230, y: 1750, scale: 1.25, facing: 'right', pose: { name: 'stand', k: 1 }, light: ST.backlight(p, { from: [540, 1200], at: [230, 1700], k: 1.1 }), expression: { emo: 'wrath' }, t: 1.3 });
  CH.puloman.draw(g, { x: 860, y: 1750, scale: 1.25, facing: 'left', pose: { name: 'point', k: 1 }, light: ST.light(p, { from: [540, 1200], at: [860, 1700], front: 0.6 }), expression: { emo: 'resolve' }, t: 2.3, key: 'b' });
  return c.toDataURL('image/png'); });
fs.writeFileSync(process.argv[2], dataUrlToBuffer(url)); console.log((await reel.drainErrors()).slice(0, 4).join('\n')); await reel.close();
