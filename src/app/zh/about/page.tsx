import { About, aboutMetadata } from "@/components/pages/about";

export const metadata = aboutMetadata("zh");

export default function AboutPage() {
  return <About locale="zh" />;
}
