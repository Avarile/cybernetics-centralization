import { GuidesHome, guidesHomeMetadata } from "@/components/pages/guides-home";

export const metadata = guidesHomeMetadata("zh");

export default function GuidesPage() {
  return <GuidesHome locale="zh" />;
}
