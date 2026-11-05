# Quality scorecard

One row per episode from episode 20 (the baseline) on. Every number that can be measured is measured:
`python3 -I tools/scorecard.py --ep N` reads the timeline, the script and the rendered video (decoded at
10 fps, 135×240 grey) and runs ebur128. The rest is checked on stills and marked *eye*.

**Columns and targets**

| Column | What | Target | Source |
|---|---|---|---|
| Hook@0 | the hook text is on screen at frame 0 | yes | still at t = 0 |
| Hook | words · speech end (s) | ≤ 8 · ≤ 3.0 | timeline (independent review #1) |
| Move@0.5 | mean grey-level change, frame 0 → 0.5 s (0–255) | ≥ 6 | video (#6) |
| Story | start of the first story line (s) | ≤ 6 | timeline (#2) |
| Hold | longest static hold (s): frames whose 1 s change stays under 2 grey levels | ≤ 4 | video |
| Turn | where the turn line starts (% of runtime) | 40–60 | timeline (the line noted "TURN") |
| Cap×fig | frames where a caption covers a key figure (of the 24-still contact sheet) | 0 | *eye* |
| Dur | duration (s) | 54–58, max 59 | timeline |
| Light | new location lights | ≥ 1 | *eye* / `_common.js` |
| Repeat | compositions repeated vs the previous 3 episodes (line-midpoint stills, 16×16 dHash, Hamming ≤ 30/240) | 0 | video |
| W/s · gaps | speech rate · gap sd / longest rest (s) | 2.4–2.6 · sd ≥ 0.25, one rest ≥ 0.8 | timeline (#8) |
| LUFS · TP | integrated loudness · true peak | −14 ± 1 · ≤ −1.0 | ebur128 (#3) |
| Next | the Next card's mean level vs the body (dB) | ≤ −6 | volumedetect (#10) |
| Open/Next | opening style (A question card · B direct speech · C statement) / Next variant | rotate | script (#7) |
| Fidelity | CE reference · tradition tags · the cliffhanger matches the next episode's opening | checked | script + catalog (#9) |
| Pure | `node tools/preview.mjs purity` | pure | tool |
| Share | share copy size (MB) | ≤ 20 | file |

## Rows

| Ep | Hook@0 | Hook | Move@0.5 | Story | Hold | Turn | Cap×fig | Dur | Light | Repeat | W/s · gaps | LUFS · TP | Next | Open/Next | Fidelity | Pure | Share |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 20 (baseline, Nov 4 render) | yes | 12 w · 5.45 s ✗ | 20.6 | 10.6 s ✗ | 4.0 s | 47 % | 2 of 24 (*eye*: the cliff and ask captions over Garuda) | 56.0 | 1 (Ramaniyaka at noon) | 0 | 2.13 ✗ · 0.33 / 1.5 | −20.4 ✗ · −1.1 | +2.0 dB ✗ | A / navy card | Adi 1.21–23 · none · ✓ (ep 21 opens on the price) | pure | 19.5 |
| 0 (intro, draft) | yes | 6 w · 3.05 s | 12.0 | 4.35 s | 2.5 s | n/a (a statement, no story turn) | 0 of 24 (*eye*) | 73.5 (intro: 55–75 target) | the title moments on a dark plaster ground; the rest is montage | n/a (montage by design) | 2.25 · 0.35 / 1.45 | −14.3 · −1.1 | −7.7 dB | A / BEGIN card | ≈100,000 (traditional) / ≈75,000 (CE); the tradition tag shown as the example | pure | 21.0 (73 s, capped) |
