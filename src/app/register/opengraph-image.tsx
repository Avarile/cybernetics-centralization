import { OG_SIZE, ogCard } from "@/lib/og-card";

export const alt = "Start your 4-week Cyborg Migration";
export const size = OG_SIZE;
export const contentType = "image/png";
// Static export: rendered once at build time.
export const dynamic = "force-static";

export default function Image() {
  return ogCard({ label: "Cyborg Migration", title: "My memory. Any mind. Closed loops.", stage: 3 });
}
