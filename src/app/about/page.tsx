import type { Metadata } from "next";
import { MarkdownPage } from "@/components/markdown-page";
import { TuiButton } from "@/components/tui/tui-button";
import { getPage } from "@/lib/blog";
import { AUTHOR } from "@/lib/content";
import { absolute, alternates, baseOpenGraph, defaultOgImage, JsonLd, organization } from "@/lib/seo";

const page = getPage("about");

export const metadata: Metadata = {
  title: page.title,
  description: page.dek,
  alternates: alternates("/about"),
  openGraph: { ...baseOpenGraph, type: "profile", url: "/about", title: page.title, description: page.dek, images: [defaultOgImage] },
  ...(page.draft && { robots: { index: false, follow: false } }),
};

export default function AboutPage() {
  return (
    <>
      {!page.draft && (
        <JsonLd
          data={{
            "@type": "ProfilePage",
            url: absolute("/about"),
            mainEntity: {
              "@type": "Person",
              name: AUTHOR.name,
              url: AUTHOR.url,
              sameAs: ["https://github.com/Avarile"],
              worksFor: organization,
            },
          }}
        />
      )}
      <MarkdownPage page={page} label="about">
        <div className="mt-12 flex flex-wrap gap-3">
          <TuiButton href="/register" label="Register for early access" primary />
          <TuiButton href="/blog" label="Read the build log" />
        </div>
      </MarkdownPage>
    </>
  );
}
