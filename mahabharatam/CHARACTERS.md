# Character Bible · Mahabharatam — As Vyasa Told It

Every character has one module in `src/kit/characters/` and is drawn by one call:

```js
KIT.characters.<id>.draw(ctx, {
  x, y,            // feet (or seat) on the ground, screen px
  scale,           // 1 = the bible height below
  facing,          // 'left' (native profile) | 'right'; frontal figures: 'front' | 'back'
  pose,            // 'stand' | 'walk' | 'sit' | 'speak' | 'bless' | … or { name, k, phase, stride, base }
  light,           // { dir: angle TOWARD the light (0 = right, π = left, −π/2 = above), intensity 0..1.3, front 0..1 }
  expression,      // { look (head pitch / turn), speak (0..1 jaw), mood: 'calm' | 'wrath' | 'sorrow' }
  t,               // seconds: breath, cloth and hair only
  index,           // generic sages / Pitrs only: which member of the group (fixed variation)
});
KIT.characters.<id>.shape(g, color, opts)   // the bare silhouette (visions, shadows, masks)
KIT.characters.<id>.bible                   // palette, proportions, props, light, poses, voice key
```

The design itself (shapes, proportions, palette, props, and the **signature lighting rule**) is
fixed inside each module, so a character looks the same in every episode. Scenes only choose
pose, facing, scale, light direction and intensity, and expression. `src/kit/characters/rig.js`
applies the lighting rule the same way for everyone:

- the silhouette is filled with the character's **fill** (mixed toward its **lit** colour by `light.front × intensity`),
- a **rim** on the side toward the light, from `rim[0]` (dim) to `rim[1]` (bright) with intensity, whose width grows with scale and intensity,
- an **inner** glow just inside the rim,
- a soft **glow** of the rim,
- the **ornaments** (borders, beads, jewels) in the character's ornament colours,
- optional extras: an aura behind (Vyasa, the Pitrs), translucency and a halo rim all round (the Pitrs).

The model sheet `lab/model-sheet.html` (rendered to `CHARACTERS.png` by `node tools/modelsheet.mjs`)
shows every character in every pose, the same pose under three lights (`LIGHTS.key`: the fire to the
left; `LIGHTS.back`: a rim from behind; `LIGHTS.low`: a dim fire in front and below), and a phone-size
line-up. Everyone is drawn at the same scale, so their heights compare. `node tools/modelsheet.mjs --solo <id>`
draws one character large in every pose.

Voices live in `script/cast.json` (the source for `tools/voice.py`); each bible names its cast key.
Pitch is measured as the median F0 of a test sentence at 0.85×.

---

## Sauti (Ugrashravas, son of Lomaharshana) · `sauti`

**Who.** The Suta bard who tells the epic to the sages of the Naimisha forest. He heard it at King
Janamejaya's snake sacrifice, recited by Vaishampayana, Vyasa's disciple (CE 1.1.1–1.1.25).

**Look.** Lean and upright, a wanderer. Long pointed beard; jata topknot with a small crown knot;
shoulder-length locks; knee-length veshti with kasavu-gold borders; uttariya shawl whose end streams
behind him. This is episode 1's storyteller, unchanged.

| | |
|---|---|
| Palette | fill `#0c0809` · lit `#2e160d` · inner `#46200f` · rim `#d8903e` → `#ffe2a0` · ornaments `#a8741f` → `#e7b54a` |
| Proportions | 1040 units standing (scale 1). Hip 500, thigh 252, shin 238, foot 74. Head ≈ 1/6.7 of the height. Seated hip 150. |
| Props | staff (danda) with a round finial and three gold bands, always in the **near** hand · kamandalu water pot in the far hand (set down when that hand speaks) · rudraksha mala · kundala earring · gold armband |
| Signature light | **Warm fire rim, gold.** Rim width ×1.0, inner 0.88 (0.35 when front-lit), glow 0.8, ornaments 0.45–0.8. |
| Poses | `stand` · `walk` (phase, stride) · `sit` · `speak` (k; base stand/sit: the far hand opens) · `bless` (abhaya) · `bow` (k) |
| Voice | `sauti` → **bm_fable**, 0.83× (was 0.92×), pitch 0 (median F0 ≈ 128 Hz). A lighter British voice with a bard's lilt, set apart from the American narrator. |

## The elder sage (Shaunaka, kulapati of Naimisha) · `elder`

**Who.** Head of the twelve-year sacrifice in the Naimisha forest. It is he who asks Sauti for the
story; in Adi Parva 2 the sages ask about Samantapanchaka (CE 1.2.1).

**Look.** Old, slightly stooped (0.07 rad forward from the hip, head bowed 0.1). Very long beard that
juts forward and falls in waves to the waist; drooping moustache; high domed jata bound with a
rudraksha band; a deer-skin (krishnajina) over his shoulders with two hoof-flaps; ankle-length veshti.

| | |
|---|---|
| Palette | fill `#100a08` · lit `#3e271a` · inner `#3a2416` · rim `#c9a27a` → `#fff0d0` · ornaments `#9a8f7d` → `#f1e6c8` |
| Proportions | ≈ 1000 units standing. Hip 470, thigh 236, shin 224. Beard ≈ 300 long. Jata dome 92 tall. |
| Props | **crook-topped staff** (near hand) · japa mala (far hand) · deer-skin with hoof-flaps and pale spots · jata band |
| Signature light | **Ivory, never gold.** The rim is the pale ivory of ash and white hair. Inner 0.85 (0.4 front-lit), glow 0.6. |
| Poses | `stand` · `walk` (slow: stride ×0.65) · `sit` · `speak` (k: leans in +0.16 rad, looks up, the far hand opens to the listener; base stand/sit) · `bless` · `bow` |
| Voice | `elder_sage` → **bm_lewis**, 0.77×, unshifted (was 0.8×, −0.5 st; the shift was removed to keep him light). Median F0 ≈ 95 Hz. The deepest British voice, slower than anyone. |

## The sages of Naimisha · `sage`

**Who.** Shaunaka's companions at the sacrifice: the listeners around the fire.

**Look.** Frontal shadow puppets (`facing: 'front'`, or `'back'` when seen from behind),
cross-legged in jnana mudra. `index` picks one of eight fixed variations (seeded per index), so the
circle never looks cloned:

| index | beard | topknot | shawl | mala | build |
|---|---|---|---|---|---|
| 0 | short point | bun + knot | — | yes | 1.00 |
| 1 | long | tall jata tower | left | yes | 0.94 |
| 2 | broad, forked | low bun, locks on the shoulders | right | — | 1.08 |
| 3 | long | twin knots | — | yes | 0.97 |
| 4 | none (the young one) | bun + knot | left | — | 0.92 |
| 5 | short point | tall jata tower | right | yes | 1.04 |
| 6 | broad, forked | bun + knot | left | yes | 1.00 |
| 7 | long | low bun, locks | — | — | 1.06 |

