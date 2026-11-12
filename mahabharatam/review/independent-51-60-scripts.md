# Independent review · scripts 51–60 (story and fidelity)

Reviewer: independent critic, did not write the scripts. Date: 12 Nov 2026. Scope: `script/ep51.en.json` … `ep60.en.json` (every spoken line, plaque, tag, recap band, source line, cliffhanger, Next card, and the picture notes), continuity against `ep47`–`ep50`. Nothing was edited, nothing committed.

## Verdict

No invented event and no wrong name, number or kinship in a voiced line. No BLOCKER. Seven MAJOR findings, and they are the same two faults the 41–50 review found:

1. In the two union scenes of this batch the text states the woman's willingness and the script cuts it (Menaka, 1.66.7) or cuts the man's own regard for it (Dushyanta, 1.67.6, 14). Episode 54 repeats, word for word, the formula episode 50 was corrected for ("saw her, and desired her").
2. The clause that makes a beat make sense is cut: why Kacha courts Devayani (1.71.13–14), why Shukra would die (1.71.44), which sage the girl means (ep 54), and why the Kacha tale is being told at all (Yayati vanishes from the voice after the ep 58 cliffhanger that promises him).

One finding is about order: episode 52 says "dark powers came down too" after the gods, which contradicts both the text's order and episode 51, and the screen does not say the list was reordered.

## What I verified and how

