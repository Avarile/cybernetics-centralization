# Cyborg Migration: Visual Kit (v1, approved)

Work item: MARKETINGP-2. It keeps the blogs, ads and thumbnails in the same visual language as the video series (`docs/presentation-personal/design.md` §4, `youtube/animations/00-shared-spec.md`).

## Files

| What | Where |
|---|---|
| Figure source (one function, used by the site, OG images and exports) | `src/lib/cyborg-figure.ts` |
| Figure SVGs, stages 0/3 to 3/3 | `public/brand/cyborg-figure-{0,1,2,3}of3.svg` |
| Migration bar SVGs | `public/brand/migration-bar-{0,1,2,3}of3.svg` |
| Ad / OG / thumbnail template (renders any hook at any size) | `templates/ad-template.html` |
| Rendered samples | `templates/samples/*.png` |

## Palette

Black, white and greys only. There's no colour in campaign creatives.

| Token | Hex | Use |
|---|---|---|
| white | `#FFFFFF` | Memory (solid shapes), headlines, the CTA block |
| g1 | `#CCCCCC` | Sub lines |
| g2 | `#888888` | Figure outline, labels, URL |
| g3 | `#444444` | Guides, dividers |
| g4 | `#1A1A1A` | Panels on black |
| black | `#000000` | Background (use a flat fill; no gradient, vignette or grain) |

## Visual grammar

- **Memory / my data** = solid white shapes and glowing dots. The core is a solid white circle in the chest.
- **AI models** = outlined, hollow shapes, never filled. The processing ring sits at the head.
- **Flow** = small points of light on thin lines.
- **The loop** = a ring around the figure. It stays open (with a gap at the top) until stage 3, then closes.

## The figure

| Stage | Adds | Use for |
|---|---|---|
| 0/3 | Outline only, an empty dashed core, the loop almost closed | Hooks about the problem ("Cyborg?", "Open loops") |
| 1/3 | Solid memory core | Memory / data first (Blog 2, "Your notes aren't memory") |
| 2/3 | Outlined processing ring at the head | AI agnostic (Blog 3, "Swap the mind") |
| 3/3 | Learning circuit, loop closed | Closed loop, end cards, pillar post, OG default |

The migration bar sits under the figure and shows the same stage.

## Typography

| Where | Font | Why |
|---|---|---|
| Ads, thumbnails, video | **Inter** (800 hook, 600 labels and CTA, 400 sub) | Matches the series spec ("one geometric sans") |
| Blog on the site | **Geist Mono** (the site's font) | Blog pages live inside the existing terminal-style site |

Sizes are set in the template per format. Labels are uppercase, letter-spaced at 0.22em, in g2.

## Formats and safe zones

| Format | Size | Layout | Safe zone |
|---|---|---|---|
| `og` | 1200×630 | Text left, figure right | 64 px padding |
| `sq` | 1080×1080 | Figure top, text bottom | 64–80 px padding |
| `story` | 1080×1920 | Figure top, text bottom | **Bottom 12% clear** for platform captions (`guides=1` shows it) |
| `thumb` | 1280×720 | Presenter photo left 45%, plate right 55% | Hook at most 3 words, ≥150 px, readable at 320×180 |

Every creative ends with the CTA block "Start your 4-week migration" plus `avarile.com`, and has at most ~18 words on canvas.

### Rendering a creative

```bash
cd .development/marketing/cyborg-migration/templates
google-chrome --headless=new --allow-file-access-from-files --hide-scrollbars --virtual-time-budget=4000 \
  --window-size=1080,1080 --screenshot=ad-gap-1080sq.png \
  "file://$PWD/ad-template.html?size=sq&stage=3&hook=The%20gap%20compounds.&sub=AI%20makes%20output%20cheap."
```

Name each file `ad-<hook>-<format>` so it matches `utm_content` in the messaging kit.

## Blog article layout (implemented in MARKETINGP-3)

The blog uses the site's shell, theme tokens and font, so it reads as part of avarile.com:

- **Header:** the label "CYBORG MIGRATION · #N", the title (h1, the site's `glow` style), a one-line dek, date and reading time, then the figure at the post's stage beside the title on wide screens.
- **Body:** a measure of about 68 characters; h2 as `## heading` in the site's TUI style; quotes as a left-ruled block; tables for before/after.
- **Inline CTA block** (after the "why it matters" section): a bordered terminal panel with one line plus a `[ start your 4-week migration ]` button.
- **End-of-post signup card:** the figure at 3/3, the core line, the CTA button linking to `/register?utm_source=blog&utm_medium=blog&utm_campaign=cyborg-migration&utm_content=<slug>`.
- **OG image:** generated at build time per post from the same figure and copy (`opengraph-image.tsx`).

## Guards

- Diagrams show structure only. Never show values from `data-centre`, amounts, payees, contacts or credentials.
- No logos, product names, robots, stock people or invented numbers on any visual.

## Decisions (approved by avarile, 2026-10-14)

1. The figure proportions stay as drafted.
2. Inter for creatives and video; Geist Mono for the blog on the site.
3. Thumbnails use the standard 3 px stroke.
4. Video end cards: `size=end` (1080×1920) and `size=endwide` (1920×1080) in the template.