| | |
|---|---|
| Palette | back `#0d0808` · front `#8a3c1e` · inner `#b85a2c` · rim `#e0954a` → `#ffe0a0` · ornaments `#a8741f` → `#f7dc9c` |
| Proportions | 560 units seated (scale 1). Crossed legs 356 wide, shoulders 208, head an upright oval 74 × 100. Build ±8 % per index. |
| Props | rudraksha mala (some) · sacred thread / shawl border · gold border on the crossed legs |
| Signature light | **The fire circle.** Facing the fire (`front ≈ 0.55`), their fronts glow terracotta with an ember inner light. From behind, they are soot-black with an amber rim. |
| Poses | `sit` (pose.lean nudges the torso) · `stand` · `walk` (frontal step) · `speak` (right hand opens) · `bless` · listen (`expression.look` turns the head −1..1) |
| Voice | `sages` → am_onyx, 0.79×, −1 st (reserved for a group line). |

## Parashurama (Rama of the axe, son of Jamadagni) · `parashurama`

**Who.** The Brahmin warrior-sage of the Bhrigu line. Angered by the killing of his father, he cleared
the earth of kshatriyas twenty-one times and, at Samantapanchaka, made five lakes of their blood, where
he offered libations to his ancestors (CE 1.2.3–1.2.6).

**Look.** The tallest figure in the series (1.15 × Sauti), built like a wrestler who lives on roots:
broad chest and shoulders, heavy arms, narrow waist, bare torso with the sacred thread. Short full
beard. A **tall matted-hair tower** (a jata of lumpy coils, bound twice) with locks down the back. A short
deer-skin loincloth.

| | |
|---|---|
| Palette | fill `#140507` · lit `#3e0a0a` · inner `#5a0c0c` · rim `#8e0f14` → `#ff4a3a` · ornaments `#7a2216` → `#f08a5a` · wrath eye `#ff6a3a` |
| Proportions | ≈ 1200 units to the top of the jata. Hip 560, thigh 282, shin 262. Arms 190 + 176, as thick as Sauti's legs. Head ×1.14. The jata tower is ≈ 250 tall (1.6 × the head). |
| Props | **parashu**: an 800-unit haft with a crescent blade (×1.35) and a back spike, in the near hand · **great bow** slung diagonally across his back · rudraksha at the throat · armband |
| Signature light | **Blood-red rim.** Rim width ×1.1, glow 1.0, inner 0.9. The blade's edge always catches the light. `mood: 'wrath'` lights an ember in his eye. |
| Poses | `stand` (axe planted) · `walk` (axe shouldered) · `sit` · `speak` · `bless` · **`raise-axe`** (k: planted → overhead, the blade high, his arm ahead of his face) · **`strike`** (k: overhead → down and forward) · **`lower-axe`** (k: raised → blade turned to the earth, head bowed: renunciation) |
| Voice | `parashurama` → am_onyx, 0.77×, −1 st (median F0 ≈ 88 Hz). Reserved: he does not speak in episode 2. |

## The Pitrs (Parashurama's ancestors) · `pitr`

**Who.** Richika and the Bhargava fathers. They appear to Parashurama at the five lakes, are pleased,
offer him a boon, and ask him to stop; he does, and the place becomes holy (CE 1.2.7–1.2.9).

**Look.** Luminous elders seen from the front, who never quite touch the ground. Long robes thin into
seven wisps; shawl panels hang over both shoulders; long beards; topknots. `index` picks one of five
fixed variations (beard long / forked / short, bun / tall knot, height ±5 %).

| | |
|---|---|
| Palette | fill `#334058` · inner `#9fb4d8` · rim `#a9b9d2` → `#f4f8ff` · aura `#a9c4ff` · ornaments `#b9c8e0` → `#f4f8ff` |
| Proportions | ≈ 900 units, no feet. Shoulders 208 wide, heads 72 × 96. |
| Props | shawl panels · silver robe folds · mala · closed eyes and beard strands drawn as silver lines |
| Signature light | **Cool silver glow.** Drawn translucent (screen blend at 78 %) with a halo rim all the way round (brightest toward the light), a cool aura behind, and the lower 42 % fading out. |
| Poses | `stand` (hovering, a slow bob) · `walk` (a glide) · `sit` (hovering, cross-legged) · `speak` · `bless` (both hands) · **`plead`** (both palms out: "stop") · **`descend`** (k: the robe trails upward while falling and settles at 1) |
| Voice | `pitrs` → bm_daniel, 0.74×, −2 st (reserved; in episode 2 they speak through the narrator). |

## Vyasa (Krishna Dvaipayana) · `vyasa` (for future episodes)

**Who.** The composer of the epic, "the dark one born on an island" (dvaipa-ayana). He taught it to
Vaishampayana, who recited it at Janamejaya's sacrifice (CE 1.1.52–1.1.57).

**Look.** Dark-complexioned: the only blue-black fill in the series. Lean and upright. Long matted hair
falls down his back to the waist; a long full beard reaches his chest; a wide coiled topknot; bare chest
with the sacred thread; an ankle-length bark-cloth (valkala) with a ragged hem.

| | |
|---|---|
| Palette | fill `#0a0d12` · lit `#1e2a33` · inner `#1b2430` · rim `#b8925a` → `#ffe9b0` · halo `#ffcf7a` · ornaments `#a8741f` → `#f7dc9c` |
| Proportions | ≈ 1040 units. Hip 490, thigh 246, shin 232. Beard 200 long; hair ≈ 480 below the crown. |
| Props | palm-leaf **manuscript** (pothi) with boards and a cord, in the far hand (on his lap when seated) · japa mala in the near hand |
| Signature light | **Soft gold halo.** A wide warm-gold aura behind the head and a faint prabhavali ring (two thin circles), a soft rim (width ×0.85), and a cool inner glow. |
| Poses | `stand` · `walk` · `sit` · `speak` · **`dictate`** (near hand raised, one finger up) · `bless` · `bow` |
| Voice | `vyasa` → bm_george, 0.76×, −2.5 st (median ≈ 127 Hz after the shift). Grave and measured. |

## King Janamejaya (son of Parikshit) · `janamejaya` (for future episodes)

**Who.** The young Kuru king, Arjuna's great-grandson. The epic was first recited at his snake
sacrifice (sarpa-satra) (CE 1.1.8–1.1.10).

**Look.** Clean-shaven but for a small upturned moustache; long curls at the nape. A tall
**kirita-mukuta** crown (band, three tiers, a finial, flared side wings). Great makara earrings, layered
necklaces, pointed armlets, a jewelled belt with tassels, an ankle-length pleated silk dhoti, and a sash
flying behind him. A sword in its scabbard at the hip.

