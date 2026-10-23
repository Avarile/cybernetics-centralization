import type { Metadata } from "next";
import { TuiButton } from "@/components/tui/tui-button";
import { alternates, baseOpenGraph, defaultOgImage } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Exocortex",
  description: "A basic idea of the exocortex, shown rather than explained.",
  alternates: alternates("/exocortex"),
  openGraph: {
    ...baseOpenGraph,
    url: "/exocortex",
    title: "Exocortex",
    description: "A basic idea of the exocortex, shown rather than explained.",
    images: [defaultOgImage],
  },
};

export default function ExocortexPage() {
  return (
    <div className="fixed inset-0 bg-bg">
      <div className="fixed top-3 left-3 z-10">
        <TuiButton href="/" label="← cybernetics" />
      </div>
      <iframe
        src="/bundles/exocortex.html"
        title="Exocortex"
        className="h-full w-full border-0"
      />
    </div>
  );
}
