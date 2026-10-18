import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { BASE_URL } from "@/lib/content";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Cybernetics — Cyborgize yourself, agentically",
  description:
    "Cybernetics turns what you know and what you do into structured data you own — ready for any AI agent over MCP.",
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
