import { MarkdownPage, markdownPageMetadata } from "@/components/markdown-page";
import { getPage } from "@/lib/blog";

export const metadata = markdownPageMetadata("privacy", "en");

export default function PrivacyPage() {
  return <MarkdownPage page={getPage("privacy", "en")} label="privacy" locale="en" />;
}
