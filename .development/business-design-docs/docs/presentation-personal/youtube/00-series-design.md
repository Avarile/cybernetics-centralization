# Cyborg Migration: YouTube / Bilibili Series Design (Videos 1–5)

This is the design for the first five long-form videos, written in English and published on both YouTube and Bilibili. I'll translate them myself. It builds on `../design.md` (the thesis, the cyborg framing and the visual system) and reuses the animated deck and explainer as cutaway material.

Scripts:

| # | File | Working title | Length |
|---|---|---|---|
| 1 | `ep01-the-plan.md` | I'm Turning Myself Into a Cyborg. Here's the Plan. | ~9 min |
| 2 | `ep02-memory.md` | Your Notes Aren't Memory. Here's What Is. | ~9 min |
| 3 | `ep03-processing.md` | Use Any AI Without Giving It Your Life | ~9 min |
| 4 | `ep04-a-day.md` | I Ask, It Remembers: A Real Day Running My Life Through AI | ~9 min |
| 5 | `ep05-the-loop.md` | The Loop: How My Life Gets a Little Better Every Week | ~10 min |

---

## 1. Who's watching

**Normal people, not techies.** Office workers, students, freelancers, parents: anyone who uses a chatbot now and then and has a vague feeling they should be "doing more with AI". Most have never touched a database, and many won't know what an API is. They will churn the moment the video looks like a programming tutorial.

What that means for every script:

