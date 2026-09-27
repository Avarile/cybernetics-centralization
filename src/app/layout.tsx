import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cybernetics — Cyborgize yourself, agentically",
  description:
    "Cybernetics turns what you know and what you do into structured data you own — ready for any AI agent over MCP.",
};

// Runs before first paint: theme (phosphor unless the visitor chose paper), CRT preference,
// and the once-per-session startup screen.
const bootScript = `(function(){var d=document.documentElement;try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"){t="dark"}d.dataset.theme=t;var c=localStorage.getItem("crt");if(c==="off"||(c===null&&matchMedia("(prefers-reduced-motion: reduce)").matches)){d.dataset.crt="off"}if(!sessionStorage.getItem("booted")&&!matchMedia("(prefers-reduced-motion: reduce)").matches){d.dataset.boot="1"}}catch(e){d.dataset.theme="dark"}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="dark"
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
