import type { Metadata } from "next";
import { MarkdownPage } from "@/components/markdown-page";
import { getPage } from "@/lib/blog";
import { alternates, baseOpenGraph, defaultOgImage } from "@/lib/seo";

const page = getPage("privacy");

export const metadata: Metadata = {
  title: page.title,
  description: page.dek,
  alternates: alternates("/privacy"),
  openGraph: { ...baseOpenGraph, url: "/privacy", title: page.title, description: page.dek, images: [defaultOgImage] },
  ...(page.draft && { robots: { index: false, follow: false } }),
};

export default function PrivacyPage() {
  return <MarkdownPage page={page} label="privacy" />;
}
