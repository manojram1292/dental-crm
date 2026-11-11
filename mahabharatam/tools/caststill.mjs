#!/usr/bin/env node
/*
 * Test stills of the episode 41–50 cast (the acting figures and the creatures), large and lit, on three grounds.
 *   node tools/caststill.mjs [--outdir lab/kit41]
 * Uses the kit lab reel's page (ep 99) only as a canvas with the whole kit loaded.
 */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, args, openReel, dataUrlToBuffer } from './lib.mjs';
const a = args(), outdir = path.resolve(ROOT, a.outdir || 'lab/kit41/v2');
fs.mkdirSync(outdir, { recursive: true });
const reel = await openReel({ scale: 0.5, ep: 99, grain: 0 });
const SHEETS = {
  'cast-bhrigus': { pal: 'hermitage-green', rows: [['bhrigu:curse', 'puloma:carry', 'puloman:point'], ['chyavanaChild:stand', 'pramati:speak', 'ruru:raise']] },
  'cast-ruru': { pal: 'grief-blue', rows: [['pramadvara:attend', 'sthulakesha:bless', 'menaka:offer'], ['vishvavasu:anjali', 'devaduta:speak', 'dharma:bless']] },
  'cast-vyasa-begins': { pal: 'satra-teal-night', rows: [['vyasaSage:speak', 'vaishampayanaSage:bow', 'kingJanamejaya:anjali'], ['sahasrapat:bless', 'khagama:recoil', 'parashara:bless']] },
  'cast-yamuna': { pal: 'fishers-coral', rows: [['uparichara:stand', 'girika:attend', 'dasha:carry'], ['satyavati:row', 'vyasaChild:anjali', 'kuruPrince:point']] },
};
const page = reel.pages[0];
try {
  for (const [name, sh] of Object.entries(SHEETS)) {
    const url = await page.evaluate((sh) => {
      const R = window.REEL, KIT = window.KIT, ST = KIT.stage, CH = KIT.characters, c = window.__reelCanvas, g = c.getContext('2d');
      R.resetCtx(g);
      ST.shot(g, 1.3, { pal: sh.pal, layers: [{ z: 0, draw: (q, p) => ST.sky(q, p, { hz: 1920 }) }], grade: 0.3 });
      const p = ST.pal(sh.pal);
      sh.rows.forEach((row, r) => row.forEach((it, i) => {
        const [id, pose] = it.split(':'), x = 190 + i * 350, y = 900 + r * 880;
        g.fillStyle = 'rgba(0,0,0,0.18)'; g.beginPath(); g.ellipse(x, y + 6, 150, 18, 0, 0, 7); g.fill();
        CH[id].draw(g, { x, y, scale: 0.72, facing: i === 2 ? 'left' : 'right', pose: { name: pose, k: 1 }, light: ST.light(p, { from: [i === 2 ? 100 : 980, 300], at: [x, y] }), expression: { emo: ['calm', 'tender', 'resolve'][i] }, t: 1.3 + i });
        KIT.type.tag(g, 0, 1, id, { x, y: y + 70, size: 30 });
      }));
      return c.toDataURL('image/png');
    }, sh);
    fs.writeFileSync(path.join(outdir, `${name}.png`), dataUrlToBuffer(url));
    console.log(`wrote ${path.relative(ROOT, path.join(outdir, name + '.png'))}`);
  }
  // creatures, and three faces of one close-up
  const url2 = await page.evaluate(() => {
    const R = window.REEL, KIT = window.KIT, ST = KIT.stage, CH = KIT.characters, c = window.__reelCanvas, g = c.getContext('2d');
    R.resetCtx(g); const p = ST.pal('thicket-shade');
    ST.shot(g, 1, { pal: p, layers: [{ z: 0, draw: (q, pp) => ST.sky(q, pp, { hz: 1920 }) }], grade: 0.3 });
    const L = (x, y) => ST.light(p, { from: [540, 0], at: [x, y], front: 0.8 });
    CH.boar.draw(g, { x: 560, y: 470, scale: 0.6, pose: { name: 'run', phase: 1 }, light: L(560, 470), t: 1 });
    CH.dundubha.draw(g, { x: 300, y: 820, scale: 0.6, facing: 'right', pose: { name: 'rise', k: 1 }, light: L(300, 820), t: 1 });
    CH.viper.draw(g, { x: 800, y: 820, scale: 0.7, pose: { name: 'strike', k: 0 }, light: L(820, 820), t: 1 });
    CH.hawk.draw(g, { x: 300, y: 1180, scale: 0.42, pose: { name: 'fly', phase: 0.6, packet: true }, light: L(300, 1100), t: 1 });
    CH.fish.draw(g, { x: 760, y: 1200, scale: 0.44, pose: { name: 'swim', phase: 1 }, light: L(760, 1100), t: 1 });
    CH.hearthfire.draw(g, { x: 200, y: 1800, scale: 0.5, t: 1.2, k: 1, key: 'a' });
    CH.hearthfire.draw(g, { x: 540, y: 1800, scale: 0.5, t: 1.6, k: 0.55, dark: 0.8, key: 'b' });
    CH.hearthfire.draw(g, { x: 880, y: 1800, scale: 0.5, t: 2.2, k: 1, pure: 1, key: 'c' });
    for (const [id, x, y] of [['boar', 560, 520], ['dundubha', 300, 870], ['viper', 820, 870], ['hawk', 300, 1320], ['fish', 760, 1320], ['hearthfire', 200, 1860], ['cursed', 540, 1860], ['pure', 880, 1860]]) KIT.type.tag(g, 0, 1, id, { x, y, size: 28 });
    return c.toDataURL('image/png');
  });
  fs.writeFileSync(path.join(outdir, 'cast-creatures.png'), dataUrlToBuffer(url2));
  const url3 = await page.evaluate(() => {
    const R = window.REEL, KIT = window.KIT, ST = KIT.stage, CH = KIT.characters, c = window.__reelCanvas, g = c.getContext('2d');
    R.resetCtx(g); const p = ST.pal('arrival-umber-gold');
    ST.shot(g, 1, { pal: p, layers: [{ z: 0, draw: (q, pp) => ST.sky(q, pp, { hz: 1920 }) }], grade: 0.3 });
    [['vyasaSage', 'weary', 540, 2380], ['bhrigu', 'wrath', 540, 3020], ['ruru', 'sorrow', 540, 3660]].forEach(([id, emo, x, y], i) => {
      g.save(); g.beginPath(); g.rect(0, i * 640, 1080, 640); g.clip();
      CH[id].draw(g, { x: 700, y, scale: 2.4, facing: 'left', pose: 'stand', light: ST.light(p, { from: [100, i * 640], at: [600, i * 640 + 600], front: 0.85 }), expression: { emo, gaze: [-0.4, 0.1] }, t: 0.7, key: 'cu' + i });
      g.restore(); KIT.type.tag(g, 0, 1, `${id} · ${emo}`, { x: 230, y: i * 640 + 90, size: 30 });
    });
    return c.toDataURL('image/png');
  });
  fs.writeFileSync(path.join(outdir, 'cast-faces.png'), dataUrlToBuffer(url3));
  console.log('wrote cast-creatures.png, cast-faces.png');
  const errs = await reel.drainErrors();
  if (errs.length) { console.log(errs.slice(0, 8).join('\n')); process.exitCode = 1; }
} finally { await reel.close(); }
