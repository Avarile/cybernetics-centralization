import { MarkdownPage, markdownPageMetadata } from "@/components/markdown-page";
import { getPage } from "@/lib/blog";

export const metadata = markdownPageMetadata("security", "en");

export default function SecurityPage() {
  return <MarkdownPage page={getPage("security", "en")} label="security" locale="en" />;
}
