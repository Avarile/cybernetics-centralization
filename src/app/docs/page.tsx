import { DocsHome, docsHomeMetadata } from "@/components/pages/docs-home";

export const metadata = docsHomeMetadata("en");

export default function DocsPage() {
  return <DocsHome locale="en" />;
}
