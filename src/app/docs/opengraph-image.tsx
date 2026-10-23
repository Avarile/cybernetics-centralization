import { OG_SIZE, ogCard } from "@/lib/og-card";

export const alt = "Cybernetics docs";
export const size = OG_SIZE;
export const contentType = "image/png";
// Static export: rendered once at build time.
export const dynamic = "force-static";

export default function Image() {
  return ogCard({ label: "Cybernetics docs", title: "Connect your AI. Host your stack.", stage: 2, cta: "Read the docs" });
}
