import { DocsHome, docsHomeMetadata } from "@/components/pages/docs-home";

export const metadata = docsHomeMetadata("zh");

export default function DocsPage() {
  return <DocsHome locale="zh" />;
}
