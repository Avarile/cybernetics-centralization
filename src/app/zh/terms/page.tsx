import { MarkdownPage, markdownPageMetadata } from "@/components/markdown-page";
import { getPage } from "@/lib/blog";

export const metadata = markdownPageMetadata("terms", "zh");

export default function TermsPage() {
  return <MarkdownPage page={getPage("terms", "zh")} label="服务条款" locale="zh" />;
}
