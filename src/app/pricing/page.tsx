import { MarkdownPage, markdownPageMetadata } from "@/components/markdown-page";
import { getPage } from "@/lib/blog";

export const metadata = markdownPageMetadata("pricing", "en");

export default function PricingPage() {
  return <MarkdownPage page={getPage("pricing", "en")} label="pricing" locale="en" />;
}
