---
name: lemo-styles
description: Six 2D animation style prompts from the open-source Lemo Opuscar Claude Code plugin (Nov 2026): copperplate engraving, one-line drawing, isometric infographic, blueprint, red paper-cut, 80s cel anime. Each gives the look's rules, materials, colour, type, motion, camera grammar, sound palette, native moves, pitfalls and variation space. Use when Manoj asks for a video, short, reel, explainer or insert "in the style of" engraving, line drawing / one line, isometric / infographic / city growth, blueprint / technical drawing, paper-cut / papercut / window flower, or 80s anime / cel / retro anime, or asks which style fits a topic.
---

# Lemo Opuscar styles

Source: the STYLE.md files of the Lemo Opuscar plugin, as shown in the @papaocus reel "60+ FREE CLAUDE STYLES!" (Nov 17, 2026). Text is unchanged; read the one you need from `references/`.

| Style | File | Reach for it when |
|---|---|---|
| Copperplate engraving | `references/engraving.md` | museum label, natural history, textbook figure, a "plate" with magnified details |
| One-line drawing | `references/one-line.md` | one continuous idea, transformations, a journey, an emotional short with a solo instrument |
| Isometric infographic | `references/iso-infographic.md` | systems, numbers, a place growing over time (city 1985→2025), supply chains |
| Blueprint | `references/blueprint.md` | how a machine or building works, revisions, design verdicts |
| Red paper-cut | `references/papercut-red.md` | folk tales, festivals, one-becomes-many stories, cut-out characters |
| 80s cel anime | `references/cel-anime-80s.md` | character-driven, neon, speed, nostalgia, a character roster / mock opening |

## Using them

1. Pick the style from the topic, read its file fully, write your own treatment (story, shots, timings) **before** looking at any demo.
2. Each file ends with "How our demo was made … DEMO.md" and names an engine (`demo/engine/…`). **That engine lives in the Lemo Opuscar repo, which is on Manoj's Mac (`~/workspace/lemo-opuscar`), not in cloud containers.** Without it, build the look from the rules in Canvas2D or Three.js; don't pretend the engine exists.
3. Grammar only: never copy the named references' characters, plates, logos or shots.

## When used inside the Mahabharatam series

The series' own rules win over a style's numbers (see `mahabharatam/README.md`, `HANDOFF.md`, `tools/mix.py` RULES2):
- **No literal silence.** One-line and blueprint ask for true silence; the owner hears that as a glitch. Use a 3.5 dB dip instead.
- **Voice clarity**: voice ≥ 15 dB median over the bed (gate-enforced), not the styles' 5–10 dB ducks.
- −14 LUFS, true peak ≤ −2.5 dBTP, 30 fps vertical 1080×1920 (styles assume 24 fps 16:9; keep their stepping, e.g. 12 fps cels, by holding frames).
- Faithful to the BORI Critical Edition; a style is a look, never licence to add events.
- Good fits for the series: papercut-red (episode inserts, genealogies, one-becomes-many like the hundred Kauravas), engraving (verse "plates", weapons, maps of Kurukshetra), iso-infographic (army sizes: akshauhini maths as Isotype), one-line (Vishvarupa / lineage threads).
