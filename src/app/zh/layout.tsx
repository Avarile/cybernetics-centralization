import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/content";
import { contentFor } from "@/lib/content-i18n";
import { LocaleProvider } from "@/lib/locale-context";
import { alternates, baseOpenGraph, defaultOgImage } from "@/lib/seo";

const { SITE_TITLE, SITE_DESCRIPTION } = contentFor("zh");

// The Chinese pages (see lib/i18n.ts). Each page still sets its own canonical and share card. The
// `opengraph-image` files don't reach this segment, and their font has no CJK glyphs anyway, so
// Chinese pages reference the English cards.
export const metadata: Metadata = {
  title: { absolute: SITE_TITLE, template: `%s — ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  keywords: ["AI 原生", "第二大脑", "MCP", "模型上下文协议", "个人知识库", "AI 智能体", "项目管理", "CRM", "Claude", "ChatGPT"],
  alternates: alternates("/", "zh"),
  openGraph: { ...baseOpenGraph("zh"), url: "/zh", title: SITE_TITLE, description: SITE_DESCRIPTION, images: [defaultOgImage] },
  twitter: { card: "summary_large_image", title: SITE_TITLE, description: SITE_DESCRIPTION },
};

export default function ZhLayout({ children }: LayoutProps<"/zh">) {
  return <LocaleProvider locale="zh">{children}</LocaleProvider>;
}
