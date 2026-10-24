import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IntegrationPage, integrationMetadata } from "@/components/pages/integrations";
import { integrationSlugs } from "@/lib/nav";

// Static export: every integration page is prerendered, unknown slugs 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return integrationSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/integrations/[slug]">): Promise<Metadata> {
  return integrationMetadata((await params).slug, "en");
}

export default async function IntegrationRoute({ params }: PageProps<"/integrations/[slug]">) {
  const { slug } = await params;
  if (!integrationSlugs.includes(slug)) notFound();
  return <IntegrationPage slug={slug} locale="en" />;
}
