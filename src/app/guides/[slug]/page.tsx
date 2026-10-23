import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GuideArticle, guideMetadata } from "@/components/pages/guide";
import { getAllGuides, getGuide } from "@/lib/docs";

// Static export: every guide is prerendered, unknown slugs 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllGuides().map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: PageProps<"/guides/[slug]">): Promise<Metadata> {
  return guideMetadata((await params).slug, "en");
}

export default async function GuidePage({ params }: PageProps<"/guides/[slug]">) {
  const guide = getGuide((await params).slug, "en");
  if (!guide) notFound();
  return <GuideArticle guide={guide} locale="en" />;
}
