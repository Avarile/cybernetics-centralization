import { MarkdownPage, markdownPageMetadata } from "@/components/markdown-page";
import { getPage } from "@/lib/blog";

export const metadata = markdownPageMetadata("pricing", "zh");

export default function PricingPage() {
  return <MarkdownPage page={getPage("pricing", "zh")} label="价格" locale="zh" />;
}
