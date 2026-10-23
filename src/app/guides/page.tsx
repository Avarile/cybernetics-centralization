import { GuidesHome, guidesHomeMetadata } from "@/components/pages/guides-home";

export const metadata = guidesHomeMetadata("en");

export default function GuidesPage() {
  return <GuidesHome locale="en" />;
}
