The workflow is live. Summary:

  Workflow: "Form Submission → Person (UTM capture)" (active)
  - Trigger: Webhook, POST, no authentication required (open endpoint — see note below)
  - Step: Upserts a person record, matched by email (Twenty's built‑in duplicate check on emailsPrimaryEmail), setting name, email, and the five UTM fields

  Expected payload your form/form-tool needs to POST:
  {
    "email": "jane.doe@example.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "utm_source": "google",
    "utm_medium": "cpc",
    "utm_campaign": "fall_promo_2026",
    "utm_term": "crm software",
    "utm_content": "ad_variant_a"
  }

  Field names are mapped 1:1 — if your form tool sends different keys (e.g. camelCase utmSource instead of utm_source), tell me and I'll adjust the mapping.

  To get the actual webhook URL: open the workflow in Twenty (Settings → Workflows → "Form Submission → Person (UTM capture)"), click the webhook trigger
  node — it shows a "Copy URL" action. That URL isn't exposed through this MCP interface.

  Two things worth flagging:
  1. No auth on the endpoint — anyone with the URL can POST fake leads. I can add API_KEY authentication if you want it locked down.
  2. Behavior is last-touch, not first-touch — every submission overwrites the UTM fields on that person. If you want true first-touch (keep the original
     campaign even on repeat submissions), I'd need to add a lookup step that only sets UTM fields when they're currently empty — happy to add that if you
     want it.

Instrucstion page:
https://crm.avarile.com/settings/playground/rest/core/description/introduction

---

## Update 2026-10-13 — workflow v2 (registration fields)

v2 is ACTIVE (v1 archived). Webhook URL is unchanged:
`https://crm.avarile.com/webhooks/workflows/7ef3a131-d515-4fb7-90f4-84623f7f542f/8ac3d58a-d4ec-43ce-8d6a-dc44ade13ffd`

New custom fields on Person (all nullable, created for the /register form):

| Payload key         | Person field        | Type         | Values                                                        |
| ------------------- | ------------------- | ------------ | ------------------------------------------------------------- |
| `jobTitle`          | `jobTitle` (std)    | TEXT         |                                                               |
| `company`           | `signupCompany`     | TEXT         | as typed; the company relation still comes from email domain  |
| `persona`           | `persona`           | SELECT       | FREELANCER, FOUNDER, RESEARCHER, STUDENT, SMALL_TEAM          |
| `teamSize`          | `teamSize`          | SELECT       | SOLO, TEAM_2_10, TEAM_11_50, TEAM_51_PLUS                     |
| `interestedModules` | `interestedModules` | MULTI_SELECT | array of DATA_CENTRE, PROJECTS, CRM, AGENTS                   |
| `useCase`           | `useCase`           | TEXT         |                                                               |
| `referralSource`    | `referralSource`    | SELECT       | SEARCH, SOCIAL, WORD_OF_MOUTH, BLOG, GITHUB, OTHER — omit if unanswered (never send "") |
| `marketingOptIn`    | `marketingOptIn`    | BOOLEAN      |                                                               |
| `landingPage`       | `landingPage`       | TEXT         |                                                               |
| `referrer`          | `referrer`          | TEXT         |                                                               |

Example payload:

    {
      "email": "jane.doe@example.com", "firstName": "Jane", "lastName": "Doe",
      "jobTitle": "Head of Ops", "company": "Acme",
      "persona": "FOUNDER", "teamSize": "TEAM_2_10", "interestedModules": ["DATA_CENTRE", "CRM"],
      "useCase": "keep client notes and tasks in sync", "referralSource": "SEARCH", "marketingOptIn": true,
      "landingPage": "/register", "referrer": "https://www.google.com/",
      "utm_source": "google", "utm_medium": "cpc", "utm_campaign": "fall_promo_2026",
      "utm_term": "crm software", "utm_content": "ad_variant_a"
    }

Still last-touch on the CRM side: a repeat submission overwrites every field. The form keeps first-touch
UTMs per browser (localStorage).
