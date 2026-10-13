import { getAllPosts, getPost } from "@/lib/blog";
import { OG_SIZE, ogCard } from "@/lib/og-card";

export const alt = "Cyborg Migration";
export const size = OG_SIZE;
export const contentType = "image/png";
// Static export: rendered once at build time.
export const dynamic = "force-static";

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug);
  return ogCard({ label: post?.series || "Cyborg Migration", title: post?.title ?? "", stage: post?.stage ?? 3 });
}
