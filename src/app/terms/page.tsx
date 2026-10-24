import { MarkdownPage, markdownPageMetadata } from "@/components/markdown-page";
import { getPage } from "@/lib/blog";

export const metadata = markdownPageMetadata("terms", "en");

export default function TermsPage() {
  return <MarkdownPage page={getPage("terms", "en")} label="terms" locale="en" />;
}
