/*
 * CHARACTERS · EPISODES 51–60 (the Burden of the Earth and the descent of the portions, CE Adi 1.58, 1.61; Shakuntala,
 * CE 1.62–69; the tale of Kacha, CE 1.71). All are ACTING FIGURES (characters/actor.js), each with ONE signature: two
 * colours, one ornament, one silhouette trait, and a lit skin tone that stands off the palettes it plays in.
 *
 * THE BURDEN OF THE EARTH
 *   bhumi          THE EARTH (Bhumi, 1.58): a tall woman, EARTH-GREEN sari with a gold border, long loose hair with
 *                  flowers, a low diadem. Trait: the bowed head under her burden. She has no words in the text.
 * THE DESCENT OF THE PORTIONS (1.61). PROVISIONAL panel figures: each gets his own design in his own arc; here they are
 * told apart by colour and one prop, and named by plaques.
 *   yudhishthira   IVORY and gold, a low crown.            bhima     broad, RUST-RED, a club.
 *   arjuna         LEAF-GREEN, a tall crown.               nakula / sahadeva   the twins: the same SKY-TEAL.
 *   karna          GOLD: breast-cloth and earrings of gold (born in armour), a faint glow.
 *   duryodhana     NIGHT-PURPLE and iron, a heavy crown, a club (the mace).
 *   krishna        DARK BLUE skin, a YELLOW dhoti, a crown with a peacock-green gem; a soft aura.
 *   kaliShade      KALI, the spirit of strife (not the goddess): a tall, lean dark shape with one green eye; no ornament.
 * SHAKUNTALA
 *   dushyanta      DUSHYANTA (CE Duhshanta), king of Puru's line (1.62–69): young, strong; a crown, EMERALD and gold.
 *   dushyantaPlain the same man with the royal signs laid aside (1.64.29): bare-headed, a top-knot, a plain ivory dhoti.
 *   shakuntala     SHAKUNTALA in the hermitage (1.65–68): a BARK-BROWN hermit's dress, long loose hair with flowers.
 *                  Trait: the flowers in the loose hair; no jewels but a thread at the wrist.
 *   shakuntalaQueen  the same woman honoured as queen (1.69.43): a ROSE-GOLD sari, her hair bound, jewels.
 *   kanva          KANVA, of Kashyapa's line (1.64–68): old, a white jata and beard, SAGE-GREEN bark, a water-pot.
 *   bharataChild   SARVADAMANA / BHARATA at six (1.68): a sturdy boy, curls, a short ochre cloth, a light about him.
 *   bharataKing    BHARATA grown, the universal king (1.69.45–47): a tall crown, WHITE and gold.
 *   vishvamitra    VISHVAMITRA at his penance (1.65–66): gaunt, a long dark jata and beard, a scrap of bark.
 *   (menaka is in bhrigu-arc.js: the same apsara.)
 * THE TALE OF KACHA
 *   shukra         SHUKRA (Kavya Ushanas), priest of the asuras (1.71): WHITE hair and beard, WHITE-and-silver cloth,
 *                  a staff; a hard, clever face.
 *   kacha          KACHA, Brihaspati's eldest son (1.71): a slight young student, a top-knot, PALE-GOLD dhoti, the thread.
 *   devayani       DEVAYANI, Shukra's daughter (1.71–): a young woman, VIOLET sari with a silver border, flowers in long hair.
 *   yayati         YAYATI, son of Nahusha (1.70–): a crowned king in PLUM and gold (provisional: his own arc designs him).
 * Face LEFT. (x, y) = the feet. scale 1 ≈ 1000 px to the crown of a grown man.
 */
