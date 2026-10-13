# Cyborg Migration: Voiceover Script

This is the voiceover for `claude-design-presentation-prompt.md`. Each slide takes about 25–35 seconds to read. Trim or extend the HOLD in the edit to fit.

Name the real tools in the voiceover and the video description only. The visuals stay generic, so the video doesn't date when the tools change.

**Description and pinned comment, stack used:** Claude (the AI client), MCP connectors, and a self-hosted Teable database ("cybernetics-data", base `data-centre`). The same approach works with any MCP-capable AI client and any database you own.

---

**01: Hook and title**
"AI-native is becoming the baseline. I don't mean using a chatbot now and then. I mean running how you think and work through AI, on top of data you own. I call that process a cyborg migration, and this video shows you exactly how I'm doing mine."

**02: Where I was**
"Here's where I started. Notes in five apps. Bookmarks I never reopened. I'd fix a server problem, and a year later I'd have no idea how I fixed it. I couldn't tell you where my money went last quarter. Every January I'd set goals, and by March they'd gone quiet. Nothing connected, so nothing improved."

**03: The stakes**
"Here's why this matters right now. AI makes output cheap, so anyone can generate a plan, a report or some code. That's no longer an edge. What can't be copied is your own record: your decisions, what you know, and what you learned the hard way, stored somewhere AI can actually use it. And that record compounds. Someone who starts capturing it today gets a little better every week. Someone who doesn't stays flat. The gap between them doesn't stay the same, it widens. That's why I think this isn't optional anymore."

**04: The AI trap**
"But just using AI more doesn't close that gap. Ask a model about your life without your data, and you get advice that sounds right but is generic. And when you do give it context, it often lives in that one assistant's memory: you can't see it, you can't structure it, and you can't take it with you. Computing power without data is a dispenser of hallucinations."

**05: What a cyborg is**
"So what do I mean by cyborg? Not implants. A mind extended by systems. It has three parts: a memory that lasts, processing I can plug in, and a learning loop that makes the whole thing better over time. Those three parts are my three principles: data first, AI agnostic, and closed loop."

**06: Part 1, memory**
"Part one is memory. Everything goes into one database that I own: goals, projects, tasks, knowledge, people, money, the frameworks I think with, and a log of what happened. Some of it is facts, like what I spent and what I finished. Some of it is now, like what's active and what's planned. One record, not rented."

**07: My setup, the shape**
"This is my real base. I call it data-centre. Goals hold projects, and projects hold tasks. Knowledge, meaning my how-tos, runbooks and notes, links to all three, so every piece of work records what information it relied on. On the sides are contacts and six finance tables. Every table has the same basic shape: a title, a free-text context, timestamps, and an active flag. That consistency is why any AI can read it without special setup. I run it on Teable, and Claude connects to it through MCP."

**08: My setup, built-in loops**
"And this is the detail I care about most. A project can't just jump from in-progress to done. It has to go through reviewing, validating and testing, because review is a state in the workflow, not a good intention. Every step writes to an audit log, whether I did it or an agent did. When a project finishes, it feeds the next goal."

**09: Part 2, processing**
"Part two is processing. AI is the processor, not the vault. Right now I use Claude, but the memory doesn't belong to it. If a better or cheaper model shows up tomorrow, I plug that in instead and nothing moves. And the same record can turn into a review, a plan, code, an image or a video script, depending on which model fits the job."

**10: A day, as conversations**
"Day to day, this is what it looks like. I just ask. 'How much did I spend on food in six months?' 'How did I set up that server last year?' 'Plan my week around my goals.' Behind each question, a skill reads the right tables, applies my framework, writes the result back, and logs it. Captured, guided, tracked, and I didn't have to file anything by hand."

**11: Part 3, learning**
"Part three is the loop, and this is where the compounding from the start of the video actually comes from. Every week I review what happened, from the real record rather than from memory. What worked becomes a framework. What went wrong becomes knowledge. Week one feeds week two, and week two feeds week three. Mistakes become memory."

**12: What changed for me**
"Here's what that's given me. A morning brief that builds itself. Answers about money in seconds, not an afternoon in a spreadsheet. I never solve the same problem twice. My goals are actually connected to what I do each day. And any dashboard I want is one question away."

**13: Before vs. after**
"So the shift is this. Open loops become closed loops. Ten apps become one record. Skipped reviews become reviews built from facts. Forgotten know-how compounds. And quietly falling behind becomes getting better every week."

**14: Lean and safe**
"It's also much simpler than it sounds. There's no app to build, no codebase to maintain, and no vendor holding my memory. It's an AI client and a database I own. Access goes through tokens I control, and sensitive areas like money are scoped separately. I can revoke access any time."

**15: Start your migration**
"I'm not going to quote you productivity numbers. The honest answer is that after four weeks you'll have your own data to judge it by, and that's the point. Week one, set up your memory: goals, tasks and knowledge. Week two, add two skills, one for capture and one for a weekly review. Week three, run your days through it. Week four, do your first real review. The gap compounds, so start this week. I'm documenting my whole build in this series, so follow along."