| | |
|---|---|
| Palette | fill `#0e0806` · lit `#3a1a0c` · inner `#4a1a08` · rim `#c45a1a` → `#ffb35a` · ornaments `#c8902a` → `#ffe08a` |
| Proportions | ≈ 1060 units without the crown, ≈ 1230 with it. Hip 500, thigh 250, shin 236. Throne seat at 300. |
| Props | crown · makara earrings · necklaces · armlets · belt + tassels · sash · sword · **simhasana** throne (sit pose) · **sruk** ladle (offer pose) |
| Signature light | **The sacrificial fire's saffron with gold glints.** A deeper, more orange rim than Sauti's. His ornaments are the brightest in the series (0.6–1.0). |
| Poses | `stand` (hand on the sword hilt) · `walk` · `sit` (enthroned) · `speak` (command: the near hand points) · `bless` · **`offer`** (pours ghee from the ladle) |
| Voice | `janamejaya` → am_michael, 0.9×, +1 st. Younger and brighter than the narrator, who uses the same voice at 0.81×, unshifted. |

## Ganesha (Ekadanta), the scribe · `ganesha` (episode 4)

**Who.** As tradition tells it (the vulgate's Adi Parva 1; the Critical Edition excludes the
passage, so the episode marks it on screen with `KIT.series.traditionTag`): Vyasa needed a scribe;
Ganesha agreed on condition that Vyasa never stop dictating; Vyasa asked that he write nothing he
did not understand, and composed more whenever Ganesha paused over a verse. When his pen broke,
Ganesha broke off his own tusk and wrote on.

**Look.** Drawn reverently, as a temple-mural / shadow-puppet profile. An elephant head with a high
double-domed cranium, a great fan ear (gold border), a trunk that curls out and back at chest height
(gold contour so it reads against the body), a gold almond eye and a vermilion tilak; a tall tiered
**karanda-mukuta** crown with a lotus-bud finial and side flares. A full round belly bound with a
serpent belt (Vasuki); necklaces; armlets. **Four arms**: the front pair writes (iron stylus in the
near hand, palm leaf on the far hand over the knee); the raised back pair holds the **ankusha** goad
and a lotus bud. Ankle-length dhoti. Seated cross-legged to write.

| | |
|---|---|
| Palette | fill `#120806` · lit `#3a1408` · inner `#5a1a0a` · rim `#c8401a` → `#ffb070` · aura `#ff7a3a` · tusk `#f2e6c8` · leaf `#d9b878` · ornaments `#a8741f` → `#ffd27a` |
| Proportions | ≈ 1000 units to the crown tip standing (crown ≈ 230), ≈ 760 seated. Hip 430, thigh 226, shin 206. Head ≈ 300 across with the ear; trunk ≈ 310; belly 296 × 264. Stout arms (60 → 32). |
| Props | palm leaf · iron stylus (lekhani), later **the broken tusk** · ankusha and lotus bud · crown · serpent belt · tilak |
| **Tusk state** | Whole until he breaks it. `pose: { …, tusk: 'broken' }` (or the `break-tusk` pose past k = 0.5) draws the right tusk as a stub, and he writes with the broken tusk from then on. Tusks are painted ivory over the silhouette. |
| Signature light | **Warm saffron-vermilion.** Rim × 1.05, glow 0.9, inner 0.9 (0.45 front-lit); a soft vermilion aura and a faint ring behind the head (the sindhura he is worshipped with). |
| Poses | `stand` · `sit` · **`write`** (k; `phase` drives the stroke along the leaf) · **`pause`** (k: the stylus lifts, the head bows, the trunk curls: grasping a verse) · `speak` (k: one finger raised: "one condition") · **`break-tusk`** (k: hand to the tusk 0 → 0.45, snap at 0.5, down to the leaf with it at 1) · `bless` |
| Voice | `ganesha` → **am_echo**, 0.82×, unshifted (median F0 ≈ 114 Hz: between the narrator and the elder). Warm and unhurried; no other cast member uses it. |

## Vaishampayana, Vyasa's disciple · `vaishampayana` (episode 4)

**Who.** Vyasa taught him the epic; he first recited it, at King Janamejaya's sacrifice, where Sauti
heard it (CE 1.1.57). A sage variant built on Vyasa's frame (`src/kit/characters/vaishampayana.js`).

