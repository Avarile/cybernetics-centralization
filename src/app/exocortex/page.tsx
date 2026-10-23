import { Exocortex, exocortexMetadata } from "@/components/pages/exocortex";

export const metadata = exocortexMetadata("en");

export default function ExocortexPage() {
  return <Exocortex locale="en" />;
}
