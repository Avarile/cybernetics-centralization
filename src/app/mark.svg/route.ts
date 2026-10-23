import { cyborgMarkSvg } from "@/lib/cyborg-figure";

// Static export: written to out/mark.svg at build time. The browser-tab icon.
export const dynamic = "force-static";

export function GET() {
  return new Response(cyborgMarkSvg(), { headers: { "Content-Type": "image/svg+xml" } });
}