**Look.** Young and upright: a short trimmed beard, a high bun bound with a cord, hair to the nape;
bare chest with the sacred thread and an uttariya over the shoulder; bark-cloth valkala. No halo
(that is his teacher's).

| | |
|---|---|
| Palette | fill `#0d0a0c` · lit `#2e2024` · inner `#2a1a20` · rim `#a8706a` → `#ffd6c4` · ornaments `#9a7a5a` → `#f2dcc0` |
| Proportions | ≈ 1010 units (Vyasa's frame): hip 490, thigh 246, shin 232. |
| Props | the bound manuscript he receives (far hand) · japa mala · uttariya |
| Signature light | **Dawn-rose.** Rim × 0.9, glow 0.6, a plum inner glow. |
| Poses | `stand` · `walk` · `sit` · `speak` · **`receive`** (k: both hands forward; he holds the manuscript at k = 1) · `bless` · `bow` |
| Voice | `vaishampayana` → bm_fable, 0.86×, +1.5 st (reserved: he does not speak in episode 4). |

## Sarama (devashuni, the dog of the gods) · `sarama` (episode 5)

**Who.** The divine dog. Her son is beaten at Janamejaya's long sacrifice at Kurukshetra though he
did no wrong; she comes to the king and curses him: "an unseen danger will fall upon you" (CE 1.3.1–8).

**Look.** A great, dignified hound, never a pet: a sighthound's deep chest and tucked waist, long
legs, a long arched neck with a mane of flame-like tufts, a wedge head with tall pointed ears, a
sickle plume of a tail. A four-point **star on her brow**, a collar of pearls with a pendant jewel,
gold anklets, mural swirl lines on shoulder and haunch. Built on `CH.canine` (the shared dog rig in
`sarama.js`).

| | |
|---|---|
| Palette | fill `#221a36` · inner `#9a6a7c` · rim `#d9a88c` → `#fff4e8` · aura `#ffd2b8` · ornaments `#e8c48c` → `#fff6dc` |
| Proportions | ≈ 560 units at the shoulder, ≈ 1000 to the ear tips (Janamejaya with his crown: 1230), ≈ 1140 nose to tail. Seated: ears ≈ 900. |
| Props | brow star · pearl collar + pendant · flame-tufted mane · plume tail · anklets · swirl lines |
| Signature light | **Dawn-pearl, luminous.** A halo rim all the way round (rose-pearl), a rose aura behind her that flares when she curses; eye and brow-star glint (mood `wrath`: the eye burns rose). Never gold (Vyasa), never silver-blue (the Pitrs). |
| Poses | `stand` · `walk` (stately trot) · `run` · `sit` (upright on her haunches, like a temple guardian) · `speak` (jaw with `expression.speak`) · **`curse`** (k: head high and forward, near forepaw lifted, aura flares) · **`comfort`** (k: head lowered to her son) |
| Voice | `sarama` → **af_heart**, 0.8×, −1.5 st: calm, grave, a mother's dignity, never shrill. |

## Sarama's son (the pup) · `pup` (episode 5)

**Who.** The small dog who came near the sacrifice, was beaten by the king's brothers though he did
nothing wrong (he neither looked at nor licked the offerings), and ran crying to his mother (CE 1.3.1–4).

**Look.** Unmistakably her son, unmistakably young: her wedge head and arched neck on a short body
with short legs and a big head; soft ears whose tips fold forward; a thin whip of a tail (tucked
when afraid); a faint star on his brow; no mane, no collar.

| | |
|---|---|
| Palette | fill `#1a1424` · inner `#7a5a6a` · rim `#c89a80` → `#ffe8d8` · ornaments `#d8b890` → `#f8e4c8` |
| Proportions | ≈ 230 units at the shoulder, ≈ 480 to the ear tips (a little under half his mother). |
| Signature light | **His mother's dawn-pearl, smaller and dimmer:** the same halo rim (×0.9), no aura, a faint warm glow round his head. |
| Poses | `stand` · `walk` · `run` · **`sniff`** (k) · **`cower`** (k: crouched, ears back, tail tucked) · `sit` · **`cry`** (k: seated, head thrown back, mouth open) |
| Voice | `sarama_pup` → af_sky, 0.9×, +3 st (reserved: he only whimpers, in the score). |

## Janamejaya's brothers: Shrutasena · Ugrasena · Bhimasena · `prince` (episode 5)

**Who.** The king's brothers, who sat with him at the sacrifice at Kurukshetra and beat Sarama's
son (CE 1.3.1–2).

**Look.** Princes of the king's house: crowns, earrings, necklace, sacred thread, a jewelled belt, a
knee-length pleated dhoti, a sash; never the king's tall kirita-mukuta. Each carries a staff of
office. `index` picks the brother (a fixed design):

| index | name | build | crown | face / hair | staff |
|---|---|---|---|---|---|
| 0 | Shrutasena | slim, tall (×0.94 wide, ×1.03 tall) | conical karanda crown | long locks down the back | slender cane |
| 1 | Ugrasena | stocky (×1.10, ×0.98) | low band, three points | curled moustache, short beard | knobbed staff |
| 2 | Bhimasena | the biggest (×1.18, ×1.06) | jewelled fillet round a high topknot | heavy shoulders | long banded bamboo |

| | |
|---|---|
| Palette | fill `#0d0806` · inner `#3e1a0a` · rim `#a8501c` → `#f2a05a` · ornaments `#a87a2a` → `#e8c070` |
| Signature light | **Kuru copper-saffron, a shade duller than the king's.** Ornaments at 0.45–0.85 (never as bright as his). |
| Poses | `stand` (staff planted) · `walk` · `run` · `sit` · **`raise`** (k: staff overhead) · **`strike`** (k: overhead → down and forward) · **`point`** (k) |
| Voice | `kuru_princes` → am_onyx, 0.86× (reserved: they do not speak). |

## Uttanka, the student · `uttanka` (episode 6)

**Who.** Disciple of the teacher Veda. Sent for the earrings of King Paushya's queen as his gift to
his teacher's wife, robbed by Takshaka, he follows him into the Naga world and wins them back; still
angry, he urges Janamejaya to avenge his father (CE 1.3, the Paushya parva).

**Look.** A young brahmacharin: lean and quick, beardless, a **shaven head with one knotted shikha
tuft**; a black antelope skin over the far shoulder (hoof-flaps behind); the sacred thread; a triple
munja-grass girdle; a short loincloth with a white edge. A palasha **staff with a three-leaf sprig**,
always in the FAR hand (the near hand acts).

| | |
|---|---|
| Palette | fill `#0e0808` · inner `#4a1c14` · rim `#d0704e` → `#ffd2b4` · ornaments `#a8783a` → `#f0d090` · wrath `#ff5a2a` |
| Proportions | ≈ 1000 units (a little under Sauti): hip 485, thigh 244, shin 230. |
| Signature light | **Dawn coral**, rosier than Sauti's gold, so he burns warm in the Naga world's green. Mood `wrath`: a red under-glow and an ember in his eye. |
| Poses | `stand` · `walk` · `run` · `sit` · `bow` (k) · `speak` (k) · `point` (k) · **`hold`** (k: cupped hand forward, the earrings) · **`raise`** (k: held high) · **`crouch`** (k: one knee down, near hand to the ground) |
| Voice | `uttanka` → **am_puck**, 0.84×, +0.5 st: bright and young, apart from the narrator and Janamejaya (both am_michael). |

## King Paushya's queen · `queen` (episode 6)

**Who.** She gives Uttanka her earrings and warns him: "Takshaka, the serpent king, wants these" (CE 1.3).

**Look.** Tall and composed: a high crown-bun ringed with jasmine and a chudamani jewel, a forehead
pendant, the great **kundala earrings** (until she gives them: `pose.earrings: false`), layered
necklaces, stacked bangles, a jewelled girdle, an ankle-length pleated sari whose pallu crosses the
chest and streams behind. Built on `CH.female` (the shared female figure in `paushya-queen.js`).
The earrings themselves are a prop, `KIT.kundala.draw / .pair` (gold ring, ruby boss, three pearl
drops, a travelling glint), drawn the same wherever they go.

| | |
|---|---|
| Palette | fill `#120a08` · inner `#5a2a14` · rim `#d89a48` → `#fff0c0` · ornaments `#d8a848` → `#fff4b0` · ruby `#c0182a` |
| Proportions | ≈ 1000 units to the top of the bun: hip 480, thigh 240, shin 226. |
| Signature light | **Palace lamp-gold with rose**; ornaments 0.55–1.0 (as bright as the king's). |
| Poses | `stand` · `walk` · `sit` · `speak` · **`give`** (k: both hands forward, cupped) · **`warn`** (k: a raised forefinger) · `bless` |
| Voice | `queen` → **bf_emma**, 0.82×: clear and composed, the warning quiet. |

## The teacher's wife · `gurupatni` (episode 6)

**Who.** Wife of Uttanka's teacher; she asks for the queen's earrings as her gift (CE 1.3). Minimal:
she appears once.

**Look.** A hermitage householder: the end of her plain sari over her head and shoulders (a hood, never
a crown), a low knot of hair under it, a mangala-sutra, two plain bangles, a small clay **oil lamp**
in her far hand. Built on `CH.female`.

| | |
|---|---|
| Palette | fill `#100a08` · inner `#3a1e10` · rim `#c08050` → `#f8d8a8` · ornaments `#a07838` → `#e8c888` |
| Signature light | **Hearth amber, soft**; ornaments only 0.3–0.6; her lamp flame is her one bright point. |
| Poses | `stand` · `walk` · `sit` · `speak` · **`ask`** (k: near hand opens, palm up) · `bless` |
| Voice | `guru_patni` → bf_isabella, 0.82×, −0.5 st (reserved: her request is narrated). |

## Takshaka, king of the Nagas · `takshaka` (episodes 5–6 and on)

**Who.** The serpent king. He covets the queen's earrings, steals them from Uttanka in a beggar's
guise, vanishes underground and, overwhelmed by fire and smoke in his own world, gives them back. He
killed King Parikshit, Janamejaya's father (CE 1.3).

**Look.** **Naga form:** a crowned king from the waist up (broad chest, armlets, layered necklaces, a
jewelled band where the man becomes the serpent) rising from a great serpent body that falls in an S,
loops once into a coil and runs out into a long tail; behind his head a **canopy of five cobra
hoods** fans up like a halo (spectacle marks, flickering tongues); a tall crown with a serpent-jewel
(mani). **Disguise** (`guise…` poses): a thin, stooped beggar with a shaven head, a sparse beard, a
loincloth and a begging bowl, wavering with a cold green double image.

| | |
|---|---|
| Palette | fill `#06100c` · inner `#0c3a28` · rim `#1f9a64` → `#a8ffd0` · ornaments `#3aa878` → `#d8ffe8` · aura `#20c880` · eyes `#b8ffe0` |
| Proportions | ≈ 1430 units to the hood tops (×1.15 Janamejaya's crown), ≈ 1450 long; serpent body 130 thick, a 10-unit tail tip. Disguised: ≈ 940. |
| Signature light | **Cold green.** Rim ×1.1, glow 1.1; eyes, the cobras' eyes and the mani burn green-white; a cold aura behind the hoods that flares with them. Disguised: the same cold rim betrays him, plus the shimmer. |
| Poses | `stand` · `speak` · **`strike`** (k: lunge, hoods flare) · **`recoil`** (k) · **`give`** (k: yields) · **`dive`** (k: pours forward into the earth) · **`guise`** · **`guise-walk`** · **`guise-run`** · **`guise-grab`** (k) |
| Voice | `takshaka` → am_fenrir, 0.74×, −3 st (reserved: cold and slow). |

## King Parikshit (son of Abhimanyu, Janamejaya's father) · `parikshit` (episode 7)

**Who.** The Kuru king. Hunting, he loses a wounded deer, asks the silent sage Shamika where it went,
and, met with silence, lays a dead snake on the sage's shoulder with the tip of his bow. Cursed by the
sage's son Shringin, he hides in a palace on a single pillar; on the seventh day Takshaka, hidden as a
tiny insect in a fruit, kills him with his venom (CE 1.36–40).

**Look.** His son's frame, older and harder: a short full beard and moustache, hair tied at the nape; a
**hunting crown** (gold band, a low two-tier crest, a plume of three feathers falling back); makara
earrings, one necklace, armlets; a **quiver** on his back (fletchings above the far shoulder) on a chest
strap; a knee-length hunting dhoti with a sash; a long **recurved bow, always in the near hand**. Seated,
he takes his son's simhasana (the same house).

| | |
|---|---|
| Palette | fill `#100606` · lit `#3a1418` · inner `#4a1018` · rim `#b8384a` → `#ffb0a0` · ornaments `#b88a2a` → `#ffd888` |
| Proportions | ≈ 1060 units without the crest (≈ 1190 with it): hip 500, thigh 250, shin 236; a heavier chest than his son's. Bow 620 tip to tip. |
| Signature light | **Rose-crimson with gold**: rosier and deeper than his son's saffron, never Parashurama's blood-red. Ornaments 0.5–0.9. Mood `wrath`: an ember in his eye. |
| Poses | `stand` (bow planted) · `walk` · `run` · **`weary`** (k: a slow, spent walk, head down, bow trailing) · `sit` (enthroned) · `speak` (k: far hand opens) · `point` · **`drape`** (k: bow tip to the grass 0 → 0.25, lifted high with the snake → 0.5, laid level over the sage → 1) · **`hold`** (k: the bow set aside, a fruit turned before his eyes) · **`fall`** (k: struck) |
| Anchors | `CH.parikshit.anchor(opts, 'hand' \| 'bowTip' \| 'head' \| 'eye')` |
| Voice | `parikshit` → **am_eric**, 0.84×, −1 st: mature and tired, older than his son (am_michael +1 st), apart from the narrator. |

## Shamika, the silent sage · `shamika` (episode 7)

**Who.** A sage under a vow of silence (mauna), living among the cows. He does not answer the king and
bears the dead snake without a word; when his son curses the king he grieves and sends his disciple to
warn him (CE 1.36–38).

**Look.** In the prime of age and still as a stone: a long beard to the chest, a great coiled **jata bun**
with locks down the back, the **tripundra** (three ash lines) on his brow, **eyes always closed** (they open
only when he lifts his head in grief), a long rudraksha mala wound round the near wrist, a stiff
**bark-cloth shawl** over the far shoulder, a white loincloth; lean, a little stooped. His rest pose is
seated meditation (hands in dhyana mudra).

| | |
|---|---|
| Palette | fill `#0e0a12` · lit `#2a2234` · inner `#2e2440` · rim `#9a84c0` → `#f0e6ff` · ornaments `#a898c0` → `#f4eeff` |
| Proportions | ≈ 1010 units standing: hip 480, thigh 242, shin 228; stooped 0.06 rad; beard ≈ 180. Seated hip 145. |
| Signature light | **Twilight lilac, the colour of stillness** (rim ×0.95, glow 0.7). Never Vyasa's gold, the elder's ivory or the Pitrs' silver-blue. |
| Poses | **`sit`** (meditation; default) · `stand` · `walk` · **`grieve`** (k: head sinks, hand to the brow) · **`send`** (k: points the way) · `bless` |
| Anchors | `CH.shamika.anchor(opts, 'shoulderN' \| 'shoulderF' \| 'neck' \| 'head' \| 'hand')` (the dead snake, `EP7.deadSnake`, is laid across them) |
| Voice | `shamika` → bm_george, 0.78×, unshifted (reserved: he keeps his vow; his warning is narrated). |

## Shringin, Shamika's son · `shringin` (episode 7)

**Who.** A young ascetic of fierce tapas. Hearing that his father wears a dead snake, he touches water and
curses the king: within seven days Takshaka will burn him with his venom (CE 1.37).

**Look.** Young and taut, beardless: matted hair bound in **two horn-like knots** at the crown (his name
means "the horned one"), each with a bound knot and a round tip; a lock at the nape; the sacred thread, a
rudraksha at the throat; a knee-length **bark loincloth** with a ragged hem and a grass cord; a clay
**kamandalu, always in the far hand** (he seals the curse with its water).

| | |
|---|---|
| Palette | fill `#100604` · lit `#361208` · inner `#5a1408` · rim `#e0481c` → `#ffd27a` · ornaments `#c87a2a` → `#ffe0a0` |
| Proportions | ≈ 1000 units to the horn-knots: hip 480, thigh 242, shin 228; forward-leaning 0.04 rad. |
| Signature light | **Molten vermilion (tapas)**, rim ×1.05, glow 0.95: hotter and yellower than Uttanka's coral. Mood `wrath`: an ember in the eye and a heat-glow behind his head. |
| Poses | `stand` · `walk` · `run` · `sit` · `speak` · `point` · **`scoop`** (k: water from the pot into the cupped hand) · **`curse`** (k: the cupped hand flung up and forward, scattering the water) |
| Voice | `shringin` → **am_liam**, 0.88×, +0.5 st: young and hot, the quickest voice in the cast; apart from Uttanka (am_puck). |

## The priests of the snake sacrifice (ritvij) · `priest` (episode 8)

**Who.** The priests of Janamejaya's sarpa-satra: in black garments, their eyes red with smoke, they pour
the oblations and call the serpents by name (CE 1.47–48). The epic names them: Chandabhargava (hotr),
Kautsa (udgatr), Jaimini (brahman), Sharngarava and Pingala (adhvaryus).

**Look.** Brahmins in profile: a shaven head with a knotted shikha (Jaimini: a heavy topknot), a **black
upper cloth over both shoulders** and a black ankle-length lower cloth, the sacred thread showing at the
chest, three ash lines on the brow, a darbha-grass ring, a **sruva** ladle. **Their eyes always burn red.**
`index` picks the priest:

| index | name | beard | build |
|---|---|---|---|
| 0 | Chandabhargava (hotr) | long, pointed | broad ×1.06 |
| 1 | Kautsa (udgatr) | short | slim, tall ×0.94 / ×1.03 |
| 2 | Jaimini (brahman) | none (a topknot) | even |
| 3 | Sharngarava (adhvaryu) | forked | stooped 0.1 rad |

| | |
|---|---|
| Palette | fill `#0a0808` · lit `#241a18` · inner `#2a1a18` · rim `#8a7a70` → `#f2dcc8` · ornaments `#9a7a5a` → `#f0d0a0` · eyes `#ff3a1a` |
| Signature light | **Ash and ember**: the pale ash on everything; the fire lights them, they never glow saffron themselves. |
| Poses | `stand` · `walk` · `sit` (default) · **`offer`** (k: the sruva over the fire; phase tips it) · **`chant`** (k: both hands raised) · `speak` |
| Voice | `priests` → am_onyx, 0.79×, −1 st (reserved: their chant is in the score). |

## The builder (sthapati, sutradhara) · `sthapati` (episode 8)

**Who.** The master builder who measures the ground of the snake sacrifice and foretells that it will not
be completed: a brahmin will be the cause (CE 1.47).

**Look.** A working man in profile: a short square beard, a **wrapped turban** with a tail, a **coil of
measuring cord** over the far shoulder, a plumb-bob on a line when he measures, a peg-mallet at the belt, a
short work dhoti.

| | |
|---|---|
| Palette | fill `#0e0a06` · inner `#3a2410` · rim `#b8865a` → `#f8dcb8` · ornaments `#a88a5a` → `#f0d8a8` (0.3–0.55) |
| Signature light | **Ochre clay**: earthy, plainer than any brahmin or king. |
| Poses | `stand` · `walk` · `sit` · **`measure`** (k: plumb-line held out) · **`warn`** (k: a raised forefinger) · `speak` |
| Voice | `sthapati` → bm_daniel, 0.8× (reserved: his warning is narrated). |

## Indra (Shakra), king of the gods · `indra` (episode 8 and on)

**Who.** King of the devas. Takshaka flees to him from the snake sacrifice and he promises protection
(CE 1.48). Recurs: the churning of the ocean, Garuda and the amrita, the Khandava forest.

**Look.** Tall and broad, beardless with a long sweeping moustache; a jewelled **kirita** in four tiers
with a **sunburst crest**; a **prabha** (a pale-gold disc-halo of rays) behind his head; great earrings, a
broad collar, a sacred thread of pearls, armlets, an ankle-length silk dhoti and two flying sashes; the
**vajra** (a grip with a three-pronged head at each end) always in the near hand. `sit` seats him on a
cloud-throne.

| | |
|---|---|
| Palette | fill `#0a0c18` · lit `#1a2238` · inner `#1a2a6a` · rim `#4a8cff` → `#e8f4ff` · ornaments `#e0b040` → `#fff4c0` · prabha `#ffe9a8` |
| Proportions | ≈ 1100 units without the crown (≈ 1230 with it): hip 520, thigh 262, shin 246. |
| Signature light | **Storm and lightning** (rim ×1.1, glow 1.0), gold ornaments 0.6–1.0, the prabha behind, the vajra crackling white-blue. Never the Pitrs' translucent silver, never Takshaka's green. |
| Poses | `stand` · `walk` · `sit` (cloud-throne) · `speak` · **`protect`** (k: abhaya) · **`raise`** (k: the vajra high) |
| Voice | `indra` → **am_adam**, 0.8×, −1.5 st: broad and regal; no one else uses am_adam. |

## Kadru, mother of the serpents · `kadru` (episodes 8–10 and on)

**Who.** Daughter of Daksha, wife of Kashyapa. She asks for a thousand serpent sons of equal splendour;
later she wagers with her sister-wife Vinata over the horse Uchchaihshravas's tail, and curses her sons who
refuse to cheat for her to burn in Janamejaya's sacrifice (CE 1.14–20).

**Look.** Tall, proud, a sharp profile: a high coiled bun crowned by a small **five-hooded serpent diadem**,
heavy round earrings, a necklace of green stones, **serpent-coil armlets** and a serpent girdle; a sari whose
pallu falls straight down her back. Built on `CH.female`.

| | |
|---|---|
| Palette | fill `#0e0c06` · lit `#2e2810` · inner `#3a3008` · rim `#9a7a28` → `#ece084` · ornaments `#3aa878` → `#c8ffd8` |
| Signature light | **Tawny olive-gold** ("kadru" means tawny) **with venom-green jewels** (0.5–0.9); a green glint in her eye (brighter in wrath). Kin to Takshaka's green, never his cold rim. |
| Poses | `stand` · `walk` · `sit` · `speak` · **`point`** (k: the wager) · **`curse`** (k: forefinger high) · **`cradle`** (k: an egg at her breast) |
| Voice | `kadru` → **bf_alice**, 0.82×, −0.5 st: cool, proud, clear. |

## Vinata, mother of Aruna and Garuda · `vinata` (episodes 9–10 and on)

**Who.** Daughter of Daksha, wife of Kashyapa. She asks for two sons greater than all of Kadru's; after
five hundred years she breaks one egg too soon (Aruna), and loses the wager to become Kadru's slave until
Garuda frees her (CE 1.14–20).

**Look.** Gentle and upright, softer in line than her sister: a low knot at the nape wound with lotus buds,
a lotus at the temple, small drop earrings, a fine necklace, a sari whose pallu crosses the near shoulder and
falls in front. **Enslaved** (`pose.slave: true`): no ornaments, the end of the sari over her head. Built on
`CH.female`.

| | |
|---|---|
| Palette | fill `#100a0c` · lit `#30182a` · inner `#3a1a2a` · rim `#d890b0` → `#fff0f6` · ornaments `#e8b8c8` → `#fff4f8` |
| Signature light | **Lotus dawn-rose** (0.4–0.75 ornaments). Never Kadru's olive-gold. |
| Poses | `stand` · `walk` · `sit` · `speak` · **`cradle`** (k) · **`reach`** (k: bending to an egg) · **`grieve`** (k) · **`bow`** (k) · any pose with `slave: true` |
| Voice | `vinata` → **bf_lily**, 0.82×, +0.5 st: soft and earnest; apart from Kadru (bf_alice) and the queen (bf_emma). |

## Kashyapa (the Prajapati) · `kashyapa` (episode 9 and on)

**Who.** The great sage, son of Marichi, husband of Daksha's daughters, father of gods, serpents and birds.
Pleased with Kadru and Vinata, he grants their boons, tells them to guard their children well, and goes into
the forest (CE 1.14). (Not the healer Kashyapa whom Takshaka turned back on the road: that is another sage,
held for episode 37.)

**Look.** An ancient sage of great presence, upright: a very long beard to the waist, a **tall tapering
jata** bound in bands with a round finial, locks down the back, the tripundra, a **black-buck skin** over
the far shoulder (hoof-flaps behind), the sacred thread, a rudraksha mala, and a **tall staff with a hanging
gourd** always in the far hand. Eyes open: he is the giver. (Built on Shamika's frame.)

| | |
|---|---|
| Palette | fill `#080e12` · lit `#16262e` · inner `#10303a` · rim `#40b0d8` → `#e0f8ff` · ornaments `#c8a050` → `#fff0c0` |
| Signature light | **Sky turquoise**, the clear sky before sunrise, with gold ornaments. Never Indra's electric blue, Takshaka's green or the Pitrs' silver. |
| Poses | `sit` (default) · `stand` · `walk` · `speak` · **`bless`** (k: the boon) · `grieve` |
| Voice | `kashyapa` → bm_daniel, 0.78×, −1 st: calm and paternal. |

## Aruna, the red of dawn · `aruna` (episode 10 and on)

**Who.** Vinata's first son, from the egg she broke too soon: formed above the waist, unformed below. He
curses her to five hundred years as her rival's slave unless his brother, left to hatch in his own time,
sets her free, and rises to become the charioteer of the Sun (CE 1.14).

**Look.** A radiant youth from the waist up: beardless, long hair streaming back like flame, a crown band
with a sunburst jewel, earrings, a necklace, armlets; **below the waist only wisps of red light** (the rig's
fade, like the Pitrs, but warm and solid above). `rein` holds the Sun's reins.

| | |
|---|---|
| Palette | fill `#1a0606` · lit `#3a0e08` · inner `#6a140a` · rim `#ff5a3a` → `#ffd8b0` · ornaments `#ffb070` → `#fff0d0` · aura `#ff5a3a` |
| Signature light | **Dawn red**: a halo rim all round, faded below the waist, glow 1.1, a red aura behind. His light is the key light of every shot he is in. Never Parashurama's dark blood-red or Shringin's vermilion. |
| Poses | `stand` · **`emerge`** (k) · `speak` · **`curse`** (k) · **`point`** (k) · **`rise`** (k) · **`rein`** (k) |
| Voice | `aruna` → **am_echo**, 0.84×, +2.5 st: young but grave (Ganesha uses am_echo unshifted). |

## Surya, the Sun · `surya` (episode 10)

**Who.** The Sun, whose chariot Aruna drives (CE 1.14). Drawn frontally, as in temple iconography.

**Look.** A standing radiant figure inside a great **sun-disc of rays**: a tall kirita, round earrings, a
broad collar, both hands raised at the shoulders holding **full-blown lotuses**, an ankle-length dhoti. His
chariot (`EP10.chariot`: a gold disc-wheel and seven horses of light) is a prop.

| | |
|---|---|
| Palette | fill `#3a1a04` · inner `#ffb030` · rim `#ffd060` → `#fffbe8` · ornaments `#fff0b0` → `#ffffff` |
| Signature light | **Blazing gold-white**: halo rim all round, glow 1.3, the disc of rays behind: the brightest thing in any frame. |
| Poses | `stand` (frontal) |
| Voice | `surya` → bm_george, 0.8×, −1 st (reserved: he does not speak in episode 10). |

### Locations and light

Characters keep their signature light everywhere; the **environment and its key light change per
location**. The Naimisha clearing (`KIT.ashram`) is night and firelight: the frame every episode
returns to. Vyasa's hermitage (`src/scenes/ep04/_common.js`, `EP4.hermitage`) is the Himalayan
foothills at morning: snow peaks, misty valleys, deodars, a thatched hut and a stream, a low sun on
the left (`EP4.sunLight` points each character's rim toward it, with a little front light).
Episodes 5–6 (`src/scenes/ep05/_common.js`, `src/scenes/ep06/_common.js`): the sacrificial enclosure at
**Kurukshetra by day** (`EP5.enclosure`: teal-and-ochre sky, the sun to the right, `EP5.sunLight`; the
curse darkens it to violet and eclipses the sun); Sarama's **ridge above the clouds** at a rose-pearl
dawn (`EP5.heaven`); **Hastinapura at night**, a colonnade of oil lamps (`EP5.palace`); a **forest road
at dusk** (`EP5.duskRoad`, `EP6.road`, with a stream and the cleft); the teacher's **hermitage at
morning** (`EP6.hermitage`); **King Paushya's palace in warm gold** with its stone lattice
(`EP6.palace`); the **Naga world** underground in deep blue-green bioluminescence (`EP6.naga`); and
**Janamejaya's court** in saffron lamplight (`EP6.court`, with the vow's fire).

Episodes 7–10 (`src/scenes/ep07/_common.js` … `ep10/_common.js`): the **forest at noon** (`EP7.noon`: a
bleached white-gold sky, light straight from above); **Shamika's hermitage among the cows** in honey-gold
afternoon light from the right (`EP7.pen`; `evening` turns it violet); a **river at dusk under a red sky**
(`EP7.river`: Shringin's place, the low sun on the water); the **palace on one pillar** (`EP7.tower`: cold
blue-silver moonlight, or the crimson sunset of the seventh day; its lamplit interior is `EP7.pavilion`,
flooded by the green-gold venom-fire `EP7.venomFire`); the **snake sacrifice** (`EP8.satra`: a smoke-choked
crimson enclosure lit from below by the great fire; `dawn` shows the empty ground at grey-rose dawn with
cords and pegs); **Indra's heaven** (`EP8.svarga`: white-gold cloud banks and a pale palace, cool light from
above); **Kashyapa's hermitage before sunrise** (`EP9.hermitage`: cool blue-violet, the east glowing low on
the right; `years` wheels the sun and moon over it); the **open sky at dawn** (`EP10.sky`: grey flooding to
red and gold); and the **shore of the ocean at sunrise** (`EP10.shore`).

## Narrator · `narrator`

**Voice:** am_michael, 0.81× (was 0.9×), pitch 0 (median F0 ≈ 129 Hz). This is episode 1's voice. The narrator has
no figure.

---

### Source notes (Critical Edition, BORI, Adi Parva)

- **Adhyaya 1** (episode 1): Ugrashravas, son of Lomaharshana, comes to Shaunaka's twelve-year
  sacrifice in the Naimisha forest. He heard the story at Janamejaya's sacrifice, as Vaishampayana told it
  from Vyasa.
- **Adhyaya 2, vv. 1–9** (episode 2): the sages ask about Samantapanchaka. Sauti tells them:
  - Between the Treta and Dvapara ages, Rama (Parashurama), best of weapon-bearers, struck down the
    kshatriyas again and again, driven by anger.
  - He made five lakes of blood at Samantapanchaka and offered libations of it to his ancestors.
  - His ancestors (Richika and the others) came, offered him a boon, and asked him to stop. He asked
    that the lakes become holy places, and they granted it.
  - The land around those lakes is Samantapanchaka, where the war between the Kauravas and the Pandavas
    was later fought (at the junction of the Kali and Dvapara ages).
  - The verse itself says "again and again" (asakṛt). "Twenty-one times" (triḥ-sapta-kṛtvaḥ) is the
    count the epic gives elsewhere (for example in the Adi Parva's account of the kshatriyas' rebirth),
    and it is the traditional figure.
- **Adhyaya 2, the akshauhini** (episode 3): asked what an akshauhini is, Sauti defines it. A patti is
  1 chariot, 1 elephant, 3 horses and 5 foot soldiers. Each of the next seven units (senamukha, gulma,
  gana, vahini, pritana, chamu, anikini) is three times the one before, and ten anikinis make an
  akshauhini: 21,870 chariots, 21,870 elephants, 65,610 horses, 109,350 foot soldiers. Eighteen
  akshauhinis (eleven Kaurava, seven Pandava) met at Samantapanchaka and fought for eighteen days.
- **Episode 4**: Vyasa composed the epic and taught it to Vaishampayana, who recited it at
  Janamejaya's sacrifice (CE 1.1.52–1.1.57). The Ganesha-as-scribe episode is later tradition (the
  vulgate's Adi Parva 1, relegated to the apparatus of the Critical Edition); it is marked on screen
  "As tradition tells it".
- **Adhyaya 3, the Paushya parva** (episodes 5–6): Janamejaya, son of Parikshit, with his brothers
  Shrutasena, Ugrasena and Bhimasena, sits at a long sacrifice at Kurukshetra. A dog, the son of Sarama,
  comes near; the brothers beat him. He runs crying to his mother; he had done nothing wrong (neither
  looked at nor licked the offerings). Sarama comes to the sacrifice and tells the king that, since her
  son was beaten without fault, an unseen danger will fall upon him. Alarmed, Janamejaya returns to
  Hastinapura and searches for a priest to undo the curse (he will find Somashravas). Later in the same
  adhyaya: Uttanka, disciple of Veda, asks his teacher's wife what gift to bring; she asks for the
  earrings of King Paushya's queen. The queen gives them and warns him that Takshaka, king of the
  serpents, covets them. On the way back Uttanka sets them down to wash; a naked beggar (a kshapanaka,
  shown here as a beggar in a loincloth) snatches them; caught, he takes his own form as Takshaka and
  goes down a hole in the earth to the Naga world. Uttanka follows; with a divine horse that breathes
  fire and smoke through the Naga world he forces Takshaka to give them back (shown as fire and smoke
  pouring in), and brings them to his teacher's wife in time. Still angry, he goes to Janamejaya at
  Hastinapura and urges him to avenge his father Parikshit, whom Takshaka killed, with a sacrifice of
  serpents. (The king's formal vow of the sarpa-satra is told later, in the Astika parva; episode 6
  compresses it into his answer, as the owner's approved script does.)
- **Astika parva, adhyayas 36–40** (episode 7): Parikshit, hunting, pierces a deer, loses it, and asks the
  sage Shamika (keeping a vow of silence among the cows) where it went; met with silence, he lifts a dead
  snake on the tip of his bow and lays it on the sage's shoulder. Shamika's son Shringin, hearing of it,
  touches water and curses the king: within seven nights Takshaka will burn him with his venom. Shamika
  rebukes his son and sends his disciple to warn the king, who stays in a palace raised on a single pillar,
  guarded, with physicians, herbs and mantra-knowing brahmins. On the seventh day nagas come disguised as
  ascetics bearing fruit; in one fruit is a tiny copper-coloured insect with black eyes; it becomes Takshaka,
  who coils round the king and burns him with his venom. (The healer Kashyapa, turned back on the road by
  Takshaka, is held for episode 37.) The episode's cliffhanger, "His son would answer with fire", is the
  owner's line.
- **Adhyayas 47–48** (episode 8): Janamejaya, told by his ministers how his father died, vows the
  sarpa-satra; as the ground is measured a builder (sthapati, sutradhara) foretells that a brahmin will be
  the cause of its not being completed, and the king orders that no stranger be let in. The priests, in
  black garments, eyes red with smoke, pour the oblations and call the serpents by name; serpents of every
  kind fall into the fire. Takshaka flees to Indra, who promises to protect him. (Indra's line, "Stay with
  me, Takshaka. You are safe.", condenses his promise.)
- **Adhyaya 14** (episodes 9–10; told after Parikshit and the sacrifice, see `SERIES.md`, arc A02):
  Kashyapa grants boons to his wives, Daksha's daughters Kadru and Vinata: Kadru asks for a thousand serpent
  sons of equal splendour, Vinata for two sons surpassing Kadru's in strength and glory. He bids them bear
  the embryos with care and goes to the forest. The eggs are kept in moist (steaming) vessels for five
  hundred years; Kadru's thousand hatch, Vinata's two do not. Ashamed, Vinata breaks one: inside is a son
  whose upper body is formed and lower body is not. Angry, he curses her to be her rival's slave for five
  hundred years, unless the son in the other egg, if she does not break it too, frees her. He rises into the
  sky and becomes the charioteer of the Sun: Aruna, the red of dawn. (The cliffhangers follow
  `catalog/series.json`.)
