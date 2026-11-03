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

### Locations and light

Characters keep their signature light everywhere; the **environment and its key light change per
location**. The Naimisha clearing (`KIT.ashram`) is night and firelight: the frame every episode
returns to. Vyasa's hermitage (`src/scenes/ep04/_common.js`, `EP4.hermitage`) is the Himalayan
foothills at morning: snow peaks, misty valleys, deodars, a thatched hut and a stream, a low sun on
the left (`EP4.sunLight` points each character's rim toward it, with a little front light).

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
