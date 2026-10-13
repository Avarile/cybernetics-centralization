# Cyborg Migration: Overlay Animations, Shared Spec

**How to use these files in Claude Design:** paste this shared spec first, then **one** episode file (`ep01-animations.md` … `ep05-animations.md`) or `thumbnails.md`. Generate one episode per session. Every clip has an ID (for example `E2-03`) that matches a cue in the episode scripts.

---

Create a pack of short, separate animated clips. They will be composited **over live camera footage** of a presenter talking. They are not slides and not a standalone video. Each clip fades in next to or in front of the presenter, explains one idea visually, holds while the presenter talks, then fades out.

## Technical format (strict)
- 1920×1080, 30 fps. Each clip is a **separate file**, named by its ID (for example `E2-03_pile-vs-memory`).
- **Background:**
  - Preferred: a transparent background (alpha channel), for example ProRes 4444 or WebM with alpha.
  - If transparency isn't available: pure flat #000000 everywhere outside the graphics. No gradient, no vignette, no film grain, no glow bleeding into the background. The editor will use a Screen or luma-key blend, so any non-black background pixel shows up over the footage.
- **Clip structure:** every clip has four phases.
  1. **IN** (0.5 s): elements fade and scale in from 96% to 100%.
  2. **BUILD** (the duration given per clip): elements animate in, in a clear reading order.
  3. **HOLD** (at least 12 s): the finished state, with only subtle ambient motion (a slow pulse on the main element, light-dots drifting along existing lines). The hold must **loop seamlessly**, so the editor can extend it to any length.
  4. **OUT** (0.5 s): everything fades out together.
- **Also deliver** a single still PNG of each clip's finished HOLD frame, for thumbnails and the description.

## Layouts
Every clip uses one of these layouts. It's named per clip.

- **SIDE:** the presenter sits on the left. All graphics stay inside the **right 55%** of the frame (x from 860 to 1860 px, y from 90 to 940 px). Nothing at all in the left 45%.
- **FULL:** a full-frame cutaway when the camera cuts away. Use the whole frame, but keep the bottom 12% clear for platform captions, and keep a 280×280 px area in the bottom-left corner clear for a presenter bubble.
- **LOWER:** a lower-third bar for short labels. Place it between 70% and 86% of the frame height, starting at x = 120 px. Maximum width 900 px. Thin white rule above, text below.
- **CHIP:** a small label in the top-left corner (x 80, y 70), for time stamps and section labels.

## Visual style (strict, matching the series)
- **Black, white and greys only:** #FFFFFF, #CCCCCC, #888888, #444444, #1A1A1A (and #000000 only if there's no alpha). No colour anywhere.
- **Emphasis** comes from contrast, scale, weight and motion.
- **Visual grammar:**
  - MEMORY / MY STUFF = solid, filled white shapes and glowing white dots. The memory "core" is a solid white circle.
  - AI = outlined, hollow shapes (thin white strokes, never filled).
  - FLOW = small white points of light travelling along thin lines.
  - THE LOOP = a circular arrow.
- **THE CYBORG FIGURE:** a single head-and-shoulders human figure, drawn as a thin grey outline (#888888, 3 px stroke). Simple and geometric, with no face details. It can carry three parts:
  - MEMORY: a solid white circle in the chest
  - AI: a thin outlined ring at the head, never filled
  - LEARNING: white circuit lines joining the head ring and the chest core in a closed loop
- **Typography:** one clean geometric sans serif (Inter, Helvetica Neue or similar).
  - Labels: uppercase, letter-spaced, at least 28 px.
  - Keywords: at least 44 px.
  - Headline words: at least 64 px.
  - At most 12 words on screen in any clip: the presenter does the talking.
- **Everyday, friendly tone.** The audience is non-technical. No code, no field names, no technical jargon on screen. Simple line icons only (a note, a key, a plug, a coin, a calendar, a person).
- No real logos, product names, stock footage, robots, clip-art people, or invented numbers or statistics.
- **Motion:** smooth ease-in-out, calm and deliberate. Nothing flashes. Nothing moves fast during HOLD.

## Recurring clips (used in every episode)

### G-01 Title sting (FULL, about 3 s, no HOLD)
A white ring draws itself almost all the way round, then "CYBORG MIGRATION" appears in the centre with "#N — <EPISODE NAME>" beneath it in grey. A small three-segment "MIGRATION" bar sits underneath, showing the episode's starting state. The whole thing fades out at the end.
Render five versions:
| Version | Text | Bar |
|---|---|---|
| a | "#1" | 0/3 |
| b | "#2 — MEMORY" | 0/3 |
| c | "#3 — PROCESSING" | 1/3 |
| d | "#4 — A DAY" | 2/3 |
| e | "#5 — THE LOOP" | 2/3 |

### G-02 Migration update (SIDE, BUILD 4 s)
The cyborg figure, centred in the SIDE area, with the MIGRATION bar under it. The new part appears on the figure, and the next bar segment fills with a soft white sweep. Text under the bar: "MEMORY ✓", "PROCESSING ✓" or "LEARNING ✓".
Render four versions:
- **a)** 0/3 → 1/3: the core appears in the chest.
- **b)** 1/3 → 2/3: the ring docks at the head.
- **c)** 2/3, no change: the bar pulses gently, with the text "PRACTICE WEEK".
- **d)** 2/3 → 3/3: circuit lines close the loop, and the ring around the figure closes.

### G-03 Comment prompt (LOWER, BUILD 1 s)
A thin white rule, then the text, then a small downward chevron that bobs gently during HOLD. The text for each episode is given in that episode's file.

### G-04 Homework card (SIDE, BUILD 3 s)
A small label, "THIS WEEK", then up to three short lines that appear one by one, each with an empty checkbox outline. The text for each episode is given in that episode's file.

### G-05 Screen frame (FULL, static, HOLD only)
A thin white 2 px rounded-rectangle frame (x 80–1840, y 60–960), with a black area outside it. It's used as a container for screen recordings: the editor places the recording inside it. Leave the bottom-left presenter-bubble corner clear. Also deliver a version with a circular 260 px bubble outline in the bottom-left corner.

### G-06 Next-episode end card (FULL, BUILD 2 s, HOLD 20 s)
Left half: "NEXT" (small label) and the next episode's name, large. The right third stays empty for platform end-screen elements. A faint ring pulses in the background.
Render four versions, one for each next episode: "#2 MEMORY", "#3 PROCESSING", "#4 A DAY", "#5 THE LOOP". Also render a fifth version, "WATCH THE WHOLE MIGRATION", with the complete figure.
