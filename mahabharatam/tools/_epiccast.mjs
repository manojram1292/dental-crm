// Test still of the epic cast (src/kit/characters/epic-cast.js): node tools/_epiccast.mjs [--out file.png]
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, args, openReel, dataUrlToBuffer } from './lib.mjs';
const a = args(), out = path.resolve(ROOT, a.out || 'lab/review/trailer/epic-cast.png');
fs.mkdirSync(path.dirname(out), { recursive: true });
const reel = await openReel({ scale: 0.5, ep: 99, grain: 0 });
const rows = [['epicKrishna:bless', 'epicBhishma:stand', 'epicKarna:stand', 'epicDuryodhana:stand', 'epicArjuna:stand'], ['epicBhima:stand', 'epicYudhishthira:speak', 'epicShakuni:offer', 'epicDraupadi:attend', 'epicGandhari:grieve'], ['epicKunti:carry', 'epicAbhimanyu:stand', 'epicHidimba:reach', 'epicDevavrata:raise', 'epicPilgrim:walk']];
const url = await reel.pages[0].evaluate((rows) => {
  const R = window.REEL, KIT = window.KIT, ST = KIT.stage, CH = KIT.characters, c = window.__reelCanvas, g = c.getContext('2d');
  R.resetCtx(g); const pal = 'seat-ivory';
  ST.shot(g, 1.3, { pal, layers: [{ z: 0, draw: (q, p) => ST.sky(q, p, { hz: 1920 }) }], grade: 0.3 });
  const p = ST.pal(pal);
  rows.forEach((row, r) => row.forEach((it, i) => { const [id, pose] = it.split(':'), x = 120 + i * 212, y = 600 + r * 620;
    CH[id].draw(g, { x, y, scale: 0.42, facing: i > 2 ? 'left' : 'right', pose: { name: pose, k: 1 }, light: ST.light(p, { from: [i > 2 ? 100 : 980, 200], at: [x, y], front: 0.8 }), expression: { emo: 'calm' }, t: 1.3, key: 'ec' + id });
    KIT.type.tag(g, 0, 1, id.replace('epic', ''), { x, y: y + 50, size: 24 }); }));
  return c.toDataURL('image/png');
}, rows);
fs.writeFileSync(out, dataUrlToBuffer(url)); const errs = await reel.drainErrors(); for (const e of errs.slice(0, 5)) console.log(e.split('\n')[0]); await reel.close(); console.log('wrote', out);
