import { MarkdownPage, markdownPageMetadata } from "@/components/markdown-page";
import { getPage } from "@/lib/blog";

export const metadata = markdownPageMetadata("security", "zh");

export default function SecurityPage() {
  return <MarkdownPage page={getPage("security", "zh")} label="安全" locale="zh" />;
}
