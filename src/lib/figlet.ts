import figlet from "figlet";
import ansiShadow from "figlet/importable-fonts/ANSI Shadow.js";
import calvinS from "figlet/importable-fonts/Calvin S.js";
import small from "figlet/importable-fonts/Small.js";

// Importable fonts avoid reading font files from disk, so this works in any server bundle.
figlet.parseFont("ANSI Shadow", ansiShadow);
figlet.parseFont("Calvin S", calvinS);
figlet.parseFont("Small", small);

export type FigletFont = "ANSI Shadow" | "Calvin S" | "Small";

/** Renders ASCII-art text at build time (server only), trimmed of blank lines and trailing spaces. */
export function figletText(text: string, font: FigletFont): string {
  return figlet
    .textSync(text, { font })
    .split("\n")
    .map((l) => l.trimEnd())
    .filter((l) => l.length > 0)
    .join("\n");
}
