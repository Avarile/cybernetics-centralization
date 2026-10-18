# Cyborg Migration: Messaging Kit (v1, approved)

Work item: MARKETINGP-1. Every blog post, ad and social post in the campaign draws from this page. If a line isn't here, check it against the tone guards before using it.

Sources: `business-design-docs/Personal-migration-towards-AI-native`, `docs/presentation-personal/design.md` §1–3 and §8, `docs/presentation-personal/youtube/00-series-design.md` §1–2.

---

## 1. Campaign in one breath

**Campaign:** Cyborg Migration
**Subtitle:** Becoming AI-native, one system at a time
**Core line:** My memory. Any mind. Closed loops.
**Thesis:** AI-native is the new baseline. The gap compounds.
**Promise:** Watch me become AI-native, and do it alongside me. No tech skills needed.
**Primary CTA:** Start your 4-week migration → `avarile.com/register`

## 2. The argument (use in this order)

1. **AI makes output cheap.** Anyone can generate a plan, a report or some code. Generic output stopped being an edge.
2. **Your own record can't be copied.** Your decisions, what you know, what you learned the hard way, stored where AI can use it.
3. **That record compounds.** Every week you capture, the next week gets a little better. The gap between people who start and people who don't widens every week.
4. **Using AI more doesn't close the gap.** Without your data you get generic answers; with rented memory you get context you can't see, structure or take with you. *"Computing power without data is a dispenser of hallucinations."*
5. **So migrate:** one memory you own, any AI plugged into it, and a loop that learns.

In normal-people language: *"Everyone has AI now. What makes the difference is whether your AI knows **your** life. And the people who start building that now pull further ahead every week."*

## 3. The three parts of the cyborg

| Cyborg part | Principle | Plain-language line | Everyday analogy |
|---|---|---|---|
| Memory | Data first | One record of your life that you own. Not rented. | One very organised notebook the AI can read |
| Processing | AI agnostic | Swap the mind. Keep the memory. | A plug, like USB: any AI fits |
| Learning | Closed loop | Every week feeds the next. Mistakes become memory. | A diary you actually reread |

Supporting analogies (translate a technical word once, then drop it):

- database → "one very organised notebook"
- connector / MCP → "a plug, like USB"
- access token → "a key you can take back"
- skill → "a saved recipe"
- audit log → "a diary of what got done"

## 4. Before → after (for tables, carousels and comparison ads)

| Before | Cyborg |
|---|---|
| Open loops | Closed loops |
| Notes in ten apps | One personal record |
| Reviews skipped | Reviews from facts |
| Know-how forgotten | Know-how compounds |
| Memory rented from an app | Any AI, my data |
| Falling behind quietly | Compounding every week |

## 5. Approved hooks (headlines, ad lines, thumbnails)

Short (≤ 5 words, for creatives and thumbnails):

1. The gap compounds.
2. Your notes aren't memory.
3. Swap the mind. Keep the memory.
4. Close the loop.
5. Review is a state, not a wish.
6. Life admin is a conversation.
7. One record. Not rented.

Longer (headlines, first lines of posts):

8. AI-native is the new baseline. Are you?
9. What if your mind had a database?
10. I solved it once. Then I forgot how. Never again.
11. Use any AI without giving it your life.
12. I ask, it remembers.
13. Everyone has AI now. Does yours know your life?

## 6. Calls to action

| Context | CTA text | Notes |
|---|---|---|
| Primary (all pieces) | **Start your 4-week migration** | Button / end card |
| Lead magnet | Get the 4-week checklist | Delivered after signup (MARKETINGP-4) |
| Soft (top of funnel) | Follow the build | Video and social only; never the only CTA on a blog post |
| Bilibili | 一键三连 / like, coin and favourite + link in description | avarile translates |

Every blog post carries the CTA twice: one inline block after the "why it matters" section, and one signup card at the end.

## 7. UTM convention

Base: `https://avarile.com/register`

```
?utm_source=<platform>&utm_medium=<medium>&utm_campaign=cyborg-migration&utm_content=<piece-id>
```

| Param | Allowed values |
|---|---|
| `utm_source` | `blog`, `youtube`, `bilibili`, `linkedin`, `x`, `newsletter`, `reddit` |
| `utm_medium` | `blog` (own posts), `ad` (paid), `social` (organic posts), `video` (descriptions, pinned comments), `email` |
| `utm_campaign` | always `cyborg-migration` |
| `utm_content` | piece id: `blog-01`…`blog-05`, `ad-<hook>-<format>` (e.g. `ad-gap-1080sq`, `ad-notes-1080x1920`, `ad-swap-1200x630`), `vid-ep01`…, `short-ep01`… |
| `utm_term` | optional, paid search only |

Hook slugs: `gap`, `notes`, `swap`, `loop`, `review`, `convo`, `record`.
Format slugs: `1200x630`, `1080sq`, `1080x1920`, `1280x720`, `v15`, `v30`.

The /register form stores the first campaign a visitor arrives with (first touch) and sends it to the CRM with the lead.

## 8. Tone guards

Do:

- Write in the first person, as a build log: "This is how I run my life on it", not "you should".
- Be urgent and calm: "this is the new baseline, and here's exactly how to meet it".
- Put outcomes before mechanics: lost fixes, money questions answered, goals that don't fade.
- Use relatable examples: the router fix, the tax form, the thing you Googled last year, Mum's birthday.
- Say the privacy point plainly: my keys, scoped access, revocable at any time.
- Close honestly: "After four weeks you'll have your own data to judge it by."

Don't:

- Use fear: no "AI will take your job", no doom imagery.
- Invent numbers: no productivity percentages, no user counts, no "10x". The only numbers allowed are counts avarile can show from the system, marked [YOU].
- Write like a tutorial: no field names, no code, and no more than one technical word per paragraph, translated.
- Show real data: no values from `data-centre`, no amounts, payees, contacts or credentials. Use structure-only diagrams or `demo-centre` examples.
- Lead with product names. Name the stack lightly once (Claude, MCP, Teable) and add "works with others".

## 9. Boilerplate

**25 words:** Cyborg Migration is a build log about becoming AI-native: one memory you own, any AI plugged into it, and a weekly loop that learns.

**50 words:** AI makes output cheap. What can't be copied is your own record: your decisions, know-how and lessons, stored where any AI can use them. Cyborg Migration documents how I'm building mine: one memory I own, swappable AI, and a weekly loop that compounds. Start your own 4-week migration.

**Bio line:** Turning myself into a cyborg, one system at a time. My memory. Any mind. Closed loops.

## 10. Decisions (approved by avarile, 2026-10-14)

1. Canonical CTA domain: `https://avarile.com/register`.
2. "Cybernetics" (the product) is named on `/register` only. Campaign copy is about the method.
3. No [YOU] lines are quoted in ads. First-person stories stay in blog posts and videos.
