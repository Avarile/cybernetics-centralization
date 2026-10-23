import type { Metadata } from "next";
import { ThemeToggle } from "@/components/chrome/theme-toggle";
import { TuiButton } from "@/components/tui/tui-button";

// Next adds `noindex` itself; drop the canonical and share card inherited from the home page.
export const metadata: Metadata = { title: "Not found", alternates: { canonical: null }, openGraph: null };

/** The static host serves this one page for every missing URL, /zh ones included, so it speaks both languages. */
export default function NotFound() {
  return (
    <main className="mx-auto max-w-[110ch] px-4 py-10 sm:px-6 md:py-16">
      <div className="flex">
        <ThemeToggle className="ml-auto" />
      </div>

      <div aria-hidden className="mt-10 mb-8 flex items-center gap-2 text-xs text-dim">
        <span>
          ──[ <span className="text-red">404</span> ]
        </span>
        <span className="flex-1 border-t border-dashed border-line" />
      </div>
      <div className="term border border-line bg-bg p-5 text-[13px] sm:text-sm">
        <p>
          <span className="text-dim">$</span> cd <span className="text-accent">this-page</span>
        </p>
        <p className="mt-1 text-red">cd: no such file or directory</p>
        <h1 className="glow mt-6 text-2xl font-semibold tracking-tight sm:text-4xl">Page not found.</h1>
        <p className="mt-4 text-dim">The link may be old, or the page may have moved.</p>
        <p lang="zh-CN" className="mt-4 text-dim">
          页面不存在。链接可能已过期，或者页面已经移动。
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <TuiButton href="/" label="← cybernetics" primary />
          <TuiButton href="/blog" label="read the blog" />
          <TuiButton href="/register" label="register for early access" />
          <span lang="zh-CN">
            <TuiButton href="/zh" label="← 中文首页" />
          </span>
        </div>
      </div>
    </main>
  );
}
