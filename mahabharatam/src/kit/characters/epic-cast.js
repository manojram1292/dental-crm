/*
 * CHARACTERS · THE EPIC CAST (the full-epic trailer, script/trailer.en.json). ACTING FIGURES (characters/actor.js), each
 * told apart at phone size by THREE things at once: a silhouette trait, a colour pair and what is on the head or in the
 * hand. No two share any of the three. Ids carry the prefix `epic` so they never collide with the provisional panel
 * figures of kuru-origins.js (yudhishthira, bhima, arjuna, karna, duryodhana, krishna), which stay as they are.
 *
 *   epicKrishna      KRISHNA: DARK BLUE skin, a YELLOW cloth (pītāntapaṭa, CE 6.55.88), a crown with a PEACOCK FEATHER,
 *                    a garland, a gold aura. The wheel is drawn by the scene.
 *   epicBhishma      BHISHMA, the grandsire: very tall, a long WHITE beard, WHITE and SILVER, a silver crown, a great BOW.
 *   epicDevavrata    the same man young (CE 1.94): a top-knot with a diadem, white and silver, no beard.
 *   epicKarna        KARNA: SUN-GOLD breast-armour and great EARRINGS that glow (sahajaṃ kavacaṃ … kuṇḍala, CE 1.104.11),
 *                    a deep red cloth, long loose hair, bare-headed.
 *   epicDuryodhana   DURYODHANA: broad, a tall IRON-AND-GOLD crown, NIGHT-PURPLE cloth, the MACE upright. A king, grave.
 *   epicArjuna       ARJUNA: lean, WHITE cloth, LEAF-GREEN sash, a diadem (kirīṭin), the BOW.
 *   epicBhima        BHIMA: the biggest man in the frame, bare-chested, RUST-RED cloth, thick curls, no crown.
 *   epicYudhishthira YUDHISHTHIRA: slight, IVORY and gold, a low crown, hands open; at the end a plain bark cloth.
 *   epicShakuni      SHAKUNI: narrow, a TURBAN, a pointed beard, PEACOCK-TEAL and violet.
 *   epicDraupadi     DRAUPADI (Kṛṣṇā, "the dark"): dusky, long LOOSE black hair, a FLAME-RED sari with a gold border.
 *   epicGandhari     GANDHARI: a WHITE-GREY sari, a white BLINDFOLD across the eyes, grey hair bound.
 *   epicKunti        KUNTI as a girl (CE 1.104): a pale YELLOW sari, a low bun with a flower.
 *   epicAbhimanyu    ABHIMANYU: a youth (smaller than the men), SKY-BLUE cloth, a top-knot, a short SWORD.
 *   epicHidimba      HIDIMBA the rakshasa (CE 1.139.2–3: tawny eyes, a great mouth, rough hair he shakes): huge, EMBER-RED
 *                    skin, wild hair, tusks, a black pelt. No horns (the horned one is Puloman).
 * A pose may carry `bare: true` to lay the hand-prop aside (the mace, the bow, the sword).
 * Face LEFT. (x, y) = the feet. scale 1 ≈ 1000 px to the crown of a grown man.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, CH = KIT.characters;
  const { TAU } = R;
  const bib = (name, role, sig) => ({ name, role, palette: sig, proportions: 'CH.actor', props: [], light: sig, voice: null });
  const A = (o) => { CH.actor(o); CH.ROSTER.push(o.id); };
  // figure space → the layer's space (the rig calls `after` once the figure is on the canvas)
  const at = (P, v, dx = 0, dy = 0) => { const sx = P.flip ? -1 : 1; return [P.x + sx * (v[0] + dx) * P.s, P.y + (v[1] + dy) * P.s]; };
  const bare = (P) => P.po && P.po.bare;
  const mace = (col, head) => (g, P, r) => { if (bare(P)) return; const sx = P.flip ? -1 : 1, s = P.s, [hx, hy] = at(P, r.nh), a = -Math.PI / 2 - sx * 0.16, L = 560 * s;
    g.save(); g.translate(hx, hy); g.rotate(a); g.fillStyle = '#1a1210'; g.fillRect(-150 * s, -11 * s, L + 150 * s, 22 * s); g.fillStyle = col; g.fillRect(-150 * s, -6 * s, L + 150 * s, 9 * s);
    g.fillStyle = '#1a1210'; g.beginPath(); g.ellipse(L + 60 * s, 0, 100 * s, 66 * s, 0, 0, TAU); g.fill(); g.fillStyle = head; g.beginPath(); g.ellipse(L + 60 * s, -4 * s, 90 * s, 56 * s, 0, 0, TAU); g.fill();
    g.strokeStyle = '#1a1210'; g.lineWidth = 5 * s; for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(L + 60 * s + i * 34 * s, -56 * s); g.lineTo(L + 60 * s + i * 30 * s, 52 * s); g.stroke(); }
    g.fillStyle = head; g.beginPath(); g.arc(L + 166 * s, 0, 18 * s, 0, TAU); g.fill(); g.restore(); };
  const bow = (col, len) => (g, P, r) => { if (bare(P)) return; const sx = P.flip ? -1 : 1, s = P.s, [hx, hy] = at(P, r.nh), h = len * s;
    g.save(); g.translate(hx, hy); g.scale(sx, 1); g.lineCap = 'round';
    g.strokeStyle = '#1a1008'; g.lineWidth = 26 * s; g.beginPath(); g.moveTo(40 * s, -h / 2); g.quadraticCurveTo(-150 * s, 0, 40 * s, h / 2); g.stroke();
    g.strokeStyle = col; g.lineWidth = 15 * s; g.beginPath(); g.moveTo(40 * s, -h / 2); g.quadraticCurveTo(-150 * s, 0, 40 * s, h / 2); g.stroke();
    g.strokeStyle = '#fff4d0'; g.lineWidth = 3.5 * s; g.beginPath(); g.moveTo(40 * s, -h / 2); g.lineTo(40 * s, h / 2); g.stroke(); g.restore(); };

  A({ id: 'epicKrishna', build: { h: 1.03, w: 1.04 }, skin: ['#040a26', '#2f55b0'], hair: { style: 'crown', color: '#d8a020', lit: '#ffe890' },
    lower: { kind: 'dhoti', color: '#f4c020', border: true }, upper: { kind: 'shawl', color: '#ffe060' }, rim: ['#8ab4ff', '#f0f6ff'], ornament: ['#e7b54a', '#fff4c0'], glow: 0.3,
    aura: { color: '#ffd870', r: 520, a: 0.45 }, jewels: { necklace: true, mala: true, earring: true, armlets: true, crownGems: true, tilak: true, sash: true }, tall: 260,
    after: (g, P, r) => { const sx = P.flip ? -1 : 1, s = P.s, [x, y] = at(P, r.head, 14, -250);   // the peacock feather over the crown
      g.save(); g.translate(x, y); g.rotate(sx * 0.28); g.fillStyle = '#0c5a3a'; g.beginPath(); g.ellipse(0, -70 * s, 36 * s, 96 * s, 0, 0, TAU); g.fill(); g.fillStyle = '#2ad0a0'; g.beginPath(); g.ellipse(0, -84 * s, 24 * s, 60 * s, 0, 0, TAU); g.fill();
      g.fillStyle = '#1a3ac8'; g.beginPath(); g.ellipse(0, -96 * s, 14 * s, 26 * s, 0, 0, TAU); g.fill(); g.fillStyle = '#ffd870'; g.beginPath(); g.arc(0, -100 * s, 7 * s, 0, TAU); g.fill(); g.restore(); },
    bible: bib('Krishna', 'Of the Vrishnis; Arjuna\'s friend and charioteer. He takes Shishupala\'s head with the wheel (CE 2.42.21), speaks between the armies (6.24), runs at Bhishma with the wheel raised and is held back (6.55.86–98), and is cursed by Gandhari (11.25).', 'Dark blue skin, a yellow cloth, a crown with a peacock feather, a gold aura.') });
  A({ id: 'epicBhishma', build: { h: 1.12, w: 1.08, leg: 1.06 }, skin: ['#1a100a', '#b8845a'], hair: { style: 'crown', crown: 'dome', color: '#b8c0cc', lit: '#f4f8ff' }, beard: { len: 1.0, color: '#f0f0ee' },
    lower: { kind: 'dhoti', color: '#eef0f4', border: true }, upper: { kind: 'shawl', color: '#aab4c4' }, rim: ['#d8e4ff', '#ffffff'], ornament: ['#c8d0e0', '#ffffff'], jewels: { necklace: true, armlets: true, sash: true }, tall: 200,
    after: bow('#c8d0e0', 900),
    bible: bib('Bhishma, the grandsire', 'Devavrata, who gave up the throne and vowed celibacy for his father (CE 1.94.86–90); commander of the Kurus; he falls on the tenth day and lies on a bed of arrows (6.114.81–85).', 'White and silver, a long white beard, a silver crown, a great bow.') });
  A({ id: 'epicDevavrata', build: { h: 1.08, w: 1.04, leg: 1.05 }, skin: ['#1a100a', '#c08a5e'], hair: { style: 'topknot', color: '#1a1210', lit: '#4a3a34' },
    lower: { kind: 'dhoti', color: '#eef0f4', border: true }, upper: { kind: 'shawl', color: '#aab4c4' }, rim: ['#d8e4ff', '#ffffff'], ornament: ['#c8d0e0', '#ffffff'], jewels: { necklace: true, armlets: true, crownGems: true, earring: true, sash: true },
    bible: bib('Devavrata (the young Bhishma)', 'The prince at the moment of the vow (CE 1.94.86–90).', 'White and silver, a diadem, no beard.') });
  A({ id: 'epicKarna', build: { h: 1.06, w: 1.1 }, skin: ['#1c0e06', '#c88a50'], hair: { style: 'flow', color: '#1a100a', lit: '#5a3a24' },
    lower: { kind: 'dhoti', color: '#a82418', border: true }, upper: { kind: 'shawl', color: '#f0b020' }, rim: ['#ffd070', '#fff8e0'], ornament: ['#ffc840', '#fffbe0'], glow: 0.35, aura: { color: '#ffc040', r: 420, a: 0.3 },
    jewels: { necklace: true, armlets: true, sash: true },
    after: (g, P, r) => { const s = P.s, [x, y] = at(P, r.head, 32, 52); KIT.glow(g, x, y, 90 * s, '#ffe890', 0.8); g.fillStyle = '#ffd040'; g.beginPath(); g.arc(x, y, 24 * s, 0, TAU); g.fill(); g.fillStyle = '#fffbe0'; g.beginPath(); g.arc(x - 5 * s, y - 6 * s, 9 * s, 0, TAU); g.fill(); },
    bible: bib('Karna', 'Kunti\'s first-born, born wearing armour and earrings, set on the river and raised by a charioteer and his wife Radha (CE 1.104.10–15; 3.292). His wheel is swallowed by the earth in his last fight (8.66.60–65).', 'Sun-gold breast-armour, great glowing earrings, a deep red cloth, loose hair.') });
  A({ id: 'epicDuryodhana', build: { h: 1.07, w: 1.24, arm: 1.04, limb: 1.15 }, skin: ['#180c08', '#a8704a'], hair: { style: 'crown', crown: 'broad', color: '#5a5a6a', lit: '#e7b54a' }, beard: { len: 0.14, color: '#120c0a', lit: '#3a2a24' },
    lower: { kind: 'dhoti', color: '#4a1a78', border: true }, upper: { kind: 'shawl', color: '#22103a' }, rim: ['#c8a0ff', '#fff0ff'], ornament: ['#e7b54a', '#fff0c0'], jewels: { necklace: true, earring: true, armlets: true, sash: true }, tall: 300,
    after: mace('#8a8aa0', '#b8b8c8'),
    bible: bib('Duryodhana', 'Eldest of Dhritarashtra\'s hundred sons (CE 1.107); he will not give back land the width of a needle\'s point (5.125.26). A great king of the text, drawn grave, never mean.', 'Night-purple and iron, a tall crown, the mace upright.') });
  A({ id: 'epicArjuna', build: { h: 1.03, w: 0.98 }, skin: ['#180e08', '#b88054'], hair: { style: 'topknot', color: '#1a1210', lit: '#4a3a34' },
    lower: { kind: 'dhoti', color: '#f4f4ec', border: true }, upper: { kind: 'shawl', color: '#3a9a4a' }, rim: ['#d0ffd8', '#ffffff'], ornament: ['#e7b54a', '#fff4c0'], jewels: { necklace: true, earring: true, armlets: true, crownGems: true, sash: true, thread: true }, tall: 200,
    after: bow('#e7b54a', 820),
    bible: bib('Arjuna', 'The archer among Pandu\'s five sons: he brings down the mark with five arrows and wins Draupadi (CE 1.179.16); between the armies he lets his bow fall (6.23.47).', 'White cloth, a leaf-green sash, a diadem, the bow.') });
  A({ id: 'epicBhima', build: { h: 1.16, w: 1.42, head: 1.04, arm: 1.1, limb: 1.4 }, skin: ['#1a0c06', '#b8744a'], hair: { style: 'curls', color: '#140c08', lit: '#4a2e20' },
    lower: { kind: 'dhoti', color: '#b8421c', border: true }, rim: ['#ffc890', '#fff4e0'], ornament: ['#e7b54a', '#fff0c0'], jewels: { armlets: true, necklace: true, sash: true },
    bible: bib('Bhima', 'The strongest of the five; in the forest he breaks the rakshasa Hidimba with his arms (CE 1.142.28–31).', 'The biggest man in the frame: bare-chested, rust-red cloth, thick curls, no crown.') });
  A({ id: 'epicYudhishthira', build: { h: 0.99, w: 0.94 }, skin: ['#180e08', '#c0906a'], hair: { style: 'crown', crown: 'low', color: '#c8a030', lit: '#fff0a0' },
    lower: { kind: 'dhoti', color: '#f4ecd4', border: true }, upper: { kind: 'shawl', color: '#e8d8a8' }, rim: ['#ffe8b0', '#ffffff'], ornament: ['#e7b54a', '#fff4c0'], jewels: { necklace: true, earring: true, thread: true },
    bible: bib('Yudhishthira', 'Eldest of the five; he stakes kingdom, brothers, himself and Draupadi at dice (CE 2.58); at the end he will not leave the dog that followed him (17.3.7).', 'Ivory and gold, a low crown, open hands.') });
  A({ id: 'epicPilgrim', build: { h: 0.99, w: 0.94 }, skin: ['#180e08', '#c0906a'], hair: { style: 'jata', color: '#8a8478', lit: '#e0dacc' }, beard: { len: 0.45, color: '#b8b2a4', lit: '#f0ece0' },
    lower: { kind: 'bark', color: '#b89a6a' }, upper: { kind: 'shawl', color: '#8a744a' }, rim: ['#ffffff', '#ffffff'], jewels: { thread: true },
    bible: bib('Yudhishthira on the last walk', 'The king who has laid his ornaments aside and walks north in bark cloth (CE 17.1).', 'Bark cloth, grey matted hair, no jewel.') });
  A({ id: 'epicShakuni', build: { h: 0.97, w: 0.86, head: 0.98 }, skin: ['#180e0a', '#b0825e'], hair: { style: 'shaven', color: '#1a1210', lit: '#4a3a34' }, beard: { len: 0.4, color: '#1a1210', lit: '#4a3a34' },
    lower: { kind: 'dhoti', color: '#0e7a7a', border: true }, upper: { kind: 'shawl', color: '#7a3aa8' }, rim: ['#a0fff0', '#ffffff'], ornament: ['#e7b54a', '#fff4c0'], jewels: { necklace: true, earring: true, sash: true }, tall: 120,
    after: (g, P, r) => { const sx = P.flip ? -1 : 1, s = P.s, [x, y] = at(P, r.head, 8, -78);   // the turban
      g.save(); g.translate(x, y); g.scale(sx, 1); g.fillStyle = '#0a2a2a'; g.beginPath(); g.ellipse(0, 0, 122 * s, 82 * s, -0.12, 0, TAU); g.fill(); g.fillStyle = '#18a098'; g.beginPath(); g.ellipse(0, -6 * s, 110 * s, 70 * s, -0.12, 0, TAU); g.fill();
      g.strokeStyle = '#0a4a4a'; g.lineWidth = 6 * s; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(-100 * s, -30 * s + i * 26 * s); g.quadraticCurveTo(0, -70 * s + i * 30 * s, 104 * s, -10 * s + i * 16 * s); g.stroke(); }
      g.fillStyle = '#ffd870'; g.beginPath(); g.arc(-70 * s, -10 * s, 15 * s, 0, TAU); g.fill(); g.restore(); },
    bible: bib('Shakuni', 'Gandhari\'s brother; he throws the dice for Duryodhana and says "Won!" after every throw (CE 2.53–54).', 'Narrow, a teal turban, a pointed beard, teal and violet.') });
  A({ id: 'epicDraupadi', build: { h: 0.97, w: 0.84, head: 0.98, arm: 0.94, bust: 0.62, hipW: 1.1 }, skin: ['#120806', '#96643e'], hair: { style: 'flow', color: '#0a0606', lit: '#3a2420' },
    lower: { kind: 'sari', color: '#d02a1a', border: true }, upper: { kind: 'pallu', color: '#f0502a' }, rim: ['#ffd0a0', '#fff8ec'], ornament: ['#ffd060', '#fffbe0'], jewels: { necklace: true, earring: true, bangles: true, tilak: true, anklets: true },
    bible: bib('Draupadi (Krishnaa)', 'She rises from the middle of the fire-altar (CE 1.155.41), garlands Arjuna (1.179.22), is dragged to the hall by her hair in a single cloth (2.60.22–28); when her cloth is pulled another appears, again and again (2.61.41).', 'Dusky, long loose black hair, a flame-red sari with a gold border.') });
  A({ id: 'epicGandhari', build: { h: 0.96, w: 0.86, bust: 0.56, hipW: 1.1, arm: 0.94 }, skin: ['#1a100c', '#c09878'], hair: { style: 'bun', color: '#6a6a70', lit: '#c8c8cc' },
    lower: { kind: 'sari', color: '#d8dce4', border: true }, upper: { kind: 'pallu', color: '#f0f2f6' }, rim: ['#e8f0ff', '#ffffff'], ornament: ['#c8c8d0', '#ffffff'], jewels: { bangles: true },
    after: (g, P, r) => { const sx = P.flip ? -1 : 1, s = P.s, [x, y] = at(P, r.head, -12, -10);   // the blindfold she took on for her husband's sake
      g.save(); g.translate(x, y); g.scale(sx, 1); g.fillStyle = '#fbfbff'; g.beginPath(); g.roundRect(-96 * s, -19 * s, 190 * s, 38 * s, 10 * s); g.fill(); g.strokeStyle = 'rgba(120,130,160,0.8)'; g.lineWidth = 3 * s; g.beginPath(); g.moveTo(-90 * s, 0); g.lineTo(90 * s, -2 * s); g.stroke();
      g.fillStyle = '#fbfbff'; g.beginPath(); g.moveTo(92 * s, -14 * s); g.lineTo(170 * s, 20 * s); g.lineTo(150 * s, 60 * s); g.lineTo(88 * s, 14 * s); g.fill(); g.restore(); },
    bible: bib('Gandhari', 'Mother of the hundred; she sees the field of the dead by a divine sight (CE 11.16.1–4) and curses Krishna (11.25.39–42).', 'A white-grey sari, a white blindfold, grey hair bound.') });
  A({ id: 'epicKunti', build: { h: 0.92, w: 0.8, head: 0.98, arm: 0.92, bust: 0.5, hipW: 1.06 }, skin: ['#1a0e08', '#c8946a'], hair: { style: 'bun', color: '#1a1210', lit: '#4a342c' },
    lower: { kind: 'sari', color: '#f0d870', border: true }, upper: { kind: 'pallu', color: '#fff0a8' }, rim: ['#fff0c0', '#ffffff'], ornament: ['#e7b54a', '#fff4c0'], jewels: { necklace: true, earring: true, bangles: true, flower: true, tilak: true },
    bible: bib('Kunti as a girl', 'Unmarried, she bears the Sun\'s son and sets him on the water for fear of her kin (CE 1.104.8–13; 3.292).', 'A pale yellow sari, a bun with a flower.') });
  A({ id: 'epicAbhimanyu', build: { h: 0.86, w: 0.9, head: 0.96, leg: 0.9 }, skin: ['#180e08', '#c08c5e'], hair: { style: 'topknot', color: '#1a1210', lit: '#4a3a34' },
    lower: { kind: 'dhoti', color: '#2a8ad8', border: true }, upper: { kind: 'shawl', color: '#e8f4ff' }, rim: ['#c0e8ff', '#ffffff'], ornament: ['#e7b54a', '#fff4c0'], jewels: { necklace: true, earring: true, armlets: true, sash: true },
    after: (g, P, r) => { if (bare(P)) return; const sx = P.flip ? -1 : 1, s = P.s, [x, y] = at(P, r.nh); g.save(); g.translate(x, y); g.rotate(-Math.PI / 2 - sx * 0.5); g.fillStyle = '#1a1210'; g.fillRect(-40 * s, -13 * s, 80 * s, 26 * s); g.fillStyle = '#f0f6ff'; g.beginPath(); g.moveTo(30 * s, -13 * s); g.lineTo(380 * s, -8 * s); g.lineTo(430 * s, 0); g.lineTo(380 * s, 8 * s); g.lineTo(30 * s, 13 * s); g.fill(); g.fillStyle = '#e7b54a'; g.fillRect(22 * s, -34 * s, 14 * s, 68 * s); g.restore(); },
    bible: bib('Abhimanyu', 'Arjuna\'s son; inside Drona\'s wheel formation he fights alone and is brought down by many (CE 7.33.12; 7.48.13).', 'A youth: sky-blue cloth, a top-knot, a short sword.') });
  A({ id: 'epicHidimba', build: { h: 1.26, w: 1.4, head: 1.16, arm: 1.14, limb: 1.4 }, skin: ['#1a0402', '#a8341c'], hair: { style: 'wild', color: '#1a0a06', lit: '#6a2a12' }, iris: '#ffb020', eyeWhite: '#fff0b0',
    lower: { kind: 'short', color: '#1a1414' }, upper: { kind: 'pelt', color: '#201818' }, rim: ['#ff8a40', '#ffe0a0'], ornament: ['#e8e0c8', '#fffbe8'], jewels: { tusks: true, armlets: true }, tall: 200,
    bible: bib('Hidimba, the rakshasa', 'An eater of human flesh, tawny-eyed, with a great mouth and rough hair (CE 1.139.1–4); Bhima breaks him in the middle with his arms (1.142.30).', 'Huge, ember-red skin, wild hair, tusks, a black pelt; no horns.') });
})();
