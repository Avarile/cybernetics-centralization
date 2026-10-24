import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductPage, productMetadata, productSlugs } from "@/components/pages/product";

// Static export: every module page is prerendered, unknown slugs 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return productSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  return productMetadata((await params).slug, "en");
}

export default async function ModulePage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  if (!productSlugs().includes(slug)) notFound();
  return <ProductPage slug={slug} locale="en" />;
}
