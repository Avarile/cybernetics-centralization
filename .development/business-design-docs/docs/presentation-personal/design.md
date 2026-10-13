# Cyborg Migration: Presentation Design (Draft v2)

Design for the personal edition. It is built on the same three principles as `docs/presentation-company/`, but it's made for **online viewers** and is presented by **me as a content creator**, using **my real setup (cybernetics-data)** as the worked example.

Once this design is agreed, it becomes three files:

- `claude-design-presentation-prompt.md`: the animated slide-show I talk over, as a long-form video with voiceover or face-cam
- `presentation-speaker-notes.md`: my voiceover script
- `claude-design-video-prompt.md`: a standalone explainer of about 150 s with captions only (for social, works with the sound off)

Source material: `Personal-migration-towards-AI-native`, plus the live schema of my cybernetics-data base.

---

## 1. The thesis: why this isn't optional

**Becoming AI-native is now a requirement for staying competitive, not a hobby.** This is the spine of the whole video, and every slide either raises the stakes or answers them.

The argument is about compounding, so it needs no statistics:

- AI makes output cheap. Anyone can generate a report, a plan or some code. Generic output stops being an advantage.
- What can't be copied is **your own record**: your decisions, your know-how, and your lessons, all readable by AI. Only someone who has been capturing them has that.
- That record **compounds**. Each loop makes the next one better, so the gap between someone who migrates and someone who doesn't widens every week. Starting later means being further behind, not just starting later.
- Using AI the wrong way (with rented memory and no data of your own) doesn't close the gap. It only makes you look busy.

**The stakes line** (used on screen and in the voiceover): "The gap compounds. So does the advantage."

The thesis appears in four places:

| Where | How |
|---|---|
| 01 Hook | The question that opens the video frames this as a necessity |
| 03 The stakes (new slide) | Two figures and two curves: one migrates, one doesn't, and the gap widens |
| 11 Closed loop | Compounding is the mechanism behind the advantage |
| 15 Close | "The gap compounds. Start this week." |

Tone guard: this should be urgent, not fear-mongering. There's no "AI will take your job" and no doom imagery. The message is "this is the new baseline, and here's exactly how to meet it."

---

## 2. The idea: what "cyborg" means here

Not implants. A cyborg is a person whose thinking is extended by systems outside the body. Becoming one is a **migration**: you move pieces of how you think into durable, owned systems, one piece at a time.

The three principles map onto the three parts of a cyborg:

| Principle | Cyborg part | What it is in practice |
|---|---|---|
| Data first | **Memory** | One database I own: goals, projects, tasks, knowledge, people, money |
| AI agnostic | **Processing** | Any model reads and writes that memory. Models are swappable parts. |
| Closed loop | **Learning** | Every week and every project feeds back into memory, so I improve with each lap |

**Core line:** "My memory. Any mind. Closed loops."
(A personal take on the company line, "Our data. Any AI. Closed loops.")

**Title:** "Cyborg Migration"
**Subtitle:** "Becoming AI-native, one system at a time"

---

## 3. Audience and goal

| | Company edition | Personal edition |
|---|---|---|
| Audience | Management, in a room | General public, online: curious about AI, mostly non-technical, some builders |
| Presenter | Live, in the room | Me: voiceover or face-cam over the slides, edited |
| Why act | No visibility into repeated costs | Staying competitive: AI-native is becoming the baseline, and the gap compounds |
| Goal | Approve a pilot | Viewers start their own migration this week, and follow and subscribe for the build series |
| Proof | None yet | My real system, shown as a structure diagram |
| Tone | Business case | Personal, honest, curious. A build log, not a hype reel. |

What online viewing changes:

- **Hook in the first 10 seconds.** Slide 01 opens on a question, not a title card.
- **Chapters.** Each slide is a chapter marker, and the slide counter doubles as the chapter number.
- **Mobile-legible.** Viewers watch on phones, so the minimum text size goes up (headlines 72px, keywords 40px) and there are at most about 18 words per slide.
- **Caption-safe area.** Nothing important sits in the bottom 12% of the frame, where platform captions appear.
- **Face-cam safe zone.** Keep the bottom-left 25% × 30% of the frame clear on every slide, so a face-cam bubble can sit there.
- **Thumbnail frame.** Slide 01's held frame works as a thumbnail: the figure, the half-built core, and the word "CYBORG".

