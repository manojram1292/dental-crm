/*
 * CHARACTERS · EPISODES 41–50 (the Tales of the Bhrigus, CE Adi 1.4–12; Vyasa Begins, CE 1.53–57). All are ACTING
 * FIGURES (characters/actor.js): blended poses, blink, breath, late cloth and hair, a face made for a close-up, and
 * painted colour blocks (skin, hair, cloth). Each has ONE signature: two colours, one ornament, one silhouette trait
 * (research/audience-2027.md §5.7), and a lit skin tone that stands off the palettes it plays in.
 *
 * THE BHRIGUS
 *   bhrigu        BHRIGU, the great sage (1.5–7): tall, a high jata, a long WHITE beard; SAFFRON bark, a water-pot
 *                 (the curse is thrown with water). Silhouette trait: the high double bun.
 *   puloma        PULOMA, his wife, with child (1.5–6): INDIGO sari with a gold border (never the green of her own hermitage), a low bun with a flower.
 *                 Silhouette trait: the rounded belly, a hand always near it.
 *   puloman       PULOMAN the rakshasa (1.5–6): broad, STORM-SLATE skin, a wild mane, tusks, two horns, a tawny pelt;
 *                 red eye. Silhouette trait: the horns and the mane.
 *   chyavanaChild CHYAVANA, new-born (1.6): a small child blazing like the sun: WHITE-GOLD, curls, an aura.
 *   pramati       PRAMATI, Chyavana's son, Ruru's father (1.8, 1.12): a householder sage: top-knot, short black beard,
 *                 TEAL cloth, a mala.
 *   ruru          RURU, Pramati's son (1.8–12): a young ascetic: top-knot, no beard, WHITE dhoti with a LAPIS border, the
 *                 sacred thread, a STAFF. Silhouette trait: the staff.
 *   pramadvara    PRAMADVARA (1.8–9): a young woman: long loose hair with flowers, a ROSE sari. Trait: the flowing hair.
 *   sthulakesha   STHULAKESHA, "the thick-haired", her foster father (1.8): an enormous jata, grey beard, OLIVE bark.
 *   menaka        MENAKA the apsara (1.8): pearl-AQUA, a diadem, an aura; she does not quite touch the ground.
 *   vishvavasu    VISHVAVASU, king of the gandharvas, her father (1.8–9): a crown, CRIMSON and silver.
 *   devaduta      THE MESSENGER OF THE GODS (1.9): a luminous youth, SILVER-WHITE, fading at the feet.
 *   dharma        DHARMARAJA, lord of the dead (1.9): heavy, DEEP GREEN skin, COPPER-RED cloth, a crown, a staff.
 *   sahasrapat    SAHASRAPAT, the sage who was the snake (1.10–12): AQUA-WHITE, a long white beard, a mala.
 *   khagama       KHAGAMA, his friend who cursed him (1.11): OCHRE, a top-knot, a short beard.
 * VYASA BEGINS
 *   uparichara    UPARICHARA VASU, king of Chedi (1.57): a tall crown, ROYAL BLUE and gold, Indra's garland.
 *   girika        GIRIKA, his queen (1.57): CRIMSON sari, a jewelled bun.
 *   dasha         THE FISHER CHIEF (1.57): dark, short curls, an INDIGO loincloth, an oar.
 *   satyavati     SATYAVATI, the ferry girl (1.57): dusky, a low bun, a RIVER-TEAL sari, an oar. Trait: the oar.
 *   parashara     PARASHARA, the sage (1.57): a jata, a black beard, RUST cloth, a staff.
 *   vyasaChild    KRISHNA DVAIPAYANA, the child Vyasa (1.57): a dark boy with a small top-knot, bark cloth, an aura.
 *   kuruPrince / panchali   PROVISIONAL panel figures for the one-breath summary (1.55); their own designs come with
 *                 their arcs.
 * Face LEFT. (x, y) = the feet. scale 1 ≈ 1000 px to the crown of a grown man.
 */
