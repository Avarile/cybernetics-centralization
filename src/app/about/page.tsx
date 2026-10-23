import { About, aboutMetadata } from "@/components/pages/about";

export const metadata = aboutMetadata("en");

export default function AboutPage() {
  return <About locale="en" />;
}