(function () {
  'use strict';
  const KIT = window.KIT, CH = KIT.characters;
  const bib = (name, role, sig, voice) => ({ name, role, palette: sig, proportions: 'CH.actor', props: [], light: sig, voice });
  const A = (o) => { CH.actor(o); CH.ROSTER.push(o.id); };
  const W = { h: 0.96, w: 0.82, head: 0.98, leg: 0.98, arm: 0.94, bust: 0.6, hipW: 1.1 };   // a grown woman's build

  A({ id: 'bhumi', build: { ...W, h: 1.0, w: 0.9 }, skin: ['#1a1008', '#b8845a'], hair: { style: 'flow', color: '#14100c', lit: '#4a3a2c' },
    lower: { kind: 'sari', color: '#2f7a3a', border: true }, upper: { kind: 'pallu', color: '#5aa850' }, rim: ['#f0d890', '#fffbe8'], ornament: ['#e7b54a', '#fff0c0'],
    jewels: { necklace: true, earring: true, tilak: true, bangles: true, flower: true, anklets: true, crownGems: true }, tall: 60,
    bible: bib('The Earth (Bhumi)', 'Weighed down by the asuras born as kings and beasts, she goes for refuge to Brahma (CE 1.58.29–40). She has no words in the text.', 'Earth-green sari, gold border, loose hair with flowers.', null) });

  const prince = (id, name, lower, upper, extra = {}) => A({ id, build: { h: 1.0, w: 1.06, ...(extra.build || {}) }, skin: extra.skin || ['#180e08', '#a8744a'], hair: { style: 'crown', color: '#c8a030', lit: '#ffe890' },
    lower: { kind: 'dhoti', color: lower, border: true }, upper: upper ? { kind: 'shawl', color: upper } : undefined, rim: ['#ffe0a0', '#ffffff'], jewels: { necklace: true, armlets: true, earring: true, ...(extra.jewels || {}) }, tall: 120,
    prop: extra.prop, propColor: extra.propColor, glow: extra.glow, aura: extra.aura, iris: extra.iris, eyeWhite: extra.eyeWhite,
    bible: bib(name + ' (provisional)', 'A panel figure for the descent of the portions (CE 1.61); his own design comes with his own arc.', 'Provisional: told apart by colour and one prop.', null) });
  prince('yudhishthira', 'Yudhishthira', '#f0e8d0', '#d8b040');
  prince('bhima', 'Bhima', '#b8401a', '#7a2410', { build: { h: 1.08, w: 1.32, limb: 1.3 }, prop: 'club', propColor: '#5a3a1a' });
  prince('arjuna', 'Arjuna', '#3a9a4a', '#e8e0b0', { build: { h: 1.03, w: 1.04 } });
  prince('nakula', 'Nakula', '#3aa8b8', '#f0f0e0', { build: { h: 0.98, w: 0.98 } });
  prince('sahadeva', 'Sahadeva', '#3aa8b8', '#f0f0e0', { build: { h: 0.98, w: 0.98 } });
  prince('karna', 'Karna', '#c8501a', '#f0c030', { build: { h: 1.04, w: 1.08 }, glow: 0.35, jewels: { sash: true, crownGems: true } });
  prince('duryodhana', 'Duryodhana', '#4a2a7a', '#2a2a34', { build: { h: 1.05, w: 1.2, limb: 1.2 }, prop: 'club', propColor: '#8a8a98', jewels: { sash: true, crownGems: true } });
  prince('krishna', 'Krishna (Vasudeva)', '#f0c020', '#f8e070', { skin: ['#04080f', '#2c4f86'], build: { h: 1.02, w: 1.0 }, aura: { color: '#9ac0ff', r: 520, a: 0.35 }, glow: 0.3, jewels: { crownGems: true, mala: true } });
  prince('yayati', 'Yayati', '#7a2a6a', '#e7b54a', { build: { h: 1.04, w: 1.1 }, jewels: { sash: true, crownGems: true } });
  A({ id: 'kaliShade', build: { h: 1.22, w: 0.92, head: 1.0, leg: 1.1, arm: 1.12 }, skin: ['#020403', '#1e2a24'], hair: { style: 'longjata', color: '#020403', lit: '#16241c' }, iris: '#6aff5a', eyeWhite: '#c8ffb0',
    lower: { kind: 'dhoti', color: '#141c18' }, upper: { kind: 'shawl', color: '#0c1410' }, rim: ['#5aff8a', '#d8ffe0'], rule: { rimW: 0.5 }, tall: 240,
    bible: bib('Kali, the spirit of strife', 'The age of discord in person; Duryodhana is born from a portion of him (CE 1.61.80–81). Not the goddess Kali.', 'A lean dark shape, a green eye, a thin green rim; no ornament.', null) });

  A({ id: 'shri', build: { ...W, h: 1.0 }, skin: ['#3a2a20', '#f0c8a0'], hair: { style: 'crown', color: '#e8b840', lit: '#fff4b0' },
    lower: { kind: 'sari', color: '#e85a7a', border: true }, upper: { kind: 'pallu', color: '#ffd0a0' }, rim: ['#fff0c0', '#ffffff'], glow: 1.0, aura: { color: '#ffe0b0', r: 700, a: 0.45 },
    jewels: { necklace: true, earring: true, tilak: true, bangles: true, anklets: true, crownGems: true },
    bible: bib('Shri, the goddess of fortune', 'A portion of her is born from the middle of an altar in Drupada\'s family: Draupadi (CE 1.61.95).', 'Rose and gold, a crown, an aura.', null) });
  A({ id: 'dushyanta', build: { h: 1.05, w: 1.1 }, skin: ['#180e08', '#b07c50'], hair: { style: 'crown', color: '#d8a830', lit: '#fff0a0' },
    lower: { kind: 'dhoti', color: '#1f8a5a', border: true }, upper: { kind: 'shawl', color: '#e7b54a' }, rim: ['#ffe8a0', '#ffffff'], jewels: { necklace: true, earring: true, armlets: true, crownGems: true, sash: true }, tall: 140,
    bible: bib('Dushyanta (CE Duhshanta)', 'King of Puru\'s line; he finds Shakuntala in Kanva\'s hermitage, marries her by the gandharva rite, denies her before his court though he remembers, and takes her and their son back when a voice from the sky speaks (CE 1.62–69).', 'Emerald and gold, a tall crown.', 'dushyanta') });
  A({ id: 'dushyantaPlain', build: { h: 1.05, w: 1.1 }, skin: ['#180e08', '#b07c50'], hair: { style: 'topknot', color: '#1a1210', lit: '#4a3a30' },
    lower: { kind: 'dhoti', color: '#efe6d0', border: true }, rim: ['#ffe8a0', '#ffffff'], ornament: ['#1f8a5a', '#8ad8a8'], jewels: { armlets: true, earring: true },
    bible: bib('Dushyanta, the royal signs laid aside', 'He leaves his army at the forest\'s gate and takes off the insignia of a king before entering the hermitage (CE 1.64.26–29).', 'Bare-headed, a plain ivory dhoti with an emerald border.', 'dushyanta') });
  A({ id: 'shakuntala', build: { ...W }, skin: ['#1a0e08', '#c48e62'], hair: { style: 'flow', color: '#17100c', lit: '#4a362a' },
    lower: { kind: 'sari', color: '#a8743a', border: false }, upper: { kind: 'pallu', color: '#c89a58' }, rim: ['#ffe8c0', '#ffffff'], ornament: ['#fff0f4', '#ffffff'], jewels: { flower: true, tilak: true, bangles: true },
    bible: bib('Shakuntala', 'Daughter of the apsara Menaka and the seer Vishvamitra, guarded by birds as a new-born and raised by Kanva; she marries Dushyanta on her own terms and holds him to his word before his court (CE 1.65–69).', 'A bark-brown hermit\'s dress, long loose hair with white flowers; no gold.', 'shakuntala') });
  A({ id: 'shakuntalaQueen', build: { ...W }, skin: ['#1a0e08', '#c48e62'], hair: { style: 'bun', color: '#17100c', lit: '#4a362a' },
    lower: { kind: 'sari', color: '#d8607a', border: true }, upper: { kind: 'pallu', color: '#f0a0a8' }, rim: ['#ffe8c0', '#ffffff'], jewels: { necklace: true, earring: true, tilak: true, bangles: true, flower: true, anklets: true, crownGems: true },
    bible: bib('Shakuntala, honoured as queen', 'The same woman after the voice from the sky (CE 1.69.39–43).', 'A rose-gold sari, her hair bound, jewels.', 'shakuntala') });
  A({ id: 'kanva', build: { h: 1.0, w: 1.0 }, skin: ['#180c06', '#a87850'], hair: { style: 'jata', color: '#cfcabc', lit: '#f0ece0' }, beard: { len: 0.8, color: '#dcd6c8' }, glow: 0.3,
    lower: { kind: 'bark', color: '#7f9a5a' }, upper: { kind: 'shawl', color: '#566a3a' }, rim: ['#e8f0b8', '#fffff0'], jewels: { thread: true, mala: true, tilak: true }, prop: 'pot', propColor: '#8a5a2a', tall: 80,
    bible: bib('Kanva, of Kashyapa\'s line', 'The celibate seer who found Shakuntala among the birds and raised her; he blesses her marriage and sends her and her son to the king (CE 1.64–68).', 'Sage-green bark cloth, a white jata and beard, a water-pot.', 'kanva') });
  A({ id: 'bharataChild', build: { h: 0.6, w: 0.9, head: 0.72, leg: 0.62, arm: 0.66 }, skin: ['#2a1608', '#d09a62'], hair: { style: 'curls', color: '#1a1210', lit: '#5a4030' }, lower: { kind: 'short', color: '#e0a030' }, rim: ['#ffe8a0', '#ffffff'], glow: 0.8,
    aura: { color: '#ffe8a0', r: 420, a: 0.3 }, jewels: { thread: true, armlets: true },
    bible: bib('Sarvadamana (Bharata), six years old', 'Shakuntala\'s son; at six he binds lions and tigers to the hermitage trees and rides them; the voice from the sky names him Bharata (CE 1.68–69).', 'A sturdy boy, curls, a short ochre cloth, a light about him.', null) });
  A({ id: 'bharataKing', build: { h: 1.06, w: 1.14 }, skin: ['#2a1608', '#c08a58'], hair: { style: 'crown', color: '#e0b030', lit: '#fff4a8' }, lower: { kind: 'dhoti', color: '#f4eede', border: true }, upper: { kind: 'shawl', color: '#e7b54a' },
    rim: ['#fff0a8', '#ffffff'], glow: 0.4, jewels: { necklace: true, earring: true, armlets: true, crownGems: true, sash: true }, tall: 140,
    bible: bib('Bharata, the universal king', 'His wheel rolled unconquered; from him the line is called the Bharatas (CE 1.69.45–49).', 'White and gold, a tall crown.', null) });
  A({ id: 'vishvamitra', build: { h: 1.04, w: 0.86, limb: 0.82 }, skin: ['#140a06', '#96643e'], hair: { style: 'longjata', color: '#1a1210', lit: '#5a4030' }, beard: { len: 0.7, color: '#1a1210', lit: '#5a4030' },
    lower: { kind: 'bark', color: '#8a5a2a' }, rim: ['#ffb070', '#fff0d8'], glow: 0.5, jewels: { thread: true, mala: true }, tall: 200,
    bible: bib('Vishvamitra at his penance', 'His austerity frightens Indra, who sends Menaka to break it; their daughter is Shakuntala (CE 1.65–66).', 'Gaunt, a long dark jata and beard, a scrap of bark; heat about him.', null) });

  A({ id: 'shukra', build: { h: 1.02, w: 0.98 }, skin: ['#161210', '#b89070'], hair: { style: 'jata', color: '#e8e8ee', lit: '#ffffff' }, beard: { len: 0.5, color: '#f0f0f6' },
    lower: { kind: 'dhoti', color: '#eef0f6', border: true }, upper: { kind: 'shawl', color: '#b8c0d4' }, rim: ['#d8e4ff', '#ffffff'], ornament: ['#b8c0d8', '#ffffff'], jewels: { thread: true, mala: true, tilak: true, earring: true }, prop: 'staff', propColor: '#c8c8d4', tall: 260,
    bible: bib('Shukra (Kavya Ushanas)', 'Priest of the asuras, a Bhargava; he alone knows the samjivani, the art of raising the dead; he takes his rival\'s son as a student, and teaches him the art from inside his own belly (CE 1.71).', 'White hair and beard, white-and-silver cloth, a pale staff.', 'shukra') });
  A({ id: 'kacha', build: { h: 0.96, w: 0.9, head: 1.0 }, skin: ['#180c06', '#c08a5c'], hair: { style: 'topknot', color: '#1a1210', lit: '#4a3a34' },
    lower: { kind: 'dhoti', color: '#f0dc98', border: true }, rim: ['#ffe8b0', '#ffffff'], ornament: ['#d8a030', '#fff0b0'], jewels: { thread: true, mala: true },
    bible: bib('Kacha, Brihaspati\'s eldest son', 'Sent by the gods to learn the samjivani from Shukra; killed twice by the asuras and twice raised (CE 1.71).', 'A slight young student in pale gold, the sacred thread.', 'kacha') });
  A({ id: 'devayani', build: { ...W, h: 0.95 }, skin: ['#1a0e08', '#cf9a70'], hair: { style: 'flow', color: '#14100c', lit: '#4a342c' },
    lower: { kind: 'sari', color: '#6a3aa8', border: true }, upper: { kind: 'pallu', color: '#9a6ad8' }, rim: ['#e8d8ff', '#ffffff'], ornament: ['#d8dcf0', '#ffffff'], jewels: { necklace: true, earring: true, tilak: true, bangles: true, flower: true, anklets: true },
    bible: bib('Devayani, Shukra\'s daughter', 'She loves her father\'s student Kacha and will not live without him (CE 1.71–72).', 'A violet sari with a silver border, flowers in long loose hair.', 'devayani') });
})();