- **Read against the Sanskrit myself** (`lab/ce/adi.txt`, lines with `@` or `*` in the verse id excluded as apparatus): 1.58.1–51, 1.59.1–6, 1.61.1–5 and 1.61.61–102, 1.62.1–14, 1.63.1–13, 1.64.1–3 and 14–42, 1.65 whole, 1.66 whole, 1.67 whole, 1.68.1–29, 40, 47, 63–65, 70–80, 1.69.1–3, 20–51, 1.70.28–33 and 44–46, 1.71 whole, 1.72.1–6.
- **Not read:** 1.59.7–end and 1.60 (passed over by the series; only grepped for *kali*), 1.61.6–60 (the danava list; only the two names on plaques, 61.4–5, were checked), 1.63.14–26 (the hunt), 1.64.4–13 and 32–37 (forest and brahmin catalogues), 1.68.30–39, 41–46, 48–62, 66–69 and 1.69.4–19 (parts of Shakuntala's two speeches that no line quotes), 1.70.1–27 and 34–43.
- **Not checked at all:** rendered video, audio, timings, the gate, `src/scenes/*`, the catalog JSON. Ganguli was not consulted. `script/ARC-51-60.md` was read only in section 2–3 (the order table and catalog corrections), after my own pass; the per-episode sections 4 onward were not read.
- Caveat: the `source` field of each script (the author's own check) is printed next to the lines in the JSON, so I saw it while reading the lines. Every finding below rests on a verse I read in the constituted text.

## Scores

| Ep | Title | Fidelity | Clarity | Stands alone | Worst flaw |
|---|---|---|---|---|---|
| 51 | The Burden of the Earth | 9 | 7 | 8 | The hook is answered in a quoted line the teller does not say, 5 s in |
| 52 | Gods in Disguise | 8 | 7 | 7 | "Dark powers came down too": reversed order, undisclosed, against ep 51 |
| 53 | The King and the Hermitage | 9 | 8 | 8 | Recap band's "the king" is not the king of the episode |
| 54 | The Girl the Birds Protected | 8 | 5 | 6 | Three "sages"; Menaka's willingness cut |
| 55 | A Marriage Without Witnesses | 8 | 7 | 8 | "You are your own mistress. Give yourself." |
| 56 | The Boy Who Tamed Lions | 9 | 8 | 7 | Neither Kanva nor Dushyanta is ever named aloud |
| 57 | "I Do Not Know You" | 9 | 8 | 8 | (minor only) |
| 58 | The Voice from the Sky | 9 | 8 | 8 | Cliffhanger promises Yayati's marriage; 59–60 never mention him |
| 59 | The Secret of Reviving the Dead | 9 | 6 | 7 | Why a student sings and dances for the teacher's daughter is cut |
| 60 | Kacha Dies Twice | 9 | 6 | 7 | "If you die": nothing has said Shukra must die |

## Findings

Counts: **0 BLOCKER · 7 MAJOR · 19 MINOR.** Earliest episode first within each grade. Word counts are given so timing can be judged; any accepted rewrite needs the gate re-run.

---

### BLOCKER

None.

---

### MAJOR

#### M1 · Ep 52 · `kali` · the order of descent is reversed, against the text and against episode 51, and the screen does not say so

Line: "But dark powers came down too. Duryodhana, who lit the feud, was born from the spirit of strife." (18 words)

CE read: 1.61.3 *prathamaṃ dānavāṃś caiva tāṃs te vakṣyāmi sarvaśaḥ* ("first the danavas…"); the list runs danavas 61.4–61, then Duryodhana 61.80 (*kaler aṃśāt tu saṃjajñe bhuvi duryodhano nṛpaḥ*), and only then the five brothers 61.84–85. And 1.58.25–26 has the asuras born on earth before the gods are sent (*asurā jajñire kṣetre rājñām*), which episode 51 told correctly ("Then the asuras… began to be born on earth", before Brahma's command).

What is wrong: (a) "came down too", after the gods, states a sequence that is the reverse of 1.58 and of what episode 51 showed one episode earlier. A viewer of both hears two orders. (b) The script opens on 61.84–85 and puts 61.80 at the turn. The author's own table records the reorder; the source line names only the chapter and the skipped chapters. By the standard applied to B1 of the last review, a reorder must be said on screen. It is a catalogue, not a narrative, so I grade it MAJOR, not BLOCKER.

Fix:
- `kali`: **"But dark powers had been born first. Duryodhana, who lit the feud, was born from the spirit of strife."** (19 words; +1)
- Source line: **"Adi Parva 1.61 · the text lists the demons first · chapters 59–60 passed over · BORI Critical Edition"**.

#### M2 · Ep 54 · hook, `said`, `tapas` · three "sages" before the one the question is about is named

Lines: hook "How can a celibate sage have a daughter?" · `said` "People call me the sage's daughter. Hear why." · `tapas` "The penance of the sage Vishvamitra frightened the king of the gods." · `saw` "The sage saw her, and desired her." · `found` "The sage Kanva found her…"

CE read: 1.65.15 *kaṇvasyāhaṃ bhagavato duḥṣanta duhitā matā* (she names Kanva at once).

What is wrong: a viewer who has seen no earlier episode hears "a celibate sage", then "the sage's daughter", then "the sage Vishvamitra". He will take Vishvamitra for the celibate sage of the hook, and then hears that this celibate "desired her". Kanva is first named at 38 s. The text names him in her first sentence.

Fix: `said`: **"People call me the sage Kanva's daughter. Hear why."** (9 words; +1). And in `saw` name the man (see M3).

#### M3 · Ep 54 · `saw` · Menaka's willingness, which the text states, is cut; the line is episode 50's uncorrected formula

Line: "The sage saw her, and desired her." (7 words). Episode 50 `sage`: "…saw her, and desired her." The next line is "…a daughter was born."

CE read: 1.66.7 *nyamantrayata cāpy enāṃ sā cāpy aicchad aninditā* ("he invited her, and she, blameless, was willing too").

What is wrong: the brief asks that consent be clear where the text has it. Here it has it in four words and the script goes from his desire to a birth. The last review graded the same cut in episode 50 MAJOR and it was fixed there ("and gladly agreed").

Fix: `saw`: **"Vishvamitra desired her; and she was willing."** (7 words; same length)

#### M4 · Ep 55 · `self` · the wording is harsher than the text and carries an unlucky second sense

Line: "You are your own mistress. Give yourself." (7 words), a king to a young woman alone, after she has said "wait for my father".

CE read: 1.67.6 *icchāmi tvāṃ varārohe bhajamānām anindite* ("I want you willing"); 1.67.7 *ātmanaivātmano dānaṃ kartum arhasi dharmataḥ* ("you may by law make the gift of yourself yourself"; *arhasi*, not an imperative); 1.67.14 *sā tvaṃ mama sakāmasya sakāmā…* ("you, willing, of me, willing").

What is wrong: (a) "mistress", heard once at speed in a proposal scene, is heard in its other sense. (b) The bare imperative "Give yourself" is not the text's mood, and his twice-stated condition that she be willing is dropped, so the scene reads as pressure. Her condition in `terms` then saves it, but the line stands alone for four seconds.

Fix: `self`: **"You are your own to give, if you wish it."** (9 words; +2 short words), or at the same count: **"Your self is your own to give."** (7 words)

#### M5 · Eps 58 → 59 → 60 · the cliffhanger promises Yayati's marriage; the next two episodes never say his name

Lines: ep 58 `cliff` "Long before Bharata, his forefather Yayati married the daughter of a sage who raised the dead." · ep 59 recap band (unvoiced) "The king asked how his forefather Yayati won a great sage's daughter." · ep 59 `war` "The answer begins with a war…" · no voiced line of 59 or 60 contains "Yayati"; Devayani is "his daughter" / "Shukra's daughter" only.

CE read: 1.71.1 *kathaṃ sa śukratanayāṃ lebhe paramadurlabhām*; 1.71.4 *devayānyāś ca saṃyogaṃ yayāter nāhuṣasya ca* (the teller says at once that this is the story of Devayani's union with Yayati).

What is wrong: the cliffhanger is honest about the sage (59 delivers him) but its subject is the marriage. A viewer of 59–60 is never told that Devayani is the bride in question, so the family story appears to have been dropped for an unrelated tale, and "The answer begins with a war" answers only the hook. The text makes the link in its fourth verse.

Fix (one clause, ep 59 `served`, combined with M6): see M6. Or, minimum: ep 59 `priests`: **"The gods' priest was Brihaspati. The asuras' was Shukra: father of Yayati's bride."** (13 words; +4), and ep 60 plaque: **Devayani · Shukra's daughter, later Yayati's queen**.

#### M6 · Ep 59 · `send`, `served` · why Kacha courts Devayani is in the picture only

Lines: `send` "So the gods sent Kacha, Brihaspati's eldest son, to win that knowledge." · `served` "He served his teacher, and sang and danced for his daughter, Devayani." (12 words)

CE read: 1.71.13–14 *devayānīṃ ca dayitāṃ sutāṃ tasya mahātmanaḥ / tvam ārādhayituṃ śakto… devayānyāṃ hi tuṣṭāyāṃ vidyāṃ tāṃ prāpsyasi dhruvam* ("when Devayani is pleased you will surely get that knowledge").

What is wrong: a student who sings and dances for his teacher's daughter makes no sense without the gods' instruction, and that instruction is what gives episode 61 ("The Curse at Parting") its sting. It is the clause that makes the beat work, and it is cut from the voice.

Fix: `served`: **"He served his teacher and, as the gods had advised, charmed Devayani: the daughter Yayati would marry."** (17 words; +5; trims possible: drop "had"). If M5 is fixed elsewhere: **"He served his teacher and, as the gods advised, sang and danced for his daughter, Devayani."** (16 words)

#### M7 · Ep 60 · `two` · "If you die": nothing has said that Shukra must die

Lines: `belly` "Shukra called again. Kacha answered softly, from inside his teacher's belly." · `two` "If he dies, I cannot bear it. If you die, I cannot live." (13 words) · `teach` "Then learn my art, Kacha, and bring me back."

CE read: 1.71.44 *nānyatra kukṣer mama bhedanena dṛśyet kaco madgato devayāni* ("only by the splitting of my belly could Kacha be seen"); 1.71.45 *kacasya nāśe mama nāsti śarma tavopaghāte jīvituṃ nāsmi śaktā*.

What is wrong: heard once, "If you die" has no cause, and "bring me back" in the next line has none either. The dilemma (he can come out only through his teacher's death) is the turn of the episode and is never spoken.

Fix: `two`: **"He can only come out through your death. I cannot lose either of you."** (14 words; +1). It keeps 71.45's sense and voices 71.44.

---

### MINOR

#### m1 · Ep 51 · `secret` · a quoted sentence the teller does not say; it also spends the hook at 5 s
Line: "To lift a burden from the Earth. It is a secret of the gods." (speaker: Vaishampayana). CE 1.58.3 *rahasyaṃ khalv idaṃ rājan devānām iti naḥ śrutam / tat tu te kathayiṣyāmi*: only the second sentence is his; the first is the substance of Brahma's words at 58.46. `loop.answeredBy` says the hook is answered at `command`, but this line answers it first. Fix, same length: **"It is a secret of the gods. I will tell it to you."** (12 words; both halves are 58.3).

#### m2 · Ep 51 · `cliff` · "So" and "heroes and villains"
Line: "So gods and demons were born as men: this story's heroes and villains." "So" makes the demons' birth a result of Brahma's command; in 58.25–26 they are born first. "Villains" is a modern word and maps too neatly (Karna, a part of the Sun, fights for Duryodhana). Fix: **"Gods and demons, both born as men: they are the warriors of this story."** (14 words; +1)

#### m3 · Ep 51 · plaques · "the axe-bearing sage", "Vishnu, the preserver"
CE 1.58.4 *jāmadagnyas tapas tepe*; no axe in the passage. 1.58.50 gives discus, mace, yellow robe; "the preserver" is the later triad, not this text. Ep 52 identifies the same name as "the eternal god of gods" (61.90 *devadevaḥ sanātanaḥ*). Fix: **Parashurama · Jamadagni's son**; **Narayana · the god of gods** (one identifier in both episodes).

#### m4 · Ep 52 · `five` · "the god of right"
Heard once, "right" is right/rite/write. Fix: **"the god of justice"** (same length) or "Dharma, the god of right".

#### m5 · Ep 52 · plaques · "the danava Viprachitti", "the daitya Hiranyakashipu"
Two unexplained words for a first-time viewer, in an episode whose voice says "dark powers" and whose predecessor said "asuras" and "demons". Fix: **Jarasandha · the demon Viprachitti**; **Shishupala · the demon Hiranyakashipu**.

#### m6 · Ep 52 · `payoff` · the text's condition is dropped
Line: "Whoever hears this will not lose heart in hard times." CE 1.61.102 *prabhavāpyayavit prājño na kṛcchreṣv avasīdati*: the wise hearer who knows origin and end. Acceptable as condensation; if a word can be spared: **"The wise who hear this do not lose heart in hard times."**

#### m7 · Ep 53 · recap band · "The king" is Janamejaya, the episode's king is Dushyanta
Band: "The king asked for his own family's story, from the beginning." Janamejaya is not in this episode's `names`. A new viewer reads "the king" as the man on screen. Fix: **"King Janamejaya asked for his own family's story, from the beginning."**

#### m8 · Ep 53 · `empty` · "the sage's own hut"
CE 1.65.2 *śūnyaṃ dṛṣṭvā tam āśramam*: the hermitage, not a hut; and 65.1 *nāpaśyad… tam ṛṣim*. Fix: **"But the sage himself was nowhere to be seen."** (9 words; +2) or "But the sage's own place was empty."

#### m9 · Eps 54, 55 · "hermit girl", "the girl" for a woman about to be married
Ep 53 `came` says "A young woman". Ep 54 `asked` "A king asked a hermit girl who she was"; ep 55 recap band "A hermit girl told a king…". CE 1.65.11 *rūpayauvanasaṃpannām* ("in the fullness of youth"). In an episode that ends on a union, "girl" should not be the word. Fix: "a young hermit woman" in both (ep 54 title can stand: it is about the infant).

#### m10 · Ep 54 · `cliff` · the reason he proposes is cut
Line: "The king listened. Then he said: be my wife." CE 1.67.1 *suvyaktaṃ rājaputrī tvaṃ… bhāryā me bhava*: "clearly you are a king's daughter": her father was born a kshatriya (the plaque on `tapas` already says "a king turned fierce ascetic"), which is why a king may ask. Fix: **"The king listened. A king's daughter, then, he said: be my wife."** (12 words; +3)

#### m11 · Ep 55 · `gandharva` · "no rite" against "took her hand"
Line: "…their own choice, no rite, no witness." CE 1.67.26 *nirmantro rahasi* (without mantras, in private) but 1.67.19 *jagrāha vidhivat pāṇau* (took her hand according to rule). Fix: **"their own choice, no priest, no witness"** (same length).

#### m12 · Ep 55 · `army` picture note · "the next day's hard light"
CE 1.67.5 (Kanva has gone for fruit: *taṃ muhūrtaṃ pratīkṣasva*) and 1.67.23 *muhūrtayāte tasmiṃs tu kaṇvo 'py āśramam āgamat*: Kanva is back a moment after the king leaves, still carrying the fruit (67.30). It is the same day. Fix the note and the light: the same evening.

#### m13 · Ep 56 · `time`, `court` · neither Kanva nor Dushyanta is named aloud
"Kanva" and "Dushyanta" are on plaques only; the voice says "a king's son", "the king", and Kanva's line is an unattributed new voice. Fix: `court`: **"She was led before King Dushyanta, her son bright as the sun."** (+1); `walk`: **"Her foster father, Kanva, sent mother and son to Hastinapura."** (10 words; +4), or accept the plaque.

#### m14 · Ep 56 · `knew` · "remembered everything"
CE 1.68.18 *smarann api* ("though he remembered"). "Everything" is ours. Fix: **"The king remembered. But he said:"** (shorter).

#### m15 · Ep 57 · `heart` · "the ancient witness"
CE 1.68.27 *na hṛcchayaṃ vetsi muniṃ purāṇam* ("the ancient seer who lies in the heart"); *sākṣī* is 68.25, of the king himself. A fair fusion, cited as 27–29 on screen. If exactness is wanted: **"You think you are alone. An ancient seer sits in your own heart, and sees."**

#### m16 · Ep 58 · source line · chapter 70 is cited but passed over
Line: "Adi Parva 1.69–71 · BORI Critical Edition". Ep 52's source line declares its skipped chapters; this one cites 1.70 (the genealogy from Daksha to Puru) as if told. Fix: **"Adi Parva 1.69, 1.71 · chapter 70, the genealogy, is passed over · BORI Critical Edition"**.

#### m17 · Ep 59 · `cliff` · "Five hundred years on" arrives unprepared
The thousand-year vow (1.71.18 *sahasraṃ parivatsarān*) is on a sub-line only; the voice has given no scale of time. Fix: `came`: **"I am Kacha, Brihaspati's son. Take me as your student, for a thousand years."** (+4), or accept the sub.

#### m18 · Ep 60 · source line and tag · "later tellings add a third"
"Later" is a claim about date that the apparatus does not make; 701* is a reading of some manuscripts. Fix: **"two deaths here; other versions add a third"** (same length), on the source line and on the `second` tag.

#### m19 · Eps 51–60 · five words for one kind of being
asuras (51, 59, 60), demons (51 `cliff`), dark powers (52), danava, daitya (52 plaques); the tag is "the gods' old enemies" in 51 and "the gods' rivals" in 59. Pick "asuras" with one gloss and keep it.

---

## Continuity checked and found sound

- 50 → 51 → 52 → 53: each closing question is answered by the second or third line of the next episode.
- 53 `cliff` = 54 hook; 54 `cliff` = 55 hook; 55 `cliff` (lions) = 56 hook; 56 `cliff` → 57 hook; 57 `cliff` → 58 hook; 59 `cliff` → 60 `first`.
- The promise at 55 `terms` ("my son shall be king after you") is the same at 56 `time` and `claim`.
- "No ring, no curse" is said on screen in 57 (source line and tag) and nothing in 55–58 implies forgetting.
- Kinship terms: Kanva is "foster father" throughout 55–56; Yayati is "forefather" of Bharata (1.70.29–32, 45: Yayati → Puru → the Pauravas), correct.
- Hook styles do not repeat between neighbours (question, number, speech, question, speech, number, statement, speech, question, number).
