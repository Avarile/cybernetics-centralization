import { MarkdownPage, markdownPageMetadata } from "@/components/markdown-page";
import { getPage } from "@/lib/blog";

export const metadata = markdownPageMetadata("contact", "en");

export default function ContactPage() {
  return <MarkdownPage page={getPage("contact", "en")} label="contact" locale="en" />;
}
