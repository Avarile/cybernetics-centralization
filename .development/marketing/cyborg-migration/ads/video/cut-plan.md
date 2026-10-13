# Ad Set B: Video Cuts (MARKETINGP-11)

Three short ads cut from the 150 s explainer (`docs/presentation-personal/claude-design-video-prompt.md`). They have captions only and work with the sound off.

**Status:** the explainer master hasn't been rendered yet. This file gives (1) the cut plan, if you edit from the master, and (2) a ready-to-paste Claude Design prompt that renders the cuts directly. End cards are in this folder.

| File | Format | Length | utm_content |
|---|---|---|---|
| `ad-v15-1080x1920` | 9:16 | 15 s | `ad-gap-v15` |
| `ad-v30-1080x1920` | 9:16 | 30 s | `ad-gap-v30` |
| `ad-v15-1920x1080` | 16:9 (YouTube pre-roll) | 15 s | `ad-gap-v15-169` |

End cards: `endcard-1080x1920.png`, `endcard-1920x1080.png` (complete figure 3/3, core line, "Start your 4-week migration", `avarile.com/register`).

Rules from the explainer prompt that still apply: black, white and grey only; captions taken verbatim from the explainer; at most 2 caption lines on screen; bottom 12% clear; no numbers, logos or real data.

---

## 15 s (9:16 and 16:9)

| Time | From explainer | Visual | Caption |
|---|---|---|---|
| 0.0–3.0 | Scene 1 | Empty figure; grey fragments drift away; the loop stays open | "AI-native is the new baseline. Are you?" |
| 3.0–6.0 | Scene 1 | Fragments keep drifting | "Solved it once. Forgot how." |
| 6.0–10.0 | Scene 2 | Two figures; the left loop open, the right loop closing; the gap widens | "AI makes output cheap. Your own record isn't." |
| 10.0–12.0 | Scene 2 | Gap band labelled THE GAP | "The gap compounds." |
| 12.0–15.0 | End card | Complete figure, core line, CTA | (end card text) |

## 30 s (9:16)

| Time | From explainer | Visual | Caption |
|---|---|---|---|
| 0.0–3.0 | Scene 1 | Empty figure; fragments drift away | "AI-native is the new baseline. Are you?" |
| 3.0–6.0 | Scene 1 | Loop fails to close | "Solved it once. Forgot how." |
| 6.0–9.5 | Scene 2 | Two figures, the gap widens | "AI makes output cheap. Your own record isn't." |
| 9.5–11.5 | Scene 2 | THE GAP band | "The gap compounds." |
| 11.5–14.5 | Scene 2 | Memory dots locked into the ASSISTANT MEMORY box | "And memory inside one assistant is rented." |
| 14.5–18.0 | Scene 3 | Fragments condense into the solid core; bar 1/3 | "One memory. Owned by me." |
| 18.0–21.0 | Scene 4 | Model rings dock and swap; the core doesn't change; bar 2/3 | "Swap the mind. Keep the memory." |
| 21.0–25.0 | Scene 7 | The loop closes; three laps; bar 3/3 | "Every week feeds the next." |
| 25.0–30.0 | End card | Complete figure, core line, CTA | (end card text) |

---

## Claude Design prompt (paste after the explainer prompt)

```
Using the same visual system, figure and captions as the "Cyborg Migration" explainer above, render three short ad cuts. Do not add any new captions, slogans or numbers.

1) 15-second vertical ad, 1080x1920, 30 fps.
   0-3 s: Scene 1 opening; caption "AI-native is the new baseline. Are you?"
   3-6 s: Scene 1 fragments; caption "Solved it once. Forgot how."
   6-10 s: Scene 2 two figures and widening gap; caption "AI makes output cheap. Your own record isn't."
   10-12 s: gap band; caption "The gap compounds."
   12-15 s: END CARD (below).

2) 30-second vertical ad, 1080x1920, 30 fps.
   0-3 s Scene 1 "AI-native is the new baseline. Are you?"
   3-6 s Scene 1 "Solved it once. Forgot how."
   6-9.5 s Scene 2 "AI makes output cheap. Your own record isn't."
   9.5-11.5 s Scene 2 "The gap compounds."
   11.5-14.5 s Scene 2 trap, memory locked in box: "And memory inside one assistant is rented."
   14.5-18 s Scene 3, core forms, bar 1/3: "One memory. Owned by me."
   18-21 s Scene 4, rings swap, bar 2/3: "Swap the mind. Keep the memory."
   21-25 s Scene 7, loop closes, bar 3/3: "Every week feeds the next."
   25-30 s END CARD.

3) 15-second horizontal ad, 1920x1080: the same as (1), recomposed for 16:9 (captions upper third, figure centre).

END CARD (hold, no motion except a slow pulse on the core): the complete figure with closed loop and full migration bar; small label "CYBORG MIGRATION"; headline "My memory. Any mind. Closed loops."; line "AI-native is the new baseline."; a white block button "Start your 4-week migration"; under it in grey "avarile.com/register".

Captions at least 64 px (9:16) or 56 px (16:9), at most 2 lines, bottom 12% clear. Black, white and grey only.
```

## After rendering

- [ ] Name the files as in the table above and put them in this folder.
- [ ] Upload with the links from `../../ad-copy.md` §3.
- [ ] Check captions on a phone with the sound off.
