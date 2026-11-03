# Cyborg Migration: Launch Calendar (draft for avarile)

Work item: MARKETINGP-13 (owner: avarile). A starting point to edit, not a decision. One drop a week, so the cadence matches the weekly loop. Links come from `ad-copy.md`. Funnel reviews are MARKETINGP-14.

## Week by week

| Week of | Video | Blog (flip `draft: false`, build, deploy) | Ads / social | Funnel review |
|---|---|---|---|---|
| **2026-10-20** | Trailer: 150 s explainer + 9:16 cut (pinned) | — | Ad set A live: `gap` (LinkedIn, X, YouTube); LinkedIn post; X thread | — |
| **2026-10-21** | #1 The Plan | Blog 1 `blog-01` | Short `short-ep01`; video ads `ad-gap-v15/v30` (once rendered) | — |
| **2026-10-28** | #2 Memory | Blog 2 `blog-02` | Swap in `notes` creatives; Short `short-ep02` | Mon 10-27 (baseline) |
| **2026-11-04** | #3 Processing | Blog 3 `blog-03` | Add `swap` creatives; Short `short-ep03` | Mon 11-03 |
| **2026-11-11** | #4 A Day | Blog 4 `blog-04` | Keep the best 2 hooks from the review; Short `short-ep04` | Mon 11-10 |
| **2026-11-18** | #5 The Loop | Blog 5 `blog-05` | Retarget visitors who didn't register with the end card | Mon 11-17 |
| **2026-11-25** | — | — | — | Final summary (MARKETINGP-14) |

## Each release day

1. Fill any `[YOU: …]` lines in the post. The build refuses to publish a post that still has one.
2. Set `draft: false` in the post's front matter.
3. Run `pnpm build`, then deploy `out/` per `how-to-deploy`.
4. Open `https://avarile.com/blog/<slug>` and check the page, the share preview and both CTA links (`utm_content=blog-0N`).
5. Publish the video with the description and pinned comment from `ad-copy.md` §2 (change `ep01` to the episode).
6. Post the LinkedIn / X versions, and the Bilibili translation.

## Before 2026-10-20 (launch blockers)

- [ ] `NEXT_PUBLIC_CRM_WEBHOOK_URL` is set in the build env, and a test registration lands in the CRM with UTM fields.
- [ ] Caddy serves the extensionless OG images as `image/png` (check a share preview).
- [ ] Blog 1 personal facts checked (MARKETINGP-5).
- [ ] Explainer and video cuts rendered (MARKETINGP-11).
- [ ] Bilibili copy translated.

## Pinned / evergreen

- Channel trailer and pinned post: `/register?utm_source=<platform>&utm_medium=social&utm_campaign=cyborg-migration&utm_content=pinned`
- Bio line (from the messaging kit): "Turning myself into a cyborg, one system at a time. My memory. Any mind. Closed loops." + avarile.com
