# How to achieve AI Native Company and How AI can help with efficiency increase

## Principles

1. Data first, AI second: Calculation power without solid foundation of data governance is a dispenser of hallucinations. Which produce lots of looks pretty generations.
2. AI Agnostic: Not bound to a specific platform, also means our data is not on any LLM platform.
3. Aiming on Intelligent Close-loop processes building: Create self-improving intelligent close-loop processes to accuminate experiences, business related data, and feedbacks to improve those processes overtime, and enable benefits from the mistakes.

## Designs to execute / achieve the Principles

1. Data first:

- Create Centralized Data Warehouse(for what has happened, facts) and Dynamical Operational Database(for constantly updating operational related info).
- Use LLM as operational layer of the company, so decisions, workflows and processes flow through an agentic data pipeline, and benefits from the 3 major ways as follows:
  a. All data from the planning, knowledge inputs, SOP drafting, issues solving, to result validation, and improvements design are captured, and stored in a centralized database, this is the accumination of data.
  b. Depending on the processes and workflow, agentic suggestion, data processing and analysis will be an natural part of the process, which will greatly increase the productivity over time and data accumintation. Force users to conform to a regulated / templated way of thinking.
  c. Everything will be tracked, which can be used as foundations for future agentic system improvements.

2. AI Agnostic:

- Separate the data persistence from the LLM Providers, so migrating from one provider to another will be no issues, also enable usage of multiple LLM Providers due to different kind of requirements, for example, the same data can be used to generate code base, also can be used to create images, videos and advertisements.

3. Aiming on Intelligent Close-loop processes building:

- In the past, due to complexity and amount of works involved, even with companies running comprehensive project management system (like Jira, Trelo, Asana or Wrike -- which is we are using right now), most of our process management is open loop kinda-of process. And the OS type of Agentic access will record everything, so basically we have a single source of truth of what happened, what going on, and based on those info, how can we move forward on very specifics.

## Executions & Interactions & Design

1. As lean as possible: 

- Only Claude(or any other LLM provider in the future depending on the use case), and the data base is needed. We do not have to manage any codeRepo, application, service or any data regulation / governance a new platform is going to cause us. As data resides on our own database and connected through connectors, each user's access is based on their own access control.
- Can expanding very quickly and safely through skills, which is the current main stream of agentic processing, and very easy to learn.
- Least data exposure, and all access is regulated through personal access token, the data sharing is quick safe.

2. Through Skill calling, Most of the daily operations can be done through typing or talking to the Claude / ChatGPT / Muse or whatever LLM Providers we want to interact with, through structured data join, we can easily linking Knowledge, Projects, Tasks, Contacts, Costs... into one combined piece when we dealing with any tasks, and we do not have to worried about do it manually during operations, everything will happen automatically and record the process automatically. 

## Use Cases:

1. Project / Task planning
2. Weekly Report can be automatically generated based on iterable templates or skills
3. PDCA like experiences accumination when a project or a project stage is done, as chain of events is already stored in the system (Who did what, when, what info/data is taken into consideration, results)
4. Everything(As long as we have data in the database) can be visualized easily through Claude Artifacts. 
5. Safe to share, easy to manage.