- **Outcomes first, mechanics second.** Show what it does for a life (no more lost fixes, money questions answered, goals that don't fade) before showing how it works.
- **Everyday analogies.** Memory is "one organised notebook that the AI can read". The connector is "a plug, like USB". An access token is "a key you can take back". A skill is "a saved recipe". The audit log is "a diary of what got done".
- **Technical words appear once, with a translation, then get dropped.** For example: "It's technically called a database, but think of it as one very organised notebook." Never field names, never code.
- **Demos show using, not building.** Viewers see questions asked and answered, and records appearing. The setup is shown as "here's the template, it takes ten minutes", not click by click.
- **The template download is a side note.** One line in videos 2 and 3 and a link in the description. It's for the few who want it. The video must work fully for someone who never sets anything up.
- **Relatable examples.** Lost fixes (a broken router, a tax form, the thing you Googled last year), money, goals that fade, preparing to meet someone, remembering what you promised people.

**The thesis, in normal-people language:** "Everyone has AI now. What makes the difference is whether your AI knows *your* life. And the people who start building that now pull further ahead every week."

---

## 2. Series concept

**Promise to the viewer:** "Watch me become AI-native, and do it alongside me, no tech skills needed."

**The arc:** video 1 makes the case. Videos 2–5 each cover one week of a 4-week migration, so the series is the challenge:

| Video | Cyborg part | Challenge week | Viewer homework (no tech required) |
|---|---|---|---|
| 1 The Plan | Why, and the map | Week 0 | Write down 3 things you keep forgetting or redoing |
| 2 Memory | Memory (1/3) | Week 1 | Put your goals, plans and "how I fixed it" notes in one place |
| 3 Processing | Processing (2/3) | Week 2 | Connect an AI to that one place, and save two recipes |
| 4 A Day | Living on it | Week 3 | Run every day through it for 7 days |
| 5 The Loop | Learning (3/3) | Week 4 | Your first honest weekly review |

**Release cadence:** one video a week. The weekly cadence matches the weekly loop.

---

## 3. Recurring format, with me on camera

I'm on camera throughout. Talking to camera is the backbone of every video. Slides and screen recordings are cutaways that support what I'm saying, and I stay visible during them in a bubble or a side-by-side.

| Segment | Length | Shot | Purpose |
|---|---|---|---|
| **Cold open** | 0:00–0:30 | To camera, close | A relatable moment or result. No intro, no logo. |
| **Title sting** | 3 s | Graphic | The ring draws itself, then "CYBORG MIGRATION #N" and the migration bar |
| **Why this matters** | ~1 min | To camera, with deck cutaways | Ties the episode to the thesis |
| **The idea** | ~2 min | Side-by-side: me on the left, deck slide on the right | One simple concept, one analogy |
| **Show me** | ~3–4 min | Screen full-frame, me in a bubble bottom-left | The system in use, with real questions and real answers |
| **Migration log** | ~1 min | To camera, relaxed and honest | What I did this week, what went wrong |
| **Homework + next** | ~30 s | To camera | One small task, and a teaser for next week |

**Script markers:**
- **[CAM]**: I talk to camera.
- **[SIDE]**: side-by-side, me plus a slide or graphic.
- **[DEMO]**: screen recording on the demo base, with me in a bubble.
- **Clip: ID**: an overlay animation from `animations/` (generated in Claude Design). It replaces the earlier [DECK NN] references, which are kept in the scripts only as a description of the visual.
- **[YOU]**: fill in with true personal details only.

**On-camera style:** sitting, eye level, the same spot every episode (that consistency is part of the brand). Black or dark-neutral background to match the black-and-white visual system. Natural, conversational delivery, with short sentences that are easy to say. The scripts are written to be spoken, so paraphrase freely.

**Visual consistency:** cutaways use the deck's black-and-white system: the cyborg figure, solid shapes for memory and outlined shapes for AI. Screen recordings sit in a thin white frame on black. The migration bar appears in each title sting and migration log: 0/3, 1/3, 2/3, then complete in video 5.

---

## 4. Platform notes

Everything is in English. I translate titles, descriptions and subtitles for Bilibili myself.

- **YouTube:** titles formatted as `<title> | Cyborg Migration #N`. Thumbnails at 1280×720 with my face plus the white cyborg figure on black, and at most 3 large words. Chapters go in the description. End screen in the last 20 s. One vertical Short of 30–60 s per episode (each script names it).
- **Bilibili:** the same video and the same script, with my translated subtitles and title. The outro has a Bilibili-flavoured call to action: "like, coin and favourite" instead of "subscribe". The cover uses the YouTube thumbnail design, re-laid out to the uploader's cover ratio.
- **Comment prompts:** each script marks 1–2 moments that ask viewers to reply. On YouTube they go in the comments; on Bilibili they're on-screen replies (danmaku) or comments.

Shared tags: `AI`, `AI native`, `cyborg`, `second brain`, `productivity`, `life organisation`, `AI for beginners`, `ChatGPT alternative workflow`, `Claude`, `personal growth`.

---

## 5. Demo base: required before recording

Never screen-record the real `data-centre` base. It holds access keys, finances, contacts and possibly passwords.

Build a separate **`demo-centre`** with the same structure and **made-up, everyday data** that normal viewers recognise:
- **Goals:** "Get fit for summer hiking trip", "Save for a new laptop"
- **Projects and tasks:** "Fix home Wi-Fi for good", "Plan Mum's birthday", "Sort out tax return", spread across all progress stages
- **Knowledge:** "How I reset the router", "Tax deductions I can claim", "Best way to clean the coffee machine", "Mum's gift ideas", plus about 10 more
- **Money:** about 6 months of made-up spending in everyday categories (groceries, eating out, transport, subscriptions), plus 2 budgets
- **People:** 5 obviously fictional contacts (e.g. "Alex Demo")
- **Frameworks:** a few simple templates (weekly review, meeting prep, project review)
- **Log:** a few weeks of entries

Every demo moment in the scripts is marked [DEMO]. Personal stories and results are marked [YOU].

---

## 6. Production notes

- **Video 1** is mostly me to camera, with the 15-slide deck as cutaways.
- **Trailer:** the 150 s explainer (`../claude-design-video-prompt.md`) goes out the week before video 1, and gets pinned on the channel and posted as a vertical short.
- **No invented numbers** in any episode. The only numbers are counts from my own system that I can show, marked [YOU].
- **Product names:** said once, lightly, where it helps ("I use Claude, but this works with others"). Never the focus. The visuals stay generic.
- **The template** is mentioned once in videos 2 and 3, and linked in the description. It's optional.
