import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocArticle, docMetadata, findDoc } from "@/components/pages/doc";
import { getAllDocs } from "@/lib/docs";

// Static export: every doc is prerendered, unknown paths 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllDocs().map((d) => ({ slug: [d.section, d.slug] }));
}

export async function generateMetadata({ params }: PageProps<"/zh/docs/[...slug]">): Promise<Metadata> {
  return docMetadata(findDoc((await params).slug, "zh"), "zh");
}

export default async function DocPage({ params }: PageProps<"/zh/docs/[...slug]">) {
  const doc = findDoc((await params).slug, "zh");
  if (!doc) notFound();
  return <DocArticle doc={doc} locale="zh" />;
}
