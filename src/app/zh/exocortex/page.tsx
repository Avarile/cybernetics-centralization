import { Exocortex, exocortexMetadata } from "@/components/pages/exocortex";

export const metadata = exocortexMetadata("zh");

export default function ExocortexPage() {
  return <Exocortex locale="zh" />;
}
