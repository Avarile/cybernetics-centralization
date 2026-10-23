import { OG_SIZE, ogCard } from "@/lib/og-card";

export const alt = "Cyborg Migration: becoming AI-native, one system at a time";
export const size = OG_SIZE;
export const contentType = "image/png";
// Static export: rendered once at build time.
export const dynamic = "force-static";

export default function Image() {
  return ogCard({ label: "Cyborg Migration", title: "Becoming AI-native, one system at a time.", stage: 3 });
}