---

## 4. Visual system

Kept from the company edition so both read as one series:

- Black, white and greys only (#000000, #FFFFFF, #1A1A1A, #444444, #888888, #CCCCCC)
- One geometric sans serif, with small uppercase letter-spaced section labels
- **MEMORY / MY DATA** = solid white shapes and glowing dots. The core is a solid white circle.
- **AI MODELS** = outlined, hollow shapes labelled "MODEL A", "MODEL B", "ANY FUTURE MODEL"
- **DATA FLOW** = points of light along thin lines
- **THE LOOP** = a circular arrow that stays open until the "closed loop" slide and is closed after it
- Each slide has a BUILD phase (6–10 s) and a HOLD phase (20 s), with 1 s transitions, a slide counter in the bottom right, and no music

New for this edition, **the cyborg figure** is the through-line:

- A single outlined human figure (head and shoulders, thin grey stroke) appears on slides 01, 02, 03, 05, 06, 09, 11, 14 and 15.
- **Migration progress:** each principle adds one solid white part to the figure.
  - Data first: a solid core appears in the chest (MEMORY).
  - AI agnostic: an outlined ring docks at the head (PROCESSING). It can be swapped, so it's never filled.
  - Closed loop: thin white circuit lines connect the head and the core in a ring (LEARNING).
- A small three-segment bar under the figure reads "MIGRATION 1/3 → 2/3 → 3/3". By slide 15, the figure is complete.

**Real setup slides (07, 08):** these are drawn as clean schema diagrams in the same palette, not as screenshots. They show table names and links only, never record contents. Optionally, I record my own screen captures as B-roll and blur any values.

---

## 5. My real setup (from cybernetics-data)

What the base actually contains. These names appear on screen as the "real" example.

**Base:** `data-centre`

| Area | Tables | Role in the story |
|---|---|---|
| Direction | `goals` → `projects` → `tasks` | Goals hold projects, and projects hold tasks. Tasks carry a progress state, a priority, started and finished times, and an owner. |
| Memory | `knowledges` + `knowledge_type` | How-tos, runbooks and notes, as a tree (parent and child entries) with cross-links between related entries |
| People | `contacts`, `companies`, `contact_type`, `contact_profession` | Who I work with, and who leads or does what |
| Money | `finance_Transactions`, `Accounts`, `Categories`, `Payees`, `Tags`, `Budgets` | Facts about spending, plus budgets as the plan |
| My standards | `project_frameworks` (goal-management, project-management, meeting-strategy, conversation-strategy, business-management) | The templated way of thinking the AI applies |
| The record | `auditlog` | What was done and by whom (me or an agent) |
| Self-description | `table_references`, `system_info`, `system_status` | The base explains its own structure to whatever AI connects to it |

Design features worth calling out on screen:

1. **Every table has the same shape:** a title, a context field (markdown), created and updated timestamps, a soft-delete date, and an active flag. That uniformity is why any model can read it without per-table training.
2. **Everything links:** goals, projects and tasks all point to the knowledge they relied on (`refer_knowledge`). That is the "based on which information" link in the closed loop.
3. **The loop is built into the states:** project progress runs backlog → preparing → initiated → in-progress → finished-reviewing → finished-validating → finished-testing → finalized. Review and validation are states in the workflow, not optional extras.
4. **Facts vs. now:** transactions, the audit log and finished tasks are facts (what happened). Goals, active projects, tasks and budgets are operations (what's happening now).
5. **Skills on top:** separate skills handle knowledge, finance, and project management (goals as OKRs, projects as PDCA), plus a morning brief. Each one is a plain-language entry point into the same base.

Must never appear on screen: values from `system_info` (it holds access tokens), any knowledge entries that store credentials, real transaction amounts, payee names, or contact details. The diagrams show structure only.

---

## 6. Slide outline: 15 slides, about 7.5 minutes

There are three more slides than the company edition: 03 (the stakes) and 07–08 (my real setup). On-screen text is a draft. Final wording gets locked in the prompt file.

**01 / 15: Hook and title**
The figure outline fades in, mostly empty. The ring draws itself almost closed.
- First line (2 s): "AI-native is the new baseline. Are you?"
- Second line (2 s): "What if your mind had a database?"
- Then: "CYBORG MIGRATION" / "Becoming AI-native, one system at a time"
- Migration bar: 0/3

**02 / 15: Where I was** (BEFORE)
Grey fragments drift away from the figure: note apps, bookmarks, bank screens, calendar blocks, chat threads. The PLAN → DO → … arrow fades out before it closes.
- Headline: "Open loops"
- Keywords: "Solved it once, forgot how" · "Where did the money go?" · "Goals fade by March"
- Bottom line: "I couldn't improve what I didn't capture."

**03 / 15: The stakes** (WHY NOW)
Two outlined figures stand side by side at the same height. Each one walks a loop. The left figure's loop stays open, and it stays flat and grey. The right figure's loop closes, and its core and ring grow brighter with each lap. A thin line under each figure traces its trajectory: the left one is flat, the right one curves upward. The space between them is labelled "THE GAP" and widens with each lap. No numbers and no axes, only the shape.
- Headline: "The gap compounds"
- Keywords: "AI makes output cheap" · "Your record can't be copied" · "Every week you wait, it widens"
- Bottom line: "AI-native isn't an edge. It's the new baseline."

**04 / 15: The AI trap** (THE RISK)
Two columns.
- Left: a model answers with a generic card that crumbles. Caption: "Generic answers"
- Right: my history is pulled into an "ASSISTANT MEMORY" box, and a lock clicks shut. Caption: "Rented memory"
- Headline: "Using AI isn't enough"
- Quote: "Computing power without data is a dispenser of hallucinations."

**05 / 15: What a cyborg is** (THE IDEA)
The figure is centred, and three labelled parts appear on it as outlines only: MEMORY (chest), PROCESSING (head), LEARNING (the ring between them).
- Headline: "Cyborg = extended mind"
- Keywords: "Memory · Processing · Learning" → "Data first · AI agnostic · Closed loop"

**06 / 15: Part 1, memory (data first)** (MIGRATION 1/3)
The core turns solid in the figure's chest. Nodes connect around it: GOALS, PROJECTS, TASKS, KNOWLEDGE, PEOPLE, MONEY, FRAMEWORKS, LOG. The core splits into two layers: "FACTS: what happened" and "NOW: what I'm doing".
- Headline: "Memory I own"
- Keyword: "One record. Not rented."

**07 / 15: My setup, the shape** (MY SETUP)
A clean schema diagram: goals → projects → tasks down the centre, with knowledges linked to all three. Contacts sit on one side, and the finance cluster (six small boxes) on the other. Frameworks and auditlog sit at the bottom. A callout highlights one table's common fields: title · context · created · updated · active.
- Headline: "My real base: data-centre"
- Keywords: "Same shape, every table" · "Everything links to what it relied on"

**08 / 15: My setup, built-in loops** (MY SETUP)
The project progress states lay out as a path, and the final state bends back to the start: backlog → … → reviewing → validating → testing → finalized, with an arrow back to the next goal. The auditlog gains a dot at each step.
- Headline: "Review is a state, not a wish"
- Keyword: "Every step leaves a trace"

**09 / 15: Part 2, processing (AI agnostic)** (MIGRATION 2/3)
Outlined rings dock at the figure's head ("MODEL A", "MODEL B", "ANY FUTURE MODEL"), connect to the core, then undock. The core never changes. One record fans out to REVIEW, PLAN, CODE, IMAGE and VIDEO.
- Headline: "Swap the mind. Keep the memory."
- Keyword: "AI is the processor, not the vault."

**10 / 15: A day, as conversations** (IN PRACTICE)
A chat box types three real-style prompts, one after another:
1. "How much did I spend on food over 6 months?"
2. "How did I set up that server last year?"
3. "Plan this week around my goals."

Under each prompt, a step trail ticks off: Read → Apply framework → Write → Log.
- Tags: "CAPTURED" · "GUIDED" · "TRACKED"
- Headline: "Life admin is a conversation"

**11 / 15: Part 3, learning (closed loop)** (MIGRATION 3/3)
Circuit lines close a ring between the head and the core. PLAN → DO → CHECK → ACT goes round three laps, labelled "WEEK 1", "WEEK 2" and "WEEK 3". The ring thickens with each lap, and the core grows.
- Headline: "Close the loop"
- Keywords: "Every week feeds the next" · "Mistakes become memory"
- Callback to 03: the trajectory line from the stakes slide reappears under the figure and curves upward. "This is the compounding."

**12 / 15: What changed for me** (OUTCOMES)
Five tiles:
1. "Morning brief, auto-built"
2. "Spending, answered in seconds"
3. "Know-how, never re-learned"
4. "Goals linked to tasks"
5. "Dashboards on demand"
- Headline: "Clarity without effort"

**13 / 15: Before vs. after** (THE SHIFT)
| Before | Cyborg |
|---|---|
| Open loops | Closed loops |
| Notes in ten apps | One personal record |
| Reviews skipped | Reviews from facts |
| Know-how forgotten | Know-how compounds |
| Memory rented from an app | Any AI, my data |
| Falling behind quietly | Compounding every week |

**14 / 15: Lean and safe** (WHY IT'S SIMPLE)
The "NEW APP", "CODEBASE" and "VENDOR MEMORY" boxes cross out. The figure remains, with one outlined model and the core. Key icons each light only their own segment, and the MONEY segment has its own key.
- Headline: "Just AI + my database"
- Keywords: "My keys" · "Scoped access" · "Nothing to maintain"

**15 / 15: Start your migration** (YOUR MOVE)
The figure is complete: solid core, model ring and closed circuit loop. The migration bar reads 3/3. A 4-week timeline sits beside it:
- "Week 1: Memory: goals, tasks, knowledge"
- "Week 2: Skills: capture + weekly review"
- "Week 3: Live: run your days through it"
- "Week 4: Loop: your first review"
- Headline: "Start your cyborg migration"
- Line above the timeline: "The gap compounds. Start this week."
- Small line: "Follow the build series"
- Hold: rest on this frame (it doubles as the end-screen area for platform cards)

---

## 7. Companion explainer (about 150 s, standalone)

This mirrors the 8 scenes of `docs/claude-design-video-prompt.md`, captions only, so it works with the sound off. It ships in 16:9, plus a 9:16 cut for short-form platforms.

1. **The hidden cost (0:00–0:15):** fragments drift away from the figure. Caption: "Solved it once. Forgot how." through "I can't improve what I don't capture."
2. **The stakes and the trap (0:15–0:33):** two figures, and the gap between them widens. Captions: "AI makes output cheap." "Your own record can't be copied." "The gap compounds." Then the trap: generic answers crumble, and memory gets locked in an assistant.
3. **Memory (0:33–0:51):** fragments condense into the core inside the figure (1/3).
4. **Processing (0:51–1:09):** models dock and undock at the head, and the core never changes (2/3).
5. **My setup (1:09–1:33):** the data-centre schema draws itself, and one prompt runs Read → Apply → Write → Log.
6. **Clarity (1:33–1:51):** a montage: the morning brief assembles, a spending chart renders, a knowledge tree expands.
7. **Learning (1:51–2:09):** the loop closes and goes round three laps (3/3). The trajectory curves upward. Caption: "Every week compounds."
8. **End card (2:09–2:30):** the complete figure, "Cyborg Migration", "My memory. Any mind. Closed loops.", then "AI-native is the new baseline. Start your 4-week migration."

---

## 8. Voiceover direction

- Open with the stakes, not the tech. The first 30 seconds argue that this is necessary. The rest of the video shows how.
- Frame it as urgency without fear: "this is the new baseline", never "AI will take your job". Back it with the compounding logic, not with statistics.
- First person throughout: "This is how I run my life on it", not "you should".
- The honest close mirrors the company edition. I won't claim productivity numbers. Instead: "After four weeks you'll have your own data to judge it by, and that's the point."
- Name the real stack in the voiceover only if I choose to (see question 1). The visuals stay vendor-neutral either way, so the video doesn't date.
- Say the privacy point plainly: the money and the credentials stay in my database, behind my keys, and the AI only gets in through tokens I control.

---

## 9. Decisions (resolved 2026-10-13)

1. **Product names:** named in the voiceover and the video description only (Claude, MCP, Teable). The visuals stay generic. The creator's own schema names (`data-centre` and the table names) are allowed on screen.
2. **Showing data:** structure-only diagrams on slides 07–08, with no screen captures of real data.
3. **Short-form:** the 9:16 cut of the 150 s explainer covers short-form. There is no separate vertical cut of the deck.
4. **Core line:** "My memory. Any mind. Closed loops."

Output files: `claude-design-presentation-prompt.md`, `presentation-speaker-notes.md`, `claude-design-video-prompt.md`.
