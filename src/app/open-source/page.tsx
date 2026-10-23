import type { Metadata } from "next";
import { MarkdownPage } from "@/components/markdown-page";
import { getPage } from "@/lib/blog";
import { alternates, baseOpenGraph, defaultOgImage } from "@/lib/seo";

const page = getPage("open-source");

export const metadata: Metadata = {
  title: page.title,
  description: page.dek,
  alternates: alternates("/open-source"),
  openGraph: { ...baseOpenGraph, url: "/open-source", title: page.title, description: page.dek, images: [defaultOgImage] },
  ...(page.draft && { robots: { index: false, follow: false } }),
};

export default function OpenSourcePage() {
  return <MarkdownPage page={page} label="open source" />;
}
