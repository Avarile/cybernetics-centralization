import { MarkdownPage, markdownPageMetadata } from "@/components/markdown-page";
import { getPage } from "@/lib/blog";

export const metadata = markdownPageMetadata("open-source", "en");

export default function OpenSourcePage() {
  return <MarkdownPage page={getPage("open-source", "en")} label="open source" locale="en" />;
}
