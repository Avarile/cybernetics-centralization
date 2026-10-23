import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { AUTHOR, BASE_URL, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE } from "@/lib/content";
import { alternates, baseOpenGraph } from "@/lib/seo";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: { default: SITE_TITLE, template: `%s — ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [AUTHOR],
  creator: AUTHOR.name,
  keywords: [
    "AI native",
    "second brain",
    "MCP",
    "Model Context Protocol",
    "personal knowledge base",
    "AI agents",
    "project management",
    "CRM",
    "Claude",
    "ChatGPT",
  ],
  alternates: alternates("/"),
  openGraph: { ...baseOpenGraph, url: "/", title: SITE_TITLE, description: SITE_DESCRIPTION },
  twitter: { card: "summary_large_image", title: SITE_TITLE, description: SITE_DESCRIPTION },
};

// Runs before first paint: the once-per-session startup screen (home page only — other pages never clear it).
const bootScript = `(function(){var d=document.documentElement;try{d.dataset.crt="off";if(location.pathname==="/"&&!sessionStorage.getItem("booted")&&!matchMedia("(prefers-reduced-motion: reduce)").matches){d.dataset.boot="1"}}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={`${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
