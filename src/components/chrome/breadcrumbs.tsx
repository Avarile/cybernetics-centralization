import Link from "next/link";
import { localePath, type Locale } from "@/lib/i18n";
import { absolute, JsonLd } from "@/lib/seo";

/**
 * `cybernetics / product / data base`, mirroring the URL, with its BreadcrumbList for
 * search engines. The last item is the current page and isn't a link.
 */
export function Breadcrumbs({ items, locale }: { items: { name: string; href: string }[]; locale: Locale }) {
  const trail = [{ name: "cybernetics", href: localePath(locale, "/") }, ...items];
  return (
    <>
      <JsonLd
        data={{
          "@type": "BreadcrumbList",
          itemListElement: trail.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: absolute(c.href) })),
        }}
      />
      <nav aria-label={locale === "zh" ? "面包屑" : "Breadcrumb"} className="mb-6 text-xs text-dim">
        <ol className="flex flex-wrap gap-x-2">
          {trail.map((c, i) => (
            <li key={c.href} className="flex gap-x-2">
              {i > 0 && <span aria-hidden>/</span>}
              {i < trail.length - 1 ? (
                <Link href={c.href} className="hover:text-fg">
                  {c.name}
                </Link>
              ) : (
                <span aria-current="page" className="text-fg">
                  {c.name}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
