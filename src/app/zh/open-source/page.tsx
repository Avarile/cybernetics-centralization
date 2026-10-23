import { MarkdownPage, markdownPageMetadata } from "@/components/markdown-page";
import { getPage } from "@/lib/blog";

export const metadata = markdownPageMetadata("open-source", "zh");

export default function OpenSourcePage() {
  return <MarkdownPage page={getPage("open-source", "zh")} label="开源" locale="zh" />;
}
