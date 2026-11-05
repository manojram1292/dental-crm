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
| 21 | yes | 6 w · 2.37 s | 22.8 | 3.7 s | 3.0 s | 52 % | 1 of 24 (*eye*: the "never" caption over Vinata) | 57.8 | 3 (late-gold island, amber palm grove, moonlit bay) + the blessing night | 0 | 2.45 · 0.33 / 1.55 | −14.1 · −0.9 ✗ (AAC overshoot; limiter headroom raised to 0.4 dB from ep 23) | −10.0 dB | A / NEXT › overlay | Adi 1.23–24 · none · ✓ (ep 22 opens on the throat) | pure | 18.8 |
| 22 | yes | 6 w · 2.46 s | 20.6 | 3.8 s | 3.9 s | 60 % | 1 of 24 (*eye*: the "come" caption at the top crosses the wing-tips) | 55.8 | 2 (the bay under a storm of dust; the high hermitage at dawn, rose and snow) + the lake in the vision | 0 | 2.63 · 0.33 / 1.55 | −14.1 · −1.0 | −10.7 dB | B / NEXT › overlay | Adi 1.25 · none · ✓ (ep 23 opens on the lake) | pure | 17.8 |
| 23 | yes | 8 w · 3.15 s ✗ (0.15 over) | 7.1 | 4.5 s | 4.2 s ✗ (the red-ochre panel, "tell") | 55 % | 0 of 24 (*eye*) | 57.4 | 2 (the red-ochre mural panel; Alamba at violet twilight) + the storm-green lake in full | 0 | 2.42 · 0.33 / 1.5 | −14.2 · −1.0 | −11.8 dB | C / NEXT › overlay | Adi 1.25–26 · none · ✓ (the curses checked: Vibhavasu cursed Supratika to be the elephant) | pure | 15.6 |
| 24 | yes | 7 w · 2.64 s | 25.9 | 3.9 s | 4.8 s ✗ (the "plead" shot under the branch) | 48 % | 0 of 24 (*eye*) | 55.6 | 3 (midday glare from above; Gandhamadana green-gold; the snow mountain at alpenglow) + heaven at night | 0 | 2.77 · 0.32 / 1.5 | −14.1 · −1.0 (after the remux with 1 dB AAC headroom) | −9.4 dB | A / NEXT › overlay | Adi 1.26 · none · ✓ (ep 25 opens on the Valakhilyas' rite) | pure | 17.5 |
| 25 | yes | 5 w · 2.39 s | 13.0 | 3.7 s | 1.2 s | 55 % | 0 of 24 (*eye*) | 56.5 | 4 (the blue-white rite at night; Indra's council hall under the omens; the sacrifice at bright morning; a hoofprint puddle at ground level) | 0 | 2.39 · 0.33 / 1.5 | −14.1 · −1.7 | −9.2 dB | B / NEXT › overlay | Adi 1.26–27 · none · ✓ (Shaunaka asks, as in the CE; ep 26 opens at heaven's gate) | pure | 15.8 |
| 26 | yes | 6 w · 3.03 s (on the line) | 19.3 | 4.3 s | 3.6 s | 47 % | 1 of 24 (*eye*: the "clear" caption over the charging gods) | 55.8 | 2 (heaven's courtyard under a bruised green-violet storm; the compass of heaven from above) | 0 | 2.48 · 0.35 / 1.5 | −14.2 · −1.7 | −10.6 dB | C / NEXT › overlay | Adi 1.28 · none · ✓ (ep 27 opens on the wheel) | pure | 18.3 |
| 27 | yes | 8 w · 2.76 s | 19.6 | 4.1 s | 1.1 s | 60 % | 0 of 24 (*eye*; captions moved high over the vault shots) | 55.4 | 3 (the inner court on fire, turning to steam; the vault in cold steel-blue; the open sky at deep blue dusk) | 0 | 2.68 · 0.34 / 1.5 | −14.2 · −1.8 | −9.5 dB | A / NEXT › overlay | Adi 1.29 · none · ✓ (ep 28 opens on Vishnu) | pure | 17.2 |
| 28 | yes | 5 w · 2.23 s | 62.2 | 3.5 s | 1.7 s | 59 % | 0 of 24 (*eye*) | 55.3 | 2 (first light over a cloud-sea; a white-gold sky for the banner) + Indra's storm at the cliffhanger | 0 (but within the episode several two-shots share one layout, *eye*) | 2.69 · 0.29 / 1.5 | −14.2 · −1.8 | −10.0 dB | B / NEXT › overlay | Adi 1.29 · none · ✓ (ep 29 opens on the vajra) | pure | 17.4 |
