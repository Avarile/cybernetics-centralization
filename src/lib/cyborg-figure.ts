/**
 * The Cyborg Migration figure as an SVG string — the single source for the site, OG images and the
 * exported brand files. No imports, so Node can run it directly when exporting `public/brand/`.
 *
 * Stage 0: outline only, loop almost closed. 1: + memory core. 2: + processing ring. 3: + learning
 * circuit, loop closed. Grammar: memory is solid, AI is outlined, the loop is a ring.
 */
export type FigureStage = 0 | 1 | 2 | 3;

export type FigureColors = { outline: string; solid: string };

export const BW: FigureColors = { outline: "#888888", solid: "#FFFFFF" };

export function cyborgFigureSvg(stage: FigureStage, { outline, solid }: FigureColors = BW, size = 400): string {
  const loop =
    stage === 3
      ? `<circle cx="200" cy="200" r="182" fill="none" stroke="${solid}" stroke-width="2.5" opacity="0.9"/>`
      : // Gap of ~6% of the circumference at the top right: the loop that hasn't closed yet.
        `<circle cx="200" cy="200" r="182" fill="none" stroke="${outline}" stroke-width="2" stroke-dasharray="1076 68" transform="rotate(-80 200 200)" stroke-linecap="round"/>`;

  const core =
    stage >= 1
      ? `<circle cx="200" cy="268" r="34" fill="${solid}" opacity="0.14"/><circle cx="200" cy="268" r="20" fill="${solid}"/>`
      : `<circle cx="200" cy="268" r="20" fill="none" stroke="${outline}" stroke-width="2" stroke-dasharray="4 6" opacity="0.7"/>`;

  const ring =
    stage >= 2 ? `<circle cx="200" cy="112" r="68" fill="none" stroke="${solid}" stroke-width="2.5"/>` : "";

  const circuit =
    stage >= 3
      ? `<path d="M138 132C108 196 132 258 180 268M262 132C292 196 268 258 220 268" fill="none" stroke="${solid}" stroke-width="2" stroke-linecap="round"/>` +
        `<circle cx="123" cy="200" r="4" fill="${solid}"/><circle cx="277" cy="200" r="4" fill="${solid}"/>`
      : "";

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="${size}" height="${size}">` +
    loop +
    `<g fill="none" stroke="${outline}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">` +
    `<circle cx="200" cy="112" r="50"/>` +
    `<path d="M184 161L182 190C128 198 78 222 70 292L68 336M216 161L218 190C272 198 322 222 330 292L332 336M68 336H332"/>` +
    `</g>` +
    core +
    ring +
    circuit +
    `</svg>`
  );
}

/** Three-segment MIGRATION bar, `stage` segments filled. */
export function migrationBarSvg(stage: FigureStage, { outline, solid }: FigureColors = BW, width = 240): string {
  const seg = (i: number) =>
    `<rect x="${i * 82}" y="0" width="74" height="8" rx="1" fill="${i < stage ? solid : "none"}" stroke="${i < stage ? solid : outline}" stroke-width="1.5"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-1 -1 242 10" width="${width}" height="${(width * 10) / 242}">${seg(0)}${seg(1)}${seg(2)}</svg>`;
}

export const svgDataUri = (svg: string) => `data:image/svg+xml;base64,${btoa(svg)}`;