(function () {
  'use strict';
  const KIT = window.KIT, CH = KIT.characters;
  const bib = (name, role, sig, voice) => ({ name, role, palette: sig, proportions: 'CH.actor', props: [], light: sig, voice });
  const A = (o) => { CH.actor(o); CH.ROSTER.push(o.id); };

  A({ id: 'bhrigu', build: { h: 1.04, w: 1.05, head: 1.0, leg: 1.03 }, skin: ['#1a0e06', '#a87248'], hair: { style: 'jata', color: '#d8cfbc', lit: '#efe6d2' }, beard: { len: 0.95, color: '#e4dcc8' }, glow: 0.45,
    lower: { kind: 'dhoti', color: '#e8862a', border: true }, upper: { kind: 'shawl', color: '#c05a1c' }, rim: ['#ffc070', '#fff6e0'], jewels: { thread: true, mala: true, tilak: true }, prop: 'pot', propColor: '#b06a2a', tall: 80,
    bible: bib('Bhrigu, the great sage', 'Husband of Puloma, father of Chyavana; he curses Agni to devour everything (CE 1.5–7). Shaunaka\'s ancestor.', 'Saffron bark, a long white beard, the high jata; rim #ffc070 → #fff6e0.', 'bhrigu') });
  A({ id: 'puloma', build: { h: 0.96, w: 0.86, head: 0.98, leg: 0.98, arm: 0.94, bust: 0.7, belly: 0.72, hipW: 1.12 }, skin: ['#1a0e08', '#c08a5e'], hair: { style: 'bun', color: '#1a1210', lit: '#4a3830' },
    lower: { kind: 'sari', color: '#2a44a8', border: true }, upper: { kind: 'pallu', color: '#4a6ad0' }, rim: ['#ffe0a0', '#fffbe8'], ornament: ['#e7b54a', '#fff0c0'], jewels: { necklace: true, earring: true, tilak: true, bangles: true, flower: true, anklets: true },
    bible: bib('Puloma, wife of Bhrigu', 'With child when the rakshasa Puloman comes for her; her son falls from her womb and saves her; her tears become the river Vadhusara (CE 1.5–6).', 'Indigo sari, gold border; a hand near the child she carries.', 'puloma') });
  A({ id: 'puloman', build: { h: 1.2, w: 1.3, head: 1.1, leg: 1.04, arm: 1.1, limb: 1.3 }, skin: ['#05080b', '#3a525e'], hair: { style: 'longjata', color: '#120c0a', lit: '#5a2a16' }, beard: { len: 0.2, color: '#120c0a', lit: '#5a2a16' }, iris: '#e04a18', eyeWhite: '#ffe9a8',
    lower: { kind: 'dhoti', color: '#7a1a14', border: true }, upper: { kind: 'pelt', color: '#4a3020' }, rim: ['#c8641e', '#ffc878'], ornament: ['#c8902a', '#ffe08a'], jewels: { tusks: true, horns: true, armlets: true, necklace: true, earring: true, sash: true }, tall: 240,
    bible: bib('Puloman, the rakshasa', 'He had chosen Puloma first; her father gave her to Bhrigu. He asks the fire whose wife she is, takes a boar\'s form and carries her off, and is burned to ash by her new-born son (CE 1.5–6).', 'A lord among rakshasas, frightening and grave: taller and broader than any sage, blue-black skin, a heavy mane down his back, two long horns swept back, short tusks, a dark pelt over a blood-red cloth, gold at the neck, ear and arm; an ember eye. Rim ember-gold #c8641e → #ffc878.', 'puloman') });
  A({ id: 'chyavanaChild', build: { h: 0.5, w: 0.8, head: 0.62, leg: 0.5, arm: 0.55 }, skin: ['#5a3a10', '#f4d49a'], hair: { style: 'curls', color: '#8a5a1a', lit: '#ffd070' }, lower: { kind: 'short', color: '#fff4c8' }, rim: ['#fff0a0', '#ffffff'], glow: 1.3,
    aura: { color: '#fff0b0', r: 900, a: 0.6 }, 
    bible: bib('Chyavana, new-born', 'He falls from his mother\'s womb blazing like the sun, and the rakshasa burns to ash (CE 1.6). "Chyavana": the fallen.', 'White-gold, an aura: the only figure brighter than the fire.', null) });
  A({ id: 'pramati', build: { h: 1.0, w: 1.02 }, skin: ['#180c06', '#8e5e3c'], hair: { style: 'topknot', color: '#1a1210', lit: '#4a3a34' }, beard: { len: 0.25, color: '#1a1210', lit: '#4a3a34' },
    lower: { kind: 'dhoti', color: '#2a8a8a', border: true }, upper: { kind: 'shawl', color: '#e8dcc0' }, rim: ['#a8e8e0', '#f4ffff'], jewels: { thread: true, mala: true, tilak: true },
    bible: bib('Pramati, son of Chyavana', 'Ruru\'s father; he asks for Pramadvara for his son, and at the end tells Ruru the story of the snake sacrifice (CE 1.8, 1.12).', 'Teal cloth, an ivory shawl, a short black beard.', null) });
  A({ id: 'ruru', build: { h: 0.98, w: 0.94, head: 1.0 }, skin: ['#180c06', '#b07a50'], hair: { style: 'topknot', color: '#1a1210', lit: '#4a3a34' },
    lower: { kind: 'dhoti', color: '#f4eede', border: true }, rim: ['#ffd8a0', '#fffaf0'], ornament: ['#4a6ad8', '#c8d4ff'], jewels: { thread: true, armlets: true }, prop: 'staff', propColor: '#8a5a2a', tall: 260,
    bible: bib('Ruru, son of Pramati', 'He gives half his life to bring Pramadvara back, vows to kill every snake, and is taught mercy by a snake who was a sage (CE 1.8–12).', 'White dhoti with a lapis border, the sacred thread, a staff.', 'ruru') });
  A({ id: 'pramadvara', build: { h: 0.94, w: 0.8, head: 0.98, leg: 0.98, arm: 0.92, bust: 0.6, hipW: 1.1 }, skin: ['#1a0e08', '#c8926a'], hair: { style: 'flow', color: '#1a1210', lit: '#4a342c' },
    lower: { kind: 'sari', color: '#e0507a', border: true }, upper: { kind: 'pallu', color: '#f08aa8' }, rim: ['#ffe8c0', '#ffffff'], ornament: ['#fff0a0', '#ffffff'], jewels: { necklace: true, earring: true, tilak: true, bangles: true, flower: true, anklets: true },
    bible: bib('Pramadvara', 'Daughter of the apsara Menaka and the gandharva king Vishvavasu, left by a river and raised by the sage Sthulakesha; bitten by a snake days before her wedding, and brought back with half of Ruru\'s life (CE 1.8–9).', 'A rose sari, long loose hair with flowers.', null) });
  A({ id: 'sthulakesha', build: { h: 0.98, w: 1.08 }, skin: ['#160c06', '#96643e'], hair: { style: 'jata', color: '#8a8478', lit: '#d8d2c4' }, beard: { len: 0.6, color: '#9a9488', lit: '#e0dacc' },
    lower: { kind: 'bark', color: '#7a8a3a' }, upper: { kind: 'shawl', color: '#5a6a2a' }, rim: ['#d8e8a0', '#fbfff0'], jewels: { thread: true, mala: true }, prop: 'staff', propColor: '#6a4a24', tall: 260,
    bible: bib('Sthulakesha, the thick-haired sage', 'He finds the abandoned child by the river, raises her in his hermitage and names her Pramadvara (CE 1.8).', 'Olive bark cloth, a great grey jata.', null) });
  A({ id: 'menaka', build: { h: 0.98, w: 0.8, head: 0.96, arm: 0.94, bust: 0.6, hipW: 1.1 }, skin: ['#2a2a3a', '#e0b088'], hair: { style: 'bun', color: '#1a1210', lit: '#4a342c' },
    lower: { kind: 'sari', color: '#8ad8d8', border: true }, upper: { kind: 'pallu', color: '#d8f4f0' }, rim: ['#c8fff8', '#ffffff'], ornament: ['#fff0a0', '#ffffff'], glow: 1.1, aura: { color: '#b8f0f0', r: 620, a: 0.35 }, rule: { fade: 0.12 },
    jewels: { necklace: true, earring: true, crownGems: true, bangles: true, anklets: true },
    bible: bib('Menaka, the apsara', 'She bears a daughter to the gandharva king Vishvavasu and leaves the child on a river bank (CE 1.8).', 'Pearl-aqua, a diadem, an aura; she does not quite touch the ground.', null) });
  A({ id: 'vishvavasu', build: { h: 1.02, w: 1.04 }, skin: ['#201418', '#c89a70'], hair: { style: 'crown', color: '#d8b040', lit: '#fff0a0' },
    lower: { kind: 'dhoti', color: '#c02a3a', border: true }, upper: { kind: 'shawl', color: '#e8e8f4' }, rim: ['#e0e8ff', '#ffffff'], glow: 1.0, aura: { color: '#d0d8ff', r: 600, a: 0.3 }, jewels: { necklace: true, earring: true, armlets: true, crownGems: true }, tall: 120,
    bible: bib('Vishvavasu, king of the gandharvas', 'Pramadvara\'s father; with the messenger of the gods he goes to Dharmaraja to ask for her life (CE 1.8–9).', 'Crimson and silver, a crown.', null) });
  A({ id: 'devaduta', build: { h: 1.0, w: 0.92 }, skin: ['#3a4a5a', '#f0dcb4'], hair: { style: 'topknot', color: '#3a2a1a', lit: '#8a6a3a' }, lower: { kind: 'dhoti', color: '#ffffff' }, upper: { kind: 'shawl', color: '#d8f0ff' },
    rim: ['#d0f0ff', '#ffffff'], glow: 1.3, aura: { color: '#d8f4ff', r: 800, a: 0.5 }, rule: { fade: 0.2 }, jewels: { necklace: true, armlets: true },
    bible: bib('The messenger of the gods', 'He tells grieving Ruru the one way: give her half of your own life (CE 1.9).', 'Silver-white, luminous, fading at the feet.', 'devaduta') });
  A({ id: 'dharma', build: { h: 1.08, w: 1.3, head: 1.06, arm: 1.05, limb: 1.3 }, skin: ['#04140e', '#2f6a50'], hair: { style: 'crown', color: '#c8802a', lit: '#ffd070' }, beard: { len: 0.2, color: '#0a0a0a', lit: '#2a3a34' },
    lower: { kind: 'dhoti', color: '#c8502a', border: true }, upper: { kind: 'shawl', color: '#8a2a14' }, rim: ['#ffb070', '#fff0d8'], jewels: { necklace: true, earring: true, armlets: true, crownGems: true }, prop: 'staff', propColor: '#c8802a', tall: 280,
    bible: bib('Dharmaraja, lord of the dead', 'He grants Pramadvara her life again, with half of Ruru\'s (CE 1.9).', 'Deep green skin, copper-red cloth, a crown and the staff of judgment.', 'dharma') });
  A({ id: 'sahasrapat', build: { h: 1.0, w: 0.96 }, skin: ['#0e1a1a', '#a87850'], hair: { style: 'jata', color: '#e8f4f0', lit: '#ffffff' }, beard: { len: 0.8, color: '#f0fbf8' },
    lower: { kind: 'dhoti', color: '#bfeee4' }, upper: { kind: 'shawl', color: '#f4fffb' }, rim: ['#b8fff0', '#ffffff'], glow: 1.0, aura: { color: '#b8fff0', r: 640, a: 0.35 }, jewels: { thread: true, mala: true, tilak: true }, tall: 80,
    bible: bib('Sahasrapat, the sage who was a snake', 'Cursed by his friend Khagama to be a harmless snake until he met Ruru; freed, he teaches that not harming living things is the highest law (CE 1.10–12).', 'Aqua-white, a long white beard.', 'sahasrapat') });
  A({ id: 'khagama', build: { h: 0.98 }, skin: ['#180e06', '#c08a5a'], hair: { style: 'topknot', color: '#1a1210', lit: '#4a3a34' }, beard: { len: 0.3, color: '#1a1210', lit: '#4a3a34' },
    lower: { kind: 'dhoti', color: '#d8a030' }, rim: ['#ffe0a0', '#fffbe8'], jewels: { thread: true, tilak: true },
    bible: bib('Khagama, the truthful', 'Frightened at his fire-offering by a snake of grass, he curses his friend Sahasrapat (CE 1.11).', 'Ochre cloth, a top-knot.', null) });

  A({ id: 'uparichara', build: { h: 1.06, w: 1.12 }, skin: ['#180e08', '#8a5a38'], hair: { style: 'crown', color: '#d8a830', lit: '#fff0a0' }, beard: { len: 0.12, color: '#1a1210', lit: '#3a2a24' },
    lower: { kind: 'dhoti', color: '#2a4ac8', border: true }, upper: { kind: 'shawl', color: '#e7b54a' }, rim: ['#ffe8a0', '#ffffff'], jewels: { necklace: true, earring: true, armlets: true, crownGems: true, mala: true, sash: true }, tall: 140,
    bible: bib('Uparichara Vasu, king of Chedi', 'Indra\'s friend, who rides a crystal chariot in the sky; his seed, sent home by a hawk, falls into the Yamuna (CE 1.57).', 'Royal blue and gold, a tall crown, Indra\'s garland.', 'uparichara') });
  A({ id: 'girika', build: { h: 0.96, w: 0.82, bust: 0.62, hipW: 1.1, arm: 0.94 }, skin: ['#1a0e08', '#b8805a'], hair: { style: 'bun', color: '#1a1210', lit: '#4a342c' },
    lower: { kind: 'sari', color: '#c82a3a', border: true }, upper: { kind: 'pallu', color: '#e8505a' }, rim: ['#ffe0b0', '#ffffff'], jewels: { necklace: true, earring: true, tilak: true, bangles: true, crownGems: true, anklets: true },
    bible: bib('Girika, queen of Chedi', 'Uparichara\'s wife, to whom the hawk was sent (CE 1.57).', 'A crimson sari, a jewelled bun.', null) });
  A({ id: 'dasha', build: { h: 0.98, w: 1.1 }, skin: ['#0c0806', '#a87048'], hair: { style: 'topknot', color: '#0e0a08', lit: '#3a2a20' }, beard: { len: 0.15, color: '#0e0a08', lit: '#3a2a20' },
    lower: { kind: 'dhoti', color: '#2a3a8a', border: true }, upper: { kind: 'shawl', color: '#c8a050' }, rim: ['#ffc890', '#fff0d8'], jewels: { armlets: true }, prop: 'oar', propColor: '#7a5a34', tall: 200,
    bible: bib('The chief of the fishermen', 'His men find twins in a fish; the king gives him the girl, and he raises her as his daughter (CE 1.57).', 'An indigo dhoti, an ochre shoulder-cloth, an oar: marked by his dress and his oar, not by his body.', null) });
  A({ id: 'satyavati', build: { h: 0.93, w: 0.8, head: 0.98, arm: 0.92, bust: 0.55, hipW: 1.08 }, skin: ['#100806', '#9a6842'], hair: { style: 'bun', color: '#0e0a08', lit: '#3a2a24' },
    lower: { kind: 'sari', color: '#1a8a8a', border: true }, upper: { kind: 'pallu', color: '#3ab0a8' }, rim: ['#b8f0e8', '#ffffff'], ornament: ['#e8e0c0', '#ffffff'], jewels: { earring: true, bangles: true, anklets: true, tilak: true }, prop: 'oar', propColor: '#7a5a34', tall: 200,
    bible: bib('Satyavati, the ferry girl', 'Born from a fish, raised by the fisher chief, she rows a ferry on the Yamuna; mother of Vyasa (CE 1.57).', 'Dusky, a river-teal sari, an oar.', 'satyavati') });
  A({ id: 'parashara', build: { h: 1.03, w: 1.0 }, skin: ['#180c06', '#b88458'], hair: { style: 'jata', color: '#1a1210', lit: '#4a3a30' }, beard: { len: 0.55, color: '#1a1210', lit: '#4a3a30' },
    lower: { kind: 'dhoti', color: '#b85a2a' }, upper: { kind: 'shawl', color: '#8a3a1a' }, rim: ['#ffc890', '#fff4e0'], jewels: { thread: true, mala: true, tilak: true }, prop: 'staff', propColor: '#6a4a24', tall: 260,
    bible: bib('Parashara, the sage', 'Crossing the Yamuna in Satyavati\'s boat, he hides them in a mist and grants her boons; father of Vyasa (CE 1.57).', 'Rust cloth, a black beard, a staff.', 'parashara') });
  A({ id: 'vyasaChild', build: { h: 0.64, w: 0.82, head: 0.74, leg: 0.68, arm: 0.7 }, skin: ['#06080e', '#5c3e2a'], hair: { style: 'topknot', color: '#0a0a10', lit: '#2a2a3a' }, lower: { kind: 'bark', color: '#c8a050' }, rim: ['#ffe8a0', '#ffffff'], glow: 1.0,
    aura: { color: '#ffe8a0', r: 520, a: 0.4 }, jewels: { thread: true },
    bible: bib('Krishna Dvaipayana, the child Vyasa', 'Born on an island in the Yamuna and grown at once; "the dark one, the island-born" (CE 1.57, 1.54).', 'A dark boy in bark cloth with a gold aura.', null) });
  // the frame of episodes 47–50 as acting figures, in their bible colours (vyasa.js, vaishampayana.js, janamejaya.js keep
  // the wide shots of episodes 1–40; these carry the close-ups from episode 47)
  A({ id: 'vyasaSage', build: { h: 1.04, w: 1.04 }, skin: ['#0a0d12', '#5e4030'], hair: { style: 'longjata', color: '#6a6a70', lit: '#b8b4ac' }, beard: { len: 0.42, color: '#a8a49c', lit: '#d8d4cc' },
    lower: { kind: 'dhoti', color: '#b8925a' }, upper: { kind: 'shawl', color: '#8a6a3a' }, rim: ['#b8925a', '#ffe9b0'], ornament: ['#a8741f', '#f7dc9c'], aura: { color: '#ffcf7a', r: 420, a: 0.5, ring: true }, jewels: { thread: true, mala: true, tilak: true }, tall: 80,
    bible: bib('Vyasa (Krishna Dvaipayana), acting figure', 'The dark, island-born sage who composed the Mahabharata; he comes to Janamejaya\'s sacrifice and has his student tell it (CE 1.54). The bible colours of vyasa.js: blue-black skin, a soft gold halo.', 'Dark brown skin (Krishna, "the dark"), the long matted hair down his back, bark cloth, the soft gold halo ring of vyasa.js: rim #b8925a → #ffe9b0.', 'vyasa') });
  A({ id: 'vaishampayanaSage', build: { h: 0.99, w: 0.96 }, skin: ['#0d0a0c', '#a8744e'], hair: { style: 'topknot', color: '#1a1214', lit: '#4a3438' }, beard: { len: 0.12, color: '#1a1214', lit: '#4a3438' }, lower: { kind: 'dhoti', color: '#b06a6a', border: true }, upper: { kind: 'shawl', color: '#e8c8b8' },
    rim: ['#a8706a', '#ffd6c4'], ornament: ['#9a7a5a', '#f2dcc0'], jewels: { thread: true, mala: true, tilak: true },
    bible: bib('Vaishampayana, acting figure', 'Vyasa\'s student; told by his teacher, he recites the whole Mahabharata to Janamejaya in the pauses of the snake sacrifice (CE 1.54–55). The bible colours of vaishampayana.js: dawn-rose.', 'Dawn-rose cloth, a top-knot, the manuscript: rim #a8706a → #ffd6c4.', 'vaishampayana') });
  A({ id: 'kingJanamejaya', build: { h: 1.05, w: 1.12 }, skin: ['#0e0806', '#b07a4e'], hair: { style: 'crown', color: '#c8902a', lit: '#ffe08a' }, lower: { kind: 'dhoti', color: '#c45a1a', border: true }, upper: { kind: 'shawl', color: '#8a2a14' },
    rim: ['#c45a1a', '#ffb35a'], ornament: ['#c8902a', '#ffe08a'], jewels: { necklace: true, earring: true, armlets: true, crownGems: true, sash: true }, tall: 140,
    bible: bib('Janamejaya, acting figure', 'The king of the snake sacrifice; he honours Vyasa and asks how the war of his ancestors began (CE 1.54). The bible colours of janamejaya.js: sacrificial saffron and gold.', 'Saffron and gold, the tiered crown: rim #c45a1a → #ffb35a.', 'janamejaya') });
  A({ id: 'kuruPrince', build: { h: 1.0, w: 1.08 }, skin: ['#180e08', '#a8744a'], hair: { style: 'crown', color: '#c8a030', lit: '#ffe890' }, lower: { kind: 'dhoti', color: '#8a2a2a', border: true }, rim: ['#ffe0a0', '#ffffff'], jewels: { necklace: true, armlets: true, earring: true }, tall: 120,
    bible: bib('A Kuru prince (provisional)', 'A panel figure for the one-breath summary (CE 1.55); the princes get their own designs in their arcs.', 'Provisional.', null) });
  A({ id: 'panchali', build: { h: 0.96, w: 0.82, bust: 0.6, hipW: 1.1, arm: 0.94 }, skin: ['#140a06', '#8e5e3e'], hair: { style: 'flow', color: '#0e0a08', lit: '#3a2a24' }, lower: { kind: 'sari', color: '#d8a020', border: true }, upper: { kind: 'pallu', color: '#e8c040' }, rim: ['#ffe0a0', '#ffffff'], jewels: { necklace: true, earring: true, bangles: true, tilak: true },
    bible: bib('Draupadi (provisional)', 'A panel figure for the one-breath summary (CE 1.55).', 'Provisional.', null) });
})();
