"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { HTML_LANG, type Locale } from "./i18n";

const LocaleContext = createContext<Locale>("en");

/** The page's language for client components; server components take a `locale` prop instead. */
export function useLocale() {
  return useContext(LocaleContext);
}

/**
 * Wraps the `/zh` pages. The root layout renders `<html lang="en">` for every page and its
 * head script corrects it before first paint; this keeps it right across client-side
 * navigation into and out of the Chinese pages.
 */
export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  useEffect(() => {
    const html = document.documentElement;
    html.lang = HTML_LANG[locale];
    return () => {
      html.lang = HTML_LANG.en;
    };
  }, [locale]);
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}
