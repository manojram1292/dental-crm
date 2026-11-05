# Series Bible · Mahabharatam — As Vyasa Told It

This is the plan for the whole series: what it is, how every episode is built, how faithful it is and how that is marked, the eighteen seasons with their arcs and episode counts, the playlist taxonomy, and the title and description templates. The machine-readable version is [`catalog/series.json`](catalog/series.json) (how to use it: [`catalog/README.md`](catalog/README.md)); `node tools/catalog.mjs` validates it and prints the numbers quoted here. The look and the voices are fixed in [`CHARACTERS.md`](CHARACTERS.md); the production pipeline is in [`README.md`](README.md).

**At a glance:** 18 seasons (one per parva) · 124 arcs · **1,200 episodes** (main narrative 700, side tales 298, wisdom 202) · Season 1 is planned episode by episode (161 episodes); Seasons 2–18 are planned arc by arc. Episodes 1–30 are released (11–20 use the cold-open grammar, 21–30 the tightened grammar of the independent review; see README.md and REVIEW_LOG.md), with an introduction (episode 0, a draft for the owner).

## Contents

1. [Vision](#1-vision) · 2. [Format](#2-format) · 3. [Who tells the story](#3-who-tells-the-story) · 4. [Fidelity rules](#4-fidelity-rules) · 5. [Voice and style](#5-voice-and-style) · 6. [Structure and numbering](#6-structure-and-numbering) · 7. [Release cadence](#7-release-cadence) · 8. [Long-form compilations](#8-long-form-compilations) · 9. [The eighteen seasons](#9-the-eighteen-seasons) · 10. [Tags and playlists](#10-tags-and-playlists) · 11. [Naming and SEO templates](#11-naming-and-seo-templates) · 12. [Pace and scope: honest notes](#12-pace-and-scope-honest-notes) · 13. [Open questions and flagged uncertainties](#13-open-questions-and-flagged-uncertainties)

## 1. Vision

The whole Mahabharata, in order, in about a minute at a time, told the way the epic tells itself: a bard by a fire in the Naimisha forest, repeating what he heard at a king's snake sacrifice, which a disciple of Vyasa recited there. Not a summary and not a "best of": every major episode, the great embedded tales, and the teachings, in short pieces that each stand on their own and together add up to the epic.

- **Faithful first.** The text is the BORI Critical Edition. When we include a beloved later tale we say so on screen; when we move something for continuity we say so in the notes.
- **One question, one answer.** Every Short opens on a question and ends on the next one. A viewer who lands on episode 412 can follow it; a viewer who starts at episode 1 is pulled through.
- **A temple mural come alive.** Flat painted shapes, plaster texture, shadow-puppet silhouettes, fire as the light (see `CHARACTERS.md`). Gods and sages are drawn with reverence; violence is shown as mural and silhouette, never gore.
- **Made from code, dubbed by design.** Every frame and sound is generated; every word lives in `script/epNN.<lang>.json`, so a new language is a translation and a voice track, not a re-edit.

## 2. Format

| | |
|---|---|
| Platforms | YouTube Shorts and Instagram Reels (the same master); YouTube long-form for arc compilations |
| Frame | 1080×1920, 30 fps, captions inside the Shorts safe zone |
| Length | **50–58 s** per episode (episodes 1–6 run 44.8–56.4 s; new episodes aim for 50–58 s, never over 60) |
| Words | ≈ 90–120 spoken words; one line per scene; names introduced once, with an on-screen name card |
| Structure | **RECAP → HOOK → STORY → NEXT**, built with `KIT.series` (`src/kit/series.js`) |

**The four beats** (timings for a 55 s episode):

1. **RECAP** (3–4 s, not in episode 1): one narrator line over the "Previously" strip, with the last episode's key image as a sepia memory in a temple niche.
2. **HOOK** (4–6 s): one clear question (`role: "hook"`), then the title lockup. Sauti and the sages by the fire are the anchor: every episode opens or returns there at least once, even in Season 12.
3. **STORY** (35–42 s): a complete mini-arc with its own turn. If the episode needs more than one turn, it is two episodes.
4. **NEXT** (5–7 s): the cliffhanger line (the catalog's `cliffhanger` field), then "Next: <title>" over the teaser card with a glimpse of the next episode's key image.

The cliffhanger of episode N and the hook of episode N+1 are written together: the cliffhanger asks, the next hook restates, the next story answers. When an episode closes an arc, its NEXT teases the next arc (the arc's first title) and the end card can point to the long-form compilation.

## 3. Who tells the story

The Mahabharata is a story inside a story inside a story, and the series keeps every frame visible. The narrator (am_michael) carries the voice-over; the framing tellers appear and speak at their own levels.

| Level | Teller → listener | Where | Seasons |
|---|---|---|---|
| Outer frame | **Sauti** (Ugrashravas) → **Shaunaka** and the sages | Naimisha forest, by the fire | all; he opens Season 1 and closes Season 18 |
| Inner frame | **Vaishampayana** → King **Janamejaya** (at the snake sacrifice, Vyasa present) | the sacrifice enclosure | from S01E047 to the end |
| The war | **Sanjaya** → the blind king **Dhritarashtra** (with the divine sight Vyasa gave him) | Hastinapura | Seasons 6–10 |
| Embedded tales | a character → a listener: Brihadashva → Yudhishthira (Nala), Markandeya → Yudhishthira (Rama, Savitri), the Gandharva → Arjuna (Tapati, Vasishtha), Narada → the Pandavas (Sunda and Upasunda), Shalya → Yudhishthira (Nahusha), … | wherever the listener is | side layer |
| Teachings | Krishna → Arjuna (Gita, Anugita), Vidura → Dhritarashtra, Bhishma → Yudhishthira, the Yaksha → Yudhishthira | as in the text | wisdom layer |

Rule: each embedded tale opens with a 1–2 s "frame stamp" (who is telling it, to whom), and the first and last episode of a side arc return to the listener.

## 4. Fidelity rules

1. **Text.** The BORI Critical Edition (CE) is the reference for what happens, in what order, and who says it. Names follow its readings (e.g. Drona's fee, Karna's two curses, the svayamvara target).
2. **"As tradition tells it."** When a beloved tale is a later or vulgate addition (Ganesha as scribe, Krishna answering Draupadi's prayer in the dice hall, Durvasa and the last leaf, …), we include it if it serves the story and **mark it on screen** with `KIT.series.traditionTag` ("As tradition tells it") and in the catalog with `tradition_note: true` (plus the theme `tradition-tales`). Material from other works (Kalidasa's ring in Shakuntala, the Puranic name "Mohini") is either left out or labelled as such.
3. **Reordering.** When we move material for dramatic continuity (Parikshit's death before Kadru and Vinata; the Pauloma tales after Astika; Bhishma's days told in order rather than as Sanjaya's flashback), the episode or arc carries a `reorder_note` saying what moved and from where. The description says so in one line.
4. **References.** Every episode carries CE refs (parva and adhyaya range). `approx: true` means the range is from memory or spans a condensed passage and **must be checked against the CE before it is printed on screen**. Arc refs for Seasons 2–18 are all approximate at this stage.
5. **Numbers and claims.** Numbers come from the text (21,870 chariots, eighteen days, a thousand years) and are attributed to it ("the epic says"). We never claim historicity, dates, archaeology or "science in the Mahabharata".
6. **Condensing is allowed, inventing is not.** We compress dialogue and merge minor beats; we do not add events, motives or speeches the text does not have. Invented connective lines are allowed only in the narrator's voice and only as transitions ("Meanwhile…").
7. **Uncertainty is flagged.** When we are unsure whether a detail is in the CE, the catalog says UNCERTAIN in `notes` and the detail is not shown until checked. See §13.
8. **Spelling.** Simplified transliteration without diacritics, consistent across scripts, captions and catalog: *sh* for ś/ṣ, *ch* for c, long vowels unmarked (Shaunaka, Vaishampayana, Duhshasana, Kurukshetra). Pronunciation lives in `tools/voice.py` (`NAMES`).

## 5. Voice and style

The characters' looks, palettes, signature lights, poses and voices are fixed in **[`CHARACTERS.md`](CHARACTERS.md)** and `script/cast.json`; this bible does not repeat them. New characters get a bible entry and a module before their first episode. Writing rules:

- Plain, modern, unhurried English; short sentences; no slang, no archaic "thee/thou". Characters speak in short, quotable lines.
- One idea per line; one line per picture. The picture carries what the words do not have to say.
- The hook is a question a newcomer would ask ("Why did a dog curse a king?"), not a teaser of jargon.
- Gods and sages are spoken of with respect; no jokes at the expense of anyone's faith. Villains are given their reasons.
- Women of the epic speak in their own voices where the text gives them words (Shakuntala, Draupadi, Gandhari, Kunti, Savitri, Damayanti).
- Sanskrit terms only when they carry meaning (dharma, akshauhini, svayamvara), each explained the first time it appears in a season.
- Narration is synthetic (Kokoro-82M) and every description says so (§11).

## 6. Structure and numbering

- **Season = Parva** (18 seasons). Season 1 is the Adi Parva, Season 18 the Svargarohana.
- **Arc** = a CE upa-parva or a sub-story inside one, split or merged into a complete, watchable story of **5–20 episodes**. The CE's upa-parvas are the backbone (the Parvasamgraha, Adi 2, lists a hundred; the CE's own division names a few fewer).
- **Episode** = one Short. Id `S01E007` (season, episode within the season); every episode also has a **global number** `n` (1…1200), contiguous across seasons. The on-screen label is "Episode n" (the global number), as in episodes 1–6.
- **Layer**: `main` (the narrative, including the Naimisha and Janamejaya frame), `side` (embedded tales), `wisdom` (teachings). Arcs in Seasons 2–18 that mix layers carry a `layers` split (e.g. the Yaksha arc: 3 main, 5 wisdom).
- **Status**: `released`, `in_production`, `planned`.

## 7. Release cadence

A suggestion, not a commitment (see §12 for what it implies):

- **Release by arc.** An arc goes out only when all its episodes are rendered, so viewers never hit a gap mid-story. Within an arc, one Short a day at a fixed time.
- **Weekly rhythm.** At five Shorts a week, the plan takes ≈ 4.6 years; at seven a week, ≈ 3.3 years. Season 1 alone is ≈ 32 weeks at five a week.
- **Arc breaks.** The week after an arc ends: its long-form compilation (§8) and, optionally, a "where we are" Short (not numbered) that recaps the story so far.
- **Season breaks.** One to two weeks off between seasons with the season trailer; new languages are released by arc, behind English.

## 8. Long-form compilations

Every completed arc also becomes a **5–10 minute long-form video** (catalog: `compilation` on each arc, id `S01A04-LF`):

- Built from the arc's episodes: the first episode's hook and title stay; inside the film the RECAP strips and NEXT cards between episodes are cut, with short cross-fades and the score carried across; the last episode's NEXT card stays as the outro.
- Horizontal 16:9 master: the 9:16 picture is centred on the mural ground extended to the full width (the same plaster and border), captions moved to the lower third. No new animation is required.
- Title "<Arc> · The Complete Story | Mahabharatam"; chapters in the description, one per episode; refs and tradition notes collected from the episodes.
- Arcs longer than ≈ 11 episodes may exceed 10 minutes; split them in two parts ("Part 1/2") at the arc's natural turn rather than cutting episodes.
- Released only when the arc is complete; the compilation goes into the arc's playlist and the `longform` playlist.

## 9. The eighteen seasons

| # | Parva | Season title | Arcs | Episodes | Main | Side | Wisdom | Global numbers |
|---|---|---|---|---|---|---|---|---|
| 1 | Adi Parva | The Beginning | 20 | 161 | 104 | 54 | 3 | 1–161 |
| 2 | Sabha Parva | The Hall and the Dice | 8 | 75 | 67 | 3 | 5 | 162–236 |
| 3 | Aranyaka (Vana) Parva | The Forest Years | 27 | 219 | 73 | 110 | 36 | 237–455 |
| 4 | Virata Parva | In Disguise | 4 | 43 | 41 | 0 | 2 | 456–498 |
| 5 | Udyoga Parva | The Road to War | 11 | 116 | 62 | 36 | 18 | 499–614 |
| 6 | Bhishma Parva | The Song and the Fall | 8 | 121 | 65 | 2 | 54 | 615–735 |
| 7 | Drona Parva | The Teacher's War | 9 | 100 | 95 | 5 | 0 | 736–835 |
| 8 | Karna Parva | Karna | 5 | 47 | 40 | 2 | 5 | 836–882 |
| 9 | Shalya Parva | The Last Day | 4 | 45 | 31 | 14 | 0 | 883–927 |
| 10 | Sauptika Parva | The Night Raid | 3 | 21 | 21 | 0 | 0 | 928–948 |
| 11 | Stri Parva | The Women's Lament | 2 | 16 | 13 | 0 | 3 | 949–964 |
| 12 | Shanti Parva | The Bed of Arrows | 9 | 96 | 18 | 30 | 48 | 965–1060 |
| 13 | Anushasana Parva | The Last Teachings | 4 | 50 | 6 | 26 | 18 | 1061–1110 |
| 14 | Ashvamedhika Parva | The Horse Sacrifice | 5 | 42 | 16 | 16 | 10 | 1111–1152 |
| 15 | Ashramavasika Parva | The Forest Hermitage | 2 | 18 | 18 | 0 | 0 | 1153–1170 |
| 16 | Mausala Parva | The Iron Club | 1 | 13 | 13 | 0 | 0 | 1171–1183 |
| 17 | Mahaprasthanika Parva | The Great Journey | 1 | 7 | 7 | 0 | 0 | 1184–1190 |
| 18 | Svargarohana Parva | The Ascent | 1 | 10 | 10 | 0 | 0 | 1191–1200 |
| | **Total** | | **124** | **1200** | **700** | **298** | **202** | |

Target agreed with the owner: ≈ 1,200 episodes (main ≈ 700, side ≈ 300, wisdom ≈ 200). Counts per arc are estimates and will move as scripts are written; `node tools/catalog.mjs` always prints the current totals.

### Season 1 · Adi Parva: The Beginning

The frame and the foundations. Sauti brings the epic to the sages of Naimisha; a dog's curse and a student's grudge lead King Janamejaya to a sacrifice that would burn every serpent, and the story of why the serpents were doomed (Kadru, Vinata, Garuda, the churning of the ocean) is told before the sage-boy Astika stops it. Then Vaishampayana begins the story proper: the Kuru line from Shakuntala and Yayati to Shantanu, Bhishma's vow, the births of the Pandavas and Kauravas, the house of lac, Draupadi's svayamvara, Indraprastha and the burning of the Khandava forest.

*161 episodes (global 1–161) · CE: 225 adhyayas · upa-parvas: Anukramanika (1), Parvasamgraha (2), Paushya (3), Pauloma (4–12), Astika (13–53), Adivamshavatarana (54–58), Sambhava (59–123), Jatugrihadaha (124–138), Hidimbavadha (139–144), Bakavadha (145–152), Chaitraratha (153–173), Svayamvara (174–181), Vaivahika (182–191), Viduragamana (192–199), Rajyalabha (200–204), Arjunavanavasa (205–210), Subhadraharana (211–212), Haranaharika (213), Khandavadaha (214–225).*
*Note: CE adhyaya ranges for the Adi Parva upa-parvas are from memory of the CE's division and may be off by one or two at the boundaries (notably Sambhava/Jatugrihadaha around 1.123–124); verify against the BORI volumes before printing them on screen.*

**Introduces:** Sauti, Shaunaka, Vyasa, Vaishampayana, Janamejaya, Takshaka, Garuda, Astika, Shantanu, Ganga, Bhishma, Satyavati, Dhritarashtra, Pandu, Vidura, Gandhari, Kunti, Karna, Yudhishthira, Bhima, Arjuna, Nakula, Sahadeva, Duryodhana, Shakuni, Drona, Ashvatthama, Drupada, Draupadi, Krishna, Balarama, Subhadra.

| Arc | Title | Layer | Eps | Global | CE refs | Story |
|---|---|---|---|---|---|---|
| A01 | **The Storyteller and the Curse** | main | 6 | 1–6 | 1.1–3 | Sauti arrives at Naimisha and names the battlefield and the armies; Vyasa composes the epic; then the first threads of the frame: Sarama's curse on Janamejaya and Uttanka's quarrel with Takshaka, which ends in the king's vow. |
| A02 | **The Serpents' Doom** | main | 5 | 7–11 | 1.14–15, 1.36–40 (approx.), 1.47–48 (approx.) | How Takshaka killed Parikshit, how Janamejaya's sacrifice began, and the first answer to "why?": two sisters, one husband, and a curse that one mother laid on her own children. *Reorder:* The CE tells the Astika parva as Sauti answers Shaunaka: Jaratkaru first (1.13), then Kadru and Vinata (1.14–30), then the serpents' council (1.31–35), and Parikshit's death only at 1.36–40. We open with Parikshit and the sacrifice (the consequences) and then go back to the causes, so the frame stays in one line of suspense. |
| A03 | **The Churning of the Ocean** | side | 5 | 12–16 | 1.15–17 (approx.) | The story within the story: gods and asuras churn the ocean with Mount Mandara and the serpent Vasuki; the moon, Shri, the white horse and the amrita rise; the poison is held; Narayana takes the amrita from the asuras in the form of an enchanting woman; Rahu is beheaded; and the war over the amrita is won. |
| A04 | **Garuda** | side | 14 | 17–30 | 1.18–30 (approx.) | Kadru wins the wager by cheating and curses the serpents who refuse to help her; Vinata becomes a slave; her second son Garuda hatches blazing like fire, and to free his mother he storms heaven, takes the amrita, wins Vishnu's friendship and Indra's, and leaves the serpents with forked tongues. |
| A05 | **Astika** | main | 10 | 31–40 | 1.13, 1.32–35 (approx.), 1.41–46 (approx.), 1.49–53 (approx.) | The serpents try to escape their mother's curse: Shesha leaves to hold up the earth, Vasuki holds council and learns of a boy who will save them. The ascetic Jaratkaru marries Vasuki's sister for his ancestors' sake, and their son Astika walks into Janamejaya's sacrifice and stops it. *Reorder:* The Jaratkaru story is told twice in the CE (briefly at 1.13, in full at 1.41–44); we tell it once, in full. The Parikshit material at 1.36–40 was used in episode 7; the CE's account of how Janamejaya learned the truth (1.45–46) closes the flashback here. |
| A06 | **Tales of the Bhrigus** | side | 6 | 41–46 | 1.4–12 (approx.) | Shaunaka, a descendant of Bhrigu, hears his own family's stories: Bhrigu's wife Puloma and the demon, the child Chyavana who burned him, Agni cursed to eat everything, and Ruru, who gave half his life for his bride and hated snakes until a snake taught him mercy. *Reorder:* In the CE the Pauloma parva (1.4–12) comes BEFORE the Astika parva. We move it after Astika, as a fireside interlude at Naimisha before Vaishampayana begins: its last tale, Ruru and the serpents, closes the serpent theme ("a man who hated snakes learns mercy") instead of interrupting it. An alternative is to air it as a standalone side arc between episodes 6 and 7. |
| A07 | **Vyasa Begins** | main | 6 | 47–52 | 1.54–55, 1.57–58, 1.61 | Vyasa comes to Janamejaya's sacrifice and has Vaishampayana tell the story. A one-breath summary of the whole epic; the origin of Satyavati and of Vyasa himself; and why gods and demons were born as men. |
| A08 | **Shakuntala** | side | 6 | 53–58 | 1.62–69 | King Dushyanta meets Shakuntala, the daughter of Vishvamitra and Menaka, in Kanva's hermitage, marries her in secret, and later denies her at court; her great speech and a voice from the sky make him acknowledge their son Bharata, from whom the Bharatas take their name. *Tradition:* The cursed ring, the sage Durvasa and the forgetting are from Kalidasa's play (Abhijnanashakuntalam), not the epic. In the Mahabharata Dushyanta remembers her perfectly and denies her for fear of what people will say. We tell the epic's version and say so on screen in episode 57. |
| A09 | **Yayati** | side | 12 | 59–70 | 1.71–88 (approx.) | Kacha learns the secret of reviving the dead from the asuras' guru Shukra and refuses Shukra's daughter Devayani; Devayani and the asura princess Sharmishtha quarrel; King Yayati marries one and secretly loves the other, is cursed with old age, borrows his youngest son Puru's youth, learns that desire is never satisfied, falls from heaven and is raised again by his grandsons. |
| A10 | **Ganga's Sons** | main | 8 | 71–78 | 1.89–94 (approx.) | The Puru line down to Shantanu. A king cursed for staring at Ganga, eight gods cursed for stealing a cow, a river goddess who drowns her sons, and the eighth son, Devavrata, who gives up the throne and marriage for his father's happiness and becomes Bhishma. |
| A11 | **The Empty Throne** | main | 8 | 79–86 | 1.95–103 | Shantanu's sons by Satyavati die young and childless; Bhishma takes the three princesses of Kashi and lets Amba go; Satyavati calls her first son Vyasa, who fathers Dhritarashtra, Pandu and Vidura; Vidura's birth is explained by a sage wrongly impaled. |
| A12 | **Sons of the Gods** | main | 11 | 87–97 | 1.104–119 (approx.) | Kunti's mantra and Karna's secret birth; Pandu's marriages, his curse and retreat to the forest; the births of the five Pandavas by gods and of Gandhari's hundred sons from a lump of flesh; Pandu's death and the return to Hastinapura. |
| A13 | **The Princes' School** | main | 10 | 98–107 | 1.119–128 (approx.) | Duryodhana poisons Bhima, who returns stronger from the Naga world; the teachers Kripa and Drona arrive, Drona carrying a grudge against Drupada; Ekalavya's thumb, the bird's eye, the tournament where Karna challenges Arjuna and is crowned king of Anga, and Drona's fee. |
| A14 | **The House of Lac** | main | 6 | 108–113 | 1.129–138 (approx.) | Yudhishthira is made heir; Duryodhana persuades his father to send the Pandavas to Varanavata, where a house of lac is built to burn them; Vidura's coded warning, a secret tunnel and a night of fire. *Tradition:* The "Kanika-niti" (the minister Kanika's counsel of ruthless statecraft to Dhritarashtra), familiar from the vulgate, is believed to be outside the CE's constituted text; if used later as a wisdom piece it should be marked "As tradition tells it". |
| A15 | **Hidimba and Baka** | main | 8 | 114–121 | 1.139–152 (approx.) | In the forest, Bhima kills the rakshasa Hidimba and marries his sister Hidimbi, who bears Ghatotkacha; Vyasa sends the Pandavas, disguised as brahmins, to Ekachakra, where Bhima kills the man-eater Baka for their host's family. |
| A16 | **The Gandharva's Tales** | main | 11 | 122–132 | 1.153–174 (approx.) | The Pandavas hear how Draupadi and Dhrishtadyumna were born from Drupada's fire and why Draupadi will have five husbands; on the way to Panchala Arjuna defeats the Gandharva Angaraparna, who tells them stories of the sages of old: Tapati and Samvarana, Vasishtha and Vishvamitra, Kalmashapada, Parashara and Aurva. |
| A17 | **Draupadi's Svayamvara** | main | 9 | 133–141 | 1.175–191 (approx.) | Arjuna, disguised as a brahmin, strings the great bow and hits the target to win Draupadi; the kings attack; Kunti's unthinking "share it equally" leads to Draupadi marrying all five brothers, which Vyasa justifies with the tale of the five Indras. Krishna meets the Pandavas for the first time. *Tradition:* Two famous details are not in the CE text: the target as a revolving fish seen in a reflection (later retellings; the CE has a target behind an opening in a device), and Draupadi's public refusal of Karna as a charioteer's son (vulgate). The episodes mark them "As tradition tells it" if they are shown at all. |
| A18 | **Indraprastha** | main | 5 | 142–146 | 1.192–204 (approx.) | Hastinapura learns the Pandavas are alive; Duryodhana and Karna argue for treachery or war, Bhishma, Drona and Vidura for sharing the kingdom; the Pandavas return and are given the wilderness of Khandavaprastha, where they build Indraprastha. Narada warns them, with the tale of Sunda and Upasunda, not to quarrel over Draupadi. |
| A19 | **Arjuna's Exile and Subhadra** | main | 8 | 147–154 | 1.205–213 | Arjuna breaks the rule to save a brahmin's cows and goes into exile: the Naga princess Ulupi, Chitrangada of Manipura, five cursed apsaras freed, and Krishna at Prabhasa; at Dvaraka he carries off Krishna's sister Subhadra with Krishna's blessing. Abhimanyu and Draupadi's sons are born. |
| A20 | **The Burning of Khandava** | main | 7 | 155–161 | 1.214–225 (approx.) | Agni, sick and hungry, asks Krishna and Arjuna to let him consume the Khandava forest, which Indra protects for Takshaka; he arms them with the Gandiva bow and the Sudarshana discus. They hold off Indra and every creature while the forest burns. Only Takshaka's son, the asura Maya and four young birds escape. Season finale. *Tradition:* The story of why Agni was sick (King Shvetaki's twelve-year sacrifice of ghee) is believed to be in the CE apparatus rather than its text; if told, mark it "As tradition tells it". |

**Season 1, episode by episode** (titles; synopses, refs, characters and cliffhangers are in the catalog). ✅ released · 🎬 in production · ⚑ marked "As tradition tells it" · ↻ reordered (see the episode's `reorder_note`).

- **The Storyteller and the Curse** (main): 1. The Storyteller Arrives ✅ · 2. The Field of Five Lakes ✅ · 3. Eighteen Armies ✅ · 4. The Story Is Born ✅ ⚑ · 5. The Curse of Sarama ✅ · 6. The Stolen Earrings ✅ ↻
- **The Serpents' Doom** (main): 7. The Seven-Day Curse 🎬 · 8. The Snake Sacrifice 🎬 · 9. Two Wives, Two Wishes · 10. The Broken Egg · 11. The Horse from the Ocean *(side)*
- **The Churning of the Ocean** (side): 12. A Mountain for a Churning Stick · 13. What Rose from the Ocean · 14. The Blue Throat · 15. The Enchantress and Rahu · 16. The War for the Amrita
- **Garuda** (side): 17. The Wager · 18. The Black Hairs · 19. Garuda Is Born · 20. Carrying the Serpents · 21. The Price of Freedom · 22. The Brahmin in the Throat · 23. The Elephant and the Tortoise · 24. The Thumb-Sized Sages · 25. Why Indra Feared a Bird · 26. Garuda Storms Heaven · 27. The Wheel of Blades · 28. A Boon from Vishnu · 29. The Feather and the Thunderbolt · 30. Forked Tongues
- **Astika** (main): 31. Shesha Holds the Earth · 32. Vasuki's Council · 33. The Ancestors in the Pit · 34. The Bride with His Name · 35. The Sunset Prayer · 36. The Boy Called Astika · 37. The Witness in the Tree ↻ · 38. Astika at the Gate · 39. Indra Lets Go · 40. The Sacrifice Stops
- **Tales of the Bhrigus** (side): 41. The Bride and the Demon · 42. The Child Who Fell · 43. The Curse on Fire · 44. Ruru and Pramadvara · 45. Half a Life · 46. The Snake Who Was a Sage
- **Vyasa Begins** (main): 47. Vyasa Comes to the Sacrifice · 48. The Whole Story in One Breath · 49. The King, the Fish and the Ferry Girl · 50. Born on an Island · 51. The Burden of the Earth · 52. Gods in Disguise ↻
- **Shakuntala** (side): 53. The King and the Hermitage · 54. The Girl the Birds Protected · 55. A Marriage Without Witnesses · 56. The Boy Who Tamed Lions · 57. "I Do Not Know You" · 58. The Voice from the Sky ↻
- **Yayati** (side): 59. The Secret of Reviving the Dead · 60. Kacha Dies Three Times · 61. The Curse at Parting · 62. The Princess in the Well · 63. A Princess Becomes a Servant · 64. The Hand He Held · 65. Sharmishtha's Secret · 66. The Curse of Old Age · 67. The Son Who Gave His Youth · 68. Desire Is Never Satisfied *(wisdom)* · 69. The Fall from Heaven *(wisdom)* · 70. The Grandsons' Gift *(wisdom)*
- **Ganga's Sons** (main): 71. From Puru to Kuru · 72. The King Who Stared · 73. The Stolen Cow ↻ · 74. The Promise on the Riverbank · 75. Seven Sons in the River · 76. The Boy Who Stopped the Ganga · 77. The Fisherman's Condition · 78. The Terrible Vow
- **The Empty Throne** (main): 79. The Gandharva's Challenge · 80. Three Princesses of Kashi · 81. A Vow Against a Kingdom · 82. The Blind Sage's Sons *(side)* · 83. The Son from the Island · 84. Eyes Closed, Face Pale · 85. The Sage on the Stake *(side)* · 86. A Blindfold for Life
- **Sons of the Gods** (main): 87. The Mantra of Durvasa · 88. The Child in the Basket · 89. Kunti and Madri · 90. A Hundred Jars ↻ · 91. The Deer Who Cursed a King · 92. The King Becomes a Hermit · 93. Kunti's Answer · 94. Sons of the Gods · 95. Madri's Twins · 96. Spring in the Forest · 97. The Return to Hastinapura
- **The Princes' School** (main): 98. Bhima and the Poisoned Sweets · 99. Born from Reeds · 100. Drona and the Friend Who Forgot · 101. The Ball in the Well · 102. Ekalavya's Thumb · 103. The Bird's Eye · 104. The Tournament · 105. The Stranger in Armour · 106. Son of a Charioteer · 107. The Teacher's Fee
- **The House of Lac** (main): 108. The Heir and the Jealous Cousin · 109. A House Built to Burn · 110. Vidura's Riddle · 111. The Tunnel · 112. The Night of Fire · 113. Into the Dark Forest
- **Hidimba and Baka** (main): 114. The Rakshasa's Sister · 115. Bhima and Hidimba · 116. Ghatotkacha · 117. Vyasa's Counsel · 118. The Weeping House · 119. Kunti's Offer · 120. The Cart of Food · 121. The Town Set Free
- **The Gandharva's Tales** (main): 122. Born from the Fire · 123. Five Times "Husband" · 124. Arjuna and the Gandharva · 125. The Sun's Daughter *(side)* · 126. The Sage Who Asked the Sun *(side)* · 127. The Cow Vishvamitra Wanted *(side)* · 128. The King Who Became a Rakshasa *(side)* · 129. The Sage Who Could Not Die *(side)* · 130. Aurva's Fire *(side)* · 131. The Sacrifice of Rakshasas *(side)* · 132. A Priest for the Pandavas
- **Draupadi's Svayamvara** (main): 133. The Target in the Sky · 134. The Brahmin Who Strung the Bow · 135. The Kings Attack · 136. "Share It Equally" · 137. Krishna Meets the Pandavas · 138. The Spy in the Potter's House · 139. One Bride, Five Husbands? · 140. The Five Indras · 141. The Wedding
- **Indraprastha** (main): 142. "What Good Fortune!" · 143. The Council of Elders · 144. Half a Kingdom of Forest · 145. Narada's Warning *(side)* · 146. Tilottama *(side)*
- **Arjuna's Exile and Subhadra** (main): 147. The Broken Rule · 148. Ulupi · 149. Chitrangada of Manipura · 150. The Crocodile Maidens *(side)* · 151. Krishna at Prabhasa · 152. The Festival on Raivataka · 153. Subhadra Carried Off · 154. Gifts and Sons
- **The Burning of Khandava** (main): 155. A Brahmin by the Yamuna · 156. Gandiva · 157. The Forest Burns · 158. Arjuna Against Indra · 159. Maya Is Spared · 160. The Four Fledglings *(side)* · 161. Indra's Promise

Where the Pauloma tales fit: in the CE they come before the Astika parva (1.4–12). We place them as the side arc *Tales of the Bhrigus* (episodes 41–46), after Astika stops the sacrifice and before Vyasa has Vaishampayana begin: Ruru's lesson from a snake closes the serpent story. If an earlier slot is wanted, the arc can air as a standalone between episodes 6 and 7 without breaking any cliffhanger except episode 6's.

### Season 2 · Sabha Parva: The Hall and the Dice

Maya builds the Pandavas a marvellous hall; Yudhishthira performs the royal consecration after Jarasandha is killed and the four brothers conquer the four directions; Krishna kills Shishupala. Humiliated in the hall, Duryodhana has Shakuni win everything from Yudhishthira at dice, including Draupadi, who is dragged into the assembly. A second game sends the Pandavas into thirteen years of exile.

*75 episodes (global 162–236) · CE: 72 adhyayas · upa-parvas: Sabhakriya, Lokapalasabhakhyana, Rajasuyarambha, Jarasandhavadha, Digvijaya, Rajasuyika, Arghabhiharana, Shishupalavadha, Dyuta, Anudyuta.*

**Introduces:** Jarasandha, Shishupala, Duhshasana.

| Arc | Title | Layer | Eps | Global | CE refs | Story |
|---|---|---|---|---|---|---|
| A01 | **The Hall of Maya** | main 4 / side 3 | 7 | 162–168 | 2.1–11 (approx.) | Maya repays his debt with a hall of illusions for Yudhishthira, and fetches Bhima's mace and Arjuna's conch Devadatta from Lake Bindusaras. Narada visits and describes the halls of Indra, Yama, Varuna, Kubera and Brahma, and brings a message from Pandu in Yama's hall: perform the Rajasuya. *Reorder:* Narada's questions to the king (2.5) come between the hall and his description of the gods' halls (2.6–11); we tell the halls with the hall and give the questions their own arc after it. |
| A02 | **Narada's Questions** | wisdom | 5 | 169–173 | 2.5 | Narada visits the new hall and questions Yudhishthira on every duty of a king ("Do you…?"): the kaccit chapter, a complete handbook of governance in questions. |
| A03 | **Jarasandha** | main | 13 | 174–186 | 2.12–22 (approx.) | Krishna explains that Jarasandha of Magadha, who holds eighty-six kings captive for sacrifice, must fall first; the story of his birth in two halves joined by the rakshasi Jara; Krishna, Bhima and Arjuna enter Girivraja disguised as snataka brahmins; Bhima wrestles Jarasandha for thirteen days and tears him in two. Embedded: The birth of Jarasandha (Jara joins the two halves). |
| A04 | **Conquering the Four Directions** | main | 7 | 187–193 | 2.23–29 (approx.) | Arjuna goes north, Bhima east, Sahadeva south and Nakula west, gathering tribute for the Rajasuya; set pieces include Arjuna among the northern peoples and Sahadeva's embassy as far as Lanka. |
| A05 | **The Royal Consecration and Shishupala** | main | 10 | 194–203 | 2.30–42 (approx.) | The Rajasuya; Bhishma proposes that the first honour go to Krishna; Shishupala of Chedi insults Krishna, Bhishma and the assembly; Bhishma tells of Shishupala's birth and the promise to forgive a hundred offences; Krishna's discus ends it. |
| A06 | **Duryodhana in the Hall** | main | 7 | 204–210 | 2.43–49 (approx.) | Duryodhana stays on in the hall, mistakes crystal for water and water for crystal, and is laughed at; his envy at the Pandavas' wealth; Shakuni proposes the game of dice and they persuade Dhritarashtra over Vidura's warnings. *Tradition:* Draupadi's taunt "the blind man's son is blind" is not in the CE text; it is a later addition. The CE has Bhima, Arjuna, the twins and attendants laughing. |
| A07 | **The Game of Dice** | main | 20 | 211–230 | 2.50–65 (approx.) | Vidura brings the invitation; Yudhishthira cannot refuse a challenge; Shakuni plays for Duryodhana and wins the treasury, the kingdom, the brothers, Yudhishthira himself and Draupadi. Duhshasana drags Draupadi into the assembly; her question (did he lose himself before he staked me?) goes unanswered by the elders; Vikarna alone speaks; Karna calls her a whore; as Duhshasana pulls at her garment, garment after garment appears; Bhima's vows; jackals howl and Dhritarashtra grants Draupadi boons that free her husbands. *Tradition:* In the CE the endless garment appears without any prayer to Krishna; Draupadi's invocation of Krishna (and Krishna's role) is a vulgate addition. Shown, it carries "As tradition tells it". |
| A08 | **The Second Game** | main | 6 | 231–236 | 2.66–72 (approx.) | Duryodhana persuades his father to recall the Pandavas for one more throw: the loser goes to the forest for twelve years and a thirteenth in hiding. They lose. The Pandavas leave, each in his own manner, and Draupadi with her hair unbound; Vidura reads the omens; Kunti stays with Vidura. |

### Season 3 · Aranyaka (Vana) Parva: The Forest Years

Twelve years in the forest, the richest season for stories. Arjuna wins the Pashupata from Shiva and weapons in Indra's heaven; the brothers make a pilgrimage across India while sages tell them tales (Nala and Damayanti, Agastya, the descent of the Ganga, Rishyashringa, Savitri, Rama). Bhima meets Hanuman; Jayadratha abducts Draupadi; Indra takes Karna's armour; the Yaksha questions Yudhishthira.

*219 episodes (global 237–455) · CE: 299 adhyayas · upa-parvas: Aranyaka, Kirmiravadha, Kairata (Arjunabhigamana), Indralokabhigamana (incl. Nalopakhyana), Tirthayatra, Jatasuravadha, Yakshayuddha, Ajagara, Markandeyasamasya, Draupadi-Satyabhama-samvada, Ghoshayatra, Mrigasvapnodbhava, Vrihidraunika, Draupadiharana (incl. Ramopakhyana, Pativratamahatmya), Kundalaharana, Araneya.*
*Note: The CE's grouping of the Aranyaka sub-parvas differs from the vulgate (e.g. Nala inside Indralokabhigamana, Rama and Savitri inside Draupadiharana); adhyaya ranges here are approximate.*

**Introduces:** Nala, Damayanti, Agastya, Hanuman, Markandeya, Jayadratha, Savitri.

| Arc | Title | Layer | Eps | Global | CE refs | Story |
|---|---|---|---|---|---|---|
| A01 | **Into the Forest** | main | 9 | 237–245 | 3.1–12 (approx.) | The citizens follow the Pandavas; Yudhishthira praises the Sun and receives a vessel that feeds all their guests; Vidura, banished for his counsel, joins them and is recalled; Vyasa and Maitreya warn Dhritarashtra, and Maitreya curses Duryodhana to have his thigh broken. On the way to the Kamyaka forest, the rakshasa Kirmira, Baka's brother, bars the path; Bhima kills him. |
| A02 | **Krishna in the Forest and the Fall of Saubha** | main 2 / side 4 | 6 | 246–251 | 3.13–23 (approx.) | Krishna visits and Draupadi pours out her grief and anger; Krishna explains he was away fighting Shalva and his flying city Saubha, and tells that war. Embedded: Shalva and the flying city of Saubha. |
| A03 | **Anger and Forgiveness** | wisdom | 6 | 252–257 | 3.26–37 (approx.) | The great forest debates: Draupadi and Bhima argue that a king must act and fight; Yudhishthira defends forbearance and keeping his word. Bali and Prahlada on forgiveness; fate against human effort. Vyasa teaches Yudhishthira the Pratismriti spell for Arjuna. |
| A04 | **The Hunter and the Bow** | main | 8 | 258–265 | 3.38–41 (approx.) | Arjuna goes alone to the Himalaya to win divine weapons; Indra in disguise tests him; after fierce austerities he fights a mountain hunter over a boar, cannot defeat him, and recognises Shiva, who gives him the Pashupata; the world-guardians give their weapons. |
| A05 | **Arjuna in Indra's Heaven** | main | 6 | 266–271 | 3.42–49 (approx.) | Matali's chariot carries Arjuna to Amaravati; he learns weapons and music and dance from the Gandharva Chitrasena; Lomasha brings news of him to the brothers. *Tradition:* Urvashi's curse on Arjuna (a year as a eunuch, used in Virata) is believed to be outside the CE's constituted text; marked "As tradition tells it" if told. |
| A06 | **Nala and Damayanti** | side | 20 | 272–291 | 3.50–78 | Told by the sage Brihadashva to a grieving Yudhishthira: the swan messenger; Damayanti chooses Nala over four gods at her svayamvara; Kali possesses Nala, who loses everything at dice and abandons her in the forest; the serpent Karkotaka's bite disguises him as a charioteer; Damayanti's search and second svayamvara; the knowledge of dice and horses exchanged with King Rituparna; recognition and restoration. |
| A07 | **The Pilgrimage Begins** | main | 5 | 292–296 | 3.79–95 (approx.) | Narada and Pulastya describe the holy places; the sage Lomasha arrives from heaven and leads the brothers on a pilgrimage across India. |
| A08 | **Agastya** | side | 7 | 297–303 | 3.94–104 (approx.) | Tales told along the way: Agastya and Lopamudra; the demons Vatapi and Ilvala (Agastya digests Vatapi); Agastya stops the Vindhya mountain from growing and drinks the ocean so the gods can kill the Kalakeyas hiding in it. |
| A09 | **The Descent of the Ganga** | side | 6 | 304–309 | 3.104–109 (approx.) | King Sagara's sixty thousand sons dig up the earth looking for the sacrificial horse and are burned by Kapila's gaze; generations later Bhagiratha's austerities bring the Ganga down from heaven, and Shiva bears her fall on his head. |
| A10 | **Rishyashringa** | side | 5 | 310–314 | 3.110–113 | The deer-horned boy raised in the forest who has never seen a woman; a courtesan is sent to lure him to drought-struck Anga, and the rain follows him. |
| A11 | **Parashurama's Story** | side | 6 | 315–320 | 3.115–117 | The birth of Parashurama; his father Jamadagni orders him to kill his mother Renuka and he obeys, then asks for her life back; King Kartavirya steals Jamadagni's calf, Parashurama kills him, Kartavirya's sons kill Jamadagni, and Parashurama rids the earth of kshatriyas twenty-one times. *Reorder:* Completes the story begun in episode 2 (the five lakes). |
| A12 | **Kings and Sages of Old** | side | 10 | 321–330 | 3.121–131 (approx.) | Princess Sukanya pokes the eyes of the old sage Chyavana, buried in an anthill, and marries him in atonement; the Ashvins make him young and he wins them a share of the soma, paralysing Indra's arm. Mandhata, born from his father's side; Somaka and his one son Jantu; Shibi, who gives his own flesh to save a dove from a hawk (Indra and Agni testing him). |
| A13 | **Ashtavakra and Yavakri** | side | 7 | 331–337 | 3.132–139 | The boy cursed in the womb by his father to be bent in eight places defeats the court debater Bandin at King Janaka's court and frees his drowned father. Yavakri wins the Vedas by austerity instead of study, insults Raibhya, and dies by the demon Raibhya creates; Paravasu kills his father by mistake. |
| A14 | **The Flower and the Monkey** | main 8 / wisdom 3 | 11 | 338–348 | 3.140–157 (approx.) | Into the high Himalaya; Draupadi wants the saugandhika flower; Bhima's path is blocked by an old monkey who is his brother Hanuman, son of Vayu, who shows his giant form and teaches him the ages and the duties; Bhima fights the Yakshas at Kubera's lake; the rakshasa Jatasura carries off Yudhishthira, the twins and Draupadi and is killed. |
| A15 | **Arjuna Returns** | main | 7 | 349–355 | 3.158–172 (approx.) | The brothers reach Mount Gandhamadana; Arjuna returns in Indra's chariot and tells of destroying the Nivatakavachas under the sea and the flying city of the Paulomas and Kalakeyas. |
| A16 | **The Python** | wisdom | 5 | 356–360 | 3.173–178 | A huge python seizes Bhima. It is King Nahusha, cursed by Agastya; Yudhishthira answers his questions on who is a brahmin, truth and conduct, and frees both. |
| A17 | **Markandeya: the End of the World** | wisdom | 6 | 361–366 | 3.183–189 (approx.) | The ageless sage Markandeya tells of the ages and the dissolution: alone in the cosmic flood he finds a child on a banyan branch and enters his body to see all the worlds within. Also: Vaivasvata Manu and the fish that grows. Embedded: Manu and the fish. |
| A18 | **Markandeya's Kings** | side | 7 | 367–373 | 3.188–195 (approx.) | More of Markandeya's stories: King Parikshit of Ayodhya and the frog princess; Vamadeva's horses; Indradyumna, fallen from heaven because no one remembered him, and the creatures old enough to remember; Dhundhumara, the king who killed the demon Dhundhu under the sands. *Reorder:* These tales are scattered through Markandeya's discourse (3.188–195); gathered into one side arc. |
| A19 | **The Faithful Wife and the Butcher** | wisdom | 8 | 374–381 | 3.196–224 (approx.) | The proud ascetic Kaushika burns a crane with a look and is put in his place by a housewife, who sends him to a butcher in Mithila; the dharmavyadha teaches him that duty done well is holiness. Satyabhama asks Draupadi how she keeps five husbands devoted; Draupadi's answer. *Reorder:* Draupadi and Satyabhama (3.222–224) follows Skanda (3.213–221) in the CE; we group it with the other dialogue on a householder's dharma. |
| A20 | **The Birth of Skanda** | side | 6 | 382–387 | 3.207–221 (approx.) | The birth of Skanda, the war-god, from Agni and Svaha, who took the forms of the sages' wives (the epic also calls him Rudra's son); the Krittikas; his consecration as general of the gods. |
| A21 | **The Cattle Expedition** | main | 10 | 388–397 | 3.225–243 (approx.) | Duryodhana goes to gloat over the exiles under cover of counting cattle; the Gandharvas capture him; Arjuna and Bhima free him at Yudhishthira's order; humiliated, Duryodhana resolves to fast to death and is roused by the danavas; Karna conquers the world for him and he performs the Vaishnava sacrifice. |
| A22 | **Durvasa and Mudgala** | side 2 / wisdom 3 | 5 | 398–402 | 3.244–247 | Duryodhana sends the irascible Durvasa and his ten thousand disciples to the Pandavas after their meal; Krishna eats the last leaf in Draupadi's pot and the sages feel full (as tradition tells it). A deer's dream moves the brothers to another forest; Vyasa tells of the sage Mudgala, who lives on a measure of gleaned grain, feeds Durvasa without anger, and declines heaven when he learns its limits. *Tradition:* The Durvasa visit and Krishna eating the last leaf are a vulgate episode outside the CE's constituted text; marked "As tradition tells it". |
| A23 | **Draupadi Abducted** | main | 8 | 403–410 | 3.248–256 | Jayadratha of Sindhu, Duryodhana's brother-in-law, finds Draupadi alone and carries her off; the Pandavas pursue, Bhima shaves his head into five tufts, and Yudhishthira spares him for Duhshala's sake. Jayadratha wins a boon from Shiva: to hold back four Pandavas for a day. |
| A24 | **The Story of Rama** | side | 20 | 411–430 | 3.257–276 | Markandeya consoles Yudhishthira with the story of Rama: Ravana's origin, Rama's exile, Sita's abduction, Hanuman, the bridge, the war, the fire ordeal, the return. The epic's own short Ramayana. |
| A25 | **Savitri** | side | 10 | 431–440 | 3.277–283 | Princess Savitri chooses Satyavan, who is fated to die within a year; on the day, she follows Yama as he carries Satyavan's life away, and with her wisdom wins boons until he must give it back. |
| A26 | **Karna's Armour** | main | 7 | 441–447 | 3.284–294 | Surya warns Karna in a dream that Indra will come begging for his armour and earrings; Karna will not refuse a request; he cuts them from his body and receives Indra's spear, good for one kill. Kunti's story of his birth is told again. |
| A27 | **The Yaksha's Questions** | main 3 / wisdom 5 | 8 | 448–455 | 3.295–299 | A brahmin's fire-sticks are carried off by a deer; chasing it, the brothers find a lake guarded by a voice; four drink without answering and fall dead; Yudhishthira answers the Yaksha's riddles ("what is the greatest wonder?"), chooses Nakula's life, and the Yaksha reveals himself as Dharma. The thirteenth year begins. |

### Season 4 · Virata Parva: In Disguise

The thirteenth year, in hiding at King Virata's court in Matsya: Yudhishthira as a dice-playing courtier, Bhima as a cook, Arjuna as the dance teacher Brihannala, the twins as horse- and cowherd, Draupadi as a maid. Bhima kills Kichaka; the Kauravas raid Matsya's cattle, and Arjuna, with Prince Uttara as charioteer, routs them all.

*43 episodes (global 456–498) · CE: 67 adhyayas · upa-parvas: Vairata, Kichakavadha, Goharana, Vaivahika.*

**Introduces:** Virata, Kichaka, Uttara, Uttaraa.

| Arc | Title | Layer | Eps | Global | CE refs | Story |
|---|---|---|---|---|---|---|
| A01 | **Into Disguise** | main 5 / wisdom 2 | 7 | 456–462 | 4.1–12 (approx.) | Choosing disguises; Dhaumya's counsel on serving a king; the weapons hidden in a shami tree; arriving at Virata's court; Bhima wrestles for the king. |
| A02 | **Kichaka** | main | 11 | 463–473 | 4.13–23 (approx.) | The queen's brother, Kichaka, the army commander, lusts after the maid Sairandhri (Draupadi) and kicks her in front of the king; Bhima, waiting in the dark dance hall where Kichaka expects Sairandhri, crushes him to a ball; Kichaka's brothers are killed too. |
| A03 | **The Cattle Raid** | main | 19 | 474–492 | 4.24–62 (approx.) | Trigartas and Kauravas raid Matsya's cattle; Prince Uttara boasts, panics and flees; Brihannala reveals himself as Arjuna, takes the Gandiva from the shami tree and defeats Karna, Drona, Kripa, Ashvatthama, Bhishma and Duryodhana, stunning them all with a weapon and taking their clothes. Was the year over? Bhishma's reckoning. |
| A04 | **Revealed** | main | 6 | 493–498 | 4.63–67 | Virata strikes Yudhishthira with a die for praising Brihannala over Uttara; the Pandavas reveal themselves; Arjuna declines Princess Uttaraa as his own bride and accepts her for his son Abhimanyu. |

### Season 5 · Udyoga Parva: The Road to War

The effort for peace and the preparations for war. Arjuna chooses Krishna, Duryodhana his army; embassies go back and forth; Vidura counsels the sleepless king; Krishna himself goes to Hastinapura and shows his cosmic form; Kunti and Krishna each tell Karna the truth of his birth. Bhishma tells why he will not fight Shikhandin: the story of Amba.

*116 episodes (global 499–614) · CE: 197 adhyayas · upa-parvas: Udyoga, Sanjayayana, Prajagara, Sanatsujata, Yanasandhi, Bhagavadyana, Sainyaniryana, Ulukadutagamana, Rathatirathasamkhya, Ambopakhyana.*

**Introduces:** Sanjaya, Shikhandin, Satyaki.

| Arc | Title | Layer | Eps | Global | CE refs | Story |
|---|---|---|---|---|---|---|
| A01 | **Choosing Sides** | main | 9 | 499–507 | 5.1–8 (approx.) | At Virata's court the allies plan; Arjuna and Duryodhana come to Krishna at the same time: one may have Krishna unarmed, the other his army, and Arjuna chooses Krishna. Shalya, the twins' uncle, is tricked by Duryodhana's hospitality into fighting for the Kauravas, and promises Yudhishthira to undermine Karna. |
| A02 | **Indra, Vritra and Nahusha** | side | 8 | 508–515 | 5.9–18 (approx.) | Shalya consoles Yudhishthira with Indra's own fall: Indra kills Trishiras and Vritra and must hide; Nahusha becomes Indra and lusts after Shachi; the sages carry his palanquin until Agastya curses him to become a serpent. |
| A03 | **Sanjaya's Embassy** | main | 7 | 516–522 | 5.19–32 (approx.) | Drupada's priest goes to Hastinapura; Sanjaya comes to the Pandavas with soft words and no offer; Yudhishthira asks only five villages. |
| A04 | **Vidura's Counsel** | wisdom | 10 | 523–532 | 5.33–41 | The sleepless king calls Vidura in the night: Vidura's great teaching on the wise and the foolish, kingship, speech, anger and greed (Vidura Niti). |
| A05 | **The Eternal Youth** | wisdom | 5 | 533–537 | 5.42–45 | The ancient sage Sanatsujata teaches Dhritarashtra about death, which is heedlessness, and about Brahman (the Sanatsujatiya). |
| A06 | **The Councils** | main | 8 | 538–545 | 5.46–69 (approx.) | Sanjaya reports in the Kuru assembly; Bhishma, Drona and Dhritarashtra warn Duryodhana, who boasts; Karna and Bhishma quarrel; Sanjaya describes Krishna's greatness. |
| A07 | **Krishna's Peace Mission** | main | 18 | 546–563 | 5.70–129 (approx.) | Krishna goes to Hastinapura as envoy; he stays with Vidura; Draupadi shows him her unbound hair; in the assembly sages and elders plead, Duryodhana refuses even a needle's point of land and plans to seize Krishna, who shows his universal form and walks out. |
| A08 | **Tales Told in the Assembly** | side | 14 | 564–577 | 5.94–123 (approx.) | Stories told to soften Duryodhana: Dambhodbhava, the king who challenged Nara and Narayana; Matali, Indra's charioteer, searching the worlds for a husband for his daughter; Galava, who must find eight hundred white horses with one black ear for his teacher's fee, and Yayati's daughter Madhavi, given to four kings in turn. *Reorder:* These tales sit inside the peace mission; we gather them into one side arc after it. |
| A09 | **Kunti's Message and Karna's Choice** | wisdom 3 / main 8 | 11 | 578–588 | 5.131–146 (approx.) | Kunti's message to her sons: the story of Vidula, the queen who roused her defeated son to fight. Krishna tells Karna he is Kunti's firstborn and offers him the kingdom and Draupadi; Karna refuses for Duryodhana's sake and Radha's; Kunti comes to him at the river; he promises to spare four of her sons: she will always have five. |
| A10 | **The Armies March** | main | 12 | 589–600 | 5.147–169 (approx.) | The Pandavas choose Dhrishtadyumna as commander and the Kauravas Bhishma; Balarama goes on pilgrimage rather than fight; Rukmi is refused; Uluka carries Duryodhana's taunts; Bhishma counts the great chariot-warriors and slights Karna, who vows not to fight while Bhishma lives. |
| A11 | **Amba** | side | 14 | 601–614 | 5.170–197 (approx.) | Bhishma explains why he will not fight Shikhandin: Amba, rejected by Shalva, sought revenge; Parashurama fought Bhishma for her for twenty-three days and could not win; she burned herself to be reborn as Drupada's child, Shikhandin, who exchanged sex with a Yaksha. *Reorder:* Completes Amba's story begun in Season 1 (Three Princesses of Kashi). |

### Season 6 · Bhishma Parva: The Song and the Fall

Vyasa gives Sanjaya divine sight to report the war. On the first day Arjuna's despair draws out the Bhagavad Gita. Ten days of battle under Bhishma, until Bhishma tells the Pandavas how he can be defeated and falls on a bed of arrows behind Shikhandin.

*121 episodes (global 615–735) · CE: 117 adhyayas · upa-parvas: Jambukhandavinirmana, Bhumi, Bhagavadgita, Bhishmavadha.*
*Reordering: In the CE Sanjaya returns to Dhritarashtra after Bhishma's fall on the tenth day (6.14) and narrates days 1–10, including the Gita, as a flashback. We tell the days in order, with Sanjaya's report as the frame; season opener notes this.*

**Introduces:** Iravat, Bhagadatta.

| Arc | Title | Layer | Eps | Global | CE refs | Story |
|---|---|---|---|---|---|---|
| A01 | **Before the Battle** | main 5 / side 2 | 7 | 615–621 | 6.1–13 (approx.) | The rules of war agreed; Vyasa offers Dhritarashtra sight and gives Sanjaya divine vision instead; omens; Sanjaya describes the earth and its continents (summarised). |
| A02 | **The Bhagavad Gita I: Despair and the Self (chapters 1–6)** | wisdom | 18 | 622–639 | 6.23–28 | Arjuna sees his kin and teachers and lays down his bow; Krishna teaches the undying self, action without attachment to its fruits, knowledge, renunciation and meditation. Three Shorts per chapter. |
| A03 | **The Bhagavad Gita II: The Vision (chapters 7–12)** | wisdom | 18 | 640–657 | 6.29–34 | Knowledge and realisation, the imperishable, the royal secret, the divine glories, the universal form that Arjuna begs to see and fears, and devotion. |
| A04 | **The Bhagavad Gita III: The Field and the Choice (chapters 13–18)** | wisdom | 18 | 658–675 | 6.35–40 | The field and its knower, the three gunas, the cosmic tree, the divine and demonic natures, the three kinds of faith, and liberation: "Do as you choose." Arjuna takes up his bow. |
| A05 | **Days One to Three** | main | 16 | 676–691 | 6.41–55 (approx.) | Yudhishthira walks unarmed to the enemy to ask his elders' blessing; the first clash and Uttara's brother Shveta killed; Bhishma's mastery; on the third day Krishna, angered by Arjuna's mildness, leaps down with his discus to kill Bhishma (the chariot wheel is a later retelling's image), and Arjuna holds him back. |
| A06 | **Days Four to Six** | main | 15 | 692–706 | 6.56–77 (approx.) | Bhima's rampage among Dhritarashtra's sons; Ghatotkacha; the formations (makara, krauncha, shyena); Duryodhana's complaints to Bhishma. |
| A07 | **Days Seven to Nine** | main | 16 | 707–722 | 6.78–103 (approx.) | Iravat, Arjuna's son by Ulupi, is killed; Bhima kills more of the Kauravas; on the ninth day Krishna again rises against Bhishma; that night the Pandavas go to Bhishma's tent and he tells them how he may be brought down. |
| A08 | **The Fall of Bhishma** | main | 13 | 723–735 | 6.104–117 | The tenth day: Arjuna shoots from behind Shikhandin; Bhishma, pierced all over, falls and lies on a bed of arrows, waiting for the sun's northern course; Arjuna gives him a pillow of arrows and draws water from the earth; Karna comes to him at night. |

### Season 7 · Drona Parva: The Teacher's War

Drona commands the Kauravas for five days. Abhimanyu breaks into the wheel formation and is killed; Arjuna vows to kill Jayadratha by sunset or burn himself; Karna spends Indra's spear on Ghatotkacha; Drona lays down his arms when told "Ashvatthama is dead", and Ashvatthama unleashes the Narayana weapon.

*100 episodes (global 736–835) · CE: 173 adhyayas · upa-parvas: Dronabhisheka, Samshaptakavadha, Abhimanyuvadha, Pratijna, Jayadrathavadha, Ghatotkachavadha, Dronavadha, Narayanastramoksha.*

**Introduces:** Bhurishravas, Satyaki.

| Arc | Title | Layer | Eps | Global | CE refs | Story |
|---|---|---|---|---|---|---|
| A01 | **Drona Takes Command** | main | 9 | 736–744 | 7.1–15 (approx.) | Karna enters the battle; Drona is made commander and promises to capture Yudhishthira alive if Arjuna can be drawn away. |
| A02 | **The Oath-Bound and Bhagadatta** | main | 10 | 745–754 | 7.16–31 (approx.) | The Samshaptakas swear to kill Arjuna or die and lure him away; the old king Bhagadatta on his elephant Supratika and the Vaishnava weapon Krishna takes on his own chest. |
| A03 | **Abhimanyu** | main 12 / side 5 | 17 | 755–771 | 7.32–55 (approx.) | With Arjuna away, the sixteen-year-old Abhimanyu breaks into Drona's wheel formation; Jayadratha, using Shiva's boon, holds the other Pandavas at the gap; Abhimanyu fights six great warriors at once and is killed fighting with a chariot wheel. Vyasa consoles Yudhishthira with the story of the goddess of Death, who wept at her task, and Narada's tale of the sixteen great kings who died (the Shodasharajika). |
| A04 | **Arjuna's Vow** | main | 6 | 772–777 | 7.56–60 (approx.) | Arjuna learns how his son died and vows to kill Jayadratha before sunset or enter the fire; Jayadratha wants to flee and is kept with promises of protection; Krishna and Arjuna's night journey, in a dream, to Shiva to renew the Pashupata; Subhadra's grief. |
| A05 | **Satyaki and Bhima Break Through** | main | 10 | 778–787 | 7.61–115 (approx.) | The fourteenth day: Arjuna cuts through Drona's formations toward Jayadratha; his horses tire and Krishna waters them on the battlefield; Yudhishthira sends Satyaki and then Bhima after him; Bhima spares Karna's life and Karna spares Bhima's; Bhurishravas is about to kill Satyaki when Arjuna cuts off his arm, and Satyaki beheads him at prayer. |
| A06 | **Jayadratha** | main | 12 | 788–799 | 7.116–121 (approx.) | The race against the sun: six great warriors guard Jayadratha; as the sun sinks Arjuna reaches him, and his arrow carries Jayadratha's head into the lap of his father Vriddhakshatra, whose own curse then strikes him. *Tradition:* UNCERTAIN: Krishna darkening the sun (with his discus, in popular retellings) so that Jayadratha shows himself. Check the CE text before showing it; if it is not in the constituted text, mark it "As tradition tells it". |
| A07 | **The Night Battle and Ghatotkacha** | main | 14 | 800–813 | 7.122–154 (approx.) | The war goes on into the night by torchlight; Ghatotkacha's illusions terrify the Kauravas until Karna must spend Indra's spear, saved for Arjuna, to kill him; Krishna rejoices. |
| A08 | **Ashvatthama Is Dead** | main | 13 | 814–826 | 7.155–165 (approx.) | Drona is unstoppable; Krishna has Bhima kill an elephant named Ashvatthama; Yudhishthira, who never lies, says "Ashvatthama is dead" and mutters "the elephant"; his chariot touches the ground; Drona lays down his weapons and Dhrishtadyumna beheads him. |
| A09 | **The Narayana Weapon** | main | 9 | 827–835 | 7.166–173 | Ashvatthama, in grief and rage, looses the Narayana weapon; Krishna tells everyone to drop their arms and bow; Bhima resists and has to be dragged down. Vyasa tells Arjuna of the figure he saw going before him in battle: Shiva. |

### Season 8 · Karna Parva: Karna

Karna commands for two days, with Shalya as his reluctant charioteer. Bhima drinks Duhshasana's blood; Yudhishthira insults Arjuna and Arjuna nearly kills him; and Karna, his chariot wheel stuck in the earth and his weapons forgotten, is killed by Arjuna.

*47 episodes (global 836–882) · CE: 69 adhyayas · upa-parvas: Karna.*

| Arc | Title | Layer | Eps | Global | CE refs | Story |
|---|---|---|---|---|---|---|
| A01 | **Karna Commands** | main 7 / side 2 | 9 | 836–844 | 8.1–28 (approx.) | Karna is made commander; he asks for Shalya as charioteer; Shalya agrees only on condition he may speak as he likes, and mocks him; Karna boasts and curses. Shalya taunts Karna with the fable of a crow, fattened on leftovers, who challenged the swans to a flight over the ocean. |
| A02 | **The Sixteenth Day and the Seventeenth Morning** | main | 12 | 845–856 | 8.29–48 (approx.) | Karna defeats Yudhishthira, Bhima, Nakula and Sahadeva and spares them as he promised Kunti; Ashvatthama and Arjuna duel. |
| A03 | **Arjuna's Dilemma** | main 2 / wisdom 5 | 7 | 857–863 | 8.46–50 (approx.) | Wounded, Yudhishthira insults Arjuna's Gandiva; Arjuna has vowed to kill anyone who does; Krishna teaches the subtlety of truth with the hunter Balaka and the ascetic Kaushika, and Arjuna "kills" his brother with harsh words, then himself with self-praise. |
| A04 | **Duhshasana's Blood** | main | 5 | 864–868 | 8.60–61 (approx.) | Bhima kills Duhshasana and drinks his blood, fulfilling the vow from the dice hall. |
| A05 | **Karna and Arjuna** | main | 14 | 869–882 | 8.62–69 (approx.) | The great duel; the serpent Ashvasena in Karna's arrow, which Krishna dodges by pressing the chariot into the earth; the earth swallows Karna's wheel and he forgets the Brahmastra (Parashurama's and a brahmin's curses); he asks for fair play; Krishna reminds him of Draupadi and Abhimanyu; Arjuna's arrow. *Reorder:* The full stories of Karna's curses (Parashurama and the stinging insect; the brahmin's cow) are told by Narada in the Shanti Parva (12.1–5); we preview them here and tell them in Season 12. |

### Season 9 · Shalya Parva: The Last Day

The eighteenth day: Shalya commands and is killed by Yudhishthira; Sahadeva kills Shakuni; Duryodhana hides in a lake. Balarama, back from pilgrimage (whose tirthas are told as side tales), watches Bhima break Duryodhana's thigh with a foul blow.

*45 episodes (global 883–927) · CE: 64 adhyayas · upa-parvas: Shalyavadha, Hradapravesha, Gadayuddha (with Balarama's Tirthayatra).*

| Arc | Title | Layer | Eps | Global | CE refs | Story |
|---|---|---|---|---|---|---|
| A01 | **Shalya Commands** | main | 9 | 883–891 | 9.1–16 (approx.) | Kripa urges peace; Shalya is made commander; Yudhishthira, the mildest of men, kills him with a spear. |
| A02 | **Shakuni's End and the Lake** | main | 10 | 892–901 | 9.17–34 (approx.) | Sahadeva kills Shakuni, who began the dice; the Kaurava army is gone; Sanjaya is captured and spared. Duryodhana hides under the waters of a lake; hunters betray him; Yudhishthira offers him one duel with any of them, with any weapon, for the kingdom. |
| A03 | **Balarama's Pilgrimage** | side | 14 | 902–915 | 9.34–53 (approx.) | Balarama arrives from his pilgrimage on the Sarasvati, and the tirthas are told: the Moon's curse and his twenty-seven wives, Trita in the well, Vasishtha and Vishvamitra at the river, the old maiden who married for one night, Kurukshetra ploughed by Kuru. |
| A04 | **The Mace Duel** | main | 12 | 916–927 | 9.54–64 | Bhima and Duryodhana fight with maces; Krishna reminds Arjuna of Bhima's vow, Arjuna slaps his thigh, and Bhima breaks Duryodhana's thighs; Balarama, outraged, threatens Bhima; Duryodhana, dying, accuses Krishna; flowers fall on him; Ashvatthama is made commander of three. |

### Season 10 · Sauptika Parva: The Night Raid

Ashvatthama, Kripa and Kritavarman attack the sleeping Pandava camp: Dhrishtadyumna, Shikhandin and Draupadi's sons are killed. The Pandavas pursue Ashvatthama; his Brahmashira and Arjuna's meet, he turns his against the wombs of the Pandava women, and Krishna curses him.

*21 episodes (global 928–948) · CE: 18 adhyayas · upa-parvas: Sauptika, Aishika.*

| Arc | Title | Layer | Eps | Global | CE refs | Story |
|---|---|---|---|---|---|---|
| A01 | **The Owl and the Crows** | main | 5 | 928–932 | 10.1–5 (approx.) | Ashvatthama watches an owl kill sleeping crows and decides; Kripa argues against it; Shiva, in a terrible form, guards the gate and then gives himself to Ashvatthama. |
| A02 | **The Massacre** | main | 8 | 933–940 | 10.6–9 (approx.) | The night slaughter; Dhrishtadyumna kicked to death; the sons of Draupadi and Shikhandin killed; the three tell the dying Duryodhana, who dies content. |
| A03 | **The Jewel on His Brow** | main | 8 | 941–948 | 10.10–18 | Draupadi demands Ashvatthama's life; the pursuit; Ashvatthama's grass-blade Brahmashira and Arjuna's; Vyasa and Narada stand between them; Ashvatthama turns his weapon on the unborn, Krishna promises to revive Uttaraa's child and curses Ashvatthama to wander for three thousand years; Draupadi receives his jewel. |

### Season 11 · Stri Parva: The Women's Lament

Grief after the war. Vidura consoles Dhritarashtra; the blind king crushes an iron Bhima; Gandhari's gaze burns Yudhishthira's toenail; on the battlefield Gandhari laments the dead and curses Krishna and his clan; the funeral rites, and Kunti's revelation that Karna was her son.

*16 episodes (global 949–964) · CE: 27 adhyayas · upa-parvas: Jalapradanika, Strivilapa, Shraddha.*

| Arc | Title | Layer | Eps | Global | CE refs | Story |
|---|---|---|---|---|---|---|
| A01 | **The Man in the Well and the Iron Bhima** | wisdom 3 / main 4 | 7 | 949–955 | 11.1–15 (approx.) | Vidura consoles Dhritarashtra with the parable of a man hanging in a well over a serpent, licking honey while mice gnaw the root: the human condition. The Pandavas meet the old king; Krishna substitutes an iron statue, which Dhritarashtra crushes in his embrace; Gandhari, about to curse, is calmed by Vyasa. |
| A02 | **Gandhari's Curse** | main | 9 | 956–964 | 11.16–27 | Given sight to see the field, Gandhari walks among the dead and weeping widows, and curses Krishna: in thirty-six years his own clan will destroy itself and he will die alone in the forest. Krishna accepts. The cremations; at the river, Kunti tells her sons to offer water for Karna, her firstborn; Yudhishthira's grief. |

### Season 12 · Shanti Parva: The Bed of Arrows

Yudhishthira wants to renounce the throne; his brothers, Draupadi and the sages argue him into ruling; Narada tells Karna's story. Then, by Krishna's arrangement, Bhishma on his bed of arrows teaches the duties of kings, conduct in disaster, and the way to liberation: the largest wisdom season.

*96 episodes (global 965–1060) · CE: 353 adhyayas · upa-parvas: Rajadharma, Apaddharma, Mokshadharma.*

| Arc | Title | Layer | Eps | Global | CE refs | Story |
|---|---|---|---|---|---|---|
| A01 | **The King Who Would Not Rule** | main | 18 | 965–982 | 12.1–58 (approx.) | Narada tells Karna's life: Parashurama's curse when the insect bored his thigh and he did not move, the brahmin's curse over the cow, Indra's request. Yudhishthira wants to go to the forest; Arjuna, Bhima, the twins, Draupadi, Vyasa and Krishna argue; he curses women never to keep a secret, and is crowned in Hastinapura. Krishna, in meditation, thinks of Bhishma; Bhishma's hymn to Krishna; they go to Kurukshetra, Krishna restores Bhishma's strength, and the teaching begins. |
| A02 | **The Duties of Kings I: Why Kings Exist** | wisdom | 10 | 983–992 | 12.56–90 (approx.) | Rajadharma begins: the origin of kingship (a world without a king, and Prithu), the king's protection and danda, the four orders and stages of life, a king's daily conduct. |
| A03 | **The Duties of Kings II: War, Counsel and Mercy** | wisdom | 10 | 993–1002 | 12.91–128 (approx.) | Rajadharma continued: ministers and counsel, spies, treasury and taxes, alliances and war, the fortress, how a king treats the defeated. |
| A04 | **Bhishma's Fables** | side | 12 | 1003–1014 | 12.111–124 (approx.) | The animal fables Bhishma uses to teach a king: the tiger and the virtuous jackal; the camel whose neck grew too long; the ocean and the rivers (the reed bends, the tree breaks); the hermit's dog who became a sharabha; Indra and Prahlada, and good conduct leaving a king. *Reorder:* These fables sit inside the Rajadharma teaching (12.111–124); gathered into their own side arc after it. |
| A05 | **Fables for Hard Times** | side | 10 | 1015–1024 | 12.129–167 (approx.) | Apaddharma's stories: the cat and the mouse who trust each other for one night, the three fish, Vishvamitra stealing dog meat from an outcaste in a famine, the faithful dove couple and the fowler. |
| A06 | **Conduct in Disaster** | wisdom | 8 | 1025–1032 | 12.129–167 (approx.) | Apaddharma: what is right when the normal rules break down; the king in distress; danda and its mysterious nature. |
| A07 | **The Way to Freedom I: Detachment** | wisdom | 10 | 1033–1042 | 12.168–250 (approx.) | Mokshadharma: Janaka's "Mithila burns, nothing of mine burns", Manki and his oxen, the brahmin Pingala, Bhrigu and Bharadvaja on creation, Jajali and the merchant Tuladhara. |
| A08 | **The Way to Freedom II: Samkhya, Yoga and the Narayaniya** | wisdom | 10 | 1043–1052 | 12.251–353 (approx.) | Mokshadharma continued: Samkhya and Yoga, Vasishtha and Karala-Janaka, Yajnavalkya, and the Narayaniya: Narada's journey to the white island to see Narayana. |
| A09 | **Shuka** | side | 8 | 1053–1060 | 12.310–320 (approx.) | Vyasa's son Shuka, born from a fire-stick, learns from Janaka, renounces everything and rises into the sky; Vyasa's grief and the mountains' echo. |

### Season 13 · Anushasana Parva: The Last Teachings

Bhishma's teachings continue: on gifts, fasting, cows, the dead, and the thousand names of Vishnu, with many tales. At the sun's northward turn, Bhishma gives up his life.

*50 episodes (global 1061–1110) · CE: 154 adhyayas · upa-parvas: Danadharma, Bhishmasvargarohana.*

| Arc | Title | Layer | Eps | Global | CE refs | Story |
|---|---|---|---|---|---|---|
| A01 | **Tales of Gift and Fate** | side | 14 | 1061–1074 | 13.1–60 (approx.) | Gautami's son killed by a snake: the hunter, the snake, Death and Time argue who is to blame. Sudarshana who conquered death by hospitality, Vishvamitra's birth, the parrot that would not leave the dry tree, Bhangashvana who became a woman and preferred it, Ashtavakra and the North, Chyavana and Kushika. |
| A02 | **Devotion and Duty** | side | 12 | 1075–1086 | 13.14–70 (approx.) | More tales from the Anushasana: Upamanyu's devotion to Shiva (told by Krishna); Vipula, who guards his teacher's wife Ruchi from Indra by entering her body; Nahusha and the sage Chyavana caught in a fisherman's net; King Nriga, a lizard in a well because of a cow given twice, freed by Krishna. *Reorder:* Gathered from across the Danadharma (13.14–70); the wisdom passages around them are in the next arc. |
| A03 | **On Giving and the Thousand Names** | wisdom | 18 | 1087–1104 | 13.57–135 (approx.) | Danadharma: what to give, to whom and how; gifts of food, land, cows and lamps; fasts and pilgrimages; rites for ancestors; conduct and its fruits. Asked whom to worship, Bhishma recites the thousand names of Vishnu (Vishnu Sahasranama). |
| A04 | **Bhishma's Departure** | main | 6 | 1105–1110 | 13.153–154 | The sun turns north; Bhishma blesses the Pandavas and Krishna, takes leave and gives up his breath by yoga; the funeral; Ganga rises from the river to mourn her son. |

### Season 14 · Ashvamedhika Parva: The Horse Sacrifice

To atone, Yudhishthira performs the horse sacrifice with King Marutta's buried gold. Krishna gives Arjuna the Anugita, meets the sage Uttanka, and revives Uttaraa's stillborn son Parikshit. Arjuna follows the horse for a year and is killed and revived by his son Babhruvahana. A golden mongoose belittles the whole sacrifice.

*42 episodes (global 1111–1152) · CE: 96 adhyayas · upa-parvas: Ashvamedhika, Anugita.*

**Introduces:** Babhruvahana.

| Arc | Title | Layer | Eps | Global | CE refs | Story |
|---|---|---|---|---|---|---|
| A01 | **Marutta's Gold** | side | 6 | 1111–1116 | 14.1–10 (approx.) | Vyasa directs Yudhishthira to the gold left by King Marutta, whose priest Samvarta defied Brihaspati and Indra. |
| A02 | **The Anugita** | wisdom | 10 | 1117–1126 | 14.16–50 (approx.) | Arjuna has forgotten the Gita; Krishna teaches again through older dialogues (Kashyapa and the Siddha, the brahmin and his wife, the guru and the disciple). |
| A03 | **Uttanka and the Child Revived** | side 4 / main 4 | 8 | 1127–1134 | 14.52–70 (approx.) | On his way home Krishna meets the sage Uttanka, who threatens to curse him for not preventing the war; Krishna shows his form; Uttanka's boon of water in the desert, offered by Indra in an outcaste's form. (Uttanka's earrings quest is told again with differences.) Uttaraa's son is born dead from Ashvatthama's weapon; Kunti, Subhadra and Draupadi beg Krishna; he revives the child: Parikshit, the future father of Janamejaya. The frame closes a loop. *Reorder:* An echo of episode 6: the epic's second Uttanka has a different teacher (Gautama) and a different earrings story; flag the difference on screen. |
| A04 | **The Horse's Journey** | main | 12 | 1135–1146 | 14.71–88 (approx.) | Arjuna follows the horse for a year: the Trigartas, Bhagadatta's son, Jayadratha's grandson; at Manipura his son Babhruvahana, goaded by Ulupi, fights and kills him; Ulupi revives him with a Naga jewel. |
| A05 | **The Golden Mongoose** | side | 6 | 1147–1152 | 14.89–96 (approx.) | The horse sacrifice; a mongoose, half its body golden, rolls in the ground and says the sacrifice is worth less than one poor brahmin family's gift of their last barley flour to a guest. |

### Season 15 · Ashramavasika Parva: The Forest Hermitage

After fifteen years, Dhritarashtra, Gandhari, Kunti, Vidura and Sanjaya retire to the forest. Vidura dies into Yudhishthira; Vyasa calls up the dead from the Ganga for one night; Dhritarashtra, Gandhari and Kunti die in a forest fire.

*18 episodes (global 1153–1170) · CE: 47 adhyayas · upa-parvas: Ashramavasa, Putradarshana, Naradagamana.*

| Arc | Title | Layer | Eps | Global | CE refs | Story |
|---|---|---|---|---|---|---|
| A01 | **The Elders Leave** | main | 10 | 1153–1162 | 15.1–35 (approx.) | Bhima's barbs; Dhritarashtra asks leave to go to the forest, with Gandhari; Kunti, to her sons' dismay, goes with them. The Pandavas visit the hermitage; Vidura, an ascetic skeleton, leans against a tree and passes his life into Yudhishthira. |
| A02 | **The Night of the Dead and the Forest Fire** | main | 8 | 1163–1170 | 15.36–47 (approx.) | Vyasa calls the fallen warriors up from the Ganga for one night, free of enmity; the widows who wish it follow their husbands into the river. Narada brings news: Dhritarashtra, Gandhari and Kunti, unable to flee, died in a forest fire, sitting in meditation. |

### Season 16 · Mausala Parva: The Iron Club

Thirty-six years after the war, Gandhari's curse is fulfilled: the Vrishnis, drunk at Prabhasa, kill one another with reeds that turn to iron clubs. Balarama leaves his body; Krishna is shot by a hunter; Arjuna leads the survivors away and the sea swallows Dvaraka.

*13 episodes (global 1171–1183) · CE: 9 adhyayas · upa-parvas: Mausala.*

| Arc | Title | Layer | Eps | Global | CE refs | Story |
|---|---|---|---|---|---|---|
| A01 | **The Iron Club** | main | 13 | 1171–1183 | 16.1–9 (approx.) | Young Vrishnis dress Samba as a pregnant woman to mock visiting sages, who curse him to give birth to an iron club that will destroy the clan; it is ground to powder and thrown into the sea. The drunken quarrel at Prabhasa: Satyaki and Kritavarman, then everyone, killing with reeds that become clubs; Balarama leaves his body as a great serpent; Krishna, sitting in the forest, is shot in the foot by the hunter Jara. Arjuna comes, grieves and leads the women away; the sea floods Dvaraka; robbers attack and the Gandiva fails him; Vyasa tells him the time of the Pandavas is over. |

### Season 17 · Mahaprasthanika Parva: The Great Journey

The Pandavas crown Parikshit and set out with Draupadi and a dog toward the north. One by one they fall on the way, each for a fault Yudhishthira names; only he and the dog reach Indra's chariot, and he refuses to go to heaven without the dog.

*7 episodes (global 1184–1190) · CE: 3 adhyayas · upa-parvas: Mahaprasthanika.*

| Arc | Title | Layer | Eps | Global | CE refs | Story |
|---|---|---|---|---|---|---|
| A01 | **The Last Journey** | main | 7 | 1184–1190 | 17.1–3 | The Pandavas renounce; Agni asks for the Gandiva and it goes back to the sea; the walk around the world; Draupadi, Sahadeva, Nakula, Arjuna and Bhima fall; Indra comes for Yudhishthira and says the dog cannot come; Yudhishthira refuses, and the dog becomes Dharma. |

### Season 18 · Svargarohana Parva: The Ascent

In heaven Yudhishthira finds Duryodhana enthroned and his brothers apparently in hell; he chooses to stay with them; the illusion fades. All take their divine places. The frame closes: Janamejaya's sacrifice ends, and Sauti finishes his story to the sages of Naimisha.

*10 episodes (global 1191–1200) · CE: 5 adhyayas · upa-parvas: Svargarohana.*

| Arc | Title | Layer | Eps | Global | CE refs | Story |
|---|---|---|---|---|---|---|
| A01 | **Heaven, Hell and the End of the Story** | main | 10 | 1191–1200 | 18.1–5 | Yudhishthira sees Duryodhana in heaven and is led to a dark hell where voices of his brothers and Karna call to him; he chooses to stay; it was an illusion, a last test; he bathes in the heavenly Ganga and leaves his human body. Each hero returns to the god or power he came from (Bhishma to the Vasus, Karna to the Sun, Draupadi as Shri). Vaishampayana ends; Janamejaya's sacrifice is completed; Sauti closes the story at Naimisha with what it means to hear it. |

## 10. Tags and playlists

Playlists are **built from tags**, never by hand. Each episode carries `season`, `arc`, `layer`, `characters[]`, `themes[]`, `locations[]`, `tradition_note` and `languages{}`; `tools/catalog.mjs` derives `playlists[]` from them with fixed rules (`derivePlaylists`) and checks that the file agrees. All playlists play in **story order** (global number), never upload order.

| Kind | Id pattern | Rule | Count | Example title |
|---|---|---|---|---|
| Series | `all` | every episode | 1 | Mahabharatam — Every Episode in Order |
| Season | `season-s01` | episode.season | 18 | Season 1 · Adi Parva — The Beginning |
| Arc | `arc-s01a04` | episode.arc (in order; becomes the long-form compilation) | 124 | Garuda · Mahabharatam S1 |
| Layer | `layer-main` · `layer-side` · `layer-wisdom` | episode.layer | 3 | Mahabharatam · Wisdom |
| Character | `char-<id>` | a **major** character in episode.characters | 51 | Karna · Mahabharatam |
| Theme | `theme-<id>` | each of episode.themes | 31 | Curses · Mahabharatam |
| Language | `lang-<code>` | episode.languages[code] = released | 6 | Mahabharatam in Tamil |
| Special | `tradition`, `longform` | tradition_note = true; arc compilations | 2 | As Tradition Tells It · Mahabharatam |

**Themes** (`vocab.themes`): The Frame Story (`frame-story`) · Curses (`curses`) · Boons (`boons`) · Vows and Oaths (`vows`) · Battles and Duels (`battles`) · Dharma Dilemmas (`dharma-dilemmas`) · Love Stories (`love-stories`) · Wisdom (`wisdom`) · Gods (`gods`) · Women of the Epic (`women-of-the-epic`) · Serpents (Nagas) (`serpents`) · Births and Origins (`births-and-origins`) · Teachers and Students (`teachers-and-students`) · Asuras and Rakshasas (`demons-and-rakshasas`) · Sages (`sages`) · Animals and Birds (`animals-and-birds`) · Divine Weapons (`divine-weapons`) · Friendship (`friendship`) · Rivalry and Revenge (`rivalry-and-revenge`) · Exile and Wandering (`exile`) · Kingship (`kingship`) · Devotion (`devotion`) · Fate and Time (`fate-and-time`) · Death and Grief (`death-and-grief`) · Cosmology (`cosmology`) · Deception and Disguise (`deception`) · Sacrifices and Rituals (`sacrifices`) · Truth (`truth`) · Family (`family`) · Nonviolence (`nonviolence`) · As Tradition Tells It (`tradition-tales`).

**Character playlists** exist for the 51 characters marked `major` in `vocab.characters`: Sauti, Vyasa, Janamejaya, Takshaka, Parashurama, Indra, Vishnu / Narayana, Shiva, Ganga, Narada, Garuda, Vasuki, Astika, Satyavati, Shakuntala, Vishvamitra, Devayani, Yayati, Vasishtha, Shantanu, Bhishma, Amba, Dhritarashtra, Pandu, Vidura, Gandhari, Shakuni, Kunti, Karna, Yudhishthira, Bhima, Arjuna, Duryodhana, Drona, Ashvatthama, Drupada, Ghatotkacha, Draupadi, Krishna, Balarama, Shalya, Subhadra, Abhimanyu, Nala, Damayanti, Hanuman, Rama of Ayodhya, Savitri, Markandeya, Sanjaya, Shikhandin. Any character can be made major later; `--sync` then adds the playlist to every episode they appear in.

**Languages:** English is active. Tamil, Telugu, Hindi, Malayalam and Kannada are listed as planned (the dubbing path is in README.md, "Add a language"); a language playlist only ever contains released episodes in that language. Season, arc, character and theme playlists are per language as well when a language channel is used (same ids with a `.<code>` suffix, e.g. `arc-s01a04.ta`).

**Hashtag tags** (for descriptions, not playlists) map one-to-one from the catalog: the series tag `#Mahabharata`, the season's parva (`#AdiParva`), at most one character (`#Karna`) and at most one theme where it is a common search (`#BhagavadGita`, `#Krishna`).

## 11. Naming and SEO templates

**Episode titles** (on screen and in the catalog): 2–5 words, title case, concrete and story-first ("The Stolen Earrings", "Ekalavya's Thumb", "The Wheel of Blades"). No episode numbers, no clickbait words, no colons. A title names what happens or who it happens to; a quote title is allowed when the line is in the text ("Share It Equally", "I Do Not Know You").

**Arc titles**: the story's common name ("Nala and Damayanti", "The House of Lac"). **Season titles**: "Season N · <Parva>: <title>".

**YouTube Short title** (≤ 70 characters, the episode title first):

```
{episode title} · Mahabharatam Ep {n}
e.g. The Stolen Earrings · Mahabharatam Ep 6
```

Optional question-first variant for discovery, used only when the hook question is short and honest: `{hook question} · {episode title} · Mahabharatam Ep {n}`.

**YouTube description** (Shorts and long-form):

```
{hook question} {synopsis, first sentence or two}

Mahabharatam — As Vyasa Told It · Episode {n}
Season {s}: {parva} · {arc title} ({k} of {K})
Source: Mahabharata, {refs, e.g. "Adi Parva 1.36–40"} (BORI Critical Edition{; approximate range})
{only if tradition_note} Part of this episode is from later tradition, not the Critical Edition, and is marked on screen.
{only if reorder_note} Note: {one-line reorder note}

Previous: {prev title} · Next: {next title}
The whole story in order: {arc playlist link} · Every episode: {all playlist link}

Every frame and sound is generated from code. Narration: Kokoro-82M text-to-speech.

#Mahabharata #{Parva} #{Character or Theme}
```

**Instagram caption** (first line must work alone; 3–5 hashtags):

```
{hook question}
{one-sentence synopsis}
Mahabharatam Ep {n} · {episode title} · from the {Parva} ({refs})
{tradition line if any}
Full story in order: link in bio.
#Mahabharata #{Parva} #{Character} #IndianMythology
```

**Long-form compilation**: title `{arc title} · The Complete Story | Mahabharatam`; description = arc synopsis, chapter timestamps (one per episode title), the union of the episodes' refs, tradition and reorder notes, the same credit line.

**No fake claims.** Never use "untold", "real", "secret", "banned", "what they never told you", "100% authentic", "scientifically proven", historic dates, or numbers the text does not give. "As told in the Critical Edition" only when it is (no tradition material in the episode). Do not imply a human narrator or a scholar's endorsement. Hashtags: 3–5, relevant only (YouTube shows the first three above the title and ignores all hashtags on a video that has too many; Instagram has been lowering its hashtag limits, so keep to five or fewer). Check YouTube's current "altered or synthetic content" disclosure rules at upload; the description line above states the synthetic narration either way.

## 12. Pace and scope: honest notes

- **It is long.** 1,200 Shorts is ≈ 18 hours of finished picture. Even at one Short a day it is over three years; at five a week, over four and a half. The plan only works if each episode costs hours, not days: reuse locations, rigs and score cues per arc, and add characters to the kit in batches before each arc.
- **The cast grows fast.** Season 1 alone names ≈ 146 characters or character groups (the kit has about twenty character modules today). Many appear once: they should use shared rigs (`CH.female`, the sage variants, the canine rig) with fixed variations rather than bespoke modules.
- **The middle is the hardest.** Seasons 6–9 are 313 episodes, and apart from the Gita's 54 and a few tales, almost all of them are battle; they need a distinct visual grammar per commander and per day (formations, banners, the day counter from episode 3) or they will blur. The war is also where the most famous material is, so it must not be rushed.
- **Wisdom is not drama.** ≈ 202 wisdom episodes (54 for the Gita alone) need a different form: one teaching, one image, one question back to the viewer, still RECAP → HOOK → STORY → NEXT, with the dialogue frame (Krishna and Arjuna on the chariot, Bhishma on the arrows) as the anchor. Expect them to perform differently; they are worth doing anyway, and they make the best compilations.
- **Counts will move.** Arc sizes for Seasons 2–18 are estimates from the CE's adhyaya counts and the density of story; expect ±20 % per arc once scripts exist. Keep the global numbering contiguous: renumber planned episodes freely, never released ones (`catalog/README.md` explains how).
- **What is deliberately compressed.** Genealogies (Adi 59–60, 89–90), the cosmography of the Bhishma Parva, the long lists of tirthas, catalogues of gifts in the Anushasana: one episode or a few lines each.
- **What is not included.** The Harivamsha (the epic's appendix on Krishna's life) is outside the eighteen parvas; it could be a later spin-off. Kalidasa's version of Shakuntala and Puranic expansions are not used except where marked.
- **References are not yet verified.** Season 1's refs are close; Seasons 2–18's are approximate by design. Every ref with `approx: true` must be checked against the CE before it appears on screen or in a description.

## 13. Open questions and flagged uncertainties

Things to confirm against the BORI CE (or decide) before the episodes that use them are scripted:

1. **Episode 6's NEXT card** currently reads "Next: The Snake Sacrifice" (`script/ep06.en.json`, `strings.nextTitle`), but episode 7 is "The Seven-Day Curse". The catalog follows the agreed titles; the episode 6 card (or the order) should be aligned by whoever owns the scripts.
2. **Episode 8's range.** The brief gave ≈ Adi 47–51; the catalog uses 1.47–48 (the ministers' report, the vow, the builder's omen, the sacrifice, Takshaka's flight to Indra) and keeps Astika's arrival (1.49–51) for episodes 38–40. The episode 8 script in production matches this (it ends on "Next: Two Wives, Two Wishes").
3. **The poison at the churning (S01E014, "The Blue Throat").** RESOLVED: the kalakuta and Shiva's blue throat are not in the CE's constituted Adi 1.16 (a Southern/vulgate passage that Sukthankar relegated as an interpolation; the CE goes from Dhanvantari to the asuras' clamour). S01E014 keeps the story with the on-screen tag "As tradition tells it" throughout, and Sauti says so on camera; S01E013's cliffhanger (the poison) is tagged too. The enchantress is unnamed in the epic: the Puranic name "Mohini" is not used (S01E015).
4. **Where the Parikshit/Kashyapa material sits.** Adi 1.36–40 vs the ministers' report at 1.45–46 (S01E007, S01E037): ranges are approximate.
5. **Upa-parva boundaries.** The adhyaya ranges for the CE's upa-parvas (all seasons) are from memory and may be off by one or two at the edges; Seasons 2–18 refs are approximate throughout.
6. **Not in the CE (as far as we know), to be shown only with the tradition tag:** Ganesha as scribe (CE apparatus; episode 4 already tagged); Kanika's counsel (Adi); King Shvetaki's sacrifice as the cause of Agni's sickness (Adi, Khandava); Urvashi's curse on Arjuna (Aranyaka); Draupadi's prayer to Krishna in the dice hall (Sabha; the endless garment itself is in the CE); Draupadi's "blind man's son" taunt (Sabha); Durvasa and the last leaf (Aranyaka); Draupadi's refusal of Karna at the svayamvara and the fish-and-reflection target (Adi). Each of these should be double-checked against the CE's apparatus before it is labelled either way.
7. **Krishna darkening the sun before Jayadratha's death** (Drona Parva): check the CE text.
8. **Details named elsewhere in the epic**: Parashurama as Bhishma's teacher (Udyoga, not Adi 94); Ulupi's son Iravat (named in the Bhishma Parva); Madhavi as Yayati's daughter (Udyoga); "twenty-one times" for Parashurama (elsewhere in the epic, not in Adi 2's verse).
9. **Names with variants:** Dyaus (the eighth Vasu who stole the cow; "Prabhasa" in some tellings); Arjuna's son by Draupadi is Shrutakarman in the CE (Shrutakirti in some retellings); Shringin/Shringi.
10. **Skanda's birth** (Aranyaka): the epic gives more than one account (Agni and Svaha; Rudra's son); the arc should follow the CE's main thread and mention the other.
11. **Yudhishthira's curse on women** ("never to keep a secret") is placed at the start of the Shanti Parva (12.6); confirm.
12. **Counts of upa-parvas**: the Parvasamgraha lists 100; the CE's own division names fewer (≈ 93 in this plan's list); arcs follow the CE's text, not the count.

---

*Generated sections (season tables, Season 1 list, playlist counts) come from `catalog/series.json`; edit the catalog, then update this file to match. Last checked with `node tools/catalog.mjs`: 1200 episodes, 0 errors.*
