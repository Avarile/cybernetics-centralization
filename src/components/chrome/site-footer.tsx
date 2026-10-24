import Link from "next/link";
import type { ReactNode } from "react";
import { tone } from "@/lib/content";
import type { Locale } from "@/lib/i18n";
import { footerGroups } from "@/lib/nav";

const link = "underline decoration-line underline-offset-4 hover:text-accent";

/** Footer link columns, shared by the home page and the reading pages. `children` go under them. */
export function SiteFooter({
  locale,
  className = "mt-20 border-t border-dashed border-line pt-8",
  children,
}: {
  locale: Locale;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <footer className={`text-[13px] ${className}`}>
      <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
        {footerGroups(locale).map((g) => (
          <div key={g.title} className="min-w-0">
            <p className="text-dim"># {g.title}</p>
            <ul className="mt-2 space-y-1">
              {g.links.map((l) => (
                <li key={l.href} className="truncate">
                  {l.tone && (
                    <>
                      <span style={{ color: tone[l.tone] }}>●</span>{" "}
                    </>
                  )}
                  {l.external ? (
                    <a href={l.href} target="_blank" rel="noopener noreferrer" className={link}>
                      {l.label}
                    </a>
                  ) : (
                    <Link href={l.href} className={link}>
                      {l.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {children}
    </footer>
  );
}
