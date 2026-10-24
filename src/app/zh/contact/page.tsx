import { MarkdownPage, markdownPageMetadata } from "@/components/markdown-page";
import { getPage } from "@/lib/blog";

export const metadata = markdownPageMetadata("contact", "zh");

export default function ContactPage() {
  return <MarkdownPage page={getPage("contact", "zh")} label="联系" locale="zh" />;
}
