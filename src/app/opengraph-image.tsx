import { OG_SIZE, ogCard } from "@/lib/og-card";

export const alt = "Cybernetics — Cyborgize yourself, agentically";
export const size = OG_SIZE;
export const contentType = "image/png";
// Static export: rendered once at build time.
export const dynamic = "force-static";

export default function Image() {
  return ogCard({ label: "Cybernetics", title: "Cyborgize yourself, agentically.", stage: 3, cta: "Register for early access" });
}
