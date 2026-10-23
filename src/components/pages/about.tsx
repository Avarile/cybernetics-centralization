import { MarkdownPage, markdownPageMetadata } from "@/components/markdown-page";
import { TuiButton } from "@/components/tui/tui-button";
import { getPage } from "@/lib/blog";
import { AUTHOR } from "@/lib/content";
import { localePath, type Locale } from "@/lib/i18n";
import { absolute, JsonLd, organization } from "@/lib/seo";

export const aboutMetadata = (locale: Locale) => markdownPageMetadata("about", locale, { type: "profile" });

export function About({ locale }: { locale: Locale }) {
  const page = getPage("about", locale);
  const zh = locale === "zh";
  return (
    <>
      {!page.draft && (
        <JsonLd
          data={{
            "@type": "ProfilePage",
            url: absolute(localePath(locale, "/about")),
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
      <MarkdownPage page={page} label={zh ? "关于" : "about"} locale={locale}>
        <div className="mt-12 flex flex-wrap gap-3">
          <TuiButton href={localePath(locale, "/register")} label={zh ? "注册抢先体验" : "Register for early access"} primary />
          <TuiButton href={localePath(locale, "/blog")} label={zh ? "阅读建造日志" : "Read the build log"} />
        </div>
      </MarkdownPage>
    </>
  );
}
