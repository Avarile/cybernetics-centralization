import { MarkdownPage, markdownPageMetadata } from "@/components/markdown-page";
import { getPage } from "@/lib/blog";

export const metadata = markdownPageMetadata("privacy", "zh");

export default function PrivacyPage() {
  return <MarkdownPage page={getPage("privacy", "zh")} label="隐私" locale="zh" />;
}
